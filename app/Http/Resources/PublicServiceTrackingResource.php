<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Data servis yang aman untuk endpoint tracking publik.
 *
 * WAJIB: jangan expose PII customer, harga cost, note internal,
 * atau field admin lainnya. Hanya field minimal yang customer
 * butuhkan untuk track status servisnya.
 */
class PublicServiceTrackingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'service_code' => $this->service_code,
            'brand' => $this->brand,
            'model' => $this->model,
            'serial_number' => $this->serial_number,
            'kelengkapan' => $this->kelengkapan,
            'complaint' => $this->complaint,
            'initial_condition' => $this->initial_condition,
            'estimated_cost' => $this->estimated_cost,
            'final_cost' => $this->final_cost,
            'payment_status' => $this->payment_status,
            'estimated_completion_date' => $this->estimated_completion_date,
            'received_at' => $this->received_at,
            'completed_at' => $this->completed_at,
            'picked_up_at' => $this->picked_up_at,
            'status' => $this->whenLoaded('status', fn () => [
                'name' => $this->status->name,
                'slug' => $this->status->slug,
            ]),
            'updates' => $this->whenLoaded('updates', fn () => $this->updates->map(fn ($update) => [
                'new_status' => $update->new_status,
                'note' => $update->note,
                'created_at' => $update->created_at,
                // Sengaja TIDAK expose `creator` (nama teknisi).
                // Customer tidak butuh tahu siapa yang handle,
                // dan itu bisa dipakai untuk social engineering.
            ])),
            'parts' => $this->whenLoaded('parts', fn () => $this->parts->map(fn ($part) => [
                'part_name' => $part->part_name,
                'quantity' => $part->quantity,
                'selling_price' => $part->selling_price,
                'installation_fee' => $part->installation_fee,
                // Sengaja TIDAK expose `cost_price` (harga modal internal)
                // dan `note` (catatan teknisi bisa memuat info sensitif).
            ])),
        ];
    }
}
