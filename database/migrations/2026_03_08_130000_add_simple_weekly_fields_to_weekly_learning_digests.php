<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('weekly_learning_digests', function (Blueprint $table) {
            if (! Schema::hasColumn('weekly_learning_digests', 'meeting_number')) {
                $table->unsignedInteger('meeting_number')->default(1)->after('week_number');
            }

            if (! Schema::hasColumn('weekly_learning_digests', 'has_structured_task')) {
                $table->boolean('has_structured_task')->default(false)->after('description');
            }

            if (! Schema::hasColumn('weekly_learning_digests', 'forum_posts_required')) {
                $table->unsignedTinyInteger('forum_posts_required')->default(2)->after('has_structured_task');
            }
        });
    }

    public function down(): void
    {
        Schema::table('weekly_learning_digests', function (Blueprint $table) {
            $drops = [];

            if (Schema::hasColumn('weekly_learning_digests', 'forum_posts_required')) {
                $drops[] = 'forum_posts_required';
            }

            if (Schema::hasColumn('weekly_learning_digests', 'has_structured_task')) {
                $drops[] = 'has_structured_task';
            }

            if (Schema::hasColumn('weekly_learning_digests', 'meeting_number')) {
                $drops[] = 'meeting_number';
            }

            if ($drops !== []) {
                $table->dropColumn($drops);
            }
        });
    }
};
