<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseMeeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'mahasiswa_course_id',
        'meeting_number',
        'scheduled_date',
        'is_completed',
        'completed_at',
        'notes',
    ];

    protected $casts = [
        'meeting_number' => 'integer',
        'scheduled_date' => 'date',
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    // Relationships
    public function course(): BelongsTo
    {
        return $this->belongsTo(MahasiswaCourse::class, 'mahasiswa_course_id');
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('is_completed', true);
    }

    public function scopePending($query)
    {
        return $query->where('is_completed', false);
    }

    // Methods
    public function markAsCompleted(): void
    {
        $this->update([
            'is_completed' => true,
            'completed_at' => now(),
        ]);

        // Update current_meeting on course
        $this->course->update([
            'current_meeting' => $this->course->meetings()->completed()->count(),
        ]);
    }
}
