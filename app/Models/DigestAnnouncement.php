<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DigestAnnouncement extends Model
{
    protected $table = 'digest_announcements';

    protected $fillable = [
        'digest_id',
        'announcement_title',
        'announcement_content',
        'announcement_type',
        'priority_level',
        'is_pinned',
        'announced_date',
        'display_order',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'announced_date' => 'datetime',
    ];

    public function digest(): BelongsTo
    {
        return $this->belongsTo(WeeklyLearningDigest::class, 'digest_id');
    }
}
