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
        Schema::create('documentation_bookmarks', function (Blueprint $table) {
            $table->id();
            $table->morphs('reader');
            $table->string('guide_id');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['reader_id', 'reader_type', 'guide_id'], 'doc_bookmarks_unique');
            $table->index(['reader_id', 'reader_type'], 'doc_bookmarks_reader_idx');
            $table->index('guide_id', 'doc_bookmarks_guide_idx');
        });

        Schema::create('documentation_feedback', function (Blueprint $table) {
            $table->id();
            $table->morphs('reader');
            $table->string('guide_id');
            $table->boolean('helpful')->nullable();
            $table->unsignedTinyInteger('rating')->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['reader_id', 'reader_type', 'guide_id'], 'doc_feedback_unique');
            $table->index(['reader_id', 'reader_type'], 'doc_feedback_reader_idx');
            $table->index('guide_id', 'doc_feedback_guide_idx');
        });

        Schema::create('documentation_offline_downloads', function (Blueprint $table) {
            $table->id();
            $table->morphs('reader');
            $table->string('guide_id');
            $table->string('title')->nullable();
            $table->string('version')->nullable();
            $table->unsignedInteger('size_kb')->nullable();
            $table->timestamp('downloaded_at')->nullable();
            $table->timestamps();

            $table->unique(['reader_id', 'reader_type', 'guide_id'], 'doc_offline_unique');
            $table->index(['reader_id', 'reader_type'], 'doc_offline_reader_idx');
            $table->index('guide_id', 'doc_offline_guide_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documentation_offline_downloads');
        Schema::dropIfExists('documentation_feedback');
        Schema::dropIfExists('documentation_bookmarks');
    }
};
