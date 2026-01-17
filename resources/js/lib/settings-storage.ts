/**
 * Settings Storage with localStorage Fallback
 * Requirements: 7.5
 * 
 * Provides offline support for settings with sync queue for reconnection.
 */

import type { UserSettings } from '@/types/settings';

const STORAGE_KEY = 'user_settings';
const SYNC_QUEUE_KEY = 'settings_sync_queue';
const LAST_SYNC_KEY = 'settings_last_sync';

interface SyncQueueItem {
    id: string;
    category: string;
    settings: Record<string, unknown>;
    timestamp: number;
    retryCount: number;
}

interface StorageState {
    settings: Partial<UserSettings>;
    lastUpdated: number;
    isOffline: boolean;
}

/**
 * Get settings from localStorage
 */
export function getLocalSettings(): Partial<UserSettings> | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        
        const state: StorageState = JSON.parse(stored);
        return state.settings;
    } catch {
        console.warn('Failed to read settings from localStorage');
        return null;
    }
}

/**
 * Save settings to localStorage
 */
export function saveLocalSettings(settings: Partial<UserSettings>): boolean {
    try {
        const state: StorageState = {
            settings,
            lastUpdated: Date.now(),
            isOffline: !navigator.onLine,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return true;
    } catch {
        console.warn('Failed to save settings to localStorage');
        return false;
    }
}

/**
 * Update a specific category in localStorage
 */
export function updateLocalSettingsCategory(
    category: keyof UserSettings,
    categorySettings: Record<string, unknown>
): boolean {
    try {
        const current = getLocalSettings() || {};
        const updated = {
            ...current,
            [category]: categorySettings,
        };
        return saveLocalSettings(updated);
    } catch {
        console.warn('Failed to update settings category in localStorage');
        return false;
    }
}

/**
 * Clear settings from localStorage
 */
export function clearLocalSettings(): boolean {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch {
        console.warn('Failed to clear settings from localStorage');
        return false;
    }
}

/**
 * Get sync queue from localStorage
 */
export function getSyncQueue(): SyncQueueItem[] {
    try {
        const stored = localStorage.getItem(SYNC_QUEUE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch {
        console.warn('Failed to read sync queue from localStorage');
        return [];
    }
}

/**
 * Add item to sync queue
 */
export function addToSyncQueue(category: string, settings: Record<string, unknown>): boolean {
    try {
        const queue = getSyncQueue();
        const item: SyncQueueItem = {
            id: `${category}-${Date.now()}`,
            category,
            settings,
            timestamp: Date.now(),
            retryCount: 0,
        };
        
        // Remove existing item for same category (keep only latest)
        const filtered = queue.filter(q => q.category !== category);
        filtered.push(item);
        
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
        return true;
    } catch {
        console.warn('Failed to add to sync queue');
        return false;
    }
}

/**
 * Remove item from sync queue
 */
export function removeFromSyncQueue(id: string): boolean {
    try {
        const queue = getSyncQueue();
        const filtered = queue.filter(q => q.id !== id);
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
        return true;
    } catch {
        console.warn('Failed to remove from sync queue');
        return false;
    }
}

/**
 * Clear sync queue
 */
export function clearSyncQueue(): boolean {
    try {
        localStorage.removeItem(SYNC_QUEUE_KEY);
        return true;
    } catch {
        console.warn('Failed to clear sync queue');
        return false;
    }
}

/**
 * Update retry count for a sync queue item
 */
export function updateSyncQueueRetry(id: string): boolean {
    try {
        const queue = getSyncQueue();
        const updated = queue.map(q => 
            q.id === id ? { ...q, retryCount: q.retryCount + 1 } : q
        );
        localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updated));
        return true;
    } catch {
        console.warn('Failed to update sync queue retry count');
        return false;
    }
}

/**
 * Get last sync timestamp
 */
export function getLastSyncTime(): number | null {
    try {
        const stored = localStorage.getItem(LAST_SYNC_KEY);
        return stored ? parseInt(stored, 10) : null;
    } catch {
        return null;
    }
}

/**
 * Set last sync timestamp
 */
export function setLastSyncTime(timestamp: number = Date.now()): boolean {
    try {
        localStorage.setItem(LAST_SYNC_KEY, timestamp.toString());
        return true;
    } catch {
        return false;
    }
}

/**
 * Check if there are pending sync items
 */
export function hasPendingSync(): boolean {
    return getSyncQueue().length > 0;
}

/**
 * Get pending sync count
 */
export function getPendingSyncCount(): number {
    return getSyncQueue().length;
}

/**
 * Process sync queue - call this when online
 */
export async function processSyncQueue(
    syncFn: (category: string, settings: Record<string, unknown>) => Promise<boolean>
): Promise<{ success: number; failed: number }> {
    const queue = getSyncQueue();
    let success = 0;
    let failed = 0;
    
    for (const item of queue) {
        try {
            const result = await syncFn(item.category, item.settings);
            if (result) {
                removeFromSyncQueue(item.id);
                success++;
            } else {
                updateSyncQueueRetry(item.id);
                failed++;
            }
        } catch {
            updateSyncQueueRetry(item.id);
            failed++;
        }
    }
    
    if (success > 0) {
        setLastSyncTime();
    }
    
    return { success, failed };
}

/**
 * Settings storage hook utilities
 */
export function createSettingsStorage() {
    return {
        get: getLocalSettings,
        save: saveLocalSettings,
        updateCategory: updateLocalSettingsCategory,
        clear: clearLocalSettings,
        getSyncQueue,
        addToSyncQueue,
        removeFromSyncQueue,
        clearSyncQueue,
        processSyncQueue,
        hasPendingSync,
        getPendingSyncCount,
        getLastSyncTime,
        setLastSyncTime,
    };
}

/**
 * Online/Offline event handlers
 */
export function setupOfflineHandlers(
    onOnline?: () => void,
    onOffline?: () => void
): () => void {
    const handleOnline = () => {
        console.log('Connection restored');
        onOnline?.();
    };
    
    const handleOffline = () => {
        console.log('Connection lost - using offline mode');
        onOffline?.();
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Return cleanup function
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
}

/**
 * Check if browser is online
 */
export function isOnline(): boolean {
    return navigator.onLine;
}

/**
 * Merge local and remote settings (remote takes precedence for newer items)
 */
export function mergeSettings(
    local: Partial<UserSettings> | null,
    remote: Partial<UserSettings> | null,
    localTimestamp: number | null,
    remoteTimestamp: number | null
): Partial<UserSettings> {
    if (!local && !remote) return {};
    if (!local) return remote || {};
    if (!remote) return local;
    
    // If we have timestamps, use the newer one
    if (localTimestamp && remoteTimestamp) {
        return remoteTimestamp >= localTimestamp ? remote : local;
    }
    
    // Default: remote takes precedence
    return { ...local, ...remote };
}
