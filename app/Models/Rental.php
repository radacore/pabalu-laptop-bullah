<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['rental_code', 'customer_id', 'laptop_id', 'rental_status_id', 'tracking_code', 'daily_rate', 'deposit', 'deposit_returned', 'total_days', 'total_cost', 'paid_amount', 'payment_status', 'rented_at', 'due_at', 'returned_at', 'completed_at', 'note', 'created_by'])]
class Rental extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * Slug status yang menandakan unit bebas (tidak sedang disewa).
     * Dipakai Laptop::isCurrentlyRented() dan guard penjualan.
     *
     * @return array<int, string>
     */
    public static function closedStatuses(): array
    {
        return ['selesai', 'sudah-kembali', 'dibatalkan'];
    }

    /**
     * Slug status final yang memicu pencatatan pendapatan sewa.
     *
     * @return array<int, string>
     */
    public static function completionStatuses(): array
    {
        return ['selesai', 'sudah-kembali'];
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'daily_rate' => 'decimal:2',
            'deposit' => 'decimal:2',
            'deposit_returned' => 'boolean',
            'total_cost' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'rented_at' => 'datetime',
            'due_at' => 'datetime',
            'returned_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        // Slug tracking_code dibuat otomatis saat create bila kosong.
        static::creating(function (Rental $rental): void {
            if (empty($rental->tracking_code)) {
                $rental->tracking_code = bin2hex(random_bytes(8));
            }
        });
    }

    /**
     * Jumlah hari sewa, dihitung s.d. tanggal referensi ($until) bila
     * diberikan, atau tanggal kembali aktual bila sudah kembali, atau
     * jatuh tempo bila belum kembali. Minimal 1 hari.
     *
     * Definisi ini dipakai untuk snapshot total_cost dan pendapatan,
     * sehingga kembali awal = bayar prorata, telat = bayar sampai
     * tanggal kembali (denda dihitung terpisah via lateFee()).
     */
    public function rentalDays(?\DateTimeInterface $until = null): int
    {
        $start = $this->rented_at instanceof \DateTimeInterface
            ? CarbonImmutable::parse($this->rented_at)->startOfDay()
            : now()->startOfDay();
        $endDate = $until ?? $this->returned_at ?? $this->due_at ?? now();
        $end = CarbonImmutable::parse($endDate)->startOfDay();

        if ($end->lessThan($start)) {
            return 1;
        }

        return (int) ($start->diffInDays($end) + 1);
    }

    /**
     * Estimasi total = daily_rate × hari. Deposit bukan pendapatan.
     */
    public function estimatedTotal(): float
    {
        if ($this->total_cost !== null) {
            return (float) $this->total_cost;
        }

        return (float) $this->daily_rate * $this->rentalDays();
    }

    /**
     * Denda = hari telat × daily_rate. 0 bila kembali tepat waktu/belum kembali.
     */
    public function lateFee(): float
    {
        if (! $this->returned_at || ! $this->due_at) {
            return 0.0;
        }

        $due = CarbonImmutable::parse($this->due_at)->startOfDay();
        $returned = CarbonImmutable::parse($this->returned_at)->startOfDay();

        if (! $returned->greaterThan($due)) {
            return 0.0;
        }

        return (float) $this->daily_rate * $due->diffInDays($returned);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function laptop(): BelongsTo
    {
        return $this->belongsTo(Laptop::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(RentalStatus::class, 'rental_status_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function financialTransactions(): MorphMany
    {
        return $this->morphMany(FinancialTransaction::class, 'related');
    }
}
