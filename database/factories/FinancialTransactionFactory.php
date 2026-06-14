<?php

namespace Database\Factories;

use App\Models\FinancialTransaction;
use App\Models\PaymentMethod;
use App\Models\TransactionCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

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
            'transaction_category_id' => fn () => TransactionCategory::query()->create([
                'name' => Str::title($type).' Category',
                'slug' => $type.'-category-'.Str::random(8),
                'is_active' => true,
                'type' => $type,
            ])->id,
            'amount' => fake()->numberBetween(50_000, 5_000_000),
            'payment_method_id' => fn () => PaymentMethod::query()->create([
                'name' => 'Cash',
                'slug' => 'cash-'.Str::random(8),
                'is_active' => true,
            ])->id,
            'transaction_date' => fake()->date(),
            'description' => fake()->sentence(),
            'related_type' => null,
            'related_id' => null,
            'created_by' => fn () => User::factory()->create()->id,
        ];
    }
}
