<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
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
            'device_name' => ['nullable', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'model' => ['nullable', 'string', 'max:255'],
            'serial_number' => ['nullable', 'string', 'max:255'],
            'kelengkapan' => ['nullable', 'string'],
            'complaint' => ['required', 'string'],
            'initial_condition' => ['nullable', 'string'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'final_cost' => ['nullable', 'numeric', 'min:0'],
            'estimated_completion_date' => ['nullable', 'date'],
            'service_status_id' => ['nullable', 'exists:service_statuses,id'],
            'technician_id' => ['nullable', 'exists:users,id'],
            'payment_status' => ['nullable', 'in:unpaid,paid'],
            'received_at' => ['nullable', 'date'],
            'completed_at' => ['nullable', 'date'],
            'picked_up_at' => ['nullable', 'date'],

            'parts' => ['nullable', 'array'],
            'parts.*.kind' => ['required_with:parts', 'in:used,sold'],
            'parts.*.sparepart_type_id' => ['nullable', 'exists:sparepart_types,id'],
            'parts.*.part_name' => ['required_with:parts', 'string', 'max:255'],
            'parts.*.quantity' => ['required_with:parts', 'integer', 'min:1'],
            'parts.*.cost_price' => ['required_with:parts', 'numeric', 'min:0'],
            'parts.*.selling_price' => ['required_with:parts', 'numeric', 'min:0'],
            'parts.*.installation_fee' => ['nullable', 'numeric', 'min:0'],
            'parts.*.note' => ['nullable', 'string'],
        ];
    }
}
