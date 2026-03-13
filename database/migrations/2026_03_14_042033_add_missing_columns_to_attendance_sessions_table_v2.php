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
        Schema::table('attendance_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('attendance_sessions', 'metode')) {
                $table->string('metode')->nullable()->after('is_active');
            }
            if (!Schema::hasColumn('attendance_sessions', 'zona')) {
                $table->string('zona')->nullable()->after('metode');
            }
            if (!Schema::hasColumn('attendance_sessions', 'qr_token')) {
                $table->string('qr_token')->nullable()->after('zona');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendance_sessions', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('attendance_sessions', 'metode')) $columnsToDrop[] = 'metode';
            if (Schema::hasColumn('attendance_sessions', 'zona')) $columnsToDrop[] = 'zona';
            if (Schema::hasColumn('attendance_sessions', 'qr_token')) $columnsToDrop[] = 'qr_token';
            
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
