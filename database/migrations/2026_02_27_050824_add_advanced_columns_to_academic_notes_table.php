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
        Schema::table('academic_notes', function (Blueprint $table) {
            $table->json('blocks')->nullable()->after('content');
            $table->json('tags')->nullable()->after('blocks');
            $table->boolean('is_pinned')->default(false)->after('tags');
            $table->boolean('is_favorite')->default(false)->after('is_pinned');
            $table->integer('word_count')->default(0)->after('is_favorite');
            $table->integer('reading_time')->default(0)->after('word_count');
            $table->text('ai_summary')->nullable()->after('reading_time');
            $table->json('ai_keywords')->nullable()->after('ai_summary');
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('academic_notes', function (Blueprint $table) {
            $table->dropColumn([
                'blocks', 'tags', 'is_pinned', 'is_favorite', 
                'word_count', 'reading_time', 'ai_summary', 'ai_keywords'
            ]);
            $table->dropSoftDeletes();
        });
    }
};
