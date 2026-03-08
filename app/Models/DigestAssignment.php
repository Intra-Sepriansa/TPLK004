<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DigestAssignment extends Model
{
    protected $table = 'digest_assignments';

    protected $fillable = [
        'digest_id',
        'assignment_title',
        'assignment_description',
        'assignment_type',
        'mentari_assignment_url',
        'deadline_date',
        'submission_start_date',
        'max_score',
        'submission_format',
        'file_size_limit',
        'detailed_instructions',
        'grading_criteria',
        'is_mandatory',
        'is_late_submission_allowed',
        'late_penalty_percentage',
        'total_submissions',
        'submission_rate',
        'display_order',
    ];

    protected $casts = [
        'deadline_date' => 'datetime',
        'submission_start_date' => 'datetime',
        'is_mandatory' => 'boolean',
        'is_late_submission_allowed' => 'boolean',
        'submission_rate' => 'decimal:2',
    ];

    public function digest(): BelongsTo
    {
        return $this->belongsTo(WeeklyLearningDigest::class, 'digest_id');
    }
}
