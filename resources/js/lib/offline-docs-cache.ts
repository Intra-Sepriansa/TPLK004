const OFFLINE_DOCS_DB_NAME = 'student-docs-offline-cache';
const OFFLINE_DOCS_DB_VERSION = 1;
const OFFLINE_DOCS_STORE = 'guides';
const LEGACY_OFFLINE_CACHE_KEY = 'student_docs_offline_cache';

export interface OfflineGuideCacheRecord {
    guideId: string;
    payload: unknown;
    title: string | null;
    version: string | null;
    sizeKb: number | null;
    cachedAt: string;
}

interface SaveOfflineGuideCacheInput {
    guideId: string;
    payload: unknown;
    title?: string | null;
    version?: string | null;
    sizeKb?: number | null;
}

function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

function hasIndexedDb(): boolean {
    return isBrowser() && 'indexedDB' in window;
}

function parseLegacyCache(raw: string | null): Record<string, unknown> {
    if (!raw) return {};

    try {
        const parsed = JSON.parse(raw);
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
        return {};
    }
}

function readLegacyCache(): Record<string, unknown> {
    if (!isBrowser()) return {};
    return parseLegacyCache(window.localStorage.getItem(LEGACY_OFFLINE_CACHE_KEY));
}

function writeLegacyCache(cache: Record<string, unknown>): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(LEGACY_OFFLINE_CACHE_KEY, JSON.stringify(cache));
}

function toLegacyRecord(value: unknown, guideId: string): OfflineGuideCacheRecord | null {
    if (typeof value !== 'object' || value === null) return null;

    const legacy = value as { guide?: unknown; cached_at?: string };
    const payload = legacy.guide ?? null;
    if (!payload) return null;

    const payloadTitle =
        typeof payload === 'object' && payload !== null && 'title' in payload
            ? String((payload as { title?: unknown }).title ?? '')
            : '';

    const sizeKb = Math.max(1, Math.ceil(JSON.stringify(payload).length / 1024));

    return {
        guideId,
        payload,
        title: payloadTitle || null,
        version: 'legacy',
        sizeKb,
        cachedAt: legacy.cached_at ?? new Date().toISOString(),
    };
}

function openOfflineDocsDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (!hasIndexedDb()) {
            reject(new Error('IndexedDB is not supported in this browser'));
            return;
        }

        const request = window.indexedDB.open(OFFLINE_DOCS_DB_NAME, OFFLINE_DOCS_DB_VERSION);

        request.onupgradeneeded = () => {
            const database = request.result;

            if (!database.objectStoreNames.contains(OFFLINE_DOCS_STORE)) {
                const store = database.createObjectStore(OFFLINE_DOCS_STORE, { keyPath: 'guideId' });
                store.createIndex('cachedAt', 'cachedAt', { unique: false });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
    });
}

export async function migrateLegacyOfflineDocsCache(): Promise<void> {
    if (!isBrowser()) return;

    const legacyCache = readLegacyCache();
    const legacyEntries = Object.entries(legacyCache);
    if (legacyEntries.length === 0) return;

    try {
        if (hasIndexedDb()) {
            for (const [guideId, legacyValue] of legacyEntries) {
                const record = toLegacyRecord(legacyValue, guideId);
                if (!record) continue;

                await saveOfflineGuideToCache({
                    guideId: record.guideId,
                    payload: record.payload,
                    title: record.title,
                    version: record.version,
                    sizeKb: record.sizeKb,
                });
            }
        }

        window.localStorage.removeItem(LEGACY_OFFLINE_CACHE_KEY);
    } catch {
        // Keep legacy cache as fallback when migration fails.
    }
}

export async function getOfflineGuideFromCache(guideId: string): Promise<OfflineGuideCacheRecord | null> {
    if (!guideId) return null;

    if (!hasIndexedDb()) {
        const legacyRecord = toLegacyRecord(readLegacyCache()[guideId], guideId);
        return legacyRecord;
    }

    try {
        const database = await openOfflineDocsDb();

        const value = await new Promise<OfflineGuideCacheRecord | null>((resolve, reject) => {
            const transaction = database.transaction(OFFLINE_DOCS_STORE, 'readonly');
            const store = transaction.objectStore(OFFLINE_DOCS_STORE);
            const request = store.get(guideId);

            request.onsuccess = () => {
                const result = request.result as OfflineGuideCacheRecord | undefined;
                resolve(result ?? null);
            };
            request.onerror = () => reject(request.error ?? new Error('Failed to read cache record'));
            transaction.oncomplete = () => database.close();
            transaction.onerror = () => reject(transaction.error ?? new Error('Failed to read cache record'));
        });

        return value;
    } catch {
        const legacyRecord = toLegacyRecord(readLegacyCache()[guideId], guideId);
        return legacyRecord;
    }
}

export async function getAllOfflineGuidesFromCache(): Promise<OfflineGuideCacheRecord[]> {
    if (!hasIndexedDb()) {
        const legacyCache = readLegacyCache();
        return Object.entries(legacyCache)
            .map(([guideId, value]) => toLegacyRecord(value, guideId))
            .filter((item): item is OfflineGuideCacheRecord => item !== null);
    }

    try {
        const database = await openOfflineDocsDb();

        return await new Promise<OfflineGuideCacheRecord[]>((resolve, reject) => {
            const transaction = database.transaction(OFFLINE_DOCS_STORE, 'readonly');
            const store = transaction.objectStore(OFFLINE_DOCS_STORE);
            const request = store.getAll();

            request.onsuccess = () => {
                const result = Array.isArray(request.result) ? (request.result as OfflineGuideCacheRecord[]) : [];
                resolve(result);
            };
            request.onerror = () => reject(request.error ?? new Error('Failed to read cache records'));
            transaction.oncomplete = () => database.close();
            transaction.onerror = () => reject(transaction.error ?? new Error('Failed to read cache records'));
        });
    } catch {
        const legacyCache = readLegacyCache();
        return Object.entries(legacyCache)
            .map(([guideId, value]) => toLegacyRecord(value, guideId))
            .filter((item): item is OfflineGuideCacheRecord => item !== null);
    }
}

export async function saveOfflineGuideToCache(input: SaveOfflineGuideCacheInput): Promise<OfflineGuideCacheRecord> {
    const record: OfflineGuideCacheRecord = {
        guideId: input.guideId,
        payload: input.payload,
        title: input.title ?? null,
        version: input.version ?? null,
        sizeKb: input.sizeKb ?? Math.max(1, Math.ceil(JSON.stringify(input.payload).length / 1024)),
        cachedAt: new Date().toISOString(),
    };

    if (!hasIndexedDb()) {
        const legacyCache = readLegacyCache();
        legacyCache[input.guideId] = {
            guide: input.payload,
            cached_at: record.cachedAt,
        };
        writeLegacyCache(legacyCache);
        return record;
    }

    const database = await openOfflineDocsDb();

    await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(OFFLINE_DOCS_STORE, 'readwrite');
        const store = transaction.objectStore(OFFLINE_DOCS_STORE);
        const request = store.put(record);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error ?? new Error('Failed to save cache record'));
        transaction.oncomplete = () => database.close();
        transaction.onerror = () => reject(transaction.error ?? new Error('Failed to save cache record'));
    });

    return record;
}

export async function removeOfflineGuideFromCache(guideId: string): Promise<void> {
    if (!guideId) return;

    if (!hasIndexedDb()) {
        const legacyCache = readLegacyCache();
        delete legacyCache[guideId];
        writeLegacyCache(legacyCache);
        return;
    }

    const database = await openOfflineDocsDb();

    await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(OFFLINE_DOCS_STORE, 'readwrite');
        const store = transaction.objectStore(OFFLINE_DOCS_STORE);
        const request = store.delete(guideId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error ?? new Error('Failed to delete cache record'));
        transaction.oncomplete = () => database.close();
        transaction.onerror = () => reject(transaction.error ?? new Error('Failed to delete cache record'));
    });
}
