<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Dataset lengkap untuk development: seeder dasar + data demo/fiktif untuk
 * development dan pengujian manual. JANGAN dijalankan di production.
 *
 * `php artisan db:seed --class=DemoSeeder`
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            MasterDataSeeder::class,
            UserSeeder::class,
            WebsiteSettingSeeder::class,
            BusinessDataSeeder::class,
            TestimonialSeeder::class,
        ]);
    }
}
