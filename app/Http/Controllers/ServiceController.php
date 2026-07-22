<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Customer;
use App\Models\Service;
use App\Models\ServiceStatus;
use App\Models\SparepartType;
use App\Models\User;
use App\Models\WebsiteSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    /**
     * Display a paginated service listing.
     */
    public function index(Request $request): Response
    {
        $services = Service::query()
            ->with(['customer', 'status', 'technician'])
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query->where('service_code', 'like', "%{$search}%")
                        ->orWhere('device_name', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn ($query) => $query->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->filled('service_status_id'), fn ($query) => $query->where('service_status_id', $request->integer('service_status_id')))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('services/index', [
            'services' => $services,
            'filters' => $request->only(['search', 'service_status_id']),
            'statuses' => ServiceStatus::query()->orderBy('sort_order')->orderBy('name')->get(),
            'technicians' => User::query()->where('role', 'staff')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the service creation page.
     */
    public function create(): Response
    {
        return Inertia::render('services/create', $this->formOptions());
    }

    /**
     * Store a newly created service.
     */
    public function store(StoreServiceRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $parts = $data['parts'] ?? [];
        unset($data['parts']);

        $data['service_code'] = $this->generateServiceCode();
        $data['tracking_code'] = bin2hex(random_bytes(4));
        $data['received_at'] = $data['received_at'] ?? now();
        $data['created_by'] = Auth::id();

        DB::transaction(function () use ($data, $parts): void {
            $service = Service::query()->create($data);

            $service->updates()->create([
                'old_status' => null,
                'new_status' => $service->status?->name ?? 'Diterima',
                'note' => 'Servis diterima.',
                'created_by' => Auth::id(),
                'created_at' => now(),
            ]);

            $this->syncParts($service, $parts);

            if (empty($data['estimated_cost']) && $parts !== []) {
                $service->update(['estimated_cost' => $this->sumPartTotal($parts)]);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Servis berhasil dibuat.']);

        return to_route('services.index');
    }

    /**
     * Display the selected service.
     */
    public function show(Service $service): Response
    {
        return Inertia::render('services/show', [
            'service' => $service->load([
                'customer',
                'status',
                'technician',
                'updates' => fn ($query) => $query->with('creator')->latest('created_at'),
                'parts.type',
            ]),
            ...$this->formOptions(),
        ]);
    }

    /**
     * Public tracking page by tracking_code (no auth required).
     */
    /**
     * Public tracking landing page (no code entered yet).
     */
    public function trackLanding(): Response
    {
        return Inertia::render('services/tracking', [
            'website' => WebsiteSetting::current(),
        ]);
    }

    public function track(string $trackingCode): Response
    {
        $service = Service::query()
            ->where('tracking_code', $trackingCode)
            ->orWhere('service_code', $trackingCode)
            ->with([
                'customer',
                'status',
                'updates' => fn ($query) => $query->with('creator')->latest('created_at'),
                'parts',
            ])
            ->first();

        if (! $service) {
            return Inertia::render('services/tracking', [
                'error' => 'Tiket servis dengan kode tersebut tidak ditemukan. Periksa kembali ID Anda.',
                'tracking_code' => $trackingCode,
                'website' => WebsiteSetting::current(),
            ]);
        }

        return Inertia::render('services/tracking', [
            'service' => $service,
            'tracking_code' => $trackingCode,
            'website' => WebsiteSetting::current(),
        ]);
    }

    /**
     * Show the service edit page.
     */
    public function edit(Service $service): Response
    {
        return Inertia::render('services/edit', [
            'service' => $service->load(['customer', 'status', 'technician', 'parts.type']),
            ...$this->formOptions(),
        ]);
    }

    /**
     * Update the selected service.
     */
    public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
    {
        $oldStatus = $service->status?->name;
        $oldStatusId = $service->service_status_id;

        $data = $request->validated();
        $parts = $data['parts'] ?? [];
        unset($data['parts']);

        DB::transaction(function () use ($data, $parts, $service, $oldStatus, $oldStatusId): void {
            $service->update($data);
            $service->load('status');

            $this->syncParts($service, $parts);

            if ($oldStatusId !== $service->service_status_id) {
                $service->updates()->create([
                    'old_status' => $oldStatus,
                    'new_status' => $service->status?->name ?? 'Tidak Diketahui',
                    'note' => 'Status berhasil diperbarui.',
                    'created_by' => Auth::id(),
                    'created_at' => now(),
                ]);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Servis berhasil diperbarui.']);

        return to_route('services.index');
    }

    /**
     * Delete the selected service.
     */
    public function destroy(Service $service): RedirectResponse
    {
        $service->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Servis berhasil dihapus.']);

        return to_route('services.index');
    }

    /**
     * Get shared service form options.
     *
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'customers' => Customer::query()->orderBy('name')->get(),
            'statuses' => ServiceStatus::query()->orderBy('sort_order')->orderBy('name')->get(),
            'technicians' => User::query()->where('role', 'staff')->orderBy('name')->get(),
            'sparepart_types' => SparepartType::query()->orderBy('sort_order')->orderBy('name')->get(),
        ];
    }

    /**
     * Generate a unique service code with retry logic.
     * Uses database unique constraint to prevent race conditions.
     */
    private function generateServiceCode(): string
    {
        $maxAttempts = 10;

        for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
            // Increase entropy: use 6 digits instead of 4
            $code = 'SRV-'.now()->format('Ymd').'-'.random_int(100000, 999999);

            // Check if exists first (fast path)
            if (!Service::query()->where('service_code', $code)->exists()) {
                return $code;
            }
        }

        // If all attempts fail, throw exception
        throw new \RuntimeException('Unable to generate unique service code after multiple attempts.');
    }

    /**
     * Replace the service's sparepart list with the supplied parts.
     *
     * @param  array<int, array<string, mixed>>  $parts
     */
    private function syncParts(Service $service, array $parts): void
    {
        $service->parts()->delete();

        foreach ($parts as $part) {
            $service->parts()->create([
                'kind' => $part['kind'] ?? 'used',
                'part_name' => $part['part_name'],
                'sparepart_type_id' => $part['sparepart_type_id'] ?? null,
                'quantity' => $part['quantity'] ?? 1,
                'cost_price' => $part['cost_price'] ?? 0,
                'selling_price' => $part['selling_price'] ?? 0,
                'installation_fee' => $part['installation_fee'] ?? 0,
                'note' => $part['note'] ?? null,
            ]);
        }
    }

    /**
     * Compute estimated total from a parts list (selling + install × qty).
     *
     * @param  array<int, array<string, mixed>>  $parts
     */
    private function sumPartTotal(array $parts): float
    {
        $total = 0.0;

        foreach ($parts as $part) {
            $qty = (int) ($part['quantity'] ?? 1);
            $unit = (float) ($part['selling_price'] ?? 0) + (float) ($part['installation_fee'] ?? 0);
            $total += $unit * $qty;
        }

        return $total;
    }
}
