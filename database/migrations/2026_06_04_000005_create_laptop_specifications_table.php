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
        Schema::create('laptop_specifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laptop_id')->constrained()->cascadeOnDelete();
            $table->string('processor')->nullable();
            $table->string('ram')->nullable();
            $table->string('storage')->nullable();
            $table->string('display')->nullable();
            $table->string('graphics')->nullable();
            $table->string('operating_system')->nullable();
            $table->string('battery')->nullable();
            $table->string('condition')->nullable();
            $table->text('other_specifications')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laptop_specifications');
    }
};
