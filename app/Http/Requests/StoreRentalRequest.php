<?php

namespace App\Http\Requests;

use App\Models\Laptop;
use Illuminate\Foundation\Http\FormRequest;

class StoreRentalRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'exists:customers,id'],
            'laptop_id' => [
                'required',
                'exists:laptops,id',
                // Unit harus tersedia DAN ditandai bisa disewa. Cek balapan
                // (race) ditangani lagi di controller dengan lockForUpdate.
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $laptop = Laptop::query()->find($value);

                    if (! $laptop || ! $laptop->is_rentable) {
                        $fail('Unit tidak ditandai bisa disewa.');
                    } elseif ($laptop->status?->slug !== 'tersedia' || $laptop->isCurrentlyRented()) {
                        $fail('Unit tidak tersedia untuk disewa.');
                    }
                },
            ],
            'rental_status_id' => ['nullable', 'exists:rental_statuses,id'],
            'daily_rate' => ['required', 'numeric', 'min:0'],
            'deposit' => ['nullable', 'numeric', 'min:0'],
            'rented_at' => ['nullable', 'date'],
            'due_at' => ['required', 'date', 'after_or_equal:rented_at'],
            'payment_status' => ['nullable', 'in:unpaid,partial,paid'],
            'note' => ['nullable', 'string'],
        ];
    }
}
