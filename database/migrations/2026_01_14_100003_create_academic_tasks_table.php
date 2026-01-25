<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_tasks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mahasiswa_id');
            $table->foreignId('mahasiswa_course_id')->constrained('mahasiswa_courses')->onDelete('cascade');
            $table->integer('meeting_number')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('deadline')->nullable();
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->index(['mahasiswa_id', 'status']);
            $table->index(['mahasiswa_course_id', 'meeting_number']);
            $table->index(['deadline', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_tasks');
    }
};
