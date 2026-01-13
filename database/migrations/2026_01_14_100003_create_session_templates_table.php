<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('session_templates', function (Blueprint $table) {
            $table->id();
            $table->integer('dosen_id');
            $table->integer('course_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->time('default_start_time');
            $table->time('default_end_time');
            $table->integer('duration_minutes')->default(100);
            $table->json('default_days')->nullable(); // [1,2,3,4,5] for Mon-Fri
            $table->boolean('auto_activate')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['dosen_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_templates');
    }
};
