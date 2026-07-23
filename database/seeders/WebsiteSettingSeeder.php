<?php

namespace Database\Seeders;

use App\Models\WebsiteSetting;
use Illuminate\Database\Seeder;

class WebsiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        WebsiteSetting::query()->updateOrCreate(
            ['id' => 1],
            [
                'website_name' => 'Pabalu Laptop',
                'tagline' => 'Mulai dari pilih unit, servis, sampai selesai — semuanya bisa dipantau dari sini.',
                'address' => 'Jl. Sudirman No. 45, Jakarta Pusat',
                'whatsapp_number' => '6281234567890',
                'phone' => '(021) 555-0123',
                'email' => 'halo@pabalulaptop.id',
                'operational_hours_weekday' => 'Senin - Jumat: 09:00 - 18:00',
                'operational_hours_weekend' => 'Sabtu: 10:00 - 16:00 (Minggu Tutup)',
                'google_maps_embed' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.6297!3d-6.1944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f93cf4d3b7b1%3A0x47c87ef2b3f4abc!2sMonas!5e0!3m2!1sid!2sid!4v1700000000000',
                'footer_description' => 'Pusat laptop bekas berkualitas dan jasa reparasi terpercaya sejak 2018. Memberikan nafas baru bagi perangkat digital Anda.',
                'facebook_url' => 'https://facebook.com/pabalulaptop',
                'instagram_url' => 'https://instagram.com/pabalulaptop',
                'youtube_url' => null,
                'tiktok_url' => null,
            ]
        );
    }
}
