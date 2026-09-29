<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Tambah slug unik untuk URL publik yang ramah SEO
     * (/shop/macbook-pro-m3-14). Data lama di-backfill dari
     * brand + nama/model agar tidak ada slug kosong.
     */
    public function up(): void
    {
        Schema::table('laptops', function (Blueprint $table) {
            $table->string('slug', 160)->nullable()->unique()->after('sku');
        });

        $laptops = DB::table('laptops')->select('id', 'name', 'model', 'brand_id', 'sku')->get();

        foreach ($laptops as $laptop) {
            $brand = $laptop->brand_id
                ? DB::table('brands')->where('id', $laptop->brand_id)->value('name')
                : null;

            $name = trim((string) $laptop->name);

            if ($brand && $name !== '' && stripos($name, trim((string) $brand)) === 0) {
                $brand = null;
            }

            $parts = $name !== '' ? [$brand, $laptop->name] : [$brand, $laptop->model];

            $base = Str::slug(trim(implode(' ', array_filter($parts))));

            if ($base === '') {
                $base = Str::slug($laptop->sku);
            }

            $slug = $base;
            $counter = 2;

            while (DB::table('laptops')->where('slug', $slug)->exists()) {
                $slug = "{$base}-{$counter}";
                $counter++;
            }

            DB::table('laptops')->where('id', $laptop->id)->update(['slug' => $slug]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laptops', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->dropColumn('slug');
        });
    }
};
