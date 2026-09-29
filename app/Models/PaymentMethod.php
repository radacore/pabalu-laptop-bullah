<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;

#[Fillable(['name', 'slug', 'is_active', 'sort_order', 'description'])]
class PaymentMethod extends Model
{
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function financialTransactions(): HasMany
    {
        return $this->hasMany(FinancialTransaction::class, 'payment_method_id');
    }

    /**
     * Ambil ID payment method default untuk auto-generated transaction.
     *
     * Prioritas: (1) slug 'cash' → (2) sort_order terkecil yang aktif →
     * (3) ID terkecil apapun. Return null hanya kalau tidak ada payment
     * method sama sekali (kolom `payment_method_id` di financial_transactions
     * memang nullable, jadi ini aman).
     *
     * Cache 5 menit — invalidate manual di controller admin panel bila perlu.
     */
    public static function defaultId(): ?int
    {
        return Cache::remember('payment_method.default_id', 300, function (): ?int {
            $cash = static::query()->where('slug', 'cash')->where('is_active', true)->value('id');

            if ($cash) {
                return (int) $cash;
            }

            return static::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->value('id');
        });
    }

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget('payment_method.default_id'));
        static::deleted(fn () => Cache::forget('payment_method.default_id'));
    }
}
