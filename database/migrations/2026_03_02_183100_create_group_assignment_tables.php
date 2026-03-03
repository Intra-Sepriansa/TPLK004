<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. group_assignments
        Schema::create('group_assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('dosen_id');
            $table->unsignedBigInteger('course_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('formation_mode', ['self-form', 'random', 'manual'])->default('self-form');
            $table->enum('grading_mode', ['same', 'individual', 'peer', 'contribution'])->default('same');
            $table->unsignedTinyInteger('min_members')->default(2);
            $table->unsignedTinyInteger('max_members')->default(5);
            $table->timestamp('formation_deadline')->nullable();
            $table->timestamp('submission_deadline')->nullable();
            $table->unsignedInteger('max_file_size_mb')->default(25);
            $table->json('allowed_file_types')->nullable();
            $table->json('features')->nullable();
            $table->decimal('peer_evaluation_weight', 3, 2)->nullable();
            $table->decimal('contribution_threshold', 3, 2)->default(0.30);
            $table->boolean('allow_resubmission')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->timestamps();

            $table->foreign('dosen_id')->references('id')->on('dosen')->onDelete('cascade');
            $table->foreign('course_id')->references('id')->on('mata_kuliah')->onDelete('cascade');
            $table->index(['dosen_id', 'course_id']);
        });

        // 2. ga_groups
        Schema::create('ga_groups', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('assignment_id');
            $table->string('name');
            $table->unsignedBigInteger('leader_id');
            $table->boolean('is_locked')->default(false);
            $table->timestamps();

            $table->foreign('assignment_id')->references('id')->on('group_assignments')->onDelete('cascade');
            $table->foreign('leader_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->unique(['assignment_id', 'name']);
        });

        // 3. ga_group_members
        Schema::create('ga_group_members', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('group_id');
            $table->unsignedBigInteger('student_id');
            $table->boolean('is_leader')->default(false);
            $table->timestamp('joined_at')->useCurrent();

            $table->foreign('group_id')->references('id')->on('ga_groups')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->unique(['group_id', 'student_id']);
            $table->index('student_id');
        });

        // 4. ga_files
        Schema::create('ga_files', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('group_id');
            $table->unsignedBigInteger('uploaded_by');
            $table->string('filename');
            $table->string('original_name');
            $table->string('file_path', 500);
            $table->string('file_type', 50);
            $table->bigInteger('file_size');
            $table->string('mime_type', 100);
            $table->string('thumbnail_path', 500)->nullable();
            $table->timestamp('uploaded_at')->useCurrent();

            $table->foreign('group_id')->references('id')->on('ga_groups')->onDelete('cascade');
            $table->foreign('uploaded_by')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->index(['group_id', 'uploaded_at']);
        });

        // 5. ga_messages
        Schema::create('ga_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('group_id');
            $table->unsignedBigInteger('sender_id');
            $table->text('content')->nullable();
            $table->enum('type', ['text', 'system', 'file'])->default('text');
            $table->unsignedBigInteger('reply_to_id')->nullable();
            $table->unsignedBigInteger('attachment_id')->nullable();
            $table->boolean('is_edited')->default(false);
            $table->boolean('is_deleted')->default(false);
            $table->timestamps();

            $table->foreign('group_id')->references('id')->on('ga_groups')->onDelete('cascade');
            $table->foreign('sender_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->foreign('reply_to_id')->references('id')->on('ga_messages')->onDelete('set null');
            $table->foreign('attachment_id')->references('id')->on('ga_files')->onDelete('set null');
            $table->index(['group_id', 'created_at']);
        });

        // 6. ga_message_reads
        Schema::create('ga_message_reads', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('message_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamp('read_at')->useCurrent();

            $table->foreign('message_id')->references('id')->on('ga_messages')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->unique(['message_id', 'user_id']);
        });

        // 7. ga_message_reactions
        Schema::create('ga_message_reactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('message_id');
            $table->unsignedBigInteger('user_id');
            $table->string('emoji', 10);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('message_id')->references('id')->on('ga_messages')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->unique(['message_id', 'user_id', 'emoji']);
        });

        // 8. ga_tasks
        Schema::create('ga_tasks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('group_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->timestamp('deadline')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->unsignedBigInteger('completed_by')->nullable();
            $table->timestamps();

            $table->foreign('group_id')->references('id')->on('ga_groups')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->foreign('completed_by')->references('id')->on('mahasiswa')->onDelete('set null');
            $table->index(['group_id', 'status']);
        });

        // 9. ga_task_assignments
        Schema::create('ga_task_assignments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('task_id');
            $table->unsignedBigInteger('student_id');
            $table->timestamp('assigned_at')->useCurrent();

            $table->foreign('task_id')->references('id')->on('ga_tasks')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->unique(['task_id', 'student_id']);
        });

        // 10. ga_submissions
        Schema::create('ga_submissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('group_id');
            $table->unsignedBigInteger('assignment_id');
            $table->unsignedBigInteger('submitted_by');
            $table->text('submission_notes')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->boolean('is_late')->default(false);
            $table->unsignedInteger('late_duration_minutes')->default(0);
            $table->decimal('grade', 5, 2)->nullable();
            $table->text('grading_notes')->nullable();
            $table->timestamp('graded_at')->nullable();
            $table->unsignedBigInteger('graded_by')->nullable();
            $table->timestamps();

            $table->foreign('group_id')->references('id')->on('ga_groups')->onDelete('cascade');
            $table->foreign('assignment_id')->references('id')->on('group_assignments')->onDelete('cascade');
            $table->foreign('submitted_by')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->foreign('graded_by')->references('id')->on('dosen')->onDelete('set null');
            $table->unique(['group_id', 'assignment_id']);
        });

        // 11. ga_submission_files
        Schema::create('ga_submission_files', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('submission_id');
            $table->unsignedBigInteger('file_id');

            $table->foreign('submission_id')->references('id')->on('ga_submissions')->onDelete('cascade');
            $table->foreign('file_id')->references('id')->on('ga_files')->onDelete('cascade');
            $table->unique(['submission_id', 'file_id']);
        });

        // 12. ga_peer_evaluations
        Schema::create('ga_peer_evaluations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('assignment_id');
            $table->unsignedBigInteger('evaluator_id');
            $table->unsignedBigInteger('evaluated_id');
            $table->unsignedTinyInteger('contribution_score');
            $table->unsignedTinyInteger('communication_score');
            $table->unsignedTinyInteger('reliability_score');
            $table->unsignedTinyInteger('quality_score');
            $table->text('comments')->nullable();
            $table->timestamp('submitted_at')->useCurrent();

            $table->foreign('assignment_id')->references('id')->on('group_assignments')->onDelete('cascade');
            $table->foreign('evaluator_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->foreign('evaluated_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->unique(['assignment_id', 'evaluator_id', 'evaluated_id'], 'ga_peer_eval_unique');
            $table->index(['assignment_id', 'evaluated_id']);
        });

        // 13. ga_activity_logs
        Schema::create('ga_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('group_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('activity_type', ['message', 'file_upload', 'task_created', 'task_completed', 'member_joined', 'member_left']);
            $table->json('activity_metadata')->nullable();
            $table->unsignedInteger('points')->default(0);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('group_id')->references('id')->on('ga_groups')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->index(['group_id', 'created_at']);
            $table->index(['user_id', 'activity_type']);
        });

        // 14. ga_individual_grades
        Schema::create('ga_individual_grades', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('submission_id');
            $table->unsignedBigInteger('student_id');
            $table->decimal('base_grade', 5, 2);
            $table->decimal('adjustment', 5, 2)->default(0);
            $table->decimal('peer_evaluation_score', 5, 2)->nullable();
            $table->decimal('contribution_score', 5, 2)->nullable();
            $table->decimal('final_grade', 5, 2);
            $table->text('grading_notes')->nullable();

            $table->foreign('submission_id')->references('id')->on('ga_submissions')->onDelete('cascade');
            $table->foreign('student_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->unique(['submission_id', 'student_id']);
        });

        // 15. ga_conflict_reports
        Schema::create('ga_conflict_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('group_id');
            $table->unsignedBigInteger('reporter_id');
            $table->text('description');
            $table->json('involved_members')->nullable();
            $table->enum('status', ['open', 'in_review', 'resolved'])->default('open');
            $table->text('resolution_notes')->nullable();
            $table->unsignedBigInteger('resolved_by')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->foreign('group_id')->references('id')->on('ga_groups')->onDelete('cascade');
            $table->foreign('reporter_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->foreign('resolved_by')->references('id')->on('dosen')->onDelete('set null');
            $table->index(['group_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ga_conflict_reports');
        Schema::dropIfExists('ga_individual_grades');
        Schema::dropIfExists('ga_activity_logs');
        Schema::dropIfExists('ga_peer_evaluations');
        Schema::dropIfExists('ga_submission_files');
        Schema::dropIfExists('ga_submissions');
        Schema::dropIfExists('ga_task_assignments');
        Schema::dropIfExists('ga_tasks');
        Schema::dropIfExists('ga_message_reactions');
        Schema::dropIfExists('ga_message_reads');
        Schema::dropIfExists('ga_messages');
        Schema::dropIfExists('ga_files');
        Schema::dropIfExists('ga_group_members');
        Schema::dropIfExists('ga_groups');
        Schema::dropIfExists('group_assignments');
    }
};
