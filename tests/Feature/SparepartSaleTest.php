<?php

use App\Models\Customer;
use App\Models\FinancialTransaction;
use App\Models\PaymentMethod;
use App\Models\Service;
use App\Models\ServiceStatus;
use App\Models\Sparepart;
use App\Models\SparepartSale;
use App\Models\TransactionCategory;
use App\Models\User;

function seedSparepartSaleDeps(): void
{
    TransactionCategory::query()->firstOrCreate(
        ['type' => 'income', 'slug' => 'penjualan-sparepart'],
        ['name' => 'Penjualan Sparepart', 'is_active' => true, 'sort_order' => 0],
    );

    PaymentMethod::query()->firstOrCreate(
        ['slug' => 'cash'],
        ['name' => 'Tunai', 'is_active' => true, 'sort_order' => 0],
    );
}

function saleSparepart(array $overrides = []): Sparepart
{
    $admin = User::factory()->create(['role' => 'admin']);

    return Sparepart::query()->create([
        'sku' => fake()->unique()->bothify('SPR-########-####'),
        'name' => 'Keyboard Test Sale',
        'condition' => 'baru',
        'stock' => 10,
        'cost_price' => 100000,
        'selling_price' => 200000,
        'is_active' => true,
        'created_by' => $admin->id,
        ...$overrides,
    ]);
}

function saleCustomer(): Customer
{
    return Customer::query()->create([
        'user_id' => null,
        'name' => 'Pembeli Sparepart',
        'phone' => fake()->unique()->numerify('08##########'),
    ]);
}

test('sale decrements stock and creates income transaction', function () {
    seedSparepartSaleDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $sparepart = saleSparepart();

    $response = $this
        ->actingAs($user)
        ->post(route('sparepart-sales.store'), [
            'customer_id' => saleCustomer()->id,
            'sparepart_id' => $sparepart->id,
            'quantity' => 3,
        ]);

    $response->assertSessionHasNoErrors();

    expect($sparepart->fresh()->stock)->toBe(7);

    $sale = SparepartSale::query()->latest()->firstOrFail();

    expect($sale->sale_code)->toStartWith('SPS-');
    expect((float) $sale->total_amount)->toBe(600000.0);

    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'INC-'.$sale->sale_code,
        'type' => 'income',
        'amount' => 600000,
    ]);
});

test('sale rejects quantity exceeding stock', function () {
    seedSparepartSaleDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $sparepart = saleSparepart(['stock' => 2]);

    $response = $this
        ->actingAs($user)
        ->from(route('spareparts.show', $sparepart))
        ->post(route('sparepart-sales.store'), [
            'sparepart_id' => $sparepart->id,
            'quantity' => 5,
        ]);

    $response->assertSessionHasErrors('quantity');

    expect($sparepart->fresh()->stock)->toBe(2);
    expect(SparepartSale::query()->count())->toBe(0);
});

test('sale rejects inactive sparepart', function () {
    seedSparepartSaleDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $sparepart = saleSparepart(['is_active' => false]);

    $response = $this
        ->actingAs($user)
        ->from(route('spareparts.show', $sparepart))
        ->post(route('sparepart-sales.store'), [
            'sparepart_id' => $sparepart->id,
            'quantity' => 1,
        ]);

    $response->assertSessionHasErrors('sparepart_id');
    expect(SparepartSale::query()->count())->toBe(0);
});

test('deleting a sale restores stock and removes journal', function () {
    seedSparepartSaleDeps();
    $admin = User::factory()->create(['role' => 'admin']);
    $sparepart = saleSparepart(['stock' => 10]);

    $this->actingAs($admin)->post(route('sparepart-sales.store'), [
        'sparepart_id' => $sparepart->id,
        'quantity' => 4,
    ]);

    $sale = SparepartSale::query()->latest()->firstOrFail();
    expect($sparepart->fresh()->stock)->toBe(6);

    $this->actingAs($admin)
        ->delete(route('sparepart-sales.destroy', $sale))
        ->assertSessionHasNoErrors();

    expect($sparepart->fresh()->stock)->toBe(10);
    $this->assertSoftDeleted('sparepart_sales', ['id' => $sale->id]);

    // Jurnal income ikut terhapus permanen (forceDelete) agar kode bisa
    // dipakai ulang — konsisten dengan modul rental/servis.
    $this->assertDatabaseMissing('financial_transactions', [
        'transaction_code' => 'INC-'.$sale->sale_code,
    ]);
});

test('service part from inventory consumes stock and restores on delete', function () {
    seedSparepartSaleDeps();
    $admin = User::factory()->create(['role' => 'admin']);
    $staff = User::factory()->create(['role' => 'staff']);
    $sparepart = saleSparepart(['stock' => 10]);

    $customer = saleCustomer();
    $status = ServiceStatus::query()->firstOrCreate(
        ['slug' => 'diterima'],
        ['name' => 'Diterima', 'is_active' => true, 'sort_order' => 0],
    );

    $service = Service::query()->create([
        'service_code' => 'SRV-'.now()->format('Ymd').'-'.fake()->unique()->numerify('######'),
        'customer_id' => $customer->id,
        'device_name' => 'Test Device',
        'complaint' => 'Test complaint',
        'service_status_id' => $status->id,
        'technician_id' => $staff->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'payment_status' => 'unpaid',
        'received_at' => now(),
        'created_by' => $staff->id,
    ]);

    $this->actingAs($staff)->post(route('services.parts.store', $service), [
        'part_name' => $sparepart->name,
        'quantity' => 2,
        'unit_price' => 200000,
        'sparepart_id' => $sparepart->id,
    ])->assertSessionHasNoErrors();

    expect($sparepart->fresh()->stock)->toBe(8);

    $part = $service->parts()->latest()->firstOrFail();

    $this->actingAs($staff)
        ->delete(route('services.parts.destroy', [$service, $part]))
        ->assertSessionHasNoErrors();

    expect($sparepart->fresh()->stock)->toBe(10);
});

test('service part rejects quantity exceeding inventory stock', function () {
    seedSparepartSaleDeps();
    $admin = User::factory()->create(['role' => 'admin']);
    $staff = User::factory()->create(['role' => 'staff']);
    $sparepart = saleSparepart(['stock' => 1]);

    $customer = saleCustomer();
    $status = ServiceStatus::query()->firstOrCreate(
        ['slug' => 'diterima'],
        ['name' => 'Diterima', 'is_active' => true, 'sort_order' => 0],
    );

    $service = Service::query()->create([
        'service_code' => 'SRV-'.now()->format('Ymd').'-'.fake()->unique()->numerify('######'),
        'customer_id' => $customer->id,
        'device_name' => 'Test Device',
        'complaint' => 'Test complaint',
        'service_status_id' => $status->id,
        'technician_id' => $staff->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'payment_status' => 'unpaid',
        'received_at' => now(),
        'created_by' => $staff->id,
    ]);

    $this->actingAs($staff)
        ->from(route('services.show', $service))
        ->post(route('services.parts.store', $service), [
            'part_name' => $sparepart->name,
            'quantity' => 5,
            'unit_price' => 200000,
            'sparepart_id' => $sparepart->id,
        ])
        ->assertSessionHasErrors('quantity');

    expect($sparepart->fresh()->stock)->toBe(1);
    expect(FinancialTransaction::query()->where('related_type', 'service_part')->count())->toBe(0);
});
