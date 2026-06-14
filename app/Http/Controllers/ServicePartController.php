<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServicePart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServicePartController extends Controller
{
    /**
     * Store a spare part used by the selected service.
     */
    public function store(Request $request, Service $service): RedirectResponse
    {
        $validated = $request->validate([
            'part_name' => ['required', 'string', 'max:255'],
            'sparepart_type_id' => ['nullable', 'exists:sparepart_types,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'installation_fee' => ['nullable', 'numeric', 'min:0'],
            'note' => ['nullable', 'string'],
        ]);

        $service->parts()->create([
            'part_name' => $validated['part_name'],
            'sparepart_type_id' => $validated['sparepart_type_id'] ?? null,
            'quantity' => $validated['quantity'],
            'cost_price' => $validated['cost_price'] ?? 0,
            'selling_price' => $validated['unit_price'],
            'installation_fee' => $validated['installation_fee'] ?? 0,
            'note' => $validated['note'] ?? null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sparepart berhasil ditambahkan.']);

        return back();
    }

    /**
     * Delete a spare part from the selected service.
     */
    public function destroy(Service $service, ServicePart $part): RedirectResponse
    {
        abort_unless($part->service_id === $service->id, 404);

        $part->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sparepart berhasil dihapus.']);

        return back();
    }
}
