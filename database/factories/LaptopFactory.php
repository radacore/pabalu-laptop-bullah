<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Laptop;
use App\Models\LaptopSource;
use App\Models\LaptopStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

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
            'brand_id' => fn () => Brand::query()->firstOrCreate(
                ['slug' => 'lenovo'],
                ['name' => 'Lenovo', 'is_active' => true, 'sort_order' => 0],
            )->id,
            'model' => fake()->bothify('Model-###'),
            'laptop_source_id' => fn () => LaptopSource::query()->firstOrCreate(
                ['slug' => 'trade-in'],
                ['name' => 'Trade In', 'is_active' => true, 'sort_order' => 0],
            )->id,
            'purchase_date' => fake()->date(),
            'cost_price' => fake()->numberBetween(2_000_000, 8_000_000),
            'selling_price' => fake()->numberBetween(8_500_000, 14_000_000),
            'repair_cost' => fake()->numberBetween(0, 500_000),
            'mines' => null,
            'laptop_status_id' => fn () => LaptopStatus::query()->firstOrCreate(
                ['slug' => 'tersedia'],
                ['name' => 'Tersedia', 'is_active' => true, 'sort_order' => 0],
            )->id,
            'description' => fake()->sentence(),
            'internal_note' => fake()->sentence(),
            'sold_at' => null,
            'created_by' => fn () => User::factory()->create()->id,
        ];
    }
}
