<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['laptop_id', 'processor', 'ram', 'storage', 'display', 'graphics', 'operating_system', 'battery', 'condition', 'other_specifications'])]
class LaptopSpecification extends Model
{
    public function laptop(): BelongsTo
    {
        return $this->belongsTo(Laptop::class);
    }
}
