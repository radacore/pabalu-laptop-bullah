<?php

namespace App\Http\Controllers;

use App\Models\Laptop;
use App\Models\Testimonial;
use App\Models\WebsiteSetting;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $tersediaStatus = \App\Models\LaptopStatus::query()->where('slug', 'tersedia')->first();

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
