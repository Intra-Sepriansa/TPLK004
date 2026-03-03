<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class GaSubmission extends Model
{
    protected $fillable = [
        'group_id', 'assignment_id', 'submitted_by', 'submission_notes',
        'submitted_at', 'is_late', 'late_duration_minutes',
        'grade', 'grading_notes', 'graded_at', 'graded_by',
    ];

    protected $casts = [
        'submitted_at' => 'datetime', 'graded_at' => 'datetime',
        'is_late' => 'boolean', 'grade' => 'decimal:2',
    ];

    public function group(): BelongsTo { return $this->belongsTo(GaGroup::class, 'group_id'); }
    public function assignment(): BelongsTo { return $this->belongsTo(GroupAssignment::class, 'assignment_id'); }
    public function submitter(): BelongsTo { return $this->belongsTo(Mahasiswa::class, 'submitted_by'); }
    public function grader(): BelongsTo { return $this->belongsTo(Dosen::class, 'graded_by'); }
    public function files(): BelongsToMany { return $this->belongsToMany(GaFile::class, 'ga_submission_files', 'submission_id', 'file_id'); }
    public function individualGrades(): HasMany { return $this->hasMany(GaIndividualGrade::class, 'submission_id'); }
}
