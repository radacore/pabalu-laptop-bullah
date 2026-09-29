<?php

use App\Models\Customer;
use App\Models\Service;
use App\Models\ServiceStatus;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function validCustomerPayload(array $overrides = []): array
{
    return [
        'name' => 'Budi Santoso',
        'phone' => fake()->unique()->numerify('08##########'),
        'address' => 'Jl. Laptop No. 12',
        'note' => 'Prefers WhatsApp updates.',
        ...$overrides,
    ];
}

function createCustomerRecord(array $overrides = []): Customer
{
    return Customer::query()->create([
        'user_id' => User::factory()->create([
            'phone' => fake()->unique()->numerify('08##########'),
            'role' => 'customer',
            'is_active' => true,
        ])->id,
        'name' => 'Existing Customer',
        'phone' => fake()->unique()->numerify('08##########'),
        'address' => 'Existing address',
        'note' => 'Existing note',
        ...$overrides,
    ]);
}

test('guests are redirected to the login page from customers index', function () {
    $response = $this->get(route('customers.index'));

    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the customers index', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('customers.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('customers/index')
            ->has('customers')
            ->has('filters')
        );
});

test('customer store validates required fields', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('customers.index'))
        ->post(route('customers.store'), []);

    $response
        ->assertRedirect(route('customers.index'))
        ->assertSessionHasErrors(['name', 'phone']);
});

test('authenticated users can store a customer', function () {
    $user = User::factory()->create();
    $payload = validCustomerPayload();

    $response = $this
        ->actingAs($user)
        ->post(route('customers.store'), $payload);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('customers.index'));

    $this->assertDatabaseHas('customers', [
        'name' => $payload['name'],
        'phone' => $payload['phone'],
        'address' => $payload['address'],
        'note' => $payload['note'],
    ]);
});

test('customer update validates required fields', function () {
    $user = User::factory()->create();
    $customer = createCustomerRecord();

    $response = $this
        ->actingAs($user)
        ->from(route('customers.index'))
        ->put(route('customers.update', $customer), ['name' => '', 'phone' => '']);

    $response
        ->assertRedirect(route('customers.index'))
        ->assertSessionHasErrors(['name', 'phone']);
});

test('authenticated users can update a customer', function () {
    $user = User::factory()->create();
    $customer = createCustomerRecord();
    $payload = validCustomerPayload([
        'name' => 'Siti Aminah',
        'phone' => '081234567890',
        'address' => 'Jl. Service No. 45',
        'note' => 'Updated customer note.',
    ]);

    $response = $this
        ->actingAs($user)
        ->put(route('customers.update', $customer), $payload);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('customers.index'));

    $this->assertDatabaseHas('customers', [
        'id' => $customer->id,
        'name' => 'Siti Aminah',
        'phone' => '081234567890',
        'address' => 'Jl. Service No. 45',
        'note' => 'Updated customer note.',
    ]);
});

test('authenticated users can destroy a customer', function () {
    $user = User::factory()->create();
    $customer = createCustomerRecord();

    $response = $this
        ->actingAs($user)
        ->delete(route('customers.destroy', $customer));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('customers.index'));

    $this->assertSoftDeleted('customers', [
        'id' => $customer->id,
    ]);
});

test('staff cannot enumerate customers via search', function () {
    $staff = User::factory()->create(['role' => 'staff']);
    $customer = createCustomerRecord(['name' => 'UnikCariNama']);

    $response = $this
        ->actingAs($staff)
        ->get(route('search', ['q' => 'UnikCariNama']));

    $response->assertOk();

    $customers = $response->viewData('page')['props']['customers'] ?? [];

    expect($customers)->toBeEmpty();
    expect($customer->exists())->toBeTrue();
});

test('admin can find customers via search', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    createCustomerRecord(['name' => 'UnikCariNamaAdmin']);

    $response = $this
        ->actingAs($admin)
        ->get(route('search', ['q' => 'UnikCariNamaAdmin']));

    $response->assertOk();

    $customers = $response->viewData('page')['props']['customers'] ?? [];

    expect($customers)->not->toBeEmpty();
});

test('customer with active service cannot be destroyed', function () {
    $user = User::factory()->create();
    $customer = createCustomerRecord();
    $status = ServiceStatus::query()->firstOrCreate(
        ['slug' => 'diterima'],
        ['name' => 'Diterima', 'is_active' => true, 'sort_order' => 0],
    );

    Service::query()->create([
        'service_code' => 'SRV-DELGUARD-001',
        'customer_id' => $customer->id,
        'device_name' => 'Test Device',
        'complaint' => 'Test complaint.',
        'service_status_id' => $status->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'payment_status' => 'unpaid',
        'received_at' => now(),
        'created_by' => $user->id,
    ]);

    $response = $this
        ->actingAs($user)
        ->from(route('customers.index'))
        ->delete(route('customers.destroy', $customer));

    $response
        ->assertRedirect(route('customers.index'))
        ->assertSessionHasErrors('customer');

    $this->assertDatabaseHas('customers', [
        'id' => $customer->id,
        'deleted_at' => null,
    ]);
});
