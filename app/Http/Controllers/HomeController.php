<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\Laptop;
use App\Models\LaptopSpecification;
use App\Models\LaptopStatus;
use App\Models\Testimonial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $tersediaStatus = LaptopStatus::query()->where('slug', 'tersedia')->first();

        $laptops = Laptop::query()
            ->with(['status', 'source', 'brand', 'specification', 'photos'])
            ->when($tersediaStatus, fn ($q) => $q->where('laptop_status_id', $tersediaStatus->id))
            ->latest('id')
            ->take(8)
            ->get();

        // Brand chips untuk quick filter di home. Ambil brand yang punya
        // laptop tersedia — supaya user tidak klik brand kosong.
        $brandIds = Laptop::query()
            ->when($tersediaStatus, fn ($q) => $q->where('laptop_status_id', $tersediaStatus->id))
            ->whereNotNull('brand_id')
            ->distinct()
            ->pluck('brand_id');

        $brands = Brand::query()
            ->whereIn('id', $brandIds)
            ->orderBy('name')
            ->take(8)
            ->get(['id', 'name', 'slug']);

        $testimonials = Testimonial::query()
            ->active()
            ->ordered()
            ->take(6)
            ->get();

        return Inertia::render('welcome', [
            'laptops' => $laptops,
            'brands' => $brands,
            'testimonials' => $testimonials,
        ]);
    }

    public function laptopCatalog(Request $request): Response
    {
        $tersediaStatus = LaptopStatus::query()->where('slug', 'tersedia')->first();
        $selectedBrandSlugs = collect($request->input('brands', []))
            ->filter()
            ->values()
            ->all();
        $selectedRam = $request->string('ram')->toString();
        $selectedStorage = $request->string('storage')->toString();
        $maxPrice = $request->integer('max_price') ?: null;

        $laptops = Laptop::query()
            ->with(['status', 'source', 'brand', 'specification', 'photos'])
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
            ->when($selectedRam !== '', fn ($query) => $query->whereHas('specification', fn ($query) => $query->where('ram', 'like', "%{$selectedRam}%")))
            ->when($selectedStorage !== '', fn ($query) => $query->whereHas('specification', fn ($query) => $query->where('storage', 'like', "%{$selectedStorage}%")))
            ->when($maxPrice, fn ($query) => $query->where('selling_price', '<=', $maxPrice))
            ->when($request->string('sort')->toString() === 'price_asc', fn ($query) => $query->orderBy('selling_price'))
            ->when($request->string('sort')->toString() === 'price_desc', fn ($query) => $query->orderByDesc('selling_price'))
            ->when($request->string('sort')->toString() === 'name_asc', fn ($query) => $query->orderBy('model'))
            ->when(! in_array($request->string('sort')->toString(), ['price_asc', 'price_desc', 'name_asc'], true), fn ($query) => $query->latest('id'))
            ->paginate(9)
            ->withQueryString();

        // Opsi filter jarang berubah (brand tersedia, harga max, varian
        // RAM/storage) — cache 10 menit agar tiap page-view katalog tidak
        // mengulang 4 query referensi. Invalidasi otomatis via TTL; pola
        // sama seperti WebsiteSetting::current() (Cache::forever + saved).
        $filterOptions = Cache::remember('catalog.laptop_filter_options', 600, function () use ($tersediaStatus): array {
            $availableBrandIds = Laptop::query()
                ->when($tersediaStatus, fn ($query) => $query->where('laptop_status_id', $tersediaStatus->id))
                ->whereNotNull('brand_id')
                ->distinct()
                ->pluck('brand_id');

            $maxAvailablePrice = Laptop::query()
                ->when($tersediaStatus, fn ($query) => $query->where('laptop_status_id', $tersediaStatus->id))
                ->max('selling_price');

            return [
                'brands' => Brand::query()
                    ->whereIn('id', $availableBrandIds)
                    ->orderBy('name')
                    ->get(['id', 'name', 'slug']),
                'ram' => LaptopSpecification::query()->whereNotNull('ram')->distinct()->orderBy('ram')->pluck('ram')->take(8)->values(),
                'storage' => LaptopSpecification::query()->whereNotNull('storage')->distinct()->orderBy('storage')->pluck('storage')->take(8)->values(),
                'max_price' => (int) ceil((($maxAvailablePrice ?? 50000000) / 1000000)) * 1000000,
            ];
        });

        return Inertia::render('public/laptop-catalog', [
            'laptops' => $laptops,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'brands' => $selectedBrandSlugs,
                'ram' => $selectedRam,
                'storage' => $selectedStorage,
                'max_price' => $maxPrice,
                'sort' => $request->string('sort')->toString() ?: 'newest',
            ],
            'filter_options' => $filterOptions,
        ]);
    }

    /**
     * Detail laptop publik by slug (/shop/macbook-pro-m3-14).
     *
     * Kompatibilitas: URL lama berbasis ID (/shop/6) tidak dimatikan,
     * melainkan redirect 301 permanen ke URL slug agar link yang pernah
     * dibagikan dan indeks Google lama tetap valid.
     */
    public function laptopShow(string $laptop): Response|RedirectResponse
    {
        $model = ctype_digit($laptop)
            ? Laptop::query()->find($laptop)
            : Laptop::query()->where('slug', $laptop)->first();

        abort_if(! $model, 404);

        $tersediaStatus = LaptopStatus::query()->where('slug', 'tersedia')->first();

        abort_unless(
            $tersediaStatus && $model->laptop_status_id === $tersediaStatus->id,
            404,
        );

        // URL ID lama → redirect permanen ke URL slug kanonis.
        // Dicek setelah guard status agar tidak ada redirect chain ke 404.
        if (ctype_digit($laptop) && $model->slug) {
            return to_route('laptops.public.show', ['laptop' => $model->slug], 301);
        }

        $laptop = $model;

        $laptop->load(['status', 'source', 'brand', 'specification', 'photos']);

        $related = Laptop::query()
            ->with(['status', 'brand', 'specification', 'photos'])
            ->when($tersediaStatus, fn ($q) => $q->where('laptop_status_id', $tersediaStatus->id))
            ->when($laptop->brand_id, fn ($q) => $q->where('brand_id', $laptop->brand_id))
            ->where('id', '!=', $laptop->id)
            ->latest('id')
            ->take(3)
            ->get();

        return Inertia::render('public/laptop-detail', [
            'laptop' => $laptop,
            'related' => $related,
        ]);
    }
}
