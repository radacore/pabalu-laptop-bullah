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
        Schema::table('laptops', function (Blueprint $table) {
            $table->renameColumn('additional_cost', 'repair_cost');
        });

        Schema::table('laptops', function (Blueprint $table) {
            $table->text('mines')->nullable()->after('repair_cost');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laptops', function (Blueprint $table) {
            $table->dropColumn('mines');
        });

        Schema::table('laptops', function (Blueprint $table) {
            $table->renameColumn('repair_cost', 'additional_cost');
        });
    }
};
