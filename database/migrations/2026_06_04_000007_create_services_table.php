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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('service_code')->unique();
            $table->foreignId('customer_id')->constrained();
            $table->string('device_name');
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable();
            $table->text('complaint');
            $table->text('initial_condition')->nullable();
            $table->decimal('estimated_cost', 15, 2)->nullable();
            $table->decimal('final_cost', 15, 2)->nullable();
            $table->date('estimated_completion_date')->nullable();
            $table->foreignId('service_status_id')->nullable()->constrained();
            $table->foreignId('technician_id')->nullable()->constrained('users');
            $table->string('tracking_code')->unique();
            $table->string('payment_status')->default('unpaid');
            $table->dateTime('received_at');
            $table->dateTime('completed_at')->nullable();
            $table->dateTime('picked_up_at')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
