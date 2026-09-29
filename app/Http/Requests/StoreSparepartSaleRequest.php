<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSparepartSaleRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'customer_id' => ['nullable', 'exists:customers,id'],
            'sparepart_id' => ['required', 'exists:spareparts,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'payment_method_id' => ['nullable', 'exists:payment_methods,id'],
            'sold_at' => ['nullable', 'date'],
            'note' => ['nullable', 'string'],
        ];
    }
}
