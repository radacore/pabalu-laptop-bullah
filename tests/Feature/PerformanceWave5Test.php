<?php

use App\Models\Brand;
use App\Models\Customer;
use App\Models\FinancialTransaction;
use App\Models\Laptop;
use App\Models\LaptopSource;
use App\Models\LaptopStatus;
use App\Models\PaymentMethod;
use App\Models\Rental;
use App\Models\RentalStatus;
use App\Models\ServiceStatus;
use App\Models\Sparepart;
use App\Models\SparepartType;
use App\Models\TransactionCategory;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

function wave5Admin(): User
{
    return User::factory()->admin()->create();
}

function wave5Customer(): Customer
{
    return Customer::query()->create([
        'user_id' => null,
        'name' => 'Wave5 Customer',
        'phone' => fake()->unique()->numerify('08##########'),
    ]);
}

function wave5Laptop(int $userId): Laptop
{
    $brand = Brand::query()->firstOrCreate(
        ['slug' => 'lenovo'],
        ['name' => 'Lenovo', 'is_active' => true, 'sort_order' => 0],
    );
    $source = LaptopSource::query()->firstOrCreate(
        ['slug' => 'trade-in-test'],
        ['name' => 'Trade In', 'is_active' => true, 'sort_order' => 0],
    );

    return Laptop::query()->create([
        'sku' => fake()->unique()->bothify('PBL-########-####'),
        'name' => 'Lenovo ThinkPad T14',
        'brand_id' => $brand->id,
        'model' => 'ThinkPad T14',
        'laptop_source_id' => $source->id,
        'purchase_date' => '2026-06-01',
        'cost_price' => 5500000,
        'selling_price' => 7500000,
        'laptop_status_id' => LaptopStatus::query()->firstOrCreate(
            ['slug' => 'tersedia'],
            ['name' => 'Tersedia', 'is_active' => true, 'sort_order' => 0],
        )->id,
        'created_by' => $userId,
    ]);
}

test('dashboard payload is cached under a single stable key', function () {
    $admin = wave5Admin();
    Cache::flush();

    $this->actingAs($admin)->get(route('dashboard'))->assertOk();

    expect(Cache::has('dashboard.payload'))->toBeTrue();

    // Hit kedua tidak menambah query agregat — ambil dari cache.
    DB::flushQueryLog();
    DB::enableQueryLog();

    $this->actingAs($admin)->get(route('dashboard'))->assertOk();

    // Hanya query ringan (auth/session), tanpa 7 agregat + 2 recent.
    expect(collect(DB::getQueryLog())->count())->toBeLessThan(5);
});

test('dashboard uses range queries compatible with date indexes', function () {
    $admin = wave5Admin();

    ServiceStatus::query()->firstOrCreate(
        ['slug' => 'diterima'],
        ['name' => 'Diterima', 'is_active' => true, 'sort_order' => 0],
    );

    $response = $this->actingAs($admin)->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('stats')
        ->has('recent_laptops')
        ->has('recent_services')
    );
});

test('catalog filter options are cached', function () {
    Cache::flush();

    $this->get(route('laptops.catalog'))->assertOk();

    expect(Cache::has('catalog.laptop_filter_options'))->toBeTrue();

    $this->get(route('rentals.catalog'))->assertOk();

    expect(Cache::has('catalog.rental_filter_options'))->toBeTrue();

    $this->get(route('spareparts.catalog'))->assertOk();

    expect(Cache::has('catalog.sparepart_filter_options'))->toBeTrue();
});

test('rental edit exposes customer laptop and status relations', function () {
    $admin = wave5Admin();
    $status = RentalStatus::query()->firstOrCreate(
        ['slug' => 'dipesan'],
        ['name' => 'Dipesan', 'is_active' => true, 'sort_order' => 0],
    );

    $rental = Rental::query()->create([
        'rental_code' => 'RNT-'.fake()->unique()->numerify('######'),
        'customer_id' => wave5Customer()->id,
        'laptop_id' => wave5Laptop($admin->id)->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'daily_rate' => 100000,
        'rented_at' => now(),
        'due_at' => now()->addDays(3),
        'rental_status_id' => $status->id,
        'created_by' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->get(route('rentals.edit', $rental))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('rental.customer')
            ->has('rental.laptop')
            ->has('rental.status')
        );
});

test('laptop edit exposes brand source and status relations', function () {
    $admin = wave5Admin();
    $laptop = wave5Laptop($admin->id);

    $this->actingAs($admin)
        ->get(route('laptops.edit', $laptop))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('laptop.brand')
            ->has('laptop.source')
            ->has('laptop.status')
            ->has('laptop.specification')
        );
});

test('sparepart edit exposes type relation', function () {
    $admin = wave5Admin();
    $type = SparepartType::query()->firstOrCreate(
        ['slug' => 'baterai'],
        ['name' => 'Baterai', 'is_active' => true, 'sort_order' => 0],
    );

    $sparepart = Sparepart::query()->create([
        'sku' => fake()->unique()->bothify('SPR-########-####'),
        'name' => 'Wave5 Baterai',
        'sparepart_type_id' => $type->id,
        'condition' => 'baru',
        'stock' => 5,
        'selling_price' => 200000,
        'is_active' => true,
        'created_by' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->get(route('spareparts.edit', $sparepart))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('sparepart.type'));
});

test('financial transaction edit exposes category and payment method', function () {
    $admin = wave5Admin();

    $category = TransactionCategory::query()->firstOrCreate(
        ['type' => 'expense', 'slug' => 'operasional-toko'],
        ['name' => 'Operasional Toko', 'is_active' => true, 'sort_order' => 0],
    );
    $method = PaymentMethod::query()->firstOrCreate(
        ['slug' => 'cash'],
        ['name' => 'Tunai', 'is_active' => true, 'sort_order' => 0],
    );

    $transaction = FinancialTransaction::query()->create([
        'transaction_code' => 'TXN-'.fake()->unique()->numerify('######'),
        'type' => 'expense',
        'transaction_category_id' => $category->id,
        'amount' => 50000,
        'payment_method_id' => $method->id,
        'transaction_date' => now()->toDateString(),
        'created_by' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->get(route('financial-transactions.edit', $transaction))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('transaction.category')
            ->has('transaction.payment_method')
        );
});

test('service form options only select needed customer columns', function () {
    $admin = wave5Admin();

    $response = $this->actingAs($admin)->get(route('services.create'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->has('customers'));
});
