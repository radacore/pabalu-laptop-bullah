<?php

use App\Models\Customer;
use App\Models\FinancialTransaction;
use App\Models\PaymentMethod;
use App\Models\Service;
use App\Models\ServiceStatus;
use App\Models\Sparepart;
use App\Models\TransactionCategory;
use App\Models\User;

function wave2IncomeDeps(): void
{
    TransactionCategory::query()->firstOrCreate(
        ['type' => 'income', 'slug' => 'service-laptop'],
        ['name' => 'Service Laptop', 'is_active' => true, 'sort_order' => 0],
    );
    TransactionCategory::query()->firstOrCreate(
        ['type' => 'expense', 'slug' => 'pembelian-sparepart'],
        ['name' => 'Pembelian Sparepart', 'is_active' => true, 'sort_order' => 0],
    );
    TransactionCategory::query()->firstOrCreate(
        ['type' => 'income', 'slug' => 'penjualan-sparepart'],
        ['name' => 'Penjualan Sparepart', 'is_active' => true, 'sort_order' => 0],
    );
    PaymentMethod::query()->firstOrCreate(
        ['slug' => 'cash'],
        ['name' => 'Tunai', 'is_active' => true, 'sort_order' => 0],
    );
}

function wave2Status(string $slug, string $name): ServiceStatus
{
    return ServiceStatus::query()->firstOrCreate(
        ['slug' => $slug],
        ['name' => $name, 'is_active' => true, 'sort_order' => 0],
    );
}

function wave2Customer(): Customer
{
    return Customer::query()->create([
        'user_id' => null,
        'name' => 'Wave2 Customer',
        'phone' => fake()->unique()->numerify('08##########'),
    ]);
}

function wave2Service(int $userId, array $overrides = []): Service
{
    return Service::query()->create([
        'service_code' => 'SRV-'.now()->format('Ymd').'-'.fake()->unique()->numerify('######'),
        'customer_id' => wave2Customer()->id,
        'device_name' => 'Test Device',
        'complaint' => 'Test complaint',
        'estimated_cost' => 300_000,
        'final_cost' => null,
        'service_status_id' => wave2Status('diterima', 'Diterima')->id,
        'technician_id' => $userId,
        'tracking_code' => bin2hex(random_bytes(8)),
        'payment_status' => 'unpaid',
        'received_at' => now(),
        'created_by' => $userId,
        ...$overrides,
    ]);
}

function wave2Sparepart(int $adminId, array $overrides = []): Sparepart
{
    return Sparepart::query()->create([
        'sku' => fake()->unique()->bothify('SPR-########-####'),
        'name' => 'Wave2 Sparepart',
        'condition' => 'baru',
        'stock' => 10,
        'cost_price' => 50000,
        'selling_price' => 200000,
        'is_active' => true,
        'created_by' => $adminId,
        ...$overrides,
    ]);
}

test('correcting final cost after completion syncs the income journal', function () {
    wave2IncomeDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $selesai = wave2Status('selesai', 'Selesai');
    $service = wave2Service($user->id, ['final_cost' => 500_000]);

    $this->actingAs($user)
        ->post(route('services.updates.store', $service), [
            'description' => 'Selesai.',
            'status_to' => $selesai->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'INC-'.$service->service_code,
        'amount' => 500000,
    ]);

    // Koreksi biaya via form edit — jurnal ikut terkoreksi.
    $this->actingAs($user)
        ->put(route('services.update', $service), [
            'final_cost' => 650_000,
            'service_status_id' => $selesai->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'INC-'.$service->service_code,
        'amount' => 650000,
    ]);

    expect(FinancialTransaction::query()->where('transaction_code', 'INC-'.$service->service_code)->count())->toBe(1);
});

test('reopening a completed service removes phantom income', function () {
    wave2IncomeDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $selesai = wave2Status('selesai', 'Selesai');
    $pengerjaan = wave2Status('dalam-pengerjaan', 'Dalam Pengerjaan');
    $service = wave2Service($user->id, ['final_cost' => 500_000]);

    $this->actingAs($user)
        ->post(route('services.updates.store', $service), [
            'description' => 'Selesai.',
            'status_to' => $selesai->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'INC-'.$service->service_code,
    ]);
    expect($service->fresh()->completed_at)->not->toBeNull();

    // Buka ulang — jurnal dihapus, completed_at direset.
    $this->actingAs($user)
        ->post(route('services.updates.store', $service), [
            'description' => 'Ternyata masih ada masalah, kerjakan lagi.',
            'status_to' => $pengerjaan->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseMissing('financial_transactions', [
        'transaction_code' => 'INC-'.$service->service_code,
    ]);
    expect($service->fresh()->completed_at)->toBeNull();
});

test('deleting a service restores inventory stock and cleans its journals', function () {
    wave2IncomeDeps();
    $admin = User::factory()->create(['role' => 'admin']);
    $staff = User::factory()->create(['role' => 'staff']);
    $sparepart = wave2Sparepart($admin->id);

    $service = Service::query()->create([
        'service_code' => 'SRV-'.now()->format('Ymd').'-'.fake()->unique()->numerify('######'),
        'customer_id' => wave2Customer()->id,
        'device_name' => 'Test Device',
        'complaint' => 'Test complaint',
        'service_status_id' => wave2Status('diterima', 'Diterima')->id,
        'technician_id' => $staff->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'payment_status' => 'unpaid',
        'received_at' => now(),
        'created_by' => $staff->id,
    ]);

    // Part dari inventori + cost → stok berkurang 2, expense tercatat.
    $this->actingAs($admin)->post(route('services.parts.store', $service), [
        'part_name' => $sparepart->name,
        'quantity' => 2,
        'unit_price' => 200000,
        'cost_price' => 50000,
        'sparepart_id' => $sparepart->id,
    ])->assertSessionHasNoErrors();

    expect($sparepart->fresh()->stock)->toBe(8);

    $part = $service->parts()->latest()->firstOrFail();

    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'EXP-'.$service->service_code.'-'.$part->id,
        'amount' => 100000,
    ]);

    $this->actingAs($admin)
        ->delete(route('services.destroy', $service))
        ->assertSessionHasNoErrors();

    expect($sparepart->fresh()->stock)->toBe(10);
    $this->assertSoftDeleted('services', ['id' => $service->id]);
    $this->assertDatabaseMissing('financial_transactions', [
        'transaction_code' => 'EXP-'.$service->service_code.'-'.$part->id,
    ]);
});

test('completed service cannot be deleted for audit', function () {
    wave2IncomeDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $selesai = wave2Status('selesai', 'Selesai');
    $service = wave2Service($user->id, [
        'final_cost' => 500_000,
        'service_status_id' => $selesai->id,
    ]);

    $response = $this
        ->actingAs($user)
        ->from(route('services.index'))
        ->delete(route('services.destroy', $service));

    $response->assertSessionHasErrors('service');
    expect($service->fresh()->trashed())->toBeFalse();
});

test('editing a part cost syncs its purchase expense', function () {
    wave2IncomeDeps();
    $admin = User::factory()->create(['role' => 'admin']);
    $staff = User::factory()->create(['role' => 'staff']);

    $service = Service::query()->create([
        'service_code' => 'SRV-'.now()->format('Ymd').'-'.fake()->unique()->numerify('######'),
        'customer_id' => wave2Customer()->id,
        'device_name' => 'Test Device',
        'complaint' => 'Test complaint',
        'service_status_id' => wave2Status('diterima', 'Diterima')->id,
        'technician_id' => $staff->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'payment_status' => 'unpaid',
        'received_at' => now(),
        'created_by' => $staff->id,
    ]);

    $part = $service->parts()->create([
        'kind' => 'used',
        'part_name' => 'Kabel Fleksibel',
        'quantity' => 1,
        'cost_price' => 30000,
        'selling_price' => 80000,
        'installation_fee' => 0,
    ]);

    // Edit via form servis dengan cost naik — expense ikut naik.
    $this->actingAs($admin)
        ->put(route('services.update', $service), [
            'service_status_id' => $service->service_status_id,
            'parts' => [[
                'id' => $part->id,
                'kind' => 'used',
                'part_name' => 'Kabel Fleksibel',
                'quantity' => 1,
                'cost_price' => 45000,
                'selling_price' => 80000,
            ]],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'EXP-'.$service->service_code.'-'.$part->id,
        'amount' => 45000,
    ]);
});
