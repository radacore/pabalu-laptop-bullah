<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['laptop_id', 'file_path', 'caption', 'sort_order'])]
class LaptopPhoto extends Model
{
    public function laptop(): BelongsTo
    {
        return $this->belongsTo(Laptop::class);
    }
}
