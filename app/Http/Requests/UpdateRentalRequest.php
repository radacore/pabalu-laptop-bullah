<?php

namespace App\Http\Requests;

use App\Models\Rental;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateRentalRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'customer_id' => ['sometimes', 'required', 'exists:customers,id'],
            'rental_status_id' => ['required', 'exists:rental_statuses,id'],
            'daily_rate' => ['sometimes', 'required', 'numeric', 'min:0'],
            'deposit' => ['nullable', 'numeric', 'min:0'],
            'deposit_returned' => ['nullable', 'boolean'],
            'total_cost' => ['nullable', 'numeric', 'min:0'],
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_status' => ['nullable', 'in:unpaid,partial,paid'],
            'rented_at' => ['nullable', 'date'],
            'due_at' => ['nullable', 'date', 'after_or_equal:rented_at'],
            'returned_at' => ['nullable', 'date', 'after_or_equal:rented_at'],
            'completed_at' => ['nullable', 'date'],
            'note' => ['nullable', 'string'],
        ];
    }

    /**
     * Validasi silang pembayaran rental:
     * - paid tidak boleh dengan nominal 0.
     * - deposit_returned=true wajib ada deposit > 0 (mencegah return fiktif).
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $status = $this->input('payment_status');
            $paid = $this->input('paid_amount');

            if ($status === 'paid' && $paid !== null && (float) $paid <= 0) {
                $validator->errors()->add(
                    'payment_status',
                    'Status lunas wajib disertai nominal pembayaran lebih dari 0.',
                );
            }

            if ($this->boolean('deposit_returned') && (float) ($this->input('deposit') ?? 0) <= 0) {
                // Cek deposit yang sudah tersimpan bila tidak dikirim ulang.
                $rental = $this->route('rental');
                $existing = $rental instanceof Rental ? (float) ($rental->deposit ?? 0) : 0;

                if ($existing <= 0) {
                    $validator->errors()->add(
                        'deposit_returned',
                        'Deposit tidak ada sehingga tidak bisa ditandai dikembalikan.',
                    );
                }
            }
        });
    }
}
