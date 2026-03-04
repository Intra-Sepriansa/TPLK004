<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class GaGroup extends Model
{
    protected $fillable = ['assignment_id', 'name', 'leader_id', 'slot_number', 'is_locked'];
    protected $casts = ['slot_number' => 'integer', 'is_locked' => 'boolean'];

    public function assignment(): BelongsTo { return $this->belongsTo(GroupAssignment::class, 'assignment_id'); }
    public function leader(): BelongsTo { return $this->belongsTo(Mahasiswa::class, 'leader_id'); }
    public function members(): HasMany { return $this->hasMany(GaGroupMember::class, 'group_id'); }
    public function messages(): HasMany { return $this->hasMany(GaMessage::class, 'group_id'); }
    public function tasks(): HasMany { return $this->hasMany(GaTask::class, 'group_id'); }
    public function files(): HasMany { return $this->hasMany(GaFile::class, 'group_id'); }
    public function activityLogs(): HasMany { return $this->hasMany(GaActivityLog::class, 'group_id'); }
    public function submission(): HasOne { return $this->hasOne(GaSubmission::class, 'group_id'); }
    public function conflictReports(): HasMany { return $this->hasMany(GaConflictReport::class, 'group_id'); }

    public function getMemberCountAttribute(): int { return $this->members()->count(); }

    public function getProgressAttribute(): float
    {
        $total = $this->tasks()->count();
        if ($total === 0) return 0;
        $completed = $this->tasks()->where('status', 'completed')->count();
        return round(($completed / $total) * 100, 1);
    }
}
