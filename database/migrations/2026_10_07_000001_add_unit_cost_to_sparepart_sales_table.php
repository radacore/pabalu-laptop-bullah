<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kunci harga modal per transaksi untuk perhitungan laba kotor.
     * Backfill data lama dari cost_price sparepart saat migrasi.
     */
    public function up(): void
    {
        Schema::table('sparepart_sales', function (Blueprint $table): void {
            $table->decimal('unit_cost', 15, 2)->nullable()->after('unit_price');
        });

        // Backfill portable MySQL + SQLite (tanpa UPDATE..JOIN).
        $rows = DB::table('sparepart_sales as sales')
            ->join('spareparts as parts', 'parts.id', '=', 'sales.sparepart_id')
            ->whereNull('sales.unit_cost')
            ->select('sales.id', 'parts.cost_price')
            ->get();

        foreach ($rows as $row) {
            DB::table('sparepart_sales')
                ->where('id', $row->id)
                ->update(['unit_cost' => $row->cost_price]);
        }
    }

    public function down(): void
    {
        Schema::table('sparepart_sales', function (Blueprint $table): void {
            $table->dropColumn('unit_cost');
        });
    }
};
