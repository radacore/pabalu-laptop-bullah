<?php

use App\Models\Brand;
use App\Models\FinancialTransaction;
use App\Models\Laptop;
use App\Models\LaptopSource;
use App\Models\LaptopStatus;
use App\Models\PaymentMethod;
use App\Models\TransactionCategory;
use App\Models\User;

function wave2LaptopDeps(): void
{
    TransactionCategory::query()->firstOrCreate(
        ['type' => 'expense', 'slug' => 'pembelian-stok-laptop'],
        ['name' => 'Pembelian Stok Laptop', 'is_active' => true, 'sort_order' => 0],
    );
    TransactionCategory::query()->firstOrCreate(
        ['type' => 'income', 'slug' => 'penjualan-laptop'],
        ['name' => 'Penjualan Laptop', 'is_active' => true, 'sort_order' => 0],
    );
    PaymentMethod::query()->firstOrCreate(
        ['slug' => 'cash'],
        ['name' => 'Tunai', 'is_active' => true, 'sort_order' => 0],
    );
}

function wave2LaptopStatus(string $slug, string $name): LaptopStatus
{
    return LaptopStatus::query()->firstOrCreate(
        ['slug' => $slug],
        ['name' => $name, 'is_active' => true, 'sort_order' => 0],
    );
}

function wave2LaptopRecord(int $userId, array $overrides = []): Laptop
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
        'repair_cost' => 0,
        'laptop_status_id' => wave2LaptopStatus('tersedia', 'Tersedia')->id,
        'created_by' => $userId,
        ...$overrides,
    ]);
}

function wave2LaptopPayload(Laptop $laptop, array $overrides = []): array
{
    return [
        'sku' => $laptop->sku,
        'name' => $laptop->name,
        'brand_id' => $laptop->brand_id,
        'model' => $laptop->model,
        'purchase_date' => '2026-06-01',
        'cost_price' => $laptop->cost_price,
        'selling_price' => $laptop->selling_price,
        'laptop_status_id' => $laptop->laptop_status_id,
        ...$overrides,
    ];
}

test('correcting laptop cost syncs the purchase expense journal', function () {
    wave2LaptopDeps();
    $user = User::factory()->create(['role' => 'admin']);

    $this->actingAs($user)
        ->post(route('laptops.store'), [
            'name' => 'Lenovo ThinkPad T14',
            'brand_id' => Brand::query()->firstOrCreate(['slug' => 'lenovo'], ['name' => 'Lenovo', 'is_active' => true, 'sort_order' => 0])->id,
            'model' => 'ThinkPad T14',
            'purchase_date' => '2026-06-01',
            'cost_price' => 5500000,
            'selling_price' => 7500000,
        ])
        ->assertRedirect();

    $stored = Laptop::query()->latest()->firstOrFail();

    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'EXP-'.$stored->sku,
        'amount' => 5500000,
    ]);

    // Koreksi modal via edit — expense ikut terkoreksi, tetap 1 baris.
    $this->actingAs($user)
        ->put(route('laptops.update', $stored), wave2LaptopPayload($stored->fresh(), ['cost_price' => 5800000]))
        ->assertRedirect();

    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'EXP-'.$stored->sku,
        'amount' => 5800000,
    ]);

    expect(FinancialTransaction::query()->where('transaction_code', 'EXP-'.$stored->sku)->count())->toBe(1);
});

test('marking laptop sold then correcting price syncs income; moving out removes it', function () {
    wave2LaptopDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $laptop = wave2LaptopRecord($user->id);
    $terjual = wave2LaptopStatus('terjual', 'Terjual');
    $tersedia = wave2LaptopStatus('tersedia', 'Tersedia');

    // Jual dulu.
    $this->actingAs($user)
        ->put(route('laptops.update', $laptop), wave2LaptopPayload($laptop, ['laptop_status_id' => $terjual->id]))
        ->assertRedirect();

    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'INC-'.$laptop->sku,
        'amount' => 7500000,
    ]);
    expect($laptop->fresh()->sold_at)->not->toBeNull();

    // Koreksi harga jual — income ikut terkoreksi.
    $this->actingAs($user)
        ->put(route('laptops.update', $laptop), wave2LaptopPayload($laptop, [
            'laptop_status_id' => $terjual->id,
            'selling_price' => 7200000,
        ]))
        ->assertRedirect();

    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'INC-'.$laptop->sku,
        'amount' => 7200000,
    ]);

    // Geser keluar dari terjual (return) — income dihapus, sold_at direset.
    $this->actingAs($user)
        ->put(route('laptops.update', $laptop), wave2LaptopPayload($laptop, [
            'laptop_status_id' => $tersedia->id,
            'selling_price' => 7200000,
        ]))
        ->assertRedirect();

    $this->assertDatabaseMissing('financial_transactions', [
        'transaction_code' => 'INC-'.$laptop->sku,
    ]);
    expect($laptop->fresh()->sold_at)->toBeNull();
});

test('deleting a laptop cleans its purchase and sales journals', function () {
    wave2LaptopDeps();
    $user = User::factory()->create(['role' => 'admin']);

    // Buat via HTTP agar expense pembelian ikut tercatat.
    $this->actingAs($user)
        ->post(route('laptops.store'), [
            'name' => 'Lenovo ThinkPad T14',
            'brand_id' => Brand::query()->firstOrCreate(['slug' => 'lenovo'], ['name' => 'Lenovo', 'is_active' => true, 'sort_order' => 0])->id,
            'model' => 'ThinkPad T14',
            'purchase_date' => '2026-06-01',
            'cost_price' => 5500000,
            'selling_price' => 7500000,
        ])
        ->assertRedirect();

    $laptop = Laptop::query()->latest()->firstOrFail();

    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'EXP-'.$laptop->sku,
    ]);

    $this->actingAs($user)
        ->delete(route('laptops.destroy', $laptop))
        ->assertSessionHasNoErrors();

    $this->assertSoftDeleted('laptops', ['id' => $laptop->id]);
    $this->assertDatabaseMissing('financial_transactions', [
        'transaction_code' => 'EXP-'.$laptop->sku,
    ]);
});

test('sold laptop can be re-sold after return: code is reusable', function () {
    wave2LaptopDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $laptop = wave2LaptopRecord($user->id);
    $terjual = wave2LaptopStatus('terjual', 'Terjual');
    $tersedia = wave2LaptopStatus('tersedia', 'Tersedia');

    $this->actingAs($user)
        ->put(route('laptops.update', $laptop), wave2LaptopPayload($laptop, ['laptop_status_id' => $terjual->id]))
        ->assertRedirect();

    $this->actingAs($user)
        ->put(route('laptops.update', $laptop), wave2LaptopPayload($laptop, ['laptop_status_id' => $tersedia->id]))
        ->assertRedirect();

    $this->assertDatabaseMissing('financial_transactions', [
        'transaction_code' => 'INC-'.$laptop->sku,
    ]);

    // Jual lagi — tidak kena tabrakan unique transaction_code.
    $this->actingAs($user)
        ->put(route('laptops.update', $laptop), wave2LaptopPayload($laptop, ['laptop_status_id' => $terjual->id]))
        ->assertRedirect();

    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'INC-'.$laptop->sku,
        'amount' => 7500000,
    ]);
});
