<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\ServiceStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ServiceUpdateController extends Controller
{
    /**
     * Store a manual service update and move the service status.
     */
    public function store(Request $request, Service $service): RedirectResponse
    {
        $validated = $request->validate([
            'description' => ['required', 'string'],
            'status_to' => ['required', 'exists:service_statuses,id'],
        ]);

        $oldStatus = $service->status?->name;
        $newStatus = ServiceStatus::query()->findOrFail($validated['status_to']);

        DB::transaction(function () use ($service, $newStatus, $validated, $oldStatus): void {
            $service->updates()->create([
                'old_status' => $oldStatus,
                'new_status' => $newStatus->name,
                'note' => $validated['description'],
                'created_by' => Auth::id(),
                'created_at' => now(),
            ]);

            $service->update(['service_status_id' => $newStatus->id]);

            $this->autoCreateServiceIncome($service, $newStatus);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Update servis berhasil ditambahkan.']);

        return back();
    }

    /**
     * Auto-create income transaction when service reaches completion status.
     *
     * Mendelegasikan ke Service::syncIncomeJournal() agar perilaku kedua
     * jalur selesai (form edit + timeline update) identik: koreksi nominal
     * tersinkron, buka-ulang menghapus jurnal.
     */
    private function autoCreateServiceIncome(Service $service, ServiceStatus $newStatus): void
    {
        $service->syncIncomeJournal(
            $newStatus->slug,
            in_array($newStatus->slug, Service::completionSlugs(), true),
        );
    }
}
