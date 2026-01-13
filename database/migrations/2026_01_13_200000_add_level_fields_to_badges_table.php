<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('badges', function (Blueprint $table) {
            if (!Schema::hasColumn('badges', 'badge_level')) {
                $table->tinyInteger('badge_level')->default(1)->after('points');
            }
            if (!Schema::hasColumn('badges', 'requirement_type')) {
                $table->string('requirement_type')->nullable()->after('badge_level');
            }
            if (!Schema::hasColumn('badges', 'requirement_value')) {
                $table->integer('requirement_value')->default(0)->after('requirement_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('badges', function (Blueprint $table) {
            $table->dropColumn(['badge_level', 'requirement_type', 'requirement_value']);
        });
    }
};
