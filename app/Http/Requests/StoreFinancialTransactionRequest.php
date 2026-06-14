<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFinancialTransactionRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', 'in:income,expense'],
            'transaction_category_id' => ['required', 'exists:transaction_categories,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'payment_method_id' => ['required', 'exists:payment_methods,id'],
            'transaction_date' => ['required', 'date'],
            'description' => ['nullable', 'string'],
            'related_type' => ['nullable', 'string', 'max:255'],
            'related_id' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
