<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceRequest extends FormRequest
{
    /**
     * Default ke mode existing bila tidak dikirim (payload lama).
     */
    protected function prepareForValidation(): void
    {
        if (! $this->filled('customer_mode')) {
            $this->merge(['customer_mode' => 'existing']);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Mode pelanggan: 'existing' (pilih dari daftar) atau 'new'
            // (buat pelanggan baru sekalian). Default existing agar
            // kompatibel dengan payload lama yang hanya kirim customer_id.
            'customer_mode' => ['nullable', 'in:existing,new'],
            'customer_id' => ['required_if:customer_mode,existing', 'nullable', 'exists:customers,id'],
            'customer_name' => ['required_if:customer_mode,new', 'nullable', 'string', 'max:255'],
            'customer_phone' => ['required_if:customer_mode,new', 'nullable', 'string', 'max:20'],
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
            'parts.*.sparepart_id' => ['nullable', 'exists:spareparts,id'],
            'parts.*.part_name' => ['required_with:parts', 'string', 'max:255'],
            'parts.*.quantity' => ['required_with:parts', 'integer', 'min:1'],
            'parts.*.cost_price' => ['required_with:parts', 'numeric', 'min:0'],
            'parts.*.selling_price' => ['required_with:parts', 'numeric', 'min:0'],
            'parts.*.installation_fee' => ['nullable', 'numeric', 'min:0'],
            'parts.*.note' => ['nullable', 'string'],
        ];
    }
}
