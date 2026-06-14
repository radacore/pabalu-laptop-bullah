<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\LaptopStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LaptopStatusController extends Controller
{
    /** Display a paginated laptop status listing. */
    public function index(Request $request): Response { return Inertia::render('master-data/laptop-statuses/index', ['laptopStatuses' => LaptopStatus::query()->when($request->string('search')->isNotEmpty(), fn ($query) => $query->where('name', 'like', '%'.$request->string('search')->toString().'%'))->orderBy('sort_order')->orderBy('name')->paginate(10)->withQueryString(), 'filters' => $request->only('search')]); }

    /** Show the laptop status creation page. */
    public function create(): Response { return Inertia::render('master-data/laptop-statuses/create'); }

    /** Store a newly created laptop status. */
    public function store(Request $request): RedirectResponse { $data = $this->validated($request); LaptopStatus::query()->create([...$data, 'slug' => Str::slug($data['name'])]); Inertia::flash('toast', ['type' => 'success', 'message' => 'Status laptop berhasil ditambahkan.']); return to_route('master-data.laptop-statuses.index'); }

    /** Show the laptop status edit page. */
    public function edit(LaptopStatus $laptopStatus): Response { return Inertia::render('master-data/laptop-statuses/edit', ['laptopStatus' => $laptopStatus]); }

    /** Update the selected laptop status. */
    public function update(Request $request, LaptopStatus $laptopStatus): RedirectResponse { $data = $this->validated($request); $laptopStatus->update([...$data, 'slug' => Str::slug($data['name'])]); Inertia::flash('toast', ['type' => 'success', 'message' => 'Status laptop berhasil diperbarui.']); return to_route('master-data.laptop-statuses.index'); }

    /** Delete the selected laptop status. */
    public function destroy(LaptopStatus $laptopStatus): RedirectResponse { $laptopStatus->delete(); Inertia::flash('toast', ['type' => 'success', 'message' => 'Status laptop berhasil dihapus.']); return to_route('master-data.laptop-statuses.index'); }

    /** @return array<string, mixed> */
    private function validated(Request $request): array { return $request->validate(['name' => ['required', 'string', 'max:255'], 'is_active' => ['required', 'boolean'], 'description' => ['nullable', 'string'], 'color' => ['nullable', 'string', 'max:255']]); }
}
