<?php

use App\Models\Laptop;
use App\Models\LaptopSource;
use App\Models\LaptopStatus;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function validLaptopPayload(array $overrides = []): array
{
    return [
        'sku' => fake()->unique()->bothify('PBL-########-####'),
        'name' => 'Lenovo ThinkPad T14',
        'brand' => 'Lenovo',
        'model' => 'ThinkPad T14',
        'laptop_source_id' => createLaptopSource()->id,
        'purchase_date' => '2026-06-01',
        'cost_price' => 5500000,
        'selling_price' => 7500000,
        'additional_cost' => 250000,
        'laptop_status_id' => createLaptopStatus()->id,
        'description' => 'Ready to sell.',
        'internal_note' => 'Passed quality check.',
        'specification' => [
            'processor' => 'Intel Core i5',
            'ram' => '16GB',
            'storage' => '512GB SSD',
        ],
        ...$overrides,
    ];
}

function createLaptopSource(): LaptopSource
{
    return LaptopSource::query()->create([
        'name' => 'Trade In',
        'slug' => fake()->unique()->slug(),
        'is_active' => true,
    ]);
}

function createLaptopStatus(): LaptopStatus
{
    return LaptopStatus::query()->create([
        'name' => 'Available',
        'slug' => fake()->unique()->slug(),
        'is_active' => true,
    ]);
}

function createLaptopRecord(array $overrides = []): Laptop
{
    return Laptop::query()->create([
        'sku' => fake()->unique()->bothify('PBL-########-####'),
        'name' => 'Dell Latitude 5420',
        'brand' => 'Dell',
        'model' => 'Latitude 5420',
        'laptop_source_id' => createLaptopSource()->id,
        'purchase_date' => '2026-05-01',
        'cost_price' => 4000000,
        'selling_price' => 6000000,
        'additional_cost' => 0,
        'laptop_status_id' => createLaptopStatus()->id,
        'created_by' => User::factory()->create()->id,
        ...$overrides,
    ]);
}

test('guests are redirected to the login page from laptops index', function () {
    $response = $this->get(route('laptops.index'));

    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the laptops index', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('laptops.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('laptops/index')
            ->has('laptops')
            ->has('filters')
            ->has('sources')
            ->has('statuses')
        );
});

test('laptop store validates required fields', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('laptops.index'))
        ->post(route('laptops.store'), []);

    $response
        ->assertRedirect(route('laptops.index'))
        ->assertSessionHasErrors(['name', 'brand', 'model', 'purchase_date', 'cost_price', 'selling_price']);
});

test('authenticated users can store a laptop', function () {
    $user = User::factory()->create();
    $payload = validLaptopPayload();

    $response = $this
        ->actingAs($user)
        ->post(route('laptops.store'), $payload);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('laptops.index'));

    $this->assertDatabaseHas('laptops', [
        'sku' => $payload['sku'],
        'name' => $payload['name'],
        'brand' => $payload['brand'],
        'model' => $payload['model'],
        'created_by' => $user->id,
    ]);

    $this->assertDatabaseHas('laptop_specifications', [
        'processor' => 'Intel Core i5',
        'ram' => '16GB',
        'storage' => '512GB SSD',
    ]);
});

test('laptop update validates required fields', function () {
    $user = User::factory()->create();
    $laptop = createLaptopRecord(['created_by' => $user->id]);

    $response = $this
        ->actingAs($user)
        ->from(route('laptops.index'))
        ->put(route('laptops.update', $laptop), []);

    $response
        ->assertRedirect(route('laptops.index'))
        ->assertSessionHasErrors(['sku', 'name', 'brand', 'model', 'purchase_date', 'cost_price', 'selling_price']);
});

test('authenticated users can update a laptop', function () {
    $user = User::factory()->create();
    $laptop = createLaptopRecord(['created_by' => $user->id]);
    $payload = validLaptopPayload([
        'sku' => $laptop->sku,
        'name' => 'Updated MacBook Air',
        'brand' => 'Apple',
        'model' => 'MacBook Air M2',
        'specification' => [
            'processor' => 'Apple M2',
            'ram' => '8GB',
            'storage' => '256GB SSD',
        ],
    ]);

    $response = $this
        ->actingAs($user)
        ->put(route('laptops.update', $laptop), $payload);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('laptops.index'));

    $this->assertDatabaseHas('laptops', [
        'id' => $laptop->id,
        'name' => 'Updated MacBook Air',
        'brand' => 'Apple',
        'model' => 'MacBook Air M2',
    ]);

    $this->assertDatabaseHas('laptop_specifications', [
        'laptop_id' => $laptop->id,
        'processor' => 'Apple M2',
        'ram' => '8GB',
        'storage' => '256GB SSD',
    ]);
});

test('authenticated users can destroy a laptop', function () {
    $user = User::factory()->create();
    $laptop = createLaptopRecord(['created_by' => $user->id]);

    $response = $this
        ->actingAs($user)
        ->delete(route('laptops.destroy', $laptop));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('laptops.index'));

    $this->assertDatabaseMissing('laptops', [
        'id' => $laptop->id,
    ]);
});
