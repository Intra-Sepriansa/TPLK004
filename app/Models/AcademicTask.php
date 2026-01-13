<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'mahasiswa_id',
        'mahasiswa_course_id',
        'meeting_number',
        'title',
        'description',
        'deadline',
        'status',
        'completed_at',
    ];

    protected $casts = [
        'meeting_number' => 'integer',
        'deadline' => 'date',
        'completed_at' => 'datetime',
    ];

    protected $appends = [
        'days_remaining',
        'is_overdue',
    ];

    // Relationships
    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(MahasiswaCourse::class, 'mahasiswa_course_id');
    }

    // Accessors
    public function getDaysRemainingAttribute(): ?int
    {
        if (!$this->deadline) {
            return null;
        }
        return (int) now()->startOfDay()->diffInDays($this->deadline, false);
    }

    public function getIsOverdueAttribute(): bool
    {
        if (!$this->deadline || $this->status === 'completed') {
            return false;
        }
        return $this->deadline->isPast();
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', '!=', 'completed')
            ->whereNotNull('deadline')
            ->where('deadline', '<', now()->startOfDay());
    }

    public function scopeUpcoming($query, int $days = 7)
    {
        return $query->where('status', '!=', 'completed')
            ->whereNotNull('deadline')
            ->whereBetween('deadline', [now()->startOfDay(), now()->addDays($days)->endOfDay()]);
    }

    // Methods
    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function toggleStatus(): void
    {
        if ($this->status === 'completed') {
            $this->update([
                'status' => 'pending',
                'completed_at' => null,
            ]);
        } else {
            $this->markAsCompleted();
        }
    }
}
