<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWebsiteSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'website_name' => ['required', 'string', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:255'],
            // SVG sengaja tidak diizinkan karena bisa memuat <script> → stored XSS
            // di same-origin admin. Kalau butuh SVG, wajib sanitize via
            // enshrined/svg-sanitize sebelum simpan.
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048', 'dimensions:max_width=2048,max_height=2048'],
            'remove_logo' => ['nullable', 'boolean'],
            // Hero tampil full-bleed 1280px, jadi izinkan file lebih besar.
            'hero_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_hero_image' => ['nullable', 'boolean'],
            'meta_title' => ['nullable', 'string', 'max:160'],
            'meta_description' => ['nullable', 'string', 'max:300'],
            'google_site_verification' => ['nullable', 'string', 'max:100', 'regex:/^[A-Za-z0-9_-]+$/'],
            'address' => ['nullable', 'string', 'max:1000'],
            'whatsapp_number' => ['nullable', 'string', 'max:32', 'regex:/^[0-9+\-\s()]+$/'],
            'phone' => ['nullable', 'string', 'max:32'],
            'email' => ['nullable', 'email', 'max:255'],
            'operational_hours_weekday' => ['nullable', 'string', 'max:120'],
            'operational_hours_weekend' => ['nullable', 'string', 'max:120'],
            'google_maps_embed' => ['nullable', 'string', 'max:2000', 'url', 'regex:/^https:\/\/(www\.google\.(com|co\.id)|maps\.google\.(com|co\.id)|google\.com\/maps|www\.googleusercontent\.com)\//'],
            'footer_description' => ['nullable', 'string', 'max:1000'],
            'facebook_url' => ['nullable', 'url', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'youtube_url' => ['nullable', 'url', 'max:255'],
            'tiktok_url' => ['nullable', 'url', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'whatsapp_number.regex' => 'Nomor WhatsApp hanya boleh berisi angka, spasi, dan tanda + - ( ).',
            'google_site_verification.regex' => 'Kode verifikasi hanya boleh berisi huruf, angka, tanda - dan _ (tanpa tag HTML).',
            'google_maps_embed.url' => 'Embed peta harus berupa URL.',
            'google_maps_embed.regex' => 'Embed peta harus URL Google Maps yang valid (https://www.google.com/maps/...).',
        ];
    }
}
