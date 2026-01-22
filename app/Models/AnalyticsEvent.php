<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AnalyticsEvent extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'event_type',
        'user_type',
        'user_id',
        'session_id',
        'properties',
        'ip_address',
        'user_agent',
        'device_type',
        'browser',
        'os',
        'created_at',
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime',
    ];

    public function user(): MorphTo
    {
        return $this->morphTo();
    }

    public static function track(string $eventType, $user, array $properties = []): void
    {
        static::create([
            'event_type' => $eventType,
            'user_type' => get_class($user),
            'user_id' => $user->id,
            'session_id' => session()->getId(),
            'properties' => $properties,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'device_type' => static::detectDeviceType(),
            'browser' => static::detectBrowser(),
            'os' => static::detectOS(),
            'created_at' => now(),
        ]);
    }

    private static function detectDeviceType(): string
    {
        $userAgent = request()->userAgent();
        if (preg_match('/mobile/i', $userAgent)) {
            return 'mobile';
        } elseif (preg_match('/tablet/i', $userAgent)) {
            return 'tablet';
        }
        return 'desktop';
    }

    private static function detectBrowser(): ?string
    {
        $userAgent = request()->userAgent();
        if (preg_match('/Chrome/i', $userAgent)) return 'Chrome';
        if (preg_match('/Firefox/i', $userAgent)) return 'Firefox';
        if (preg_match('/Safari/i', $userAgent)) return 'Safari';
        if (preg_match('/Edge/i', $userAgent)) return 'Edge';
        return null;
    }

    private static function detectOS(): ?string
    {
        $userAgent = request()->userAgent();
        if (preg_match('/Windows/i', $userAgent)) return 'Windows';
        if (preg_match('/Mac/i', $userAgent)) return 'macOS';
        if (preg_match('/Linux/i', $userAgent)) return 'Linux';
        if (preg_match('/Android/i', $userAgent)) return 'Android';
        if (preg_match('/iOS/i', $userAgent)) return 'iOS';
        return null;
    }
}
