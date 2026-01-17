/**
 * Student Enhanced Settings Page
 * Dark theme dengan advanced UI, animations, dan interactive elements
 */

import { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle, AlertCircle, Settings as SettingsIcon } from 'lucide-react';
import StudentLayout from '@/layouts/student-layout';
import DarkContainer from '@/components/ui/dark-container';
import InteractiveSearch from '@/components/ui/interactive-search';
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
import { fadeInVariants, slideUpVariants } from '@/lib/animations';

type ToastType = { type: 'success' | 'error'; message: string } | null;

const categoryInfo: Record<SettingsCategory, { title: string; description: string }> = {
    general: {
        title: 'General Settings',
        description: 'Manage your basic preferences and regional settings',
    },
    notifications: {
        title: 'Notifications',
        description: 'Control how and when you receive notifications',
    },
    appearance: {
        title: 'Appearance',
        description: 'Customize the look and feel of your interface',
    },
    privacy: {
        title: 'Privacy',
        description: 'Manage your privacy and data sharing preferences',
    },
    security: {
        title: 'Security',
        description: 'Protect your account with security features',
    },
    dataManagement: {
        title: 'Data Management',
        description: 'Manage your data, storage, and backups',
    },
};

export default function StudentSettings() {
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
        } catch {
            // Silently fail
        }
    };

    const loadStorageUsage = async () => {
        try {
            const usage = await getStorageUsage();
            setStorageUsage(usage);
        } catch {
            // Silently fail
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

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        // TODO: Implement search filtering
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

                {/* Main Content */}
                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <InteractiveSearch
                        placeholder="Search settings..."
                        onSearch={handleSearch}
                        className="max-w-2xl mx-auto"
                    />
                </motion.div>

                {/* Settings Layout */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <motion.div
                        variants={slideUpVariants}
                        initial="hidden"
                        animate="visible"
                        className="lg:w-64 flex-shrink-0"
                    >
                        <DarkContainer
                            variant="secondary"
                            padding="md"
                            rounded="xl"
                            className="sticky top-24"
                        >
                            <SettingsSidebar
                                activeCategory={activeCategory}
                                onCategoryChange={setActiveCategory}
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                            />
                        </DarkContainer>
                    </motion.div>

                    {/* Main Content Area */}
                    <motion.div
                        variants={fadeInVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex-1"
                    >
                        <DarkContainer
                            variant="primary"
                            padding="lg"
                            rounded="xl"
                            glowEffect="purple"
                            className="min-h-[600px]"
                        >
                            {/* Category Header */}
                            <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-8"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <SettingsIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white font-display">
                                            {currentCategory.title}
                                        </h2>
                                        <p className="text-white/60 text-sm">
                                            {currentCategory.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Saving Indicator */}
                            <AnimatePresence>
                                {isSaving && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg glass border border-purple-500/30"
                                    >
                                        <RefreshCw className="h-4 w-4 animate-spin text-purple-400" />
                                        <span className="text-sm text-white/80">Menyimpan...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Settings Content */}
                            <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </DarkContainer>
                    </motion.div>
                </div>

                {/* Toast Notification */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            className="fixed bottom-6 right-6 z-50"
                        >
                            <div className="flex items-center gap-3 px-6 py-4 rounded-xl glass-strong border border-white/20 shadow-2xl glow-purple">
                                {toast.type === 'success' ? (
                                    <CheckCircle className="h-6 w-6 text-green-400" />
                                ) : (
                                    <AlertCircle className="h-6 w-6 text-red-400" />
                                )}
                                <span className="text-white font-medium">{toast.message}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </StudentLayout>
    );
}
