<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add created_by_dosen_id column if it doesn't exist
        if (Schema::hasTable('attendance_sessions')) {
            Schema::table('attendance_sessions', function (Blueprint $table) {
                if (!Schema::hasColumn('attendance_sessions', 'created_by_dosen_id')) {
                    $table->integer('created_by_dosen_id')->nullable()->after('created_by');
                    $table->foreign('created_by_dosen_id')->references('id')->on('dosen')->nullOnDelete();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('attendance_sessions')) {
            Schema::table('attendance_sessions', function (Blueprint $table) {
                $table->dropForeign(['created_by_dosen_id']);
                $table->dropColumn('created_by_dosen_id');
            });
        }
    }
};
