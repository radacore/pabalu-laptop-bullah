<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\FinancialTransaction;
use App\Models\LaptopSource;
use App\Models\LaptopStatus;
use App\Models\PaymentMethod;
use App\Models\ServiceStatus;
use App\Models\SparepartType;
use App\Models\TransactionCategory;
use App\Models\User;

// Smoke test setiap master data resource — CRUD dasar.
// Fokus: role gating (admin-only), tidak crash render, dan flow store/destroy.

// Kolom `slug` di controller di-auto-generate dari `name` via Str::slug.
// Test kirim `name` dengan hyphen supaya slug expected match hasil generate.
$masterDataResources = [
    'brands' => ['model' => Brand::class, 'table' => 'brands', 'name' => 'Test Brand', 'slug' => 'test-brand', 'extra' => []],
    'categories' => ['model' => Category::class, 'table' => 'categories', 'name' => 'Test Category', 'slug' => 'test-category', 'extra' => []],
    'laptop-sources' => ['model' => LaptopSource::class, 'table' => 'laptop_sources', 'name' => 'Test Source', 'slug' => 'test-source', 'extra' => []],
    'laptop-statuses' => ['model' => LaptopStatus::class, 'table' => 'laptop_statuses', 'name' => 'Test Status', 'slug' => 'test-status', 'extra' => ['color' => '#000000']],
    'service-statuses' => ['model' => ServiceStatus::class, 'table' => 'service_statuses', 'name' => 'Test Svc Status', 'slug' => 'test-svc-status', 'extra' => ['color' => 'blue']],
    'payment-methods' => ['model' => PaymentMethod::class, 'table' => 'payment_methods', 'name' => 'Test Pay', 'slug' => 'test-pay', 'extra' => []],
    'sparepart-types' => ['model' => SparepartType::class, 'table' => 'sparepart_types', 'name' => 'Test Part', 'slug' => 'test-part', 'extra' => []],
];

foreach ($masterDataResources as $route => $config) {
    test("{$route} index page loads for admin", function () use ($route) {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get(route("master-data.{$route}.index"))
            ->assertOk();
    });

    test("{$route} rejects non-admin (staff) with 403", function () use ($route) {
        $staff = User::factory()->create(['role' => 'staff']);

        $this->actingAs($staff)
            ->get(route("master-data.{$route}.index"))
            ->assertForbidden();
    });

    test("{$route} rejects guest with redirect to login", function () use ($route) {
        $this->get(route("master-data.{$route}.index"))
            ->assertRedirect(route('login'));
    });

    test("{$route} store creates a new record", function () use ($route, $config) {
        $admin = User::factory()->create(['role' => 'admin']);

        $payload = array_merge([
            'name' => $config['name'],
            'is_active' => true,
            'sort_order' => 0,
        ], $config['extra']);

        $this->actingAs($admin)
            ->post(route("master-data.{$route}.store"), $payload)
            ->assertRedirect();

        $this->assertDatabaseHas($config['table'], [
            'slug' => $config['slug'],
        ]);
    });
}

// Transaction categories punya field `type` yang mandatory
test('transaction-categories index page loads for admin', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->get(route('master-data.transaction-categories.index'))
        ->assertOk();
});

test('transaction-categories store creates a new record', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->post(route('master-data.transaction-categories.store'), [
            'name' => 'Test Cat Income',
            'type' => 'income',
            'is_active' => true,
            'sort_order' => 0,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('transaction_categories', [
        'slug' => 'test-cat-income',
        'type' => 'income',
    ]);
});

test('master-data.index landing page loads for admin', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->get(route('master-data.index'))
        ->assertOk();
});

test('master-data.index rejects staff role', function () {
    $staff = User::factory()->create(['role' => 'staff']);

    $this->actingAs($staff)
        ->get(route('master-data.index'))
        ->assertForbidden();
});

test('reserved transaction category cannot be renamed', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $category = TransactionCategory::query()->create([
        'name' => 'Penjualan Laptop',
        'slug' => 'penjualan-laptop',
        'is_active' => true,
        'type' => 'income',
    ]);

    $response = $this
        ->actingAs($admin)
        ->from(route('master-data.transaction-categories.edit', $category))
        ->put(route('master-data.transaction-categories.update', $category), [
            'name' => 'Penjualan Unit',
            'is_active' => true,
            'type' => 'income',
        ]);

    $response
        ->assertRedirect(route('master-data.transaction-categories.edit', $category))
        ->assertSessionHasErrors('name');

    expect($category->fresh()->slug)->toBe('penjualan-laptop');
});

test('transaction category in use cannot be destroyed', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $category = TransactionCategory::query()->create([
        'name' => 'Operasional',
        'slug' => 'operasional-test-guard',
        'is_active' => true,
        'type' => 'expense',
    ]);

    FinancialTransaction::query()->create([
        'transaction_code' => fake()->unique()->bothify('TXN-########-####'),
        'type' => 'expense',
        'transaction_category_id' => $category->id,
        'amount' => 100000,
        'transaction_date' => '2026-06-01',
        'created_by' => $admin->id,
    ]);

    $response = $this
        ->actingAs($admin)
        ->from(route('master-data.transaction-categories.index'))
        ->delete(route('master-data.transaction-categories.destroy', $category));

    $response
        ->assertRedirect(route('master-data.transaction-categories.index'))
        ->assertSessionHasErrors('category');

    $this->assertDatabaseHas('transaction_categories', ['id' => $category->id]);
});

test('cash payment method cannot be renamed', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $method = PaymentMethod::query()->create([
        'name' => 'Tunai',
        'slug' => 'cash',
        'is_active' => true,
    ]);

    $response = $this
        ->actingAs($admin)
        ->from(route('master-data.payment-methods.edit', $method))
        ->put(route('master-data.payment-methods.update', $method), [
            'name' => 'Cash Keras',
            'is_active' => true,
        ]);

    $response
        ->assertRedirect(route('master-data.payment-methods.edit', $method))
        ->assertSessionHasErrors('name');

    expect($method->fresh()->slug)->toBe('cash');
});

test('payment method in use cannot be destroyed', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $method = PaymentMethod::query()->create([
        'name' => 'Transfer Test',
        'slug' => 'transfer-test-guard',
        'is_active' => true,
    ]);

    FinancialTransaction::query()->create([
        'transaction_code' => fake()->unique()->bothify('TXN-########-####'),
        'type' => 'expense',
        'transaction_category_id' => TransactionCategory::query()->create([
            'name' => 'Operasional Test',
            'slug' => fake()->unique()->slug(),
            'is_active' => true,
            'type' => 'expense',
        ])->id,
        'amount' => 50000,
        'payment_method_id' => $method->id,
        'transaction_date' => '2026-06-01',
        'created_by' => $admin->id,
    ]);

    $response = $this
        ->actingAs($admin)
        ->from(route('master-data.payment-methods.index'))
        ->delete(route('master-data.payment-methods.destroy', $method));

    $response
        ->assertRedirect(route('master-data.payment-methods.index'))
        ->assertSessionHasErrors('method');

    $this->assertDatabaseHas('payment_methods', ['id' => $method->id]);
});
