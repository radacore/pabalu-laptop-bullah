<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kolom name dipakai form sebagai "SN (Opsional)" — boleh kosong.
     * Tanpa ini, simpan tanpa SN meledak 500 (integrity constraint).
     */
    public function up(): void
    {
        Schema::table('laptops', function (Blueprint $table): void {
            $table->string('name')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('laptops', function (Blueprint $table): void {
            $table->string('name')->nullable(false)->change();
        });
    }
};
