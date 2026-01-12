<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TugasSubmission extends Model
{
    protected $fillable = [
        'tugas_id',
        'mahasiswa_id',
        'content',
        'file_path',
        'file_name',
        'status',
        'grade',
        'grade_letter',
        'feedback',
        'graded_by',
        'graded_at',
        'submitted_at',
    ];

    protected $casts = [
        'grade' => 'decimal:2',
        'graded_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];

    public function tugas(): BelongsTo
    {
        return $this->belongsTo(Tugas::class);
    }

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function grader(): BelongsTo
    {
        return $this->belongsTo(Dosen::class, 'graded_by');
    }

    /**
     * Calculate grade letter from numeric grade
     */
    public static function calculateGradeLetter(float $grade): string
    {
        if ($grade >= 85) return 'A';
        if ($grade >= 70) return 'B';
        if ($grade >= 55) return 'C';
        if ($grade >= 40) return 'D';
        return 'E';
    }

    /**
     * Check if submission is late
     */
    public function isLate(): bool
    {
        if (!$this->tugas->deadline) return false;
        return $this->submitted_at->gt($this->tugas->deadline);
    }

    /**
     * Calculate final grade with late penalty
     */
    public function calculateFinalGrade(float $rawGrade): float
    {
        if (!$this->isLate() || !$this->tugas->allow_late_submission) {
            return $rawGrade;
        }

        $daysLate = $this->submitted_at->diffInDays($this->tugas->deadline);
        $penalty = $daysLate * ($this->tugas->late_penalty_percent ?? 10);
        
        return max(0, $rawGrade - $penalty);
    }
}
