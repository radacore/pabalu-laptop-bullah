<?php

use App\Models\Customer;
use App\Models\FinancialTransaction;
use App\Models\PaymentMethod;
use App\Models\Service;
use App\Models\ServiceStatus;
use App\Models\TransactionCategory;
use App\Models\User;

function seedAutoTransactionDeps(): void
{
    // Category untuk service income
    TransactionCategory::query()->firstOrCreate(
        ['type' => 'income', 'slug' => 'service-laptop'],
        ['name' => 'Service Laptop', 'is_active' => true, 'sort_order' => 0],
    );

    // Payment method default (dipakai PaymentMethod::defaultId())
    PaymentMethod::query()->firstOrCreate(
        ['slug' => 'cash'],
        ['name' => 'Tunai', 'is_active' => true, 'sort_order' => 0],
    );
}

function autoIncomeCustomer(): Customer
{
    return Customer::query()->create([
        'user_id' => null,
        'name' => 'Test Customer',
        'phone' => fake()->unique()->numerify('08##########'),
    ]);
}

function autoIncomeStatus(string $slug, string $name): ServiceStatus
{
    return ServiceStatus::query()->firstOrCreate(
        ['slug' => $slug],
        ['name' => $name, 'is_active' => true, 'sort_order' => 0],
    );
}

function autoIncomeService(int $userId, array $overrides = []): Service
{
    return Service::query()->create([
        'service_code' => 'SRV-'.now()->format('Ymd').'-'.fake()->unique()->numerify('######'),
        'customer_id' => autoIncomeCustomer()->id,
        'device_name' => 'Test Device',
        'complaint' => 'Test complaint',
        'estimated_cost' => 300_000,
        'final_cost' => null,
        'service_status_id' => autoIncomeStatus('diterima', 'Diterima')->id,
        'technician_id' => $userId,
        'tracking_code' => bin2hex(random_bytes(8)),
        'payment_status' => 'unpaid',
        'received_at' => now(),
        'created_by' => $userId,
        ...$overrides,
    ]);
}

test('service update to completion status creates income transaction', function () {
    seedAutoTransactionDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $selesai = autoIncomeStatus('selesai', 'Selesai');
    $service = autoIncomeService($user->id, ['final_cost' => 750_000]);

    $this->actingAs($user)
        ->post(route('services.updates.store', $service), [
            'description' => 'Servis selesai, siap diambil.',
            'status_to' => $selesai->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'INC-'.$service->service_code,
        'type' => 'income',
        'amount' => 750_000,
    ]);
});

test('auto-income falls back to sum of parts if final_cost and estimated_cost are missing', function () {
    seedAutoTransactionDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $selesai = autoIncomeStatus('selesai', 'Selesai');
    $service = autoIncomeService($user->id, ['final_cost' => null, 'estimated_cost' => null]);
    $service->parts()->create([
        'part_name' => 'Battery',
        'quantity' => 1,
        'cost_price' => 100_000,
        'selling_price' => 200_000,
        'installation_fee' => 50_000,
        'kind' => 'sold',
    ]);

    $this->actingAs($user)
        ->post(route('services.updates.store', $service), [
            'description' => 'Selesai dengan sparepart battery.',
            'status_to' => $selesai->id,
        ])
        ->assertRedirect();

    // 200k + 50k = 250k
    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'INC-'.$service->service_code,
        'amount' => 250_000,
    ]);
});

test('auto-income is idempotent — updating same status twice does not create duplicate', function () {
    seedAutoTransactionDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $selesai = autoIncomeStatus('selesai', 'Selesai');
    $service = autoIncomeService($user->id, ['final_cost' => 500_000]);

    $this->actingAs($user)->post(route('services.updates.store', $service), [
        'description' => 'Selesai',
        'status_to' => $selesai->id,
    ])->assertRedirect();

    $this->actingAs($user)->post(route('services.updates.store', $service), [
        'description' => 'Selesai lagi (dummy)',
        'status_to' => $selesai->id,
    ])->assertRedirect();

    expect(FinancialTransaction::query()
        ->where('transaction_code', 'INC-'.$service->service_code)
        ->count()
    )->toBe(1);
});

test('non-completion status does not create income transaction', function () {
    seedAutoTransactionDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $pengerjaan = autoIncomeStatus('dalam-pengerjaan', 'Dalam Pengerjaan');
    $service = autoIncomeService($user->id, ['final_cost' => 500_000]);

    $this->actingAs($user)
        ->post(route('services.updates.store', $service), [
            'description' => 'Mulai kerjakan',
            'status_to' => $pengerjaan->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseMissing('financial_transactions', [
        'transaction_code' => 'INC-'.$service->service_code,
    ]);
});

test('auto-income skips silently if service category slug is not seeded', function () {
    // TransactionCategory 'service-laptop' TIDAK di-seed di test ini
    PaymentMethod::query()->firstOrCreate(
        ['slug' => 'cash'],
        ['name' => 'Tunai', 'is_active' => true, 'sort_order' => 0],
    );

    $user = User::factory()->create(['role' => 'admin']);
    $selesai = autoIncomeStatus('selesai', 'Selesai');
    $service = autoIncomeService($user->id, ['final_cost' => 500_000]);

    // Update tidak boleh throw exception walau kategori tidak ada
    $this->actingAs($user)
        ->post(route('services.updates.store', $service), [
            'description' => 'Selesai',
            'status_to' => $selesai->id,
        ])
        ->assertRedirect();

    // Service status tetap terupdate (transaction rollback tidak terjadi)
    expect($service->fresh()->service_status_id)->toBe($selesai->id);

    // Tapi tidak ada financial transaction
    $this->assertDatabaseMissing('financial_transactions', [
        'transaction_code' => 'INC-'.$service->service_code,
    ]);
});
