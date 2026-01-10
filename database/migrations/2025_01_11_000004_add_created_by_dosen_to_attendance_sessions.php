<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendance_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('attendance_sessions', 'created_by_dosen_id')) {
                $table->integer('created_by_dosen_id')->nullable()->after('course_id');
                $table->index('created_by_dosen_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->dropIndex(['created_by_dosen_id']);
            $table->dropColumn('created_by_dosen_id');
        });
    }
};
