<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DigestUpcomingSchedule extends Model
{
    protected $table = 'digest_upcoming_schedules';

    protected $fillable = [
        'digest_id',
        'event_title',
        'event_description',
        'event_type',
        'event_date',
        'event_time',
        'duration_minutes',
        'platform',
        'meeting_link',
        'meeting_id',
        'meeting_password',
        'is_mandatory',
        'max_participants',
        'preparation_notes',
        'display_order',
    ];

    protected $casts = [
        'event_date' => 'date',
        'is_mandatory' => 'boolean',
    ];

    public function digest(): BelongsTo
    {
        return $this->belongsTo(WeeklyLearningDigest::class, 'digest_id');
    }
}
