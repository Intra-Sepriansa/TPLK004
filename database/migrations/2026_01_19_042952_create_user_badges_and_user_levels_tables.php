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
        // User badges - tracks which badges users have earned
        if (!Schema::hasTable('user_badges')) {
            Schema::create('user_badges', function (Blueprint $table) {
                $table->id();
                $table->integer('mahasiswa_id');
                $table->unsignedBigInteger('badge_id');
                $table->timestamp('earned_at')->useCurrent();
                $table->timestamps();
                
                $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
                $table->foreign('badge_id')->references('id')->on('badges')->onDelete('cascade');
                $table->unique(['mahasiswa_id', 'badge_id']);
            });
        }

        // User levels - tracks user progression through levels
        if (!Schema::hasTable('user_levels')) {
            Schema::create('user_levels', function (Blueprint $table) {
                $table->id();
                $table->integer('mahasiswa_id')->unique();
                $table->unsignedBigInteger('current_level_id');
                $table->integer('total_xp')->default(0);
                $table->integer('current_level_xp')->default(0);
                $table->timestamps();
                
                $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
                $table->foreign('current_level_id')->references('id')->on('levels')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_levels');
        Schema::dropIfExists('user_badges');
    }
};
