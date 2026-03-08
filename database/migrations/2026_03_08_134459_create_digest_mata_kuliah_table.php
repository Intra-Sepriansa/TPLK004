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
        Schema::create('digest_mata_kuliah', function (Blueprint $table) {
            $table->id();
            $table->foreignId('digest_id')->constrained('weekly_learning_digests')->cascadeOnDelete();
            $table->foreignId('mata_kuliah_id')->constrained('mata_kuliah')->cascadeOnDelete();
            $table->unsignedInteger('meeting_number')->default(1);
            $table->string('title')->nullable();
            $table->timestamps();

            $table->unique(['digest_id', 'mata_kuliah_id']);
        });

        Schema::table('weekly_learning_digests', function (Blueprint $table) {
            $table->dropForeign(['mata_kuliah_id']);
            $table->dropUnique('weekly_digest_unique_week_course');
            $table->dropColumn(['mata_kuliah_id', 'meeting_number', 'title']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('weekly_learning_digests', function (Blueprint $table) {
            $table->foreignId('mata_kuliah_id')->nullable()->constrained('mata_kuliah')->cascadeOnDelete();
            $table->unsignedInteger('meeting_number')->default(1);
            $table->string('title')->nullable();
            $table->unique(['mata_kuliah_id', 'week_number', 'semester'], 'weekly_digest_unique_week_course');
        });

        Schema::dropIfExists('digest_mata_kuliah');
    }
};
