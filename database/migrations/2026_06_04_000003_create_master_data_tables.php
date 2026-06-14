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
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug');
            $table->boolean('is_active');
            $table->integer('sort_order')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug');
            $table->boolean('is_active');
            $table->integer('sort_order')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('laptop_sources', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug');
            $table->boolean('is_active');
            $table->integer('sort_order')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('laptop_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug');
            $table->boolean('is_active');
            $table->integer('sort_order')->nullable();
            $table->text('description')->nullable();
            $table->string('color')->nullable();
            $table->timestamps();
        });

        Schema::create('service_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug');
            $table->boolean('is_active');
            $table->integer('sort_order')->nullable();
            $table->text('description')->nullable();
            $table->string('color')->nullable();
            $table->timestamps();
        });

        Schema::create('transaction_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug');
            $table->boolean('is_active');
            $table->integer('sort_order')->nullable();
            $table->text('description')->nullable();
            $table->enum('type', ['income', 'expense']);
            $table->timestamps();
        });

        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug');
            $table->boolean('is_active');
            $table->integer('sort_order')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('sparepart_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug');
            $table->boolean('is_active');
            $table->integer('sort_order')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sparepart_types');
        Schema::dropIfExists('payment_methods');
        Schema::dropIfExists('transaction_categories');
        Schema::dropIfExists('service_statuses');
        Schema::dropIfExists('laptop_statuses');
        Schema::dropIfExists('laptop_sources');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('brands');
    }
};
