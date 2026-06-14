<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    /** Display a paginated brand listing. */
    public function index(Request $request): Response
    {
        return Inertia::render('master-data/brands/index', [
            'brands' => Brand::query()->when($request->string('search')->isNotEmpty(), fn ($query) => $query->where('name', 'like', '%'.$request->string('search')->toString().'%'))->orderBy('sort_order')->orderBy('name')->paginate(10)->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

    /** Show the brand creation page. */
    public function create(): Response
    {
        return Inertia::render('master-data/brands/create');
    }

    /** Store a newly created brand. */
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        Brand::query()->create([...$data, 'slug' => Str::slug($data['name'])]);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Merek berhasil ditambahkan.']);

        return to_route('master-data.brands.index');
    }

    /** Show the brand edit page. */
    public function edit(Brand $brand): Response
    {
        return Inertia::render('master-data/brands/edit', ['brand' => $brand]);
    }

    /** Update the selected brand. */
    public function update(Request $request, Brand $brand): RedirectResponse
    {
        $data = $this->validated($request);
        $brand->update([...$data, 'slug' => Str::slug($data['name'])]);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Merek berhasil diperbarui.']);

        return to_route('master-data.brands.index');
    }

    /** Delete the selected brand. */
    public function destroy(Brand $brand): RedirectResponse
    {
        $brand->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Merek berhasil dihapus.']);

        return to_route('master-data.brands.index');
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        return $request->validate(['name' => ['required', 'string', 'max:255'], 'is_active' => ['required', 'boolean'], 'description' => ['nullable', 'string']]);
    }
}
