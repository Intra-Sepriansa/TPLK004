<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FraudAlert extends Model
{
    protected $fillable = [
        'mahasiswa_id',
        'attendance_log_id',
        'attendance_session_id',
        'alert_type',
        'severity',
        'description',
        'evidence',
        'status',
        'reviewed_by',
        'review_notes',
        'reviewed_at',
    ];

    protected $casts = [
        'evidence' => 'array',
        'reviewed_at' => 'datetime',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function attendanceLog(): BelongsTo
    {
        return $this->belongsTo(AttendanceLog::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AttendanceSession::class, 'attendance_session_id');
    }

    public function getSeverityColorAttribute(): string
    {
        return match($this->severity) {
            'low' => 'blue',
            'medium' => 'yellow',
            'high' => 'orange',
            'critical' => 'red',
            default => 'gray',
        };
    }

    public function getAlertTypeLabel(): string
    {
        return match($this->alert_type) {
            'gps_spoofing' => 'GPS Spoofing Terdeteksi',
            'duplicate_selfie' => 'Selfie Duplikat',
            'rapid_location_change' => 'Perubahan Lokasi Cepat',
            'suspicious_pattern' => 'Pola Mencurigakan',
            'device_mismatch' => 'Perangkat Tidak Cocok',
            'time_anomaly' => 'Anomali Waktu',
            default => $this->alert_type,
        };
    }
}
