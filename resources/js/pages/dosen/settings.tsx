/**
 * Dosen Advanced Settings Page
 * Requirements: 1.1, 1.2, 1.8
 */

import { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import DosenLayout from '@/layouts/dosen-layout';
import {
    SettingsSidebar,
    GeneralSettings,
    NotificationSettings,
    AppearanceSettings,
    PrivacySettings,
    SecuritySettings,
    DataManagementSettings,
} from '@/components/settings';
import {
    type UserSettings,
    type SettingsCategory,
    defaultSettings,
} from '@/types/settings';
import {
    getSettings,
    updateCategorySettings,
    resetSettings,
    downloadSettings,
    uploadSettings,
    clearCache,
    getStorageUsage,
    getActiveSessions,
    getLoginHistory,
    terminateSession,
} from '@/lib/settings-api';
import type { StorageUsage, ActiveSession, LoginHistoryEntry } from '@/types/settings';

type ToastType = { type: 'success' | 'error'; message: string } | null;

export default function DosenSettings() {
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [storageUsage, setStorageUsage] = useState<StorageUsage | undefined>();
    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
    const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
    const [toast, setToast] = useState<ToastType>(null);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    // Load additional data when security tab is active
    useEffect(() => {
        if (activeCategory === 'security') {
            loadSecurityData();
        }
        if (activeCategory === 'dataManagement') {
            loadStorageUsage();
        }
    }, [activeCategory]);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const data = await getSettings();
            setSettings(data);
        } catch {
            showToast('error', 'Gagal memuat pengaturan, menggunakan default');
        } finally {
            setIsLoading(false);
        }
    };

    const loadSecurityData = async () => {
        try {
            const [sessions, history] = await Promise.all([
                getActiveSessions(),
                getLoginHistory(),
            ]);
            setActiveSessions(sessions);
            setLoginHistory(history);
        } catch {
            // Silently fail, data is optional
        }
    };

    const loadStorageUsage = async () => {
        try {
            const usage = await getStorageUsage();
            setStorageUsage(usage);
        } catch {
            // Silently fail, data is optional
        }
    };

    const handleUpdateCategory = useCallback(
        async <K extends SettingsCategory>(
            category: K,
            updates: Partial<UserSettings[K]>
        ) => {
            // Optimistic update
            setSettings((prev) => ({
                ...prev,
                [category]: { ...prev[category], ...updates },
            }));

            setIsSaving(true);
            try {
                await updateCategorySettings(category, updates);
                showToast('success', 'Pengaturan disimpan');
            } catch {
                loadSettings();
                showToast('error', 'Gagal menyimpan pengaturan');
            } finally {
                setIsSaving(false);
            }
        },
        []
    );

    const handleReset = async () => {
        try {
            const data = await resetSettings();
            setSettings(data);
            showToast('success', 'Pengaturan direset ke default');
        } catch {
            showToast('error', 'Gagal mereset pengaturan');
        }
    };

    const handleExport = () => {
        downloadSettings();
        showToast('success', 'Pengaturan diekspor');
    };

    const handleImport = async (file: File) => {
        try {
            const data = await uploadSettings(file);
            setSettings(data);
            showToast('success', 'Pengaturan diimpor');
        } catch {
            showToast('error', 'Gagal mengimpor pengaturan');
        }
    };

    const handleClearCache = async () => {
        await clearCache();
        await loadStorageUsage();
        showToast('success', 'Cache dibersihkan');
    };

    const handleTerminateSession = async (sessionId: string) => {
        try {
            await terminateSession(sessionId);
            setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
            showToast('success', 'Sesi dihentikan');
        } catch {
            showToast('error', 'Gagal menghentikan sesi');
        }
    };

    const renderContent = () => {
        switch (activeCategory) {
            case 'general':
                return (
                    <GeneralSettings
                        settings={settings.general}
                        onUpdate={(updates) => handleUpdateCategory('general', updates)}
                    />
                );
            case 'notifications':
                return (
                    <NotificationSettings
                        settings={settings.notifications}
                        onUpdate={(updates) => handleUpdateCategory('notifications', updates)}
                    />
                );
            case 'appearance':
                return (
                    <AppearanceSettings
                        settings={settings.appearance}
                        onUpdate={(updates) => handleUpdateCategory('appearance', updates)}
                    />
                );
            case 'privacy':
                return (
                    <PrivacySettings
                        settings={settings.privacy}
                        onUpdate={(updates) => handleUpdateCategory('privacy', updates)}
                    />
                );
            case 'security':
                return (
                    <SecuritySettings
                        settings={settings.security}
                        onUpdate={(updates) => handleUpdateCategory('security', updates)}
                        activeSessions={activeSessions}
                        loginHistory={loginHistory}
                        onTerminateSession={handleTerminateSession}
                    />
                );
            case 'dataManagement':
                return (
                    <DataManagementSettings
                        settings={settings.dataManagement}
                        onUpdate={(updates) => handleUpdateCategory('dataManagement', updates)}
                        storageUsage={storageUsage}
                        onClearCache={handleClearCache}
                        onExportSettings={handleExport}
                        onImportSettings={handleImport}
                    />
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <DosenLayout>
                <Head title="Pengaturan" />
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DosenLayout>
        );
    }

    return (
        <DosenLayout>
            <Head title="Pengaturan" />

            <div className="px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Pengaturan</h1>
                        <p className="text-muted-foreground">
                            Kelola preferensi dan pengaturan akun Anda
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleReset}>
                        Reset ke Default
                    </Button>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <SettingsSidebar
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />

                    <Separator orientation="vertical" className="hidden lg:block h-auto" />
                    <Separator className="lg:hidden" />

                    <main className="flex-1 max-w-2xl">
                        {isSaving && (
                            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Menyimpan...
                            </div>
                        )}
                        {renderContent()}
                    </main>
                </div>

                {/* Toast Notification */}
                {toast && (
                    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg bg-background border">
                        {toast.type === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="text-sm">{toast.message}</span>
                    </div>
                )}
            </div>
        </DosenLayout>
    );
}
