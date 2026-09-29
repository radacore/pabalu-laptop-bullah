<?php

use App\Models\Customer;
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
