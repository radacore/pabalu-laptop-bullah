<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // role/is_active SENGAJA tidak fillable (anti privilege escalation),
        // jadi set via assignment eksplisit per user — bukan via create().
        $this->makeUser([
            'name' => 'Admin Pabalu',
            'email' => 'admin@pabalu.com',
            'phone' => '081234567890',
            'password' => bcrypt('password'),
        ], 'admin');

        $this->makeUser([
            'name' => 'Teknisi Pabalu',
            'email' => 'teknisi@pabalu.com',
            'phone' => '081234567891',
            'password' => bcrypt('password'),
        ], 'staff');
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function makeUser(array $attributes, string $role): void
    {
        $user = User::query()->firstOrNew(['email' => $attributes['email']]);
        $user->fill($attributes);
        $user->role = $role;
        $user->is_active = true;
        $user->save();
    }
}
