<?php

namespace App\Http\Requests;

use App\Models\TransactionCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreFinancialTransactionRequest extends FormRequest
{
    /**
     * Slug kategori yang dicadangkan untuk jurnal otomatis — tidak boleh
     * dipakai untuk pencatatan manual agar tidak duplikat/membingungkan.
     *
     * @return array<int, string>
     */
    public static function reservedCategorySlugs(): array
    {
        return [
            'penjualan-laptop',
            'pembelian-stok-laptop',
            'service-laptop',
            'sparepart',
            'sewa-laptop',
            'denda-sewa',
            'penjualan-sparepart',
            'pembelian-sparepart',
        ];
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', 'in:income,expense'],
            'transaction_category_id' => [
                'required',
                'exists:transaction_categories,id',
                Rule::notIn(
                    TransactionCategory::query()
                        ->whereIn('slug', self::reservedCategorySlugs())
                        ->pluck('id')
                        ->all(),
                ),
            ],
            'amount' => ['required', 'numeric', 'min:1'],
            'payment_method_id' => ['required', 'exists:payment_methods,id'],
            'transaction_date' => ['required', 'date'],
            'description' => ['nullable', 'string'],
            // related_* hanya untuk dibaca; manual tidak boleh menautkan
            // ke entitas bisnis (itu hak jurnal otomatis).
            'related_type' => ['prohibited'],
            'related_id' => ['prohibited'],
        ];
    }

    /**
     * Pastikan type transaksi cocok dengan type kategorinya.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $categoryId = $this->input('transaction_category_id');
            $type = $this->input('type');

            if (! $categoryId || ! $type) {
                return;
            }

            $categoryType = TransactionCategory::query()
                ->whereKey($categoryId)
                ->value('type');

            if ($categoryType && $categoryType !== $type) {
                $validator->errors()->add(
                    'transaction_category_id',
                    'Kategori tidak sesuai dengan tipe transaksi.',
                );
            }
        });
    }
}
