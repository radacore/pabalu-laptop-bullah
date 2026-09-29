<?php

use App\Models\Brand;
use App\Models\Customer;
use App\Models\Laptop;
use App\Models\LaptopStatus;
use App\Models\Rental;
use App\Models\RentalStatus;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function publicRentalBrand(): Brand
{
    return Brand::query()->firstOrCreate(
        ['slug' => 'public-rental-brand'],
        ['name' => 'PublicRental', 'is_active' => true, 'sort_order' => 0],
    );
}

function publicLaptopStatus(string $slug, string $name): LaptopStatus
{
    return LaptopStatus::query()->firstOrCreate(
        ['slug' => $slug],
        ['name' => $name, 'is_active' => true, 'sort_order' => 0],
    );
}

function publicRentalLaptop(array $overrides = []): Laptop
{
    $admin = User::factory()->create(['role' => 'admin']);

    return Laptop::query()->create([
        'sku' => fake()->unique()->bothify('PBL-########-####'),
        'name' => 'Unit Sewa Publik',
        'brand_id' => publicRentalBrand()->id,
        'model' => 'Public Model',
        'purchase_date' => '2026-01-01',
        'cost_price' => 5000000,
        'selling_price' => 7000000,
        'laptop_status_id' => publicLaptopStatus('tersedia', 'Tersedia')->id,
        'is_rentable' => true,
        'daily_rate' => 100000,
        'created_by' => $admin->id,
        ...$overrides,
    ]);
}

function publicRental(array $overrides = []): Rental
{
    $admin = User::factory()->create(['role' => 'admin']);
    $status = RentalStatus::query()->firstOrCreate(
        ['slug' => 'aktif-disewa'],
        ['name' => 'Aktif Disewa', 'is_active' => true, 'sort_order' => 0],
    );

    return Rental::query()->create([
        'rental_code' => 'RNT-'.now()->format('Ymd').'-'.fake()->unique()->numerify('######'),
        'customer_id' => Customer::query()->create([
            'user_id' => null,
            'name' => 'Rahasia Penyewa',
            'phone' => fake()->unique()->numerify('08##########'),
        ])->id,
        'laptop_id' => publicRentalLaptop()->id,
        'rental_status_id' => $status->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'daily_rate' => 100000,
        'rented_at' => now(),
        'due_at' => now()->addDays(7),
        'created_by' => $admin->id,
        ...$overrides,
    ]);
}

test('rental catalog lists only rentable and available laptops', function () {
    $rentable = publicRentalLaptop();
    $notRentable = publicRentalLaptop(['is_rentable' => false]);
    $sold = publicRentalLaptop([
        'laptop_status_id' => publicLaptopStatus('terjual', 'Terjual')->id,
    ]);

    $response = $this->get(route('rentals.catalog'));

    $response->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('public/rental-catalog')
        ->has('laptops')
    );

    $ids = collect($response->viewData('page')['props']['laptops']['data'] ?? [])
        ->pluck('id')
        ->all();

    expect($ids)->toContain($rentable->id)
        ->and($ids)->not->toContain($notRentable->id)
        ->and($ids)->not->toContain($sold->id);
});

test('rental detail resolves by slug', function () {
    $laptop = publicRentalLaptop();

    $this->get('/sewa/'.$laptop->slug)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/rental-detail')
            ->where('laptop.id', $laptop->id)
        );
});

test('rental detail legacy id redirects to slug', function () {
    $laptop = publicRentalLaptop();

    $this->get('/sewa/'.$laptop->id)
        ->assertStatus(301)
        ->assertRedirect('/sewa/'.$laptop->slug);
});

test('rental detail rejects non-rentable laptop', function () {
    $laptop = publicRentalLaptop(['is_rentable' => false]);

    $this->get('/sewa/'.$laptop->slug)->assertNotFound();
});

test('rental tracking returns data without customer pii', function () {
    $rental = publicRental();

    $this->get(route('rentals.track', $rental->tracking_code))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('rentals/tracking')
            ->has('rental')
            ->where('rental.rental_code', $rental->rental_code)
            ->missing('rental.customer')
            ->missing('rental.customer_id')
        )
        ->assertDontSee('Rahasia Penyewa');
});

test('rental tracking with invalid code returns error prop', function () {
    $this->get(route('rentals.track', 'kode-salah-123'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('rentals/tracking')
            ->has('error')
            ->missing('rental')
        );
});
