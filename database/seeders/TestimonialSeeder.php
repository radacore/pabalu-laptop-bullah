<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $testimonials = [
            [
                'name' => 'Andi Pratama',
                'role' => 'Software Engineer',
                'content' => 'Servis laptop di sini sangat memuaskan. ThinkPad saya yang tadinya lemot jadi kencang lagi setelah upgrade SSD. Teknisi ramah dan komunikatif.',
                'rating' => 5,
                'avatar_color' => 'secondary',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Siska Wijaya',
                'role' => 'Graphic Designer',
                'content' => 'Beli MacBook Pro bekas di sini berasa beli baru. Bodinya mulus banget, batre awet, dan dapet garansi panjang. Worth it banget!',
                'rating' => 5,
                'avatar_color' => 'tertiary',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Budi Santoso',
                'role' => 'Mahasiswa',
                'content' => 'Cek status servis online-nya sangat membantu. Jadi nggak perlu bolak-balik telpon buat tanya kabar laptop. Sangat modern pelayanannya.',
                'rating' => 5,
                'avatar_color' => 'primary',
                'is_active' => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($testimonials as $data) {
            Testimonial::query()->updateOrCreate(
                ['name' => $data['name']],
                $data,
            );
        }
    }
}
