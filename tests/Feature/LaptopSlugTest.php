<?php

use App\Models\Brand;
use App\Models\Laptop;
use App\Models\LaptopStatus;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function slugTestBrand(): Brand
{
    return Brand::query()->firstOrCreate(
        ['slug' => 'apple'],
        ['name' => 'Apple', 'is_active' => true, 'sort_order' => 0],
    );
}

function slugTestStatus(string $slug, string $name): LaptopStatus
{
    return LaptopStatus::query()->firstOrCreate(
        ['slug' => $slug],
        ['name' => $name, 'is_active' => true, 'sort_order' => 0],
    );
}

function slugTestLaptop(array $overrides = []): Laptop
{
    return Laptop::query()->create([
        'sku' => fake()->unique()->bothify('PBL-########-####'),
        'name' => 'MacBook Pro M3 14',
        'brand_id' => slugTestBrand()->id,
        'model' => 'A2992',
        'purchase_date' => '2026-06-01',
        'cost_price' => 17500000,
        'selling_price' => 19999000,
        'laptop_status_id' => slugTestStatus('tersedia', 'Tersedia')->id,
        'created_by' => User::factory()->create()->id,
        ...$overrides,
    ]);
}

test('laptop gets an auto-generated slug on create', function () {
    $laptop = slugTestLaptop();

    expect($laptop->slug)->toBe('apple-macbook-pro-m3-14');
});

test('public detail page resolves by slug', function () {
    $laptop = slugTestLaptop();

    $this->get('/shop/'.$laptop->slug)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/laptop-detail')
            ->where('laptop.id', $laptop->id)
        );
});

test('legacy id url redirects permanently to slug url', function () {
    $laptop = slugTestLaptop();

    $this->get('/shop/'.$laptop->id)
        ->assertStatus(301)
        ->assertRedirect('/shop/'.$laptop->slug);
});

test('unknown slug returns 404', function () {
    $this->get('/shop/laptop-yang-tidak-ada')->assertNotFound();
});

test('non-available laptop returns 404 even by slug', function () {
    $laptop = slugTestLaptop([
        'laptop_status_id' => slugTestStatus('terjual', 'Terjual')->id,
    ]);

    $this->get('/shop/'.$laptop->slug)->assertNotFound();
    $this->get('/shop/'.$laptop->id)->assertNotFound();
});

test('duplicate names get unique slugs', function () {
    $first = slugTestLaptop();
    $second = slugTestLaptop();

    expect($second->slug)->toBe($first->slug.'-2');
    expect($first->slug)->not->toBe($second->slug);
});
