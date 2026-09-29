<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

#[Fillable(['sku', 'slug', 'name', 'brand_id', 'model', 'laptop_source_id', 'purchase_date', 'cost_price', 'selling_price', 'repair_cost', 'mines', 'laptop_status_id', 'is_rentable', 'daily_rate', 'description', 'internal_note', 'sold_at', 'created_by'])]
class Laptop extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected static function booted(): void
    {
        // Slug dibuat otomatis saat create. Saat update, slug yang sudah
        // ada TIDAK ditulis ulang agar URL yang pernah dibagikan tetap
        // hidup (kecuali slug masih kosong).
        static::creating(function (Laptop $laptop): void {
            if (empty($laptop->slug)) {
                $laptop->slug = static::uniqueSlugFor($laptop);
            }
        });

        static::updating(function (Laptop $laptop): void {
            if (empty($laptop->slug)) {
                $laptop->slug = static::uniqueSlugFor($laptop);
            }
        });
    }

    /**
     * Bangun slug unik dari brand + nama/model.
     *
     * Kalau nama sudah diawali brand (mis. "Acer Predator..."), brand tidak
     * diulang agar slug tidak ganda ("acer-acer-predator...").
     */
    public static function uniqueSlugFor(Laptop $laptop, ?int $ignoreId = null): string
    {
        $brand = $laptop->brand_id
            ? Brand::query()->whereKey($laptop->brand_id)->value('name')
            : null;

        $name = trim((string) $laptop->name);

        if ($brand && $name !== '' && stripos($name, trim((string) $brand)) === 0) {
            $brand = null;
        }

        // Nama yang sudah deskriptif tidak perlu ditambah model lagi agar
        // slug tetap pendek. Model dipakai hanya kalau nama kosong.
        $parts = $name !== '' ? [$brand, $laptop->name] : [$brand, $laptop->model];

        $base = Str::slug(trim(implode(' ', array_filter($parts))));

        if ($base === '') {
            $base = Str::slug((string) $laptop->sku);
        }

        $slug = $base;
        $counter = 2;

        while (static::query()->where('slug', $slug)->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * Field yang tidak boleh diserialisasi ke response publik.
     *
     * Admin panel butuh nilai ini, jadi controller admin harus panggil
     * `$laptop->makeVisible([...])` bila perlu (contoh: LaptopController@show).
     */
    protected $hidden = [
        'cost_price',
        'repair_cost',
        'internal_note',
        'mines',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'purchase_date' => 'date',
            'sold_at' => 'datetime',
            'is_rentable' => 'boolean',
            'daily_rate' => 'decimal:2',
        ];
    }

    public function specification(): HasOne
    {
        return $this->hasOne(LaptopSpecification::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(LaptopPhoto::class);
    }

    public function source(): BelongsTo
    {
        return $this->belongsTo(LaptopSource::class, 'laptop_source_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(LaptopStatus::class, 'laptop_status_id');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function financialTransactions(): MorphMany
    {
        return $this->morphMany(FinancialTransaction::class, 'related');
    }

    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }

    /**
     * True bila ada rental aktif (bukan selesai/kembali/batal, belum dihapus).
     */
    public function isCurrentlyRented(): bool
    {
        return $this->rentals()
            ->whereHas('status', fn ($q) => $q->whereNotIn('slug', Rental::closedStatuses()))
            ->exists();
    }
}
