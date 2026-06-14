<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /** Display a paginated category listing. */
    public function index(Request $request): Response
    {
        return Inertia::render('master-data/categories/index', ['categories' => Category::query()->when($request->string('search')->isNotEmpty(), fn ($query) => $query->where('name', 'like', '%'.$request->string('search')->toString().'%'))->orderBy('sort_order')->orderBy('name')->paginate(10)->withQueryString(), 'filters' => $request->only('search')]);
    }

    /** Show the category creation page. */
    public function create(): Response { return Inertia::render('master-data/categories/create'); }

    /** Store a newly created category. */
    public function store(Request $request): RedirectResponse { $data = $this->validated($request); Category::query()->create([...$data, 'slug' => Str::slug($data['name'])]); Inertia::flash('toast', ['type' => 'success', 'message' => 'Kategori berhasil ditambahkan.']); return to_route('master-data.categories.index'); }

    /** Show the category edit page. */
    public function edit(Category $category): Response { return Inertia::render('master-data/categories/edit', ['category' => $category]); }

    /** Update the selected category. */
    public function update(Request $request, Category $category): RedirectResponse { $data = $this->validated($request); $category->update([...$data, 'slug' => Str::slug($data['name'])]); Inertia::flash('toast', ['type' => 'success', 'message' => 'Kategori berhasil diperbarui.']); return to_route('master-data.categories.index'); }

    /** Delete the selected category. */
    public function destroy(Category $category): RedirectResponse { $category->delete(); Inertia::flash('toast', ['type' => 'success', 'message' => 'Kategori berhasil dihapus.']); return to_route('master-data.categories.index'); }

    /** @return array<string, mixed> */
    private function validated(Request $request): array {         return $request->validate(['name' => ['required', 'string', 'max:255'], 'is_active' => ['required', 'boolean'], 'description' => ['nullable', 'string']]); }
}
