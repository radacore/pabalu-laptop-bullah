<?php

namespace App\Http\Controllers;

use App\Models\FinancialTransaction;
use App\Models\PaymentMethod;
use App\Models\Service;
use App\Models\ServicePart;
use App\Models\Sparepart;
use App\Models\TransactionCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ServicePartController extends Controller
{
    /**
     * Store a spare part used by the selected service.
     */
    public function store(Request $request, Service $service): RedirectResponse
    {
        $validated = $request->validate([
            'part_name' => ['required', 'string', 'max:255'],
            'sparepart_type_id' => ['nullable', 'exists:sparepart_types,id'],
            'sparepart_id' => ['nullable', 'exists:spareparts,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'installation_fee' => ['nullable', 'numeric', 'min:0'],
            'note' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($service, $validated): void {
            $sparepartId = $validated['sparepart_id'] ?? null;

            if ($sparepartId) {
                $sparepart = Sparepart::query()->lockForUpdate()->findOrFail($sparepartId);

                if (! $sparepart->is_active) {
                    throw ValidationException::withMessages([
                        'sparepart_id' => 'Sparepart tidak aktif dan tidak bisa dipakai.',
                    ]);
                }

                if ($sparepart->stock < (int) $validated['quantity']) {
                    throw ValidationException::withMessages([
                        'quantity' => 'Stok sparepart tidak mencukupi (sisa '.$sparepart->stock.').',
                    ]);
                }

                $sparepart->decrement('stock', (int) $validated['quantity']);
            }

            $part = $service->parts()->create([
                'part_name' => $validated['part_name'],
                'sparepart_type_id' => $validated['sparepart_type_id'] ?? null,
                'sparepart_id' => $sparepartId,
                'quantity' => $validated['quantity'],
                'cost_price' => $validated['cost_price'] ?? 0,
                'selling_price' => $validated['unit_price'],
                'installation_fee' => $validated['installation_fee'] ?? 0,
                'note' => $validated['note'] ?? null,
            ]);

            $costPrice = (float) ($validated['cost_price'] ?? 0);
            $quantity = (int) ($validated['quantity'] ?? 1);

            // Part terhubung stok tidak dibuatkan expense: modalnya sudah
            // tercatat saat pembelian stok (anti double-expense).
            if ($costPrice > 0 && ! $sparepartId) {
                // Kategori expense pembelian sparepart — slug 'pembelian-sparepart'.
                // (Slug 'sparepart' hanya ada sebagai income di seeder, jadi
                // query expense di sini dulu selalu skip diam-diam.)
                $sparepartCategory = TransactionCategory::query()
                    ->where('slug', 'pembelian-sparepart')
                    ->where('type', 'expense')
                    ->first();

                if ($sparepartCategory) {
                    // Morph ke ServicePart (bukan Service) — supaya expense
                    // otomatis ter-cleanup ketika part dihapus (lihat destroy()).
                    // updateOrCreate agar koreksi biaya ikut tersinkron.
                    FinancialTransaction::updateOrCreate(
                        ['transaction_code' => 'EXP-'.$service->service_code.'-'.$part->id],
                        [
                            'type' => 'expense',
                            'transaction_category_id' => $sparepartCategory->id,
                            'amount' => $costPrice * $quantity,
                            'payment_method_id' => $this->defaultPaymentMethodId(),
                            'transaction_date' => now()->toDateString(),
                            'description' => 'Pembelian '.$validated['part_name'].' untuk '.$service->service_code,
                            'related_type' => $part->getMorphClass(),
                            'related_id' => $part->id,
                            'created_by' => Auth::id(),
                        ],
                    );
                }
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sparepart berhasil ditambahkan.']);

        return back();
    }

    /**
     * Delete a spare part from the selected service.
     *
     * Expense pembelian morph ke part ini dibersihkan pakai forceDelete
     * (bukan soft-delete) agar transaction_code bisa dipakai ulang bila
     * part dengan nama sama ditambahkan lagi ke servis yang sama.
     */
    public function destroy(Service $service, ServicePart $part): RedirectResponse
    {
        abort_unless($part->service_id === $service->id, 404);

        DB::transaction(function () use ($part): void {
            // Kembalikan stok bila part berasal dari inventori.
            if ($part->sparepart_id) {
                $sparepart = Sparepart::query()->lockForUpdate()->find($part->sparepart_id);

                if ($sparepart) {
                    $sparepart->increment('stock', (int) $part->quantity);
                }
            }

            // Hapus FinancialTransaction terkait (morph ke ServicePart) supaya
            // tidak jadi orphan record di laporan keuangan.
            FinancialTransaction::query()
                ->where('related_type', $part->getMorphClass())
                ->where('related_id', $part->id)
                ->forceDelete();

            $part->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sparepart berhasil dihapus.']);

        return back();
    }

    /**
     * Ambil ID payment method default. Menghindari hardcode `1` yang bisa
     * gagal FK constraint kalau admin menghapus/mengubah payment method.
     */
    private function defaultPaymentMethodId(): ?int
    {
        return PaymentMethod::defaultId();
    }
}
