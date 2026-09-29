<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStaffRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'phone' => ['nullable', 'string', 'max:32', Rule::unique(User::class)],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'role' => ['required', Rule::in(['admin', 'staff'])],
        ];
    }
}
