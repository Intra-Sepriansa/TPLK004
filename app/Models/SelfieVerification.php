<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SelfieVerification extends Model
{
    protected $fillable = [
        'attendance_log_id',
        'status',
        'verified_by',
        'verified_by_type',
        'verified_by_name',
        'verified_at',
        'rejection_reason',
        'note',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function attendanceLog(): BelongsTo
    {
        return $this->belongsTo(AttendanceLog::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function verifierDosen(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'verified_by');
    }
}
