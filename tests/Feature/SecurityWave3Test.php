<?php

use App\Models\Brand;
use App\Models\Customer;
use App\Models\Laptop;
use App\Models\LaptopSource;
use App\Models\LaptopStatus;
use App\Models\Rental;
use App\Models\RentalStatus;
use App\Models\Service;
use App\Models\ServiceStatus;
use App\Models\Sparepart;
use App\Models\User;
use Database\Seeders\UserSeeder;

function wave3Customer(): Customer
{
    return Customer::query()->create([
        'user_id' => null,
        'name' => 'Wave3 Customer',
        'phone' => fake()->unique()->numerify('08##########'),
    ]);
}

function wave3Sparepart(int $adminId): Sparepart
{
    return Sparepart::query()->create([
        'sku' => fake()->unique()->bothify('SPR-########-####'),
        'name' => 'Wave3 Sparepart',
        'condition' => 'baru',
        'stock' => 10,
        'cost_price' => 50000,
        'selling_price' => 200000,
        'is_active' => true,
        'created_by' => $adminId,
    ]);
}

function wave3Laptop(int $userId): Laptop
{
    $brand = Brand::query()->firstOrCreate(
        ['slug' => 'lenovo'],
        ['name' => 'Lenovo', 'is_active' => true, 'sort_order' => 0],
    );
    $source = LaptopSource::query()->firstOrCreate(
        ['slug' => 'trade-in-test'],
        ['name' => 'Trade In', 'is_active' => true, 'sort_order' => 0],
    );

    return Laptop::query()->create([
        'sku' => fake()->unique()->bothify('PBL-########-####'),
        'name' => 'Lenovo ThinkPad T14',
        'brand_id' => $brand->id,
        'model' => 'ThinkPad T14',
        'laptop_source_id' => $source->id,
        'purchase_date' => '2026-06-01',
        'cost_price' => 5500000,
        'selling_price' => 7500000,
        'laptop_status_id' => LaptopStatus::query()->firstOrCreate(
            ['slug' => 'tersedia'],
            ['name' => 'Tersedia', 'is_active' => true, 'sort_order' => 0],
        )->id,
        'created_by' => $userId,
    ]);
}

function wave3Rental(int $userId): Rental
{
    return Rental::query()->create([
        'rental_code' => 'RNT-'.fake()->unique()->numerify('######'),
        'customer_id' => wave3Customer()->id,
        'laptop_id' => wave3Laptop($userId)->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'daily_rate' => 100000,
        'rented_at' => now(),
        'due_at' => now()->addDays(3),
        'deposit' => 0,
        'rental_status_id' => RentalStatus::query()->firstOrCreate(
            ['slug' => 'dipesan'],
            ['name' => 'Dipesan', 'is_active' => true, 'sort_order' => 0],
        )->id,
        'created_by' => $userId,
    ]);
}

function wave3ServiceFor(User $technician, User $creator, string $statusSlug = 'diterima'): Service
{
    $status = ServiceStatus::query()->firstOrCreate(
        ['slug' => $statusSlug],
        ['name' => ucfirst($statusSlug), 'is_active' => true, 'sort_order' => 0],
    );

    return Service::query()->create([
        'service_code' => 'SRV-'.now()->format('Ymd').'-'.fake()->unique()->numerify('######'),
        'customer_id' => wave3Customer()->id,
        'device_name' => 'Test Device',
        'complaint' => 'Test complaint',
        'service_status_id' => $status->id,
        'technician_id' => $technician->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'payment_status' => 'unpaid',
        'received_at' => now(),
        'created_by' => $creator->id,
    ]);
}

test('staff cannot upload or delete sparepart photos', function () {
    $staff = User::factory()->staff()->create();
    $admin = User::factory()->admin()->create();
    $sparepart = wave3Sparepart($admin->id);

    $this->actingAs($staff)
        ->post(route('spareparts.photos.store', $sparepart), [])
        ->assertForbidden();

    $photo = $sparepart->photos()->create(['file_path' => 'spareparts/x.jpg']);

    $this->actingAs($staff)
        ->delete(route('spareparts.photos.destroy', [$sparepart, $photo]))
        ->assertForbidden();
});

test('staff service index only shows own assigned or created services', function () {
    $admin = User::factory()->admin()->create();
    $staffA = User::factory()->staff()->create();
    $staffB = User::factory()->staff()->create();

    $own = wave3ServiceFor($staffA, $staffA);
    $other = wave3ServiceFor($staffB, $staffB);

    $response = $this->actingAs($staffA)->get(route('services.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('services/index')
        ->where('services.data.0.id', $own->id)
        ->missing('services.data.1')
    );

    // Admin tetap lihat semua.
    $this->actingAs($admin)->get(route('services.index'))->assertOk();
    expect($other->fresh())->not->toBeNull();
});

test('staff cannot view another technician service detail', function () {
    $staffA = User::factory()->staff()->create();
    $staffB = User::factory()->staff()->create();

    $other = wave3ServiceFor($staffB, $staffB);

    $this->actingAs($staffA)
        ->get(route('services.show', $other))
        ->assertForbidden();
});

test('rental paid status requires positive paid amount', function () {
    $admin = User::factory()->admin()->create();
    $rental = wave3Rental($admin->id);

    $this->actingAs($admin)
        ->from(route('rentals.edit', $rental))
        ->put(route('rentals.update', $rental), [
            'rental_status_id' => $rental->rental_status_id,
            'payment_status' => 'paid',
            'paid_amount' => 0,
        ])
        ->assertSessionHasErrors('payment_status');
});

test('deposit return requires an existing deposit', function () {
    $admin = User::factory()->admin()->create();
    $rental = wave3Rental($admin->id);

    $this->actingAs($admin)
        ->from(route('rentals.edit', $rental))
        ->put(route('rentals.update', $rental), [
            'rental_status_id' => $rental->rental_status_id,
            'deposit_returned' => true,
        ])
        ->assertSessionHasErrors('deposit_returned');
});

test('admin can create staff and staff cannot access staff management', function () {
    $admin = User::factory()->admin()->create();
    $staff = User::factory()->staff()->create();

    $this->actingAs($staff)->get(route('staff.index'))->assertForbidden();

    $this->actingAs($admin)
        ->post(route('staff.store'), [
            'name' => 'Teknisi Baru',
            'email' => 'teknisi-baru@pabalu.com',
            'password' => 'password123',
            'role' => 'staff',
        ])
        ->assertRedirect(route('staff.index'));

    $created = User::query()->where('email', 'teknisi-baru@pabalu.com')->firstOrFail();

    expect($created->role)->toBe('staff');
    expect((bool) $created->is_active)->toBeTrue();

    $this->actingAs($admin)->get(route('staff.index'))->assertOk();
});

test('admin cannot deactivate or demote self', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->from(route('staff.edit', $admin))
        ->put(route('staff.update', $admin), [
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => 'admin',
            'is_active' => false,
        ])
        ->assertSessionHasErrors('is_active');

    $this->actingAs($admin)
        ->from(route('staff.edit', $admin))
        ->put(route('staff.update', $admin), [
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => 'staff',
            'is_active' => true,
        ])
        ->assertSessionHasErrors('role');

    expect($admin->fresh()->role)->toBe('admin');
});

test('user seeder assigns admin and staff roles', function () {
    $this->seed(UserSeeder::class);

    expect(User::query()->where('email', 'admin@pabalu.com')->value('role'))->toBe('admin');
    expect(User::query()->where('email', 'teknisi@pabalu.com')->value('role'))->toBe('staff');
});
