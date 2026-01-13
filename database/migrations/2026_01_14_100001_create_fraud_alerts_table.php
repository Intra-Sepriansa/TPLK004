<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fraud_alerts', function (Blueprint $table) {
            $table->id();
            $table->integer('mahasiswa_id');
            $table->integer('attendance_log_id')->nullable();
            $table->integer('attendance_session_id')->nullable();
            $table->enum('alert_type', [
                'gps_spoofing',
                'duplicate_selfie', 
                'rapid_location_change',
                'suspicious_pattern',
                'device_mismatch',
                'time_anomaly'
            ]);
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->text('description');
            $table->json('evidence')->nullable();
            $table->enum('status', ['pending', 'investigating', 'confirmed', 'dismissed'])->default('pending');
            $table->integer('reviewed_by')->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['mahasiswa_id', 'status']);
            $table->index(['alert_type', 'severity']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fraud_alerts');
    }
};
