<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Http\Resources\PublicServiceTrackingResource;
use App\Models\Customer;
use App\Models\FinancialTransaction;
use App\Models\PaymentMethod;
use App\Models\Service;
use App\Models\ServicePart;
use App\Models\ServiceStatus;
use App\Models\Sparepart;
use App\Models\SparepartType;
use App\Models\TransactionCategory;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    /**
     * Display a paginated service listing.
     *
     * Staff hanya melihat servis yang di-assign ke dia atau yang dia buat
     * (konsisten dengan ServicePolicy::view). Admin melihat semua.
     */
    public function index(Request $request): Response
    {
        $services = Service::query()
            ->with(['customer', 'status', 'technician'])
            ->when($request->user()?->role !== 'admin', function ($query) use ($request) {
                $query->where(function ($query) use ($request) {
                    $query->where('technician_id', $request->user()?->id)
                        ->orWhere('created_by', $request->user()?->id);
                });
            })
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query->where('service_code', 'like', "%{$search}%")
                        ->orWhere('device_name', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn ($query) => $query->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->filled('service_status_id'), fn ($query) => $query->where('service_status_id', $request->integer('service_status_id')))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('services/index', [
            'services' => $services,
            'filters' => $request->only(['search', 'service_status_id']),
            'statuses' => ServiceStatus::query()->orderBy('sort_order')->orderBy('name')->get(),
            'technicians' => User::query()->where('role', 'staff')->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Show the service creation page.
     */
    public function create(): Response
    {
        return Inertia::render('services/create', $this->formOptions());
    }

    /**
     * Store a newly created service.
     */
    public function store(StoreServiceRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $parts = $data['parts'] ?? [];
        unset($data['parts']);

        $data['service_code'] = $this->generateServiceCode();
        $data['tracking_code'] = bin2hex(random_bytes(8));
        $data['received_at'] = $data['received_at'] ?? now();
        $data['created_by'] = Auth::id();

        DB::transaction(function () use ($data, $parts): void {
            // Mode 'new': buat pelanggan sekalian dalam transaksi yang
            // sama — servis gagal validasi/simpan = pelanggan ikut batal.
            if (($data['customer_mode'] ?? 'existing') === 'new') {
                $customer = Customer::query()->create([
                    'name' => $data['customer_name'],
                    'phone' => $data['customer_phone'],
                ]);
                $data['customer_id'] = $customer->id;
            }

            unset(
                $data['customer_mode'],
                $data['customer_name'],
                $data['customer_phone'],
            );

            $service = Service::query()->create($data);

            $service->updates()->create([
                'old_status' => null,
                'new_status' => $service->status?->name ?? 'Diterima',
                'note' => 'Servis diterima.',
                'created_by' => Auth::id(),
                'created_at' => now(),
            ]);

            $this->syncParts($service, $parts);

            if (empty($data['estimated_cost']) && $parts !== []) {
                $service->update(['estimated_cost' => $this->sumPartTotal($parts)]);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Servis berhasil dibuat.']);

        return to_route('services.index');
    }

    /**
     * Display the selected service.
     */
    public function show(Service $service): Response
    {
        return Inertia::render('services/show', [
            'service' => $service->load([
                'customer',
                'status',
                'technician',
                'updates' => fn ($query) => $query->with('creator')->latest('created_at'),
                'parts.type',
                'financialTransactions.category',
            ]),
            ...$this->formOptions(),
        ]);
    }

    /**
     * Public tracking page by tracking_code (no auth required).
     */
    /**
     * Public tracking landing page (no code entered yet).
     */
    public function trackLanding(): Response
    {
        return Inertia::render('services/tracking');
    }

    /**
     * Public tracking endpoint — HANYA menerima tracking_code random.
     *
     * Jangan tambahkan fallback ke service_code yang predictable (SRV-YYYYMMDD-####)
     * karena membuka enumeration attack. Data yang dikembalikan wajib difilter
     * lewat PublicServiceTrackingResource untuk mencegah kebocoran PII customer,
     * harga cost, note internal, dan identitas teknisi.
     */
    public function track(string $trackingCode): Response
    {
        $service = Service::query()
            ->where('tracking_code', $trackingCode)
            ->with([
                'status',
                'updates' => fn ($query) => $query->latest('created_at'),
                'parts',
            ])
            ->first();

        if (! $service) {
            return Inertia::render('services/tracking', [
                'error' => 'Tiket servis dengan kode tersebut tidak ditemukan. Periksa kembali ID Anda.',
                'tracking_code' => $trackingCode,
            ]);
        }

        return Inertia::render('services/tracking', [
            'service' => (new PublicServiceTrackingResource($service))->resolve(),
            'tracking_code' => $trackingCode,
        ]);
    }

    /**
     * Show the service edit page.
     */
    public function edit(Service $service): Response
    {
        return Inertia::render('services/edit', [
            'service' => $service->load(['customer', 'status', 'technician', 'parts.type']),
            ...$this->formOptions(),
        ]);
    }

    /**
     * Update the selected service.
     */
    public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
    {
        $oldStatus = $service->status?->name;
        $oldStatusId = $service->service_status_id;

        $data = $request->validated();
        $parts = $data['parts'] ?? [];
        unset($data['parts'], $data['sparepartsSignature']);

        $expectedSignature = $request->input('sparepartsSignature');

        DB::transaction(function () use ($data, $parts, $service, $oldStatus, $oldStatusId, $expectedSignature): void {
            if (is_string($expectedSignature) && $expectedSignature !== '') {
                $service->refresh();

                $currentSignature = $service->parts()
                    ->orderBy('id')
                    ->get(['id', 'sparepart_id', 'quantity'])
                    ->map(fn ($part) => "{$part->id}:".($part->sparepart_id ?? '').":{$part->quantity}")
                    ->sort()
                    ->values()
                    ->implode('|');

                if (! hash_equals($expectedSignature, $currentSignature)) {
                    throw ValidationException::withMessages([
                        'parts' => 'Data sparepart berubah saat Anda mengedit. Muat ulang halaman lalu coba lagi.',
                    ]);
                }
            }

            $service->update($data);
            $service->load('status');

            $this->syncParts($service, $parts);

            if ($oldStatusId !== $service->service_status_id) {
                $service->updates()->create([
                    'old_status' => $oldStatus,
                    'new_status' => $service->status?->name ?? 'Tidak Diketahui',
                    'note' => 'Status berhasil diperbarui.',
                    'created_by' => Auth::id(),
                    'created_at' => now(),
                ]);
            }

            $this->autoCreateServiceIncome($service);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Servis berhasil diperbarui.']);

        return to_route('services.index');
    }

    /**
     * Delete the selected service.
     *
     * Stok inventori dari semua part dikembalikan + seluruh jurnal morph
     * (income servis + expense part) dibersihkan pakai forceDelete agar
     * tidak ada baris yatim di laporan dan kode transaksi bisa dipakai
     * ulang. DITOLAK bila servis sudah selesai/diambil — riwayat yang
     * sudah dibukukan harus dipertahankan untuk audit.
     */
    public function destroy(Service $service): RedirectResponse
    {
        $service->loadMissing('status');

        if ($service->status && in_array($service->status->slug, ['selesai', 'siap-diambil', 'sudah-diambil'], true)) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Servis yang sudah selesai/diambil tidak bisa dihapus demi audit. Batalkan dari status bila memang salah input.']);

            return back()->withErrors([
                'service' => 'Servis yang sudah selesai/diambil tidak bisa dihapus demi audit. Batalkan dari status bila memang salah input.',
            ]);
        }

        DB::transaction(function () use ($service): void {
            $service->loadMissing('parts');

            foreach ($service->parts as $part) {
                $this->restoreSparepartStock($part->sparepart_id, (int) $part->quantity);
            }

            FinancialTransaction::query()
                ->where('related_type', $service->getMorphClass())
                ->where('related_id', $service->id)
                ->forceDelete();

            FinancialTransaction::query()
                ->where('related_type', (new ServicePart)->getMorphClass())
                ->whereIn('related_id', $service->parts->pluck('id')->all())
                ->forceDelete();

            $service->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Servis berhasil dihapus, stok dikembalikan.']);

        return to_route('services.index');
    }

    /**
     * Get shared service form options.
     *
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'customers' => Customer::query()->orderBy('name')->get(['id', 'name', 'phone']),
            'statuses' => ServiceStatus::query()->orderBy('sort_order')->orderBy('name')->get(),
            'technicians' => User::query()->where('role', 'staff')->orderBy('name')->get(['id', 'name']),
            'sparepart_types' => SparepartType::query()->orderBy('sort_order')->orderBy('name')->get(),
            // Inventori aktif untuk dropdown "pakai stok" di form part.
            // Hanya id/nama/stok/harga — tanpa cost_price (modal internal).
            'spareparts' => Sparepart::query()
                ->where('is_active', true)
                ->where('stock', '>', 0)
                ->orderBy('name')
                ->get(['id', 'name', 'stock', 'selling_price']),
        ];
    }

    /**
     * Auto-create income transaction when service reaches completion status.
     *
     * Mendelegasikan ke Service::syncIncomeJournal() agar satu definisi
     * dipakai kedua jalur selesai (form edit + timeline update).
     */
    private function autoCreateServiceIncome(Service $service): void
    {
        $service->syncIncomeJournal(
            $service->status?->slug,
            in_array($service->status?->slug, Service::completionSlugs(), true),
        );
    }

    /**
     * Generate a unique service code with retry logic.
     * Uses database unique constraint to prevent race conditions.
     */
    private function generateServiceCode(): string
    {
        $maxAttempts = 10;

        for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
            // Increase entropy: use 6 digits instead of 4
            $code = 'SRV-'.now()->format('Ymd').'-'.random_int(100000, 999999);

            // Check if exists first (fast path)
            if (! Service::query()->where('service_code', $code)->exists()) {
                return $code;
            }
        }

        // If all attempts fail, throw exception
        throw new \RuntimeException('Unable to generate unique service code after multiple attempts.');
    }

    /**
     * Sync sparepart list dengan strategi diff:
     * - Part yang punya `id` di payload → update-in-place (mempertahankan ID +
     *   FinancialTransaction morph yang mereferensikannya).
     * - Part tanpa `id` → create baru.
     * - Part yang ID-nya ada di DB tapi tidak ada di payload → delete (dan
     *   FinancialTransaction morph terkait juga dihapus untuk mencegah orphan).
     *
     * @param  array<int, array<string, mixed>>  $parts
     */
    private function syncParts(Service $service, array $parts): void
    {
        $existingIds = $service->parts()->pluck('id')->all();
        $payloadIds = collect($parts)
            ->pluck('id')
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->all();

        // Hapus part yang tidak lagi ada di payload + FT terkait morph-nya.
        // Stok inventori dikembalikan bila part berasal dari stok.
        $toDeleteIds = array_diff($existingIds, $payloadIds);

        if ($toDeleteIds !== []) {
            $deletedParts = $service->parts()->whereIn('id', $toDeleteIds)->get();

            foreach ($deletedParts as $deletedPart) {
                $this->restoreSparepartStock($deletedPart->sparepart_id, (int) $deletedPart->quantity);
            }

            FinancialTransaction::query()
                ->where('related_type', (new ServicePart)->getMorphClass())
                ->whereIn('related_id', $toDeleteIds)
                ->forceDelete();

            $service->parts()->whereIn('id', $toDeleteIds)->delete();
        }

        foreach ($parts as $part) {
            $attributes = [
                'kind' => $part['kind'] ?? 'used',
                'part_name' => $part['part_name'],
                'sparepart_type_id' => $part['sparepart_type_id'] ?? null,
                'sparepart_id' => $part['sparepart_id'] ?? null,
                'quantity' => $part['quantity'] ?? 1,
                'cost_price' => $part['cost_price'] ?? 0,
                'selling_price' => $part['selling_price'] ?? 0,
                'installation_fee' => $part['installation_fee'] ?? 0,
                'note' => $part['note'] ?? null,
            ];

            if (! empty($part['id'])) {
                $existing = $service->parts()->whereKey($part['id'])->first();

                if (! $existing) {
                    continue;
                }

                $this->adjustSparepartStock(
                    $existing->sparepart_id,
                    (int) $existing->quantity,
                    $attributes['sparepart_id'],
                    (int) $attributes['quantity'],
                );

                $existing->update($attributes);

                // Koreksi expense pembelian bila cost berubah saat edit part.
                $newCost = (float) ($attributes['cost_price'] ?? 0);
                $newQty = (int) ($attributes['quantity'] ?? 1);
                $this->syncPartPurchaseExpense($service, $existing, $newCost, $newQty);
            } else {
                $this->consumeSparepartStock($attributes['sparepart_id'], (int) $attributes['quantity']);
                $part = $service->parts()->create($attributes);

                // Expense pembelian untuk part baru via form edit servis.
                $newCost = (float) ($attributes['cost_price'] ?? 0);
                $newQty = (int) ($attributes['quantity'] ?? 1);

                if ($newCost > 0) {
                    $this->syncPartPurchaseExpense($service, $part, $newCost, $newQty);
                }
            }
        }
    }

    /**
     * Buat/update expense pembelian untuk satu ServicePart.
     *
     * Kategori expense 'pembelian-sparepart' — slug 'sparepart' hanya ada
     * sebagai income di seeder, jadi jangan dipakai di sini. Bila cost
     * dikosongkan (0), expense yang telanjur ada dihapus agar tidak fiktif.
     * Morph ke ServicePart supaya ter-cleanup otomatis saat part dihapus.
     */
    private function syncPartPurchaseExpense(Service $service, ServicePart $part, float $cost, int $quantity): void
    {
        $code = 'EXP-'.$service->service_code.'-'.$part->id;

        if ($cost <= 0) {
            FinancialTransaction::query()
                ->where('transaction_code', $code)
                ->forceDelete();

            return;
        }

        $category = TransactionCategory::query()
            ->where('slug', 'pembelian-sparepart')
            ->where('type', 'expense')
            ->first();

        if (! $category) {
            return;
        }

        FinancialTransaction::updateOrCreate(
            ['transaction_code' => $code],
            [
                'type' => 'expense',
                'transaction_category_id' => $category->id,
                'amount' => $cost * $quantity,
                'payment_method_id' => PaymentMethod::defaultId(),
                'transaction_date' => now()->toDateString(),
                'description' => 'Pembelian '.$part->part_name.' untuk '.$service->service_code,
                'related_type' => $part->getMorphClass(),
                'related_id' => $part->id,
                'created_by' => Auth::id(),
            ],
        );
    }

    /**
     * Kurangi stok inventori untuk pemakaian servis baru.
     */
    private function consumeSparepartStock(?int $sparepartId, int $quantity): void
    {
        if (! $sparepartId || $quantity <= 0) {
            return;
        }

        $sparepart = Sparepart::query()->lockForUpdate()->findOrFail($sparepartId);

        if (! $sparepart->is_active) {
            throw ValidationException::withMessages([
                'parts' => 'Sparepart tidak aktif dan tidak bisa dipakai.',
            ]);
        }

        if ($sparepart->stock < $quantity) {
            throw ValidationException::withMessages([
                'parts' => 'Stok sparepart tidak mencukupi (sisa '.$sparepart->stock.').',
            ]);
        }

        $sparepart->decrement('stock', $quantity);
    }

    /**
     * Kembalikan stok part lama bila ada.
     */
    private function restoreSparepartStock(?int $sparepartId, int $quantity): void
    {
        if (! $sparepartId || $quantity <= 0) {
            return;
        }

        $sparepart = Sparepart::query()->lockForUpdate()->find($sparepartId);

        if ($sparepart) {
            $sparepart->increment('stock', $quantity);
        }
    }

    /**
     * Sesuaikan stok saat part yang sudah ada diubah (bisa ganti item/jumlah).
     */
    private function adjustSparepartStock(?int $oldSparepartId, int $oldQty, mixed $newSparepartId, int $newQty): void
    {
        $this->restoreSparepartStock($oldSparepartId ? (int) $oldSparepartId : null, $oldQty);
        $this->consumeSparepartStock($newSparepartId ? (int) $newSparepartId : null, $newQty);
    }

    /**
     * Compute estimated total from a parts list (selling + install × qty).
     *
     * @param  array<int, array<string, mixed>>  $parts
     */
    private function sumPartTotal(array $parts): float
    {
        $total = 0.0;

        foreach ($parts as $part) {
            $qty = (int) ($part['quantity'] ?? 1);
            $unit = (float) ($part['selling_price'] ?? 0) + (float) ($part['installation_fee'] ?? 0);
            $total += $unit * $qty;
        }

        return $total;
    }
}
