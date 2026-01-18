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
        if (!Schema::hasTable('attendance_sessions') || !Schema::hasTable('mata_kuliah')) {
            return;
        }

        // Drop existing foreign key constraint on course_id
        $constraint = DB::selectOne("
            SELECT CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'attendance_sessions'
              AND COLUMN_NAME = 'course_id'
              AND REFERENCED_TABLE_NAME IS NOT NULL
        ");

        if ($constraint && isset($constraint->CONSTRAINT_NAME)) {
            DB::statement(
                'ALTER TABLE `attendance_sessions` DROP FOREIGN KEY `' . $constraint->CONSTRAINT_NAME . '`'
            );
        }

        // Add new foreign key constraint referencing mata_kuliah
        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->foreign('course_id')
                ->references('id')
                ->on('mata_kuliah')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('attendance_sessions')) {
            return;
        }

        // Drop the mata_kuliah foreign key
        $constraint = DB::selectOne("
            SELECT CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'attendance_sessions'
              AND COLUMN_NAME = 'course_id'
              AND REFERENCED_TABLE_NAME = 'mata_kuliah'
        ");

        if ($constraint && isset($constraint->CONSTRAINT_NAME)) {
            DB::statement(
                'ALTER TABLE `attendance_sessions` DROP FOREIGN KEY `' . $constraint->CONSTRAINT_NAME . '`'
            );
        }
    }
};
