<?php

use App\Models\Brand;
use App\Models\Customer;
use App\Models\FinancialTransaction;
use App\Models\Laptop;
use App\Models\LaptopStatus;
use App\Models\PaymentMethod;
use App\Models\Rental;
use App\Models\RentalStatus;
use App\Models\TransactionCategory;
use App\Models\User;

function seedRentalDeps(): void
{
    TransactionCategory::query()->firstOrCreate(
        ['type' => 'income', 'slug' => 'sewa-laptop'],
        ['name' => 'Sewa Laptop', 'is_active' => true, 'sort_order' => 0],
    );

    TransactionCategory::query()->firstOrCreate(
        ['type' => 'income', 'slug' => 'denda-sewa'],
        ['name' => 'Denda Sewa', 'is_active' => true, 'sort_order' => 0],
    );

    PaymentMethod::query()->firstOrCreate(
        ['slug' => 'cash'],
        ['name' => 'Tunai', 'is_active' => true, 'sort_order' => 0],
    );
}

function rentalCustomer(): Customer
{
    return Customer::query()->create([
        'user_id' => null,
        'name' => 'Test Renter',
        'phone' => fake()->unique()->numerify('08##########'),
    ]);
}

function rentalStatus(string $slug, string $name): RentalStatus
{
    return RentalStatus::query()->firstOrCreate(
        ['slug' => $slug],
        ['name' => $name, 'is_active' => true, 'sort_order' => 0],
    );
}

function ensureLaptopStatuses(): void
{
    foreach ([['tersedia', 'Tersedia'], ['disewa', 'Disewa'], ['terjual', 'Terjual']] as [$slug, $name]) {
        LaptopStatus::query()->firstOrCreate(
            ['slug' => $slug],
            ['name' => $name, 'is_active' => true, 'sort_order' => 0],
        );
    }
}

function rentalLaptop(int $userId, array $overrides = []): Laptop
{
    ensureLaptopStatuses();
    $brand = Brand::query()->firstOrCreate(
        ['slug' => 'rental-test-brand'],
        ['name' => 'RentalTest', 'is_active' => true, 'sort_order' => 0],
    );
    $status = LaptopStatus::query()->firstOrCreate(
        ['slug' => 'tersedia'],
        ['name' => 'Tersedia', 'is_active' => true, 'sort_order' => 0],
    );

    return Laptop::query()->create([
        'sku' => fake()->unique()->bothify('PBL-########-####'),
        'name' => 'Rental Unit',
        'brand_id' => $brand->id,
        'model' => 'Test Model',
        'purchase_date' => '2026-01-01',
        'cost_price' => 5000000,
        'selling_price' => 7000000,
        'laptop_status_id' => $status->id,
        'is_rentable' => true,
        'daily_rate' => 100000,
        'created_by' => $userId,
        ...$overrides,
    ]);
}

function rentalRecord(int $userId, array $overrides = []): Rental
{
    return Rental::query()->create([
        'rental_code' => 'RNT-'.now()->format('Ymd').'-'.fake()->unique()->numerify('######'),
        'customer_id' => rentalCustomer()->id,
        'laptop_id' => rentalLaptop($userId)->id,
        'rental_status_id' => rentalStatus('dipesan', 'Dipesan')->id,
        'tracking_code' => bin2hex(random_bytes(8)),
        'daily_rate' => 100000,
        'deposit' => 500000,
        'payment_status' => 'unpaid',
        'rented_at' => now()->subDays(3),
        'due_at' => now()->addDays(4),
        'created_by' => $userId,
        ...$overrides,
    ]);
}

test('rental completion creates income transaction', function () {
    seedRentalDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $rental = rentalRecord($user->id);
    $selesai = rentalStatus('selesai', 'Selesai');

    $this->actingAs($user)
        ->put(route('rentals.update', $rental), ['rental_status_id' => $selesai->id])
        ->assertRedirect();

    // 7 hari (3 lalu + hari ini + ... ) — hitung ekspektasi via model.
    $expected = (float) $rental->fresh()->total_cost;

    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'INC-'.$rental->rental_code,
        'type' => 'income',
        'amount' => $expected,
    ]);
});

test('auto-income falls back to daily rate times days', function () {
    seedRentalDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $rental = rentalRecord($user->id, [
        'rented_at' => now()->subDays(2),
        'due_at' => now()->addDay(),
    ]);
    $selesai = rentalStatus('selesai', 'Selesai');

    $this->actingAs($user)
        ->put(route('rentals.update', $rental), ['rental_status_id' => $selesai->id])
        ->assertRedirect();

    $fresh = $rental->fresh();

    expect((int) $fresh->total_days)->toBeGreaterThanOrEqual(1);
    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'INC-'.$rental->rental_code,
        'amount' => (float) $fresh->total_cost,
    ]);
});

test('auto-income is idempotent on repeated completion updates', function () {
    seedRentalDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $rental = rentalRecord($user->id);
    $selesai = rentalStatus('selesai', 'Selesai');

    $this->actingAs($user)
        ->put(route('rentals.update', $rental), ['rental_status_id' => $selesai->id])
        ->assertRedirect();
    $this->actingAs($user)
        ->put(route('rentals.update', $rental), ['note' => 'update lagi'])
        ->assertRedirect();

    expect(FinancialTransaction::query()
        ->where('transaction_code', 'INC-'.$rental->rental_code)
        ->count()
    )->toBe(1);
});

test('non-completion status does not create income transaction', function () {
    seedRentalDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $rental = rentalRecord($user->id);
    $aktif = rentalStatus('aktif-disewa', 'Aktif Disewa');

    $this->actingAs($user)
        ->put(route('rentals.update', $rental), ['rental_status_id' => $aktif->id])
        ->assertRedirect();

    $this->assertDatabaseMissing('financial_transactions', [
        'transaction_code' => 'INC-'.$rental->rental_code,
    ]);

    // Unit dikunci dari penjualan.
    expect($rental->laptop->fresh()->status->slug)->toBe('disewa');
});

test('missing category skips silently without exception', function () {
    PaymentMethod::query()->firstOrCreate(
        ['slug' => 'cash'],
        ['name' => 'Tunai', 'is_active' => true, 'sort_order' => 0],
    );

    $user = User::factory()->create(['role' => 'admin']);
    $rental = rentalRecord($user->id);
    $selesai = rentalStatus('selesai', 'Selesai');

    $this->actingAs($user)
        ->put(route('rentals.update', $rental), ['rental_status_id' => $selesai->id])
        ->assertRedirect();

    expect($rental->fresh()->rental_status_id)->toBe($selesai->id);

    $this->assertDatabaseMissing('financial_transactions', [
        'transaction_code' => 'INC-'.$rental->rental_code,
    ]);
});

test('late return creates denda transaction', function () {
    seedRentalDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $rental = rentalRecord($user->id, [
        'rented_at' => now()->subDays(10),
        'due_at' => now()->subDays(3),
    ]);
    $selesai = rentalStatus('selesai', 'Selesai');

    $this->actingAs($user)
        ->put(route('rentals.update', $rental), [
            'rental_status_id' => $selesai->id,
            'returned_at' => now()->toDateTimeString(),
        ])
        ->assertRedirect();

    // 3 hari telat × 100000 = 300000. total_cost mencakup s.d. kembali
    // aktual (11 hari × 100000 = 1.100.000), denda tercatat terpisah.
    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'INC-'.$rental->rental_code.'-DENDA',
        'amount' => 300000,
    ]);

    expect((float) $rental->fresh()->total_cost)->toBe(1100000.0);
});

test('early return is prorated to actual return date', function () {
    seedRentalDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $rental = rentalRecord($user->id, [
        'rented_at' => now()->subDays(6),
        'due_at' => now()->addDays(7),
    ]);
    $selesai = rentalStatus('selesai', 'Selesai');
    $returnedAt = now()->subDay()->toDateTimeString();

    $this->actingAs($user)
        ->put(route('rentals.update', $rental), [
            'rental_status_id' => $selesai->id,
            'returned_at' => $returnedAt,
        ])
        ->assertRedirect();

    // Kembali awal: hanya hari terpakai yang ditagih + tanpa denda.
    expect((int) $rental->fresh()->total_days)->toBe(6);

    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'INC-'.$rental->rental_code,
        'amount' => 600000,
    ]);
    $this->assertDatabaseMissing('financial_transactions', [
        'transaction_code' => 'INC-'.$rental->rental_code.'-DENDA',
    ]);
});

test('correcting return date corrects income and removes stale denda', function () {
    seedRentalDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $rental = rentalRecord($user->id, [
        'rented_at' => now()->subDays(10),
        'due_at' => now()->subDays(3),
    ]);
    $selesai = rentalStatus('selesai', 'Selesai');

    // Selesaikan dalam keadaan telat dulu.
    $this->actingAs($user)
        ->put(route('rentals.update', $rental), [
            'rental_status_id' => $selesai->id,
            'returned_at' => now()->toDateTimeString(),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'INC-'.$rental->rental_code.'-DENDA',
        'amount' => 300000,
    ]);

    // Koreksi: ternyata kembali tepat pada jatuh tempo → denda hilang.
    // Income tetap = snapshot penyelesaian pertama (11 hari × 100000 =
    // 1.100.000): tanggal kembali yang baru SAMA-ATAU-SETELAH tanggal
    // penyelesaian pertama tidak me-reopen periode yang sudah dibukukan.
    // Ambil due_at FRESH dari DB karena bisa bergeser detik vs now().
    $dueDate = $rental->fresh()->due_at->toDateTimeString();

    $this->actingAs($user)
        ->put(route('rentals.update', $rental), [
            'rental_status_id' => $selesai->id,
            'returned_at' => $dueDate,
        ])
        ->assertRedirect();

    $this->assertDatabaseMissing('financial_transactions', [
        'transaction_code' => 'INC-'.$rental->rental_code.'-DENDA',
    ]);
    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'INC-'.$rental->rental_code,
        'amount' => 1100000,
    ]);
});

test('cancelling after completion removes income', function () {
    seedRentalDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $rental = rentalRecord($user->id);
    $selesai = rentalStatus('selesai', 'Selesai');
    $batal = rentalStatus('dibatalkan', 'Dibatalkan');

    $this->actingAs($user)
        ->put(route('rentals.update', $rental), ['rental_status_id' => $selesai->id])
        ->assertRedirect();

    $this->assertDatabaseHas('financial_transactions', [
        'transaction_code' => 'INC-'.$rental->rental_code,
    ]);

    $this->actingAs($user)
        ->put(route('rentals.update', $rental), ['rental_status_id' => $batal->id])
        ->assertRedirect();

    $this->assertDatabaseMissing('financial_transactions', [
        'transaction_code' => 'INC-'.$rental->rental_code,
    ]);

    // Unit kembali bebas disewakan.
    expect($rental->laptop->fresh()->status->slug)->toBe('tersedia');
});

test('returned laptop status goes back to tersedia', function () {
    seedRentalDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $rental = rentalRecord($user->id);
    $aktif = rentalStatus('aktif-disewa', 'Aktif Disewa');
    $kembali = rentalStatus('sudah-kembali', 'Sudah Kembali');

    $this->actingAs($user)
        ->put(route('rentals.update', $rental), ['rental_status_id' => $aktif->id])
        ->assertRedirect();

    expect($rental->laptop->fresh()->status->slug)->toBe('disewa');

    $this->actingAs($user)
        ->put(route('rentals.update', $rental), ['rental_status_id' => $kembali->id])
        ->assertRedirect();

    expect($rental->laptop->fresh()->status->slug)->toBe('tersedia');
});

test('rented laptop cannot be marked as sold', function () {
    seedRentalDeps();
    $user = User::factory()->create(['role' => 'admin']);
    $rental = rentalRecord($user->id);
    $laptop = $rental->laptop;
    $aktif = rentalStatus('aktif-disewa', 'Aktif Disewa');
    $terjual = LaptopStatus::query()->firstOrCreate(
        ['slug' => 'terjual'],
        ['name' => 'Terjual', 'is_active' => true, 'sort_order' => 0],
    );

    $this->actingAs($user)
        ->put(route('rentals.update', $rental), ['rental_status_id' => $aktif->id])
        ->assertRedirect();

    $response = $this
        ->actingAs($user)
        ->from(route('laptops.edit', $laptop))
        ->put(route('laptops.update', $laptop), [
            'sku' => $laptop->sku,
            'name' => $laptop->name,
            'brand_id' => $laptop->brand_id,
            'model' => $laptop->model,
            'purchase_date' => '2026-01-01',
            'cost_price' => 5000000,
            'selling_price' => 7000000,
            'laptop_status_id' => $terjual->id,
        ]);

    $response->assertRedirect(route('laptops.edit', $laptop));
    $response->assertSessionHasErrors('laptop_status_id');

    expect($laptop->fresh()->status->slug)->toBe('disewa');
});
