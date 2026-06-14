<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\SparepartType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SparepartTypeController extends Controller
{
    /** Display a paginated sparepart type listing. */
    public function index(Request $request): Response { return Inertia::render('master-data/sparepart-types/index', ['sparepartTypes' => SparepartType::query()->when($request->string('search')->isNotEmpty(), fn ($query) => $query->where('name', 'like', '%'.$request->string('search')->toString().'%'))->orderBy('sort_order')->orderBy('name')->paginate(10)->withQueryString(), 'filters' => $request->only('search')]); }

    /** Show the sparepart type creation page. */
    public function create(): Response { return Inertia::render('master-data/sparepart-types/create'); }

    /** Store a newly created sparepart type. */
    public function store(Request $request): RedirectResponse { $data = $this->validated($request); SparepartType::query()->create([...$data, 'slug' => Str::slug($data['name'])]); Inertia::flash('toast', ['type' => 'success', 'message' => 'Tipe sparepart berhasil ditambahkan.']); return to_route('master-data.sparepart-types.index'); }

    /** Show the sparepart type edit page. */
    public function edit(SparepartType $sparepartType): Response { return Inertia::render('master-data/sparepart-types/edit', ['sparepartType' => $sparepartType]); }

    /** Update the selected sparepart type. */
    public function update(Request $request, SparepartType $sparepartType): RedirectResponse { $data = $this->validated($request); $sparepartType->update([...$data, 'slug' => Str::slug($data['name'])]); Inertia::flash('toast', ['type' => 'success', 'message' => 'Tipe sparepart berhasil diperbarui.']); return to_route('master-data.sparepart-types.index'); }

    /** Delete the selected sparepart type. */
    public function destroy(SparepartType $sparepartType): RedirectResponse { $sparepartType->delete(); Inertia::flash('toast', ['type' => 'success', 'message' => 'Tipe sparepart berhasil dihapus.']); return to_route('master-data.sparepart-types.index'); }

    /** @return array<string, mixed> */
    private function validated(Request $request): array { return $request->validate(['name' => ['required', 'string', 'max:255'], 'is_active' => ['required', 'boolean'], 'description' => ['nullable', 'string']]); }
}
