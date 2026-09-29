<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class WebsiteSetting extends Model
{
    protected $appends = ['logo_url', 'hero_image_url'];

    protected $fillable = [
        'website_name',
        'tagline',
        'logo',
        'hero_image',
        'meta_title',
        'meta_description',
        'google_site_verification',
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

    public function updater(): BelongsTo
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

    public function getHeroImageUrlAttribute(): ?string
    {
        if (! $this->hero_image) {
            return null;
        }

        return Storage::disk('public')->url($this->hero_image);
    }

    public function getWhatsappLinkAttribute(?string $message = null): ?string
    {
        if (! $this->whatsapp_number) {
            return null;
        }

        $number = preg_replace('/[^0-9]/', '', $this->whatsapp_number);
        $query = $message ? '?text='.urlencode($message) : '';

        return "https://wa.me/{$number}{$query}";
    }

    /**
     * WebsiteSetting adalah singleton — di-cache forever karena jarang
     * berubah. Cache di-invalidate otomatis lewat boot event `saved`
     * setiap kali admin edit dari /website-settings.
     *
     * PENTING: yang di-cache adalah array atribut, BUKAN model. Store
     * `database` memakai serializable_classes=false sehingga model yang
     * dibaca kembali menjadi __PHP_Incomplete_Class (cache tak pernah hit
     * dan tiap halaman query ulang). Model dihidrasi ulang dari array
     * agar pemanggil tetap dapat instance Eloquent yang bisa di-update.
     *
     * Kalau cache corrupt (mis. class serialize berubah setelah deploy),
     * fallback ke fresh query — jangan crash aplikasi seluruhnya.
     */
    public static function current(): self
    {
        try {
            $cached = Cache::get('website_setting.current');

            if (is_array($cached) && isset($cached['id'])) {
                $model = new static;
                $model->forceFill($cached);
                $model->exists = true;
                $model->syncOriginal();

                return $model;
            }
        } catch (\Throwable) {
            // Cache backend error — biar fallback ke fresh query di bawah.
        }

        $fresh = static::query()->firstOrCreate(
            ['id' => 1],
            ['website_name' => 'Pabalu Laptop'],
        );

        Cache::forever('website_setting.current', $fresh->getAttributes());

        return $fresh;
    }

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget('website_setting.current'));
        static::deleted(fn () => Cache::forget('website_setting.current'));
    }
}
