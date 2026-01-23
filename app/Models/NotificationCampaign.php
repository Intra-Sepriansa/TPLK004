<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NotificationCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'template_id',
        'target_type',
        'target_filters',
        'status',
        'scheduled_at',
        'sent_at',
        'total_recipients',
        'sent_count',
        'opened_count',
        'clicked_count',
    ];

    protected $casts = [
        'target_filters' => 'array',
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(NotificationTemplate::class, 'template_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(NotificationLog::class, 'campaign_id');
    }

    public function getOpenRate(): float
    {
        if ($this->sent_count == 0) {
            return 0;
        }
        
        return round(($this->opened_count / $this->sent_count) * 100, 2);
    }

    public function getClickRate(): float
    {
        if ($this->sent_count == 0) {
            return 0;
        }
        
        return round(($this->clicked_count / $this->sent_count) * 100, 2);
    }
}
