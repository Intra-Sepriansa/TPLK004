<?php

namespace App\Services;

use App\Models\UserPreference;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class PreferenceManagerService
{
    /**
     * Cache TTL in seconds (1 hour)
     */
    protected const CACHE_TTL = 3600;

    /**
     * Validation rules for each category
     */
    protected array $validationRules = [
        'general' => [
            'language' => 'in:id,en',
            'timezone' => 'string|max:50',
            'dateFormat' => 'in:DD/MM/YYYY,MM/DD/YYYY,YYYY-MM-DD',
            'startOfWeek' => 'in:sunday,monday',
        ],
        'notifications' => [
            'email.enabled' => 'boolean',
            'email.attendance' => 'boolean',
            'email.tasks' => 'boolean',
            'email.announcements' => 'boolean',
            'email.reminders' => 'boolean',
            'push.enabled' => 'boolean',
            'push.attendance' => 'boolean',
            'push.tasks' => 'boolean',
            'push.chat' => 'boolean',
            'inApp.enabled' => 'boolean',
            'inApp.sound' => 'boolean',
            'inApp.vibration' => 'boolean',
        ],
        'appearance' => [
            'theme' => 'in:light,dark,system',
            'fontSize' => 'in:small,medium,large',
            'compactMode' => 'boolean',
            'animations' => 'boolean',
            'highContrast' => 'boolean',
        ],
        'privacy' => [
            'profileVisibility' => 'in:public,contacts,private',
            'showOnlineStatus' => 'boolean',
            'showLastSeen' => 'boolean',
            'shareActivity' => 'boolean',
            'allowSearchByNim' => 'boolean',
        ],
        'security' => [
            'twoFactorEnabled' => 'boolean',
            'loginNotifications' => 'boolean',
            'sessionTimeout' => 'integer|min:5|max:1440',
        ],
        'data' => [
            'autoBackup' => 'boolean',
            'backupFrequency' => 'in:daily,weekly,monthly',
            'dataRetention' => 'integer|min:30|max:3650',
        ],
    ];

    /**
     * Get all settings for a user.
     */
    public function getSettings(Model $user): array
    {
        $cacheKey = $this->getCacheKey($user);
        
        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($user) {
            return UserPreference::getAllForUser($user);
        });
    }

    /**
     * Get settings for a specific category.
     */
    public function getCategorySettings(Model $user, string $category): array
    {
        $this->validateCategory($category);
        
        $allSettings = $this->getSettings($user);
        return $allSettings[$category] ?? UserPreference::DEFAULTS[$category] ?? [];
    }

    /**
     * Update all settings for a user.
     */
    public function updateSettings(Model $user, array $settings): array
    {
        $updated = [];
        
        foreach ($settings as $category => $categorySettings) {
            if (in_array($category, UserPreference::CATEGORIES)) {
                $updated[$category] = $this->updateCategorySettings($user, $category, $categorySettings);
            }
        }

        $this->clearCache($user);
        
        return $this->getSettings($user);
    }

    /**
     * Update settings for a specific category.
     */
    public function updateCategorySettings(Model $user, string $category, array $settings): array
    {
        $this->validateCategory($category);
        $this->validateSettings($category, $settings);

        $preference = UserPreference::updateForUser($user, $category, $settings);
        
        $this->clearCache($user);
        
        return $preference->getSettingsWithDefaults();
    }

    /**
     * Reset settings to defaults for a user.
     */
    public function resetToDefaults(Model $user, ?string $category = null): array
    {
        if ($category) {
            $this->validateCategory($category);
            UserPreference::resetForUser($user, $category);
        } else {
            UserPreference::resetAllForUser($user);
        }

        $this->clearCache($user);
        
        return $this->getSettings($user);
    }

    /**
     * Export settings as JSON-serializable array.
     */
    public function exportSettings(Model $user): array
    {
        return [
            'version' => '1.0',
            'exported_at' => now()->toIso8601String(),
            'settings' => $this->getSettings($user),
        ];
    }

    /**
     * Import settings from exported data.
     */
    public function importSettings(Model $user, array $data): array
    {
        if (!isset($data['settings']) || !is_array($data['settings'])) {
            throw ValidationException::withMessages([
                'data' => ['Invalid settings format'],
            ]);
        }

        return $this->updateSettings($user, $data['settings']);
    }

    /**
     * Get a specific setting value.
     */
    public function getSetting(Model $user, string $category, string $key, mixed $default = null): mixed
    {
        $settings = $this->getCategorySettings($user, $category);
        return data_get($settings, $key, $default);
    }

    /**
     * Set a specific setting value.
     */
    public function setSetting(Model $user, string $category, string $key, mixed $value): void
    {
        $this->validateCategory($category);
        
        $preference = UserPreference::getOrCreate($user, $category);
        $preference->setSetting($key, $value);
        $preference->save();
        
        $this->clearCache($user);
    }

    /**
     * Validate category exists.
     */
    protected function validateCategory(string $category): void
    {
        if (!in_array($category, UserPreference::CATEGORIES)) {
            throw ValidationException::withMessages([
                'category' => ["Invalid category: {$category}"],
            ]);
        }
    }

    /**
     * Validate settings for a category.
     */
    protected function validateSettings(string $category, array $settings): void
    {
        $rules = $this->validationRules[$category] ?? [];
        
        if (empty($rules)) {
            return;
        }

        // Flatten nested settings for validation
        $flatSettings = $this->flattenArray($settings);
        
        $validator = Validator::make($flatSettings, $rules);
        
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }

    /**
     * Flatten nested array with dot notation keys.
     */
    protected function flattenArray(array $array, string $prefix = ''): array
    {
        $result = [];
        
        foreach ($array as $key => $value) {
            $newKey = $prefix ? "{$prefix}.{$key}" : $key;
            
            if (is_array($value) && !empty($value) && !array_is_list($value)) {
                $result = array_merge($result, $this->flattenArray($value, $newKey));
            } else {
                $result[$newKey] = $value;
            }
        }
        
        return $result;
    }

    /**
     * Get cache key for user settings.
     */
    protected function getCacheKey(Model $user): string
    {
        return sprintf('user_preferences:%s:%d', get_class($user), $user->id);
    }

    /**
     * Clear cache for user settings.
     */
    protected function clearCache(Model $user): void
    {
        Cache::forget($this->getCacheKey($user));
    }

    /**
     * Get default settings for all categories.
     */
    public function getDefaults(): array
    {
        return UserPreference::DEFAULTS;
    }

    /**
     * Get default settings for a specific category.
     */
    public function getCategoryDefaults(string $category): array
    {
        $this->validateCategory($category);
        return UserPreference::DEFAULTS[$category] ?? [];
    }
}
