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
            'brand_id' => ['required', 'integer', 'exists:brands,id'],
            'model' => ['required', 'string', 'max:255'],
            'laptop_source_id' => ['nullable', 'exists:laptop_sources,id'],
            'purchase_date' => ['required', 'date'],
            'cost_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'repair_cost' => ['nullable', 'numeric', 'min:0'],
            'mines' => ['nullable', 'string'],
            'laptop_status_id' => ['nullable', 'exists:laptop_statuses,id'],
            'is_rentable' => ['nullable', 'boolean'],
            'daily_rate' => ['nullable', 'numeric', 'min:0'],
            'sold_at' => ['nullable', 'date'],
            'specification' => ['nullable', 'array'],
            'specification.processor' => ['nullable', 'string', 'max:255'],
            'specification.ram' => ['nullable', 'string', 'max:255'],
            'specification.storage' => ['nullable', 'string', 'max:255'],
            'specification.display' => ['nullable', 'string', 'max:255'],
            'specification.graphics' => ['nullable', 'string', 'max:255'],
            'specification.operating_system' => ['nullable', 'string', 'max:255'],
            'specification.battery' => ['nullable', 'string', 'max:255'],
            'specification.condition' => ['nullable', 'string', 'max:255'],
            'specification.other_specifications' => ['nullable', 'string'],
        ];
    }
}
