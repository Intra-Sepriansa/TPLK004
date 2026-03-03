import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import {
    AlertCircle,
    ArrowLeft,
    Bell,
    CheckCircle2,
    Database,
    Lock,
    Palette,
    RefreshCw,
    Save,
    Settings as SettingsIcon,
    Shield,
    Sparkles,
    type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import PengaturanIcon from '@/assets/admin/pengaturan/pengaturan.png';
import {
    AppearanceSettings,
    DataManagementSettings,
    GeneralSettings,
    NotificationSettings,
    PrivacySettings,
    SecuritySettings,
    SettingsSidebar,
} from '@/components/settings';
import { SkeletonGrid } from '@/components/ui/skeleton-loader';
import StudentLayout from '@/layouts/student-layout';
import {
    clearCache,
    downloadSettings,
    getActiveSessions,
    getLoginHistory,
    getSettings,
    getStorageUsage,
    resetSettings,
    terminateSession,
    updateCategorySettings,
    uploadSettings,
} from '@/lib/settings-api';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import {
    defaultSettings,
    type ActiveSession,
    type LoginHistoryEntry,
    type SettingsCategory,
    type StorageUsage,
    type UserSettings,
} from '@/types/settings';

type ToastType = { type: 'success' | 'error'; message: string } | null;

function mergeCategoryState<T extends object>(
    current: T,
    updates: Partial<T>,
): T {
    const next = { ...(current as Record<string, unknown>) };

    for (const [key, value] of Object.entries(updates)) {
        const existing = next[key];
        const canDeepMerge =
            existing &&
            typeof existing === 'object' &&
            !Array.isArray(existing) &&
            value &&
            typeof value === 'object' &&
            !Array.isArray(value);

        next[key] = canDeepMerge
            ? mergeCategoryState(
                  existing as Record<string, unknown>,
                  value as Record<string, unknown>,
              )
            : value;
    }

    return next as T;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.08,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
        },
    },
};

const categoryInfo: Record<
    SettingsCategory,
    {
        title: string;
        description: string;
        icon: LucideIcon;
        gradient: string;
    }
> = {
    general: {
        title: 'Umum',
        description: 'Bahasa, zona waktu, dan format tampilan akun',
        icon: SettingsIcon,
        gradient: 'from-sky-400 to-indigo-600',
    },
    notifications: {
        title: 'Notifikasi',
        description: 'Kontrol email, push, dan notifikasi dalam aplikasi',
        icon: Bell,
        gradient: 'from-emerald-400 to-teal-600',
    },
    appearance: {
        title: 'Tampilan',
        description: 'Tema, ukuran font, animasi, dan preferensi antarmuka',
        icon: Palette,
        gradient: 'from-fuchsia-400 to-purple-600',
    },
    privacy: {
        title: 'Privasi',
        description: 'Kelola visibilitas profil dan data aktivitas Anda',
        icon: Shield,
        gradient: 'from-amber-400 to-orange-600',
    },
    security: {
        title: 'Keamanan',
        description: 'Lindungi akun melalui sesi aktif dan riwayat login',
        icon: Lock,
        gradient: 'from-rose-400 to-pink-600',
    },
    dataManagement: {
        title: 'Manajemen Data',
        description: 'Backup, cache, ekspor, impor, dan mode offline',
        icon: Database,
        gradient: 'from-indigo-400 to-violet-600',
    },
};

export default function StudentSettings() {
    const { setTheme, resolvedTheme } = useTheme();
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [activeCategory, setActiveCategory] =
        useState<SettingsCategory>('general');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [storageUsage, setStorageUsage] = useState<StorageUsage>();
    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
    const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
    const [toast, setToast] = useState<ToastType>(null);

    const currentCategory = useMemo(
        () => categoryInfo[activeCategory],
        [activeCategory],
    );

    const showToast = useCallback(
        (type: 'success' | 'error', message: string) => {
            setToast({ type, message });
            window.setTimeout(() => setToast(null), 3200);
        },
        [],
    );

    const loadSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getSettings();
            setSettings(data);
            setTheme(data.appearance.theme);
        } catch {
            showToast('error', 'Gagal memuat pengaturan.');
            setSettings(defaultSettings);
            setTheme(defaultSettings.appearance.theme);
        } finally {
            setIsLoading(false);
        }
    }, [setTheme, showToast]);

    const loadSecurityData = useCallback(async () => {
        try {
            const [sessions, history] = await Promise.all([
                getActiveSessions(),
                getLoginHistory(20),
            ]);
            setActiveSessions(sessions);
            setLoginHistory(history);
        } catch {
            setActiveSessions([]);
            setLoginHistory([]);
            showToast('error', 'Gagal memuat data keamanan.');
        }
    }, [showToast]);

    const loadStorageData = useCallback(async () => {
        try {
            const usage = await getStorageUsage();
            setStorageUsage(usage);
        } catch {
            setStorageUsage(undefined);
            showToast('error', 'Gagal memuat penggunaan penyimpanan.');
        }
    }, [showToast]);

    useEffect(() => {
        void loadSettings();
    }, [loadSettings]);

    useEffect(() => {
        if (activeCategory === 'security') {
            void loadSecurityData();
        }

        if (activeCategory === 'dataManagement') {
            void loadStorageData();
        }
    }, [activeCategory, loadSecurityData, loadStorageData]);

    const handleUpdateCategory = useCallback(
        async <K extends SettingsCategory>(
            category: K,
            updates: Partial<UserSettings[K]>,
        ) => {
            setSettings((prev) => ({
                ...prev,
                [category]: mergeCategoryState(prev[category], updates),
            }));

            setIsSaving(true);
            try {
                const updatedCategory = await updateCategorySettings(
                    category,
                    updates,
                );
                setSettings((prev) => ({
                    ...prev,
                    [category]: mergeCategoryState(
                        prev[category],
                        updatedCategory,
                    ),
                }));
                if (
                    category === 'appearance' &&
                    typeof (updatedCategory as { theme?: unknown }).theme ===
                        'string'
                ) {
                    setTheme(
                        (updatedCategory as { theme: UserSettings['appearance']['theme'] })
                            .theme,
                    );
                }
                showToast('success', 'Perubahan pengaturan berhasil disimpan.');
            } catch {
                await loadSettings();
                showToast('error', 'Gagal menyimpan perubahan pengaturan.');
            } finally {
                setIsSaving(false);
            }
        },
        [loadSettings, showToast],
    );

    const handleReset = async () => {
        setIsResetting(true);
        try {
            const data = await resetSettings();
            setSettings(data);
            setTheme(data.appearance.theme);
            showToast('success', 'Pengaturan berhasil direset ke default.');
        } catch {
            showToast('error', 'Gagal mereset pengaturan.');
        } finally {
            setIsResetting(false);
        }
    };

    const handleExport = async () => {
        try {
            await downloadSettings();
            showToast('success', 'File pengaturan berhasil diekspor.');
        } catch {
            showToast('error', 'Gagal mengekspor pengaturan.');
        }
    };

    const handleImport = async (file: File) => {
        try {
            const data = await uploadSettings(file);
            setSettings(data);
            setTheme(data.appearance.theme);
            showToast('success', 'Pengaturan berhasil diimpor.');
        } catch {
            showToast('error', 'Gagal mengimpor pengaturan.');
        }
    };

    const handleClearCache = async () => {
        try {
            await clearCache();
            await loadStorageData();
            showToast('success', 'Cache berhasil dibersihkan.');
        } catch {
            showToast('error', 'Gagal membersihkan cache.');
        }
    };

    const handleTerminateSession = async (sessionId: string) => {
        try {
            await terminateSession(sessionId);
            setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
            showToast('success', 'Sesi berhasil dihentikan.');
        } catch {
            showToast('error', 'Gagal menghentikan sesi.');
        }
    };

    const renderContent = () => {
        switch (activeCategory) {
            case 'general':
                return (
                    <GeneralSettings
                        settings={settings.general}
                        onUpdate={(updates) =>
                            handleUpdateCategory('general', updates)
                        }
                    />
                );
            case 'notifications':
                return (
                    <NotificationSettings
                        settings={settings.notifications}
                        onUpdate={(updates) =>
                            handleUpdateCategory('notifications', updates)
                        }
                    />
                );
            case 'appearance':
                return (
                    <AppearanceSettings
                        settings={settings.appearance}
                        resolvedTheme={resolvedTheme}
                        onThemeChange={(nextTheme) => {
                            setTheme(nextTheme);
                            void handleUpdateCategory('appearance', {
                                theme: nextTheme,
                            });
                        }}
                        onUpdate={(updates) =>
                            handleUpdateCategory('appearance', updates)
                        }
                    />
                );
            case 'privacy':
                return (
                    <PrivacySettings
                        settings={settings.privacy}
                        onUpdate={(updates) =>
                            handleUpdateCategory('privacy', updates)
                        }
                    />
                );
            case 'security':
                return (
                    <SecuritySettings
                        settings={settings.security}
                        onUpdate={(updates) =>
                            handleUpdateCategory('security', updates)
                        }
                        activeSessions={activeSessions}
                        loginHistory={loginHistory}
                        onTerminateSession={handleTerminateSession}
                        onSetup2FA={() => {
                            void handleUpdateCategory('security', {
                                twoFactorEnabled:
                                    !settings.security.twoFactorEnabled,
                            });
                        }}
                    />
                );
            case 'dataManagement':
                return (
                    <DataManagementSettings
                        settings={settings.dataManagement}
                        onUpdate={(updates) =>
                            handleUpdateCategory('dataManagement', updates)
                        }
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
                <div className="space-y-6 p-4 md:p-6 lg:p-8">
                    <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white shadow-2xl">
                        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="relative flex h-16 w-16 shrink-0">
                                <img
                                    src={PengaturanIcon}
                                    alt="Pengaturan"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.45)]"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-indigo-100">
                                    Pengaturan Mahasiswa
                                </p>
                                <p className="text-xl font-bold text-white sm:text-2xl">
                                    Memuat preferensi...
                                </p>
                            </div>
                        </div>
                    </div>
                    <SkeletonGrid count={6} columns={2} />
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout>
            <Head title="Pengaturan" />

            <motion.div
                className="space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating icons - Smooth Animation */}
                    {[SettingsIcon, Bell, Palette, Shield, Lock].map((Icon, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-white/20"
                            initial={{ y: 0 }}
                            animate={{
                                y: [0, -20, 0],
                                x: [0, Math.sin(i) * 10, 0],
                                rotate: [0, 360],
                            }}
                            transition={{
                                duration: 4 + i,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.2,
                            }}
                            style={{
                                left: `${15 + i * 18}%`,
                                top: `${20 + (i % 2) * 40}%`,
                            }}
                        >
                            <Icon className="h-8 w-8" />
                        </motion.div>
                    ))}

                    {/* Large floating icon in background */}
                    <motion.div
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10"
                        animate={{
                            rotateY: [0, 360],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <SettingsIcon className="h-32 w-32" strokeWidth={1} />
                    </motion.div>

                    <motion.div
                        className="absolute left-8 bottom-8 text-white/10"
                        animate={{
                            rotateY: [360, 0],
                            scale: [1, 1.15, 1],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <Sparkles className="h-24 w-24" strokeWidth={1} />
                    </motion.div>

                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/user/dashboard')}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </motion.button>

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
                                <motion.div
                                    className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                                    initial={{
                                        opacity: 0,
                                        scale: 0.5,
                                        rotate: -10,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        rotate: 0,
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        delay: 0.2,
                                    }}
                                    whileHover={{ scale: 1.05, rotate: 4 }}
                                >
                                    <img
                                        src={PengaturanIcon}
                                        alt="Pengaturan"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>

                                <div className="flex-1">
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Preferensi Akun Mahasiswa
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Pengaturan
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Kelola bahasa, notifikasi, privasi,
                                        keamanan akun, dan data Anda dalam satu
                                        tempat.
                                    </motion.p>
                                </div>
                            </div>

                            <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleReset}
                                    disabled={isResetting || isSaving}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/20 px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition hover:bg-white/30 sm:w-auto"
                                >
                                    <RefreshCw
                                        className={cn(
                                            'h-4 w-4',
                                            (isResetting || isSaving) &&
                                                'animate-spin',
                                        )}
                                    />
                                    Reset Default
                                </motion.button>
                                <div className="rounded-2xl border border-white/10 bg-white/15 px-4 py-3 backdrop-blur-xl">
                                    <p className="text-xs text-indigo-100/90">
                                        Kategori Aktif
                                    </p>
                                    <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
                                        <currentCategory.icon className="h-4 w-4" />
                                        {currentCategory.title}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]"
                >
                    <div className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-5 xl:sticky xl:top-24 xl:h-fit dark:border-white/10 dark:bg-neutral-900/40">
                        <SettingsSidebar
                            activeCategory={activeCategory}
                            onCategoryChange={setActiveCategory}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                        />
                    </div>

                    <div className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/10 dark:bg-neutral-900/40">
                        <div className="mb-6 border-b border-white/20 pb-4 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        'flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
                                        currentCategory.gradient,
                                    )}
                                >
                                    <currentCategory.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                        {currentCategory.title}
                                    </h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {currentCategory.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {isSaving && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-4 flex items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
                                >
                                    <Save className="h-4 w-4" />
                                    Menyimpan perubahan...
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.25 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 24 }}
                            className="fixed right-4 bottom-6 z-50 sm:right-6"
                        >
                            <div
                                className={cn(
                                    'flex min-w-[240px] items-center gap-2 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl',
                                    toast.type === 'success'
                                        ? 'border-emerald-300 bg-emerald-50/90 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                                        : 'border-rose-300 bg-rose-50/90 text-rose-700 dark:border-rose-700 dark:bg-rose-950/70 dark:text-rose-300',
                                )}
                            >
                                {toast.type === 'success' ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                    <AlertCircle className="h-5 w-5" />
                                )}
                                <span className="text-sm font-medium">
                                    {toast.message}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </StudentLayout>
    );
}
