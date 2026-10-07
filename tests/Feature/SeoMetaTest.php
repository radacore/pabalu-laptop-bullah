<?php

use App\Models\Brand;
use App\Models\Customer;
use App\Models\Laptop;
use App\Models\LaptopPhoto;
use App\Models\LaptopStatus;
use App\Models\Rental;
use App\Models\RentalStatus;
use App\Models\Service;
use App\Models\ServiceStatus;
use App\Models\Sparepart;
use App\Models\SparepartType;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function seoBrand(): Brand
{
    return Brand::query()->firstOrCreate(
        ['slug' => 'seo-brand'],
        ['name' => 'SeoBrand', 'is_active' => true, 'sort_order' => 0],
    );
}

function seoLaptopStatus(string $slug, string $name): LaptopStatus
{
    return LaptopStatus::query()->firstOrCreate(
        ['slug' => $slug],
        ['name' => $name, 'is_active' => true, 'sort_order' => 0],
    );
}

function seoLaptop(array $overrides = []): Laptop
{
    return Laptop::query()->create([
        'sku' => fake()->unique()->bothify('PBL-########-####'),
        'name' => 'Seo Laptop Pro 14',
        'brand_id' => seoBrand()->id,
        'model' => 'Seo Model',
        'purchase_date' => '2026-01-01',
        'cost_price' => 5000000,
        'selling_price' => 7500000,
        'laptop_status_id' => seoLaptopStatus('tersedia', 'Tersedia')->id,
        'is_rentable' => true,
        'daily_rate' => 100000,
        'created_by' => User::factory()->create(['role' => 'admin'])->id,
        ...$overrides,
    ]);
}

function seoSparepart(): Sparepart
{
    $type = SparepartType::query()->firstOrCreate(
        ['slug' => 'seo-layar'],
        ['name' => 'Layar SEO', 'is_active' => true, 'sort_order' => 0],
    );

    return Sparepart::query()->create([
        'sku' => fake()->unique()->bothify('SPR-########-####'),
        'name' => 'Layar SEO 14 inch IPS',
        'sparepart_type_id' => $type->id,
        'condition' => 'bekas',
        'stock' => 5,
        'cost_price' => 500000,
        'selling_price' => 750000,
        'is_active' => true,
        'created_by' => User::factory()->create(['role' => 'admin'])->id,
    ]);
}

function seoCustomer(): Customer
{
    return Customer::query()->create([
        'user_id' => null,
        'name' => 'Seo Pelanggan',
        'phone' => fake()->unique()->numerify('08##########'),
    ]);
}

function seoService(): Service
{
    $status = ServiceStatus::query()->firstOrCreate(
        ['slug' => 'diterima'],
        ['name' => 'Diterima', 'is_active' => true, 'sort_order' => 0],
    );

    return Service::query()->create([
        'service_code' => 'SRV-'.now()->format('Ymd').'-'.fake()->unique()->numerify('######'),
        'customer_id' => seoCustomer()->id,
        'device_name' => 'Seo Device',
        'complaint' => 'Mati total',
        'service_status_id' => $status->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'payment_status' => 'unpaid',
        'received_at' => now(),
        'created_by' => User::factory()->create(['role' => 'admin'])->id,
    ]);
}

function seoRental(): Rental
{
    $status = RentalStatus::query()->firstOrCreate(
        ['slug' => 'aktif-disewa'],
        ['name' => 'Aktif Disewa', 'is_active' => true, 'sort_order' => 0],
    );

    return Rental::query()->create([
        'rental_code' => 'RNT-'.now()->format('Ymd').'-'.fake()->unique()->numerify('######'),
        'customer_id' => seoCustomer()->id,
        'laptop_id' => seoLaptop()->id,
        'rental_status_id' => $status->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'daily_rate' => 100000,
        'rented_at' => now(),
        'due_at' => now()->addDays(7),
        'created_by' => User::factory()->create(['role' => 'admin'])->id,
    ]);
}

test('home exposes per-page seo prop', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->has('seo')
            ->where('seo.title', 'Pabalu Laptop | Laptop & Servis Terpercaya')
            ->has('seo.description')
            ->has('seo.json_ld')
        );
});

test('html lang follows app locale', function () {
    app()->setLocale('id');

    $this->get(route('home'))
        ->assertOk()
        ->assertSee('<html lang="id"', false);
});

test('laptop detail exposes product seo with json-ld', function () {
    $laptop = seoLaptop();

    LaptopPhoto::query()->create([
        'laptop_id' => $laptop->id,
        'file_path' => 'laptops/seo-unit.jpg',
        'caption' => 'Foto unit SEO',
        'sort_order' => 0,
    ]);

    $response = $this->get(route('laptops.public.show', $laptop->slug));

    $imageUrl = rtrim(config('app.url'), '/').'/storage/laptops/seo-unit.jpg';

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/laptop-detail')
            ->where('seo.title', 'Seo Laptop Pro 14 - Pabalu Laptop')
            ->where('seo.og_type', 'product')
            ->where('seo.image', $imageUrl)
            ->has('seo.json_ld')
        )
        ->assertSee('application/ld+json', false)
        ->assertSee('"@type":"Product"', false)
        ->assertSee('Rp 7.500.000', false)
        ->assertSee('<meta property="og:image" content="'.$imageUrl.'">', false);
});

test('rental detail title marks sewa variant', function () {
    $laptop = seoLaptop();

    $this->get(route('rentals.public.show', $laptop->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/rental-detail')
            ->where('seo.title', 'Seo Laptop Pro 14 (Sewa) - Pabalu Laptop')
        );
});

test('sparepart detail exposes used-condition json-ld', function () {
    $sparepart = seoSparepart();

    $this->get(route('spareparts.public.show', $sparepart->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/sparepart-detail')
            ->where('seo.og_type', 'product')
            ->has('seo.json_ld')
        )
        ->assertSee('UsedCondition', false);
});

test('catalog pages expose seo props', function () {
    $this->get(route('laptops.catalog'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.title', 'Katalog Laptop - Pabalu Laptop')
        );

    $this->get(route('rentals.catalog'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.title', 'Sewa Laptop - Pabalu Laptop')
        );

    $this->get(route('spareparts.catalog'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.title', 'Sparepart - Pabalu Laptop')
        );
});

test('tracking result pages are noindex while landing pages are indexable', function () {
    $service = seoService();
    $rental = seoRental();

    $this->get(route('services.track.landing'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.robots', null)
        );

    $this->get(route('services.track', $service->tracking_code))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.robots', 'noindex, nofollow')
        )
        ->assertSee('<meta name="robots" content="noindex, nofollow">', false);

    $this->get(route('rentals.track', $rental->tracking_code))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.robots', 'noindex, nofollow')
        );
});

test('sitemap lists available laptop detail urls', function () {
    $laptop = seoLaptop();

    $this->get(route('seo.sitemap'))
        ->assertOk()
        ->assertSee('/shop/'.$laptop->slug, false);
});
