<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah kolom `deleted_at` untuk soft-delete tabel yang memuat data
     * business-critical yang tidak boleh hilang permanen:
     *
     * - `financial_transactions`: catatan akuntansi wajib bisa di-audit
     * - `services`: histori servis pelanggan
     * - `laptops`: inventory + histori harga jual
     * - `customers`: audit + kepatuhan data (GDPR-ish)
     */
    public function up(): void
    {
        foreach (['financial_transactions', 'services', 'laptops', 'customers'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                if (! Schema::hasColumn($t->getTable(), 'deleted_at')) {
                    $t->softDeletes();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach (['financial_transactions', 'services', 'laptops', 'customers'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->dropSoftDeletes();
            });
        }
    }
};
