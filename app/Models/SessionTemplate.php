<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionTemplate extends Model
{
    protected $fillable = [
        'dosen_id',
        'course_id',
        'name',
        'description',
        'default_start_time',
        'default_end_time',
        'duration_minutes',
        'default_days',
        'auto_activate',
        'is_active',
    ];

    protected $casts = [
        'default_days' => 'array',
        'auto_activate' => 'boolean',
        'is_active' => 'boolean',
        'default_start_time' => 'datetime:H:i',
        'default_end_time' => 'datetime:H:i',
    ];

    public function dosen(): BelongsTo
    {
        return $this->belongsTo(Dosen::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(MataKuliah::class, 'course_id');
    }

    public function getDaysLabelAttribute(): string
    {
        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        $days = $this->default_days ?? [];
        return implode(', ', array_map(fn($d) => $dayNames[$d] ?? '', $days));
    }
}
