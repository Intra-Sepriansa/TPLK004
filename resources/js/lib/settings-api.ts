import type {
    ActiveSession,
    AppearanceSettings,
    LoginHistoryEntry,
    SettingsCategory,
    StorageUsage,
    UserSettings,
} from '@/types/settings';
import { defaultSettings } from '@/types/settings';
import axios from 'axios';

const API_BASE = '/api/settings';

// Get CSRF token
function getCsrfToken(): string {
    const token = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute('content');
    if (!token) {
        throw new Error('CSRF token not found');
    }
    return token;
}

// Axios instance with CSRF token
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Add CSRF token to every request
api.interceptors.request.use((config) => {
    config.headers['X-CSRF-TOKEN'] = getCsrfToken();
    return config;
});

const CATEGORY_MAP: Record<SettingsCategory, string> = {
    general: 'general',
    notifications: 'notifications',
    appearance: 'appearance',
    privacy: 'privacy',
    security: 'security',
    dataManagement: 'data',
};

function unwrapResponse<T>(payload: unknown): T {
    const raw = payload as { data?: T };
    return (
        raw && typeof raw === 'object' && 'data' in raw ? raw.data : payload
    ) as T;
}

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object'
        ? (value as Record<string, unknown>)
        : {};
}

function mergeDeep<T>(defaults: T, incoming: Record<string, unknown>): T {
    const output: Record<string, unknown> = {
        ...(defaults as Record<string, unknown>),
    };

    for (const [key, value] of Object.entries(incoming)) {
        if (value === undefined) {
            continue;
        }

        const current = output[key];
        const bothObjects =
            current &&
            typeof current === 'object' &&
            !Array.isArray(current) &&
            value &&
            typeof value === 'object' &&
            !Array.isArray(value);

        output[key] = bothObjects
            ? mergeDeep(
                  current as Record<string, unknown>,
                  value as Record<string, unknown>,
              )
            : value;
    }

    return output as T;
}

function normalizeThemeValue(theme: unknown): AppearanceSettings['theme'] {
    if (theme === 'auto') {
        return 'system';
    }

    if (theme === 'light' || theme === 'dark' || theme === 'system') {
        return theme;
    }

    return defaultSettings.appearance.theme;
}

function normalizeSettings(raw: unknown): UserSettings {
    const source = unwrapResponse<Record<string, unknown>>(raw) ?? {};
    const hasDataManagement = Object.prototype.hasOwnProperty.call(
        source,
        'dataManagement',
    );
    const dataCategory = hasDataManagement
        ? asRecord(source.dataManagement)
        : asRecord(source.data);

    const appearanceSource = asRecord(source.appearance);
    const normalizedAppearance = mergeDeep(defaultSettings.appearance, {
        ...appearanceSource,
        theme: normalizeThemeValue(appearanceSource.theme),
    });

    return {
        general: mergeDeep(defaultSettings.general, asRecord(source.general)),
        notifications: mergeDeep(
            defaultSettings.notifications,
            asRecord(source.notifications),
        ),
        appearance: normalizedAppearance,
        privacy: mergeDeep(defaultSettings.privacy, asRecord(source.privacy)),
        security: mergeDeep(
            defaultSettings.security,
            asRecord(source.security),
        ),
        dataManagement: mergeDeep(defaultSettings.dataManagement, dataCategory),
    };
}

function normalizeSession(entry: Record<string, unknown>): ActiveSession {
    return {
        id: String(entry.id ?? ''),
        device: String(entry.device ?? 'Perangkat tidak dikenal'),
        browser: String(entry.browser ?? 'Browser tidak dikenal'),
        ip: String(entry.ip ?? entry.ip_address ?? '-'),
        location: entry.location ? String(entry.location) : undefined,
        lastActive: String(
            entry.lastActive ?? entry.last_active ?? entry.updated_at ?? '-',
        ),
        isCurrent: Boolean(entry.isCurrent ?? entry.is_current),
    };
}

function normalizeLoginHistory(
    entry: Record<string, unknown>,
): LoginHistoryEntry {
    return {
        id: String(entry.id ?? ''),
        device: String(entry.device ?? 'Perangkat tidak dikenal'),
        browser: String(entry.browser ?? 'Browser tidak dikenal'),
        ip: String(entry.ip ?? entry.ip_address ?? '-'),
        location: entry.location ? String(entry.location) : undefined,
        loginAt: String(
            entry.loginAt ?? entry.login_at ?? entry.timestamp ?? '-',
        ),
        success: Boolean(
            entry.success ?? String(entry.status ?? 'success') === 'success',
        ),
    };
}

/**
 * Get all settings
 */
export async function getSettings(): Promise<UserSettings> {
    try {
        const response = await api.get('/');
        return normalizeSettings(response.data);
    } catch (error) {
        console.error('Failed to get settings:', error);
        throw error;
    }
}

/**
 * Update category settings
 */
export async function updateCategorySettings<K extends SettingsCategory>(
    category: K,
    data: Partial<UserSettings[K]>,
): Promise<UserSettings[K]> {
    try {
        const apiCategory = CATEGORY_MAP[category] ?? category;
        const payload =
            category === 'appearance'
                ? ({
                      ...data,
                      theme:
                          'theme' in data
                              ? normalizeThemeValue(data.theme)
                              : undefined,
                  } as Partial<UserSettings[K]>)
                : data;
        const response = await api.patch(`/${apiCategory}`, payload);
        const normalized = normalizeSettings(response.data);
        return normalized[category] as UserSettings[K];
    } catch (error) {
        console.error(`Failed to update ${category} settings:`, error);
        throw error;
    }
}

/**
 * Reset all settings to default
 */
export async function resetSettings() {
    try {
        const response = await api.post('/reset');
        return normalizeSettings(response.data);
    } catch (error) {
        console.error('Failed to reset settings:', error);
        throw error;
    }
}

/**
 * Clear cache
 */
export async function clearCache() {
    try {
        const response = await api.post('/clear-cache');
        return unwrapResponse<{ success: boolean; message?: string }>(
            response.data,
        );
    } catch (error) {
        console.error('Failed to clear cache:', error);
        throw error;
    }
}

/**
 * Download settings as JSON
 */
export async function downloadSettings() {
    try {
        const response = await api.get('/export');
        const exported = unwrapResponse<Record<string, unknown>>(response.data);
        const settings =
            exported && typeof exported === 'object' && 'settings' in exported
                ? exported
                : {
                      version: '1.0',
                      exported_at: new Date().toISOString(),
                      settings: normalizeSettings(exported),
                  };

        if (!settings || typeof settings !== 'object') {
            throw new Error('No settings data found');
        }

        const blob = new Blob([JSON.stringify(settings, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `settings-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Failed to download settings:', error);
        throw error;
    }
}

/**
 * Upload settings from JSON file
 */
export async function uploadSettings(file: File) {
    try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const settingsPayload =
            parsed && typeof parsed === 'object' && 'settings' in parsed
                ? parsed
                : {
                      version: '1.0',
                      settings: parsed,
                  };

        if (!settingsPayload || typeof settingsPayload !== 'object') {
            throw new Error('Invalid settings file');
        }

        const normalizedSettings = normalizeSettings(
            asRecord(settingsPayload).settings,
        );
        const response = await api.post('/import', {
            version:
                (asRecord(settingsPayload).version as string | undefined) ??
                '1.0',
            settings: normalizedSettings,
        });
        return normalizeSettings(response.data);
    } catch (error) {
        console.error('Failed to upload settings:', error);
        throw error;
    }
}

/**
 * Get storage usage
 */
export async function getStorageUsage(): Promise<StorageUsage> {
    const response = await api.get('/storage');
    const payload = unwrapResponse<StorageUsage>(response.data);
    return {
        used: payload?.used ?? 0,
        total: payload?.total ?? 0,
        breakdown: {
            documents: payload?.breakdown?.documents ?? 0,
            cache: payload?.breakdown?.cache ?? 0,
            other: payload?.breakdown?.other ?? 0,
        },
    };
}

/**
 * Get active sessions
 */
export async function getActiveSessions(): Promise<ActiveSession[]> {
    const response = await api.get('/sessions');
    const rawList =
        unwrapResponse<Record<string, unknown>[]>(response.data) ?? [];
    return rawList.map(normalizeSession);
}

/**
 * Terminate session by ID
 */
export async function terminateSession(sessionId: string): Promise<void> {
    await api.post(`/sessions/${sessionId}/terminate`);
}

/**
 * Get login history
 */
export async function getLoginHistory(
    limit = 10,
): Promise<LoginHistoryEntry[]> {
    const response = await api.get('/login-history', { params: { limit } });
    const rawList =
        unwrapResponse<Record<string, unknown>[]>(response.data) ?? [];
    return rawList.map(normalizeLoginHistory);
}
