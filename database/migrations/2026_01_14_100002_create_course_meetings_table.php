<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_meetings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mahasiswa_course_id')->constrained('mahasiswa_courses')->onDelete('cascade');
            $table->integer('meeting_number');
            $table->date('scheduled_date')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['mahasiswa_course_id', 'meeting_number']);
            $table->index(['mahasiswa_course_id', 'is_completed']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_meetings');
    }
};
