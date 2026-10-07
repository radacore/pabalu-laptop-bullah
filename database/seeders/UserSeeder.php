<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $password = $this->initialPassword();

        // role/is_active SENGAJA tidak fillable (anti privilege escalation),
        // jadi set via assignment eksplisit per user — bukan via create().
        $this->makeUser([
            'name' => 'Admin Pabalu',
            'email' => 'admin@pabalu.com',
            'phone' => '081234567890',
        ], 'admin', $password);

        $this->makeUser([
            'name' => 'Teknisi Pabalu',
            'email' => 'teknisi@pabalu.com',
            'phone' => '081234567891',
        ], 'staff', $password);
    }

    /**
     * Password awal akun seeder. Urutan prioritas:
     *
     * 1. Env `SEED_ADMIN_PASSWORD` bila diisi (cara yang disarankan di
     *    production — set di `.env` SEBELUM `php artisan config:cache`).
     * 2. Password acak 16 karakter bila `APP_ENV=production` dan env kosong.
     *    Nilai acak dicetak ke console sekali — catat, lalu ganti password
     *    setelah login pertama.
     * 3. Default `password` di luar production (dev/test/e2e).
     */
    private function initialPassword(): string
    {
        $fromEnv = env('SEED_ADMIN_PASSWORD');

        if (is_string($fromEnv) && $fromEnv !== '') {
            return $fromEnv;
        }

        if (app()->isProduction()) {
            $generated = Str::random(16);

            $this->command?->warn('SEED_ADMIN_PASSWORD kosong: memakai password acak untuk akun seeder.');
            $this->command?->info("Password awal admin@pabalu.com / teknisi@pabalu.com: {$generated}");
            $this->command?->warn('Catat password di atas, lalu GANTI setelah login pertama.');

            return $generated;
        }

        return 'password';
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function makeUser(array $attributes, string $role, string $password): void
    {
        $user = User::query()->firstOrNew(['email' => $attributes['email']]);
        $isNew = ! $user->exists;

        $user->fill($attributes);

        // Password hanya di-set saat user BARU dibuat. Menjalankan seeder
        // ulang tidak me-reset password yang sudah diganti admin.
        if ($isNew) {
            $user->password = Hash::make($password);
        }

        $user->role = $role;
        $user->is_active = true;
        $user->save();
    }
}
