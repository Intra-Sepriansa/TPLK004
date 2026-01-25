<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Challenges Table
        Schema::create('challenges', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->enum('type', ['daily', 'weekly', 'monthly', 'special']);
            $table->enum('category', ['attendance', 'streak', 'social', 'academic']);
            $table->integer('target_value');
            $table->integer('reward_points');
            $table->string('reward_badge_id')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('requirements')->nullable();
            $table->timestamps();
        });

        // Challenge Progress Table
        Schema::create('challenge_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challenge_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('mahasiswa_id');
            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->integer('current_value')->default(0);
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->unique(['challenge_id', 'mahasiswa_id']);
        });

        // Rewards Store Table
        Schema::create('rewards', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->enum('type', ['badge', 'privilege', 'physical', 'digital']);
            $table->integer('cost_points');
            $table->integer('stock')->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('is_available')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        // Reward Redemptions Table
        Schema::create('reward_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reward_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('mahasiswa_id');
            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->integer('points_spent');
            $table->enum('status', ['pending', 'approved', 'delivered', 'cancelled'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });

        // Leaderboard Snapshots (for historical data)
        Schema::create('leaderboard_snapshots', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mahasiswa_id');
            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->integer('rank');
            $table->integer('points');
            $table->integer('streak');
            $table->decimal('attendance_rate', 5, 2);
            $table->integer('badges_count');
            $table->enum('period', ['daily', 'weekly', 'monthly']);
            $table->date('snapshot_date');
            $table->timestamps();
            
            $table->index(['snapshot_date', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leaderboard_snapshots');
        Schema::dropIfExists('reward_redemptions');
        Schema::dropIfExists('rewards');
        Schema::dropIfExists('challenge_progress');
        Schema::dropIfExists('challenges');
    }
};
