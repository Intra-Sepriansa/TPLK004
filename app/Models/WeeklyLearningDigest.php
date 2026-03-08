<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WeeklyLearningDigest extends Model
{
    protected $table = 'weekly_learning_digests';

    protected $fillable = [
        'class_label',
        'week_number',
        'semester',
        'week_start_date',
        'week_end_date',
        'description',
        'has_structured_task',
        'forum_posts_required',
        'mentari_course_url',
        'mentari_course_id',
        'is_published',
        'published_at',
        'created_by',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'has_structured_task' => 'boolean',
        'forum_posts_required' => 'integer',
        'published_at' => 'datetime',
        'week_start_date' => 'date',
        'week_end_date' => 'date',
    ];

    public function mataKuliahs(): BelongsToMany
    {
        return $this->belongsToMany(MataKuliah::class, 'digest_mata_kuliah', 'digest_id', 'mata_kuliah_id')
            ->withPivot(['meeting_number', 'title'])
            ->withTimestamps();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function forumDiscussions(): HasMany
    {
        return $this->hasMany(DigestForumDiscussion::class, 'digest_id')->orderBy('display_order');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(DigestAssignment::class, 'digest_id')->orderBy('display_order');
    }

    public function learningMaterials(): HasMany
    {
        return $this->hasMany(DigestLearningMaterial::class, 'digest_id')->orderBy('display_order');
    }

    public function announcements(): HasMany
    {
        return $this->hasMany(DigestAnnouncement::class, 'digest_id')->orderBy('display_order');
    }

    public function upcomingSchedules(): HasMany
    {
        return $this->hasMany(DigestUpcomingSchedule::class, 'digest_id')
            ->orderBy('event_date')
            ->orderBy('event_time');
    }

    public function supportContacts(): HasMany
    {
        return $this->hasMany(DigestSupportContact::class, 'digest_id')->orderBy('display_order');
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeCurrentWeek($query)
    {
        $today = now()->toDateString();

        return $query
            ->whereDate('week_start_date', '<=', $today)
            ->whereDate('week_end_date', '>=', $today);
    }

    public function scopeForSemester($query, string $semester)
    {
        return $query->where('semester', $semester);
    }

    public function scopeForCourse($query, int $courseId)
    {
        return $query->whereHas('mataKuliahs', function ($q) use ($courseId) {
            $q->where('mata_kuliah_id', $courseId);
        });
    }

    public function getWeekRangeAttribute(): string
    {
        $start = $this->week_start_date?->format('d M');
        $end = $this->week_end_date?->format('d M Y');

        return trim(($start ? $start . ' - ' : '') . ($end ?? ''));
    }

    public function getTotalItemsAttribute(): int
    {
        return ($this->forum_discussions_count ?? $this->forumDiscussions()->count())
            + ($this->assignments_count ?? $this->assignments()->count())
            + ($this->learning_materials_count ?? $this->learningMaterials()->count())
            + ($this->announcements_count ?? $this->announcements()->count())
            + ($this->upcoming_schedules_count ?? $this->upcomingSchedules()->count())
            + ($this->support_contacts_count ?? $this->supportContacts()->count());
    }

    public function getCompletionPercentageAttribute(): float
    {
        $sections = [
            ($this->forum_discussions_count ?? $this->forumDiscussions()->count()) > 0,
            ($this->assignments_count ?? $this->assignments()->count()) > 0,
            ($this->learning_materials_count ?? $this->learningMaterials()->count()) > 0,
            ($this->announcements_count ?? $this->announcements()->count()) > 0,
            ($this->upcoming_schedules_count ?? $this->upcomingSchedules()->count()) > 0,
            ($this->support_contacts_count ?? $this->supportContacts()->count()) > 0,
        ];

        return round((collect($sections)->filter()->count() / count($sections)) * 100, 1);
    }

    public function hasUpcomingDeadlines(): bool
    {
        return $this->assignments()
            ->where('deadline_date', '>', now())
            ->where('deadline_date', '<=', now()->addDays(7))
            ->exists();
    }
}
