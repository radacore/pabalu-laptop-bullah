<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSparepartRequest;
use App\Http\Requests\UpdateSparepartRequest;
use App\Models\Customer;
use App\Models\FinancialTransaction;
use App\Models\PaymentMethod;
use App\Models\ServicePart;
use App\Models\Sparepart;
use App\Models\SparepartType;
use App\Models\TransactionCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SparepartController extends Controller
{
    /**
     * Display a paginated sparepart listing.
     */
    public function index(Request $request): Response
    {
        $spareparts = Sparepart::query()
            ->with(['type', 'creator'])
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhereHas('type', fn ($q) => $q->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->filled('sparepart_type_id'), fn ($query) => $query->where('sparepart_type_id', $request->integer('sparepart_type_id')))
            ->when($request->filled('condition'), fn ($query) => $query->where('condition', $request->string('condition')->toString()))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $spareparts->getCollection()->each->makeVisible(['cost_price']);

        return Inertia::render('spareparts/index', [
            'spareparts' => $spareparts,
            'filters' => $request->only(['search', 'sparepart_type_id', 'condition']),
            'types' => SparepartType::query()->orderBy('sort_order')->orderBy('name')->get(),
            'conditions' => Sparepart::conditions(),
        ]);
    }

    /**
     * Show the sparepart creation page.
     */
    public function create(): Response
    {
        return Inertia::render('spareparts/create', $this->formOptions());
    }

    /**
     * Store a newly created sparepart.
     */
    public function store(StoreSparepartRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['sku'] = $data['sku'] ?? $this->generateSku();
        $data['created_by'] = Auth::id();

        $sparepart = DB::transaction(function () use ($data): Sparepart {
            $sparepart = Sparepart::query()->create($data);
            $this->autoCreatePurchaseExpense($sparepart);

            return $sparepart;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sparepart berhasil ditambahkan.']);

        // Arahkan ke Detail (bukan index) agar upload foto tinggal 1 klik.
        return to_route('spareparts.show', $sparepart);
    }

    /**
     * Display the selected sparepart.
     */
    public function show(Sparepart $sparepart): Response
    {
        $sparepart->load(['type', 'photos', 'creator', 'financialTransactions.category', 'sales' => fn ($q) => $q->with('customer')->latest()->limit(10)]);
        $sparepart->makeVisible(['cost_price']);

        return Inertia::render('spareparts/show', [
            'sparepart' => $sparepart,
            ...$this->formOptions(),
            'customers' => Customer::query()->orderBy('name')->get(['id', 'name', 'phone']),
            'payment_methods' => PaymentMethod::query()->orderBy('sort_order')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the sparepart edit page.
     */
    public function edit(Sparepart $sparepart): Response
    {
        $sparepart->makeVisible(['cost_price']);
        $sparepart->load('type:id,name');

        return Inertia::render('spareparts/edit', [
            'sparepart' => $sparepart,
            ...$this->formOptions(),
        ]);
    }

    /**
     * Update the selected sparepart.
     *
     * Expense pembelian disinkronkan ulang lewat updateOrCreate agar koreksi
     * cost/stok ikut terkoreksi di jurnal (konsisten dengan modul lain).
     */
    public function update(UpdateSparepartRequest $request, Sparepart $sparepart): RedirectResponse
    {
        DB::transaction(function () use ($request, $sparepart): void {
            $sparepart->update($request->validated());
            $this->autoCreatePurchaseExpense($sparepart->fresh());
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sparepart berhasil diperbarui.']);

        return to_route('spareparts.index');
    }

    /**
     * Delete the selected sparepart.
     *
     * Ditolak bila masih dipakai penjualan tercatat atau pemakaian servis
     * agar relasi tidak dangling dan file tidak yatim.
     *
     * Expense pembelian morph ikut dibersihkan (forceDelete) agar tidak
     * yatim — konsisten dengan modul lain.
     */
    public function destroy(Sparepart $sparepart): RedirectResponse
    {
        if ($sparepart->sales()->exists() || ServicePart::query()->where('sparepart_id', $sparepart->id)->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Sparepart masih dipakai penjualan atau servis dan tidak bisa dihapus. Nonaktifkan saja bila tidak dijual lagi.']);

            return back()->withErrors([
                'sparepart' => 'Sparepart masih dipakai penjualan atau servis dan tidak bisa dihapus. Nonaktifkan saja bila tidak dijual lagi.',
            ]);
        }

        DB::transaction(function () use ($sparepart): void {
            FinancialTransaction::query()
                ->where('related_type', $sparepart->getMorphClass())
                ->where('related_id', $sparepart->id)
                ->forceDelete();

            $sparepart->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sparepart berhasil dihapus.']);

        return to_route('spareparts.index');
    }

    /**
     * Get shared sparepart form options.
     *
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'types' => SparepartType::query()->orderBy('sort_order')->orderBy('name')->get(),
            'conditions' => Sparepart::conditions(),
        ];
    }

    /**
     * Auto-create expense transaction when sparepart stock is purchased.
     */
    private function autoCreatePurchaseExpense(Sparepart $sparepart): void
    {
        $total = (float) ($sparepart->cost_price ?? 0) * (int) ($sparepart->stock ?? 0);

        if ($total <= 0) {
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
            ['transaction_code' => 'EXP-'.$sparepart->sku],
            [
                'type' => 'expense',
                'transaction_category_id' => $category->id,
                'amount' => $total,
                'payment_method_id' => PaymentMethod::defaultId(),
                'transaction_date' => now()->toDateString(),
                'description' => 'Pembelian stok '.$sparepart->name,
                'related_type' => $sparepart->getMorphClass(),
                'related_id' => $sparepart->id,
                'created_by' => Auth::id(),
            ],
        );
    }

    /**
     * Generate a unique sparepart SKU with retry logic.
     */
    private function generateSku(): string
    {
        $maxAttempts = 10;

        for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
            $sku = 'SPR-'.now()->format('Ymd').'-'.random_int(100000, 999999);

            if (! Sparepart::query()->where('sku', $sku)->exists()) {
                return $sku;
            }
        }

        throw new \RuntimeException('Unable to generate unique sparepart SKU after multiple attempts.');
    }
}
