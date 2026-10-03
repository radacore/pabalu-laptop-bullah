<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRentalRequest;
use App\Http\Requests\UpdateRentalRequest;
use App\Models\Customer;
use App\Models\FinancialTransaction;
use App\Models\Laptop;
use App\Models\LaptopStatus;
use App\Models\PaymentMethod;
use App\Models\Rental;
use App\Models\RentalStatus;
use App\Models\TransactionCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RentalController extends Controller
{
    /**
     * Display a paginated rental listing.
     *
     * Staff hanya melihat rental yang dia buat (konsisten dengan
     * RentalPolicy::view). Admin melihat semua.
     */
    public function index(Request $request): Response
    {
        $rentals = Rental::query()
            ->with(['customer', 'laptop.brand', 'status'])
            ->when($request->user()?->role !== 'admin', fn ($query) => $query->where('created_by', $request->user()?->id))
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query->where('rental_code', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn ($query) => $query->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('laptop', fn ($query) => $query->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->filled('rental_status_id'), fn ($query) => $query->where('rental_status_id', $request->integer('rental_status_id')))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('rentals/index', [
            'rentals' => $rentals,
            'filters' => $request->only(['search', 'rental_status_id']),
            'statuses' => RentalStatus::query()->orderBy('sort_order')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the rental creation page.
     */
    public function create(): Response
    {
        return Inertia::render('rentals/create', $this->formOptions());
    }

    /**
     * Store a newly created rental.
     */
    public function store(StoreRentalRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['deposit'] ??= 0;
        $data['rental_code'] = $this->generateRentalCode();
        $data['tracking_code'] = bin2hex(random_bytes(8));
        $data['rented_at'] = $data['rented_at'] ?? now();
        $data['rental_status_id'] = $data['rental_status_id'] ?? $this->defaultStatusId();
        $data['created_by'] = Auth::id();

        DB::transaction(function () use ($data): void {
            // Mode 'new': buat pelanggan sekalian dalam transaksi yang
            // sama — rental gagal = pelanggan ikut batal.
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

            $laptop = Laptop::query()->lockForUpdate()->findOrFail($data['laptop_id']);

            // Guard balapan: unit harus masih bisa disewa + tersedia
            // saat baris dikunci.
            if (! $laptop->is_rentable) {
                throw ValidationException::withMessages([
                    'laptop_id' => 'Unit tidak ditandai bisa disewa.',
                ]);
            }

            if ($laptop->status?->slug !== 'tersedia' || $laptop->isCurrentlyRented()) {
                throw ValidationException::withMessages([
                    'laptop_id' => 'Unit tidak tersedia untuk disewa.',
                ]);
            }

            $rental = Rental::query()->create($data);

            $this->transitionTo($rental->fresh(), null);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Penyewaan berhasil dibuat.']);

        return to_route('rentals.index');
    }

    /**
     * Display the selected rental.
     */
    public function show(Rental $rental): Response
    {
        return Inertia::render('rentals/show', [
            'rental' => $rental->load([
                'customer',
                'laptop.brand',
                'laptop.status',
                'status',
                'creator',
                'financialTransactions',
            ]),
            ...$this->formOptions(),
        ]);
    }

    /**
     * Show the rental edit page.
     */
    public function edit(Rental $rental): Response
    {
        return Inertia::render('rentals/edit', [
            'rental' => $rental->load(['customer:id,name,phone', 'laptop:id,name,model,sku', 'status']),
            ...$this->formOptions(),
        ]);
    }

    /**
     * Update the selected rental.
     */
    public function update(UpdateRentalRequest $request, Rental $rental): RedirectResponse
    {
        DB::transaction(function () use ($request, $rental): void {
            // Kunci baris dulu agar guard di bawah konsisten (anti-balapan).
            $rental = Rental::query()->lockForUpdate()->findOrFail($rental->id);
            $oldStatusId = $rental->rental_status_id;

            $data = $request->validated();

            $rental->update($data);
            $rental->load('status');

            $this->transitionTo($rental->fresh(), $oldStatusId);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Penyewaan berhasil diperbarui.']);

        return to_route('rentals.index');
    }

    /**
     * Delete the selected rental.
     *
     * Rental aktif (unit masih dikunci) tidak boleh dihapus — selesaikan
     * atau batalkan dulu agar status laptop kembali konsisten.
     *
     * Jurnal morph milik rental (income sewa + denda) dibersihkan pakai
     * forceDelete agar tidak yatim — konsisten dengan modul lain.
     */
    public function destroy(Rental $rental): RedirectResponse
    {
        $rental->loadMissing('status');

        if ($rental->status && ! in_array($rental->status->slug, Rental::closedStatuses(), true)) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Penyewaan masih aktif dan tidak bisa dihapus. Selesaikan atau batalkan dulu.']);

            return back()->withErrors([
                'rental' => 'Penyewaan masih aktif dan tidak bisa dihapus. Selesaikan atau batalkan dulu.',
            ]);
        }

        DB::transaction(function () use ($rental): void {
            FinancialTransaction::query()
                ->where('related_type', $rental->getMorphClass())
                ->where('related_id', $rental->id)
                ->forceDelete();

            $rental->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Penyewaan berhasil dihapus.']);

        return to_route('rentals.index');
    }

    /**
     * Terapkan efek samping perpindahan status dalam SATU tempat:
     * kunci/buka status laptop, snapshot total, catat pendapatan + denda.
     *
     * @param  int|null  $oldStatusId  null bila rental baru dibuat
     */
    private function transitionTo(Rental $rental, ?int $oldStatusId): void
    {
        $statusChanged = $oldStatusId !== $rental->rental_status_id;

        if ($statusChanged) {
            $rental->load(['status', 'laptop']);

            if ($rental->status?->slug === 'aktif-disewa') {
                $this->setLaptopStatus($rental->laptop, 'disewa');
            }

            if (in_array($rental->status?->slug, Rental::closedStatuses(), true)) {
                $this->setLaptopStatus($rental->laptop, 'tersedia');

                if ($rental->returned_at === null) {
                    $rental->update(['returned_at' => now()]);
                    $rental->refresh();
                }
            }

            // Snapshot total hari + biaya: kumulatif, bukan sekali tulis.
            // Aturan: penyelesaian pertama membukukan s.d. tanggal kembali
            // aktual; penyelesaian ulang TIDAK BOLEH menurunkan nominal
            // yang sudah dibukukan (mencegah penggelapan via koreksi),
            // hanya boleh menaikkan bila periode bertambah.
            if (in_array($rental->status?->slug, Rental::completionStatuses(), true)) {
                $days = $rental->rentalDays();

                if ($rental->total_days === null || $days > (int) $rental->total_days) {
                    $rental->update(['total_days' => $days]);
                }

                if ($rental->total_cost === null) {
                    $rental->update(['total_cost' => $rental->estimatedTotal()]);
                }
            }
        }

        $this->autoCreateRentalIncome($rental->fresh());
    }

    private function setLaptopStatus(?Laptop $laptop, string $slug): void
    {
        if (! $laptop) {
            return;
        }

        $statusId = LaptopStatus::query()->where('slug', $slug)->value('id');

        if ($statusId && $laptop->laptop_status_id !== (int) $statusId) {
            $laptop->update(['laptop_status_id' => $statusId]);
        }
    }

    /**
     * Auto-create income transaction when rental reaches completion status,
     * plus denda bila kembali melewati jatuh tempo.
     */
    private function autoCreateRentalIncome(Rental $rental): void
    {
        $this->syncCompletionJournal($rental);
        $this->autoCreateLateFee($rental);
    }

    /**
     * Sinkronkan jurnal pendapatan dengan status saat ini: buat/update saat
     * final, HAPUS saat dibatalkan agar tidak ada pendapatan fiktif.
     *
     * Penghapusan memakai forceDelete (bukan soft-delete) agar kode
     * transaksi bisa dipakai ulang bila rental dibuka kembali, dan agar
     * tidak ada baris "mati" yang tetap masuk laporan bila
     * withTrashed dipakai.
     */
    private function syncCompletionJournal(Rental $rental): void
    {
        $code = 'INC-'.$rental->rental_code;

        if (! $rental->status || $rental->status->slug === 'dibatalkan') {
            FinancialTransaction::query()->where('transaction_code', $code)->forceDelete();
            FinancialTransaction::query()->where('transaction_code', $code.'-DENDA')->forceDelete();

            if ($rental->status?->slug === 'dibatalkan' && $rental->completed_at !== null) {
                $rental->update(['completed_at' => null]);
            }

            return;
        }

        if (! in_array($rental->status->slug, Rental::completionStatuses(), true)) {
            return;
        }

        $amount = (float) ($rental->total_cost ?? $rental->estimatedTotal());

        if ($amount <= 0) {
            return;
        }

        $rentalCategory = TransactionCategory::query()
            ->where('slug', 'sewa-laptop')
            ->where('type', 'income')
            ->first();

        if (! $rentalCategory) {
            return;
        }

        // Nominal disinkronkan ulang (bukan firstOrCreate buta) agar koreksi
        // tanggal/biaya setelah selesai ikut terkoreksi di jurnal.
        FinancialTransaction::updateOrCreate(
            ['transaction_code' => 'INC-'.$rental->rental_code],
            [
                'type' => 'income',
                'transaction_category_id' => $rentalCategory->id,
                'amount' => $amount,
                'payment_method_id' => PaymentMethod::defaultId(),
                'transaction_date' => now()->toDateString(),
                'description' => 'Pendapatan sewa '.$rental->rental_code,
                'related_type' => $rental->getMorphClass(),
                'related_id' => $rental->id,
                'created_by' => Auth::id(),
            ],
        );

        if ($rental->status->slug === 'selesai' && $rental->completed_at === null) {
            $rental->update(['completed_at' => now()]);
        }
    }

    /**
     * Denda = hari telat × tarif harian, kategori denda-sewa.
     * Nominal disinkronkan ulang agar koreksi tanggal kembali ikut
     * terkoreksi; bila tidak ada keterlambatan, jurnal denda yang
     * telanjur ada dihapus agar tidak jadi pendapatan fiktif.
     */
    private function autoCreateLateFee(Rental $rental): void
    {
        $code = 'INC-'.$rental->rental_code.'-DENDA';
        $fee = $rental->lateFee();

        if ($fee <= 0) {
            FinancialTransaction::query()
                ->where('transaction_code', $code)
                ->forceDelete();

            return;
        }

        $feeCategory = TransactionCategory::query()
            ->where('slug', 'denda-sewa')
            ->where('type', 'income')
            ->first();

        if (! $feeCategory) {
            return;
        }

        FinancialTransaction::updateOrCreate(
            ['transaction_code' => $code],
            [
                'type' => 'income',
                'transaction_category_id' => $feeCategory->id,
                'amount' => $fee,
                'payment_method_id' => PaymentMethod::defaultId(),
                'transaction_date' => now()->toDateString(),
                'description' => 'Denda keterlambatan '.$rental->rental_code,
                'related_type' => $rental->getMorphClass(),
                'related_id' => $rental->id,
                'created_by' => Auth::id(),
            ],
        );
    }

    /**
     * Get shared rental form options.
     *
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'customers' => Customer::query()->orderBy('name')->get(['id', 'name', 'phone']),
            'statuses' => RentalStatus::query()->orderBy('sort_order')->orderBy('name')->get(),
            'laptops' => Laptop::query()
                ->with('brand')
                ->whereHas('status', fn ($query) => $query->where('slug', 'tersedia'))
                ->orderBy('name')
                ->get(),
        ];
    }

    /**
     * Pick a sensible default rental status (first by sort order).
     */
    private function defaultStatusId(): ?int
    {
        return RentalStatus::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->value('id');
    }

    /**
     * Generate a unique rental code with retry logic.
     * Uses database unique constraint to prevent race conditions.
     */
    private function generateRentalCode(): string
    {
        $maxAttempts = 10;

        for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
            $code = 'RNT-'.now()->format('Ymd').'-'.random_int(100000, 999999);

            if (! Rental::query()->where('rental_code', $code)->exists()) {
                return $code;
            }
        }

        throw new \RuntimeException('Unable to generate unique rental code after multiple attempts.');
    }
}
