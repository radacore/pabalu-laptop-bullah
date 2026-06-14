<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLaptopRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $laptopId = $this->route('laptop')?->id;

        return [
            'sku' => ['required', 'string', 'max:255', Rule::unique('laptops', 'sku')->ignore($laptopId)],
            'name' => ['nullable', 'string', 'max:255'],
            'brand' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'laptop_source_id' => ['nullable', 'exists:laptop_sources,id'],
            'purchase_date' => ['required', 'date'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'repair_cost' => ['nullable', 'numeric', 'min:0'],
            'mines' => ['nullable', 'string'],
            'laptop_status_id' => ['nullable', 'exists:laptop_statuses,id'],
            'sold_at' => ['nullable', 'date'],
            'specification.other_specifications' => ['nullable', 'string'],
        ];
    }
}
