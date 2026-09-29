<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah kolom hero image + SEO agar bisa diatur dari Pengaturan
     * tanpa deploy ulang: gambar hero halaman publik dan meta tag
     * yang dibaca Google saat indexing.
     */
    public function up(): void
    {
        Schema::table('website_settings', function (Blueprint $table) {
            $table->string('hero_image')->nullable()->after('logo');
            $table->string('meta_title', 160)->nullable()->after('footer_description');
            $table->string('meta_description', 300)->nullable()->after('meta_title');
            $table->string('google_site_verification', 100)->nullable()->after('meta_description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('website_settings', function (Blueprint $table) {
            $table->dropColumn([
                'hero_image',
                'meta_title',
                'meta_description',
                'google_site_verification',
            ]);
        });
    }
};
