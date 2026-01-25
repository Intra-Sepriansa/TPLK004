<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel untuk badge/achievement
        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // perfect_attendance, streak_7, etc
            $table->string('name');
            $table->text('description');
            $table->string('icon')->nullable(); // emoji or icon name
            $table->string('color')->default('emerald'); // badge color
            $table->enum('category', ['attendance', 'streak', 'achievement', 'special'])->default('achievement');
            $table->integer('points')->default(0); // points awarded
            $table->json('criteria')->nullable(); // JSON criteria for auto-award
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Tabel untuk badge yang dimiliki mahasiswa
        Schema::create('mahasiswa_badges', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mahasiswa_id');
            $table->unsignedBigInteger('badge_id');
            $table->timestamp('earned_at');
            $table->string('earned_reason')->nullable();
            $table->timestamps();

            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->foreign('badge_id')->references('id')->on('badges')->onDelete('cascade');
            $table->unique(['mahasiswa_id', 'badge_id']);
        });

        // Tabel untuk level system
        Schema::create('levels', function (Blueprint $table) {
            $table->id();
            $table->integer('level_number')->unique();
            $table->string('name'); // Novice, Apprentice, Expert, Master, Legend
            $table->integer('min_points');
            $table->integer('max_points');
            $table->string('icon')->nullable();
            $table->string('color')->default('gray');
            $table->timestamps();
        });

        // Tabel untuk points history
        Schema::create('point_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mahasiswa_id');
            $table->integer('points');
            $table->enum('type', ['earned', 'spent', 'bonus', 'penalty']);
            $table->string('source'); // attendance, badge, streak, etc
            $table->string('description');
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('reference_type')->nullable();
            $table->timestamps();

            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->index(['mahasiswa_id', 'created_at']);
        });

        // Tabel untuk streak tracking
        Schema::create('attendance_streaks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mahasiswa_id');
            $table->integer('current_streak')->default(0);
            $table->integer('longest_streak')->default(0);
            $table->date('last_attendance_date')->nullable();
            $table->date('streak_start_date')->nullable();
            $table->timestamps();

            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->unique('mahasiswa_id');
        });

        // Update mahasiswa table untuk gamification
        Schema::table('mahasiswa', function (Blueprint $table) {
            $table->integer('total_points')->default(0)->after('password');
            $table->integer('current_level')->default(1)->after('total_points');
        });
    }

    public function down(): void
    {
        Schema::table('mahasiswa', function (Blueprint $table) {
            $table->dropColumn(['total_points', 'current_level']);
        });
        Schema::dropIfExists('attendance_streaks');
        Schema::dropIfExists('point_histories');
        Schema::dropIfExists('levels');
        Schema::dropIfExists('mahasiswa_badges');
        Schema::dropIfExists('badges');
    }
};
