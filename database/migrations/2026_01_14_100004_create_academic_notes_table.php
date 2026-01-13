<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_notes', function (Blueprint $table) {
            $table->id();
            $table->integer('mahasiswa_id');
            $table->foreignId('mahasiswa_course_id')->constrained('mahasiswa_courses')->onDelete('cascade');
            $table->integer('meeting_number');
            $table->string('title');
            $table->text('content');
            $table->json('links')->nullable();
            $table->timestamps();

            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->index(['mahasiswa_id', 'mahasiswa_course_id']);
            $table->index(['mahasiswa_course_id', 'meeting_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_notes');
    }
};
