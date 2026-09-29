<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Kolom `brand` (varchar) sudah tidak dipakai — semua controller dan model
     * sudah beralih ke `brand_id` (FK ke tabel `brands`). Kolom lama ini
     * NOT NULL tanpa default, sehingga setiap INSERT baru dari admin form
     * (yang tidak mengirim field `brand`) akan gagal di MySQL production.
     */
    public function up(): void
    {
        Schema::table('laptops', function (Blueprint $table) {
            if (Schema::hasColumn('laptops', 'brand')) {
                $table->dropColumn('brand');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laptops', function (Blueprint $table) {
            $table->string('brand')->nullable()->after('sku');
        });
    }
};
