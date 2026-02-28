<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('mahasiswa_courses')) {
            $hasIsFavorite = Schema::hasColumn('mahasiswa_courses', 'is_favorite');
            $hasStudyTimeHours = Schema::hasColumn('mahasiswa_courses', 'study_time_hours');
            $hasDifficultyLevel = Schema::hasColumn('mahasiswa_courses', 'difficulty_level');
            $hasAiRecommendation = Schema::hasColumn('mahasiswa_courses', 'ai_recommendation');
            $hasColor = Schema::hasColumn('mahasiswa_courses', 'color');
            $hasRuangan = Schema::hasColumn('mahasiswa_courses', 'ruangan');

            Schema::table('mahasiswa_courses', function (Blueprint $table) use (
                $hasIsFavorite,
                $hasStudyTimeHours,
                $hasDifficultyLevel,
                $hasAiRecommendation,
                $hasColor,
                $hasRuangan
            ) {
                if (!$hasIsFavorite) {
                    $table->boolean('is_favorite')->default(false);
                }

                if (!$hasStudyTimeHours) {
                    $table->unsignedInteger('study_time_hours')->default(0);
                }

                if (!$hasDifficultyLevel) {
                    $table->string('difficulty_level')->default('medium');
                }

                if (!$hasAiRecommendation) {
                    $table->text('ai_recommendation')->nullable();
                }

                if (!$hasColor) {
                    $table->string('color')->default('#6366f1');
                }

                if (!$hasRuangan) {
                    $table->string('ruangan')->nullable();
                }
            });
        }

        if (!Schema::hasTable('study_groups')) {
            Schema::create('study_groups', function (Blueprint $table) {
                $table->id();
                $table->foreignId('mahasiswa_course_id')->constrained('mahasiswa_courses')->cascadeOnDelete();
                $table->string('name');
                $table->text('description')->nullable();
                $table->timestamps();

                $table->index('mahasiswa_course_id');
            });
        }

        if (!Schema::hasTable('study_group_members')) {
            Schema::create('study_group_members', function (Blueprint $table) {
                $table->id();
                $table->foreignId('study_group_id')->constrained('study_groups')->cascadeOnDelete();
                $table->foreignId('mahasiswa_id')->constrained('mahasiswa')->cascadeOnDelete();
                $table->boolean('is_admin')->default(false);
                $table->timestamps();

                $table->unique(['study_group_id', 'mahasiswa_id']);
                $table->index('mahasiswa_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('study_group_members')) {
            Schema::dropIfExists('study_group_members');
        }

        if (Schema::hasTable('study_groups')) {
            Schema::dropIfExists('study_groups');
        }

        if (!Schema::hasTable('mahasiswa_courses')) {
            return;
        }

        $columnsToDrop = [];

        foreach (['is_favorite', 'study_time_hours', 'difficulty_level', 'ai_recommendation', 'color', 'ruangan'] as $column) {
            if (Schema::hasColumn('mahasiswa_courses', $column)) {
                $columnsToDrop[] = $column;
            }
        }

        if ($columnsToDrop === []) {
            return;
        }

        Schema::table('mahasiswa_courses', function (Blueprint $table) use ($columnsToDrop) {
            $table->dropColumn($columnsToDrop);
        });
    }
};
