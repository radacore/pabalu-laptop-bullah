<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['sku', 'name', 'brand', 'model', 'laptop_source_id', 'purchase_date', 'cost_price', 'selling_price', 'repair_cost', 'mines', 'laptop_status_id', 'description', 'internal_note', 'sold_at', 'created_by'])]
class Laptop extends Model
{
    use HasFactory;

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

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
