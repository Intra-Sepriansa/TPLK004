<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduleReminder extends Model
{
    protected $fillable = [
        'mahasiswa_id',
        'course_id',
        'reminder_minutes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class, 'mahasiswa_id');
    }

    public function course()
    {
        return $this->belongsTo(MahasiswaCourse::class, 'course_id');
    }
}
