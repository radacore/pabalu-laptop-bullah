<?php

namespace App\Http\Requests;

use App\Models\Sparepart;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSparepartRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'sku' => ['nullable', 'string', 'max:255', Rule::unique('spareparts', 'sku')],
            'name' => ['required', 'string', 'max:255'],
            'sparepart_type_id' => ['nullable', 'exists:sparepart_types,id'],
            'condition' => ['required', Rule::in(Sparepart::conditions())],
            'stock' => ['required', 'integer', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
