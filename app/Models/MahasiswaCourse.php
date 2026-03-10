<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class MahasiswaCourse extends Model
{
    use HasFactory;

    private const ONLINE_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    protected $fillable = [
        'mahasiswa_id',
        'name',
        'sks',
        'total_meetings',
        'current_meeting',
        'uts_meeting',
        'uas_meeting',
        'schedule_day',
        'schedule_time',
        'mode',
        'period_group',
        'start_date',
        'is_favorite',
        'study_time_hours',
        'difficulty_level',
        'ai_recommendation',
        'color',
        'ruangan',
    ];

    protected $casts = [
        'sks' => 'integer',
        'total_meetings' => 'integer',
        'current_meeting' => 'integer',
        'uts_meeting' => 'integer',
        'uas_meeting' => 'integer',
        'period_group' => 'integer',
        'start_date' => 'date',
        'schedule_time' => 'datetime:H:i',
        'is_favorite' => 'boolean',
        'study_time_hours' => 'integer',
    ];

    protected $appends = [
        'progress',
        'uts_days_remaining',
        'uas_days_remaining',
        'uts_date',
        'uas_date',
        'is_uts_warning',
        'is_uas_warning',
        'is_uts_critical',
        'is_uas_critical',
    ];

    // Relationships
    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function meetings(): HasMany
    {
        return $this->hasMany(CourseMeeting::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(AcademicTask::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(AcademicNote::class);
    }

    public function materials(): HasMany
    {
        return $this->hasMany(CourseMaterial::class, 'course_id');
    }

    public function studyGroups(): HasMany
    {
        return $this->hasMany(StudyGroup::class, 'mahasiswa_course_id');
    }

    // Accessors
    public function getProgressAttribute(): float
    {
        if ($this->total_meetings <= 0) {
            return 0;
        }
        return round(($this->current_meeting / $this->total_meetings) * 100, 1);
    }

    public function getUtsDateAttribute(): ?string
    {
        return $this->calculateExamDate('uts')?->format('Y-m-d');
    }

    public function getUasDateAttribute(): ?string
    {
        return $this->calculateExamDate('uas')?->format('Y-m-d');
    }

    public function getUtsDaysRemainingAttribute(): ?int
    {
        $utsDate = $this->calculateExamDate('uts');
        if (!$utsDate) {
            return null;
        }
        return (int) now()->startOfDay()->diffInDays($utsDate, false);
    }

    public function getUasDaysRemainingAttribute(): ?int
    {
        $uasDate = $this->calculateExamDate('uas');
        if (!$uasDate) {
            return null;
        }
        return (int) now()->startOfDay()->diffInDays($uasDate, false);
    }

    public function getIsUtsWarningAttribute(): bool
    {
        $days = $this->uts_days_remaining;
        return $days !== null && $days <= 7 && $days > 0;
    }

    public function getIsUasWarningAttribute(): bool
    {
        $days = $this->uas_days_remaining;
        return $days !== null && $days <= 7 && $days > 0;
    }

    public function getIsUtsCriticalAttribute(): bool
    {
        $days = $this->uts_days_remaining;
        return $days !== null && $days <= 3 && $days >= 0;
    }

    public function getIsUasCriticalAttribute(): bool
    {
        $days = $this->uas_days_remaining;
        return $days !== null && $days <= 3 && $days >= 0;
    }

    // Helper Methods
    protected function calculateExamDate(string $examType): ?Carbon
    {
        // Global exam dates
        // UTS: 4-9 May 2026
        // UAS: 29 June - 4 July 2026
        
        if ($examType === 'uts') {
            return Carbon::create(2026, 5, 4, 0, 0, 0); // May 4, 2026
        }
        
        if ($examType === 'uas') {
            return Carbon::create(2026, 6, 29, 0, 0, 0); // June 29, 2026
        }

        return null;
    }

    public function getScheduleDayNameAttribute(): string
    {
        return $this->effective_schedule_day_name;
    }

    public function getModeNameAttribute(): string
    {
        return $this->effective_mode_name;
    }

    public function getIsAfterUtsAttribute(): bool
    {
        return (int) $this->current_meeting > (int) $this->uts_meeting;
    }

    public function getEffectiveModeAttribute(): string
    {
        if (!in_array((int) $this->period_group, [1, 2], true)) {
            return $this->mode === 'online' ? 'online' : 'offline';
        }

        if ((int) $this->period_group === 1) {
            return $this->is_after_uts ? 'online' : 'offline';
        }

        return $this->is_after_uts ? 'offline' : 'online';
    }

    public function getEffectiveModeNameAttribute(): string
    {
        return $this->effective_mode === 'online' ? 'Online' : 'Offline';
    }

    public function getEffectiveScheduleDayAttribute(): string
    {
        if ($this->effective_mode === 'offline') {
            return 'thursday';
        }

        $onlineDay = strtolower((string) $this->schedule_day);

        return in_array($onlineDay, self::ONLINE_DAYS, true) ? $onlineDay : 'monday';
    }

    public function getEffectiveScheduleDayNameAttribute(): string
    {
        $days = [
            'monday' => 'Senin',
            'tuesday' => 'Selasa',
            'wednesday' => 'Rabu',
            'thursday' => 'Kamis',
            'friday' => 'Jumat',
            'saturday' => 'Sabtu',
        ];

        return $days[$this->effective_schedule_day] ?? $this->effective_schedule_day;
    }
}
