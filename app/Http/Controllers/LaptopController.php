<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLaptopRequest;
use App\Http\Requests\UpdateLaptopRequest;
use App\Models\Brand;
use App\Models\Laptop;
use App\Models\LaptopSource;
use App\Models\LaptopStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LaptopController extends Controller
{
    /**
     * Display a paginated laptop listing.
     */
    public function index(Request $request): Response
    {
        $laptops = Laptop::query()
            ->with(['source', 'status', 'creator', 'specification', 'brand'])
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhereHas('brand', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%");
                        })
                        ->orWhere('model', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('brand_id'), fn ($query) => $query->where('brand_id', $request->integer('brand_id')))
            ->when($request->filled('laptop_status_id'), fn ($query) => $query->where('laptop_status_id', $request->integer('laptop_status_id')))
            ->when($request->filled('laptop_source_id'), fn ($query) => $query->where('laptop_source_id', $request->integer('laptop_source_id')))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('laptops/index', [
            'laptops' => $laptops,
            'filters' => $request->only(['search', 'brand_id', 'laptop_status_id', 'laptop_source_id']),
            'brands' => Brand::query()->where('is_active', true)->orderBy('sort_order')->orderBy('name')->get(),
            'sources' => LaptopSource::query()->orderBy('sort_order')->orderBy('name')->get(),
            'statuses' => LaptopStatus::query()->orderBy('sort_order')->orderBy('name')->get(),
        ]);
    }

    /**
     * Show the laptop creation page.
     */
    public function create(): Response
    {
        return Inertia::render('laptops/create', $this->formOptions());
    }

    /**
     * Store a newly created laptop.
     */
    public function store(StoreLaptopRequest $request): RedirectResponse
    {
        $data = $request->safe()->except(['specification', 'laptop_status_id', 'brand']);
        $data['created_by'] = Auth::id();
        $data['laptop_status_id'] = $request->input('laptop_status_id')
            ?? $this->defaultStatusId();

        // Map brand_id from form input
        if ($request->has('brand_id')) {
            $data['brand_id'] = $request->input('brand_id');
        }

        DB::transaction(function () use ($data, $request): void {
            $laptop = Laptop::query()->create($data);
            $this->syncSpecification($laptop, $request->validated('specification', []));
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Laptop berhasil ditambahkan.']);

        return to_route('laptops.index');
    }

    /**
     * Display the selected laptop.
     */
    public function show(Laptop $laptop): Response
    {
        return Inertia::render('laptops/show', [
            'laptop' => $laptop->load(['specification', 'photos', 'source', 'status', 'creator', 'brand']),
        ]);
    }

    /**
     * Show the laptop edit page.
     */
    public function edit(Laptop $laptop): Response
    {
        return Inertia::render('laptops/edit', [
            'laptop' => $laptop->load('specification'),
            ...$this->formOptions(),
        ]);
    }

    /**
     * Update the selected laptop.
     */
    public function update(UpdateLaptopRequest $request, Laptop $laptop): RedirectResponse
    {
        DB::transaction(function () use ($request, $laptop): void {
            $data = $request->safe()->except(['specification', 'brand']);
            $laptop->update($data);
            $this->syncSpecification($laptop, $request->validated('specification', []));
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Laptop berhasil diperbarui.']);

        return to_route('laptops.index');
    }

    /**
     * Delete the selected laptop.
     */
    public function destroy(Laptop $laptop): RedirectResponse
    {
        $laptop->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Laptop berhasil dihapus.']);

        return to_route('laptops.index');
    }

    /**
     * Get shared laptop form options.
     *
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'brands' => Brand::query()->orderBy('sort_order')->orderBy('name')->get(),
            'sources' => LaptopSource::query()->orderBy('sort_order')->orderBy('name')->get(),
            'statuses' => LaptopStatus::query()->orderBy('sort_order')->orderBy('name')->get(),
        ];
    }

    /**
     * Pick a sensible default laptop status (the first "Tersedia" status, or the first in sort order).
     */
    private function defaultStatusId(): ?int
    {
        $tersedia = LaptopStatus::query()
            ->where('slug', 'tersedia')
            ->orderBy('sort_order')
            ->first();

        if ($tersedia) {
            return $tersedia->id;
        }

        return LaptopStatus::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->value('id');
    }

    /**
     * Update or create a laptop specification when any specification field is provided.
     *
     * @param  array<string, mixed>  $specification
     */
    private function syncSpecification(Laptop $laptop, array $specification): void
    {
        $specification = array_filter($specification, fn ($value) => filled($value));

        if ($specification !== []) {
            $laptop->specification()->updateOrCreate([], $specification);
        } elseif ($laptop->specification) {
            $laptop->specification()->delete();
        }
    }
}
