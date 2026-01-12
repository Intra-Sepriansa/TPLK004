<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'rejection_reason',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
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
}
