<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('attendance_logs')) {
            DB::statement('ALTER TABLE attendance_logs MODIFY mahasiswa_id INT NOT NULL');

            Schema::table('attendance_logs', function (Blueprint $table) {
                $table->foreign('mahasiswa_id')
                    ->references('id')
                    ->on('mahasiswa')
                    ->cascadeOnDelete();
            });

            return;
        }

        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attendance_session_id')
                ->constrained('attendance_sessions')
                ->cascadeOnDelete();
            $table->integer('mahasiswa_id');
            $table->foreignId('attendance_token_id')
                ->nullable()
                ->constrained('attendance_tokens')
                ->nullOnDelete();
            $table->dateTime('scanned_at');
            $table->string('status');
            $table->decimal('distance_m', 8, 2)->nullable();
            $table->string('selfie_path')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('device_os')->nullable();
            $table->string('device_model')->nullable();
            $table->string('device_type')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['attendance_session_id', 'mahasiswa_id']);
            $table->index(['scanned_at', 'status']);
        });

        Schema::table('attendance_logs', function (Blueprint $table) {
            $table->foreign('mahasiswa_id')
                ->references('id')
                ->on('mahasiswa')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_logs');
    }
};
