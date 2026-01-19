/**
 * Dosen Enhanced Settings Page with i18n and Theme Support
 */

import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    RefreshCw, CheckCircle, AlertCircle, Settings as SettingsIcon,
    Bell, Palette, Shield, Lock, Database, GraduationCap, Users,
    Globe, Moon, Sun, Download, type LucideIcon
} from 'lucide-react';
import DosenLayout from '@/layouts/dosen-layout';
import { SkeletonGrid } from '@/components/ui/skeleton-loader';
import { useTranslation, type Language } from '@/i18n';
import { useTheme, type Theme } from '@/hooks/useTheme';
import axios from 'axios';

type ToastType = { type: 'success' | 'error'; message: string } | null;
type DosenSettingsCategory = 'general' | 'teaching' | 'classManagement' | 'notifications' | 'appearance' | 'privacy' | 'security' | 'dataManagement';

interface DosenProps {
    dosen: { id: number; nama: string; nidn: string; email: string };
}

interface Settings {
    general: { language: Language; timezone: string; dateFormat: string };
    teaching: { autoApproveAttendance: boolean; strictGradingMode: boolean };
    classManagement: { lateLimit: number; minimumAttendance: number };
    notifications: { emailNewAttendance: boolean; emailPermitRequest: boolean };
    privacy: { publicProfile: boolean; anonymousAnalytics: boolean };
}

export default function DosenSettings({ dosen }: DosenProps) {
    const [activeCategory, setActiveCategory] = useState<DosenSettingsCategory>('general');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<ToastType>(null);
    const [settings, setSettings] = useState<Settings>({
        general: { language: 'id', timezone: 'Asia/Jakarta', dateFormat: 'DD/MM/YYYY' },
        teaching: { autoApproveAttendance: true, strictGradingMode: false },
        classManagement: { lateLimit: 15, minimumAttendance: 75 },
        notifications: { emailNewAttendance: true, emailPermitRequest: true },
        privacy: { publicProfile: true, anonymousAnalytics: false },
    });

    const { theme, setTheme } = useTheme();
    const t = useTranslation(settings.general.language);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await axios.get('/api/dosen/api/settings');
            setSettings(response.data);
        } catch (error) {
            showToast('error', t.settings.loadError);
        } finally {
            setIsLoading(false);
        }
    };

    const saveSettings = async (category: string, data: any) => {
        setIsSaving(true);
        try {
            const response = await axios.post(`/api/dosen/api/settings/${category}`, data);
            setSettings(prev => ({ ...prev, [category]: data }));
            showToast('success', response.data.message || t.settings.saveSuccess);
        } catch (error: any) {
            showToast('error', error.response?.data?.message || t.settings.saveError);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        setIsSaving(true);
        try {
            const response = await axios.post('/api/dosen/api/settings/reset');
            setSettings(response.data.settings);
            showToast('success', t.settings.resetSuccess);
        } catch (error) {
            showToast('error', t.settings.saveError);
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await axios.get('/api/dosen/api/settings/export');
            const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dosen-settings-${dosen.nidn}.json`;
            a.click();
            showToast('success', t.settings.dataManagement.exportSuccess);
        } catch (error) {
            showToast('error', t.settings.dataManagement.exportError);
        }
    };

    const handleExportPdf = () => {
        // Direct download via window.open
        window.open('/api/dosen/api/settings/export-pdf', '_blank');
        showToast('success', t.settings.dataManagement.exportSuccess);
    };

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        showToast('success', t.settings.saveSuccess);
    };

    const categoryInfo: Record<DosenSettingsCategory, { title: string; description: string; icon: LucideIcon; gradient: string }> = {
        general: { title: t.settings.categories.general.title, description: t.settings.categories.general.description, icon: SettingsIcon, gradient: 'from-blue-500 to-cyan-500' },
        teaching: { title: t.settings.categories.teaching.title, description: t.settings.categories.teaching.description, icon: GraduationCap, gradient: 'from-emerald-500 to-teal-500' },
        classManagement: { title: t.settings.categories.classManagement.title, description: t.settings.categories.classManagement.description, icon: Users, gradient: 'from-amber-500 to-orange-500' },
        notifications: { title: t.settings.categories.notifications.title, description: t.settings.categories.notifications.description, icon: Bell, gradient: 'from-green-500 to-emerald-500' },
        appearance: { title: t.settings.categories.appearance.title, description: t.settings.categories.appearance.description, icon: Palette, gradient: 'from-purple-500 to-pink-500' },
        privacy: { title: t.settings.categories.privacy.title, description: t.settings.categories.privacy.description, icon: Shield, gradient: 'from-orange-500 to-red-500' },
        security: { title: t.settings.categories.security.title, description: t.settings.categories.security.description, icon: Lock, gradient: 'from-red-500 to-rose-500' },
        dataManagement: { title: t.settings.categories.dataManagement.title, description: t.settings.categories.dataManagement.description, icon: Database, gradient: 'from-gray-900 to-black' },
    };

    const renderContent = () => {
        switch (activeCategory) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-900 dark:text-white">{t.settings.general.language}</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.general.languageDesc}</p>
                            <select value={settings.general.language} onChange={(e) => setSettings(prev => ({ ...prev, general: { ...prev.general, language: e.target.value as Language } }))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
                                <option value="id">Bahasa Indonesia</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-900 dark:text-white">{t.settings.general.timezone}</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.general.timezoneDesc}</p>
                            <select value={settings.general.timezone} onChange={(e) => setSettings(prev => ({ ...prev, general: { ...prev.general, timezone: e.target.value } }))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
                                <option value="Asia/Jakarta">WIB (Jakarta)</option>
                                <option value="Asia/Makassar">WITA (Makassar)</option>
                                <option value="Asia/Jayapura">WIT (Jayapura)</option>
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-900 dark:text-white">{t.settings.general.dateFormat}</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.general.dateFormatDesc}</p>
                            <select value={settings.general.dateFormat} onChange={(e) => setSettings(prev => ({ ...prev, general: { ...prev.general, dateFormat: e.target.value } }))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
                                <option value="DD/MM/YYYY">31/12/2024</option>
                                <option value="MM/DD/YYYY">12/31/2024</option>
                                <option value="YYYY-MM-DD">2024-12-31</option>
                            </select>
                        </div>
                        <motion.button onClick={() => saveSettings('general', settings.general)} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            {t.settings.saveChanges}
                        </motion.button>
                    </div>
                );
            
            case 'teaching':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.settings.teaching.title}</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all">
                                    <input type="checkbox" checked={settings.teaching.autoApproveAttendance} onChange={(e) => setSettings(prev => ({ ...prev, teaching: { ...prev.teaching, autoApproveAttendance: e.target.checked } }))} className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{t.settings.teaching.autoApprove}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{t.settings.teaching.autoApproveDesc}</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all">
                                    <input type="checkbox" checked={settings.teaching.strictGradingMode} onChange={(e) => setSettings(prev => ({ ...prev, teaching: { ...prev.teaching, strictGradingMode: e.target.checked } }))} className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{t.settings.teaching.strictGrading}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{t.settings.teaching.strictGradingDesc}</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <motion.button onClick={() => saveSettings('teaching', settings.teaching)} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            {t.settings.saveChanges}
                        </motion.button>
                    </div>
                );

            case 'classManagement':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.settings.classManagement.title}</h3>
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-900 dark:text-white">{t.settings.classManagement.lateLimit}</label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.classManagement.lateLimitDesc}</p>
                                <input type="number" value={settings.classManagement.lateLimit} onChange={(e) => setSettings(prev => ({ ...prev, classManagement: { ...prev.classManagement, lateLimit: parseInt(e.target.value) } }))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                            </div>
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-900 dark:text-white">{t.settings.classManagement.minAttendance}</label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.classManagement.minAttendanceDesc}</p>
                                <input type="number" value={settings.classManagement.minimumAttendance} onChange={(e) => setSettings(prev => ({ ...prev, classManagement: { ...prev.classManagement, minimumAttendance: parseInt(e.target.value) } }))} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                            </div>
                        </div>
                        <motion.button onClick={() => saveSettings('class-management', settings.classManagement)} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            {t.settings.saveChanges}
                        </motion.button>
                    </div>
                );

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.settings.notifications.title}</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all">
                                    <input type="checkbox" checked={settings.notifications.emailNewAttendance} onChange={(e) => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, emailNewAttendance: e.target.checked } }))} className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{t.settings.notifications.newAttendance}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{t.settings.notifications.newAttendanceDesc}</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all">
                                    <input type="checkbox" checked={settings.notifications.emailPermitRequest} onChange={(e) => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, emailPermitRequest: e.target.checked } }))} className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{t.settings.notifications.permitRequest}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{t.settings.notifications.permitRequestDesc}</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <motion.button onClick={() => saveSettings('notifications', settings.notifications)} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            {t.settings.saveChanges}
                        </motion.button>
                    </div>
                );

            case 'appearance':
                return (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-900 dark:text-white">{t.settings.appearance.title}</label>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t.settings.appearance.themeDesc}</p>
                            <div className="grid grid-cols-3 gap-4">
                                {(['light', 'dark', 'auto'] as Theme[]).map((themeOption) => (
                                    <motion.button key={themeOption} onClick={() => handleThemeChange(themeOption)} className={`p-4 rounded-xl border-2 transition-all ${theme === themeOption ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <div className="flex flex-col items-center gap-2">
                                            {themeOption === 'light' && <Sun className="w-6 h-6" />}
                                            {themeOption === 'dark' && <Moon className="w-6 h-6" />}
                                            {themeOption === 'auto' && <Globe className="w-6 h-6" />}
                                            <span className="text-sm font-medium capitalize">{t.settings.appearance[themeOption]}</span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'privacy':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.settings.privacy.title}</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all">
                                    <input type="checkbox" checked={settings.privacy.publicProfile} onChange={(e) => setSettings(prev => ({ ...prev, privacy: { ...prev.privacy, publicProfile: e.target.checked } }))} className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{t.settings.privacy.publicProfile}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{t.settings.privacy.publicProfileDesc}</p>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all">
                                    <input type="checkbox" checked={settings.privacy.anonymousAnalytics} onChange={(e) => setSettings(prev => ({ ...prev, privacy: { ...prev.privacy, anonymousAnalytics: e.target.checked } }))} className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{t.settings.privacy.analytics}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{t.settings.privacy.analyticsDesc}</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <motion.button onClick={() => saveSettings('privacy', settings.privacy)} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            {t.settings.saveChanges}
                        </motion.button>
                    </div>
                );

            case 'security':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.settings.security.title}</h3>
                            <div className="space-y-3">
                                <motion.button className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-left transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <p className="font-medium text-gray-900 dark:text-white">{t.settings.security.changePassword}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.settings.security.changePasswordDesc}</p>
                                </motion.button>
                                <motion.button className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-left transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <p className="font-medium text-gray-900 dark:text-white">{t.settings.security.twoFactor}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.settings.security.twoFactorDesc}</p>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                );

            case 'dataManagement':
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.settings.dataManagement.title}</h3>
                            <div className="space-y-3">
                                <motion.button onClick={handleExportPdf} className="w-full p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-left transition-all flex items-center justify-between" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <div>
                                        <p className="font-medium text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            {t.settings.dataManagement.exportData} (PDF)
                                        </p>
                                        <p className="text-sm text-emerald-700 dark:text-emerald-300">Download pengaturan dalam format PDF yang mudah dibaca</p>
                                    </div>
                                    <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </motion.button>
                                
                                <motion.button onClick={handleExport} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-left transition-all flex items-center justify-between" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                            </svg>
                                            {t.settings.dataManagement.exportData} (JSON)
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Download pengaturan dalam format JSON untuk backup</p>
                                    </div>
                                    <Download className="h-5 w-5 text-gray-400" />
                                </motion.button>
                                
                                <motion.button className="w-full p-4 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-left transition-all" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <p className="font-medium text-red-600 dark:text-red-400">{t.settings.dataManagement.deleteAccount}</p>
                                    <p className="text-sm text-red-600/70 dark:text-red-400/70">{t.settings.dataManagement.deleteAccountDesc}</p>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return <div className="text-center py-12"><p className="text-gray-600 dark:text-gray-400">Coming soon...</p></div>;
        }
    };

    if (isLoading) {
        return (
            <DosenLayout dosen={dosen}>
                <Head title={t.settings.title} />
                <div className="space-y-6 p-6">
                    <SkeletonGrid count={6} columns={2} />
                </div>
            </DosenLayout>
        );
    }

    const currentCategory = categoryInfo[activeCategory];

    return (
        <DosenLayout dosen={dosen}>
            <Head title={t.settings.title} />
            <div className="space-y-6 p-6">
                {/* Header Card */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl">
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div whileHover={{ scale: 1.1, y: -3 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                                    <SettingsIcon className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-emerald-100">{t.settings.title}</p>
                                    <h1 className="text-2xl font-bold">{t.settings.subtitle}</h1>
                                    <p className="text-sm text-emerald-100">{t.settings.description}</p>
                                </div>
                            </div>
                            <motion.button onClick={handleReset} className="px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-2 backdrop-blur shadow-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <RefreshCw className="w-4 h-4" />
                                <span>{t.settings.reset}</span>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Settings Layout */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="lg:w-64 flex-shrink-0">
                        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-lg sticky top-24">
                            <div className="space-y-2">
                                {Object.entries(categoryInfo).map(([key, info]) => (
                                    <motion.button key={key} onClick={() => setActiveCategory(key as DosenSettingsCategory)} className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${activeCategory === key ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'}`} whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                                        <info.icon className="w-5 h-5" />
                                        <span className="text-sm font-medium">{info.title}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex-1">
                        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-lg min-h-[600px]">
                            {/* Category Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <motion.div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentCategory.gradient} flex items-center justify-center shadow-lg`} whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                                        <currentCategory.icon className="w-6 h-6 text-white" />
                                    </motion.div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentCategory.title}</h2>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{currentCategory.description}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Saving Indicator */}
                            <AnimatePresence>
                                {isSaving && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                        <RefreshCw className="h-4 w-4 animate-spin text-emerald-500" />
                                        <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">{t.common.saving}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Content */}
                            <AnimatePresence mode="wait">
                                <motion.div key={activeCategory} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                    {renderContent()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} className="fixed bottom-6 right-6 z-50">
                            <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 shadow-2xl">
                                {toast.type === 'success' ? <CheckCircle className="h-6 w-6 text-green-500" /> : <AlertCircle className="h-6 w-6 text-red-500" />}
                                <span className="text-gray-900 dark:text-white font-medium">{toast.message}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DosenLayout>
    );
}
