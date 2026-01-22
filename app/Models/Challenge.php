<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Challenge extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'type',
        'category',
        'target_value',
        'reward_points',
        'reward_badge_id',
        'starts_at',
        'ends_at',
        'is_active',
        'requirements',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_active' => 'boolean',
        'requirements' => 'array',
    ];

    public function progress(): HasMany
    {
        return $this->hasMany(ChallengeProgress::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>=', now());
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function isCompleted(Mahasiswa $mahasiswa): bool
    {
        return $this->progress()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->where('is_completed', true)
            ->exists();
    }

    public function getProgressPercentage(Mahasiswa $mahasiswa): float
    {
        $progress = $this->progress()
            ->where('mahasiswa_id', $mahasiswa->id)
            ->first();

        if (!$progress) {
            return 0;
        }

        return min(100, ($progress->current_value / $this->target_value) * 100);
    }
}
