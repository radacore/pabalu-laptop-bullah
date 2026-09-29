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

function wave4Customer(): Customer
{
    return Customer::query()->create([
        'user_id' => null,
        'name' => 'Wave4 Customer',
        'phone' => fake()->unique()->numerify('08##########'),
    ]);
}

function wave4Laptop(int $userId): Laptop
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

/**
 * Flash toast Inertia tersimpan di session key khusus (bukan 'toast').
 */
function wave4FlashToast(): ?array
{
    $flash = session('inertia.flash_data');

    if (! is_array($flash)) {
        return null;
    }

    $toast = $flash['toast'] ?? null;

    return is_array($toast) ? $toast : null;
}

function wave4Service(int $userId, string $statusSlug = 'diterima'): Service
{
    $status = ServiceStatus::query()->firstOrCreate(
        ['slug' => $statusSlug],
        ['name' => ucfirst($statusSlug), 'is_active' => true, 'sort_order' => 0],
    );

    return Service::query()->create([
        'service_code' => 'SRV-'.now()->format('Ymd').'-'.fake()->unique()->numerify('######'),
        'customer_id' => wave4Customer()->id,
        'device_name' => 'Test Device',
        'complaint' => 'Test complaint',
        'service_status_id' => $status->id,
        'technician_id' => $userId,
        'tracking_code' => bin2hex(random_bytes(8)),
        'payment_status' => 'unpaid',
        'received_at' => now(),
        'created_by' => $userId,
    ]);
}

test('deleting protected service flashes error toast', function () {
    $admin = User::factory()->admin()->create();
    $service = wave4Service($admin->id, 'selesai');

    $response = $this
        ->actingAs($admin)
        ->from(route('services.index'))
        ->delete(route('services.destroy', $service));

    $response->assertSessionHasErrors('service');

    // Jaring pengaman UX: flash error ikut terkirim walau halaman tidak
    // merender key errors.service.
    $toast = wave4FlashToast();
    expect($toast['type'] ?? null)->toBe('error');
    expect((string) ($toast['message'] ?? ''))->toContain('audit');
    expect($service->fresh()->trashed())->toBeFalse();
});

test('deleting active rental flashes error toast', function () {
    $admin = User::factory()->admin()->create();
    $status = RentalStatus::query()->firstOrCreate(
        ['slug' => 'aktif-disewa'],
        ['name' => 'Aktif Disewa', 'is_active' => true, 'sort_order' => 0],
    );

    $rental = Rental::query()->create([
        'rental_code' => 'RNT-'.fake()->unique()->numerify('######'),
        'customer_id' => wave4Customer()->id,
        'laptop_id' => wave4Laptop($admin->id)->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'daily_rate' => 100000,
        'rented_at' => now(),
        'due_at' => now()->addDays(3),
        'rental_status_id' => $status->id,
        'created_by' => $admin->id,
    ]);

    $response = $this
        ->actingAs($admin)
        ->from(route('rentals.index'))
        ->delete(route('rentals.destroy', $rental));

    $response->assertSessionHasErrors('rental');
    $toast = wave4FlashToast();
    expect($toast['type'] ?? null)->toBe('error');
});

test('deleting related customer flashes error toast', function () {
    $admin = User::factory()->admin()->create();
    $customer = wave4Customer();

    Service::query()->create([
        'service_code' => 'SRV-'.now()->format('Ymd').'-'.fake()->unique()->numerify('######'),
        'customer_id' => $customer->id,
        'device_name' => 'Test Device',
        'complaint' => 'Test complaint',
        'service_status_id' => ServiceStatus::query()->firstOrCreate(
            ['slug' => 'diterima'],
            ['name' => 'Diterima', 'is_active' => true, 'sort_order' => 0],
        )->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'payment_status' => 'unpaid',
        'received_at' => now(),
        'created_by' => $admin->id,
    ]);

    $response = $this
        ->actingAs($admin)
        ->from(route('customers.index'))
        ->delete(route('customers.destroy', $customer));

    $response->assertSessionHasErrors('customer');
    $toast = wave4FlashToast();
    expect($toast['type'] ?? null)->toBe('error');
    expect((string) ($toast['message'] ?? ''))->toContain('servis');
});

test('service show exposes inventory spareparts without cost price', function () {
    $admin = User::factory()->admin()->create();
    $staff = User::factory()->staff()->create();

    Sparepart::query()->create([
        'sku' => fake()->unique()->bothify('SPR-########-####'),
        'name' => 'Wave4 Keyboard',
        'condition' => 'baru',
        'stock' => 5,
        'cost_price' => 999999,
        'selling_price' => 1500000,
        'is_active' => true,
        'created_by' => $admin->id,
    ]);

    $service = wave4Service($staff->id);

    $response = $this->actingAs($staff)->get(route('services.show', $service));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('services/show')
        ->has('spareparts')
        ->where('spareparts.0.name', 'Wave4 Keyboard')
        ->missing('spareparts.0.cost_price')
    );
});

test('service part from inventory via show form consumes stock', function () {
    $admin = User::factory()->admin()->create();
    $staff = User::factory()->staff()->create();

    $sparepart = Sparepart::query()->create([
        'sku' => fake()->unique()->bothify('SPR-########-####'),
        'name' => 'Wave4 Baterai',
        'condition' => 'baru',
        'stock' => 5,
        'cost_price' => 100000,
        'selling_price' => 200000,
        'is_active' => true,
        'created_by' => $admin->id,
    ]);

    $service = wave4Service($staff->id);

    $this->actingAs($staff)
        ->post(route('services.parts.store', $service), [
            'part_name' => $sparepart->name,
            'quantity' => 2,
            'unit_price' => 200000,
            'sparepart_id' => $sparepart->id,
        ])
        ->assertSessionHasNoErrors();

    expect($sparepart->fresh()->stock)->toBe(3);

    $part = $service->parts()->latest()->firstOrFail();

    expect($part->sparepart_id)->toBe($sparepart->id);
});
