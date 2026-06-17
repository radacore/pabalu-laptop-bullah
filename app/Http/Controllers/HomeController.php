<?php

namespace App\Http\Controllers;

use App\Models\Laptop;
use App\Models\LaptopSpecification;
use App\Models\LaptopStatus;
use App\Models\Testimonial;
use App\Models\WebsiteSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $tersediaStatus = LaptopStatus::query()->where('slug', 'tersedia')->first();

        $laptops = Laptop::query()
            ->with(['status', 'source', 'specification', 'photos'])
            ->when($tersediaStatus, fn ($q) => $q->where('laptop_status_id', $tersediaStatus->id))
            ->latest('id')
            ->take(4)
            ->get();

        $testimonials = Testimonial::query()
            ->active()
            ->ordered()
            ->take(6)
            ->get();

        return Inertia::render('welcome', [
            'laptops' => $laptops,
            'testimonials' => $testimonials,
            'website' => WebsiteSetting::current(),
        ]);
    }

    public function laptopCatalog(Request $request): Response
    {
        $tersediaStatus = LaptopStatus::query()->where('slug', 'tersedia')->first();
        $selectedBrands = collect($request->input('brands', []))
            ->filter()
            ->values()
            ->all();
        $selectedRam = $request->string('ram')->toString();
        $selectedStorage = $request->string('storage')->toString();
        $maxPrice = $request->integer('max_price') ?: null;

        $laptops = Laptop::query()
            ->with(['status', 'source', 'specification', 'photos'])
            ->when($tersediaStatus, fn ($query) => $query->where('laptop_status_id', $tersediaStatus->id))
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('brand', 'like', "%{$search}%")
                        ->orWhere('model', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($selectedBrands !== [], fn ($query) => $query->whereIn('brand', $selectedBrands))
            ->when($selectedRam !== '', fn ($query) => $query->whereHas('specification', fn ($query) => $query->where('ram', 'like', "%{$selectedRam}%")))
            ->when($selectedStorage !== '', fn ($query) => $query->whereHas('specification', fn ($query) => $query->where('storage', 'like', "%{$selectedStorage}%")))
            ->when($maxPrice, fn ($query) => $query->where('selling_price', '<=', $maxPrice))
            ->when($request->string('sort')->toString() === 'price_asc', fn ($query) => $query->orderBy('selling_price'))
            ->when($request->string('sort')->toString() === 'price_desc', fn ($query) => $query->orderByDesc('selling_price'))
            ->when($request->string('sort')->toString() === 'name_asc', fn ($query) => $query->orderBy('brand')->orderBy('model'))
            ->when(! in_array($request->string('sort')->toString(), ['price_asc', 'price_desc', 'name_asc'], true), fn ($query) => $query->latest('id'))
            ->paginate(9)
            ->withQueryString();

        $availableLaptopQuery = Laptop::query()
            ->when($tersediaStatus, fn ($query) => $query->where('laptop_status_id', $tersediaStatus->id));

        return Inertia::render('public/laptop-catalog', [
            'laptops' => $laptops,
            'filters' => [
                'search' => $request->string('search')->toString(),
                'brands' => $selectedBrands,
                'ram' => $selectedRam,
                'storage' => $selectedStorage,
                'max_price' => $maxPrice,
                'sort' => $request->string('sort')->toString() ?: 'newest',
            ],
            'filter_options' => [
                'brands' => (clone $availableLaptopQuery)->select('brand')->distinct()->orderBy('brand')->pluck('brand'),
                'ram' => LaptopSpecification::query()->whereNotNull('ram')->distinct()->orderBy('ram')->pluck('ram')->take(8)->values(),
                'storage' => LaptopSpecification::query()->whereNotNull('storage')->distinct()->orderBy('storage')->pluck('storage')->take(8)->values(),
                'max_price' => (int) ceil(((clone $availableLaptopQuery)->max('selling_price') ?? 50000000) / 1000000) * 1000000,
            ],
            'website' => WebsiteSetting::current(),
        ]);
    }

    public function laptopShow(Laptop $laptop): Response
    {
        $laptop->load(['status', 'source', 'specification', 'photos']);

        $related = Laptop::query()
            ->with(['status', 'specification', 'photos'])
            ->where('brand', $laptop->brand)
            ->where('id', '!=', $laptop->id)
            ->latest('id')
            ->take(3)
            ->get();

        return Inertia::render('public/laptop-detail', [
            'laptop' => $laptop,
            'related' => $related,
            'website' => WebsiteSetting::current(),
        ]);
    }
}
