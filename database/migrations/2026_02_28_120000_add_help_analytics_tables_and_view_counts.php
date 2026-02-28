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
        if (Schema::hasTable('help_faqs') && !Schema::hasColumn('help_faqs', 'view_count')) {
            Schema::table('help_faqs', function (Blueprint $table) {
                $table->unsignedBigInteger('view_count')->default(0)->after('not_helpful_count');
            });
        }

        if (Schema::hasTable('help_troubleshooting') && !Schema::hasColumn('help_troubleshooting', 'view_count')) {
            Schema::table('help_troubleshooting', function (Blueprint $table) {
                $table->unsignedBigInteger('view_count')->default(0)->after('is_active');
            });
        }

        if (!Schema::hasTable('help_video_metrics')) {
            Schema::create('help_video_metrics', function (Blueprint $table) {
                $table->id();
                $table->string('video_id', 120)->unique();
                $table->unsignedBigInteger('view_count')->default(0);
                $table->timestamp('last_viewed_at')->nullable();
                $table->timestamps();

                $table->index('view_count');
            });
        }

        if (!Schema::hasTable('help_analytics_events')) {
            Schema::create('help_analytics_events', function (Blueprint $table) {
                $table->id();
                $table->string('user_type', 30)->nullable();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('event_type', 60);
                $table->string('content_type', 40)->nullable();
                $table->string('content_key', 120)->nullable();
                $table->string('query', 255)->nullable();
                $table->unsignedInteger('result_count')->nullable();
                $table->json('meta')->nullable();
                $table->timestamps();

                $table->index(['event_type', 'created_at'], 'help_analytics_event_type_idx');
                $table->index(['content_type', 'content_key'], 'help_analytics_content_idx');
                $table->index(['query', 'created_at'], 'help_analytics_query_idx');
                $table->index(['user_type', 'user_id'], 'help_analytics_user_idx');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('help_analytics_events')) {
            Schema::drop('help_analytics_events');
        }

        if (Schema::hasTable('help_video_metrics')) {
            Schema::drop('help_video_metrics');
        }

        if (Schema::hasTable('help_troubleshooting') && Schema::hasColumn('help_troubleshooting', 'view_count')) {
            Schema::table('help_troubleshooting', function (Blueprint $table) {
                $table->dropColumn('view_count');
            });
        }

        if (Schema::hasTable('help_faqs') && Schema::hasColumn('help_faqs', 'view_count')) {
            Schema::table('help_faqs', function (Blueprint $table) {
                $table->dropColumn('view_count');
            });
        }
    }
};
