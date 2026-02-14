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
    Sparkles,
    Zap,
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
        gradient: 'from-gray-900 to-black',
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
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-8 text-white shadow-2xl">
                        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative">
                            <div className="flex items-center gap-4">
                                <motion.div 
                                    className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    <SettingsIcon className="h-10 w-10" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-teal-100 font-medium">Pengaturan</p>
                                    <h1 className="text-3xl font-bold">Memuat...</h1>
                                    <p className="text-sm text-teal-100 mt-1">Mohon tunggu sebentar</p>
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
                {/* Header Card dengan animasi advanced */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-8 text-white shadow-2xl"
                >
                    {/* Animated background orbs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 25,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [360, 180, 0],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/10 blur-3xl"
                        />
                    </div>

                    {/* Floating icons */}
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
                            <Icon className="w-8 h-8" />
                        </motion.div>
                    ))}

                    {/* Large floating icons in background */}
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
                        <SettingsIcon className="w-32 h-32" strokeWidth={1} />
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
                        <Sparkles className="w-24 h-24" strokeWidth={1} />
                    </motion.div>
                    
                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    whileHover={{ 
                                        scale: 1.1, 
                                        rotate: 360,
                                        boxShadow: "0 0 30px rgba(255,255,255,0.5)"
                                    }}
                                    className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-xl"
                                >
                                    <SettingsIcon className="h-10 w-10" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-teal-100 font-medium flex items-center gap-2"
                                    >
                                        <Zap className="w-4 h-4" />
                                        Pengaturan
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold"
                                    >
                                        Kelola Preferensi
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-sm text-teal-100 mt-1"
                                    >
                                        Sesuaikan pengalaman Anda dengan pengaturan yang fleksibel
                                    </motion.p>
                                </div>
                            </div>
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                onClick={handleReset}
                                className="px-6 py-3 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-2 backdrop-blur-md border-2 border-white/30 shadow-lg font-medium"
                                whileHover={{ 
                                    scale: 1.05,
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <RefreshCw className="w-5 h-5" />
                                <span>Reset</span>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Settings Layout dengan animasi */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar dengan animasi enhanced */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:w-72 flex-shrink-0"
                    >
                        <motion.div 
                            className="bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-xl sticky top-24 overflow-hidden"
                            whileHover={{ 
                                boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                                borderColor: "rgba(20, 184, 166, 0.5)"
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Glow effect on hover */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-cyan-500/5 to-blue-600/5 opacity-0"
                                whileHover={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                            
                            <div className="relative">
                                <SettingsSidebar
                                    activeCategory={activeCategory}
                                    onCategoryChange={setActiveCategory}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                />
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Main Content Area dengan animasi enhanced */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex-1"
                    >
                        <motion.div 
                            className="bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-xl min-h-[600px] overflow-hidden relative"
                            whileHover={{ 
                                boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Decorative corner elements */}
                            <motion.div
                                className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-transparent rounded-bl-full"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.3, 0.5, 0.3],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                            <motion.div
                                className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-tr-full"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.3, 0.5, 0.3],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 2,
                                }}
                            />

                            {/* Category Header dengan animasi enhanced */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mb-8 relative"
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <motion.div 
                                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${currentCategory.gradient} flex items-center justify-center shadow-lg relative overflow-hidden`}
                                        whileHover={{ 
                                            scale: 1.1, 
                                            rotate: 5,
                                            boxShadow: "0 15px 40px rgba(0,0,0,0.3)"
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    >
                                        {/* Shimmer effect */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                            animate={{
                                                x: ['-100%', '200%'],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "linear",
                                            }}
                                        />
                                        <currentCategory.icon className="w-7 h-7 text-white relative z-10" />
                                    </motion.div>
                                    <div>
                                        <motion.h2 
                                            className="text-2xl font-bold text-gray-900 dark:text-white"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            {currentCategory.title}
                                        </motion.h2>
                                        <motion.p 
                                            className="text-gray-600 dark:text-gray-400 text-sm"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            {currentCategory.description}
                                        </motion.p>
                                    </div>
                                </div>
                                
                                {/* Divider with gradient */}
                                <motion.div
                                    className={`h-1 rounded-full bg-gradient-to-r ${currentCategory.gradient}`}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.7, duration: 0.5 }}
                                    style={{ transformOrigin: 'left' }}
                                />
                            </motion.div>

                            {/* Saving Indicator with enhanced animation */}
                            <AnimatePresence>
                                {isSaving && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                        className="mb-6 relative overflow-hidden"
                                    >
                                        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200 dark:border-teal-800 shadow-lg">
                                            {/* Animated background */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-cyan-400/20"
                                                animate={{
                                                    x: ['-100%', '200%'],
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                            />
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            >
                                                <RefreshCw className="h-5 w-5 text-teal-600 dark:text-teal-400 relative z-10" />
                                            </motion.div>
                                            <span className="text-sm text-teal-700 dark:text-teal-300 font-semibold relative z-10">Menyimpan perubahan...</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Settings Content - AnimatePresence untuk smooth transition antar kategori */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeCategory}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {renderContent()}
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Toast Notification with enhanced animation */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.8, rotate: -5 }}
                            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, y: 50, scale: 0.8, rotate: 5 }}
                            transition={{ 
                                type: "spring",
                                stiffness: 300,
                                damping: 20
                            }}
                            className="fixed bottom-8 right-8 z-50"
                        >
                            <motion.div 
                                className="relative overflow-hidden flex items-center gap-3 px-6 py-4 rounded-xl bg-white dark:bg-black border-2 shadow-2xl min-w-[300px]"
                                style={{
                                    borderColor: toast.type === 'success' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                                }}
                                whileHover={{ scale: 1.05 }}
                            >
                                {/* Animated background gradient */}
                                <motion.div
                                    className={`absolute inset-0 ${
                                        toast.type === 'success' 
                                            ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10' 
                                            : 'bg-gradient-to-r from-red-500/10 to-rose-500/10'
                                    }`}
                                    animate={{
                                        x: ['-100%', '200%'],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                />
                                
                                {/* Icon with animation */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ 
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 15,
                                        delay: 0.1
                                    }}
                                >
                                    {toast.type === 'success' ? (
                                        <div className="relative">
                                            <CheckCircle className="h-6 w-6 text-green-500 relative z-10" />
                                            <motion.div
                                                className="absolute inset-0 bg-green-500 rounded-full blur-md"
                                                animate={{
                                                    scale: [1, 1.5, 1],
                                                    opacity: [0.5, 0.2, 0.5],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <AlertCircle className="h-6 w-6 text-red-500 relative z-10" />
                                            <motion.div
                                                className="absolute inset-0 bg-red-500 rounded-full blur-md"
                                                animate={{
                                                    scale: [1, 1.5, 1],
                                                    opacity: [0.5, 0.2, 0.5],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                }}
                                            />
                                        </div>
                                    )}
                                </motion.div>
                                
                                <motion.span 
                                    className="text-gray-900 dark:text-white font-semibold relative z-10"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {toast.message}
                                </motion.span>

                                {/* Progress bar */}
                                <motion.div
                                    className={`absolute bottom-0 left-0 h-1 ${
                                        toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                    initial={{ width: '100%' }}
                                    animate={{ width: '0%' }}
                                    transition={{ duration: 3, ease: "linear" }}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </StudentLayout>
    );
}
