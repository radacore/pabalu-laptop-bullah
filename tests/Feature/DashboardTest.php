<?php

use App\Models\Customer;
use App\Models\Laptop;
use App\Models\LaptopStatus;
use App\Models\Service;
use App\Models\ServiceStatus;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('siap-diambil counts as finished, not active', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $siap = ServiceStatus::query()->firstOrCreate(
        ['slug' => 'siap-diambil'],
        ['name' => 'Siap Diambil', 'is_active' => true, 'sort_order' => 0],
    );

    $service = Service::query()->create([
        'service_code' => 'SRV-DASH-001',
        'customer_id' => Customer::query()->create([
            'user_id' => null,
            'name' => 'Dash Customer',
            'phone' => fake()->unique()->numerify('08##########'),
        ])->id,
        'device_name' => 'Dash Device',
        'complaint' => 'Dash complaint.',
        'service_status_id' => $siap->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'payment_status' => 'unpaid',
        'received_at' => now(),
        'created_by' => $user->id,
    ]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();

    $stats = $response->viewData('page')['props']['stats'];

    expect((int) $stats['total_active_services'])->toBe(0);

    $service->delete();
});

test('trend shows real sales and completed services per month', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $terjual = LaptopStatus::query()->firstOrCreate(
        ['slug' => 'terjual'],
        ['name' => 'Terjual', 'is_active' => true, 'sort_order' => 0],
    );

    Laptop::factory()->create([
        'laptop_status_id' => $terjual->id,
        'sold_at' => now(),
    ]);

    $selesai = ServiceStatus::query()->firstOrCreate(
        ['slug' => 'selesai'],
        ['name' => 'Selesai', 'is_active' => true, 'sort_order' => 0],
    );

    Service::query()->create([
        'service_code' => 'SRV-TREND-001',
        'customer_id' => Customer::factory()->create()->id,
        'device_name' => 'Trend Device',
        'complaint' => 'Trend complaint.',
        'service_status_id' => $selesai->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'payment_status' => 'unpaid',
        'received_at' => now(),
        'completed_at' => now(),
        'created_by' => $user->id,
    ]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk();

    $trend = $response->viewData('page')['props']['trend'];

    expect($trend['months'])->toHaveCount(8);
    expect($trend['sales'])->toHaveCount(8);
    expect($trend['service'])->toHaveCount(8);
    // Data bulan berjalan ada di bucket terakhir.
    expect((int) end($trend['sales']))->toBe(1);
    expect((int) end($trend['service']))->toBe(1);
    expect(array_sum($trend['sales']))->toBe(1);
    expect(array_sum($trend['service']))->toBe(1);
});
