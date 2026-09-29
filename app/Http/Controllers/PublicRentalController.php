<?php

namespace App\Http\Controllers;

use App\Http\Resources\PublicRentalTrackingResource;
use App\Models\Brand;
use App\Models\Laptop;
use App\Models\LaptopStatus;
use App\Models\Rental;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class PublicRentalController extends Controller
{
    /**
     * Katalog sewa: hanya unit is_rentable + status tersedia.
     */
    public function catalog(Request $request): Response
    {
        $tersediaStatus = LaptopStatus::query()->where('slug', 'tersedia')->first();
        $selectedBrandSlugs = collect($request->input('brands', []))
            ->filter()
            ->values()
            ->all();
        $maxRate = $request->integer('max_rate') ?: null;

        $laptops = Laptop::query()
            ->with(['status', 'source', 'brand', 'specification', 'photos'])
            ->where('is_rentable', true)
            ->when($tersediaStatus, fn ($query) => $query->where('laptop_status_id', $tersediaStatus->id))
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('model', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhereHas('brand', fn ($q) => $q->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($selectedBrandSlugs !== [], fn ($query) => $query->whereHas('brand', fn ($q) => $q->whereIn('slug', $selectedBrandSlugs)))
            ->when($maxRate, fn ($query) => $query->where('daily_rate', '<=', $maxRate))
            ->when($request->string('sort')->toString() === 'rate_asc', fn ($query) => $query->orderBy('daily_rate'))
            ->when($request->string('sort')->toString() === 'rate_desc', fn ($query) => $query->orderByDesc('daily_rate'))
            ->when(! in_array($request->string('sort')->toString(), ['rate_asc', 'rate_desc'], true), fn ($query) => $query->latest('id'))
            ->paginate(9)
            ->withQueryString();

        $filterOptions = Cache::remember('catalog.rental_filter_options', 600, function () use ($tersediaStatus): array {
            $availableBrandIds = Laptop::query()
                ->where('is_rentable', true)
                ->when($tersediaStatus, fn ($query) => $query->where('laptop_status_id', $tersediaStatus->id))
                ->whereNotNull('brand_id')
                ->distinct()
                ->pluck('brand_id');

            $maxAvailableRate = Laptop::query()
                ->where('is_rentable', true)
                ->when($tersediaStatus, fn ($query) => $query->where('laptop_status_id', $tersediaStatus->id))
                ->max('daily_rate');

            // Array polos — jangan cache Collection (Incomplete di store
            // database, lihat DashboardController).
            return [
                'brands' => Brand::query()
                    ->whereIn('id', $availableBrandIds)
                    ->orderBy('name')
                    ->get(['id', 'name', 'slug'])
                    ->toArray(),
                'max_rate' => (int) ceil((($maxAvailableRate ?? 500000) / 50000)) * 50000,
            ];
        });

        return Inertia::render('public/rental-catalog', [
            'laptops' => $laptops,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'brands' => $selectedBrandSlugs,
                'max_rate' => $maxRate,
                'sort' => $request->string('sort')->toString() ?: 'newest',
            ],
            'filter_options' => $filterOptions,
        ]);
    }

    /**
     * Detail sewa by slug (fallback ID dengan redirect 301).
     */
    public function show(string $laptop): Response|RedirectResponse
    {
        $model = ctype_digit($laptop)
            ? Laptop::query()->find($laptop)
            : Laptop::query()->where('slug', $laptop)->first();

        abort_if(! $model, 404);

        $tersediaStatus = LaptopStatus::query()->where('slug', 'tersedia')->first();

        abort_unless(
            $tersediaStatus
                && $model->laptop_status_id === $tersediaStatus->id
                && (bool) $model->is_rentable,
            404,
        );

        if (ctype_digit($laptop) && $model->slug) {
            return to_route('rentals.public.show', ['laptop' => $model->slug], 301);
        }

        $laptop = $model;
        $laptop->load(['status', 'source', 'brand', 'specification', 'photos']);

        $related = Laptop::query()
            ->with(['status', 'brand', 'specification', 'photos'])
            ->where('is_rentable', true)
            ->when($tersediaStatus, fn ($q) => $q->where('laptop_status_id', $tersediaStatus->id))
            ->when($laptop->brand_id, fn ($q) => $q->where('brand_id', $laptop->brand_id))
            ->where('id', '!=', $laptop->id)
            ->latest('id')
            ->take(3)
            ->get();

        return Inertia::render('public/rental-detail', [
            'laptop' => $laptop,
            'related' => $related,
        ]);
    }

    /**
     * Public tracking landing page (no code entered yet).
     */
    public function trackLanding(): Response
    {
        return Inertia::render('rentals/tracking');
    }

    /**
     * Public tracking endpoint — HANYA menerima tracking_code random.
     */
    public function track(string $trackingCode): Response
    {
        $rental = Rental::query()
            ->where('tracking_code', $trackingCode)
            ->with(['status', 'laptop.brand'])
            ->first();

        if (! $rental) {
            return Inertia::render('rentals/tracking', [
                'error' => 'Tiket sewa dengan kode tersebut tidak ditemukan. Periksa kembali kode Anda.',
                'tracking_code' => $trackingCode,
            ]);
        }

        return Inertia::render('rentals/tracking', [
            'rental' => (new PublicRentalTrackingResource($rental))->resolve(),
            'tracking_code' => $trackingCode,
        ]);
    }
}
