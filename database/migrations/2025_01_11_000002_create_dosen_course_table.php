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
            $table->integer('dosen_id');
            $table->unsignedBigInteger('course_id');
            $table->enum('role', ['pengampu', 'asisten'])->default('pengampu');
            $table->timestamp('assigned_at')->nullable();
            $table->timestamps();

            $table->index('dosen_id');
            $table->index('course_id');
            $table->unique(['dosen_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dosen_course');
    }
};
