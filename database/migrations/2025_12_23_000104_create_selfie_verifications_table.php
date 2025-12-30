<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('selfie_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attendance_log_id')
                ->constrained('attendance_logs')
                ->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('selfie_verifications');
    }
};
