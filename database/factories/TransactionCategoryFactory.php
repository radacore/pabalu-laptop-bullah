<?php

namespace Database\Factories;

use App\Models\TransactionCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<TransactionCategory>
 */
class TransactionCategoryFactory extends Factory
{
    protected $model = TransactionCategory::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'is_active' => true,
            'sort_order' => fake()->numberBetween(1, 100),
            'description' => fake()->sentence(),
            'type' => fake()->randomElement(['income', 'expense']),
        ];
    }

    /**
     * Indicate that the category is for income transactions.
     */
    public function income(): static
    {
        return $this->state(fn () => [
            'type' => 'income',
        ]);
    }

    /**
     * Indicate that the category is for expense transactions.
     */
    public function expense(): static
    {
        return $this->state(fn () => [
            'type' => 'expense',
        ]);
    }
}
