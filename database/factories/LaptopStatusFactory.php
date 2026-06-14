<?php

namespace Database\Factories;

use App\Models\LaptopStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<LaptopStatus>
 */
class LaptopStatusFactory extends Factory
{
    protected $model = LaptopStatus::class;

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
            'color' => fake()->hexColor(),
        ];
    }
}
