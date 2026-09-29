<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

#[Fillable(['sku', 'slug', 'name', 'sparepart_type_id', 'condition', 'stock', 'cost_price', 'selling_price', 'description', 'is_active', 'created_by'])]
class Sparepart extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const CONDITION_BARU = 'baru';

    public const CONDITION_BEKAS = 'bekas';

    /**
     * @return array<int, string>
     */
    public static function conditions(): array
    {
        return [self::CONDITION_BARU, self::CONDITION_BEKAS];
    }

    protected static function booted(): void
    {
        static::creating(function (Sparepart $sparepart): void {
            if (empty($sparepart->slug)) {
                $sparepart->slug = static::uniqueSlugFor($sparepart);
            }
        });

        static::updating(function (Sparepart $sparepart): void {
            if (empty($sparepart->slug)) {
                $sparepart->slug = static::uniqueSlugFor($sparepart);
            }
        });
    }

    public static function uniqueSlugFor(Sparepart $sparepart, ?int $ignoreId = null): string
    {
        $type = $sparepart->sparepart_type_id
            ? SparepartType::query()->whereKey($sparepart->sparepart_type_id)->value('name')
            : null;

        $base = Str::slug(trim(implode(' ', array_filter([$sparepart->name, $type]))));

        if ($base === '') {
            $base = Str::slug((string) $sparepart->sku);
        }

        $slug = $base;
        $counter = 2;

        while (static::query()->where('slug', $slug)->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    protected $hidden = [
        'cost_price',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'stock' => 'integer',
            'cost_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(SparepartType::class, 'sparepart_type_id');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(SparepartPhoto::class)->orderBy('sort_order')->orderBy('id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function sales(): HasMany
    {
        return $this->hasMany(SparepartSale::class);
    }

    public function financialTransactions(): MorphMany
    {
        return $this->morphMany(FinancialTransaction::class, 'related');
    }
}
