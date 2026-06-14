<?php

namespace App\Http\Requests;

class UpdateCustomerRequest extends StoreCustomerRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone' => ['sometimes', 'required', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
            'note' => ['nullable', 'string'],
            'create_user_account' => ['boolean'],
        ];
    }
}
