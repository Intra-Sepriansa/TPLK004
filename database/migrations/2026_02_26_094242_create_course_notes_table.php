<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswa')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('mahasiswa_courses')->onDelete('cascade');
            $table->text('content');
            $table->timestamps();

            $table->index(['mahasiswa_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_notes');
    }
};
