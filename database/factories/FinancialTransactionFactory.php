<?php

namespace Database\Factories;

use App\Models\FinancialTransaction;
use App\Models\PaymentMethod;
use App\Models\TransactionCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FinancialTransaction>
 */
class FinancialTransactionFactory extends Factory
{
    protected $model = FinancialTransaction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $type = fake()->randomElement(['income', 'expense']);

        return [
            'transaction_code' => fake()->unique()->bothify('TXN-########-####'),
            'type' => $type,
            'transaction_category_id' => fn () => TransactionCategory::query()->firstOrCreate(
                ['type' => $type, 'slug' => $type === 'income' ? 'service-laptop' : 'operasional-toko'],
                [
                    'name' => $type === 'income' ? 'Service Laptop' : 'Operasional Toko',
                    'is_active' => true,
                    'sort_order' => 0,
                ],
            )->id,
            'amount' => fake()->numberBetween(50_000, 5_000_000),
            'payment_method_id' => fn () => PaymentMethod::query()->firstOrCreate(
                ['slug' => 'cash'],
                ['name' => 'Tunai', 'is_active' => true, 'sort_order' => 0],
            )->id,
            'transaction_date' => fake()->date(),
            'description' => fake()->sentence(),
            'related_type' => null,
            'related_id' => null,
            'created_by' => fn () => User::factory()->create()->id,
        ];
    }
}
