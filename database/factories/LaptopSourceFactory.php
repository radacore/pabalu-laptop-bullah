<?php

namespace Database\Factories;

use App\Models\LaptopSource;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<LaptopSource>
 */
class LaptopSourceFactory extends Factory
{
    protected $model = LaptopSource::class;

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
        ];
    }
}
