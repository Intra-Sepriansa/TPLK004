<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weekly_learning_digests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mata_kuliah_id')->constrained('mata_kuliah')->cascadeOnDelete();
            $table->string('class_label', 50)->nullable();
            $table->unsignedInteger('week_number');
            $table->string('semester', 20);
            $table->date('week_start_date');
            $table->date('week_end_date');
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('mentari_course_url')->nullable();
            $table->string('mentari_course_id', 100)->nullable();
            $table->boolean('is_published')->default(false);
            $table->dateTime('published_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('mata_kuliah_id');
            $table->index(['week_number', 'semester']);
            $table->index(['is_published', 'published_at']);
            $table->index(['week_start_date', 'week_end_date']);
            $table->unique(['mata_kuliah_id', 'week_number', 'semester'], 'weekly_digest_unique_week_course');
        });

        Schema::create('digest_forum_discussions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('digest_id')->constrained('weekly_learning_digests')->cascadeOnDelete();
            $table->string('topic_title');
            $table->text('topic_description')->nullable();
            $table->text('mentari_forum_url')->nullable();
            $table->unsignedInteger('total_posts')->default(0);
            $table->unsignedInteger('total_participants')->default(0);
            $table->text('key_points')->nullable();
            $table->text('best_contributions')->nullable();
            $table->date('discussion_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();

            $table->index('digest_id');
            $table->index('display_order');
        });

        Schema::create('digest_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('digest_id')->constrained('weekly_learning_digests')->cascadeOnDelete();
            $table->string('assignment_title');
            $table->text('assignment_description')->nullable();
            $table->enum('assignment_type', ['individual', 'group', 'quiz', 'project'])->default('individual');
            $table->text('mentari_assignment_url')->nullable();
            $table->dateTime('deadline_date');
            $table->dateTime('submission_start_date')->nullable();
            $table->unsignedInteger('max_score')->default(100);
            $table->string('submission_format')->nullable();
            $table->string('file_size_limit', 50)->nullable();
            $table->text('detailed_instructions')->nullable();
            $table->text('grading_criteria')->nullable();
            $table->boolean('is_mandatory')->default(true);
            $table->boolean('is_late_submission_allowed')->default(false);
            $table->unsignedInteger('late_penalty_percentage')->default(0);
            $table->unsignedInteger('total_submissions')->default(0);
            $table->decimal('submission_rate', 5, 2)->default(0);
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();

            $table->index('digest_id');
            $table->index('deadline_date');
            $table->index('display_order');
        });

        Schema::create('digest_learning_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('digest_id')->constrained('weekly_learning_digests')->cascadeOnDelete();
            $table->string('material_title');
            $table->text('material_description')->nullable();
            $table->enum('material_type', ['pdf', 'video', 'slide', 'document', 'link', 'other']);
            $table->text('mentari_material_url')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_size', 50)->nullable();
            $table->string('duration', 50)->nullable();
            $table->text('topics_covered')->nullable();
            $table->text('learning_objectives')->nullable();
            $table->boolean('is_downloadable')->default(true);
            $table->boolean('requires_password')->default(false);
            $table->text('access_notes')->nullable();
            $table->date('upload_date')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();

            $table->index('digest_id');
            $table->index('material_type');
            $table->index('display_order');
        });

        Schema::create('digest_announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('digest_id')->constrained('weekly_learning_digests')->cascadeOnDelete();
            $table->string('announcement_title');
            $table->text('announcement_content');
            $table->enum('announcement_type', ['info', 'important', 'urgent', 'reminder'])->default('info');
            $table->enum('priority_level', ['low', 'normal', 'high', 'critical'])->default('normal');
            $table->boolean('is_pinned')->default(false);
            $table->dateTime('announced_date')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();

            $table->index('digest_id');
            $table->index('announcement_type');
            $table->index('priority_level');
            $table->index('display_order');
        });

        Schema::create('digest_upcoming_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('digest_id')->constrained('weekly_learning_digests')->cascadeOnDelete();
            $table->string('event_title');
            $table->text('event_description')->nullable();
            $table->enum('event_type', ['live_session', 'webinar', 'quiz', 'exam', 'deadline', 'meeting', 'other']);
            $table->date('event_date');
            $table->time('event_time')->nullable();
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->string('platform', 100)->nullable();
            $table->text('meeting_link')->nullable();
            $table->string('meeting_id', 100)->nullable();
            $table->string('meeting_password', 100)->nullable();
            $table->boolean('is_mandatory')->default(false);
            $table->unsignedInteger('max_participants')->nullable();
            $table->text('preparation_notes')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();

            $table->index('digest_id');
            $table->index('event_date');
            $table->index('event_type');
            $table->index('display_order');
        });

        Schema::create('digest_support_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('digest_id')->constrained('weekly_learning_digests')->cascadeOnDelete();
            $table->string('contact_name');
            $table->string('contact_role', 100)->nullable();
            $table->enum('contact_type', ['email', 'phone', 'whatsapp', 'telegram', 'other']);
            $table->string('contact_value');
            $table->string('available_hours')->nullable();
            $table->string('response_time', 100)->nullable();
            $table->text('notes')->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();

            $table->index('digest_id');
            $table->index('display_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('digest_support_contacts');
        Schema::dropIfExists('digest_upcoming_schedules');
        Schema::dropIfExists('digest_announcements');
        Schema::dropIfExists('digest_learning_materials');
        Schema::dropIfExists('digest_assignments');
        Schema::dropIfExists('digest_forum_discussions');
        Schema::dropIfExists('weekly_learning_digests');
    }
};
