<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Index gelombang 5 (kinerja): kolom sort/filter katalog publik +
     * composite (status, id) untuk pola filter+latest() di index admin.
     *
     * MySQL tidak bisa index prefix LIKE '%x%' — index di sini menarget
     * kolom equality/range/sort (status_id, harga, tanggal, boolean),
     * bukan kolom LIKE.
     */
    public function up(): void
    {
        // Katalog publik: filter status+brand, sort harga/tarif.
        Schema::table('laptops', function (Blueprint $t) {
            $t->index(['laptop_status_id', 'brand_id'], 'laptops_status_brand_idx');
            $t->index('selling_price', 'laptops_selling_price_idx');
            $t->index('daily_rate', 'laptops_daily_rate_idx');
            $t->index('is_rentable', 'laptops_is_rentable_idx');
        });

        // Dashboard: servis selesai per bulan.
        Schema::table('services', function (Blueprint $t) {
            $t->index('completed_at', 'services_completed_at_idx');
            $t->index(['service_status_id', 'id'], 'services_status_id_idx');
        });

        // Rental: filter status + latest().
        Schema::table('rentals', function (Blueprint $t) {
            $t->index(['rental_status_id', 'id'], 'rentals_status_id_idx');
            $t->index('due_at', 'rentals_due_at_idx');
            $t->index('returned_at', 'rentals_returned_at_idx');
        });

        // Katalog sparepart: sort harga + filter aktif/kondisi.
        Schema::table('spareparts', function (Blueprint $t) {
            $t->index('selling_price', 'spareparts_selling_price_idx');
        });

        // Search customer by name/phone.
        Schema::table('customers', function (Blueprint $t) {
            $t->index('name', 'customers_name_idx');
            $t->index('phone', 'customers_phone_idx');
        });

        // Foto sparepart: ordered gallery (sejajar laptop_photos).
        Schema::table('sparepart_photos', function (Blueprint $t) {
            $t->index(['sparepart_id', 'sort_order'], 'sparepart_photos_sparepart_order_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laptops', function (Blueprint $t) {
            $t->dropIndex('laptops_status_brand_idx');
            $t->dropIndex('laptops_selling_price_idx');
            $t->dropIndex('laptops_daily_rate_idx');
            $t->dropIndex('laptops_is_rentable_idx');
        });

        Schema::table('services', function (Blueprint $t) {
            $t->dropIndex('services_completed_at_idx');
            $t->dropIndex('services_status_id_idx');
        });

        Schema::table('rentals', function (Blueprint $t) {
            $t->dropIndex('rentals_status_id_idx');
            $t->dropIndex('rentals_due_at_idx');
            $t->dropIndex('rentals_returned_at_idx');
        });

        Schema::table('spareparts', function (Blueprint $t) {
            $t->dropIndex('spareparts_selling_price_idx');
        });

        Schema::table('customers', function (Blueprint $t) {
            $t->dropIndex('customers_name_idx');
            $t->dropIndex('customers_phone_idx');
        });

        Schema::table('sparepart_photos', function (Blueprint $t) {
            $t->dropIndex('sparepart_photos_sparepart_order_idx');
        });
    }
};
