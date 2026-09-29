<?php

use App\Models\Brand;
use App\Models\Customer;
use App\Models\Laptop;
use App\Models\LaptopStatus;
use App\Models\Rental;
use App\Models\RentalStatus;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function rentalTestCustomer(): Customer
{
    return Customer::query()->create([
        'user_id' => null,
        'name' => 'Penyewa Test',
        'phone' => fake()->unique()->numerify('08##########'),
    ]);
}

function ensureRentalTestStatuses(): void
{
    foreach ([['tersedia', 'Tersedia'], ['disewa', 'Disewa']] as [$slug, $name]) {
        LaptopStatus::query()->firstOrCreate(
            ['slug' => $slug],
            ['name' => $name, 'is_active' => true, 'sort_order' => 0],
        );
    }
}

function rentalTestLaptop(int $userId): Laptop
{
    ensureRentalTestStatuses();
    $brand = Brand::query()->firstOrCreate(
        ['slug' => 'rental-crud-brand'],
        ['name' => 'RentalCrud', 'is_active' => true, 'sort_order' => 0],
    );
    $status = LaptopStatus::query()->firstOrCreate(
        ['slug' => 'tersedia'],
        ['name' => 'Tersedia', 'is_active' => true, 'sort_order' => 0],
    );

    return Laptop::query()->create([
        'sku' => fake()->unique()->bothify('PBL-########-####'),
        'name' => 'Unit Sewa Test',
        'brand_id' => $brand->id,
        'model' => 'Test Model',
        'purchase_date' => '2026-01-01',
        'cost_price' => 5000000,
        'selling_price' => 7000000,
        'laptop_status_id' => $status->id,
        'is_rentable' => true,
        'daily_rate' => 100000,
        'created_by' => $userId,
    ]);
}

function validRentalPayload(int $userId, array $overrides = []): array
{
    return [
        'customer_id' => rentalTestCustomer()->id,
        'laptop_id' => rentalTestLaptop($userId)->id,
        'daily_rate' => 100000,
        'deposit' => 500000,
        'rented_at' => now()->toDateTimeString(),
        'due_at' => now()->addDays(7)->toDateTimeString(),
        ...$overrides,
    ];
}

test('guests are redirected to the login page from rentals index', function () {
    $response = $this->get(route('rentals.index'));

    $response->assertRedirect(route('login'));
});

test('staff can visit the rentals index', function () {
    $user = User::factory()->create(['role' => 'staff']);

    $this->actingAs($user)
        ->get(route('rentals.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('rentals/index')
            ->has('rentals')
            ->has('filters')
            ->has('statuses')
        );
});

test('rental store validates required fields', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $response = $this
        ->actingAs($user)
        ->from(route('rentals.index'))
        ->post(route('rentals.store'), []);

    $response
        ->assertRedirect(route('rentals.index'))
        ->assertSessionHasErrors(['customer_id', 'laptop_id', 'daily_rate', 'due_at']);
});

test('rental store rejects non-rentable laptop', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $laptop = rentalTestLaptop($user->id);
    $laptop->update(['is_rentable' => false]);

    $response = $this
        ->actingAs($user)
        ->from(route('rentals.index'))
        ->post(route('rentals.store'), validRentalPayload($user->id, [
            'laptop_id' => $laptop->id,
        ]));

    $response
        ->assertRedirect(route('rentals.index'))
        ->assertSessionHasErrors('laptop_id');
});

test('rental store rejects non-available laptop', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $rusak = LaptopStatus::query()->firstOrCreate(
        ['slug' => 'rusak'],
        ['name' => 'Rusak', 'is_active' => true, 'sort_order' => 0],
    );
    $laptop = rentalTestLaptop($user->id);
    $laptop->update(['laptop_status_id' => $rusak->id]);

    $response = $this
        ->actingAs($user)
        ->from(route('rentals.index'))
        ->post(route('rentals.store'), validRentalPayload($user->id, [
            'laptop_id' => $laptop->id,
        ]));

    $response
        ->assertRedirect(route('rentals.index'))
        ->assertSessionHasErrors('laptop_id');
});

test('authenticated users can store a rental and laptop gets locked', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $payload = validRentalPayload($user->id);
    $aktif = RentalStatus::query()->firstOrCreate(
        ['slug' => 'aktif-disewa'],
        ['name' => 'Aktif Disewa', 'is_active' => true, 'sort_order' => 0],
    );
    $payload['rental_status_id'] = $aktif->id;

    $response = $this
        ->actingAs($user)
        ->post(route('rentals.store'), $payload);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('rentals.index'));

    $rental = Rental::query()->where('customer_id', $payload['customer_id'])->firstOrFail();

    expect($rental->rental_code)->toStartWith('RNT-');
    expect($rental->tracking_code)->not->toBeEmpty();

    // Unit terkunci dari penjualan.
    expect($rental->laptop->fresh()->status->slug)->toBe('disewa');
});

test('authenticated users can destroy a rental', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $laptop = rentalTestLaptop($user->id);

    $rental = Rental::query()->create([
        'rental_code' => 'RNT-20260101-000001',
        'customer_id' => rentalTestCustomer()->id,
        'laptop_id' => $laptop->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'daily_rate' => 100000,
        'rented_at' => now(),
        'due_at' => now()->addDays(7),
        'created_by' => $user->id,
    ]);

    $response = $this
        ->actingAs($user)
        ->delete(route('rentals.destroy', $rental));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('rentals.index'));

    $this->assertSoftDeleted('rentals', ['id' => $rental->id]);
});
