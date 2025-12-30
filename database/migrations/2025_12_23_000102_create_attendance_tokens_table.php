<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attendance_session_id')
                ->constrained('attendance_sessions')
                ->cascadeOnDelete();
            $table->string('token');
            $table->dateTime('expires_at');
            $table->timestamps();

            $table->index(['attendance_session_id', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_tokens');
    }
};
