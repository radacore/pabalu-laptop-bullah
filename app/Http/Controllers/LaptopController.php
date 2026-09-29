<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLaptopRequest;
use App\Http\Requests\UpdateLaptopRequest;
use App\Models\Brand;
use App\Models\FinancialTransaction;
use App\Models\Laptop;
use App\Models\LaptopSource;
use App\Models\LaptopStatus;
use App\Models\PaymentMethod;
use App\Models\TransactionCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LaptopController extends Controller
{
    /**
     * Display a paginated laptop listing.
     */
    public function index(Request $request): Response
    {
        $laptops = Laptop::query()
            ->with(['source', 'status', 'creator', 'specification', 'brand'])
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhereHas('brand', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        })
                        ->orWhere('model', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('brand_id'), fn ($query) => $query->where('brand_id', $request->integer('brand_id')))
            ->when($request->filled('laptop_status_id'), fn ($query) => $query->where('laptop_status_id', $request->integer('laptop_status_id')))
            ->when($request->filled('laptop_source_id'), fn ($query) => $query->where('laptop_source_id', $request->integer('laptop_source_id')))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        // Admin panel — expose kolom internal yang di-hidden secara default di model.
        $laptops->getCollection()->each->makeVisible(['cost_price', 'repair_cost', 'internal_note', 'mines']);

        return Inertia::render('laptops/index', [
            'laptops' => $laptops,
            'filters' => $request->only(['search', 'brand_id', 'laptop_status_id', 'laptop_source_id']),
            'brands' => Brand::query()->where('is_active', true)->orderBy('sort_order')->orderBy('name')->get(),
            'sources' => LaptopSource::query()->orderBy('sort_order')->orderBy('name')->get(),
            'statuses' => LaptopStatus::query()->orderBy('sort_order')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the laptop creation page.
     */
    public function create(): Response
    {
        return Inertia::render('laptops/create', $this->formOptions());
    }

    /**
     * Store a newly created laptop.
     */
    public function store(StoreLaptopRequest $request): RedirectResponse
    {
        $data = $request->safe()->except(['specification', 'laptop_status_id']);
        $data['created_by'] = Auth::id();
        $data['laptop_status_id'] = $request->input('laptop_status_id')
            ?? $this->defaultStatusId();

        DB::transaction(function () use ($data, $request): void {
            $laptop = Laptop::query()->create($data);
            $this->syncSpecification($laptop, $request->validated('specification', []));
            $this->autoCreatePurchaseExpense($laptop);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Laptop berhasil ditambahkan.']);

        return to_route('laptops.index');
    }

    /**
     * Display the selected laptop.
     */
    public function show(Laptop $laptop): Response
    {
        $laptop->load(['specification', 'photos', 'source', 'status', 'creator', 'brand', 'financialTransactions']);
        $laptop->makeVisible(['cost_price', 'repair_cost', 'internal_note', 'mines']);

        return Inertia::render('laptops/show', [
            'laptop' => $laptop,
        ]);
    }

    /**
     * Show the laptop edit page.
     */
    public function edit(Laptop $laptop): Response
    {
        $laptop->load(['specification', 'brand:id,name', 'source:id,name', 'status:id,name,slug']);
        $laptop->makeVisible(['cost_price', 'repair_cost', 'internal_note', 'mines']);

        return Inertia::render('laptops/edit', [
            'laptop' => $laptop,
            ...$this->formOptions(),
        ]);
    }

    /**
     * Update the selected laptop.
     */
    public function update(UpdateLaptopRequest $request, Laptop $laptop): RedirectResponse
    {
        // Unit yang sedang disewa dikunci dari penjualan.
        if ($request->filled('laptop_status_id')) {
            $newSlug = LaptopStatus::query()->whereKey($request->integer('laptop_status_id'))->value('slug');

            if ($newSlug === 'terjual' && $laptop->isCurrentlyRented()) {
                Inertia::flash('toast', ['type' => 'error', 'message' => 'Unit sedang disewa dan tidak bisa dijual sebelum dikembalikan.']);

                return back()->withErrors([
                    'laptop_status_id' => 'Unit sedang disewa dan tidak bisa dijual sebelum dikembalikan.',
                ]);
            }
        }

        DB::transaction(function () use ($request, $laptop): void {
            $data = $request->safe()->except(['specification']);
            $laptop->update($data);
            $this->syncSpecification($laptop, $request->validated('specification', []));

            $laptop->load('status');
            $this->autoCreatePurchaseExpense($laptop->fresh());
            $this->autoCreateLaptopIncome($laptop);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Laptop berhasil diperbarui.']);

        return to_route('laptops.index');
    }

    /**
     * Delete the selected laptop.
     *
     * Ditolak bila unit sedang disewa atau masih punya riwayat rental
     * agar relasi tidak yatim dan unit tidak bricked.
     *
     * Seluruh jurnal morph milik laptop (expense pembelian + income
     * penjualan) dibersihkan pakai forceDelete agar tidak yatim di
     * laporan dan transaction_code bisa dipakai ulang.
     */
    public function destroy(Laptop $laptop): RedirectResponse
    {
        if ($laptop->isCurrentlyRented()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Unit sedang disewa dan tidak bisa dihapus sebelum dikembalikan.']);

            return back()->withErrors([
                'laptop' => 'Unit sedang disewa dan tidak bisa dihapus sebelum dikembalikan.',
            ]);
        }

        if ($laptop->rentals()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Unit memiliki riwayat penyewaan dan tidak bisa dihapus.']);

            return back()->withErrors([
                'laptop' => 'Unit memiliki riwayat penyewaan dan tidak bisa dihapus.',
            ]);
        }

        DB::transaction(function () use ($laptop): void {
            FinancialTransaction::query()
                ->where('related_type', $laptop->getMorphClass())
                ->where('related_id', $laptop->id)
                ->forceDelete();

            $laptop->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Laptop berhasil dihapus.']);

        return to_route('laptops.index');
    }

    /**
     * Auto-create expense transaction when a laptop is purchased (stock in).
     *
     * Expense disinkronkan ulang (updateOrCreate) agar koreksi cost_price
     * via form edit ikut terkoreksi — konsisten dengan modul sparepart.
     */
    private function autoCreatePurchaseExpense(?Laptop $laptop): void
    {
        if (! $laptop) {
            return;
        }

        $costPrice = (float) ($laptop->cost_price ?? 0);

        if ($costPrice <= 0) {
            return;
        }

        $pembelianStok = TransactionCategory::query()
            ->where('slug', 'pembelian-stok-laptop')
            ->where('type', 'expense')
            ->first();

        if (! $pembelianStok) {
            return;
        }

        FinancialTransaction::updateOrCreate(
            ['transaction_code' => 'EXP-'.$laptop->sku],
            [
                'type' => 'expense',
                'transaction_category_id' => $pembelianStok->id,
                'amount' => $costPrice,
                'payment_method_id' => PaymentMethod::defaultId(),
                'transaction_date' => now()->toDateString(),
                'description' => 'Pembelian stok '.($laptop->name ?? $laptop->model ?? $laptop->sku),
                'related_type' => $laptop->getMorphClass(),
                'related_id' => $laptop->id,
                'created_by' => Auth::id(),
            ],
        );
    }

    /**
     * Auto-create income transaction when laptop is marked as sold.
     *
     * Nominal disinkronkan ulang (updateOrCreate) agar koreksi harga jual
     * setelah terjual ikut terkoreksi. Bila status digeser KELUAR dari
     * terjual, jurnal dihapus (forceDelete) agar tidak fiktif — konsisten
     * dengan pola rental/servis.
     */
    private function autoCreateLaptopIncome(Laptop $laptop): void
    {
        $code = 'INC-'.$laptop->sku;

        if (! $laptop->status || $laptop->status->slug !== 'terjual') {
            FinancialTransaction::query()->where('transaction_code', $code)->forceDelete();

            if ($laptop->sold_at !== null) {
                $laptop->update(['sold_at' => null]);
            }

            return;
        }

        $amount = (float) ($laptop->selling_price ?? 0);

        if ($amount <= 0) {
            return;
        }

        $penjualanCategory = TransactionCategory::query()
            ->where('slug', 'penjualan-laptop')
            ->where('type', 'income')
            ->first();

        if (! $penjualanCategory) {
            return;
        }

        FinancialTransaction::updateOrCreate(
            ['transaction_code' => 'INC-'.$laptop->sku],
            [
                'type' => 'income',
                'transaction_category_id' => $penjualanCategory->id,
                'amount' => $amount,
                'payment_method_id' => PaymentMethod::defaultId(),
                'transaction_date' => now()->toDateString(),
                'description' => 'Penjualan '.($laptop->name ?? $laptop->sku),
                'related_type' => $laptop->getMorphClass(),
                'related_id' => $laptop->id,
                'created_by' => Auth::id(),
            ],
        );

        if ($laptop->sold_at === null) {
            $laptop->update(['sold_at' => now()]);
        }
    }

    /**
     * Get shared laptop form options.
     *
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'brands' => Brand::query()->orderBy('sort_order')->orderBy('name')->get(),
            'sources' => LaptopSource::query()->orderBy('sort_order')->orderBy('name')->get(),
            'statuses' => LaptopStatus::query()->orderBy('sort_order')->orderBy('name')->get(),
        ];
    }

    /**
     * Pick a sensible default laptop status (the first "Tersedia" status, or the first in sort order).
     */
    private function defaultStatusId(): ?int
    {
        $tersedia = LaptopStatus::query()
            ->where('slug', 'tersedia')
            ->orderBy('sort_order')
            ->first();

        if ($tersedia) {
            return $tersedia->id;
        }

        return LaptopStatus::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->value('id');
    }

    /**
     * Update or create a laptop specification when any specification field is provided.
     *
     * @param  array<string, mixed>  $specification
     */
    private function syncSpecification(Laptop $laptop, array $specification): void
    {
        $specification = array_filter($specification, fn ($value) => filled($value));

        if ($specification !== []) {
            $laptop->specification()->updateOrCreate([], $specification);
        } elseif ($laptop->specification) {
            $laptop->specification()->delete();
        }
    }
}
