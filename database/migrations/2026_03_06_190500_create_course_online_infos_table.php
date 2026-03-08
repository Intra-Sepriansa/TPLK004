<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_online_infos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mahasiswa_course_id')->constrained('mahasiswa_courses')->cascadeOnDelete();
            $table->foreignId('mahasiswa_id')->constrained('mahasiswa')->cascadeOnDelete();
            $table->string('platform_name')->default('UNPM Learning');
            $table->string('portal_url')->nullable();
            $table->string('forum_url')->nullable();
            $table->string('class_code')->nullable();
            $table->string('contact_info')->nullable();
            $table->text('access_notes')->nullable();
            $table->timestamps();

            $table->unique('mahasiswa_course_id');
            $table->index(['mahasiswa_id', 'mahasiswa_course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_online_infos');
    }
};

