<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GaPeerEvaluation extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'assignment_id', 'evaluator_id', 'evaluated_id',
        'contribution_score', 'communication_score', 'reliability_score',
        'quality_score', 'comments', 'submitted_at',
    ];
    protected $casts = ['submitted_at' => 'datetime'];

    public function assignment(): BelongsTo { return $this->belongsTo(GroupAssignment::class, 'assignment_id'); }
    public function evaluator(): BelongsTo { return $this->belongsTo(Mahasiswa::class, 'evaluator_id'); }
    public function evaluated(): BelongsTo { return $this->belongsTo(Mahasiswa::class, 'evaluated_id'); }

    public function getAverageScoreAttribute(): float
    {
        return round(($this->contribution_score + $this->communication_score + $this->reliability_score + $this->quality_score) / 4, 1);
    }
}
