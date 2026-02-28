<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswa')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('mahasiswa_courses')->onDelete('cascade');
            $table->integer('reminder_minutes')->default(15);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['mahasiswa_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_reminders');
    }
};
