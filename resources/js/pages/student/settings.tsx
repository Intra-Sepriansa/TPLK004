/**
 * Student Enhanced Settings Page
 * Dark theme dengan advanced UI, animations, dan interactive elements
 */

import { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    RefreshCw, 
    CheckCircle, 
    AlertCircle, 
    Settings as SettingsIcon,
    Bell,
    Palette,
    Shield,
    Lock,
    Database,
    type LucideIcon
} from 'lucide-react';
import StudentLayout from '@/layouts/student-layout';
import { SkeletonGrid } from '@/components/ui/skeleton-loader';
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

const categoryInfo: Record<SettingsCategory, { title: string; description: string; icon: LucideIcon; gradient: string }> = {
    general: {
        title: 'General Settings',
        description: 'Manage your basic preferences and regional settings',
        icon: SettingsIcon,
        gradient: 'from-blue-500 to-cyan-500',
    },
    notifications: {
        title: 'Notifications',
        description: 'Control how and when you receive notifications',
        icon: Bell,
        gradient: 'from-green-500 to-emerald-500',
    },
    appearance: {
        title: 'Appearance',
        description: 'Customize the look and feel of your interface',
        icon: Palette,
        gradient: 'from-purple-500 to-pink-500',
    },
    privacy: {
        title: 'Privacy',
        description: 'Manage your privacy and data sharing preferences',
        icon: Shield,
        gradient: 'from-orange-500 to-red-500',
    },
    security: {
        title: 'Security',
        description: 'Protect your account with security features',
        icon: Lock,
        gradient: 'from-red-500 to-rose-500',
    },
    dataManagement: {
        title: 'Data Management',
        description: 'Manage your data, storage, and backups',
        icon: Database,
        gradient: 'from-indigo-500 to-purple-500',
    },
};

export default function StudentSettings() {
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [activeCategory, setActiveCategory] = useState<SettingsCategory>('general');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [storageUsage, setStorageUsage] = useState<StorageUsage | undefined>({
        used: 45678901,
        total: 107374182400,
        breakdown: {
            documents: 23456789,
            cache: 12345678,
            other: 9876434,
        },
    });
    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
    const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
    const [toast, setToast] = useState<ToastType>(null);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        loadSettings();
    }, []);

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
        } catch (error) {
            console.error('Failed to load security data:', error);
            // Set empty arrays as fallback
            setActiveSessions([]);
            setLoginHistory([]);
        }
    };

    const loadStorageUsage = async () => {
        try {
            const usage = await getStorageUsage();
            setStorageUsage(usage);
        } catch (error) {
            console.error('Failed to load storage usage:', error);
            // Keep existing mock data as fallback
        }
    };

    const handleUpdateCategory = useCallback(
        async <K extends SettingsCategory>(
            category: K,
            updates: Partial<UserSettings[K]>
        ) => {
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
            <StudentLayout>
                <Head title="Pengaturan" />
                <div className="space-y-6 p-6">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white shadow-lg">
                        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                        <div className="relative">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                                    <SettingsIcon className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm text-purple-100">Pengaturan</p>
                                    <h1 className="text-2xl font-bold">Loading...</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                    <SkeletonGrid count={6} columns={2} />
                </div>
            </StudentLayout>
        );
    }

    const currentCategory = categoryInfo[activeCategory];

    return (
        <StudentLayout>
            <Head title="Pengaturan" />

            <div className="space-y-6 p-6">
                {/* Header Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    
                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                                    <SettingsIcon className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm text-purple-100">Pengaturan</p>
                                    <h1 className="text-2xl font-bold">Kelola Preferensi</h1>
                                    <p className="text-sm text-purple-100">Sesuaikan pengalaman Anda</p>
                                </div>
                            </div>
                            <motion.button
                                onClick={handleReset}
                                className="px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-2 backdrop-blur"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Reset</span>
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Settings Layout */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-lg sticky top-24">
                            <SettingsSidebar
                                activeCategory={activeCategory}
                                onCategoryChange={setActiveCategory}
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                            />
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-lg min-h-[600px]">
                            {/* Category Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <motion.div 
                                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentCategory.gradient} flex items-center justify-center shadow-lg`}
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    >
                                        <currentCategory.icon className="w-6 h-6 text-white" />
                                    </motion.div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {currentCategory.title}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            {currentCategory.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Saving Indicator */}
                            <AnimatePresence>
                                {isSaving && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800"
                                    >
                                        <RefreshCw className="h-4 w-4 animate-spin text-purple-500" />
                                        <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">Menyimpan...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Settings Content - AnimatePresence untuk smooth transition antar kategori */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeCategory}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {renderContent()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Toast Notification */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="fixed bottom-6 right-6 z-50"
                        >
                            <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 shadow-2xl">
                                {toast.type === 'success' ? (
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                ) : (
                                    <AlertCircle className="h-6 w-6 text-red-500" />
                                )}
                                <span className="text-gray-900 dark:text-white font-medium">{toast.message}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </StudentLayout>
    );
}
