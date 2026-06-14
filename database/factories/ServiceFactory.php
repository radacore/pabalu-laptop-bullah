<?php

namespace Database\Factories;

use App\Models\Service;
use App\Models\Customer;
use App\Models\ServiceStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    protected $model = Service::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'service_code' => fake()->unique()->bothify('SRV-########-####'),
            'customer_id' => fn () => Customer::query()->create([
                'user_id' => User::factory()->create([
                    'phone' => fake()->unique()->numerify('08##########'),
                    'role' => 'customer',
                    'is_active' => true,
                ])->id,
                'name' => fake()->name(),
                'phone' => fake()->unique()->numerify('08##########'),
            ])->id,
            'device_name' => fake()->words(3, true),
            'brand' => fake()->randomElement(['Lenovo', 'Dell', 'HP', 'Asus', 'Acer']),
            'model' => fake()->bothify('Device-###'),
            'serial_number' => fake()->unique()->bothify('SN########'),
            'complaint' => fake()->sentence(),
            'initial_condition' => fake()->sentence(),
            'estimated_cost' => fake()->numberBetween(100_000, 1_500_000),
            'final_cost' => null,
            'estimated_completion_date' => fake()->date(),
            'service_status_id' => fn () => ServiceStatus::query()->create([
                'name' => 'Diterima',
                'slug' => 'diterima-'.Str::random(8),
                'is_active' => true,
            ])->id,
            'technician_id' => fn () => User::factory()->create(['role' => 'staff'])->id,
            'tracking_code' => fake()->unique()->bothify('TRK########'),
            'payment_status' => 'unpaid',
            'received_at' => now(),
            'completed_at' => null,
            'picked_up_at' => null,
            'created_by' => fn () => User::factory()->create()->id,
        ];
    }
}
