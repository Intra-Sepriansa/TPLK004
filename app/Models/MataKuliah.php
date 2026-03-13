<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MataKuliah extends Model
{
    protected $table = 'mata_kuliah';

    public $timestamps = false;

    protected $fillable = [
        'nama',
        'sks',
        'dosen_id',
    ];

    public function dosen(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'dosen_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(AttendanceSession::class, 'course_id');
    }

    public function meetingPlans(): HasMany
    {
        return $this->hasMany(Pertemuan::class, 'mata_kuliah_id');
    }

    /**
     * Alias for sessions() - used by AdvancedAnalyticsController
     */
    public function attendanceSessions(): HasMany
    {
        return $this->hasMany(AttendanceSession::class, 'course_id');
    }

    public function weeklyDigests(): BelongsToMany
    {
        return $this->belongsToMany(WeeklyLearningDigest::class, 'digest_mata_kuliah', 'mata_kuliah_id', 'digest_id')
            ->withPivot(['meeting_number', 'title'])
            ->withTimestamps();
    }
}
