<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

#[Fillable(['service_code', 'customer_id', 'device_name', 'brand', 'model', 'serial_number', 'kelengkapan', 'complaint', 'initial_condition', 'estimated_cost', 'final_cost', 'estimated_completion_date', 'service_status_id', 'technician_id', 'tracking_code', 'payment_status', 'received_at', 'completed_at', 'picked_up_at', 'created_by'])]
class Service extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * Slug status final yang memicu pencatatan pendapatan servis.
     * HARUS sama dengan daftar di ServiceController + DashboardController
     * (definisi "selesai" tunggal, bukan tiga versi berbeda).
     *
     * @return array<int, string>
     */
    public static function completionSlugs(): array
    {
        return ['selesai', 'siap-diambil', 'sudah-diambil'];
    }

    /**
     * Total tagihan servis: final > estimasi > jumlah part.
     */
    public function billableTotal(): float
    {
        $amount = (float) ($this->final_cost ?? $this->estimated_cost ?? 0);

        if ($amount > 0) {
            return $amount;
        }

        return (float) $this->parts()
            ->get()
            ->sum(fn (ServicePart $part) => ((float) ($part->selling_price ?? 0) + (float) ($part->installation_fee ?? 0)) * (int) ($part->quantity ?? 1));
    }

    /**
     * Sinkronkan jurnal pendapatan servis dengan status saat ini:
     * buat/update saat final, HAPUS saat dibuka ulang agar tidak ada
     * pendapatan fiktif. Penghapusan memakai forceDelete agar
     * transaction_code bisa dipakai ulang bila diselesaikan lagi.
     */
    public function syncIncomeJournal(?string $statusSlug, bool $isCompletion): void
    {
        $code = 'INC-'.$this->service_code;

        if (! $isCompletion) {
            FinancialTransaction::query()->where('transaction_code', $code)->forceDelete();

            if ($this->completed_at !== null) {
                $this->update(['completed_at' => null]);
            }

            return;
        }

        $amount = $this->billableTotal();

        if ($amount <= 0) {
            return;
        }

        $serviceCategory = TransactionCategory::query()
            ->where('slug', 'service-laptop')
            ->where('type', 'income')
            ->first();

        if (! $serviceCategory) {
            return;
        }

        FinancialTransaction::updateOrCreate(
            ['transaction_code' => $code],
            [
                'type' => 'income',
                'transaction_category_id' => $serviceCategory->id,
                'amount' => $amount,
                'payment_method_id' => PaymentMethod::defaultId(),
                'transaction_date' => now()->toDateString(),
                'description' => 'Pembayaran servis '.$this->service_code,
                'related_type' => $this->getMorphClass(),
                'related_id' => $this->id,
                'created_by' => Auth::id(),
            ],
        );

        if ($statusSlug === 'selesai' && $this->completed_at === null) {
            $this->update(['completed_at' => now()]);
        }
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'estimated_cost' => 'decimal:2',
            'final_cost' => 'decimal:2',
            'estimated_completion_date' => 'date',
            'received_at' => 'datetime',
            'completed_at' => 'datetime',
            'picked_up_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(ServiceStatus::class, 'service_status_id');
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updates(): HasMany
    {
        return $this->hasMany(ServiceUpdate::class);
    }

    public function parts(): HasMany
    {
        return $this->hasMany(ServicePart::class);
    }

    public function financialTransactions(): MorphMany
    {
        return $this->morphMany(FinancialTransaction::class, 'related');
    }
}
