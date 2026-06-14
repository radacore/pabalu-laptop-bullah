<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('laptops', function (Blueprint $table) {
            $table->id();
            $table->string('sku')->unique();
            $table->string('name');
            $table->string('brand');
            $table->string('model');
            $table->foreignId('laptop_source_id')->nullable()->constrained();
            $table->date('purchase_date');
            $table->decimal('cost_price', 15, 2);
            $table->decimal('selling_price', 15, 2);
            $table->decimal('additional_cost', 15, 2)->default(0);
            $table->foreignId('laptop_status_id')->nullable()->constrained();
            $table->text('description')->nullable();
            $table->text('internal_note')->nullable();
            $table->timestamp('sold_at')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laptops');
    }
};
