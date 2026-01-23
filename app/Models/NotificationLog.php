<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class NotificationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'recipient_type',
        'recipient_id',
        'type',
        'subject',
        'body',
        'status',
        'sent_at',
        'opened_at',
        'clicked_at',
        'error_message',
        'metadata',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'opened_at' => 'datetime',
        'clicked_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(NotificationCampaign::class, 'campaign_id');
    }

    public function recipient(): MorphTo
    {
        return $this->morphTo();
    }

    public function markAsSent(): void
    {
        $this->status = 'sent';
        $this->sent_at = now();
        $this->save();
    }

    public function markAsOpened(): void
    {
        if ($this->status === 'sent' || $this->status === 'delivered') {
            $this->status = 'opened';
            $this->opened_at = now();
            $this->save();

            if ($this->campaign) {
                $this->campaign->increment('opened_count');
            }
        }
    }

    public function markAsClicked(): void
    {
        if (!$this->clicked_at) {
            $this->status = 'clicked';
            $this->clicked_at = now();
            $this->save();

            if ($this->campaign) {
                $this->campaign->increment('clicked_count');
            }
        }
    }
}
