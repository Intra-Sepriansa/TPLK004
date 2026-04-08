<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Allow multiple meeting entries per course per digest.
     * Changes unique constraint from [digest_id, mata_kuliah_id]
     * to [digest_id, mata_kuliah_id, meeting_number].
     */
    public function up(): void
    {
        Schema::table('digest_mata_kuliah', function (Blueprint $table) {
            // Drop the foreign key that depends on the unique index first
            $table->dropForeign(['digest_id']);
            $table->dropForeign(['mata_kuliah_id']);

            // Now drop the unique constraint
            $table->dropUnique(['digest_id', 'mata_kuliah_id']);
        });

        Schema::table('digest_mata_kuliah', function (Blueprint $table) {
            // Re-add foreign keys (they'll use regular indexes)
            $table->foreign('digest_id')->references('id')->on('weekly_learning_digests')->cascadeOnDelete();
            $table->foreign('mata_kuliah_id')->references('id')->on('mata_kuliah')->cascadeOnDelete();

            // Add new compound unique that includes meeting_number
            $table->unique(['digest_id', 'mata_kuliah_id', 'meeting_number'], 'digest_course_meeting_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('digest_mata_kuliah', function (Blueprint $table) {
            $table->dropForeign(['digest_id']);
            $table->dropForeign(['mata_kuliah_id']);
            $table->dropUnique('digest_course_meeting_unique');
        });

        Schema::table('digest_mata_kuliah', function (Blueprint $table) {
            $table->unique(['digest_id', 'mata_kuliah_id']);
            $table->foreign('digest_id')->references('id')->on('weekly_learning_digests')->cascadeOnDelete();
            $table->foreign('mata_kuliah_id')->references('id')->on('mata_kuliah')->cascadeOnDelete();
        });
    }
};
