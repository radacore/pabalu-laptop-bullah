<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Data penyewaan yang aman untuk endpoint tracking publik.
 *
 * WAJIB: jangan expose PII customer, catatan internal,
 * atau field admin lainnya.
 */
class PublicRentalTrackingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'rental_code' => $this->rental_code,
            'daily_rate' => $this->daily_rate,
            'deposit' => $this->deposit,
            'total_cost' => $this->total_cost,
            'payment_status' => $this->payment_status,
            'rented_at' => $this->rented_at,
            'due_at' => $this->due_at,
            'returned_at' => $this->returned_at,
            'laptop' => $this->whenLoaded('laptop', fn () => [
                'brand' => $this->laptop->brand?->name,
                'model' => $this->laptop->model,
                'name' => $this->laptop->name,
            ]),
            'status' => $this->whenLoaded('status', fn () => [
                'name' => $this->status->name,
                'slug' => $this->status->slug,
            ]),
        ];
    }
}
