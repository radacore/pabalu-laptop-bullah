<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\ServiceStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ServiceStatusController extends Controller
{
    /** Display a paginated service status listing. */
    public function index(Request $request): Response { return Inertia::render('master-data/service-statuses/index', ['serviceStatuses' => ServiceStatus::query()->when($request->string('search')->isNotEmpty(), fn ($query) => $query->where('name', 'like', '%'.$request->string('search')->toString().'%'))->orderBy('sort_order')->orderBy('name')->paginate(10)->withQueryString(), 'filters' => $request->only('search')]); }

    /** Show the service status creation page. */
    public function create(): Response { return Inertia::render('master-data/service-statuses/create'); }

    /** Store a newly created service status. */
    public function store(Request $request): RedirectResponse { $data = $this->validated($request); ServiceStatus::query()->create([...$data, 'slug' => Str::slug($data['name'])]); Inertia::flash('toast', ['type' => 'success', 'message' => 'Status servis berhasil ditambahkan.']); return to_route('master-data.service-statuses.index'); }

    /** Show the service status edit page. */
    public function edit(ServiceStatus $serviceStatus): Response { return Inertia::render('master-data/service-statuses/edit', ['serviceStatus' => $serviceStatus]); }

    /** Update the selected service status. */
    public function update(Request $request, ServiceStatus $serviceStatus): RedirectResponse { $data = $this->validated($request); $serviceStatus->update([...$data, 'slug' => Str::slug($data['name'])]); Inertia::flash('toast', ['type' => 'success', 'message' => 'Status servis berhasil diperbarui.']); return to_route('master-data.service-statuses.index'); }

    /** Delete the selected service status. */
    public function destroy(ServiceStatus $serviceStatus): RedirectResponse { $serviceStatus->delete(); Inertia::flash('toast', ['type' => 'success', 'message' => 'Status servis berhasil dihapus.']); return to_route('master-data.service-statuses.index'); }

    /** @return array<string, mixed> */
    private function validated(Request $request): array { return $request->validate(['name' => ['required', 'string', 'max:255'], 'is_active' => ['required', 'boolean'], 'description' => ['nullable', 'string'], 'color' => ['nullable', 'string', 'max:255']]); }
}
