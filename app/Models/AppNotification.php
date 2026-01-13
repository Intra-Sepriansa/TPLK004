<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppNotification extends Model
{
    protected $table = 'app_notifications';

    protected $fillable = [
        'notifiable_type',
        'notifiable_id',
        'title',
        'message',
        'type',
        'priority',
        'data',
        'action_url',
        'read_at',
        'scheduled_at',
        'created_by',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
        'scheduled_at' => 'datetime',
    ];

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeForUser($query, string $type, int $id)
    {
        return $query->where(function ($q) use ($type, $id) {
            $q->where('notifiable_type', 'all')
              ->orWhere(function ($q2) use ($type, $id) {
                  $q2->where('notifiable_type', $type)
                     ->where('notifiable_id', $id);
              });
        });
    }

    public function scopeScheduled($query)
    {
        return $query->whereNotNull('scheduled_at')
                     ->where('scheduled_at', '<=', now());
    }

    public function markAsRead(): void
    {
        $this->update(['read_at' => now()]);
    }

    public function getTypeIconAttribute(): string
    {
        return match($this->type) {
            'reminder' => 'bell',
            'announcement' => 'megaphone',
            'alert' => 'alert-triangle',
            'achievement' => 'trophy',
            'warning' => 'alert-circle',
            default => 'info',
        };
    }

    public function getTypeColorAttribute(): string
    {
        return match($this->type) {
            'reminder' => 'blue',
            'announcement' => 'purple',
            'alert' => 'red',
            'achievement' => 'yellow',
            'warning' => 'orange',
            default => 'gray',
        };
    }
}
