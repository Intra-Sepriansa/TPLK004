<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('mahasiswa_courses')->onDelete('cascade');
            $table->string('title');
            $table->enum('type', ['pdf', 'ppt', 'doc', 'video', 'link'])->default('pdf');
            $table->string('url');
            $table->bigInteger('size')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('course_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_materials');
    }
};
