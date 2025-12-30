<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('attendance_sessions')) {
            return;
        }

        $this->ensureMataKuliahKeyType();

        $constraint = DB::selectOne(
            "SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME
             FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'attendance_sessions'
               AND COLUMN_NAME = 'course_id'
               AND REFERENCED_TABLE_NAME IS NOT NULL
             LIMIT 1"
        );

        if ($constraint && $constraint->REFERENCED_TABLE_NAME === 'mata_kuliah') {
            return;
        }

        if ($constraint && isset($constraint->CONSTRAINT_NAME)) {
            DB::statement(
                'ALTER TABLE `attendance_sessions` DROP FOREIGN KEY `' . $constraint->CONSTRAINT_NAME . '`'
            );
        }

        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->foreign('course_id')
                ->references('id')
                ->on('mata_kuliah')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('attendance_sessions') || !Schema::hasTable('courses')) {
            return;
        }

        $constraint = DB::selectOne(
            "SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME
             FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'attendance_sessions'
               AND COLUMN_NAME = 'course_id'
               AND REFERENCED_TABLE_NAME IS NOT NULL
             LIMIT 1"
        );

        if ($constraint && $constraint->REFERENCED_TABLE_NAME === 'courses') {
            return;
        }

        if ($constraint && isset($constraint->CONSTRAINT_NAME)) {
            DB::statement(
                'ALTER TABLE `attendance_sessions` DROP FOREIGN KEY `' . $constraint->CONSTRAINT_NAME . '`'
            );
        }

        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->foreign('course_id')
                ->references('id')
                ->on('courses')
                ->cascadeOnDelete();
        });
    }

    private function ensureMataKuliahKeyType(): void
    {
        if (!Schema::hasTable('mata_kuliah')) {
            return;
        }

        $column = DB::selectOne(
            "SELECT COLUMN_TYPE
             FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'mata_kuliah'
               AND COLUMN_NAME = 'id'
             LIMIT 1"
        );

        if ($column && is_string($column->COLUMN_TYPE)) {
            $columnType = strtolower($column->COLUMN_TYPE);
            if (str_contains($columnType, 'bigint') && str_contains($columnType, 'unsigned')) {
                return;
            }
        }

        $pertemuanConstraint = DB::selectOne(
            "SELECT CONSTRAINT_NAME
             FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'pertemuan'
               AND COLUMN_NAME = 'mata_kuliah_id'
               AND REFERENCED_TABLE_NAME IS NOT NULL
             LIMIT 1"
        );

        if ($pertemuanConstraint && isset($pertemuanConstraint->CONSTRAINT_NAME)) {
            DB::statement(
                'ALTER TABLE `pertemuan` DROP FOREIGN KEY `' . $pertemuanConstraint->CONSTRAINT_NAME . '`'
            );
        }

        DB::statement(
            'ALTER TABLE `mata_kuliah` MODIFY `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT'
        );

        if (Schema::hasTable('pertemuan') && Schema::hasColumn('pertemuan', 'mata_kuliah_id')) {
            DB::statement(
                'ALTER TABLE `pertemuan` MODIFY `mata_kuliah_id` BIGINT UNSIGNED NOT NULL'
            );

            DB::statement(
                'ALTER TABLE `pertemuan` ADD CONSTRAINT `fk_pt_mk` FOREIGN KEY (`mata_kuliah_id`) REFERENCES `mata_kuliah` (`id`)'
            );
        }
    }
};
