<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sparepart_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sparepart_id')->constrained()->cascadeOnDelete();
            $table->string('file_path');
            $table->string('caption')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->index(['sparepart_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sparepart_photos');
    }
};
