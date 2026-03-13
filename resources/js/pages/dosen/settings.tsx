/**
 * Dosen Enhanced Settings Page with i18n and Theme Support
 * Ultra Advanced UI/UX Glassmorphism
 */

import PengaturanIcon from '@/assets/admin/pengaturan/pengaturan.png';
import { SkeletonGrid } from '@/components/ui/skeleton-loader';
import { useTheme, type Theme } from '@/hooks/useTheme';
import { useTranslation, type Language } from '@/i18n';
import DosenLayout from '@/layouts/dosen-layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Bell,
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    Database,
    Download,
    Eye,
    Globe,
    Layout,
    Mail,
    Minimize2,
    Moon,
    Palette,
    Phone,
    QrCode,
    RefreshCw,
    Save,
    Shield,
    Sun,
    Trash2,
    Upload,
    Volume2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type ToastType = { type: 'success' | 'error'; message: string } | null;

interface DosenProps {
    dosen: { id: number; nama: string; nidn: string; email: string };
}

// Flat structure mimicking the state required by the new UX
interface Settings {
    language: Language;
    timezone: string;
    dateFormat: string;
    teachingMethod: string;
    sessionDuration: number;
    autoQR: boolean;
    emailNotif: { attendance: boolean; tasks: boolean; messages: boolean };
    pushNotif: { reminder: boolean; updates: boolean };
    notifSound: boolean;
    theme: Theme;
    sidebarPosition: string;
    compactMode: boolean;
    profileVisibility: string;
    showEmail: boolean;
    showPhone: boolean;
}

const defaultSettings: Settings = {
    language: 'id',
    timezone: 'Asia/Jakarta',
    dateFormat: 'DD/MM/YYYY',
    teachingMethod: 'hybrid',
    sessionDuration: 90,
    autoQR: true,
    emailNotif: { attendance: true, tasks: true, messages: true },
    pushNotif: { reminder: true, updates: false },
    notifSound: true,
    theme: 'system',
    sidebarPosition: 'left',
    compactMode: false,
    profileVisibility: 'students',
    showEmail: false,
    showPhone: false,
};

// Component for reusable generic glass card
const SettingsCard = ({
    title,
    icon: Icon,
    children,
    delay,
}: {
    title: string;
    icon: any;
    children: React.ReactNode;
    delay: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-[2.5rem] border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl md:p-8 dark:border-white/5 dark:bg-neutral-900/40"
    >
        <div className="mb-6 flex items-center gap-4 border-b border-gray-200/50 pb-4 dark:border-gray-800/50">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 text-fuchsia-600 shadow-lg transition-transform hover:scale-110 dark:text-fuchsia-400">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {title}
            </h3>
        </div>
        <div className="space-y-6">{children}</div>
    </motion.div>
);

// Switch toggle helper
const ToggleSwitch = ({
    checked,
    onChange,
    disabled = false,
}: {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-900 ${checked ? 'bg-fuchsia-500' : 'bg-gray-300 dark:bg-gray-700'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
        <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
    </button>
);

export default function DosenSettings({ dosen }: DosenProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<ToastType>(null);
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [initialSettings, setInitialSettings] =
        useState<Settings>(defaultSettings);
    const [hasChanges, setHasChanges] = useState(false);

    const { theme, setTheme } = useTheme();
    const t = useTranslation(settings.language);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            // Note: Adapting API response to unified flat settings format to match the massive UI update layout without breaking backend
            const response = await axios.get('/api/dosen/api/settings');
            const data = response.data;
            const mappedSettings: Settings = {
                ...defaultSettings,
                language: data.general?.language || 'id',
                timezone: data.general?.timezone || 'Asia/Jakarta',
                dateFormat: data.general?.dateFormat || 'DD/MM/YYYY',
            };
            setSettings(mappedSettings);
            setInitialSettings(mappedSettings);
        } catch (error) {
            // If failed to load backend mapping, we use defaults but allow them to use UI at least
            setSettings(defaultSettings);
            setInitialSettings(defaultSettings);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Deep compare to detect changes
    useEffect(() => {
        if (!isLoading) {
            const isChanged =
                JSON.stringify(settings) !== JSON.stringify(initialSettings);
            setHasChanges(isChanged);
            // Dynamic theme update for immediate preview
            if (
                settings.theme !== theme &&
                (settings.theme === 'light' ||
                    settings.theme === 'dark' ||
                    settings.theme === 'system')
            ) {
                setTheme(settings.theme);
            }
        }
    }, [settings, initialSettings, theme, isLoading, setTheme]);

    const updateSetting = <K extends keyof Settings>(
        key: K,
        value: Settings[K],
    ) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const updateNestedSetting = (
        category: 'emailNotif' | 'pushNotif',
        key: string,
        value: boolean,
    ) => {
        setSettings((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value,
            },
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Re-mapping flat settings to required backend schema logic
            await axios.post('/api/dosen/api/settings/general', {
                language: settings.language,
                timezone: settings.timezone,
                dateFormat: settings.dateFormat,
            });
            // (Extend further mapping here if the backend supports the rest of the flat structure configs)

            showToast('success', 'Pengaturan berhasil disimpan!');
            setInitialSettings(settings);
            setHasChanges(false);
        } catch (error: any) {
            showToast(
                'error',
                error.response?.data?.message || t.settings.saveError,
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleClearCache = async () => {
        try {
            await axios.post('/api/dosen/api/settings/reset');
            showToast('success', 'Cache berhasil dibersihkan.');
        } catch (e) {
            showToast('error', 'Gagal membersihkan cache.');
        }
    };

    if (isLoading) {
        return (
            <DosenLayout dosen={dosen}>
                <Head title="Pengaturan" />
                <div className="space-y-6 p-6">
                    <SkeletonGrid count={4} columns={2} />
                </div>
            </DosenLayout>
        );
    }

    return (
        <DosenLayout dosen={dosen}>
            <Head title="Pengaturan" />
            <div className="mx-auto max-w-7xl space-y-6 p-4 pb-32 md:space-y-10 md:p-8">
                {/* 1. HEADER SECTION */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 100,
                    }}
                    className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-600 p-8 text-white shadow-2xl md:p-12"
                >
                    {/* Animated Grain Noise Background */}
                    <div
                        className="absolute inset-0 opacity-20 mix-blend-overlay"
                        style={{
                            backgroundImage:
                                'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
                        }}
                    />

                    {/* Pulsating Rings & Floating Orbs */}
                    <div className="pointer-events-none absolute -top-20 -right-20 h-[500px] w-[500px] rounded-full bg-white/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-indigo-500/20 blur-3xl" />

                    <div className="relative z-10 flex flex-col items-center gap-6 text-center lg:flex-row lg:items-start lg:text-left">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 15 }}
                            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                delay: 0.2,
                            }}
                            className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                        >
                            <img
                                src={PengaturanIcon}
                                alt="Pengaturan"
                                className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                            />
                        </motion.div>
                        <div>
                            <motion.p
                                className="mb-1 text-xs font-semibold tracking-wider text-fuchsia-100 uppercase drop-shadow-sm md:text-sm"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                Preferensi Sistem
                            </motion.p>
                            <motion.h1
                                className="mb-2 text-3xl font-extrabold tracking-tight text-white drop-shadow-lg md:text-5xl"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                Kelola Pengaturan
                            </motion.h1>
                            <motion.p
                                className="max-w-2xl font-medium text-fuchsia-50 drop-shadow-sm md:text-lg"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                Sesuaikan pengalaman mengajar Anda agar lebih
                                nyaman dan terorganisir.
                            </motion.p>
                        </div>
                    </div>
                </motion.div>

                {/* 2. SETTINGS SECTIONS (GRID LAYOUT) */}
                <div className="grid gap-6 md:gap-8 lg:grid-cols-2 lg:items-start">
                    {/* A. PENGATURAN UMUM */}
                    <SettingsCard
                        title="Pengaturan Umum"
                        icon={Globe}
                        delay={0.1}
                    >
                        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-fuchsia-500/20 hover:bg-white/50 sm:flex-row sm:items-center dark:hover:bg-neutral-800/50">
                            <div>
                                <label className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                    <Globe className="h-4 w-4 text-fuchsia-500" />{' '}
                                    Bahasa
                                </label>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Pilih bahasa default antarmuka
                                </p>
                            </div>
                            <select
                                value={settings.language}
                                onChange={(e) =>
                                    updateSetting(
                                        'language',
                                        e.target.value as Language,
                                    )
                                }
                                className="w-full min-w-[150px] rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm focus:ring-2 focus:ring-fuchsia-500 sm:w-auto dark:border-gray-800 dark:bg-black/50 dark:text-white"
                            >
                                <option value="id">Bahasa Indonesia</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-fuchsia-500/20 hover:bg-white/50 sm:flex-row sm:items-center dark:hover:bg-neutral-800/50">
                            <div>
                                <label className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                    <Clock className="h-4 w-4 text-fuchsia-500" />{' '}
                                    Zona Waktu
                                </label>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Sesuai deteksi lokasi Anda
                                </p>
                            </div>
                            <select
                                value={settings.timezone}
                                onChange={(e) =>
                                    updateSetting('timezone', e.target.value)
                                }
                                className="w-full min-w-[150px] rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm focus:ring-2 focus:ring-fuchsia-500 sm:w-auto dark:border-gray-800 dark:bg-black/50 dark:text-white"
                            >
                                <option value="Asia/Jakarta">
                                    WIB (Jakarta)
                                </option>
                                <option value="Asia/Makassar">
                                    WITA (Makassar)
                                </option>
                                <option value="Asia/Jayapura">
                                    WIT (Jayapura)
                                </option>
                            </select>
                        </div>

                        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-fuchsia-500/20 hover:bg-white/50 sm:flex-row sm:items-center dark:hover:bg-neutral-800/50">
                            <div>
                                <label className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                    <Calendar className="h-4 w-4 text-fuchsia-500" />{' '}
                                    Format Tanggal
                                </label>
                            </div>
                            <select
                                value={settings.dateFormat}
                                onChange={(e) =>
                                    updateSetting('dateFormat', e.target.value)
                                }
                                className="w-full min-w-[150px] rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 shadow-sm focus:ring-2 focus:ring-fuchsia-500 sm:w-auto dark:border-gray-800 dark:bg-black/50 dark:text-white"
                            >
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                            </select>
                        </div>
                    </SettingsCard>

                    {/* B. PENGAJARAN */}
                    <SettingsCard
                        title="Pengajaran"
                        icon={BookOpen}
                        delay={0.2}
                    >
                        <div className="rounded-2xl border border-transparent p-4 transition-colors hover:border-fuchsia-500/20 hover:bg-white/50 dark:hover:bg-neutral-800/50">
                            <label className="mb-3 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                <BookOpen className="h-4 w-4 text-purple-500" />{' '}
                                Metode Pengajaran Default
                            </label>
                            <div className="mt-2 flex items-center gap-4">
                                {['Tatap Muka', 'Online', 'Hybrid'].map(
                                    (opt) => (
                                        <label
                                            key={opt}
                                            className="flex cursor-pointer items-center gap-2"
                                        >
                                            <input
                                                type="radio"
                                                name="teachingMethod"
                                                value={opt
                                                    .toLowerCase()
                                                    .replace(' ', '')}
                                                checked={
                                                    settings.teachingMethod ===
                                                    opt
                                                        .toLowerCase()
                                                        .replace(' ', '')
                                                }
                                                onChange={(e) =>
                                                    updateSetting(
                                                        'teachingMethod',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-4 w-4 border-gray-300 bg-white text-purple-600 focus:ring-purple-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-black dark:focus:ring-offset-gray-900"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {opt}
                                            </span>
                                        </label>
                                    ),
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-fuchsia-500/20 hover:bg-white/50 sm:flex-row sm:items-center dark:hover:bg-neutral-800/50">
                            <div>
                                <label className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                    <Clock className="h-4 w-4 text-purple-500" />{' '}
                                    Durasi Sesi Default
                                </label>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Waktu prasetel kelas Anda (menit)
                                </p>
                            </div>
                            <input
                                type="number"
                                min="30"
                                max="240"
                                step="10"
                                value={settings.sessionDuration}
                                onChange={(e) =>
                                    updateSetting(
                                        'sessionDuration',
                                        Number(e.target.value),
                                    )
                                }
                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-center font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-purple-500 sm:w-24 dark:border-gray-800 dark:bg-black/50 dark:text-white"
                            />
                        </div>

                        <div className="flex items-center justify-between gap-4 rounded-2xl border border-fuchsia-100 bg-fuchsia-50/50 p-4 transition-colors dark:border-fuchsia-900/30 dark:bg-fuchsia-900/10">
                            <div>
                                <label className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                    <QrCode className="h-4 w-4 text-purple-500" />{' '}
                                    Auto-generate QR Code
                                </label>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Otomatis buat QR code saat sesi dimulai
                                </p>
                            </div>
                            <ToggleSwitch
                                checked={settings.autoQR}
                                onChange={() =>
                                    updateSetting('autoQR', !settings.autoQR)
                                }
                            />
                        </div>
                    </SettingsCard>

                    {/* C. NOTIFIKASI */}
                    <SettingsCard title="Notifikasi" icon={Bell} delay={0.3}>
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                                <Mail className="h-4 w-4 text-pink-500" /> Email
                                Notifications
                            </h4>
                            <div className="space-y-4 pl-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Kehadiran mahasiswa
                                    </span>
                                    <ToggleSwitch
                                        checked={settings.emailNotif.attendance}
                                        onChange={() =>
                                            updateNestedSetting(
                                                'emailNotif',
                                                'attendance',
                                                !settings.emailNotif.attendance,
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Tugas baru dikumpulkan
                                    </span>
                                    <ToggleSwitch
                                        checked={settings.emailNotif.tasks}
                                        onChange={() =>
                                            updateNestedSetting(
                                                'emailNotif',
                                                'tasks',
                                                !settings.emailNotif.tasks,
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Pesan dari mahasiswa
                                    </span>
                                    <ToggleSwitch
                                        checked={settings.emailNotif.messages}
                                        onChange={() =>
                                            updateNestedSetting(
                                                'emailNotif',
                                                'messages',
                                                !settings.emailNotif.messages,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4 border-t border-gray-200/50 pt-6 dark:border-gray-800/50">
                            <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                                <Bell className="h-4 w-4 text-orange-500" />{' '}
                                Push Notifications
                            </h4>
                            <div className="space-y-4 pl-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Reminder sesi mengajar
                                    </span>
                                    <ToggleSwitch
                                        checked={settings.pushNotif.reminder}
                                        onChange={() =>
                                            updateNestedSetting(
                                                'pushNotif',
                                                'reminder',
                                                !settings.pushNotif.reminder,
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Update sistem
                                    </span>
                                    <ToggleSwitch
                                        checked={settings.pushNotif.updates}
                                        onChange={() =>
                                            updateNestedSetting(
                                                'pushNotif',
                                                'updates',
                                                !settings.pushNotif.updates,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-gray-200/50 p-2 pt-6 dark:border-gray-800/50">
                            <span className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                                <Volume2 className="h-4 w-4 text-indigo-500" />{' '}
                                Notification Sound
                            </span>
                            <ToggleSwitch
                                checked={settings.notifSound}
                                onChange={() =>
                                    updateSetting(
                                        'notifSound',
                                        !settings.notifSound,
                                    )
                                }
                            />
                        </div>
                    </SettingsCard>

                    {/* D. TAMPILAN */}
                    <SettingsCard title="Tampilan" icon={Layout} delay={0.4}>
                        <div className="space-y-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-fuchsia-500/20 hover:bg-white/50 dark:hover:bg-neutral-800/50">
                            <label className="mb-2 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                <Palette className="h-4 w-4 text-fuchsia-500" />{' '}
                                Tema Tampilan
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['light', 'dark', 'auto'] as Theme[]).map(
                                    (thm) => (
                                        <motion.button
                                            key={thm}
                                            onClick={() =>
                                                updateSetting('theme', thm)
                                            }
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${settings.theme === thm ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-900/20' : 'border-gray-200 bg-white text-gray-500 dark:border-gray-700 dark:bg-black/40 dark:text-gray-400'}`}
                                        >
                                            {thm === 'light' ? (
                                                <Sun className="mb-2 h-6 w-6" />
                                            ) : thm === 'dark' ? (
                                                <Moon className="mb-2 h-6 w-6" />
                                            ) : (
                                                <Globe className="mb-2 h-6 w-6" />
                                            )}
                                            <span className="text-xs font-bold capitalize">
                                                {thm}
                                            </span>
                                        </motion.button>
                                    ),
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-transparent p-4 transition-colors hover:border-fuchsia-500/20 hover:bg-white/50 dark:hover:bg-neutral-800/50">
                            <label className="mb-3 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                <Layout className="h-4 w-4 text-fuchsia-500" />{' '}
                                Sidebar Position
                            </label>
                            <div className="mt-2 flex items-center gap-6 pb-2">
                                {['Left', 'Right'].map((pos) => (
                                    <label
                                        key={pos}
                                        className="flex cursor-pointer items-center gap-2"
                                    >
                                        <input
                                            type="radio"
                                            value={pos.toLowerCase()}
                                            checked={
                                                settings.sidebarPosition ===
                                                pos.toLowerCase()
                                            }
                                            onChange={(e) =>
                                                updateSetting(
                                                    'sidebarPosition',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-5 w-5 border-gray-300 bg-white text-fuchsia-600 focus:ring-fuchsia-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-black dark:focus:ring-offset-gray-900"
                                        />
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            {pos}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-fuchsia-500/20 hover:bg-white/50 dark:hover:bg-neutral-800/50">
                            <div>
                                <label className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                                    <Minimize2 className="h-4 w-4 text-fuchsia-500" />{' '}
                                    Compact Mode
                                </label>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Tampilan tabel dan form lebih ringkas
                                </p>
                            </div>
                            <ToggleSwitch
                                checked={settings.compactMode}
                                onChange={() =>
                                    updateSetting(
                                        'compactMode',
                                        !settings.compactMode,
                                    )
                                }
                            />
                        </div>
                    </SettingsCard>

                    {/* E. PRIVASI */}
                    <SettingsCard title="Privasi" icon={Eye} delay={0.5}>
                        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-emerald-500/30 hover:bg-white/50 sm:flex-row sm:items-center dark:hover:bg-neutral-800/50">
                            <div>
                                <label className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                                    <Shield className="h-4 w-4 text-rose-500" />{' '}
                                    Visibilitas Profil
                                </label>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Siapa yang dapat melihat profil Anda
                                </p>
                            </div>
                            <select
                                value={settings.profileVisibility}
                                onChange={(e) =>
                                    updateSetting(
                                        'profileVisibility',
                                        e.target.value,
                                    )
                                }
                                className="w-full min-w-[150px] rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-900 shadow-sm focus:ring-2 focus:ring-rose-500 sm:w-auto dark:border-gray-800 dark:bg-black/50 dark:text-white"
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                                <option value="students">Students Only</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-emerald-500/30 hover:bg-white/50 dark:hover:bg-neutral-800/50">
                            <div>
                                <label className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                                    <Mail className="h-4 w-4 text-rose-500" />{' '}
                                    Tampilkan Email Pribadi
                                </label>
                            </div>
                            <ToggleSwitch
                                checked={settings.showEmail}
                                onChange={() =>
                                    updateSetting(
                                        'showEmail',
                                        !settings.showEmail,
                                    )
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between gap-4 rounded-2xl border border-transparent p-4 transition-colors hover:border-emerald-500/30 hover:bg-white/50 dark:hover:bg-neutral-800/50">
                            <div>
                                <label className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                                    <Phone className="h-4 w-4 text-rose-500" />{' '}
                                    Tampilkan Nomor Telepon
                                </label>
                            </div>
                            <ToggleSwitch
                                checked={settings.showPhone}
                                onChange={() =>
                                    updateSetting(
                                        'showPhone',
                                        !settings.showPhone,
                                    )
                                }
                            />
                        </div>
                    </SettingsCard>

                    {/* F. MANAJEMEN DATA */}
                    <SettingsCard
                        title="Manajemen Data"
                        icon={Database}
                        delay={0.6}
                    >
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="mb-4 flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white/50 p-5 text-left shadow-sm transition-all hover:bg-indigo-50 dark:border-gray-700 dark:bg-black/50 dark:hover:bg-indigo-900/20"
                        >
                            <div>
                                <p className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                    Export Semua Data
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Unduh pengaturan & riwayat (PDF, CSV)
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                                <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="mb-4 flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white/50 p-5 text-left shadow-sm transition-all hover:bg-indigo-50 dark:border-gray-700 dark:bg-black/50 dark:hover:bg-indigo-900/20"
                        >
                            <div>
                                <p className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                                    Import Data
                                </p>
                                <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Pulihkan preferensi yang diexport
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                                <Upload className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </motion.button>

                        <motion.button
                            onClick={handleClearCache}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex w-full items-center justify-between rounded-2xl border border-red-200 bg-red-50/50 p-5 text-left shadow-sm transition-all hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/10 dark:hover:bg-red-900/30"
                        >
                            <div>
                                <p className="flex items-center gap-2 text-lg font-bold text-red-600 dark:text-red-400">
                                    Hapus Cache
                                </p>
                                <p className="mt-1 text-sm font-medium text-red-600/70 dark:text-red-400/70">
                                    Mengatasi error tampilan UI sistem
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                        </motion.button>
                    </SettingsCard>
                </div>

                {/* 4. SAVE BUTTON - STICKY BAR */}
                <AnimatePresence>
                    {hasChanges && (
                        <motion.div
                            initial={{ opacity: 0, y: 100, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.9 }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 25,
                            }}
                            className="pointer-events-none fixed right-0 bottom-8 left-0 z-50 flex w-full justify-center px-4"
                        >
                            <div className="pointer-events-auto flex max-w-2xl min-w-[320px] items-center justify-between gap-6 rounded-3xl border border-white/20 bg-white/70 p-4 shadow-[0_10px_50px_-10px_rgba(232,121,249,0.3)] ring-1 ring-fuchsia-500/20 backdrop-blur-2xl dark:border-white/10 dark:bg-black/70">
                                <div className="hidden pl-2 sm:block">
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        Ada Perubahan Tertunda
                                    </p>
                                    <p className="text-xs font-medium tracking-wide text-fuchsia-600 dark:text-fuchsia-400">
                                        PENGATURAN BELUM TERSIMPAN
                                    </p>
                                </div>
                                <div className="flex w-full flex-1 items-center justify-end gap-3 sm:w-auto sm:flex-none">
                                    <motion.button
                                        onClick={() => {
                                            setSettings(initialSettings);
                                            setHasChanges(false);
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="rounded-2xl bg-gray-100/80 px-5 py-3 font-bold text-gray-600 shadow-sm transition-colors hover:bg-gray-200 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        Batal
                                    </motion.button>
                                    <motion.button
                                        disabled={isSaving}
                                        onClick={handleSave}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 px-8 py-3 font-bold text-white shadow-xl shadow-fuchsia-500/20 transition-all hover:shadow-fuchsia-500/40 sm:flex-none ${isSaving ? 'cursor-wait opacity-70' : ''}`}
                                    >
                                        {isSaving ? (
                                            <>
                                                <RefreshCw className="h-5 w-5 animate-spin" />
                                                Menyimpan..
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-5 w-5" />
                                                Simpan Perubahan
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Toast Subsystem */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -50, scale: 0.9 }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 25,
                            }}
                            className="fixed top-24 right-6 z-[60]"
                        >
                            <div
                                className={`flex items-center gap-4 rounded-2xl border border-white/20 px-6 py-4 shadow-2xl backdrop-blur-xl ${toast.type === 'success' ? 'bg-emerald-500/90 text-white shadow-emerald-500/20' : 'bg-rose-500/90 text-white shadow-rose-500/20'}`}
                            >
                                {toast.type === 'success' ? (
                                    <CheckCircle className="h-6 w-6 stroke-[2.5]" />
                                ) : (
                                    <AlertCircle className="h-6 w-6 stroke-[2.5]" />
                                )}
                                <span className="font-bold tracking-wide">
                                    {toast.message}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </DosenLayout>
    );
}
