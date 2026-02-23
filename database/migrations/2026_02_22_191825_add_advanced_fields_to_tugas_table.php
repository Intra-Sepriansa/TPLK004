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
        Schema::table('tugas', function (Blueprint $table) {
            if (!Schema::hasColumn('tugas', 'late_penalty_days')) {
                $table->integer('late_penalty_days')->default(1)->after('late_penalty_percent');
            }
            if (!Schema::hasColumn('tugas', 'learning_objectives')) {
                $table->json('learning_objectives')->nullable()->after('deskripsi');
            }
        });

        Schema::create('tugas_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tugas_id')->constrained('tugas')->onDelete('cascade');
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type')->nullable();
            $table->integer('file_size')->nullable();
            $table->timestamps();
        });

        Schema::create('tugas_rubrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tugas_id')->constrained('tugas')->onDelete('cascade');
            $table->string('criteria');
            $table->text('description')->nullable();
            $table->integer('max_score')->default(100);
            $table->decimal('weight', 5, 2)->default(100.00);
            $table->timestamps();
        });

        Schema::create('tugas_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tugas_id')->constrained('tugas')->onDelete('cascade');
            $table->string('assignee_type'); // 'student' or 'group'
            $table->unsignedBigInteger('assignee_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tugas_assignments');
        Schema::dropIfExists('tugas_rubrics');
        Schema::dropIfExists('tugas_attachments');

        Schema::table('tugas', function (Blueprint $table) {
            if (Schema::hasColumn('tugas', 'late_penalty_days')) {
                $table->dropColumn('late_penalty_days');
            }
            if (Schema::hasColumn('tugas', 'learning_objectives')) {
                $table->dropColumn('learning_objectives');
            }
        });
    }
};
