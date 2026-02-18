<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendance_logs', function (Blueprint $table) {
            // Enhanced device info
            if (!Schema::hasColumn('attendance_logs', 'browser')) {
                $table->string('browser')->nullable()->after('device_type');
            }
            if (!Schema::hasColumn('attendance_logs', 'user_agent')) {
                $table->text('user_agent')->nullable()->after('browser');
            }
            if (!Schema::hasColumn('attendance_logs', 'platform')) {
                $table->string('platform')->nullable()->after('user_agent');
            }
            if (!Schema::hasColumn('attendance_logs', 'screen_resolution')) {
                $table->string('screen_resolution')->nullable()->after('platform');
            }
            if (!Schema::hasColumn('attendance_logs', 'timezone')) {
                $table->string('timezone')->nullable()->after('screen_resolution');
            }
            if (!Schema::hasColumn('attendance_logs', 'ip_address')) {
                $table->string('ip_address')->nullable()->after('timezone');
            }
            if (!Schema::hasColumn('attendance_logs', 'device_fingerprint')) {
                $table->string('device_fingerprint')->nullable()->after('ip_address');
            }
            if (!Schema::hasColumn('attendance_logs', 'is_device_trusted')) {
                $table->boolean('is_device_trusted')->default(false)->after('device_fingerprint');
            }

            // Enhanced location
            if (!Schema::hasColumn('attendance_logs', 'accuracy')) {
                $table->decimal('accuracy', 8, 2)->nullable()->after('longitude');
            }
            if (!Schema::hasColumn('attendance_logs', 'address')) {
                $table->text('address')->nullable()->after('accuracy');
            }

            // AI processing fields
            if (!Schema::hasColumn('attendance_logs', 'ai_processing_step')) {
                $table->string('ai_processing_step')->nullable()->after('address');
            }
            if (!Schema::hasColumn('attendance_logs', 'face_detected')) {
                $table->boolean('face_detected')->nullable()->after('ai_processing_step');
            }
            if (!Schema::hasColumn('attendance_logs', 'face_match_score')) {
                $table->decimal('face_match_score', 5, 2)->nullable()->after('face_detected');
            }
            if (!Schema::hasColumn('attendance_logs', 'is_live_photo')) {
                $table->boolean('is_live_photo')->nullable()->after('face_match_score');
            }
            if (!Schema::hasColumn('attendance_logs', 'spoofing_detected')) {
                $table->boolean('spoofing_detected')->nullable()->after('is_live_photo');
            }
            if (!Schema::hasColumn('attendance_logs', 'image_quality_score')) {
                $table->decimal('image_quality_score', 5, 2)->nullable()->after('spoofing_detected');
            }
            if (!Schema::hasColumn('attendance_logs', 'ai_confidence')) {
                $table->decimal('ai_confidence', 5, 2)->nullable()->after('image_quality_score');
            }
            if (!Schema::hasColumn('attendance_logs', 'ai_recommendation')) {
                $table->string('ai_recommendation')->nullable()->after('ai_confidence');
            }
            if (!Schema::hasColumn('attendance_logs', 'is_suspicious')) {
                $table->boolean('is_suspicious')->default(false)->after('ai_recommendation');
            }
            if (!Schema::hasColumn('attendance_logs', 'risk_score')) {
                $table->decimal('risk_score', 5, 2)->nullable()->after('is_suspicious');
            }
            if (!Schema::hasColumn('attendance_logs', 'fraud_flags')) {
                $table->json('fraud_flags')->nullable()->after('risk_score');
            }
            if (!Schema::hasColumn('attendance_logs', 'ai_analysis_json')) {
                $table->json('ai_analysis_json')->nullable()->after('fraud_flags');
            }
            if (!Schema::hasColumn('attendance_logs', 'ai_processed_at')) {
                $table->timestamp('ai_processed_at')->nullable()->after('ai_analysis_json');
            }
        });
    }

    public function down(): void
    {
        Schema::table('attendance_logs', function (Blueprint $table) {
            $columns = [
                'browser', 'user_agent', 'platform', 'screen_resolution', 'timezone',
                'ip_address', 'device_fingerprint', 'is_device_trusted',
                'accuracy', 'address',
                'ai_processing_step', 'face_detected', 'face_match_score',
                'is_live_photo', 'spoofing_detected', 'image_quality_score',
                'ai_confidence', 'ai_recommendation', 'is_suspicious',
                'risk_score', 'fraud_flags', 'ai_analysis_json', 'ai_processed_at',
            ];

            $existing = [];
            foreach ($columns as $col) {
                if (Schema::hasColumn('attendance_logs', $col)) {
                    $existing[] = $col;
                }
            }
            if (!empty($existing)) {
                $table->dropColumn($existing);
            }
        });
    }
};
