<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttendancePermit extends Model
{
    protected $fillable = [
        'mahasiswa_id',
        'attendance_session_id',
        'type',
        'reason',
        'attachment',
        'status',
        'approved_by',
        'approved_at',
        'reviewed_at',
        'rejection_reason',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AttendanceSession::class, 'attendance_session_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'approved_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(AttendancePermitComment::class, 'attendance_permit_id');
    }
}
