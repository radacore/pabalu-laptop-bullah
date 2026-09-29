<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['sparepart_id', 'file_path', 'caption', 'sort_order'])]
class SparepartPhoto extends Model
{
    public function sparepart(): BelongsTo
    {
        return $this->belongsTo(Sparepart::class);
    }
}
