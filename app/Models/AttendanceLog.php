<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttendanceLog extends Model
{
    protected $fillable = [
        'attendance_session_id',
        'mahasiswa_id',
        'attendance_token_id',
        'scanned_at',
        'status',
        'distance_m',
        'selfie_path',
        'latitude',
        'longitude',
        'device_os',
        'device_model',
        'device_type',
        'note',
        // Enhanced device info
        'browser',
        'user_agent',
        'platform',
        'screen_resolution',
        'timezone',
        'ip_address',
        'device_fingerprint',
        'is_device_trusted',
        // Enhanced location
        'accuracy',
        'address',
        // AI processing
        'ai_processing_step',
        'face_detected',
        'face_match_score',
        'is_live_photo',
        'spoofing_detected',
        'image_quality_score',
        'ai_confidence',
        'ai_recommendation',
        'is_suspicious',
        'risk_score',
        'fraud_flags',
        'ai_analysis_json',
        'ai_processed_at',
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
        'ai_processed_at' => 'datetime',
        'fraud_flags' => 'array',
        'ai_analysis_json' => 'array',
        'is_device_trusted' => 'boolean',
        'face_detected' => 'boolean',
        'is_live_photo' => 'boolean',
        'spoofing_detected' => 'boolean',
        'is_suspicious' => 'boolean',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(AttendanceSession::class, 'attendance_session_id');
    }

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    public function selfieVerification(): HasOne
    {
        return $this->hasOne(SelfieVerification::class);
    }

    public function fraudAlerts(): HasMany
    {
        return $this->hasMany(FraudAlert::class, 'attendance_log_id');
    }
}
