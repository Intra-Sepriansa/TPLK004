<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mahasiswa_courses', function (Blueprint $table) {
            $table->id();
            $table->integer('mahasiswa_id');
            $table->string('name');
            $table->tinyInteger('sks')->comment('2 or 3 only');
            $table->integer('total_meetings');
            $table->integer('current_meeting')->default(0);
            $table->integer('uts_meeting');
            $table->integer('uas_meeting');
            $table->enum('schedule_day', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
            $table->time('schedule_time');
            $table->enum('mode', ['online', 'offline']);
            $table->date('start_date')->nullable();
            $table->timestamps();

            $table->foreign('mahasiswa_id')->references('id')->on('mahasiswa')->onDelete('cascade');
            $table->index(['mahasiswa_id', 'schedule_day']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mahasiswa_courses');
    }
};
