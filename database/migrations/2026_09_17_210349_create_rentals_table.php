<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Transaksi penyewaan laptop. Deposit adalah uang titipan (bukan
     * pendapatan) sehingga hanya dicatat di kolom, tidak masuk
     * financial_transactions.
     */
    public function up(): void
    {
        Schema::create('rentals', function (Blueprint $table) {
            $table->id();
            $table->string('rental_code')->unique();
            $table->foreignId('customer_id')->constrained();
            $table->foreignId('laptop_id')->constrained();
            $table->foreignId('rental_status_id')->nullable()->constrained();
            $table->string('tracking_code')->unique();
            $table->decimal('daily_rate', 15, 2);
            $table->decimal('deposit', 15, 2)->default(0);
            $table->boolean('deposit_returned')->default(false);
            $table->integer('total_days')->nullable();
            $table->decimal('total_cost', 15, 2)->nullable();
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->string('payment_status', 20)->default('unpaid');
            $table->dateTime('rented_at');
            $table->dateTime('due_at');
            $table->dateTime('returned_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->text('note')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rentals');
    }
};
