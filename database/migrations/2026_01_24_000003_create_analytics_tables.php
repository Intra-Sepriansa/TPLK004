<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Analytics Events Table
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_type'); // attendance_scan, login, page_view, etc
            $table->morphs('user');
            $table->string('session_id')->nullable();
            $table->json('properties')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('device_type')->nullable();
            $table->string('browser')->nullable();
            $table->string('os')->nullable();
            $table->timestamp('created_at');
            
            $table->index(['event_type', 'created_at']);
            $table->index(['user_type', 'user_id', 'created_at']);
        });

        // Daily Metrics Table
        Schema::create('daily_metrics', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('metric_type'); // attendance_rate, active_users, etc
            $table->string('dimension')->nullable(); // class, course, etc
            $table->string('dimension_value')->nullable();
            $table->decimal('value', 10, 2);
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->unique(['date', 'metric_type', 'dimension', 'dimension_value']);
            $table->index(['date', 'metric_type']);
        });

        // Predictions Table
        Schema::create('predictions', function (Blueprint $table) {
            $table->id();
            $table->string('prediction_type'); // attendance, performance, risk
            $table->morphs('subject');
            $table->date('prediction_date');
            $table->decimal('predicted_value', 10, 2);
            $table->decimal('confidence_score', 5, 2);
            $table->json('factors')->nullable();
            $table->decimal('actual_value', 10, 2)->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            
            $table->index(['prediction_type', 'prediction_date']);
        });

        // Anomalies Table
        Schema::create('anomalies', function (Blueprint $table) {
            $table->id();
            $table->string('anomaly_type'); // unusual_pattern, fraud_attempt, etc
            $table->morphs('subject');
            $table->enum('severity', ['low', 'medium', 'high', 'critical']);
            $table->text('description');
            $table->json('evidence')->nullable();
            $table->enum('status', ['detected', 'investigating', 'resolved', 'false_positive'])->default('detected');
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->text('resolution_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'severity', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anomalies');
        Schema::dropIfExists('predictions');
        Schema::dropIfExists('daily_metrics');
        Schema::dropIfExists('analytics_events');
    }
};
