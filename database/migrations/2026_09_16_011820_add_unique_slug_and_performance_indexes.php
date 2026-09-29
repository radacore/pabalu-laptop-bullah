<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah UNIQUE constraint di kolom slug master data + composite index
     * untuk query yang sering dipakai (dashboard, filter, sort).
     *
     * Prasyarat: data slug harus sudah unique. Kalau ada duplicate, migration
     * ini akan gagal — jalankan dedup manual lebih dulu.
     */
    public function up(): void
    {
        $singleUniqueSlug = [
            'brands',
            'categories',
            'laptop_sources',
            'laptop_statuses',
            'service_statuses',
            'payment_methods',
            'sparepart_types',
        ];

        foreach ($singleUniqueSlug as $table) {
            Schema::table($table, function (Blueprint $t) use ($table) {
                $t->unique('slug', "{$table}_slug_unique");
            });
        }

        // transaction_categories: slug bisa duplicate lintas type
        // (mis. `sparepart` bisa jadi income di satu row & expense di row lain
        // di masa depan). Composite unique lebih aman.
        Schema::table('transaction_categories', function (Blueprint $t) {
            $t->unique(['type', 'slug'], 'transaction_categories_type_slug_unique');
        });

        // Financial transactions — kolom yang paling sering di WHERE/ORDER
        Schema::table('financial_transactions', function (Blueprint $t) {
            $t->index(['type', 'transaction_date'], 'ft_type_date_idx');
        });

        // Services — dashboard filter payment_status + ordering
        Schema::table('services', function (Blueprint $t) {
            $t->index('payment_status', 'services_payment_status_idx');
            $t->index('received_at', 'services_received_at_idx');
        });

        // Laptops — filter tanggal untuk laporan bulanan
        Schema::table('laptops', function (Blueprint $t) {
            $t->index('purchase_date', 'laptops_purchase_date_idx');
            $t->index('sold_at', 'laptops_sold_at_idx');
        });

        // Service updates — timeline query di detail service
        Schema::table('service_updates', function (Blueprint $t) {
            $t->index(['service_id', 'created_at'], 'service_updates_service_created_idx');
        });

        // Laptop photos — ordered gallery
        Schema::table('laptop_photos', function (Blueprint $t) {
            $t->index(['laptop_id', 'sort_order'], 'laptop_photos_laptop_order_idx');
        });

        // Users — filter by role (staff dropdown di form service)
        Schema::table('users', function (Blueprint $t) {
            $t->index('role', 'users_role_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $singleUniqueSlug = [
            'brands',
            'categories',
            'laptop_sources',
            'laptop_statuses',
            'service_statuses',
            'payment_methods',
            'sparepart_types',
        ];

        foreach ($singleUniqueSlug as $table) {
            Schema::table($table, function (Blueprint $t) use ($table) {
                $t->dropUnique("{$table}_slug_unique");
            });
        }

        Schema::table('transaction_categories', function (Blueprint $t) {
            $t->dropUnique('transaction_categories_type_slug_unique');
        });

        Schema::table('financial_transactions', function (Blueprint $t) {
            $t->dropIndex('ft_type_date_idx');
        });

        Schema::table('services', function (Blueprint $t) {
            $t->dropIndex('services_payment_status_idx');
            $t->dropIndex('services_received_at_idx');
        });

        Schema::table('laptops', function (Blueprint $t) {
            $t->dropIndex('laptops_purchase_date_idx');
            $t->dropIndex('laptops_sold_at_idx');
        });

        Schema::table('service_updates', function (Blueprint $t) {
            $t->dropIndex('service_updates_service_created_idx');
        });

        Schema::table('laptop_photos', function (Blueprint $t) {
            $t->dropIndex('laptop_photos_laptop_order_idx');
        });

        Schema::table('users', function (Blueprint $t) {
            $t->dropIndex('users_role_idx');
        });
    }
};
