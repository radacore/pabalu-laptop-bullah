<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\LaptopSource;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LaptopSourceController extends Controller
{
    /** Display a paginated laptop source listing. */
    public function index(Request $request): Response { return Inertia::render('master-data/laptop-sources/index', ['laptopSources' => LaptopSource::query()->when($request->string('search')->isNotEmpty(), fn ($query) => $query->where('name', 'like', '%'.$request->string('search')->toString().'%'))->orderBy('sort_order')->orderBy('name')->paginate(10)->withQueryString(), 'filters' => $request->only('search')]); }

    /** Show the laptop source creation page. */
    public function create(): Response { return Inertia::render('master-data/laptop-sources/create'); }

    /** Store a newly created laptop source. */
    public function store(Request $request): RedirectResponse { $data = $this->validated($request); LaptopSource::query()->create([...$data, 'slug' => Str::slug($data['name'])]); Inertia::flash('toast', ['type' => 'success', 'message' => 'Sumber laptop berhasil ditambahkan.']); return to_route('master-data.laptop-sources.index'); }

    /** Show the laptop source edit page. */
    public function edit(LaptopSource $laptopSource): Response { return Inertia::render('master-data/laptop-sources/edit', ['laptopSource' => $laptopSource]); }

    /** Update the selected laptop source. */
    public function update(Request $request, LaptopSource $laptopSource): RedirectResponse { $data = $this->validated($request); $laptopSource->update([...$data, 'slug' => Str::slug($data['name'])]); Inertia::flash('toast', ['type' => 'success', 'message' => 'Sumber laptop berhasil diperbarui.']); return to_route('master-data.laptop-sources.index'); }

    /** Delete the selected laptop source. */
    public function destroy(LaptopSource $laptopSource): RedirectResponse { $laptopSource->delete(); Inertia::flash('toast', ['type' => 'success', 'message' => 'Sumber laptop berhasil dihapus.']); return to_route('master-data.laptop-sources.index'); }

    /** @return array<string, mixed> */
    private function validated(Request $request): array { return $request->validate(['name' => ['required', 'string', 'max:255'], 'is_active' => ['required', 'boolean'], 'description' => ['nullable', 'string']]); }
}
