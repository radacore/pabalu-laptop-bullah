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
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,svg,webp', 'max:2048'],
            'remove_logo' => ['nullable', 'boolean'],
            'address' => ['nullable', 'string', 'max:1000'],
            'whatsapp_number' => ['nullable', 'string', 'max:32', 'regex:/^[0-9+\-\s()]+$/'],
            'phone' => ['nullable', 'string', 'max:32'],
            'email' => ['nullable', 'email', 'max:255'],
            'operational_hours_weekday' => ['nullable', 'string', 'max:120'],
            'operational_hours_weekend' => ['nullable', 'string', 'max:120'],
            'google_maps_embed' => ['nullable', 'string', 'max:2000'],
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
        ];
    }
}
