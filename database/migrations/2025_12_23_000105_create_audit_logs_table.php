<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event_type');
            $table->text('message');
            $table->integer('mahasiswa_id')->nullable();
            $table->foreignId('attendance_session_id')
                ->nullable()
                ->constrained('attendance_sessions')
                ->nullOnDelete();
            $table->timestamps();

            $table->index(['event_type', 'created_at']);
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->foreign('mahasiswa_id')
                ->references('id')
                ->on('mahasiswa')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
