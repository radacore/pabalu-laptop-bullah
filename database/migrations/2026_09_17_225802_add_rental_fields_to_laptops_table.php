<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tandai unit yang boleh disewakan + tarif hariannya.
     * Katalog /sewa hanya menampilkan unit is_rentable + status tersedia.
     */
    public function up(): void
    {
        Schema::table('laptops', function (Blueprint $table) {
            $table->boolean('is_rentable')->default(false)->after('laptop_status_id');
            $table->decimal('daily_rate', 15, 2)->nullable()->after('is_rentable');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laptops', function (Blueprint $table) {
            $table->dropColumn(['is_rentable', 'daily_rate']);
        });
    }
};
