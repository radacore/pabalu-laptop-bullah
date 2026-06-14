<?php

use App\Models\Customer;
use App\Models\Service;
use App\Models\ServiceStatus;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function validServicePayload(array $overrides = []): array
{
    return [
        'customer_id' => createServiceCustomer()->id,
        'device_name' => 'Asus Vivobook 14',
        'brand' => 'Asus',
        'model' => 'Vivobook 14',
        'serial_number' => fake()->unique()->bothify('SN########'),
        'complaint' => 'Device does not boot.',
        'initial_condition' => 'No visible damage.',
        'estimated_cost' => 450000,
        'final_cost' => null,
        'estimated_completion_date' => '2026-06-10',
        'service_status_id' => createServiceStatus('Diterima')->id,
        'technician_id' => User::factory()->create(['role' => 'staff'])->id,
        'payment_status' => 'unpaid',
        'received_at' => '2026-06-01 09:00:00',
        'completed_at' => null,
        'picked_up_at' => null,
        ...$overrides,
    ];
}

function createServiceCustomer(): Customer
{
    return Customer::query()->create([
        'user_id' => User::factory()->create([
            'phone' => fake()->unique()->numerify('08##########'),
            'role' => 'customer',
            'is_active' => true,
        ])->id,
        'name' => 'Service Customer',
        'phone' => fake()->unique()->numerify('08##########'),
    ]);
}

function createServiceStatus(string $name): ServiceStatus
{
    return ServiceStatus::query()->create([
        'name' => $name,
        'slug' => fake()->unique()->slug(),
        'is_active' => true,
    ]);
}

function createServiceRecord(array $overrides = []): Service
{
    return Service::query()->create([
        'service_code' => fake()->unique()->bothify('SRV-########-####'),
        'customer_id' => createServiceCustomer()->id,
        'device_name' => 'Dell Inspiron',
        'brand' => 'Dell',
        'model' => 'Inspiron',
        'complaint' => 'Battery drains quickly.',
        'service_status_id' => createServiceStatus('Diterima')->id,
        'technician_id' => User::factory()->create(['role' => 'staff'])->id,
        'tracking_code' => fake()->unique()->bothify('TRK########'),
        'payment_status' => 'unpaid',
        'received_at' => now(),
        'created_by' => User::factory()->create()->id,
        ...$overrides,
    ]);
}

test('guests are redirected to the login page from services index', function () {
    $response = $this->get(route('services.index'));

    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the services index', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('services.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('services/index')
            ->has('services')
            ->has('filters')
            ->has('statuses')
            ->has('technicians')
        );
});

test('service store validates required fields', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('services.index'))
        ->post(route('services.store'), []);

    $response
        ->assertRedirect(route('services.index'))
        ->assertSessionHasErrors(['customer_id', 'device_name', 'complaint']);
});

test('authenticated users can store a service', function () {
    $user = User::factory()->create();
    $payload = validServicePayload();

    $response = $this
        ->actingAs($user)
        ->post(route('services.store'), $payload);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('services.index'));

    $this->assertDatabaseHas('services', [
        'customer_id' => $payload['customer_id'],
        'device_name' => $payload['device_name'],
        'brand' => $payload['brand'],
        'model' => $payload['model'],
        'complaint' => $payload['complaint'],
        'created_by' => $user->id,
    ]);

    $this->assertDatabaseHas('service_updates', [
        'old_status' => null,
        'new_status' => 'Diterima',
        'note' => 'Servis diterima.',
        'created_by' => $user->id,
    ]);
});

test('service update validates required fields', function () {
    $user = User::factory()->create();
    $service = createServiceRecord(['created_by' => $user->id]);

    $response = $this
        ->actingAs($user)
        ->from(route('services.index'))
        ->put(route('services.update', $service), ['customer_id' => '', 'device_name' => '', 'complaint' => '']);

    $response
        ->assertRedirect(route('services.index'))
        ->assertSessionHasErrors(['customer_id', 'device_name', 'complaint']);
});

test('authenticated users can update a service', function () {
    $user = User::factory()->create();
    $service = createServiceRecord(['created_by' => $user->id]);
    $newStatus = createServiceStatus('Selesai');
    $payload = validServicePayload([
        'customer_id' => $service->customer_id,
        'device_name' => 'Updated Acer Swift',
        'brand' => 'Acer',
        'model' => 'Swift 3',
        'complaint' => 'Keyboard replacement needed.',
        'service_status_id' => $newStatus->id,
        'final_cost' => 650000,
        'payment_status' => 'paid',
    ]);

    $response = $this
        ->actingAs($user)
        ->put(route('services.update', $service), $payload);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('services.index'));

    $this->assertDatabaseHas('services', [
        'id' => $service->id,
        'device_name' => 'Updated Acer Swift',
        'brand' => 'Acer',
        'model' => 'Swift 3',
        'complaint' => 'Keyboard replacement needed.',
        'service_status_id' => $newStatus->id,
        'payment_status' => 'paid',
    ]);

    $this->assertDatabaseHas('service_updates', [
        'service_id' => $service->id,
        'new_status' => 'Selesai',
        'note' => 'Status berhasil diperbarui.',
        'created_by' => $user->id,
    ]);
});

test('authenticated users can destroy a service', function () {
    $user = User::factory()->create();
    $service = createServiceRecord(['created_by' => $user->id]);

    $response = $this
        ->actingAs($user)
        ->delete(route('services.destroy', $service));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('services.index'));

    $this->assertDatabaseMissing('services', [
        'id' => $service->id,
    ]);
});
