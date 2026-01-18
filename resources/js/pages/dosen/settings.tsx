/**
 * Dosen Enhanced Settings Page
 * Advanced settings dengan fitur khusus untuk dosen
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
    GraduationCap,
    Users,
    type LucideIcon
} from 'lucide-react';
import DosenLayout from '@/layouts/dosen-layout';
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

// Extended categories for dosen
type DosenSettingsCategory = SettingsCategory | 'teaching' | 'classManagement';

interface DosenProps {
    dosen: {
        id: number;
        nama: string;
        nidn: string;
        email: string;
    };
}

const categoryInfo: Record<DosenSettingsCategory, { title: string; description: string; icon: LucideIcon; gradient: string }> = {
    general: {
        title: 'Pengaturan Umum',
        description: 'Kelola preferensi dasar dan pengaturan regional',
        icon: SettingsIcon,
        gradient: 'from-blue-500 to-cyan-500',
    },
    teaching: {
        title: 'Pengajaran',
        description: 'Pengaturan terkait metode pengajaran dan evaluasi',
        icon: GraduationCap,
        gradient: 'from-emerald-500 to-teal-500',
    },
    classManagement: {
        title: 'Manajemen Kelas',
        description: 'Kelola preferensi untuk pengelolaan kelas dan mahasiswa',
        icon: Users,
        gradient: 'from-amber-500 to-orange-500',
    },
    notifications: {
        title: 'Notifikasi',
        description: 'Kontrol bagaimana dan kapan Anda menerima notifikasi',
        icon: Bell,
        gradient: 'from-green-500 to-emerald-500',
    },
    appearance: {
        title: 'Tampilan',
        description: 'Sesuaikan tampilan dan nuansa interface Anda',
        icon: Palette,
        gradient: 'from-purple-500 to-pink-500',
    },
    privacy: {
        title: 'Privasi',
        description: 'Kelola privasi dan preferensi berbagi data',
        icon: Shield,
        gradient: 'from-orange-500 to-red-500',
    },
    security: {
        title: 'Keamanan',
        description: 'Lindungi akun Anda dengan fitur keamanan',
        icon: Lock,
        gradient: 'from-red-500 to-rose-500',
    },
    dataManagement: {
        title: 'Manajemen Data',
        description: 'Kelola data, penyimpanan, dan backup Anda',
        icon: Database,
        gradient: 'from-indigo-500 to-purple-500',
    },
};

export default function DosenSettings({ dosen }: DosenProps) {
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [activeCategory, setActiveCategory] = useState<DosenSettingsCategory>('general');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [storageUsage, setStorageUsage] = useState<StorageUsage | undefined>({
        used: 125678901,
        total: 107374182400,
        breakdown: {
            documents: 85456789,
            cache: 32345678,
            other: 7876434,
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
                showToast('success', 'Pengaturan berhasil disimpan');
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
        showToast('success', 'Pengaturan berhasil diekspor');
    };

    const handleImport = async (file: File) => {
        try {
            const data = await uploadSettings(file);
            setSettings(data);
            showToast('success', 'Pengaturan berhasil diimpor');
        } catch {
            showToast('error', 'Gagal mengimpor pengaturan');
        }
    };

    const handleClearCache = async () => {
        await clearCache();
        await loadStorageUsage();
        showToast('success', 'Cache berhasil dibersihkan');
    };

    const handleTerminateSession = async (sessionId: string) => {
        try {
            await terminateSession(sessionId);
            setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
            showToast('success', 'Sesi berhasil dihentikan');
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
            case 'teaching':
                return <TeachingSettings />;
            case 'classManagement':
                return <ClassManagementSettings />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <DosenLayout dosen={dosen}>
                <Head title="Pengaturan" />
                <div className="space-y-6 p-6">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                        />
                        <div className="relative">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                                    <SettingsIcon className="h-8 w-8" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-100">Pengaturan</p>
                                    <h1 className="text-2xl font-bold">Loading...</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                    <SkeletonGrid count={6} columns={2} />
                </div>
            </DosenLayout>
        );
    }

    const currentCategory = categoryInfo[activeCategory];

    return (
        <DosenLayout dosen={dosen}>
            <Head title="Pengaturan" />

            <div className="space-y-6 p-6">
                {/* Header Card with Animation */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                    />
                    
                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div 
                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur"
                                >
                                    <SettingsIcon className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-emerald-100">Pengaturan</p>
                                    <h1 className="text-2xl font-bold">Kelola Preferensi Dosen</h1>
                                    <p className="text-sm text-emerald-100">Sesuaikan pengalaman mengajar Anda</p>
                                </div>
                            </div>
                            <motion.button
                                onClick={handleReset}
                                className="px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-2 backdrop-blur shadow-lg"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Reset ke Default</span>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Settings Layout */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="lg:w-64 flex-shrink-0"
                    >
                        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-lg sticky top-24">
                            <SettingsSidebar
                                activeCategory={activeCategory}
                                onCategoryChange={setActiveCategory}
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                            />
                        </div>
                    </motion.div>

                    {/* Main Content Area */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex-1"
                    >
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
                                        className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                                    >
                                        <RefreshCw className="h-4 w-4 animate-spin text-emerald-500" />
                                        <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Menyimpan perubahan...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Settings Content */}
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
                    </motion.div>
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
        </DosenLayout>
    );
}

// Teaching Settings Component
function TeachingSettings() {
    return (
        <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
                Pengaturan pengajaran akan segera tersedia...
            </p>
        </div>
    );
}

// Class Management Settings Component  
function ClassManagementSettings() {
    return (
        <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
                Pengaturan manajemen kelas akan segera tersedia...
            </p>
        </div>
    );
}
