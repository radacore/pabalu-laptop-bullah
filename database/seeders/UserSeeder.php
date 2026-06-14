<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin Pabalu',
            'email' => 'admin@pabalu.com',
            'phone' => '081234567890',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Teknisi Pabalu',
            'email' => 'teknisi@pabalu.com',
            'phone' => '081234567891',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'is_active' => true,
        ]);
    }
}
