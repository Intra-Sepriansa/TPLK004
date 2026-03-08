<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DigestForumDiscussion extends Model
{
    protected $table = 'digest_forum_discussions';

    protected $fillable = [
        'digest_id',
        'topic_title',
        'topic_description',
        'mentari_forum_url',
        'total_posts',
        'total_participants',
        'key_points',
        'best_contributions',
        'discussion_date',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'discussion_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function digest(): BelongsTo
    {
        return $this->belongsTo(WeeklyLearningDigest::class, 'digest_id');
    }
}
