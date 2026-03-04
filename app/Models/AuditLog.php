<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $fillable = [
        'event_type',
        'message',
        'mahasiswa_id',
        'attendance_session_id',
        'severity',
        'status',
        'security_score',
        'threat_level',
        'device_info',
        'network_info',
    ];

    protected $casts = [
        'device_info' => 'array',
        'network_info' => 'array',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AttendanceSession::class, 'attendance_session_id');
    }

    public function auditActions()
    {
        return $this->hasMany(AuditAction::class);
    }
}
