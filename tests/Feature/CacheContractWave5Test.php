<?php

use App\Models\Brand;
use App\Models\Customer;
use App\Models\Laptop;
use App\Models\LaptopSource;
use App\Models\LaptopStatus;
use App\Models\Service;
use App\Models\ServiceStatus;
use App\Models\User;
use App\Models\WebsiteSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Regresi gelombang 5: store cache `database` berjalan dengan
 * serializable_classes=false, sehingga objek Eloquent yang di-cache
 * dibaca kembali sebagai __PHP_Incomplete_Class.
 *
 * Test suite memakai array store (tanpa serialize) sehingga bug ini lolos
 * dari semua test — hanya tertangkap lewat e2e di browser (dashboard
 * blank: recent_services.filter is not a function). Test ini memaksa
 * database store agar perilaku produksi tereproduksi di Pest.
 */
function wave5DbCache(): void
{
    config()->set('cache.default', 'database');
    Cache::flush();
}

function wave5ContractCustomer(): Customer
{
    return Customer::query()->create([
        'user_id' => null,
        'name' => 'Wave5 Contract Customer',
        'phone' => fake()->unique()->numerify('08##########'),
    ]);
}

function wave5ContractLaptop(int $userId): Laptop
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

function wave5CachePayload(string $key): mixed
{
    $prefix = config('cache.prefix');

    $raw = DB::table('cache')->where('key', $prefix.$key)->value('value');

    expect($raw)->not->toBeNull();

    return unserialize($raw);
}

test('dashboard payload survives database cache round-trip as arrays', function () {
    wave5DbCache();
    $admin = User::factory()->admin()->create();

    ServiceStatus::query()->firstOrCreate(
        ['slug' => 'diterima'],
        ['name' => 'Diterima', 'is_active' => true, 'sort_order' => 0],
    );

    $this->actingAs($admin)->get(route('dashboard'))->assertOk();
    // Hit kedua dibaca dari cache database.
    $this->actingAs($admin)->get(route('dashboard'))->assertOk();

    $payload = wave5CachePayload('dashboard.payload');

    expect($payload)->toBeArray()
        ->and($payload['stats'])->toBeArray()
        ->and($payload['recent_laptops'])->toBeArray()
        ->and($payload['recent_services'])->toBeArray();
});

test('catalog filter options survive database cache round-trip as arrays', function () {
    wave5DbCache();

    $this->get(route('laptops.catalog'))->assertOk();
    $this->get(route('rentals.catalog'))->assertOk();
    $this->get(route('spareparts.catalog'))->assertOk();

    foreach (['catalog.laptop_filter_options', 'catalog.rental_filter_options', 'catalog.sparepart_filter_options'] as $key) {
        $options = wave5CachePayload($key);

        expect($options)->toBeArray();

        foreach ($options as $value) {
            expect($value instanceof __PHP_Incomplete_Class)->toBeFalse();
        }
    }
});

test('website setting cache hits and hydrates a working model', function () {
    wave5DbCache();

    $first = WebsiteSetting::current();

    expect($first)->toBeInstanceOf(WebsiteSetting::class);

    // Hit kedua: dari cache, tetap model yang bisa di-update.
    $second = WebsiteSetting::current();

    expect($second)->toBeInstanceOf(WebsiteSetting::class)
        ->and($second->exists)->toBeTrue()
        ->and((int) $second->id)->toBe(1);

    expect(Cache::has('website_setting.current'))->toBeTrue();
});

test('show pages expose journals under snake_case key', function () {
    $admin = User::factory()->admin()->create();

    $service = Service::query()->create([
        'service_code' => 'SRV-WAVE5-KEY1',
        'customer_id' => wave5ContractCustomer()->id,
        'device_name' => 'Test Device',
        'complaint' => 'Test complaint',
        'service_status_id' => ServiceStatus::query()->firstOrCreate(
            ['slug' => 'diterima'],
            ['name' => 'Diterima', 'is_active' => true, 'sort_order' => 0],
        )->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'payment_status' => 'unpaid',
        'received_at' => now(),
        'created_by' => $admin->id,
    ]);

    // Relasi financialTransactions diserial Inertia sebagai
    // financial_transactions — komponen yang membaca camelCase tidak
    // pernah render (dead UI, hanya tertangkap e2e).
    $this->actingAs($admin)
        ->get(route('services.show', $service))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('service.financial_transactions')
            ->missing('service.financialTransactions')
        );

    $laptop = wave5ContractLaptop($admin->id);

    $this->actingAs($admin)
        ->get(route('laptops.show', $laptop))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('laptop.financial_transactions')
            ->missing('laptop.financialTransactions')
        );
});
