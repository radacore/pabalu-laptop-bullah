<?php

use App\Models\Sparepart;
use App\Models\SparepartType;
use App\Models\TransactionCategory;
use App\Models\User;

function sparepartType(string $slug = 'baterai-test', string $name = 'Baterai Test'): SparepartType
{
    return SparepartType::query()->firstOrCreate(
        ['slug' => $slug],
        ['name' => $name, 'is_active' => true, 'sort_order' => 0],
    );
}

function validSparepartPayload(array $overrides = []): array
{
    return [
        'name' => 'Baterai ThinkPad T480 Original',
        'sparepart_type_id' => sparepartType()->id,
        'condition' => 'baru',
        'stock' => 10,
        'cost_price' => 250000,
        'selling_price' => 400000,
        'description' => 'Original, garansi 3 bulan.',
        'is_active' => true,
        ...$overrides,
    ];
}

function sparepartRecord(array $overrides = []): Sparepart
{
    $admin = User::factory()->create(['role' => 'admin']);

    return Sparepart::query()->create([
        'sku' => fake()->unique()->bothify('SPR-########-####'),
        'name' => 'Layar 14 inch IPS',
        'sparepart_type_id' => sparepartType('layar-test', 'Layar Test')->id,
        'condition' => 'bekas',
        'stock' => 5,
        'cost_price' => 500000,
        'selling_price' => 750000,
        'is_active' => true,
        'created_by' => $admin->id,
        ...$overrides,
    ]);
}

test('guests are redirected to the login page from spareparts index', function () {
    $response = $this->get(route('spareparts.index'));

    $response->assertRedirect(route('login'));
});

test('staff is locked out of the spareparts index while dormant', function () {
    $user = User::factory()->create(['role' => 'staff']);

    $this->actingAs($user)
        ->get(route('spareparts.index'))
        ->assertForbidden();
});

test('sparepart store validates required fields', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $response = $this
        ->actingAs($user)
        ->from(route('spareparts.index'))
        ->post(route('spareparts.store'), []);

    $response
        ->assertRedirect(route('spareparts.index'))
        ->assertSessionHasErrors(['name', 'condition', 'stock', 'selling_price']);
});

test('sparepart store rejects invalid condition', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $response = $this
        ->actingAs($user)
        ->from(route('spareparts.index'))
        ->post(route('spareparts.store'), validSparepartPayload(['condition' => 'rekondisi']));

    $response
        ->assertRedirect(route('spareparts.index'))
        ->assertSessionHasErrors('condition');
});

test('authenticated users can store a sparepart with auto slug and purchase expense', function () {
    $user = User::factory()->create(['role' => 'admin']);
    TransactionCategory::query()->firstOrCreate(
        ['type' => 'expense', 'slug' => 'pembelian-sparepart'],
        ['name' => 'Pembelian Sparepart', 'is_active' => true, 'sort_order' => 0],
    );
    $payload = validSparepartPayload();

    $response = $this
        ->actingAs($user)
        ->post(route('spareparts.store'), $payload);

    $response->assertSessionHasNoErrors();

    $sparepart = Sparepart::query()->where('name', $payload['name'])->firstOrFail();

    $response->assertRedirect(route('spareparts.show', $sparepart));

    expect($sparepart->slug)->not->toBeEmpty();
    expect($sparepart->sku)->toStartWith('SPR-');

    // cost 250000 × stock 10 = 2.500.000 expense.
    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'EXP-'.$sparepart->sku,
        'type' => 'expense',
        'amount' => 2500000,
    ]);
});

test('authenticated users can update a sparepart', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $sparepart = sparepartRecord();

    $response = $this
        ->actingAs($user)
        ->put(route('spareparts.update', $sparepart), [
            'sku' => $sparepart->sku,
            'name' => 'Layar 14 inch IPS Updated',
            'condition' => 'bekas',
            'stock' => 8,
            'selling_price' => 800000,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('spareparts.index'));

    $this->assertDatabaseHas('spareparts', [
        'id' => $sparepart->id,
        'name' => 'Layar 14 inch IPS Updated',
        'stock' => 8,
    ]);
});

test('authenticated users can destroy a sparepart', function () {
    $user = User::factory()->create(['role' => 'admin']);
    $sparepart = sparepartRecord();

    $response = $this
        ->actingAs($user)
        ->delete(route('spareparts.destroy', $sparepart));

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('spareparts.index'));

    $this->assertSoftDeleted('spareparts', ['id' => $sparepart->id]);
});
