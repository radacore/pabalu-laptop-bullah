<?php

use App\Models\Brand;
use App\Models\Laptop;
use App\Models\LaptopSource;
use App\Models\LaptopStatus;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function laptopBrand(): Brand
{
    return Brand::query()->firstOrCreate(
        ['slug' => 'lenovo'],
        ['name' => 'Lenovo', 'is_active' => true, 'sort_order' => 0],
    );
}

function laptopSource(): LaptopSource
{
    return LaptopSource::query()->firstOrCreate(
        ['slug' => 'trade-in-test'],
        ['name' => 'Trade In', 'is_active' => true, 'sort_order' => 0],
    );
}

function laptopStatus(string $slug = 'tersedia', string $name = 'Tersedia'): LaptopStatus
{
    return LaptopStatus::query()->firstOrCreate(
        ['slug' => $slug],
        ['name' => $name, 'is_active' => true, 'sort_order' => 0],
    );
}

function validLaptopPayload(array $overrides = []): array
{
    return [
        'sku' => fake()->unique()->bothify('PBL-########-####'),
        'name' => 'Lenovo ThinkPad T14',
        'brand_id' => laptopBrand()->id,
        'model' => 'ThinkPad T14',
        'laptop_source_id' => laptopSource()->id,
        'purchase_date' => '2026-06-01',
        'cost_price' => 5500000,
        'selling_price' => 7500000,
        'repair_cost' => 250000,
        'laptop_status_id' => laptopStatus()->id,
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

function createLaptopRecord(array $overrides = []): Laptop
{
    return Laptop::query()->create([
        'sku' => fake()->unique()->bothify('PBL-########-####'),
        'name' => 'Dell Latitude 5420',
        'brand_id' => laptopBrand()->id,
        'model' => 'Latitude 5420',
        'laptop_source_id' => laptopSource()->id,
        'purchase_date' => '2026-05-01',
        'cost_price' => 4000000,
        'selling_price' => 6000000,
        'repair_cost' => 0,
        'laptop_status_id' => laptopStatus()->id,
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
            ->has('brands')
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
        ->assertSessionHasErrors(['brand_id', 'model', 'purchase_date', 'cost_price', 'selling_price']);
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
        'brand_id' => $payload['brand_id'],
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
        ->assertSessionHasErrors(['sku', 'brand_id', 'model', 'purchase_date', 'cost_price', 'selling_price']);
});

test('authenticated users can update a laptop', function () {
    $user = User::factory()->create();
    $laptop = createLaptopRecord(['created_by' => $user->id]);
    $appleBrand = Brand::query()->firstOrCreate(
        ['slug' => 'apple'],
        ['name' => 'Apple', 'is_active' => true, 'sort_order' => 0],
    );
    $payload = validLaptopPayload([
        'sku' => $laptop->sku,
        'name' => 'Updated MacBook Air',
        'brand_id' => $appleBrand->id,
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
        'brand_id' => $appleBrand->id,
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

    $this->assertSoftDeleted('laptops', [
        'id' => $laptop->id,
    ]);
});
