<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class PinnedMessage extends Model
{
    protected $fillable = [
        'conversation_id',
        'message_id',
        'pinned_by_type',
        'pinned_by_id',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    public function pinnedBy(): MorphTo
    {
        return $this->morphTo('pinned_by', 'pinned_by_type', 'pinned_by_id');
    }
}
