<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFinancialTransactionRequest;
use App\Http\Requests\UpdateFinancialTransactionRequest;
use App\Models\FinancialTransaction;
use App\Models\PaymentMethod;
use App\Models\TransactionCategory;
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
        $baseQuery = FinancialTransaction::query()
            ->when($request->filled('type'), fn ($query) => $query->where('type', $request->string('type')->toString()))
            ->when($request->filled('transaction_category_id'), fn ($query) => $query->where('transaction_category_id', $request->integer('transaction_category_id')))
            ->when($request->filled('from'), fn ($query) => $query->whereDate('transaction_date', '>=', $request->date('from')))
            ->when($request->filled('to'), fn ($query) => $query->whereDate('transaction_date', '<=', $request->date('to')));

        $totalIncome = (clone $baseQuery)->where('type', 'income')->sum('amount');
        $totalExpense = (clone $baseQuery)->where('type', 'expense')->sum('amount');

        return Inertia::render('financial-transactions/index', [
            'transactions' => $baseQuery->with(['category', 'paymentMethod', 'creator'])->latest('transaction_date')->paginate(10)->withQueryString(),
            'chart_transactions' => FinancialTransaction::query()
                ->when($request->filled('type'), fn ($query) => $query->where('type', $request->string('type')->toString()))
                ->when($request->filled('transaction_category_id'), fn ($query) => $query->where('transaction_category_id', $request->integer('transaction_category_id')))
                ->when($request->filled('from'), fn ($query) => $query->whereDate('transaction_date', '>=', $request->date('from')))
                ->when($request->filled('to'), fn ($query) => $query->whereDate('transaction_date', '<=', $request->date('to')))
                ->latest('transaction_date')
                ->get(['id', 'transaction_date', 'type', 'amount'])
                ->map(fn ($t) => [
                    'transaction_date' => $t->transaction_date?->toDateString(),
                    'type' => $t->type,
                    'amount' => (float) $t->amount,
                ])
                ->values(),
            'filters' => $request->only(['type', 'from', 'to', 'transaction_category_id']),
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
            'transaction' => $financialTransaction,
            ...$this->formOptions(),
        ]);
    }

    /**
     * Update the selected financial transaction.
     */
    public function update(UpdateFinancialTransactionRequest $request, FinancialTransaction $financialTransaction): RedirectResponse
    {
        $financialTransaction->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Transaksi keuangan berhasil diperbarui.']);

        return to_route('financial-transactions.index');
    }

    /**
     * Delete the selected financial transaction.
     */
    public function destroy(FinancialTransaction $financialTransaction): RedirectResponse
    {
        $financialTransaction->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Transaksi keuangan berhasil dihapus.']);

        return to_route('financial-transactions.index');
    }

    /**
     * Get shared financial transaction form options.
     *
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'categories' => [
                'income' => TransactionCategory::query()->where('type', 'income')->orderBy('name')->get(),
                'expense' => TransactionCategory::query()->where('type', 'expense')->orderBy('name')->get(),
            ],
            'payment_methods' => PaymentMethod::query()->orderBy('name')->get(),
        ];
    }

    /**
     * Generate a unique transaction code.
     */
    private function generateTransactionCode(): string
    {
        do {
            $code = 'TXN-'.now()->format('Ymd').'-'.random_int(1000, 9999);
        } while (FinancialTransaction::query()->where('transaction_code', $code)->exists());

        return $code;
    }
}
