<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['service_id', 'kind', 'part_name', 'sparepart_type_id', 'sparepart_id', 'quantity', 'cost_price', 'selling_price', 'installation_fee', 'note'])]
class ServicePart extends Model
{
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(SparepartType::class, 'sparepart_type_id');
    }

    public function sparepart(): BelongsTo
    {
        return $this->belongsTo(Sparepart::class);
    }
}
