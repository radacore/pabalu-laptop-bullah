<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class WebsiteSetting extends Model
{
    protected $fillable = [
        'website_name',
        'tagline',
        'logo',
        'address',
        'whatsapp_number',
        'phone',
        'email',
        'operational_hours_weekday',
        'operational_hours_weekend',
        'google_maps_embed',
        'footer_description',
        'facebook_url',
        'instagram_url',
        'youtube_url',
        'tiktok_url',
        'updated_by',
    ];

    public function updater(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function getLogoUrlAttribute(): ?string
    {
        if (! $this->logo) {
            return null;
        }

        return Storage::disk('public')->url($this->logo);
    }

    public function getWhatsappLinkAttribute(?string $message = null): ?string
    {
        if (! $this->whatsapp_number) {
            return null;
        }

        $number = preg_replace('/[^0-9]/', '', $this->whatsapp_number);
        $query = $message ? '?text=' . urlencode($message) : '';

        return "https://wa.me/{$number}{$query}";
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate(
            ['id' => 1],
            ['website_name' => 'Pabalu Laptop']
        );
    }
}
