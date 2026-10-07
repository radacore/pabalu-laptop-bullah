<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seeder dasar yang AMAN untuk production: master data, akun awal,
        // dan pengaturan website. Sengaja TANPA data demo/fiktif.
        $this->call([
            MasterDataSeeder::class,
            UserSeeder::class,
            WebsiteSettingSeeder::class,
        ]);

        // Data demo/fiktif hanya di luar production. Di production,
        // `php artisan migrate --seed` / `db:seed` TIDAK akan mengotori
        // database asli. Butuh data contoh? Jalankan DemoSeeder eksplisit:
        // `php artisan db:seed --class=DemoSeeder`.
        if (! app()->isProduction()) {
            $this->call([
                BusinessDataSeeder::class,
                TestimonialSeeder::class,
            ]);
        }
    }
}
