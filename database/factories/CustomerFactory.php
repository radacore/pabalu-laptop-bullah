<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => fn () => User::factory()->create([
                'phone' => fake()->unique()->numerify('08##########'),
                'role' => 'customer',
                'is_active' => true,
            ])->id,
            'name' => fake()->name(),
            'phone' => fake()->unique()->numerify('08##########'),
            'address' => fake()->address(),
            'note' => fake()->sentence(),
        ];
    }
}
