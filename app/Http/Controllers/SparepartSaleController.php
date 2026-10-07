<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSparepartSaleRequest;
use App\Models\FinancialTransaction;
use App\Models\PaymentMethod;
use App\Models\Sparepart;
use App\Models\SparepartSale;
use App\Models\TransactionCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SparepartSaleController extends Controller
{
    /**
     * Display a paginated sparepart sale listing.
     */
    public function index(Request $request): Response
    {
        $sales = SparepartSale::query()
            ->with(['sparepart', 'customer', 'paymentMethod', 'creator'])
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query->where('sale_code', 'like', "%{$search}%")
                        ->orWhereHas('sparepart', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('customer', fn ($q) => $q->where('name', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('sparepart-sales/index', [
            'sales' => $sales,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created sparepart sale (decrements stock + income journal).
     */
    public function store(StoreSparepartSaleRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data): void {
            $sparepart = Sparepart::query()->lockForUpdate()->findOrFail($data['sparepart_id']);

            if (! $sparepart->is_active) {
                throw ValidationException::withMessages([
                    'sparepart_id' => 'Sparepart tidak aktif dan tidak bisa dijual.',
                ]);
            }

            if ($sparepart->stock < $data['quantity']) {
                throw ValidationException::withMessages([
                    'quantity' => 'Stok tidak mencukupi (sisa '.$sparepart->stock.').',
                ]);
            }

            $unitPrice = (float) $sparepart->selling_price;

            $sale = SparepartSale::query()->create([
                'sale_code' => $this->generateSaleCode(),
                'customer_id' => $data['customer_id'] ?? null,
                'sparepart_id' => $sparepart->id,
                'quantity' => $data['quantity'],
                'unit_price' => $unitPrice,
                // Kunci modal saat transaksi untuk laba kotor yang akurat.
                'unit_cost' => $sparepart->cost_price,
                'total_amount' => $unitPrice * (int) $data['quantity'],
                'payment_method_id' => $data['payment_method_id'] ?? PaymentMethod::defaultId(),
                'sold_at' => $data['sold_at'] ?? now(),
                'note' => $data['note'] ?? null,
                'created_by' => Auth::id(),
            ]);

            $sparepart->decrement('stock', (int) $data['quantity']);

            $this->autoCreateSaleIncome($sale->fresh());
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Penjualan sparepart berhasil dicatat.']);

        return back();
    }

    /**
     * Delete the selected sparepart sale (restores stock + cleanup journal).
     *
     * Jurnal income morph ikut dihapus pakai forceDelete (bukan soft-delete)
     * agar transaction_code bisa dipakai ulang bila penjualan yang sama
     * dicatat ulang — konsisten dengan modul rental/servis.
     */
    public function destroy(SparepartSale $sale): RedirectResponse
    {
        DB::transaction(function () use ($sale): void {
            $sparepart = Sparepart::query()->lockForUpdate()->find($sale->sparepart_id);

            if ($sparepart) {
                $sparepart->increment('stock', (int) $sale->quantity);
            }

            FinancialTransaction::query()
                ->where('related_type', $sale->getMorphClass())
                ->where('related_id', $sale->id)
                ->forceDelete();

            $sale->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Penjualan sparepart berhasil dihapus, stok dikembalikan.']);

        return back();
    }

    /**
     * Auto-create income transaction for a sparepart sale.
     */
    private function autoCreateSaleIncome(SparepartSale $sale): void
    {
        $amount = (float) ($sale->total_amount ?? 0);

        if ($amount <= 0) {
            return;
        }

        $category = TransactionCategory::query()
            ->where('slug', 'penjualan-sparepart')
            ->where('type', 'income')
            ->first();

        if (! $category) {
            return;
        }

        FinancialTransaction::updateOrCreate(
            ['transaction_code' => 'INC-'.$sale->sale_code],
            [
                'type' => 'income',
                'transaction_category_id' => $category->id,
                'amount' => $amount,
                'payment_method_id' => $sale->payment_method_id ?? PaymentMethod::defaultId(),
                'transaction_date' => now()->toDateString(),
                'description' => 'Penjualan sparepart '.$sale->sale_code,
                'related_type' => $sale->getMorphClass(),
                'related_id' => $sale->id,
                'created_by' => Auth::id(),
            ],
        );
    }

    /**
     * Generate a unique sparepart sale code with retry logic.
     */
    private function generateSaleCode(): string
    {
        $maxAttempts = 10;

        for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
            $code = 'SPS-'.now()->format('Ymd').'-'.random_int(100000, 999999);

            if (! SparepartSale::query()->where('sale_code', $code)->exists()) {
                return $code;
            }
        }

        throw new \RuntimeException('Unable to generate unique sparepart sale code after multiple attempts.');
    }
}
