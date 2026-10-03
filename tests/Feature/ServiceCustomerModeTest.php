<?php

use App\Models\Customer;
use App\Models\Service;
use App\Models\ServiceStatus;
use App\Models\User;

function modeTestStatus(): ServiceStatus
{
    return ServiceStatus::query()->firstOrCreate(
        ['slug' => 'diterima'],
        ['name' => 'Diterima', 'is_active' => true, 'sort_order' => 0],
    );
}

function modeTestPayload(array $overrides = []): array
{
    return [
        'customer_mode' => 'existing',
        'customer_id' => Customer::query()->create([
            'name' => 'Mode Test Customer',
            'phone' => fake()->unique()->numerify('08##########'),
        ])->id,
        'device_name' => 'Asus Vivobook 14',
        'complaint' => 'Device does not boot.',
        'service_status_id' => modeTestStatus()->id,
        'technician_id' => User::factory()->create(['role' => 'staff'])->id,
        'payment_status' => 'unpaid',
        ...$overrides,
    ];
}

test('service store with new customer mode creates both records', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $payload = modeTestPayload([
        'customer_mode' => 'new',
        'customer_id' => null,
        'customer_name' => 'Pelanggan Walk-In',
        'customer_phone' => '081234567890',
    ]);

    $response = $this
        ->actingAs($user)
        ->post(route('services.store'), $payload);

    $response->assertRedirect(route('services.index'));
    $response->assertSessionHasNoErrors();

    $customer = Customer::query()->where('phone', '081234567890')->firstOrFail();

    expect($customer->name)->toBe('Pelanggan Walk-In');

    $this->assertDatabaseHas('services', [
        'customer_id' => $customer->id,
        'complaint' => 'Device does not boot.',
    ]);
});

test('service store with new customer mode validates name and phone', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $response = $this
        ->actingAs($user)
        ->from(route('services.create'))
        ->post(route('services.store'), modeTestPayload([
            'customer_mode' => 'new',
            'customer_id' => null,
        ]));

    $response->assertSessionHasErrors(['customer_name', 'customer_phone']);
    expect(Service::query()->count())->toBe(0);
    expect(Customer::query()->where('name', 'Pelanggan Walk-In')->count())->toBe(0);
});

test('service store with existing mode still requires customer_id', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $response = $this
        ->actingAs($user)
        ->from(route('services.create'))
        ->post(route('services.store'), modeTestPayload([
            'customer_id' => null,
        ]));

    $response->assertSessionHasErrors('customer_id');
});

test('service store without mode defaults to existing behavior', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $customer = Customer::query()->create([
        'name' => 'Existing Customer',
        'phone' => fake()->unique()->numerify('08##########'),
    ]);

    // Payload lama tanpa customer_mode tetap jalan seperti dulu.
    $payload = modeTestPayload(['customer_id' => $customer->id]);
    unset($payload['customer_mode']);

    $this->actingAs($user)
        ->post(route('services.store'), $payload)
        ->assertRedirect(route('services.index'))
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('services', ['customer_id' => $customer->id]);
});
