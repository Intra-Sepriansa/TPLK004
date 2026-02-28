<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendancePermitComment extends Model
{
    protected $fillable = [
        'attendance_permit_id',
        'sender_type',
        'sender_id',
        'sender_name',
        'message',
    ];

    public function permit(): BelongsTo
    {
        return $this->belongsTo(AttendancePermit::class, 'attendance_permit_id');
    }
}
