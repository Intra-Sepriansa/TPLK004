<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttendanceSession extends Model
{
    protected $fillable = [
        'course_id',
        'meeting_number',
        'title',
        'start_at',
        'end_at',
        'is_active',
        'created_by',
        'created_by_dosen_id',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(MataKuliah::class, 'course_id');
    }

    public function dosen(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'created_by_dosen_id');
    }

    public function tokens(): HasMany
    {
        return $this->hasMany(AttendanceToken::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
    }
}
