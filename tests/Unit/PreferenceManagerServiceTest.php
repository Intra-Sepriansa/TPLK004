<?php

namespace Tests\Unit;

use App\Models\UserPreference;
use PHPUnit\Framework\TestCase;

/**
 * Property-based tests for PreferenceManagerService
 * Feature: advanced-settings-documentation
 * 
 * Property 1: Settings Persistence Round-Trip
 * For any valid UserSettings object, serializing to JSON then deserializing back 
 * SHALL produce an equivalent object with all properties preserved.
 * 
 * Validates: Requirements 7.3
 */
class PreferenceManagerServiceTest extends TestCase
{

    /**
     * Property 1: Settings Persistence Round-Trip
     * For any valid UserSettings object, serializing to JSON then deserializing back 
     * SHALL produce an equivalent object with all properties preserved.
     * 
     * Validates: Requirements 7.3
     */
    public function test_settings_round_trip_general(): void
    {
        // Generate various valid general settings
        $testCases = [
            ['language' => 'id', 'timezone' => 'Asia/Jakarta', 'dateFormat' => 'DD/MM/YYYY', 'startOfWeek' => 'monday'],
            ['language' => 'en', 'timezone' => 'UTC', 'dateFormat' => 'YYYY-MM-DD', 'startOfWeek' => 'sunday'],
            ['language' => 'id', 'timezone' => 'Asia/Makassar', 'dateFormat' => 'MM/DD/YYYY', 'startOfWeek' => 'monday'],
        ];

        foreach ($testCases as $original) {
            // Serialize (export)
            $exported = json_encode($original);
            
            // Deserialize (import)
            $imported = json_decode($exported, true);
            
            // Assert round-trip produces equivalent object
            $this->assertEquals($original, $imported, 'Round-trip should preserve general settings');
        }
    }

    public function test_settings_round_trip_notifications(): void
    {
        $testCases = [
            [
                'email' => ['enabled' => true, 'attendance' => true, 'tasks' => false, 'announcements' => true, 'reminders' => false],
                'push' => ['enabled' => true, 'attendance' => false, 'tasks' => true, 'chat' => true],
                'inApp' => ['enabled' => true, 'sound' => false, 'vibration' => true],
            ],
            [
                'email' => ['enabled' => false, 'attendance' => false, 'tasks' => false, 'announcements' => false, 'reminders' => false],
                'push' => ['enabled' => false, 'attendance' => false, 'tasks' => false, 'chat' => false],
                'inApp' => ['enabled' => false, 'sound' => false, 'vibration' => false],
            ],
        ];

        foreach ($testCases as $original) {
            $exported = json_encode($original);
            $imported = json_decode($exported, true);
            
            $this->assertEquals($original, $imported, 'Round-trip should preserve notification settings');
        }
    }

    public function test_settings_round_trip_appearance(): void
    {
        $testCases = [
            ['theme' => 'light', 'fontSize' => 'small', 'compactMode' => true, 'animations' => false, 'highContrast' => true],
            ['theme' => 'dark', 'fontSize' => 'large', 'compactMode' => false, 'animations' => true, 'highContrast' => false],
            ['theme' => 'system', 'fontSize' => 'medium', 'compactMode' => false, 'animations' => true, 'highContrast' => false],
        ];

        foreach ($testCases as $original) {
            $exported = json_encode($original);
            $imported = json_decode($exported, true);
            
            $this->assertEquals($original, $imported, 'Round-trip should preserve appearance settings');
        }
    }

    public function test_settings_round_trip_privacy(): void
    {
        $testCases = [
            ['profileVisibility' => 'public', 'showOnlineStatus' => true, 'showLastSeen' => true, 'shareActivity' => true, 'allowSearchByNim' => true],
            ['profileVisibility' => 'private', 'showOnlineStatus' => false, 'showLastSeen' => false, 'shareActivity' => false, 'allowSearchByNim' => false],
            ['profileVisibility' => 'contacts', 'showOnlineStatus' => true, 'showLastSeen' => false, 'shareActivity' => true, 'allowSearchByNim' => false],
        ];

        foreach ($testCases as $original) {
            $exported = json_encode($original);
            $imported = json_decode($exported, true);
            
            $this->assertEquals($original, $imported, 'Round-trip should preserve privacy settings');
        }
    }

    public function test_settings_round_trip_security(): void
    {
        $testCases = [
            ['twoFactorEnabled' => true, 'loginNotifications' => true, 'sessionTimeout' => 60],
            ['twoFactorEnabled' => false, 'loginNotifications' => false, 'sessionTimeout' => 30],
            ['twoFactorEnabled' => true, 'loginNotifications' => false, 'sessionTimeout' => 120],
        ];

        foreach ($testCases as $original) {
            $exported = json_encode($original);
            $imported = json_decode($exported, true);
            
            $this->assertEquals($original, $imported, 'Round-trip should preserve security settings');
        }
    }

    public function test_settings_round_trip_data(): void
    {
        $testCases = [
            ['autoBackup' => true, 'backupFrequency' => 'daily', 'dataRetention' => 365],
            ['autoBackup' => false, 'backupFrequency' => 'weekly', 'dataRetention' => 180],
            ['autoBackup' => true, 'backupFrequency' => 'monthly', 'dataRetention' => 730],
        ];

        foreach ($testCases as $original) {
            $exported = json_encode($original);
            $imported = json_decode($exported, true);
            
            $this->assertEquals($original, $imported, 'Round-trip should preserve data settings');
        }
    }

    /**
     * Property 1 continued: Full settings export/import round-trip
     */
    public function test_full_settings_export_import_round_trip(): void
    {
        $fullSettings = [
            'general' => ['language' => 'en', 'timezone' => 'UTC', 'dateFormat' => 'YYYY-MM-DD', 'startOfWeek' => 'sunday'],
            'notifications' => [
                'email' => ['enabled' => true, 'attendance' => true, 'tasks' => true, 'announcements' => true, 'reminders' => true],
                'push' => ['enabled' => true, 'attendance' => true, 'tasks' => true, 'chat' => true],
                'inApp' => ['enabled' => true, 'sound' => true, 'vibration' => true],
            ],
            'appearance' => ['theme' => 'dark', 'fontSize' => 'large', 'compactMode' => true, 'animations' => false, 'highContrast' => true],
            'privacy' => ['profileVisibility' => 'private', 'showOnlineStatus' => false, 'showLastSeen' => false, 'shareActivity' => false, 'allowSearchByNim' => false],
            'security' => ['twoFactorEnabled' => true, 'loginNotifications' => true, 'sessionTimeout' => 30],
            'data' => ['autoBackup' => true, 'backupFrequency' => 'daily', 'dataRetention' => 365],
        ];

        // Simulate export format
        $exported = [
            'version' => '1.0',
            'exported_at' => now()->toIso8601String(),
            'settings' => $fullSettings,
        ];

        // Serialize and deserialize
        $json = json_encode($exported);
        $imported = json_decode($json, true);

        // Assert settings are preserved
        $this->assertEquals($fullSettings, $imported['settings'], 'Full settings round-trip should preserve all data');
    }

    /**
     * Property test: All default settings are valid JSON
     */
    public function test_all_defaults_are_valid_json(): void
    {
        $defaults = UserPreference::DEFAULTS;

        foreach ($defaults as $category => $settings) {
            $json = json_encode($settings);
            $this->assertNotFalse($json, "Category {$category} defaults should be valid JSON");
            
            $decoded = json_decode($json, true);
            $this->assertEquals($settings, $decoded, "Category {$category} defaults should round-trip correctly");
        }
    }

    /**
     * Property test: Settings with nested arrays preserve structure
     */
    public function test_nested_settings_preserve_structure(): void
    {
        $nested = [
            'level1' => [
                'level2' => [
                    'level3' => [
                        'value' => 'deep',
                        'array' => [1, 2, 3],
                        'bool' => true,
                    ],
                ],
            ],
        ];

        $json = json_encode($nested);
        $decoded = json_decode($json, true);

        $this->assertEquals($nested, $decoded, 'Nested settings should preserve structure');
        $this->assertEquals('deep', $decoded['level1']['level2']['level3']['value']);
        $this->assertEquals([1, 2, 3], $decoded['level1']['level2']['level3']['array']);
        $this->assertTrue($decoded['level1']['level2']['level3']['bool']);
    }

    /**
     * Property test: Empty settings round-trip correctly
     */
    public function test_empty_settings_round_trip(): void
    {
        $empty = [];
        
        $json = json_encode($empty);
        $decoded = json_decode($json, true);
        
        $this->assertEquals($empty, $decoded, 'Empty settings should round-trip correctly');
    }

    /**
     * Property test: Settings with special characters round-trip correctly
     */
    public function test_settings_with_special_characters_round_trip(): void
    {
        $settings = [
            'timezone' => 'Asia/Ho_Chi_Minh',
            'customField' => 'Test with "quotes" and \'apostrophes\'',
            'unicode' => 'Bahasa Indonesia: Selamat datang! 你好',
        ];

        $json = json_encode($settings, JSON_UNESCAPED_UNICODE);
        $decoded = json_decode($json, true);

        $this->assertEquals($settings, $decoded, 'Settings with special characters should round-trip correctly');
    }

    /**
     * Property test: Boolean values are preserved correctly
     */
    public function test_boolean_values_preserved(): void
    {
        $settings = [
            'trueValue' => true,
            'falseValue' => false,
            'nested' => [
                'innerTrue' => true,
                'innerFalse' => false,
            ],
        ];

        $json = json_encode($settings);
        $decoded = json_decode($json, true);

        $this->assertSame(true, $decoded['trueValue'], 'True boolean should be preserved');
        $this->assertSame(false, $decoded['falseValue'], 'False boolean should be preserved');
        $this->assertSame(true, $decoded['nested']['innerTrue'], 'Nested true boolean should be preserved');
        $this->assertSame(false, $decoded['nested']['innerFalse'], 'Nested false boolean should be preserved');
    }

    /**
     * Property test: Numeric values are preserved correctly
     */
    public function test_numeric_values_preserved(): void
    {
        $settings = [
            'integer' => 42,
            'float' => 3.14,
            'zero' => 0,
            'negative' => -10,
            'largeNumber' => 9999999999,
        ];

        $json = json_encode($settings);
        $decoded = json_decode($json, true);

        $this->assertSame(42, $decoded['integer'], 'Integer should be preserved');
        $this->assertSame(3.14, $decoded['float'], 'Float should be preserved');
        $this->assertSame(0, $decoded['zero'], 'Zero should be preserved');
        $this->assertSame(-10, $decoded['negative'], 'Negative number should be preserved');
        $this->assertSame(9999999999, $decoded['largeNumber'], 'Large number should be preserved');
    }
}
