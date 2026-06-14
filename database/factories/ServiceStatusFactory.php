<?php

namespace Database\Factories;

use App\Models\ServiceStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ServiceStatus>
 */
class ServiceStatusFactory extends Factory
{
    protected $model = ServiceStatus::class;

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
