<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dosen_course', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dosen_id')->constrained('dosen')->cascadeOnDelete();
            $table->foreignId('course_id')->constrained('mata_kuliah')->cascadeOnDelete();
            $table->enum('role', ['pengampu', 'asisten'])->default('pengampu');
            $table->timestamp('assigned_at')->nullable();
            $table->timestamps();

            $table->unique(['dosen_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dosen_course');
    }
};
