<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class UserPreference extends Model
{
    protected $fillable = [
        'preferable_id',
        'preferable_type',
        'category',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    /**
     * Valid preference categories
     */
    public const CATEGORIES = [
        'general',
        'notifications',
        'appearance',
        'privacy',
        'security',
        'data',
    ];

    /**
     * Default settings for each category
     */
    public const DEFAULTS = [
        'general' => [
            'language' => 'id',
            'timezone' => 'Asia/Jakarta',
            'dateFormat' => 'DD/MM/YYYY',
            'startOfWeek' => 'monday',
        ],
        'notifications' => [
            'email' => [
                'enabled' => true,
                'attendance' => true,
                'tasks' => true,
                'announcements' => true,
                'reminders' => true,
            ],
            'push' => [
                'enabled' => true,
                'attendance' => true,
                'tasks' => true,
                'chat' => true,
            ],
            'inApp' => [
                'enabled' => true,
                'sound' => true,
                'vibration' => true,
            ],
        ],
        'appearance' => [
            'theme' => 'system',
            'fontSize' => 'medium',
            'compactMode' => false,
            'animations' => true,
            'highContrast' => false,
        ],
        'privacy' => [
            'profileVisibility' => 'contacts',
            'showOnlineStatus' => true,
            'showLastSeen' => true,
            'shareActivity' => true,
            'allowSearchByNim' => true,
        ],
        'security' => [
            'twoFactorEnabled' => false,
            'loginNotifications' => true,
            'sessionTimeout' => 60, // minutes
        ],
        'data' => [
            'autoBackup' => false,
            'backupFrequency' => 'weekly',
            'dataRetention' => 365, // days
        ],
    ];

    /**
     * Get the parent preferable model (Mahasiswa, Dosen, or User).
     */
    public function preferable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get a specific setting value with dot notation support.
     */
    public function getSetting(string $key, mixed $default = null): mixed
    {
        return data_get($this->settings, $key, $default);
    }

    /**
     * Set a specific setting value with dot notation support.
     */
    public function setSetting(string $key, mixed $value): self
    {
        $settings = $this->settings ?? [];
        data_set($settings, $key, $value);
        $this->settings = $settings;
        return $this;
    }

    /**
     * Merge settings with defaults.
     */
    public function getSettingsWithDefaults(): array
    {
        $defaults = self::DEFAULTS[$this->category] ?? [];
        return array_replace_recursive($defaults, $this->settings ?? []);
    }

    /**
     * Get or create preference for a user and category.
     */
    public static function getOrCreate(Model $user, string $category): self
    {
        return self::firstOrCreate(
            [
                'preferable_id' => $user->id,
                'preferable_type' => get_class($user),
                'category' => $category,
            ],
            [
                'settings' => self::DEFAULTS[$category] ?? [],
            ]
        );
    }

    /**
     * Get all preferences for a user.
     */
    public static function getAllForUser(Model $user): array
    {
        $preferences = self::where('preferable_id', $user->id)
            ->where('preferable_type', get_class($user))
            ->get()
            ->keyBy('category');

        $result = [];
        foreach (self::CATEGORIES as $category) {
            if ($preferences->has($category)) {
                $result[$category] = $preferences[$category]->getSettingsWithDefaults();
            } else {
                $result[$category] = self::DEFAULTS[$category] ?? [];
            }
        }

        return $result;
    }

    /**
     * Update settings for a user and category.
     */
    public static function updateForUser(Model $user, string $category, array $settings): self
    {
        $preference = self::getOrCreate($user, $category);
        $preference->settings = array_replace_recursive(
            $preference->settings ?? [],
            $settings
        );
        $preference->save();
        return $preference;
    }

    /**
     * Reset settings to defaults for a user and category.
     */
    public static function resetForUser(Model $user, string $category): self
    {
        $preference = self::getOrCreate($user, $category);
        $preference->settings = self::DEFAULTS[$category] ?? [];
        $preference->save();
        return $preference;
    }

    /**
     * Reset all settings to defaults for a user.
     */
    public static function resetAllForUser(Model $user): void
    {
        foreach (self::CATEGORIES as $category) {
            self::resetForUser($user, $category);
        }
    }
}
