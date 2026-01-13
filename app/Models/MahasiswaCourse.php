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
        'start_date',
    ];

    protected $casts = [
        'sks' => 'integer',
        'total_meetings' => 'integer',
        'current_meeting' => 'integer',
        'uts_meeting' => 'integer',
        'uas_meeting' => 'integer',
        'start_date' => 'date',
        'schedule_time' => 'datetime:H:i',
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
        if (!$this->start_date) {
            return null;
        }

        $meetingNumber = $examType === 'uts' ? $this->uts_meeting : $this->uas_meeting;
        $weeksToAdd = $meetingNumber - 1; // Meeting 1 is week 0

        return Carbon::parse($this->start_date)->addWeeks($weeksToAdd);
    }

    public function getScheduleDayNameAttribute(): string
    {
        $days = [
            'monday' => 'Senin',
            'tuesday' => 'Selasa',
            'wednesday' => 'Rabu',
            'thursday' => 'Kamis',
            'friday' => 'Jumat',
        ];
        return $days[$this->schedule_day] ?? $this->schedule_day;
    }

    public function getModeNameAttribute(): string
    {
        return $this->mode === 'online' ? 'Online' : 'Offline';
    }
}
