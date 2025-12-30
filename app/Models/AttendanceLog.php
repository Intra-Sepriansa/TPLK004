<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

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
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
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
}
