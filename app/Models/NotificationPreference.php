<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class NotificationPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_type',
        'user_id',
        'email_enabled',
        'push_enabled',
        'sms_enabled',
        'categories',
        'quiet_hours_start',
        'quiet_hours_end',
    ];

    protected $casts = [
        'email_enabled' => 'boolean',
        'push_enabled' => 'boolean',
        'sms_enabled' => 'boolean',
        'categories' => 'array',
    ];

    public function user(): MorphTo
    {
        return $this->morphTo();
    }

    public function isInQuietHours(): bool
    {
        if (!$this->quiet_hours_start || !$this->quiet_hours_end) {
            return false;
        }

        $now = now()->format('H:i:s');
        return $now >= $this->quiet_hours_start && $now <= $this->quiet_hours_end;
    }

    public function canReceive(string $type, string $category = null): bool
    {
        if ($this->isInQuietHours()) {
            return false;
        }

        $enabled = match($type) {
            'email' => $this->email_enabled,
            'push' => $this->push_enabled,
            'sms' => $this->sms_enabled,
            default => true,
        };

        if (!$enabled) {
            return false;
        }

        if ($category && $this->categories) {
            return in_array($category, $this->categories);
        }

        return true;
    }
}
