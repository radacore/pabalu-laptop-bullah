<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Add nullable brand_id column
        Schema::table('laptops', function (Blueprint $table) {
            $table->foreignId('brand_id')->nullable()->after('sku')->constrained('brands')->nullOnDelete();
        });

        // Step 2: Migrate existing string data to brand_id
        // Fetch all unique brand strings from laptops
        $uniqueBrands = DB::table('laptops')
            ->whereNotNull('brand')
            ->where('brand', '!=', '')
            ->select('brand')
            ->distinct()
            ->pluck('brand');

        foreach ($uniqueBrands as $brandName) {
            // Find or create brand by name (case-insensitive match)
            $brand = DB::table('brands')
                ->whereRaw('LOWER(name) = ?', [strtolower($brandName)])
                ->first();

            if (!$brand) {
                $brandId = DB::table('brands')->insertGetId([
                    'name' => $brandName,
                    'slug' => strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $brandName)),
                    'is_active' => true,
                    'sort_order' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $brandId = $brand->id;
            }

            // Update all laptops with this brand string to use brand_id
            DB::table('laptops')
                ->where('brand', $brandName)
                ->update(['brand_id' => $brandId]);
        }

        // Step 3: Make brand_id NOT NULL only if all laptops have brand_id set
        // (Some laptops may have NULL brand string - we keep brand_id nullable for those)
        // We intentionally keep it nullable to avoid breaking records with empty brand strings.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laptops', function (Blueprint $table) {
            $table->dropForeign(['brand_id']);
            $table->dropColumn('brand_id');
        });
    }
};
