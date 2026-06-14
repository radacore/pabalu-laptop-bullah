<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['service_code', 'customer_id', 'device_name', 'brand', 'model', 'serial_number', 'kelengkapan', 'complaint', 'initial_condition', 'estimated_cost', 'final_cost', 'estimated_completion_date', 'service_status_id', 'technician_id', 'tracking_code', 'payment_status', 'received_at', 'completed_at', 'picked_up_at', 'created_by'])]
class Service extends Model
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
            'estimated_cost' => 'decimal:2',
            'final_cost' => 'decimal:2',
            'estimated_completion_date' => 'date',
            'received_at' => 'datetime',
            'completed_at' => 'datetime',
            'picked_up_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(ServiceStatus::class, 'service_status_id');
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updates(): HasMany
    {
        return $this->hasMany(ServiceUpdate::class);
    }

    public function parts(): HasMany
    {
        return $this->hasMany(ServicePart::class);
    }
}
