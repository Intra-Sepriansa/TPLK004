/**
 * Settings Types for Advanced Settings System
 * Requirements: 1.1
 */

// General Settings
export interface GeneralSettings {
    language: 'id' | 'en';
    timezone: string;
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    startOfWeek: 'sunday' | 'monday';
}

// Notification Settings
export interface NotificationSettings {
    email: {
        enabled: boolean;
        digest: 'instant' | 'daily' | 'weekly' | 'never';
        attendance: boolean;
        assignments: boolean;
        announcements: boolean;
    };
    push: {
        enabled: boolean;
        attendance: boolean;
        assignments: boolean;
        reminders: boolean;
    };
    inApp: {
        enabled: boolean;
        sound: boolean;
        desktop: boolean;
    };
}

// Appearance Settings
export interface AppearanceSettings {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
    animations: boolean;
    sidebarCollapsed: boolean;
}

// Privacy Settings
export interface PrivacySettings {
    profileVisibility: 'public' | 'contacts' | 'private';
    showOnlineStatus: boolean;
    showActivityStatus: boolean;
    allowDataCollection: boolean;
}

// Security Settings
export interface SecuritySettings {
    twoFactorEnabled: boolean;
    sessionTimeout: number; // minutes
    loginNotifications: boolean;
}

// Data Management Settings
export interface DataManagementSettings {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    cacheEnabled: boolean;
    offlineMode: boolean;
}

// Combined User Settings
export interface UserSettings {
    general: GeneralSettings;
    notifications: NotificationSettings;
    appearance: AppearanceSettings;
    privacy: PrivacySettings;
    security: SecuritySettings;
    dataManagement: DataManagementSettings;
}

// Settings Category Keys
export type SettingsCategory = keyof UserSettings;

// Default Settings
export const defaultSettings: UserSettings = {
    general: {
        language: 'id',
        timezone: 'Asia/Jakarta',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        startOfWeek: 'monday',
    },
    notifications: {
        email: {
            enabled: true,
            digest: 'daily',
            attendance: true,
            assignments: true,
            announcements: true,
        },
        push: {
            enabled: true,
            attendance: true,
            assignments: true,
            reminders: true,
        },
        inApp: {
            enabled: true,
            sound: true,
            desktop: false,
        },
    },
    appearance: {
        theme: 'system',
        fontSize: 'medium',
        compactMode: false,
        animations: true,
        sidebarCollapsed: false,
    },
    privacy: {
        profileVisibility: 'contacts',
        showOnlineStatus: true,
        showActivityStatus: true,
        allowDataCollection: true,
    },
    security: {
        twoFactorEnabled: false,
        sessionTimeout: 60,
        loginNotifications: true,
    },
    dataManagement: {
        autoBackup: true,
        backupFrequency: 'weekly',
        cacheEnabled: true,
        offlineMode: false,
    },
};

// Settings Update Payload
export interface SettingsUpdatePayload {
    category: SettingsCategory;
    settings: Partial<UserSettings[SettingsCategory]>;
}

// Settings Export/Import
export interface SettingsExport {
    version: string;
    exportedAt: string;
    settings: UserSettings;
}

// Active Session
export interface ActiveSession {
    id: string;
    device: string;
    browser: string;
    ip: string;
    location?: string;
    lastActive: string;
    isCurrent: boolean;
}

// Login History Entry
export interface LoginHistoryEntry {
    id: string;
    device: string;
    browser: string;
    ip: string;
    location?: string;
    loginAt: string;
    success: boolean;
}

// Storage Usage
export interface StorageUsage {
    used: number; // bytes
    total: number; // bytes
    breakdown: {
        documents: number;
        cache: number;
        other: number;
    };
}
