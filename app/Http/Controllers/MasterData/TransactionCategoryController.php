<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\TransactionCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TransactionCategoryController extends Controller
{
    /** Display a paginated transaction category listing. */
    public function index(Request $request): Response { return Inertia::render('master-data/transaction-categories/index', ['transactionCategories' => TransactionCategory::query()->when($request->string('search')->isNotEmpty(), fn ($query) => $query->where('name', 'like', '%'.$request->string('search')->toString().'%'))->orderBy('sort_order')->orderBy('name')->paginate(10)->withQueryString(), 'filters' => $request->only('search')]); }

    /** Show the transaction category creation page. */
    public function create(): Response { return Inertia::render('master-data/transaction-categories/create'); }

    /** Store a newly created transaction category. */
    public function store(Request $request): RedirectResponse { $data = $this->validated($request); TransactionCategory::query()->create([...$data, 'slug' => Str::slug($data['name'])]); Inertia::flash('toast', ['type' => 'success', 'message' => 'Kategori transaksi berhasil ditambahkan.']); return to_route('master-data.transaction-categories.index'); }

    /** Show the transaction category edit page. */
    public function edit(TransactionCategory $transactionCategory): Response { return Inertia::render('master-data/transaction-categories/edit', ['transactionCategory' => $transactionCategory]); }

    /** Update the selected transaction category. */
    public function update(Request $request, TransactionCategory $transactionCategory): RedirectResponse { $data = $this->validated($request); $transactionCategory->update([...$data, 'slug' => Str::slug($data['name'])]); Inertia::flash('toast', ['type' => 'success', 'message' => 'Kategori transaksi berhasil diperbarui.']); return to_route('master-data.transaction-categories.index'); }

    /** Delete the selected transaction category. */
    public function destroy(TransactionCategory $transactionCategory): RedirectResponse { $transactionCategory->delete(); Inertia::flash('toast', ['type' => 'success', 'message' => 'Kategori transaksi berhasil dihapus.']); return to_route('master-data.transaction-categories.index'); }

    /** @return array<string, mixed> */
    private function validated(Request $request): array { return $request->validate(['name' => ['required', 'string', 'max:255'], 'is_active' => ['required', 'boolean'], 'description' => ['nullable', 'string'], 'type' => ['required', 'in:income,expense']]); }
}
