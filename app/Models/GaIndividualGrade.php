<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GaIndividualGrade extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'submission_id', 'student_id', 'base_grade', 'adjustment',
        'peer_evaluation_score', 'contribution_score', 'final_grade', 'grading_notes',
    ];
    protected $casts = [
        'base_grade' => 'decimal:2', 'adjustment' => 'decimal:2',
        'peer_evaluation_score' => 'decimal:2', 'contribution_score' => 'decimal:2',
        'final_grade' => 'decimal:2',
    ];

    public function submission(): BelongsTo { return $this->belongsTo(GaSubmission::class, 'submission_id'); }
    public function student(): BelongsTo { return $this->belongsTo(Mahasiswa::class, 'student_id'); }
}
