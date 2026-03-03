<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class GroupAssignment extends Model
{
    protected $fillable = [
        'dosen_id', 'course_id', 'title', 'description',
        'formation_mode', 'grading_mode', 'min_members', 'max_members',
        'formation_deadline', 'submission_deadline', 'max_file_size_mb',
        'allowed_file_types', 'features', 'peer_evaluation_weight',
        'contribution_threshold', 'allow_resubmission', 'is_locked',
    ];

    protected $appends = ['is_overdue'];

    protected $casts = [
        'features' => 'array',
        'allowed_file_types' => 'array',
        'formation_deadline' => 'datetime',
        'submission_deadline' => 'datetime',
        'is_locked' => 'boolean',
        'allow_resubmission' => 'boolean',
        'peer_evaluation_weight' => 'decimal:2',
        'contribution_threshold' => 'decimal:2',
    ];

    public function dosen(): BelongsTo { return $this->belongsTo(Dosen::class, 'dosen_id'); }
    public function course(): BelongsTo { return $this->belongsTo(MataKuliah::class, 'course_id'); }
    public function groups(): HasMany { return $this->hasMany(GaGroup::class, 'assignment_id'); }
    public function submissions(): HasMany { return $this->hasMany(GaSubmission::class, 'assignment_id'); }
    public function peerEvaluations(): HasMany { return $this->hasMany(GaPeerEvaluation::class, 'assignment_id'); }
    public function conflictReports(): HasManyThrough { return $this->hasManyThrough(GaConflictReport::class, GaGroup::class, 'assignment_id', 'group_id'); }

    public function getSubmittedGroupsCountAttribute(): int { return $this->submissions()->count(); }
    public function getTotalGroupsCountAttribute(): int { return $this->groups()->count(); }
    public function getIsOverdueAttribute(): bool { return $this->formation_deadline && $this->formation_deadline->isPast(); }
}
