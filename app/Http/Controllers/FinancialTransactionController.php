<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFinancialTransactionRequest;
use App\Http\Requests\UpdateFinancialTransactionRequest;
use App\Models\FinancialTransaction;
use App\Models\PaymentMethod;
use App\Models\TransactionCategory;
use Carbon\CarbonInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class FinancialTransactionController extends Controller
{
    /**
     * Display a paginated financial transaction listing.
     */
    public function index(Request $request): Response
    {
        // Kalau user tidak set range tanggal, default ke 90 hari terakhir.
        // Ini mencegah query mengembalikan ratusan ribu row saat volume tinggi.
        // Menerima alias from_date/to_date dari frontend lama + from/to.
        $from = $request->filled('from_date')
            ? $request->date('from_date')
            : ($request->filled('from') ? $request->date('from') : now()->subDays(90));
        $to = $request->filled('to_date')
            ? $request->date('to_date')
            : ($request->filled('to') ? $request->date('to') : now());

        // Normalisasi ke string tanggal untuk whereBetween — whereDate()
        // membungkus kolom dengan DATE() sehingga index composite
        // (type, transaction_date) tidak kepakai. whereBetween menjaga
        // sargability karena kolom date dibanding langsung dengan string.
        $fromDate = $from instanceof CarbonInterface ? $from->toDateString() : (string) $from;
        $toDate = $to instanceof CarbonInterface ? $to->toDateString() : (string) $to;

        $baseQuery = FinancialTransaction::query()
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query->where('transaction_code', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('type'), fn ($query) => $query->where('type', $request->string('type')->toString()))
            ->when($request->filled('transaction_category_id'), fn ($query) => $query->where('transaction_category_id', $request->integer('transaction_category_id')))
            ->whereBetween('transaction_date', [$fromDate, $toDate]);

        // SATU query agregat untuk income+expense (bukan 2× SUM) — plus
        // chart GROUP BY day,type. Total 2 query ringan, bukan 3.
        $aggregates = (clone $baseQuery)
            ->selectRaw('type, SUM(amount) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        $totalIncome = (float) ($aggregates['income'] ?? 0);
        $totalExpense = (float) ($aggregates['expense'] ?? 0);

        // Chart data: aggregate di SQL (GROUP BY day, type) — bukan kirim
        // semua transaksi ke browser dan agregat di JS. Payload jadi
        // proportional ke jumlah hari (max 90 rows × 2 type = 180 rows),
        // bukan proportional ke jumlah transaksi (bisa ribuan).
        $chartData = (clone $baseQuery)
            ->selectRaw('DATE(transaction_date) as day, type, SUM(amount) as total')
            ->groupBy('day', 'type')
            ->orderBy('day')
            ->get()
            ->map(fn ($row) => [
                'transaction_date' => $row->day,
                'type' => $row->type,
                'amount' => (float) $row->total,
            ])
            ->values();

        return Inertia::render('financial-transactions/index', [
            'transactions' => $baseQuery->with(['category', 'paymentMethod', 'creator', 'related'])->latest('transaction_date')->paginate(10)->withQueryString(),
            'chart_transactions' => $chartData,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'type' => $request->input('type'),
                'transaction_category_id' => $request->input('transaction_category_id'),
                'from_date' => $fromDate,
                'to_date' => $toDate,
            ],
            'summary' => [
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'balance' => $totalIncome - $totalExpense,
            ],
            'categories' => TransactionCategory::query()->orderBy('name')->get(),
            'payment_methods' => PaymentMethod::query()->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the financial transaction creation page.
     */
    public function create(): Response
    {
        return Inertia::render('financial-transactions/create', $this->formOptions());
    }

    /**
     * Store a newly created financial transaction.
     */
    public function store(StoreFinancialTransactionRequest $request): RedirectResponse
    {
        FinancialTransaction::query()->create([
            ...$request->validated(),
            'transaction_code' => $this->generateTransactionCode(),
            'created_by' => Auth::id(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Transaksi keuangan berhasil ditambahkan.']);

        return to_route('financial-transactions.index');
    }

    /**
     * Display the selected financial transaction.
     */
    public function show(FinancialTransaction $financialTransaction): Response
    {
        return Inertia::render('financial-transactions/show', [
            'transaction' => $financialTransaction->load(['category', 'paymentMethod', 'creator']),
        ]);
    }

    /**
     * Show the financial transaction edit page.
     */
    public function edit(FinancialTransaction $financialTransaction): Response
    {
        return Inertia::render('financial-transactions/edit', [
            'transaction' => $financialTransaction->load(['category:id,name', 'paymentMethod:id,name']),
            ...$this->formOptions(),
        ]);
    }

    /**
     * Update the selected financial transaction.
     *
     * Jurnal otomatis (related_type terisi, mis. INC-/EXP-) tidak boleh
     * diubah manual — sumber kebenarannya ada di modul asal
     * (servis/laptop/sewa/sparepart).
     */
    public function update(UpdateFinancialTransactionRequest $request, FinancialTransaction $financialTransaction): RedirectResponse
    {
        if ($financialTransaction->related_type) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Transaksi otomatis tidak bisa diubah manual. Ubah dari modul asalnya.']);

            return back()->withErrors([
                'transaction' => 'Transaksi otomatis tidak bisa diubah manual. Ubah dari modul asalnya.',
            ]);
        }

        $financialTransaction->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Transaksi keuangan berhasil diperbarui.']);

        return to_route('financial-transactions.index');
    }

    /**
     * Delete the selected financial transaction.
     *
     * Jurnal otomatis tidak boleh dihapus manual — hapus dari modul
     * asalnya (batalkan/edit di sana) agar stok dan jurnal konsisten.
     */
    public function destroy(FinancialTransaction $financialTransaction): RedirectResponse
    {
        if ($financialTransaction->related_type) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Transaksi otomatis tidak bisa dihapus manual.']);

            return back()->withErrors([
                'transaction' => 'Transaksi otomatis tidak bisa dihapus manual.',
            ]);
        }

        $financialTransaction->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Transaksi keuangan berhasil dihapus.']);

        return to_route('financial-transactions.index');
    }

    /**
     * Get shared financial transaction form options.
     * Kategori jurnal otomatis dikecualikan — sumber kebenarannya ada
     * di modul asal, bukan input manual.
     *
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        $manualCategoryIds = TransactionCategory::query()
            ->whereNotIn('slug', StoreFinancialTransactionRequest::reservedCategorySlugs())
            ->orderBy('name')
            ->pluck('id')
            ->all();

        $forType = fn (string $type) => TransactionCategory::query()
            ->whereIn('id', $manualCategoryIds)
            ->where('type', $type)
            ->orderBy('name')
            ->get();

        return [
            'categories' => [
                'income' => $forType('income'),
                'expense' => $forType('expense'),
            ],
            'payment_methods' => PaymentMethod::query()->orderBy('name')->get(),
        ];
    }

    /**
     * Generate a unique transaction code.
     *
     * Menggunakan 6 digit + max 10 attempts untuk mencegah infinite loop
     * ketika volume harian mendekati saturasi. Kalau semua attempt gagal,
     * throw exception supaya bug bisa dideteksi cepat (bukan hang).
     */
    private function generateTransactionCode(): string
    {
        $maxAttempts = 10;

        for ($i = 0; $i < $maxAttempts; $i++) {
            $code = 'TXN-'.now()->format('Ymd').'-'.random_int(100000, 999999);

            if (! FinancialTransaction::query()->where('transaction_code', $code)->exists()) {
                return $code;
            }
        }

        throw new \RuntimeException('Unable to generate unique transaction code after '.$maxAttempts.' attempts.');
    }
}
