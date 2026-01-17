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
        Schema::create('tutorial_completions', function (Blueprint $table) {
            $table->id();
            $table->morphs('learner'); // learner_id, learner_type (Mahasiswa/Dosen/User)
            $table->string('tutorial_id'); // e.g., 'dosen-sesi-absen-tutorial', 'mahasiswa-absen-tutorial'
            $table->boolean('completed')->default(false);
            $table->boolean('skipped')->default(false);
            $table->integer('current_step')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            // Ensure one completion record per tutorial per user
            $table->unique(['learner_id', 'learner_type', 'tutorial_id'], 'tutorial_comp_unique');
            
            // Index for faster lookups
            $table->index(['learner_id', 'learner_type'], 'tutorial_comp_learner_idx');
            $table->index('tutorial_id', 'tutorial_comp_tutorial_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tutorial_completions');
    }
};
