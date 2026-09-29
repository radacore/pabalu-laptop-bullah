<?php

use App\Models\Customer;
use App\Models\Service;
use App\Models\ServiceStatus;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function trackingCustomer(): Customer
{
    return Customer::query()->create([
        'user_id' => null,
        'name' => 'Rahasia Pelanggan',
        'phone' => fake()->unique()->numerify('08##########'),
        'address' => 'Alamat Pribadi',
    ]);
}

function trackingStatus(string $slug, string $name): ServiceStatus
{
    return ServiceStatus::query()->firstOrCreate(
        ['slug' => $slug],
        ['name' => $name, 'is_active' => true, 'sort_order' => 0],
    );
}

function trackingService(array $overrides = []): Service
{
    return Service::query()->create([
        'service_code' => 'SRV-'.now()->format('Ymd').'-'.fake()->unique()->numerify('######'),
        'customer_id' => trackingCustomer()->id,
        'device_name' => 'Rahasia Device',
        'brand' => 'Rahasia Brand',
        'model' => 'Rahasia Model',
        'serial_number' => 'RAHASIA-SN',
        'complaint' => 'Public complaint text',
        'initial_condition' => 'Kondisi awal',
        'kelengkapan' => 'Charger + tas',
        'estimated_cost' => 500_000,
        'final_cost' => 800_000,
        'service_status_id' => trackingStatus('diterima', 'Diterima')->id,
        'technician_id' => User::factory()->create(['role' => 'staff'])->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'payment_status' => 'unpaid',
        'received_at' => now(),
        'created_by' => User::factory()->create()->id,
        ...$overrides,
    ]);
}

test('tracking landing page renders without auth', function () {
    $this->get(route('services.track.landing'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('services/tracking'));
});

test('tracking with valid tracking code returns service data', function () {
    $service = trackingService();

    $this->get(route('services.track', $service->tracking_code))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('services/tracking')
            ->has('service')
            ->where('service.service_code', $service->service_code)
            ->where('tracking_code', $service->tracking_code)
        );
});

test('tracking with invalid tracking code returns error prop', function () {
    trackingService();

    $this->get(route('services.track', 'nonexistent-code-12345'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('services/tracking')
            ->has('error')
            ->where('tracking_code', 'nonexistent-code-12345')
            ->missing('service')
        );
});

test('tracking with service_code does NOT return service (only tracking_code allowed)', function () {
    // Enumeration guard: tracking endpoint hanya boleh terima tracking_code
    // (random 16 hex, ~64-bit entropy). service_code punya pola predictable
    // (SRV-YYYYMMDD-######) dan bisa dienumerasi.
    $service = trackingService();

    $this->get(route('services.track', $service->service_code))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('services/tracking')
            ->has('error')
            ->missing('service')
        );
});

test('tracking response does NOT leak PII customer data', function () {
    // Data yang WAJIB TIDAK di-expose ke public:
    // - Nama customer (privacy)
    // - Nomor telepon customer (privacy + spam target)
    // - Alamat customer (privacy)
    // - Nama teknisi (social engineering vector)
    // - Cost price sparepart (harga modal internal)
    // - Note internal per sparepart
    $service = trackingService();

    $this->get(route('services.track', $service->tracking_code))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('service')
            ->missing('service.customer')
            ->missing('service.customer_id')
            ->missing('service.technician')
            ->missing('service.technician_id')
            ->missing('service.created_by')
        )
        ->assertDontSee('Rahasia Pelanggan')
        ->assertDontSee('Alamat Pribadi');
});

test('tracking endpoint respects throttle limit', function () {
    // Route throttle:10,1 = 10 request per menit per IP.
    // Test 11 request berturut-turut ke tracking code random,
    // request ke-11 harus dapat 429.
    $service = trackingService();

    for ($i = 0; $i < 10; $i++) {
        $this->get(route('services.track', $service->tracking_code))->assertOk();
    }

    $this->get(route('services.track', $service->tracking_code))
        ->assertStatus(429);
});

test('tracking response does NOT expose part cost_price or note', function () {
    $service = trackingService();
    $service->parts()->create([
        'part_name' => 'Battery Original',
        'quantity' => 1,
        'cost_price' => 250_000,
        'selling_price' => 400_000,
        'installation_fee' => 50_000,
        'note' => 'INTERNAL: minta ke supplier X, jangan customer tahu',
        'kind' => 'sold',
    ]);

    $response = $this->get(route('services.track', $service->tracking_code));

    $response->assertOk()->assertDontSee('INTERNAL');

    // Asert ke props Inertia (bukan HTML mentah) agar tidak rapuh
    // terhadap hash asset build yang kebetulan mengandung angka sama.
    $props = $response->viewData('page')['props'];
    $parts = $props['service']['parts'] ?? [];

    expect($parts)->toHaveCount(1);
    expect(array_keys($parts[0]))
        ->not->toContain('cost_price', 'note');
});
