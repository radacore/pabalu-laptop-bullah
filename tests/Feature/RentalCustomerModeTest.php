<?php

use App\Models\Brand;
use App\Models\Customer;
use App\Models\Laptop;
use App\Models\LaptopStatus;
use App\Models\Rental;
use App\Models\RentalStatus;
use App\Models\User;

function modeRentalLaptop(int $userId): Laptop
{
    foreach ([['tersedia', 'Tersedia'], ['disewa', 'Disewa']] as [$slug, $name]) {
        LaptopStatus::query()->firstOrCreate(
            ['slug' => $slug],
            ['name' => $name, 'is_active' => true, 'sort_order' => 0],
        );
    }

    return Laptop::query()->create([
        'sku' => fake()->unique()->bothify('PBL-########-####'),
        'name' => 'Unit Sewa Mode Test',
        'brand_id' => Brand::query()->firstOrCreate(
            ['slug' => 'rental-mode-brand'],
            ['name' => 'RentalMode', 'is_active' => true, 'sort_order' => 0],
        )->id,
        'model' => 'Test Model',
        'purchase_date' => '2026-01-01',
        'cost_price' => 5000000,
        'selling_price' => 7000000,
        'laptop_status_id' => LaptopStatus::query()->where('slug', 'tersedia')->firstOrFail()->id,
        'is_rentable' => true,
        'daily_rate' => 100000,
        'created_by' => $userId,
    ]);
}

function modeRentalStatus(): RentalStatus
{
    return RentalStatus::query()->firstOrCreate(
        ['slug' => 'aktif-disewa'],
        ['name' => 'Aktif Disewa', 'is_active' => true, 'sort_order' => 0],
    );
}

test('rental store with new customer mode creates both records', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $laptop = modeRentalLaptop($user->id);

    $response = $this->actingAs($user)->post(route('rentals.store'), [
        'customer_mode' => 'new',
        'customer_name' => 'Penyewa Walk-In',
        'customer_phone' => '081234560000',
        'laptop_id' => $laptop->id,
        'rental_status_id' => modeRentalStatus()->id,
        'daily_rate' => 100000,
        'due_at' => now()->addDays(7)->toDateTimeString(),
    ]);

    $response->assertRedirect(route('rentals.index'));
    $response->assertSessionHasNoErrors();

    $customer = Customer::query()->where('phone', '081234560000')->firstOrFail();

    expect($customer->name)->toBe('Penyewa Walk-In');

    $this->assertDatabaseHas('rentals', [
        'customer_id' => $customer->id,
        'laptop_id' => $laptop->id,
    ]);

    // Unit terkunci disewa.
    expect($laptop->fresh()->status->slug)->toBe('disewa');
});

test('rental store with new customer mode validates name and phone', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $laptop = modeRentalLaptop($user->id);

    $response = $this
        ->actingAs($user)
        ->from(route('rentals.create'))
        ->post(route('rentals.store'), [
            'customer_mode' => 'new',
            'laptop_id' => $laptop->id,
            'daily_rate' => 100000,
            'due_at' => now()->addDays(7)->toDateTimeString(),
        ]);

    $response->assertSessionHasErrors(['customer_name', 'customer_phone']);
    expect(Rental::query()->count())->toBe(0);
});
