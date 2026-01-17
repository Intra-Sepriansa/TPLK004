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
        Schema::create('documentation_progress', function (Blueprint $table) {
            $table->id();
            $table->morphs('reader'); // reader_id, reader_type (Mahasiswa/Dosen/User)
            $table->string('guide_id'); // e.g., 'dosen-dashboard', 'mahasiswa-absen'
            $table->json('completed_sections')->default('[]'); // ['overview', 'features', 'tutorial']
            $table->boolean('is_completed')->default(false);
            $table->timestamp('last_read_at')->nullable();
            $table->timestamps();

            // Ensure one progress record per guide per user
            $table->unique(['reader_id', 'reader_type', 'guide_id'], 'doc_progress_unique');
            
            // Index for faster lookups
            $table->index(['reader_id', 'reader_type'], 'doc_progress_reader_idx');
            $table->index('guide_id', 'doc_progress_guide_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documentation_progress');
    }
};
