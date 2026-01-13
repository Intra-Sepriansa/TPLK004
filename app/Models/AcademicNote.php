<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AcademicNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'mahasiswa_id',
        'mahasiswa_course_id',
        'meeting_number',
        'title',
        'content',
        'links',
    ];

    protected $casts = [
        'meeting_number' => 'integer',
        'links' => 'array',
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

    // Scopes
    public function scopeForCourse($query, int $courseId)
    {
        return $query->where('mahasiswa_course_id', $courseId);
    }

    public function scopeSearch($query, string $keyword)
    {
        return $query->where(function ($q) use ($keyword) {
            $q->where('title', 'like', "%{$keyword}%")
              ->orWhere('content', 'like', "%{$keyword}%");
        });
    }

    public function scopeOrderByMeeting($query, string $direction = 'asc')
    {
        return $query->orderBy('meeting_number', $direction);
    }
}
