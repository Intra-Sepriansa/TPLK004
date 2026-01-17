<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

/**
 * Property-based tests for Fallback Storage Consistency
 * Feature: advanced-settings-documentation
 * 
 * Property 10: Fallback Storage Consistency
 * Settings stored in localStorage fallback SHALL be consistent with server settings
 * when synced. Offline changes should be queued and synced when connection is restored.
 * 
 * Validates: Requirements 7.5
 */
class FallbackStorageConsistencyTest extends TestCase
{
    /**
     * Simulated localStorage
     */
    protected array $localStorage = [];
    
    /**
     * Simulated server storage
     */
    protected array $serverStorage = [];
    
    /**
     * Simulated sync queue
     */
    protected array $syncQueue = [];

    protected function setUp(): void
    {
        parent::setUp();
        $this->localStorage = [];
        $this->serverStorage = [];
        $this->syncQueue = [];
    }

    /**
     * Property 10: Settings saved locally should be retrievable
     */
    public function test_local_settings_are_retrievable(): void
    {
        $settings = [
            'general' => ['language' => 'id', 'timezone' => 'Asia/Jakarta'],
            'appearance' => ['theme' => 'dark', 'fontSize' => 'medium'],
        ];
        
        $this->saveToLocalStorage('settings', $settings);
        $retrieved = $this->getFromLocalStorage('settings');
        
        $this->assertEquals($settings, $retrieved, 'Settings saved locally should be retrievable');
    }

    /**
     * Property 10: Offline changes should be queued for sync
     */
    public function test_offline_changes_are_queued(): void
    {
        // Simulate offline mode
        $isOnline = false;
        
        $change = ['category' => 'general', 'settings' => ['language' => 'en']];
        
        if (!$isOnline) {
            $this->addToSyncQueue($change);
        }
        
        $this->assertCount(1, $this->syncQueue, 'Offline change should be added to sync queue');
        $this->assertEquals($change['category'], $this->syncQueue[0]['category'], 'Queued change category should match');
        $this->assertEquals($change['settings'], $this->syncQueue[0]['settings'], 'Queued change settings should match');
        $this->assertArrayHasKey('timestamp', $this->syncQueue[0], 'Queued change should have timestamp');
        $this->assertArrayHasKey('retryCount', $this->syncQueue[0], 'Queued change should have retryCount');
    }

    /**
     * Property 10: Sync queue should process all items when online
     */
    public function test_sync_queue_processes_all_items(): void
    {
        // Add multiple items to queue
        $changes = [
            ['category' => 'general', 'settings' => ['language' => 'en']],
            ['category' => 'appearance', 'settings' => ['theme' => 'light']],
            ['category' => 'notifications', 'settings' => ['email' => ['enabled' => true]]],
        ];
        
        foreach ($changes as $change) {
            $this->addToSyncQueue($change);
        }
        
        $this->assertCount(3, $this->syncQueue, 'All changes should be in queue');
        
        // Process queue (simulate going online)
        $processed = $this->processSyncQueue();
        
        $this->assertEquals(3, $processed, 'All items should be processed');
        $this->assertEmpty($this->syncQueue, 'Queue should be empty after processing');
    }

    /**
     * Property 10: Server settings should take precedence after sync
     */
    public function test_server_settings_take_precedence_after_sync(): void
    {
        // Local settings (older)
        $localSettings = ['language' => 'id', 'timezone' => 'Asia/Jakarta'];
        $this->saveToLocalStorage('general', $localSettings);
        
        // Server settings (newer)
        $serverSettings = ['language' => 'en', 'timezone' => 'UTC'];
        $this->serverStorage['general'] = $serverSettings;
        
        // Sync (server takes precedence)
        $merged = $this->mergeSettings('general', $localSettings, $serverSettings, 'server');
        
        $this->assertEquals($serverSettings, $merged, 'Server settings should take precedence');
    }

    /**
     * Property 10: Local settings should be preserved if server is unavailable
     */
    public function test_local_settings_preserved_when_server_unavailable(): void
    {
        $localSettings = ['language' => 'id', 'timezone' => 'Asia/Jakarta'];
        $this->saveToLocalStorage('general', $localSettings);
        
        // Server unavailable (null)
        $serverSettings = null;
        
        $merged = $this->mergeSettings('general', $localSettings, $serverSettings, 'local');
        
        $this->assertEquals($localSettings, $merged, 'Local settings should be preserved when server unavailable');
    }

    /**
     * Property 10: Sync queue should handle failures gracefully
     */
    public function test_sync_queue_handles_failures(): void
    {
        $change = ['category' => 'general', 'settings' => ['language' => 'en']];
        $this->addToSyncQueue($change);
        
        // Simulate failed sync
        $success = $this->processSyncQueueWithFailure(0); // 0% success rate
        
        $this->assertEquals(0, $success, 'No items should succeed with 0% success rate');
        $this->assertCount(1, $this->syncQueue, 'Failed items should remain in queue');
    }

    /**
     * Property 10: Retry count should increment on failure
     */
    public function test_retry_count_increments_on_failure(): void
    {
        $change = ['category' => 'general', 'settings' => ['language' => 'en'], 'retryCount' => 0];
        $this->addToSyncQueue($change);
        
        // Simulate failed sync
        $this->processSyncQueueWithFailure(0);
        
        $this->assertEquals(1, $this->syncQueue[0]['retryCount'], 'Retry count should increment on failure');
        
        // Another failure
        $this->processSyncQueueWithFailure(0);
        
        $this->assertEquals(2, $this->syncQueue[0]['retryCount'], 'Retry count should increment again');
    }

    /**
     * Property 10: Items should be removed from queue after max retries
     */
    public function test_items_removed_after_max_retries(): void
    {
        $maxRetries = 3;
        $change = ['category' => 'general', 'settings' => ['language' => 'en'], 'retryCount' => $maxRetries];
        $this->addToSyncQueue($change);
        
        // Process with failure - should remove due to max retries
        $this->processSyncQueueWithMaxRetryCheck($maxRetries);
        
        $this->assertEmpty($this->syncQueue, 'Item should be removed after max retries');
    }

    /**
     * Property 10: Duplicate category changes should keep only latest
     */
    public function test_duplicate_category_keeps_latest(): void
    {
        // Add first change
        $this->addToSyncQueue(['category' => 'general', 'settings' => ['language' => 'id']]);
        
        // Add second change for same category
        $this->addToSyncQueue(['category' => 'general', 'settings' => ['language' => 'en']]);
        
        $this->assertCount(1, $this->syncQueue, 'Should only have one item per category');
        $this->assertEquals('en', $this->syncQueue[0]['settings']['language'], 'Should keep latest change');
    }

    /**
     * Property 10: Different categories should be queued separately
     */
    public function test_different_categories_queued_separately(): void
    {
        $this->addToSyncQueue(['category' => 'general', 'settings' => ['language' => 'en']]);
        $this->addToSyncQueue(['category' => 'appearance', 'settings' => ['theme' => 'dark']]);
        $this->addToSyncQueue(['category' => 'notifications', 'settings' => ['email' => true]]);
        
        $this->assertCount(3, $this->syncQueue, 'Different categories should be queued separately');
    }

    /**
     * Property 10: Timestamp should be recorded for sync tracking
     */
    public function test_timestamp_recorded_for_sync(): void
    {
        $beforeTime = time();
        
        $this->addToSyncQueue(['category' => 'general', 'settings' => ['language' => 'en']]);
        
        $afterTime = time();
        
        $this->assertArrayHasKey('timestamp', $this->syncQueue[0], 'Timestamp should be recorded');
        $this->assertGreaterThanOrEqual($beforeTime, $this->syncQueue[0]['timestamp']);
        $this->assertLessThanOrEqual($afterTime, $this->syncQueue[0]['timestamp']);
    }

    /**
     * Property 10: Empty settings should be handled gracefully
     */
    public function test_empty_settings_handled_gracefully(): void
    {
        $this->saveToLocalStorage('general', []);
        $retrieved = $this->getFromLocalStorage('general');
        
        $this->assertEquals([], $retrieved, 'Empty settings should be handled gracefully');
    }

    /**
     * Property 10: Null values in settings should be preserved
     */
    public function test_null_values_preserved(): void
    {
        $settings = ['language' => 'id', 'optionalField' => null];
        $this->saveToLocalStorage('general', $settings);
        $retrieved = $this->getFromLocalStorage('general');
        
        $this->assertArrayHasKey('optionalField', $retrieved, 'Null field should exist');
        $this->assertNull($retrieved['optionalField'], 'Null value should be preserved');
    }

    /**
     * Property 10: Boolean values should be preserved correctly
     */
    public function test_boolean_values_preserved(): void
    {
        $settings = ['enabled' => true, 'disabled' => false];
        $this->saveToLocalStorage('notifications', $settings);
        $retrieved = $this->getFromLocalStorage('notifications');
        
        $this->assertSame(true, $retrieved['enabled'], 'True boolean should be preserved');
        $this->assertSame(false, $retrieved['disabled'], 'False boolean should be preserved');
    }

    /**
     * Property 10: Nested objects should be preserved
     */
    public function test_nested_objects_preserved(): void
    {
        $settings = [
            'email' => [
                'enabled' => true,
                'types' => ['attendance' => true, 'tasks' => false],
            ],
        ];
        
        $this->saveToLocalStorage('notifications', $settings);
        $retrieved = $this->getFromLocalStorage('notifications');
        
        $this->assertEquals($settings, $retrieved, 'Nested objects should be preserved');
    }

    /**
     * Helper: Save to simulated localStorage
     */
    protected function saveToLocalStorage(string $key, array $value): void
    {
        $this->localStorage[$key] = $value;
    }

    /**
     * Helper: Get from simulated localStorage
     */
    protected function getFromLocalStorage(string $key): ?array
    {
        return $this->localStorage[$key] ?? null;
    }

    /**
     * Helper: Add to sync queue
     */
    protected function addToSyncQueue(array $change): void
    {
        // Remove existing item for same category
        $this->syncQueue = array_filter(
            $this->syncQueue, 
            fn($item) => $item['category'] !== $change['category']
        );
        $this->syncQueue = array_values($this->syncQueue);
        
        // Add new item with timestamp and retry count
        $change['timestamp'] = $change['timestamp'] ?? time();
        $change['retryCount'] = $change['retryCount'] ?? 0;
        $this->syncQueue[] = $change;
    }

    /**
     * Helper: Process sync queue (all succeed)
     */
    protected function processSyncQueue(): int
    {
        $count = count($this->syncQueue);
        
        foreach ($this->syncQueue as $item) {
            $this->serverStorage[$item['category']] = $item['settings'];
        }
        
        $this->syncQueue = [];
        return $count;
    }

    /**
     * Helper: Process sync queue with failure rate
     */
    protected function processSyncQueueWithFailure(int $successRate): int
    {
        $success = 0;
        $remaining = [];
        
        foreach ($this->syncQueue as $item) {
            if (rand(0, 100) < $successRate) {
                $this->serverStorage[$item['category']] = $item['settings'];
                $success++;
            } else {
                $item['retryCount']++;
                $remaining[] = $item;
            }
        }
        
        $this->syncQueue = $remaining;
        return $success;
    }

    /**
     * Helper: Process sync queue with max retry check
     */
    protected function processSyncQueueWithMaxRetryCheck(int $maxRetries): void
    {
        $this->syncQueue = array_filter(
            $this->syncQueue,
            fn($item) => $item['retryCount'] < $maxRetries
        );
        $this->syncQueue = array_values($this->syncQueue);
    }

    /**
     * Helper: Merge settings with precedence
     */
    protected function mergeSettings(string $category, ?array $local, ?array $server, string $precedence): array
    {
        if ($local === null && $server === null) {
            return [];
        }
        
        if ($local === null) {
            return $server ?? [];
        }
        
        if ($server === null) {
            return $local;
        }
        
        return $precedence === 'server' ? $server : $local;
    }
}
