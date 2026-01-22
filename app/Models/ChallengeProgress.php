<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChallengeProgress extends Model
{
    use HasFactory;

    protected $table = 'challenge_progress';

    protected $fillable = [
        'challenge_id',
        'mahasiswa_id',
        'current_value',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(Challenge::class);
    }

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function incrementProgress(int $amount = 1): void
    {
        $this->current_value += $amount;
        
        if ($this->current_value >= $this->challenge->target_value && !$this->is_completed) {
            $this->is_completed = true;
            $this->completed_at = now();
        }
        
        $this->save();
    }

    public function getProgressPercentage(): float
    {
        return min(100, ($this->current_value / $this->challenge->target_value) * 100);
    }
}
