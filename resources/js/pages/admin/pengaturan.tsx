import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    AlertTriangle,
    Bell,
    Clock3,
    Database,
    Eye,
    EyeOff,
    FileDown,
    FileUp,
    Fingerprint,
    HardDrive,
    History,
    KeyRound,
    Lock,
    MapPinned,
    Palette,
    RefreshCw,
    Search,
    Server,
    Settings,
    Shield,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Trash2,
    UserCog,
    Wand2,
    Zap,
} from 'lucide-react';
import { ChangeEvent, FormEvent, ReactNode, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from '@/components/settings/ThemeToggle';
import { AnimatedToggle } from '@/components/settings/AnimatedToggle';
import { SaveButton } from '@/components/settings/SaveButton';
import PengaturanIcon from '@/assets/admin/pengaturan/pengaturan.png';
import TotalIcon from '@/assets/admin/dashboard/total-icon.png';
import HistoryIcon from '@/assets/admin/audit/total-event.png';
import BackupIcon from '@/assets/admin/rekap-kehadiran/rekapan.png';
import LastBackupIcon from '@/assets/admin/notification-center/scheduled.png';

interface SettingsState {
    token_ttl_seconds: number;
    late_minutes: number;
    selfie_required: boolean;
    notify_rejected: boolean;
    notify_selfie_blur: boolean;
    geofence_lat: number;
    geofence_lng: number;
    geofence_radius_m: number;
    email_notifications: boolean;
    push_notifications: boolean;
    daily_report: boolean;
    weekly_report: boolean;
    max_login_attempts: number;
    lockout_duration: number;
    session_lifetime: number;
    ai_verification_enabled: boolean;
    face_match_threshold: number;
    blur_detection_enabled: boolean;
    auto_approve_verified: boolean;
    maintenance_mode: boolean;
}

interface SystemInfo {
    php_version: string;
    laravel_version: string;
    server_time: string;
    timezone: string;
    environment: string;
    debug_mode: boolean;
    db_connection: string;
    cache_driver: string;
    queue_driver: string;
    memory_limit: string;
    cache_size: number;
    log_size: number;
    database_size: number;
}

interface StorageInfo {
    total_space: number;
    free_space: number;
    used_percentage: number;
}

interface User {
    id: number;
    name: string;
    email: string;
    two_factor_confirmed_at?: string | null;
}

interface HistoryItem {
    id: number;
    setting_key: string;
    setting_label: string | null;
    old_value: string | null;
    new_value: string | null;
    change_type: string;
    ip_address: string | null;
    created_at: string | null;
    user: { id: number; name: string } | null;
}

interface BackupItem {
    id: number;
    backup_name: string;
    backup_description: string | null;
    file_size: number;
    settings_count: number;
    is_auto_backup: boolean;
    can_restore: boolean;
    created_at: string | null;
    creator: { id: number; name: string } | null;
}

interface Stats {
    total_settings: number;
    changes_today: number;
    backups_count: number;
    last_backup_at: string | null;
}

interface PageProps {
    settings: SettingsState;
    systemInfo: SystemInfo;
    storageInfo: StorageInfo;
    stats: Stats;
    recentHistory: HistoryItem[];
    backups: BackupItem[];
    auth: { user: User };
    flash?: { success?: string; error?: string };
}

type TabType = 'general' | 'security' | 'notifications' | 'advanced' | 'system';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.15,
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
            stiffness: 280,
            damping: 24,
        },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.97 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 260,
            damping: 24,
        },
    },
    hover: {
        y: -4,
        transition: {
            type: 'spring',
            stiffness: 340,
            damping: 18,
        },
    },
};

const tabs: Array<{ id: TabType; label: string; icon: typeof Settings; keywords: string[] }> = [
    { id: 'general', label: 'Umum', icon: Settings, keywords: ['token', 'ttl', 'selfie', 'geofence', 'tema'] },
    { id: 'security', label: 'Keamanan Akun', icon: ShieldCheck, keywords: ['password', '2fa', 'sesi', 'keamanan'] },
    { id: 'notifications', label: 'Notifikasi', icon: Bell, keywords: ['email', 'push', 'laporan'] },
    { id: 'advanced', label: 'Lanjutan', icon: Zap, keywords: ['ai', 'maintenance', 'threshold', 'login'] },
    { id: 'system', label: 'Sistem', icon: Server, keywords: ['server', 'storage', 'backup', 'history', 'cache'] },
];

export default function AdminPengaturan({ settings, systemInfo, storageInfo, stats, recentHistory, backups, auth, flash }: PageProps) {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showBackupDialog, setShowBackupDialog] = useState(false);
    const [showHistoryDialog, setShowHistoryDialog] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { theme, resolvedTheme, setTheme } = useTheme();
    const importInputRef = useRef<HTMLInputElement | null>(null);

    const generalForm = useForm({
        token_ttl_seconds: settings.token_ttl_seconds,
        late_minutes: settings.late_minutes,
        selfie_required: settings.selfie_required,
        notify_rejected: settings.notify_rejected,
        notify_selfie_blur: settings.notify_selfie_blur,
    });

    const geofenceForm = useForm({
        geofence_lat: settings.geofence_lat,
        geofence_lng: settings.geofence_lng,
        geofence_radius_m: settings.geofence_radius_m,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const notificationForm = useForm({
        email_notifications: settings.email_notifications,
        push_notifications: settings.push_notifications,
        daily_report: settings.daily_report,
        weekly_report: settings.weekly_report,
    });

    const advancedForm = useForm({
        max_login_attempts: settings.max_login_attempts,
        lockout_duration: settings.lockout_duration,
        session_lifetime: settings.session_lifetime,
        ai_verification_enabled: settings.ai_verification_enabled,
        face_match_threshold: settings.face_match_threshold,
        blur_detection_enabled: settings.blur_detection_enabled,
        auto_approve_verified: settings.auto_approve_verified,
        maintenance_mode: settings.maintenance_mode,
    });

    const backupForm = useForm({
        name: '',
        description: '',
    });

    const search = searchQuery.trim().toLowerCase();
    const matchesSearch = (...terms: Array<string | number | boolean | null | undefined>) =>
        search.length === 0 || terms.some((term) => String(term ?? '').toLowerCase().includes(search));

    const currentTabInfo = useMemo(() => tabs.find((tab) => tab.id === activeTab) ?? tabs[0], [activeTab]);
    const is2FAEnabled = auth?.user?.two_factor_confirmed_at != null;
    const flashToast = flash?.success
        ? { type: 'success' as const, message: flash.success }
        : flash?.error
            ? { type: 'error' as const, message: flash.error }
            : null;
    const activeToast = toast ?? flashToast;

    const pushToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        window.setTimeout(() => setToast(null), 3200);
    };

    const quickStats = [
        {
            key: 'total',
            label: 'Total Pengaturan',
            value: stats.total_settings.toString(),
            sub: 'field aktif di sistem',
            image: TotalIcon,
            tone: 'from-blue-500 to-cyan-600',
            glow: 'bg-blue-500',
        },
        {
            key: 'changes',
            label: 'Perubahan Hari Ini',
            value: stats.changes_today.toString(),
            sub: 'activity log terbaru',
            image: HistoryIcon,
            tone: 'from-violet-500 to-fuchsia-600',
            glow: 'bg-violet-500',
        },
        {
            key: 'backups',
            label: 'Total Backup',
            value: stats.backups_count.toString(),
            sub: 'snapshot tersimpan',
            image: BackupIcon,
            tone: 'from-emerald-500 to-teal-600',
            glow: 'bg-emerald-500',
        },
        {
            key: 'last_backup',
            label: 'Backup Terakhir',
            value: stats.last_backup_at ? formatDate(stats.last_backup_at, 'date') : 'Belum ada',
            sub: stats.last_backup_at ? formatDate(stats.last_backup_at, 'time') : 'Buat backup pertama',
            image: LastBackupIcon,
            tone: 'from-amber-500 to-orange-600',
            glow: 'bg-amber-500',
        },
    ];

    const visibleCount = (() => {
        const matcher = (keywords: string[]) => matchesSearch(...keywords);
        switch (activeTab) {
            case 'general':
                return [
                    matcher(['token ttl', 'late minutes', 'selfie required', 'keamanan sesi']),
                    matcher(['geofence', 'radius', 'latitude', 'longitude']),
                    matcher(['theme', 'tema', 'appearance', 'dark mode']),
                ].filter(Boolean).length;
            case 'security':
                return [
                    matcher(['password', 'kata sandi', 'akun']),
                    matcher(['2fa', 'dua faktor', 'sesi aktif', 'profil']),
                ].filter(Boolean).length;
            case 'notifications':
                return [
                    matcher(['notifikasi', 'email', 'push']),
                    matcher(['laporan', 'daily', 'weekly']),
                ].filter(Boolean).length;
            case 'advanced':
                return [
                    matcher(['max login', 'lockout', 'session lifetime', 'keamanan login']),
                    matcher(['ai verification', 'face match', 'blur detection', 'verifikasi ai']),
                    matcher(['maintenance', 'mode maintenance']),
                ].filter(Boolean).length;
            case 'system':
                return [
                    matcher(['server', 'system info', 'php', 'laravel', 'database']),
                    matcher(['storage', 'disk', 'cache size', 'log size']),
                    matcher(['backup', 'restore', 'import', 'export']),
                    matcher(['history', 'activity log', 'riwayat']),
                    matcher(['cache clear', 'optimize', 'utility']),
                ].filter(Boolean).length;
            default:
                return 0;
        }
    })();

    const submitGeneral = (e: FormEvent) => {
        e.preventDefault();
        generalForm.patch('/admin/pengaturan', {
            preserveScroll: true,
            onSuccess: () => pushToast('success', 'Pengaturan umum berhasil disimpan.'),
            onError: () => pushToast('error', 'Gagal menyimpan pengaturan umum.'),
        });
    };

    const submitGeofence = (e: FormEvent) => {
        e.preventDefault();
        geofenceForm.patch('/admin/pengaturan/geofence', {
            preserveScroll: true,
            onSuccess: () => pushToast('success', 'Pengaturan geofence berhasil disimpan.'),
            onError: () => pushToast('error', 'Gagal menyimpan pengaturan geofence.'),
        });
    };

    const submitPassword = (e: FormEvent) => {
        e.preventDefault();
        passwordForm.put('/settings/password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                pushToast('success', 'Password berhasil diperbarui.');
            },
            onError: () => pushToast('error', 'Gagal memperbarui password.'),
        });
    };

    const submitNotifications = (e: FormEvent) => {
        e.preventDefault();
        notificationForm.patch('/admin/pengaturan/notifications', {
            preserveScroll: true,
            onSuccess: () => pushToast('success', 'Pengaturan notifikasi berhasil disimpan.'),
            onError: () => pushToast('error', 'Gagal menyimpan pengaturan notifikasi.'),
        });
    };

    const submitAdvanced = (e: FormEvent) => {
        e.preventDefault();
        advancedForm.patch('/admin/pengaturan/advanced', {
            preserveScroll: true,
            onSuccess: () => pushToast('success', 'Pengaturan lanjutan berhasil disimpan.'),
            onError: () => pushToast('error', 'Gagal menyimpan pengaturan lanjutan.'),
        });
    };

    const handleCreateBackup = (e: FormEvent) => {
        e.preventDefault();
        backupForm.post('/admin/pengaturan/backup', {
            preserveScroll: true,
            onSuccess: () => {
                backupForm.reset();
                setShowBackupDialog(false);
                pushToast('success', 'Backup pengaturan berhasil dibuat.');
            },
            onError: () => pushToast('error', 'Gagal membuat backup.'),
        });
    };

    const handleRestoreBackup = (backupId: number) => {
        if (! window.confirm('Restore backup ini akan mengganti pengaturan saat ini. Lanjutkan?')) {
            return;
        }

        router.post(`/admin/pengaturan/backup/${backupId}/restore`, {}, {
            preserveScroll: true,
            onSuccess: () => pushToast('success', 'Backup berhasil di-restore.'),
            onError: () => pushToast('error', 'Gagal restore backup.'),
        });
    };

    const handleDeleteBackup = (backupId: number) => {
        if (! window.confirm('Hapus backup ini?')) {
            return;
        }

        router.delete(`/admin/pengaturan/backup/${backupId}`, {
            preserveScroll: true,
            onSuccess: () => pushToast('success', 'Backup berhasil dihapus.'),
            onError: () => pushToast('error', 'Gagal menghapus backup.'),
        });
    };

    const handleImportClick = () => importInputRef.current?.click();

    const handleImportFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (! file) {
            return;
        }

        router.post('/admin/pengaturan/import', { file }, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => pushToast('success', 'Pengaturan berhasil diimport.'),
            onError: () => pushToast('error', 'Gagal mengimport pengaturan.'),
            onFinish: () => {
                if (importInputRef.current) {
                    importInputRef.current.value = '';
                }
            },
        });
    };

    const clearCache = () => {
        router.post('/admin/pengaturan/clear-cache', {}, {
            preserveScroll: true,
            onSuccess: () => pushToast('success', 'Cache berhasil dibersihkan.'),
            onError: () => pushToast('error', 'Gagal membersihkan cache.'),
        });
    };

    const optimizeSystem = () => {
        router.post('/admin/pengaturan/optimize', {}, {
            preserveScroll: true,
            onSuccess: () => pushToast('success', 'Sistem berhasil dioptimasi.'),
            onError: () => pushToast('error', 'Gagal mengoptimasi sistem.'),
        });
    };

    return (
        <AppLayout>
            <Head title="Pengaturan Sistem" />

            <motion.div className="space-y-8 p-6" initial="hidden" animate="visible" variants={containerVariants}>
                <input
                    ref={importInputRef}
                    type="file"
                    accept="application/json,.json,text/plain"
                    className="hidden"
                    onChange={handleImportFile}
                />

                <AnimatePresence>
                    {activeToast && (
                        <motion.div
                            initial={{ opacity: 0, y: -16, x: 20 }}
                            animate={{ opacity: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, y: -16, x: 20 }}
                            className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md ${
                                activeToast.type === 'success'
                                    ? 'border-emerald-200 bg-emerald-500/10 text-emerald-600 dark:border-emerald-800 dark:text-emerald-300'
                                    : 'border-red-200 bg-red-500/10 text-red-600 dark:border-red-800 dark:text-red-300'
                            }`}
                        >
                            {activeToast.type === 'success' ? <Sparkles className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                            <span className="text-sm font-semibold">{activeToast.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.section variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-2xl">
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-white/10" />
                    <div className="absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10 space-y-6">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div className="flex items-center gap-5">
                                <img src={PengaturanIcon} alt="Pengaturan" className="h-20 w-20 shrink-0 object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.35)]" />
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-100">Admin Control Center</p>
                                    <h1 className="mt-1 text-3xl font-black tracking-tight">Pengaturan Sistem</h1>
                                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100/90">
                                        Kelola konfigurasi absensi, notifikasi, keamanan, dan utility sistem dari satu halaman yang lebih rapi.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:w-[440px]">
                                <HeaderChip
                                    icon={Clock3}
                                    label="Server Time"
                                    value={systemInfo.server_time}
                                />
                                <HeaderChip
                                    icon={Server}
                                    label="Environment"
                                    value={String(systemInfo.environment).toUpperCase()}
                                />
                                <HeaderChip
                                    icon={Database}
                                    label="DB Driver"
                                    value={systemInfo.db_connection}
                                />
                                <HeaderChip
                                    icon={Shield}
                                    label="Debug Mode"
                                    value={systemInfo.debug_mode ? 'Aktif' : 'Nonaktif'}
                                />
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section variants={itemVariants} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {quickStats.map((card, index) => (
                        <motion.div
                            key={card.key}
                            variants={cardVariants}
                            whileHover="hover"
                            custom={index}
                            className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/75 p-5 shadow-xl backdrop-blur-xl dark:border-neutral-800/70 dark:bg-neutral-900/75"
                        >
                            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.tone}`} />
                            <div className={`absolute right-4 top-4 h-16 w-16 rounded-full ${card.glow} opacity-10 blur-2xl`} />
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-neutral-400">{card.label}</p>
                                    <p className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{card.value}</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">{card.sub}</p>
                                </div>
                                <img src={card.image} alt={card.label} className="h-14 w-14 shrink-0 object-contain drop-shadow-md" />
                            </div>
                        </motion.div>
                    ))}
                </motion.section>

                <motion.section variants={itemVariants} className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="relative w-full max-w-xl">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Cari kata kunci pengaturan, mis. geofence, AI, backup..."
                            className="h-12 rounded-2xl border-slate-200 bg-white pl-12 pr-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" className="rounded-2xl" onClick={() => setShowHistoryDialog(true)}>
                            <History className="mr-2 h-4 w-4" />Riwayat
                        </Button>
                        <Button variant="outline" className="rounded-2xl" onClick={() => setShowBackupDialog(true)}>
                            <Database className="mr-2 h-4 w-4" />Backup
                        </Button>
                        <Button variant="outline" className="rounded-2xl" onClick={() => window.location.assign('/admin/pengaturan/export')}>
                            <FileDown className="mr-2 h-4 w-4" />Export
                        </Button>
                        <Button variant="outline" className="rounded-2xl" onClick={handleImportClick}>
                            <FileUp className="mr-2 h-4 w-4" />Import
                        </Button>
                    </div>
                </motion.section>

                <motion.section variants={itemVariants} className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200/70 bg-white/70 p-1.5 shadow-lg backdrop-blur-xl dark:border-neutral-800/70 dark:bg-neutral-900/70">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const isSearchHit = search.length === 0 || tab.keywords.some((keyword) => keyword.includes(search));

                        return (
                            <motion.button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-all ${
                                    isActive
                                        ? 'text-indigo-600 dark:text-indigo-300'
                                        : 'text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="active-settings-tab"
                                        className="absolute inset-0 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
                                        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                    {search.length > 0 && isSearchHit && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                                </span>
                            </motion.button>
                        );
                    })}
                </motion.section>

                <motion.section variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-5 py-4 shadow-lg backdrop-blur-xl dark:border-neutral-800/70 dark:bg-neutral-900/70">
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{currentTabInfo.label}</p>
                        <p className="text-xs text-slate-500 dark:text-neutral-400">
                            {search.length > 0 ? `${visibleCount} section cocok untuk pencarian "${searchQuery}"` : 'Kelola pengaturan per kategori dengan panel yang lebih ringkas.'}
                        </p>
                    </div>
                    {search.length > 0 && (
                        <Button variant="ghost" className="rounded-xl text-slate-600 dark:text-neutral-300" onClick={() => setSearchQuery('')}>
                            Reset Pencarian
                        </Button>
                    )}
                </motion.section>

                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.24 }} className="grid gap-6 lg:grid-cols-2">
                        {activeTab === 'general' && (
                            <>
                                {matchesSearch('keamanan sesi', 'token', 'ttl', 'terlambat', 'selfie', 'rejected', 'blur') && (
                                    <motion.div variants={cardVariants} whileHover="hover">
                                        <SectionCard
                                            icon={Shield}
                                            title="Keamanan Sesi"
                                            description="Atur durasi token, toleransi keterlambatan, dan validasi selfie di alur absensi."
                                            tone="indigo"
                                        >
                                            <form onSubmit={submitGeneral} className="space-y-5">
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <FieldWrapper label="Token TTL (detik)" hint="Valid 30-600 detik">
                                                        <Input
                                                            type="number"
                                                            value={generalForm.data.token_ttl_seconds}
                                                            onChange={(event) => generalForm.setData('token_ttl_seconds', parseInt(event.target.value || '0', 10))}
                                                            className="mt-2 rounded-xl"
                                                        />
                                                        <InputError message={generalForm.errors.token_ttl_seconds} />
                                                    </FieldWrapper>
                                                    <FieldWrapper label="Toleransi Terlambat (menit)" hint="Batas status terlambat">
                                                        <Input
                                                            type="number"
                                                            value={generalForm.data.late_minutes}
                                                            onChange={(event) => generalForm.setData('late_minutes', parseInt(event.target.value || '0', 10))}
                                                            className="mt-2 rounded-xl"
                                                        />
                                                        <InputError message={generalForm.errors.late_minutes} />
                                                    </FieldWrapper>
                                                </div>

                                                <div className="space-y-4 rounded-3xl border border-slate-200/70 bg-slate-50/70 p-5 dark:border-neutral-800 dark:bg-black/20">
                                                    <AnimatedToggle
                                                        checked={generalForm.data.selfie_required}
                                                        onChange={() => generalForm.setData('selfie_required', !generalForm.data.selfie_required)}
                                                        label="Wajib selfie saat absen"
                                                        description="Mahasiswa harus mengirim selfie sebelum absensi diproses."
                                                    />
                                                    <div className="h-px bg-slate-200/70 dark:bg-neutral-800" />
                                                    <AnimatedToggle
                                                        checked={generalForm.data.notify_rejected}
                                                        onChange={() => generalForm.setData('notify_rejected', !generalForm.data.notify_rejected)}
                                                        label="Notifikasi absen ditolak"
                                                        description="Admin atau user menerima info saat validasi absensi ditolak."
                                                    />
                                                    <div className="h-px bg-slate-200/70 dark:bg-neutral-800" />
                                                    <AnimatedToggle
                                                        checked={generalForm.data.notify_selfie_blur}
                                                        onChange={() => generalForm.setData('notify_selfie_blur', !generalForm.data.notify_selfie_blur)}
                                                        label="Notifikasi selfie blur"
                                                        description="Kirim alert saat kualitas selfie tidak memenuhi syarat."
                                                    />
                                                </div>

                                                <div className="flex justify-end">
                                                    <SaveButton onClick={() => submitGeneral({ preventDefault: () => undefined } as FormEvent)} isSaving={generalForm.processing} hasChanges={generalForm.isDirty} disabled={!generalForm.isDirty} />
                                                </div>
                                            </form>
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {matchesSearch('geofence', 'latitude', 'longitude', 'radius', 'zona') && (
                                    <motion.div variants={cardVariants} whileHover="hover">
                                        <SectionCard
                                            icon={MapPinned}
                                            title="Geofence Kampus"
                                            description="Kelola titik pusat dan radius validasi lokasi absensi kampus."
                                            tone="emerald"
                                        >
                                            <form onSubmit={submitGeofence} className="space-y-5">
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <FieldWrapper label="Latitude" hint="Contoh: -6.3460957">
                                                        <Input
                                                            value={geofenceForm.data.geofence_lat}
                                                            onChange={(event) => geofenceForm.setData('geofence_lat', Number(event.target.value))}
                                                            className="mt-2 rounded-xl"
                                                        />
                                                        <InputError message={geofenceForm.errors.geofence_lat} />
                                                    </FieldWrapper>
                                                    <FieldWrapper label="Longitude" hint="Contoh: 106.6915144">
                                                        <Input
                                                            value={geofenceForm.data.geofence_lng}
                                                            onChange={(event) => geofenceForm.setData('geofence_lng', Number(event.target.value))}
                                                            className="mt-2 rounded-xl"
                                                        />
                                                        <InputError message={geofenceForm.errors.geofence_lng} />
                                                    </FieldWrapper>
                                                </div>

                                                <FieldWrapper label="Radius Geofence (meter)" hint="Minimum 10m, maksimum 5000m">
                                                    <Input
                                                        type="number"
                                                        value={geofenceForm.data.geofence_radius_m}
                                                        onChange={(event) => geofenceForm.setData('geofence_radius_m', parseInt(event.target.value || '0', 10))}
                                                        className="mt-2 rounded-xl"
                                                    />
                                                    <InputError message={geofenceForm.errors.geofence_radius_m} />
                                                </FieldWrapper>

                                                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-4 text-sm text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/20 dark:text-emerald-300">
                                                    Radius aktif saat ini: <span className="font-bold">{geofenceForm.data.geofence_radius_m} meter</span>
                                                </div>

                                                <div className="flex justify-end">
                                                    <SaveButton onClick={() => submitGeofence({ preventDefault: () => undefined } as FormEvent)} isSaving={geofenceForm.processing} hasChanges={geofenceForm.isDirty} disabled={!geofenceForm.isDirty} />
                                                </div>
                                            </form>
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {matchesSearch('tema', 'appearance', 'dark mode', 'tampilan', 'theme') && (
                                    <motion.div variants={cardVariants} whileHover="hover" className="lg:col-span-2">
                                        <SectionCard
                                            icon={Palette}
                                            title="Tema Tampilan"
                                            description="Kontrol mode tampilan antarmuka admin tanpa meninggalkan halaman pengaturan."
                                            tone="violet"
                                        >
                                            <ThemeToggle value={theme} resolvedTheme={resolvedTheme} onChange={setTheme} />
                                        </SectionCard>
                                    </motion.div>
                                )}
                            </>
                        )}

                        {activeTab === 'security' && (
                            <>
                                {matchesSearch('password', 'akun', 'ganti password', 'kata sandi') && (
                                    <motion.div variants={cardVariants} whileHover="hover">
                                        <SectionCard
                                            icon={KeyRound}
                                            title="Ganti Password"
                                            description="Perbarui kata sandi admin tanpa keluar dari dashboard."
                                            tone="amber"
                                        >
                                            <form onSubmit={submitPassword} className="space-y-4">
                                                {[
                                                    {
                                                        key: 'current_password' as const,
                                                        label: 'Password Saat Ini',
                                                        visible: showCurrentPassword,
                                                        setVisible: setShowCurrentPassword,
                                                    },
                                                    {
                                                        key: 'password' as const,
                                                        label: 'Password Baru',
                                                        visible: showNewPassword,
                                                        setVisible: setShowNewPassword,
                                                    },
                                                    {
                                                        key: 'password_confirmation' as const,
                                                        label: 'Konfirmasi Password',
                                                        visible: showConfirmPassword,
                                                        setVisible: setShowConfirmPassword,
                                                    },
                                                ].map((field) => (
                                                    <FieldWrapper key={field.key} label={field.label}>
                                                        <div className="relative mt-2">
                                                            <Input
                                                                type={field.visible ? 'text' : 'password'}
                                                                value={passwordForm.data[field.key]}
                                                                onChange={(event) => passwordForm.setData(field.key, event.target.value)}
                                                                className="rounded-xl pr-11"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => field.setVisible(!field.visible)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-neutral-200"
                                                            >
                                                                {field.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </button>
                                                        </div>
                                                        <InputError message={passwordForm.errors[field.key]} />
                                                    </FieldWrapper>
                                                ))}

                                                <div className="flex justify-end">
                                                    <SaveButton onClick={() => submitPassword({ preventDefault: () => undefined } as FormEvent)} isSaving={passwordForm.processing} hasChanges={passwordForm.isDirty} disabled={!passwordForm.isDirty} />
                                                </div>
                                            </form>
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {matchesSearch('2fa', 'dua faktor', 'sesi aktif', 'profile', 'profil') && (
                                    <motion.div variants={cardVariants} whileHover="hover">
                                        <SectionCard
                                            icon={Fingerprint}
                                            title="Proteksi Akun"
                                            description="Pantau status 2FA dan akses cepat ke pengelolaan profil admin."
                                            tone="blue"
                                        >
                                            <div className="space-y-4">
                                                <div className={`rounded-2xl border p-4 ${is2FAEnabled ? 'border-emerald-200 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/20 dark:text-emerald-300' : 'border-amber-200 bg-amber-50/70 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-300'}`}>
                                                    <div className="flex items-start gap-3">
                                                        {is2FAEnabled ? <Shield className="mt-0.5 h-5 w-5" /> : <AlertTriangle className="mt-0.5 h-5 w-5" />}
                                                        <div>
                                                            <p className="font-bold">{is2FAEnabled ? 'Two-factor authentication aktif' : 'Two-factor authentication belum aktif'}</p>
                                                            <p className="mt-1 text-sm opacity-90">
                                                                {is2FAEnabled
                                                                    ? 'Akun admin sudah memiliki lapisan verifikasi tambahan.'
                                                                    : 'Aktifkan 2FA untuk mengurangi risiko akses tidak sah ke dashboard admin.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-neutral-800 dark:bg-black/20">
                                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-neutral-400">Sesi Aktif</p>
                                                    <div className="mt-3 flex items-center justify-between gap-3">
                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-white">Browser Ini</p>
                                                            <p className="text-sm text-slate-500 dark:text-neutral-400">Session admin sedang aktif</p>
                                                        </div>
                                                        <Badge className="border-0 bg-emerald-500 text-white">AKTIF</Badge>
                                                    </div>
                                                </div>

                                                <Link href="/admin/profile" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800">
                                                    <UserCog className="h-4 w-4" />Kelola Profil & 2FA
                                                </Link>
                                            </div>
                                        </SectionCard>
                                    </motion.div>
                                )}
                            </>
                        )}

                        {activeTab === 'notifications' && (
                            <>
                                {matchesSearch('notifikasi', 'email', 'push', 'browser') && (
                                    <motion.div variants={cardVariants} whileHover="hover">
                                        <SectionCard
                                            icon={Bell}
                                            title="Kanal Notifikasi"
                                            description="Pilih kanal pengiriman notifikasi utama untuk dashboard admin."
                                            tone="cyan"
                                        >
                                            <form onSubmit={submitNotifications} className="space-y-4">
                                                <div className="space-y-4 rounded-3xl border border-slate-200/70 bg-slate-50/70 p-5 dark:border-neutral-800 dark:bg-black/20">
                                                    <AnimatedToggle
                                                        checked={notificationForm.data.email_notifications}
                                                        onChange={() => notificationForm.setData('email_notifications', !notificationForm.data.email_notifications)}
                                                        label="Notifikasi Email"
                                                        description="Kirim update penting ke email admin."
                                                    />
                                                    <div className="h-px bg-slate-200/70 dark:bg-neutral-800" />
                                                    <AnimatedToggle
                                                        checked={notificationForm.data.push_notifications}
                                                        onChange={() => notificationForm.setData('push_notifications', !notificationForm.data.push_notifications)}
                                                        label="Push Notification"
                                                        description="Tampilkan alert real-time di browser saat ada event penting."
                                                    />
                                                </div>

                                                <div className="flex justify-end">
                                                    <SaveButton onClick={() => submitNotifications({ preventDefault: () => undefined } as FormEvent)} isSaving={notificationForm.processing} hasChanges={notificationForm.isDirty} disabled={!notificationForm.isDirty} />
                                                </div>
                                            </form>
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {matchesSearch('laporan', 'daily report', 'weekly report', 'rekap') && (
                                    <motion.div variants={cardVariants} whileHover="hover">
                                        <SectionCard
                                            icon={Smartphone}
                                            title="Laporan Otomatis"
                                            description="Aktifkan ringkasan berkala untuk evaluasi operasional."
                                            tone="teal"
                                        >
                                            <form onSubmit={submitNotifications} className="space-y-4">
                                                <div className="space-y-4 rounded-3xl border border-teal-200/70 bg-teal-50/60 p-5 dark:border-teal-900/50 dark:bg-teal-950/20">
                                                    <AnimatedToggle
                                                        checked={notificationForm.data.daily_report}
                                                        onChange={() => notificationForm.setData('daily_report', !notificationForm.data.daily_report)}
                                                        label="Laporan Harian"
                                                        description="Kirim ringkasan aktivitas harian ke admin."
                                                    />
                                                    <div className="h-px bg-teal-200/70 dark:bg-teal-900/60" />
                                                    <AnimatedToggle
                                                        checked={notificationForm.data.weekly_report}
                                                        onChange={() => notificationForm.setData('weekly_report', !notificationForm.data.weekly_report)}
                                                        label="Laporan Mingguan"
                                                        description="Kirim rekap mingguan untuk tren operasional dan absensi."
                                                    />
                                                </div>

                                                <div className="flex justify-end">
                                                    <SaveButton onClick={() => submitNotifications({ preventDefault: () => undefined } as FormEvent)} isSaving={notificationForm.processing} hasChanges={notificationForm.isDirty} disabled={!notificationForm.isDirty} />
                                                </div>
                                            </form>
                                        </SectionCard>
                                    </motion.div>
                                )}
                            </>
                        )}

                        {activeTab === 'advanced' && (
                            <>
                                {matchesSearch('max login', 'lockout', 'session lifetime', 'keamanan login') && (
                                    <motion.div variants={cardVariants} whileHover="hover">
                                        <SectionCard
                                            icon={Lock}
                                            title="Keamanan Login"
                                            description="Konfigurasi proteksi brute-force dan durasi sesi admin."
                                            tone="rose"
                                        >
                                            <form onSubmit={submitAdvanced} className="space-y-5">
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <FieldWrapper label="Maksimum Login Gagal">
                                                        <Input
                                                            type="number"
                                                            value={advancedForm.data.max_login_attempts}
                                                            onChange={(event) => advancedForm.setData('max_login_attempts', parseInt(event.target.value || '0', 10))}
                                                            className="mt-2 rounded-xl"
                                                        />
                                                        <InputError message={advancedForm.errors.max_login_attempts} />
                                                    </FieldWrapper>
                                                    <FieldWrapper label="Durasi Lockout (menit)">
                                                        <Input
                                                            type="number"
                                                            value={advancedForm.data.lockout_duration}
                                                            onChange={(event) => advancedForm.setData('lockout_duration', parseInt(event.target.value || '0', 10))}
                                                            className="mt-2 rounded-xl"
                                                        />
                                                        <InputError message={advancedForm.errors.lockout_duration} />
                                                    </FieldWrapper>
                                                </div>

                                                <FieldWrapper label="Session Lifetime (menit)">
                                                    <Input
                                                        type="number"
                                                        value={advancedForm.data.session_lifetime}
                                                        onChange={(event) => advancedForm.setData('session_lifetime', parseInt(event.target.value || '0', 10))}
                                                        className="mt-2 rounded-xl"
                                                    />
                                                    <InputError message={advancedForm.errors.session_lifetime} />
                                                </FieldWrapper>

                                                <div className="flex justify-end">
                                                    <SaveButton onClick={() => submitAdvanced({ preventDefault: () => undefined } as FormEvent)} isSaving={advancedForm.processing} hasChanges={advancedForm.isDirty} disabled={!advancedForm.isDirty} />
                                                </div>
                                            </form>
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {matchesSearch('ai', 'verifikasi ai', 'blur', 'face match', 'threshold') && (
                                    <motion.div variants={cardVariants} whileHover="hover">
                                        <SectionCard
                                            icon={Wand2}
                                            title="Verifikasi AI"
                                            description="Atur engine verifikasi wajah, threshold kecocokan, dan auto-approval."
                                            tone="violet"
                                        >
                                            <form onSubmit={submitAdvanced} className="space-y-5">
                                                <div className="space-y-4 rounded-3xl border border-violet-200/70 bg-violet-50/60 p-5 dark:border-violet-900/50 dark:bg-violet-950/20">
                                                    <AnimatedToggle
                                                        checked={advancedForm.data.ai_verification_enabled}
                                                        onChange={() => advancedForm.setData('ai_verification_enabled', !advancedForm.data.ai_verification_enabled)}
                                                        label="Aktifkan Verifikasi AI"
                                                        description="Mesin AI aktif untuk membantu validasi keaslian wajah."
                                                    />
                                                    <div className="h-px bg-violet-200/70 dark:bg-violet-900/60" />
                                                    <AnimatedToggle
                                                        checked={advancedForm.data.blur_detection_enabled}
                                                        onChange={() => advancedForm.setData('blur_detection_enabled', !advancedForm.data.blur_detection_enabled)}
                                                        label="Deteksi Blur"
                                                        description="Tolak selfie yang terlalu buram atau tidak fokus."
                                                    />
                                                    <div className="h-px bg-violet-200/70 dark:bg-violet-900/60" />
                                                    <AnimatedToggle
                                                        checked={advancedForm.data.auto_approve_verified}
                                                        onChange={() => advancedForm.setData('auto_approve_verified', !advancedForm.data.auto_approve_verified)}
                                                        label="Auto Approve Verified"
                                                        description="Otomatis setujui hasil dengan confidence yang memenuhi syarat."
                                                    />
                                                </div>

                                                <FieldWrapper label="Face Match Threshold (%)">
                                                    <Input
                                                        type="number"
                                                        value={advancedForm.data.face_match_threshold}
                                                        onChange={(event) => advancedForm.setData('face_match_threshold', parseInt(event.target.value || '0', 10))}
                                                        className="mt-2 rounded-xl"
                                                    />
                                                    <InputError message={advancedForm.errors.face_match_threshold} />
                                                </FieldWrapper>

                                                <div className="flex justify-end">
                                                    <SaveButton onClick={() => submitAdvanced({ preventDefault: () => undefined } as FormEvent)} isSaving={advancedForm.processing} hasChanges={advancedForm.isDirty} disabled={!advancedForm.isDirty} />
                                                </div>
                                            </form>
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {matchesSearch('maintenance', 'mode maintenance', 'pemeliharaan') && (
                                    <motion.div variants={cardVariants} whileHover="hover" className="lg:col-span-2">
                                        <SectionCard
                                            icon={AlertTriangle}
                                            title="Mode Maintenance"
                                            description="Aktifkan mode pemeliharaan ketika sistem sedang diperbaiki atau dirombak."
                                            tone="amber"
                                        >
                                            <form onSubmit={submitAdvanced} className="space-y-4">
                                                <div className={`rounded-2xl border p-5 ${advancedForm.data.maintenance_mode ? 'border-amber-200 bg-amber-50/70 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-300' : 'border-slate-200 bg-slate-50/70 text-slate-700 dark:border-neutral-800 dark:bg-black/20 dark:text-neutral-200'}`}>
                                                    <AnimatedToggle
                                                        checked={advancedForm.data.maintenance_mode}
                                                        onChange={() => advancedForm.setData('maintenance_mode', !advancedForm.data.maintenance_mode)}
                                                        label="Aktifkan Maintenance Mode"
                                                        description="User biasa tidak bisa mengakses aplikasi selama mode ini aktif."
                                                    />
                                                </div>
                                                <div className="flex justify-end">
                                                    <SaveButton onClick={() => submitAdvanced({ preventDefault: () => undefined } as FormEvent)} isSaving={advancedForm.processing} hasChanges={advancedForm.isDirty} disabled={!advancedForm.isDirty} />
                                                </div>
                                            </form>
                                        </SectionCard>
                                    </motion.div>
                                )}
                            </>
                        )}

                        {activeTab === 'system' && (
                            <>
                                {matchesSearch('server', 'php', 'laravel', 'database', 'queue', 'cache') && (
                                    <motion.div variants={cardVariants} whileHover="hover">
                                        <SectionCard
                                            icon={Server}
                                            title="Status Server"
                                            description="Informasi lingkungan runtime dan resource utama aplikasi."
                                            tone="blue"
                                        >
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <InfoTile label="PHP" value={systemInfo.php_version} />
                                                <InfoTile label="Laravel" value={systemInfo.laravel_version} />
                                                <InfoTile label="Timezone" value={systemInfo.timezone} />
                                                <InfoTile label="Environment" value={systemInfo.environment} />
                                                <InfoTile label="Memory Limit" value={systemInfo.memory_limit} />
                                                <InfoTile label="Queue Driver" value={systemInfo.queue_driver} />
                                                <InfoTile label="Cache Driver" value={systemInfo.cache_driver} />
                                                <InfoTile label="Database" value={systemInfo.db_connection} />
                                            </div>
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {matchesSearch('storage', 'disk', 'cache size', 'database size', 'log size') && (
                                    <motion.div variants={cardVariants} whileHover="hover">
                                        <SectionCard
                                            icon={HardDrive}
                                            title="Storage & Footprint"
                                            description="Pantau penggunaan disk dan ukuran komponen penting di server."
                                            tone="emerald"
                                        >
                                            <div className="space-y-5">
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="text-sm font-bold text-slate-800 dark:text-white">Penggunaan Storage</span>
                                                        <span className="text-sm font-semibold text-slate-500 dark:text-neutral-400">{storageInfo.used_percentage}%</span>
                                                    </div>
                                                    <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${storageInfo.used_percentage}%` }}
                                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                                            className={`h-full rounded-full ${storageInfo.used_percentage > 90 ? 'bg-red-500' : storageInfo.used_percentage > 70 ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}
                                                        />
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-neutral-400">
                                                        <span>Free: {formatBytes(storageInfo.free_space)}</span>
                                                        <span>Total: {formatBytes(storageInfo.total_space)}</span>
                                                    </div>
                                                </div>

                                                <div className="grid gap-3 sm:grid-cols-3">
                                                    <InfoTile label="Cache Size" value={formatBytes(systemInfo.cache_size)} />
                                                    <InfoTile label="Log Size" value={formatBytes(systemInfo.log_size)} />
                                                    <InfoTile label="DB Size" value={formatBytes(systemInfo.database_size)} />
                                                </div>
                                            </div>
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {matchesSearch('backup', 'restore', 'import', 'export') && (
                                    <motion.div variants={cardVariants} whileHover="hover">
                                        <SectionCard
                                            icon={Database}
                                            title="Backup & Restore"
                                            description="Buat snapshot, import JSON, export pengaturan, dan restore versi sebelumnya."
                                            tone="violet"
                                        >
                                            <div className="space-y-4">
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <Button className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white" onClick={() => setShowBackupDialog(true)}>
                                                        <Database className="mr-2 h-4 w-4" />Kelola Backup
                                                    </Button>
                                                    <Button variant="outline" className="rounded-xl" onClick={() => window.location.assign('/admin/pengaturan/export')}>
                                                        <FileDown className="mr-2 h-4 w-4" />Export JSON
                                                    </Button>
                                                    <Button variant="outline" className="rounded-xl" onClick={handleImportClick}>
                                                        <FileUp className="mr-2 h-4 w-4" />Import JSON
                                                    </Button>
                                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-neutral-800 dark:bg-black/20 dark:text-neutral-300">
                                                        Backup tersedia: <span className="font-bold">{stats.backups_count}</span>
                                                    </div>
                                                </div>

                                                {backups.length > 0 && (
                                                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-neutral-800 dark:bg-black/20">
                                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-neutral-400">Backup Terbaru</p>
                                                        <p className="mt-2 font-bold text-slate-900 dark:text-white">{backups[0].backup_name}</p>
                                                        <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">{backups[0].created_at ? formatDate(backups[0].created_at, 'full') : '-'}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {matchesSearch('history', 'activity log', 'riwayat') && (
                                    <motion.div variants={cardVariants} whileHover="hover">
                                        <SectionCard
                                            icon={History}
                                            title="Activity Log"
                                            description="Audit trail singkat untuk perubahan konfigurasi yang sudah dilakukan admin."
                                            tone="amber"
                                        >
                                            <div className="space-y-3">
                                                {recentHistory.length > 0 ? recentHistory.slice(0, 3).map((item) => (
                                                    <div key={item.id} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-neutral-800 dark:bg-black/20">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="font-bold text-slate-900 dark:text-white">{item.setting_label ?? item.setting_key}</p>
                                                                <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">{item.user?.name ?? 'System'} • {item.created_at ? formatDate(item.created_at, 'full') : '-'}</p>
                                                            </div>
                                                            <Badge className="border-0 bg-slate-900 text-white dark:bg-white dark:text-slate-900">{item.change_type}</Badge>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 dark:border-neutral-700 dark:text-neutral-400">
                                                        Belum ada riwayat perubahan.
                                                    </div>
                                                )}

                                                <Button variant="outline" className="w-full rounded-xl" onClick={() => setShowHistoryDialog(true)}>
                                                    <History className="mr-2 h-4 w-4" />Lihat Riwayat Lengkap
                                                </Button>
                                            </div>
                                        </SectionCard>
                                    </motion.div>
                                )}

                                {matchesSearch('clear cache', 'optimize', 'utility', 'maintenance tools') && (
                                    <motion.div variants={cardVariants} whileHover="hover" className="lg:col-span-2">
                                        <SectionCard
                                            icon={Zap}
                                            title="System Utility"
                                            description="Aksi cepat untuk clear cache dan optimize runtime tanpa masuk terminal."
                                            tone="slate"
                                        >
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <Button variant="outline" className="h-auto rounded-2xl px-5 py-4 text-left" onClick={clearCache}>
                                                    <div className="flex items-start gap-3">
                                                        <Trash2 className="mt-0.5 h-5 w-5 text-rose-500" />
                                                        <div>
                                                            <p className="font-bold">Clear Cache</p>
                                                            <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">Bersihkan cache aplikasi, config, dan data temporer.</p>
                                                        </div>
                                                    </div>
                                                </Button>
                                                <Button variant="outline" className="h-auto rounded-2xl px-5 py-4 text-left" onClick={optimizeSystem}>
                                                    <div className="flex items-start gap-3">
                                                        <RefreshCw className="mt-0.5 h-5 w-5 text-blue-500" />
                                                        <div>
                                                            <p className="font-bold">Optimize System</p>
                                                            <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">Jalankan optimize clear lalu build ulang cache config, route, dan view.</p>
                                                        </div>
                                                    </div>
                                                </Button>
                                            </div>
                                        </SectionCard>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>

                {visibleCount === 0 && (
                    <motion.div variants={itemVariants} className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center shadow-lg dark:border-neutral-700 dark:bg-neutral-900/70">
                        <Search className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Tidak ada section yang cocok</h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-neutral-400">Ubah kata kunci pencarian atau pindah ke kategori lain.</p>
                    </motion.div>
                )}
            </motion.div>

            <BackupDialog
                open={showBackupDialog}
                onOpenChange={setShowBackupDialog}
                backups={backups}
                backupData={backupForm.data}
                backupErrors={backupForm.errors}
                backupProcessing={backupForm.processing}
                onBackupFieldChange={(field, value) => backupForm.setData(field, value)}
                onSubmit={handleCreateBackup}
                onRestore={handleRestoreBackup}
                onDelete={handleDeleteBackup}
            />

            <HistoryDialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog} recentHistory={recentHistory} />
        </AppLayout>
    );
}

function HeaderChip({ icon: Icon, label, value }: { icon: typeof Server; label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-indigo-100" />
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-100/80">{label}</p>
                    <p className="text-sm font-bold text-white">{value}</p>
                </div>
            </div>
        </div>
    );
}

function SectionCard({
    icon: Icon,
    title,
    description,
    tone,
    children,
}: {
    icon: typeof Settings;
    title: string;
    description: string;
    tone: 'indigo' | 'emerald' | 'violet' | 'amber' | 'blue' | 'cyan' | 'teal' | 'rose' | 'slate';
    children: ReactNode;
}) {
    const toneClass = {
        indigo: 'from-indigo-500/10 to-purple-500/10 border-indigo-200/60 dark:border-indigo-900/50',
        emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-200/60 dark:border-emerald-900/50',
        violet: 'from-violet-500/10 to-fuchsia-500/10 border-violet-200/60 dark:border-violet-900/50',
        amber: 'from-amber-500/10 to-orange-500/10 border-amber-200/60 dark:border-amber-900/50',
        blue: 'from-blue-500/10 to-cyan-500/10 border-blue-200/60 dark:border-blue-900/50',
        cyan: 'from-cyan-500/10 to-sky-500/10 border-cyan-200/60 dark:border-cyan-900/50',
        teal: 'from-teal-500/10 to-emerald-500/10 border-teal-200/60 dark:border-teal-900/50',
        rose: 'from-rose-500/10 to-red-500/10 border-rose-200/60 dark:border-rose-900/50',
        slate: 'from-slate-500/10 to-slate-700/10 border-slate-200/60 dark:border-slate-800/70',
    }[tone];

    return (
        <div className={`rounded-3xl border bg-gradient-to-br ${toneClass} bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:bg-neutral-900/80`}>
            <div className="mb-6 flex items-start gap-4">
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-3 text-slate-700 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-neutral-400">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function FieldWrapper({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
    return (
        <div>
            <Label className="text-sm font-semibold text-slate-700 dark:text-neutral-200">{label}</Label>
            {hint && <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">{hint}</p>}
            {children}
        </div>
    );
}

function InfoTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-neutral-800 dark:bg-black/20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-neutral-400">{label}</p>
            <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white break-all">{value}</p>
        </div>
    );
}

function BackupDialog({
    open,
    onOpenChange,
    backups,
    backupData,
    backupErrors,
    backupProcessing,
    onBackupFieldChange,
    onSubmit,
    onRestore,
    onDelete,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    backups: BackupItem[];
    backupData: { name: string; description: string };
    backupErrors: Partial<Record<'name' | 'description', string>>;
    backupProcessing: boolean;
    onBackupFieldChange: (field: 'name' | 'description', value: string) => void;
    onSubmit: (event: FormEvent) => void;
    onRestore: (backupId: number) => void;
    onDelete: (backupId: number) => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
                        <Database className="h-6 w-6 text-violet-500" />Backup & Restore
                    </DialogTitle>
                    <DialogDescription>
                        Simpan snapshot pengaturan sebelum perubahan besar dan restore saat dibutuhkan.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <form onSubmit={onSubmit} className="rounded-3xl border border-violet-200/60 bg-violet-50/60 p-5 dark:border-violet-900/50 dark:bg-violet-950/20">
                        <div className="grid gap-4 lg:grid-cols-[1fr,1fr,auto] lg:items-end">
                            <div>
                                <Label>Nama Backup</Label>
                                <Input value={backupData.name} onChange={(event) => onBackupFieldChange('name', event.target.value)} className="mt-2 rounded-xl" placeholder="Contoh: Backup sebelum update semester baru" />
                                <InputError message={backupErrors.name} />
                            </div>
                            <div>
                                <Label>Deskripsi</Label>
                                <Textarea value={backupData.description} onChange={(event) => onBackupFieldChange('description', event.target.value)} className="mt-2 rounded-xl" rows={3} placeholder="Opsional, jelaskan konteks backup ini." />
                                <InputError message={backupErrors.description} />
                            </div>
                            <Button type="submit" className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white" disabled={backupProcessing}>
                                {backupProcessing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}Buat Backup
                            </Button>
                        </div>
                    </form>

                    <div className="space-y-3">
                        {backups.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-10 text-center text-sm text-slate-500 dark:border-neutral-700 dark:text-neutral-400">
                                Belum ada backup tersimpan.
                            </div>
                        ) : backups.map((backup) => (
                            <div key={backup.id} className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-slate-900 dark:text-white">{backup.backup_name}</p>
                                            {backup.is_auto_backup && <Badge className="border-0 bg-slate-900 text-white dark:bg-white dark:text-slate-900">AUTO</Badge>}
                                        </div>
                                        {backup.backup_description && <p className="text-sm text-slate-500 dark:text-neutral-400">{backup.backup_description}</p>}
                                        <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-neutral-400">
                                            <span>{backup.created_at ? formatDate(backup.created_at, 'full') : '-'}</span>
                                            <span>{backup.settings_count} setting</span>
                                            <span>{formatBytes(backup.file_size)}</span>
                                            <span>{backup.creator?.name ?? 'System'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {backup.can_restore && (
                                            <Button variant="outline" className="rounded-xl" onClick={() => onRestore(backup.id)}>
                                                <RefreshCw className="mr-2 h-4 w-4" />Restore
                                            </Button>
                                        )}
                                        <Button variant="outline" className="rounded-xl text-rose-600 hover:text-rose-700" onClick={() => onDelete(backup.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" />Hapus
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function HistoryDialog({
    open,
    onOpenChange,
    recentHistory,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recentHistory: HistoryItem[];
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
                        <History className="h-6 w-6 text-amber-500" />Riwayat Perubahan
                    </DialogTitle>
                    <DialogDescription>
                        Audit trail untuk perubahan nilai konfigurasi di halaman pengaturan admin.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    {recentHistory.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 px-5 py-10 text-center text-sm text-slate-500 dark:border-neutral-700 dark:text-neutral-400">
                            Belum ada aktivitas perubahan yang tercatat.
                        </div>
                    ) : recentHistory.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-3">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{item.setting_label ?? item.setting_key}</p>
                                        <p className="mt-1 text-xs font-mono text-slate-500 dark:text-neutral-400">{item.setting_key}</p>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <HistoryValue label="Nilai Lama" value={item.old_value} tone="rose" />
                                        <HistoryValue label="Nilai Baru" value={item.new_value} tone="emerald" />
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-neutral-400">
                                        <span>{item.user?.name ?? 'System'}</span>
                                        <span>{item.created_at ? formatDate(item.created_at, 'full') : '-'}</span>
                                        {item.ip_address && <span>{item.ip_address}</span>}
                                    </div>
                                </div>
                                <Badge className="border-0 bg-slate-900 text-white dark:bg-white dark:text-slate-900">{item.change_type}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function HistoryValue({ label, value, tone }: { label: string; value: string | null; tone: 'rose' | 'emerald' }) {
    const classes = tone === 'rose'
        ? 'border-rose-200 bg-rose-50/70 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300'
        : 'border-emerald-200 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300';

    return (
        <div className={`rounded-2xl border p-3 ${classes}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">{label}</p>
            <p className="mt-2 break-all font-mono text-xs">{formatHistoryValue(value)}</p>
        </div>
    );
}

function formatHistoryValue(value: string | null): string {
    if (value === null || value === '') {
        return '-';
    }

    if (value === '1') {
        return 'true';
    }

    if (value === '0') {
        return 'false';
    }

    return value;
}

function formatBytes(bytes: number): string {
    if (!bytes || bytes <= 0) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let index = 0;

    while (value >= 1024 && index < units.length - 1) {
        value /= 1024;
        index += 1;
    }

    return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(value: string, mode: 'date' | 'time' | 'full'): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    if (mode === 'date') {
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    if (mode === 'time') {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
