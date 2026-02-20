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
        'category',
        'tags',
        'default_start_time',
        'default_end_time',
        'duration_minutes',
        'qr_refresh_interval',
        'allow_late_minutes',
        'grace_period_minutes',
        'default_days',
        'require_selfie',
        'selfie_verification_level',
        'require_location',
        'location_radius_meters',
        'anti_spoofing',
        'max_attempts',
        'auto_activate',
        'auto_activate_time',
        'auto_deactivate',
        'auto_deactivate_time',
        'send_reminder',
        'reminder_minutes_before',
        'is_active',
        'is_draft',
        'is_favorite',
    ];

    protected $casts = [
        'default_days' => 'array',
        'tags' => 'array',
        'auto_activate' => 'boolean',
        'auto_deactivate' => 'boolean',
        'is_active' => 'boolean',
        'is_draft' => 'boolean',
        'is_favorite' => 'boolean',
        'require_selfie' => 'boolean',
        'require_location' => 'boolean',
        'anti_spoofing' => 'boolean',
        'send_reminder' => 'boolean',
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
