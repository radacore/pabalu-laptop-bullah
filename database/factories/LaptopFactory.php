<?php

namespace Database\Factories;

use App\Models\Laptop;
use App\Models\LaptopSource;
use App\Models\LaptopStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Laptop>
 */
class LaptopFactory extends Factory
{
    protected $model = Laptop::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sku' => fake()->unique()->bothify('PBL-########-####'),
            'name' => fake()->words(3, true),
            'brand' => fake()->randomElement(['Lenovo', 'Dell', 'HP', 'Asus', 'Acer']),
            'model' => fake()->bothify('Model-###'),
            'laptop_source_id' => fn () => LaptopSource::query()->create([
                'name' => 'Trade In',
                'slug' => 'trade-in-'.Str::random(8),
                'is_active' => true,
            ])->id,
            'purchase_date' => fake()->date(),
            'cost_price' => fake()->numberBetween(2_000_000, 8_000_000),
            'selling_price' => fake()->numberBetween(8_500_000, 14_000_000),
            'additional_cost' => fake()->numberBetween(0, 500_000),
            'laptop_status_id' => fn () => LaptopStatus::query()->create([
                'name' => 'Available',
                'slug' => 'available-'.Str::random(8),
                'is_active' => true,
            ])->id,
            'description' => fake()->sentence(),
            'internal_note' => fake()->sentence(),
            'sold_at' => null,
            'created_by' => fn () => User::factory()->create()->id,
        ];
    }
}
