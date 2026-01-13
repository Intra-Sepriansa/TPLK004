<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendance_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('attendance_logs', 'grade_points')) {
                $table->decimal('grade_points', 5, 2)->nullable()->after('status');
            }
            if (!Schema::hasColumn('attendance_logs', 'override_by')) {
                $table->integer('override_by')->nullable()->after('note');
            }
            if (!Schema::hasColumn('attendance_logs', 'override_reason')) {
                $table->text('override_reason')->nullable()->after('override_by');
            }
            if (!Schema::hasColumn('attendance_logs', 'original_status')) {
                $table->string('original_status')->nullable()->after('override_reason');
            }
        });
    }

    public function down(): void
    {
        Schema::table('attendance_logs', function (Blueprint $table) {
            $table->dropColumn(['grade_points', 'override_by', 'override_reason', 'original_status']);
        });
    }
};
