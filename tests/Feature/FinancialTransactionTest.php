<?php

use App\Models\FinancialTransaction;
use App\Models\PaymentMethod;
use App\Models\TransactionCategory;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function validFinancialTransactionPayload(array $overrides = []): array
{
    $type = $overrides['type'] ?? 'income';

    return [
        'type' => $type,
        'transaction_category_id' => createTransactionCategory($type)->id,
        'amount' => 1250000,
        'payment_method_id' => createPaymentMethod()->id,
        'transaction_date' => '2026-06-01',
        'description' => 'Laptop sale payment.',
        ...$overrides,
    ];
}

function createTransactionCategory(string $type): TransactionCategory
{
    return TransactionCategory::query()->create([
        'name' => ucfirst($type).' Category',
        'slug' => fake()->unique()->slug(),
        'is_active' => true,
        'type' => $type,
    ]);
}

function createPaymentMethod(): PaymentMethod
{
    return PaymentMethod::query()->create([
        'name' => 'Cash',
        'slug' => fake()->unique()->slug(),
        'is_active' => true,
    ]);
}

function createFinancialTransactionRecord(array $overrides = []): FinancialTransaction
{
    $type = $overrides['type'] ?? 'income';

    return FinancialTransaction::query()->create([
        'transaction_code' => fake()->unique()->bothify('TXN-########-####'),
        'type' => $type,
        'transaction_category_id' => createTransactionCategory($type)->id,
        'amount' => 500000,
        'payment_method_id' => createPaymentMethod()->id,
        'transaction_date' => '2026-05-01',
        'description' => 'Existing transaction.',
        'created_by' => User::factory()->create()->id,
        ...$overrides,
    ]);
}

test('guests are redirected to the login page from financial transactions index', function () {
    $response = $this->get(route('financial-transactions.index'));

    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the financial transactions index', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('financial-transactions.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('financial-transactions/index')
            ->has('transactions')
            ->has('filters')
            ->has('summary')
            ->has('categories')
            ->has('payment_methods')
        );
});

test('financial transaction store validates required fields', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('financial-transactions.index'))
        ->post(route('financial-transactions.store'), []);

    $response
        ->assertRedirect(route('financial-transactions.index'))
        ->assertSessionHasErrors(['type', 'transaction_category_id', 'amount', 'payment_method_id', 'transaction_date']);
});

test('authenticated users can store a financial transaction', function () {
    $user = User::factory()->create();
    $payload = validFinancialTransactionPayload();

    $response = $this
        ->actingAs($user)
        ->post(route('financial-transactions.store'), $payload);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('financial-transactions.index'));

    $this->assertDatabaseHas('financial_transactions', [
        'type' => $payload['type'],
        'transaction_category_id' => $payload['transaction_category_id'],
        'amount' => $payload['amount'],
        'payment_method_id' => $payload['payment_method_id'],
        'description' => $payload['description'],
        'created_by' => $user->id,
    ]);

    $transaction = FinancialTransaction::query()->latest('id')->first();
    expect($transaction->transaction_date->toDateString())->toBe($payload['transaction_date']);
});

test('financial transaction update validates required fields', function () {
    $user = User::factory()->create();
    $transaction = createFinancialTransactionRecord(['created_by' => $user->id]);

    $response = $this
        ->actingAs($user)
        ->from(route('financial-transactions.index'))
        ->put(route('financial-transactions.update', $transaction), []);

    $response
        ->assertRedirect(route('financial-transactions.index'))
        ->assertSessionHasErrors(['type', 'transaction_category_id', 'amount', 'payment_method_id', 'transaction_date']);
});

test('authenticated users can update a financial transaction', function () {
    $user = User::factory()->create();
    $transaction = createFinancialTransactionRecord(['created_by' => $user->id]);
    $payload = validFinancialTransactionPayload([
        'type' => 'expense',
        'amount' => 750000,
        'description' => 'Sparepart purchase.',
    ]);

    $response = $this
        ->actingAs($user)
        ->put(route('financial-transactions.update', $transaction), $payload);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('financial-transactions.index'));

    $this->assertDatabaseHas('financial_transactions', [
        'id' => $transaction->id,
        'type' => 'expense',
        'transaction_category_id' => $payload['transaction_category_id'],
        'amount' => 750000,
        'payment_method_id' => $payload['payment_method_id'],
        'description' => 'Sparepart purchase.',
    ]);
});

test('authenticated users can destroy a financial transaction', function () {
    $user = User::factory()->create();
    $transaction = createFinancialTransactionRecord(['created_by' => $user->id]);

    $response = $this
        ->actingAs($user)
        ->delete(route('financial-transactions.destroy', $transaction));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('financial-transactions.index'));

    $this->assertSoftDeleted('financial_transactions', [
        'id' => $transaction->id,
    ]);
});

test('manual transaction rejects reserved auto category', function () {
    $user = User::factory()->create();
    $reserved = TransactionCategory::query()->create([
        'name' => 'Penjualan Laptop',
        'slug' => 'penjualan-laptop',
        'is_active' => true,
        'type' => 'income',
    ]);

    $response = $this
        ->actingAs($user)
        ->from(route('financial-transactions.index'))
        ->post(route('financial-transactions.store'), [
            'type' => 'income',
            'transaction_category_id' => $reserved->id,
            'amount' => 1000000,
            'payment_method_id' => createPaymentMethod()->id,
            'transaction_date' => '2026-06-01',
        ]);

    $response
        ->assertRedirect(route('financial-transactions.index'))
        ->assertSessionHasErrors('transaction_category_id');
});

test('manual transaction rejects type mismatch with category', function () {
    $user = User::factory()->create();
    $expenseCategory = TransactionCategory::query()->create([
        'name' => 'Operasional',
        'slug' => fake()->unique()->slug(),
        'is_active' => true,
        'type' => 'expense',
    ]);

    $response = $this
        ->actingAs($user)
        ->from(route('financial-transactions.index'))
        ->post(route('financial-transactions.store'), [
            'type' => 'income',
            'transaction_category_id' => $expenseCategory->id,
            'amount' => 1000000,
            'payment_method_id' => createPaymentMethod()->id,
            'transaction_date' => '2026-06-01',
        ]);

    $response
        ->assertRedirect(route('financial-transactions.index'))
        ->assertSessionHasErrors('transaction_category_id');
});

test('manual transaction rejects zero amount and related link', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('financial-transactions.index'))
        ->post(route('financial-transactions.store'), array_merge(
            validFinancialTransactionPayload(),
            ['amount' => 0, 'related_type' => 'service', 'related_id' => 1],
        ));

    $response
        ->assertRedirect(route('financial-transactions.index'))
        ->assertSessionHasErrors(['amount', 'related_type', 'related_id']);
});

test('auto transaction cannot be updated or deleted manually', function () {
    $user = User::factory()->create();
    $transaction = createFinancialTransactionRecord([
        'created_by' => $user->id,
        'related_type' => 'service',
        'related_id' => 1,
    ]);

    $this->actingAs($user)
        ->from(route('financial-transactions.index'))
        ->put(route('financial-transactions.update', $transaction), [
            'type' => 'income',
            'transaction_category_id' => $transaction->transaction_category_id,
            'amount' => 999,
            'payment_method_id' => $transaction->payment_method_id,
            'transaction_date' => '2026-06-01',
        ])
        ->assertRedirect(route('financial-transactions.index'))
        ->assertSessionHasErrors('transaction');

    $this->actingAs($user)
        ->delete(route('financial-transactions.destroy', $transaction))
        ->assertRedirect()
        ->assertSessionHasErrors('transaction');

    $this->assertDatabaseHas('financial_transactions', [
        'id' => $transaction->id,
        'amount' => 500000,
    ]);
});

test('export downloads all filtered rows as csv ignoring pagination', function () {
    $user = User::factory()->create(['role' => 'admin']);

    for ($i = 0; $i < 12; $i++) {
        createFinancialTransactionRecord(['transaction_date' => now()->subDays(5)->toDateString()]);
    }

    // Satu di luar range default 90 hari.
    createFinancialTransactionRecord(['transaction_date' => now()->subDays(200)->toDateString()]);

    $response = $this
        ->actingAs($user)
        ->get(route('financial-transactions.export'));

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toContain('text/csv');

    $lines = array_values(array_filter(explode("\n", trim($response->streamedContent()))));

    // Header + 12 baris (tanpa paginasi, tanpa yang di luar range).
    expect($lines)->toHaveCount(13);
    expect($lines[0])->toContain('Tanggal');
    expect($lines[0])->toContain('Metode Pembayaran');
});

test('export respects custom date range', function () {
    $user = User::factory()->create(['role' => 'admin']);

    createFinancialTransactionRecord(['transaction_date' => '2026-09-10']);
    createFinancialTransactionRecord(['transaction_date' => '2026-09-20']);

    $response = $this
        ->actingAs($user)
        ->get(route('financial-transactions.export', [
            'from_date' => '2026-09-01',
            'to_date' => '2026-09-15',
        ]));

    $response->assertOk();

    $lines = array_values(array_filter(explode("\n", trim($response->streamedContent()))));

    expect($lines)->toHaveCount(2);
    expect($response->headers->get('Content-Disposition'))->toContain('transaksi-2026-09-01_2026-09-15.csv');
});
