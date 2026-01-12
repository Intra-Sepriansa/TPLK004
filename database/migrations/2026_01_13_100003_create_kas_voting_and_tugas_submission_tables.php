<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel untuk voting pengeluaran kas
        Schema::create('kas_votings', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->decimal('amount', 12, 2);
            $table->string('category');
            $table->enum('status', ['open', 'approved', 'rejected', 'closed'])->default('open');
            $table->integer('created_by'); // mahasiswa_id yang mengajukan
            $table->timestamp('voting_deadline');
            $table->integer('min_votes')->default(10); // minimum votes untuk valid
            $table->decimal('approval_threshold', 5, 2)->default(60.00); // persentase minimal setuju
            $table->timestamps();

            $table->foreign('created_by')->references('id')->on('mahasiswa')->onDelete('cascade');
        });

        // Tabel untuk vote individual
        Schema::create('kas_votes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('kas_voting_id');
            $table->integer('mahasiswa_id');
            $table->enum('vote', ['approve', 'reject']);
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->foreign('kas_voting_id')->references('id')->on('kas_votings')->onDelete('cascade');
            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->unique(['kas_voting_id', 'mahasiswa_id']);
        });

        // Tabel untuk reminder kas
        Schema::create('kas_reminders', function (Blueprint $table) {
            $table->id();
            $table->integer('mahasiswa_id');
            $table->decimal('amount_due', 12, 2);
            $table->integer('weeks_overdue')->default(1);
            $table->enum('status', ['pending', 'sent', 'acknowledged'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamps();

            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
        });

        // Tabel untuk submission tugas
        Schema::create('tugas_submissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tugas_id');
            $table->integer('mahasiswa_id');
            $table->text('content')->nullable(); // text submission
            $table->string('file_path')->nullable(); // file submission
            $table->string('file_name')->nullable();
            $table->enum('status', ['submitted', 'late', 'graded', 'revision_needed'])->default('submitted');
            $table->decimal('grade', 5, 2)->nullable(); // nilai 0-100
            $table->string('grade_letter')->nullable(); // A, B, C, D, E
            $table->text('feedback')->nullable(); // feedback dari dosen
            $table->integer('graded_by')->nullable(); // dosen_id
            $table->timestamp('graded_at')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();

            $table->foreign('tugas_id')->references('id')->on('tugas')->onDelete('cascade');
            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->foreign('graded_by')->references('id')->on('dosen')->onDelete('set null');
            $table->unique(['tugas_id', 'mahasiswa_id']);
        });

        // Update tugas table untuk deadline (skip if columns exist)
        if (!Schema::hasColumn('tugas', 'allow_late_submission')) {
            Schema::table('tugas', function (Blueprint $table) {
                $table->boolean('allow_late_submission')->default(true)->after('deadline');
                $table->integer('late_penalty_percent')->default(10)->after('allow_late_submission');
                $table->integer('max_grade')->default(100)->after('late_penalty_percent');
            });
        }

        // Tabel untuk admin activity log
        Schema::create('admin_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('action'); // create, update, delete, login, logout, etc
            $table->string('model_type')->nullable(); // App\Models\Mahasiswa, etc
            $table->unsignedBigInteger('model_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'created_at']);
            $table->index(['model_type', 'model_id']);
            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_activity_logs');
        if (Schema::hasColumn('tugas', 'allow_late_submission')) {
            Schema::table('tugas', function (Blueprint $table) {
                $table->dropColumn(['allow_late_submission', 'late_penalty_percent', 'max_grade']);
            });
        }
        Schema::dropIfExists('tugas_submissions');
        Schema::dropIfExists('kas_reminders');
        Schema::dropIfExists('kas_votes');
        Schema::dropIfExists('kas_votings');
    }
};
