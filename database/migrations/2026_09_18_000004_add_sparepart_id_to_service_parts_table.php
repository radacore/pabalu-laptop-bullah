<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_parts', function (Blueprint $table) {
            $table->foreignId('sparepart_id')->nullable()->after('sparepart_type_id')->constrained('spareparts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('service_parts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('sparepart_id');
        });
    }
};
