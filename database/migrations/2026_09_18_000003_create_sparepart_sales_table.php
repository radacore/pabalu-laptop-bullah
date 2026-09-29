<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sparepart_sales', function (Blueprint $table) {
            $table->id();
            $table->string('sale_code')->unique();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('sparepart_id')->constrained()->restrictOnDelete();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_amount', 15, 2);
            $table->foreignId('payment_method_id')->nullable()->constrained()->nullOnDelete();
            $table->date('sold_at');
            $table->text('note')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
            $table->index(['sparepart_id', 'sold_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sparepart_sales');
    }
};
