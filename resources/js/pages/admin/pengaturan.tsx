import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Settings, Shield, Bell, Server, HardDrive, Save, Trash2, Activity, CheckCircle, XCircle, Database, Zap, Lock, RefreshCw, Smartphone, Mail, Calendar, FileText, BarChart3, Palette, Moon, Sun, Monitor, KeyRound, ShieldCheck, Eye, EyeOff, History, AlertTriangle, Globe, UserCog, Fingerprint, Sparkles } from 'lucide-react';
import { FormEvent, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { useTheme } from '@/hooks/useTheme';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ThemeToggle } from '@/components/settings/ThemeToggle';
import { AnimatedToggle } from '@/components/settings/AnimatedToggle';
import { SaveButton } from '@/components/settings/SaveButton';
import PengaturanIcon from '@/assets/admin/pengaturan/pengaturan.png';

interface Settings { token_ttl_seconds: number; late_minutes: number; selfie_required: boolean; notify_rejected: boolean; notify_selfie_blur: boolean; email_notifications: boolean; push_notifications: boolean; daily_report: boolean; weekly_report: boolean; max_login_attempts: number; lockout_duration: number; session_lifetime: number; ai_verification_enabled: boolean; face_match_threshold: number; blur_detection_enabled: boolean; auto_approve_verified: boolean; maintenance_mode: boolean; }
interface SystemInfo { php_version: string; laravel_version: string; server_time: string; timezone: string; environment: string; debug_mode: boolean; db_connection: string; cache_driver: string; }
interface StorageInfo { total_space: number; free_space: number; used_percentage: number; }
interface User { id: number; name: string; email: string; two_factor_confirmed_at?: string; }
interface PageProps { settings: Settings; systemInfo: SystemInfo; storageInfo: StorageInfo; auth: { user: User }; flash?: { success?: string; error?: string }; }
type TabType = 'general' | 'security' | 'notifications' | 'advanced' | 'system';

// Animation variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
            delayChildren: 0.2,
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
            damping: 24,
        },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
        },
    },
    hover: {
        y: -5,
        scale: 1.01,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10,
        },
    },
};

export default function AdminPengaturan({ settings, systemInfo, storageInfo, auth, flash }: PageProps) {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { theme, resolvedTheme, setTheme } = useTheme();

    const securityForm = useForm({ token_ttl_seconds: settings.token_ttl_seconds, late_minutes: settings.late_minutes, selfie_required: settings.selfie_required, notify_rejected: settings.notify_rejected, notify_selfie_blur: settings.notify_selfie_blur });
    const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });
    const notificationForm = useForm({ email_notifications: settings.email_notifications, push_notifications: settings.push_notifications, daily_report: settings.daily_report, weekly_report: settings.weekly_report });
    const advancedForm = useForm({ max_login_attempts: settings.max_login_attempts ?? 5, lockout_duration: settings.lockout_duration ?? 15, session_lifetime: settings.session_lifetime ?? 120, ai_verification_enabled: settings.ai_verification_enabled ?? true, face_match_threshold: settings.face_match_threshold ?? 70, blur_detection_enabled: settings.blur_detection_enabled ?? true, auto_approve_verified: settings.auto_approve_verified ?? false, maintenance_mode: settings.maintenance_mode ?? false });

    useEffect(() => {
        if (flash?.success) { setToast({ type: 'success', message: flash.success }); const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
        if (flash?.error) { setToast({ type: 'error', message: flash.error }); const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
    }, [flash?.success, flash?.error]);

    const submitSecurity = (e: FormEvent) => { e.preventDefault(); securityForm.patch('/admin/pengaturan', { preserveScroll: true, onSuccess: () => { setToast({ type: 'success', message: 'Pengaturan keamanan berhasil disimpan!' }); setTimeout(() => setToast(null), 3000); } }); };
    const submitPassword = (e: FormEvent) => { e.preventDefault(); passwordForm.put('/settings/password', { preserveScroll: true, onSuccess: () => { passwordForm.reset(); setToast({ type: 'success', message: 'Password berhasil diubah!' }); setTimeout(() => setToast(null), 3000); } }); };
    const submitNotifications = (e: FormEvent) => { e.preventDefault(); notificationForm.patch('/admin/pengaturan/notifications', { preserveScroll: true, onSuccess: () => { setToast({ type: 'success', message: 'Pengaturan notifikasi berhasil disimpan!' }); setTimeout(() => setToast(null), 3000); } }); };
    const submitAdvanced = (e: FormEvent) => { e.preventDefault(); advancedForm.patch('/admin/pengaturan/advanced', { preserveScroll: true, onSuccess: () => { setToast({ type: 'success', message: 'Pengaturan lanjutan berhasil disimpan!' }); setTimeout(() => setToast(null), 3000); } }); };
    const clearCache = () => { router.post('/admin/pengaturan/clear-cache', {}, { preserveScroll: true, onSuccess: () => { setToast({ type: 'success', message: 'Cache berhasil dibersihkan!' }); setTimeout(() => setToast(null), 3000); } }); };
    const optimizeSystem = () => { router.post('/admin/pengaturan/optimize', {}, { preserveScroll: true, onSuccess: () => { setToast({ type: 'success', message: 'Sistem berhasil dioptimasi!' }); setTimeout(() => setToast(null), 3000); } }); };
    const formatBytes = (bytes: number) => { if (bytes === 0) return '0 Bytes'; const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]; };

    const tabs = [
        { id: 'general' as TabType, label: 'Umum', icon: Settings },
        { id: 'security' as TabType, label: 'Keamanan Akun', icon: ShieldCheck },
        { id: 'notifications' as TabType, label: 'Notifikasi', icon: Bell },
        { id: 'advanced' as TabType, label: 'Lanjutan', icon: Zap },
        { id: 'system' as TabType, label: 'Sistem', icon: Server },
    ];
    const is2FAEnabled = auth?.user?.two_factor_confirmed_at != null;

    return (
        <AppLayout>
            <Head title="Pengaturan Sistem" />
            <motion.div
                className="p-6 space-y-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -20, x: 20 }}
                        className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-md border ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30' : 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 dark:border-red-500/30'}`}
                    >
                        {toast.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                        <span className="text-sm font-medium">{toast.message}</span>
                    </motion.div>
                )}

                {/* ═══════ HEADER ═══════ */}
                <motion.div
                    className="relative overflow-hidden rounded-[2.5rem] p-8 text-white shadow-2xl"
                    variants={itemVariants}
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />

                    {/* Glass Overlay & Effects */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating Pulse Circles */}
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
                    />

                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
                            <motion.div
                                className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24 items-center justify-center"
                                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                whileHover={{ scale: 1.05, rotate: 5 }}
                            >
                                <img src={PengaturanIcon} alt="Pengaturan" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                            </motion.div>
                            <div>
                                <p className="text-sm text-indigo-100 font-medium tracking-wide uppercase">System Configuration</p>
                                <h1 className="text-3xl font-bold text-white">Pengaturan Sistem</h1>
                                <p className="mt-1 text-indigo-100 max-w-lg text-sm opacity-90">Kelola preferensi, keamanan, dan konfigurasi aplikasi Anda dengan mudah.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ NAVIGATION TABS ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="flex p-1 gap-1 bg-white/50 dark:bg-neutral-900/50 rounded-2xl backdrop-blur-md w-fit border border-slate-200/50 dark:border-neutral-800 overflow-x-auto max-w-full"
                >
                    {tabs.map(tab => (
                        <motion.button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative px-5 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-neutral-200'}`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-slate-100 dark:border-neutral-700"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <tab.icon className="h-4 w-4" />{tab.label}
                            </span>
                        </motion.button>
                    ))}
                </motion.div>

                {/* ═══════ CONTENT AREA ═══════ */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="grid gap-6 lg:grid-cols-2"
                    >
                        {activeTab === 'general' && (
                            <>
                                <motion.div variants={cardVariants} whileHover="hover" className="group rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/60 hover:shadow-indigo-500/10 transition-all">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors"><Shield className="h-6 w-6" /></div>
                                        <div><h2 className="text-lg font-bold text-slate-800 dark:text-white">Keamanan Sesi</h2><p className="text-xs text-slate-500 dark:text-slate-400">Konfigurasi validasi dan sesi absen</p></div>
                                    </div>
                                    <form onSubmit={submitSecurity} className="space-y-5 flex flex-col items-center">
                                        <div className="w-full text-left">
                                            <Label className="text-slate-700 dark:text-slate-300 font-medium">Token TTL (detik)</Label>
                                            <Input type="number" value={securityForm.data.token_ttl_seconds} onChange={e => securityForm.setData('token_ttl_seconds', parseInt(e.target.value))} className="mt-2 rounded-xl border-slate-200 bg-slate-50/50 dark:border-neutral-700 dark:bg-black/40 focus:ring-2 focus:ring-indigo-500 transition-all" />
                                            <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1"><History className="h-3 w-3" /> Durasi validitas QR code (30-600 detik)</p>
                                        </div>
                                        <div className="w-full text-left">
                                            <Label className="text-slate-700 dark:text-slate-300 font-medium">Toleransi Terlambat (menit)</Label>
                                            <Input type="number" value={securityForm.data.late_minutes} onChange={e => securityForm.setData('late_minutes', parseInt(e.target.value))} className="mt-2 rounded-xl border-slate-200 bg-slate-50/50 dark:border-neutral-700 dark:bg-black/40 focus:ring-2 focus:ring-indigo-500 transition-all" />
                                        </div>
                                        <div className="w-full space-y-4 p-5 rounded-3xl bg-slate-50/50 dark:bg-black/20 border border-slate-100 dark:border-neutral-800">
                                            <AnimatedToggle checked={securityForm.data.selfie_required} onChange={() => securityForm.setData('selfie_required', !securityForm.data.selfie_required)} label="Wajib selfie saat absen" description="Memerlukan pengguna untuk melakukan swafoto sebelum absen disetujui." />
                                            <div className="h-px bg-slate-200/50 dark:bg-slate-800/50" />
                                            <AnimatedToggle checked={securityForm.data.notify_rejected} onChange={() => securityForm.setData('notify_rejected', !securityForm.data.notify_rejected)} label="Notifikasi absen ditolak" description="Kirim peringatan ketika sistem menolak sesi absen." />
                                            <div className="h-px bg-slate-200/50 dark:bg-slate-800/50" />
                                            <AnimatedToggle checked={securityForm.data.notify_selfie_blur} onChange={() => securityForm.setData('notify_selfie_blur', !securityForm.data.notify_selfie_blur)} label="Notifikasi selfie blur" description="Kirim peringatan jika foto yang diambil kurang jelas." />
                                        </div>
                                        <div className="w-full flex justify-end pt-2">
                                            <div className="inline-block shadow-xl shadow-indigo-500/20 rounded-2xl">
                                                <SaveButton onClick={() => submitSecurity({ preventDefault: () => { } } as React.FormEvent)} isSaving={securityForm.processing} hasChanges={securityForm.isDirty} disabled={!securityForm.isDirty} />
                                            </div>
                                        </div>
                                    </form>
                                </motion.div>

                                <div className="space-y-6">
                                    <motion.div variants={cardVariants} whileHover="hover" className="group rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/60 hover:shadow-purple-500/10 transition-all">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20 transition-colors"><Palette className="h-6 w-6" /></div>
                                            <div><h2 className="text-lg font-bold text-slate-800 dark:text-white">Tema Tampilan</h2><p className="text-xs text-slate-500 dark:text-slate-400">Sesuaikan tampilan antarmuka</p></div>
                                        </div>

                                        {/* Inject animated theme toggle */}
                                        <ThemeToggle
                                            value={theme}
                                            resolvedTheme={resolvedTheme}
                                            onChange={setTheme}
                                        />
                                    </motion.div>
                                </div>
                            </>
                        )}

                        {activeTab === 'security' && (
                            <>
                                <motion.div variants={cardVariants} whileHover="hover" className="group rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/60 hover:shadow-amber-500/10 transition-all">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-colors"><KeyRound className="h-6 w-6" /></div>
                                        <div><h2 className="text-lg font-bold text-slate-800 dark:text-white">Ganti Password</h2><p className="text-xs text-slate-500 dark:text-slate-400">Perbarui kata sandi akun Anda</p></div>
                                    </div>
                                    <form onSubmit={submitPassword} className="space-y-4 flex flex-col items-center">
                                        <div className="w-full">
                                            {[
                                                { label: 'Password Saat Ini', state: showCurrentPassword, setter: setShowCurrentPassword, field: 'current_password' },
                                                { label: 'Password Baru', state: showNewPassword, setter: setShowNewPassword, field: 'password' },
                                                { label: 'Konfirmasi Password', state: showConfirmPassword, setter: setShowConfirmPassword, field: 'password_confirmation' }
                                            ].map((item, idx) => (
                                                <div key={idx} className="mb-4">
                                                    <Label className="text-slate-700 dark:text-slate-300 font-medium">{item.label}</Label>
                                                    <div className="relative mt-2">
                                                        <Input type={item.state ? 'text' : 'password'} value={passwordForm.data[item.field as keyof typeof passwordForm.data]} onChange={e => passwordForm.setData(item.field as any, e.target.value)} className="pr-10 rounded-xl border-slate-200 bg-slate-50/50 dark:border-neutral-700 dark:bg-black/40 focus:ring-2 focus:ring-amber-500 transition-all" />
                                                        <button type="button" onClick={() => item.setter(!item.state)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">{item.state ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                                                    </div>
                                                    <InputError message={passwordForm.errors[item.field as keyof typeof passwordForm.errors]} />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="w-full flex justify-end pt-2">
                                            <div className="inline-block shadow-xl shadow-amber-500/20 rounded-2xl">
                                                <SaveButton onClick={() => submitPassword({ preventDefault: () => { } } as React.FormEvent)} isSaving={passwordForm.processing} hasChanges={passwordForm.isDirty} disabled={!passwordForm.isDirty} />
                                            </div>
                                        </div>
                                    </form>
                                </motion.div>

                                <div className="space-y-6">
                                    <motion.div variants={cardVariants} whileHover="hover" className="group rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/60 hover:shadow-emerald-500/10 transition-all">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors"><Fingerprint className="h-6 w-6" /></div>
                                            <div><h2 className="text-lg font-bold text-slate-800 dark:text-white">Dua Faktor (2FA)</h2><p className="text-xs text-slate-500 dark:text-slate-400">Lapisan keamanan tambahan</p></div>
                                        </div>
                                        <div className={`p-4 rounded-2xl border flex items-start gap-4 ${is2FAEnabled ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800' : 'bg-amber-50/50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800'}`}>
                                            {is2FAEnabled ? <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />}
                                            <div>
                                                <p className={`font-bold ${is2FAEnabled ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>{is2FAEnabled ? '2FA Aktif' : '2FA Tidak Aktif'}</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{is2FAEnabled ? 'Akun Anda terlindungi dengan maksimal.' : 'Aktifkan 2FA untuk melindungi akun Anda dari akses tidak sah.'}</p>
                                            </div>
                                        </div>
                                        <a href="/admin/profile" className="mt-4 flex w-full justify-center items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-neutral-800 dark:text-slate-300 dark:hover:bg-neutral-700 text-sm font-semibold transition-all group-hover:shadow-md">
                                            <UserCog className="h-4 w-4" />Kelola 2FA di Profil
                                        </a>
                                    </motion.div>

                                    <motion.div variants={cardVariants} whileHover="hover" className="group rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/60 hover:shadow-blue-500/10 transition-all">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors"><Globe className="h-6 w-6" /></div>
                                            <div><h2 className="text-lg font-bold text-slate-800 dark:text-white">Sesi Aktif</h2><p className="text-xs text-slate-500 dark:text-slate-400">Login saat ini</p></div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-100 dark:border-neutral-800">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 shadow-sm animate-pulse"><Globe className="h-5 w-5" /></div>
                                            <div className="flex-1"><p className="font-bold text-slate-900 dark:text-white text-sm">Browser Ini</p><p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Online</p></div>
                                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30">AKTIF</span>
                                        </div>
                                    </motion.div>
                                </div>
                            </>
                        )}

                        {activeTab === 'notifications' && (
                            <>
                                <motion.div variants={cardVariants} whileHover="hover" className="group rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/60 hover:shadow-cyan-500/10 transition-all">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-500/20 transition-colors"><Bell className="h-6 w-6" /></div>
                                        <div><h2 className="text-lg font-bold text-slate-800 dark:text-white">Notifikasi</h2><p className="text-xs text-slate-500 dark:text-slate-400">Pusat pemberitahuan</p></div>
                                    </div>
                                    <form onSubmit={submitNotifications} className="space-y-4 flex flex-col items-center">
                                        <div className="w-full space-y-4">
                                            {[
                                                { label: 'Notifikasi Email', desc: 'Terima update penting via email', icon: Mail, checked: notificationForm.data.email_notifications, setter: 'email_notifications' },
                                                { label: 'Push Notification', desc: 'Alert real-time di browser', icon: Smartphone, checked: notificationForm.data.push_notifications, setter: 'push_notifications' }
                                            ].map((item, idx) => (
                                                <label key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-black/20 border border-slate-100 dark:border-neutral-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-800/50 transition-colors group/check">
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-white dark:bg-neutral-800 p-2 rounded-xl text-slate-400 group-hover/check:text-cyan-500 transition-colors shadow-sm"><item.icon className="h-5 w-5" /></div>
                                                        <div><p className="font-bold text-slate-800 dark:text-white text-sm">{item.label}</p><p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p></div>
                                                    </div>
                                                    <Checkbox checked={item.checked} onCheckedChange={(c) => notificationForm.setData(item.setter as any, !!c)} className="border-slate-300 data-[state=checked]:bg-cyan-600 data-[state=checked]:border-cyan-600 h-5 w-5 rounded-md transition-all" />
                                                </label>
                                            ))}
                                        </div>
                                        <div className="w-full flex justify-end pt-2">
                                            <div className="inline-block shadow-xl shadow-cyan-500/20 rounded-2xl">
                                                <SaveButton onClick={() => submitNotifications({ preventDefault: () => { } } as React.FormEvent)} isSaving={notificationForm.processing} hasChanges={notificationForm.isDirty} disabled={!notificationForm.isDirty} />
                                            </div>
                                        </div>
                                    </form>
                                </motion.div>

                                <motion.div variants={cardVariants} whileHover="hover" className="group rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/60 hover:shadow-teal-500/10 transition-all">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-100 dark:group-hover:bg-teal-500/20 transition-colors"><FileText className="h-6 w-6" /></div>
                                        <div><h2 className="text-lg font-bold text-slate-800 dark:text-white">Laporan Otomatis</h2><p className="text-xs text-slate-500 dark:text-slate-400">Jadwal pengiriman laporan</p></div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-6 rounded-3xl bg-teal-50/50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800/30">
                                            <div className="space-y-6">
                                                <AnimatedToggle
                                                    checked={notificationForm.data.daily_report}
                                                    onChange={() => notificationForm.setData('daily_report', !notificationForm.data.daily_report)}
                                                    label="Laporan Harian"
                                                    description="Ringkasan aktivitas dan rekapan absensi masuk ke email Anda setiap hari."
                                                />
                                                <div className="h-px bg-teal-200/50 dark:bg-teal-800/50" />
                                                <AnimatedToggle
                                                    checked={notificationForm.data.weekly_report}
                                                    onChange={() => notificationForm.setData('weekly_report', !notificationForm.data.weekly_report)}
                                                    label="Laporan Mingguan"
                                                    description="Analisis performa, grafik tren mingguan, dan kehadiran dalam minggu."
                                                />
                                            </div>
                                        </div>
                                        <div className="w-full flex justify-end pt-2">
                                            <div className="inline-block shadow-xl shadow-teal-500/20 rounded-2xl">
                                                <SaveButton onClick={() => submitNotifications({ preventDefault: () => { } } as React.FormEvent)} isSaving={notificationForm.processing} hasChanges={notificationForm.isDirty} disabled={!notificationForm.isDirty} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}

                        {activeTab === 'advanced' && (
                            <>
                                <motion.div variants={cardVariants} whileHover="hover" className="group rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/60 hover:shadow-red-500/10 transition-all">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors"><Lock className="h-6 w-6" /></div>
                                        <div><h2 className="text-lg font-bold text-slate-800 dark:text-white">Keamanan Login</h2><p className="text-xs text-slate-500 dark:text-slate-400">Proteksi brute-force</p></div>
                                    </div>
                                    <form onSubmit={submitAdvanced} className="space-y-4 flex flex-col items-center">
                                        <div className="w-full text-left"><Label className="text-slate-700 dark:text-slate-300 font-medium">Max Login Attempts</Label><Input type="number" value={advancedForm.data.max_login_attempts} onChange={e => advancedForm.setData('max_login_attempts', parseInt(e.target.value))} className="mt-2 rounded-xl" /><p className="text-[10px] text-slate-400 mt-1">Batas gagal login sebelum dikunci</p></div>
                                        <div className="w-full text-left"><Label className="text-slate-700 dark:text-slate-300 font-medium">Lockout Duration (menits)</Label><Input type="number" value={advancedForm.data.lockout_duration} onChange={e => advancedForm.setData('lockout_duration', parseInt(e.target.value))} className="mt-2 rounded-xl" /></div>
                                        <div className="w-full text-left mb-4"><Label className="text-slate-700 dark:text-slate-300 font-medium">Session Lifetime (menits)</Label><Input type="number" value={advancedForm.data.session_lifetime} onChange={e => advancedForm.setData('session_lifetime', parseInt(e.target.value))} className="mt-2 rounded-xl" /></div>
                                        <div className="w-full pt-4">
                                            <SaveButton onClick={() => submitAdvanced({ preventDefault: () => { } } as React.FormEvent)} isSaving={advancedForm.processing} hasChanges={advancedForm.isDirty} disabled={!advancedForm.isDirty} />
                                        </div>
                                    </form>
                                </motion.div>

                                <div className="space-y-6">
                                    <motion.div variants={cardVariants} whileHover="hover" className="group rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/60 hover:shadow-violet-500/10 transition-all">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 rounded-2xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20 transition-colors"><Sparkles className="h-6 w-6" /></div>
                                            <div><h2 className="text-lg font-bold text-slate-800 dark:text-white">Verifikasi AI</h2><p className="text-xs text-slate-500 dark:text-slate-400">Konfigurasi scan wajah pintar</p></div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="p-6 rounded-3xl bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/30">
                                                <div className="flex justify-between items-center mb-6">
                                                    <span className="text-sm font-bold text-violet-900 dark:text-violet-100">AI Engine Status</span>
                                                    <span className="px-3 py-1 rounded-md bg-green-100 text-green-700 text-xs font-bold shadow-sm">READY</span>
                                                </div>
                                                <div className="space-y-6">
                                                    <AnimatedToggle checked={advancedForm.data.ai_verification_enabled} onChange={() => advancedForm.setData('ai_verification_enabled', !advancedForm.data.ai_verification_enabled)} label="Aktifkan Verifikasi AI" description="Sistem keamanan wajah pintar berjalan otomatis di latar belakang." />
                                                    <div className="h-px bg-violet-200/50 dark:bg-violet-800/50" />
                                                    <AnimatedToggle checked={advancedForm.data.blur_detection_enabled} onChange={() => advancedForm.setData('blur_detection_enabled', !advancedForm.data.blur_detection_enabled)} label="Deteksi Foto Blur" description="Otomatis menolak gambar dengan fokus rendah." />
                                                    <div className="h-px bg-violet-200/50 dark:bg-violet-800/50" />
                                                    <AnimatedToggle checked={advancedForm.data.auto_approve_verified} onChange={() => advancedForm.setData('auto_approve_verified', !advancedForm.data.auto_approve_verified)} label="Auto Approve Verified" description="Verifikasi otomatis bagi user tanpa riwayat pelanggaran." />
                                                </div>
                                            </div>
                                            <div><Label className="text-slate-700 dark:text-slate-300 font-medium">Sensitivity Threshold (%)</Label><Input type="number" value={advancedForm.data.face_match_threshold} onChange={e => advancedForm.setData('face_match_threshold', parseInt(e.target.value))} className="mt-2 rounded-xl" /></div>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={cardVariants} whileHover="hover" className={`group rounded-3xl border p-6 shadow-xl backdrop-blur-xl transition-all ${advancedForm.data.maintenance_mode ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800' : 'bg-white/60 border-slate-200/60 dark:bg-neutral-900/60 dark:border-neutral-800/60'}`}>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-2xl ${advancedForm.data.maintenance_mode ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500 dark:bg-neutral-800 dark:text-neutral-400'}`}><AlertTriangle className="h-6 w-6" /></div>
                                                <div><h2 className="text-lg font-bold text-slate-800 dark:text-white">Maintenance Mode</h2><p className="text-xs text-slate-500 dark:text-slate-400">Darurat & Pemeliharaan</p></div>
                                            </div>
                                            <div className="mt-2">
                                                <AnimatedToggle checked={advancedForm.data.maintenance_mode} onChange={() => advancedForm.setData('maintenance_mode', !advancedForm.data.maintenance_mode)} label="Aktifkan Maintenance Mode" description="Aplikasi tidak dapat diakses oleh user biasa saat mode ini aktif." />
                                            </div>
                                        </div>
                                    </motion.div>

                                    <div className="w-full flex justify-end mt-4">
                                        <div className="inline-block shadow-xl shadow-purple-500/20 rounded-2xl">
                                            <SaveButton onClick={() => submitAdvanced({ preventDefault: () => { } } as React.FormEvent)} isSaving={advancedForm.processing} hasChanges={advancedForm.isDirty} disabled={!advancedForm.isDirty} />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'system' && (
                            <>
                                <motion.div variants={cardVariants} whileHover="hover" className="group rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/60 hover:shadow-blue-500/10 transition-all">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors"><Server className="h-6 w-6" /></div>
                                        <div><h2 className="text-lg font-bold text-slate-800 dark:text-white">Server Info</h2><p className="text-xs text-slate-500 dark:text-slate-400">Spesifikasi teknis</p></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[{ label: 'PHP', value: systemInfo.php_version }, { label: 'Laravel', value: systemInfo.laravel_version }, { label: 'Timezone', value: systemInfo.timezone }, { label: 'Env', value: systemInfo.environment }, { label: 'Debug', value: systemInfo.debug_mode ? 'ON' : 'OFF' }, { label: 'DB', value: systemInfo.db_connection }].map(({ label, value }) => (
                                            <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-neutral-800">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</p>
                                                <p className="font-semibold text-slate-700 dark:text-slate-300 truncate" title={value}>{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                <div className="space-y-6">
                                    <motion.div variants={cardVariants} whileHover="hover" className="group rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/60 hover:shadow-green-500/10 transition-all">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-500/20 transition-colors"><HardDrive className="h-6 w-6" /></div>
                                            <div><h2 className="text-lg font-bold text-slate-800 dark:text-white">Storage</h2><p className="text-xs text-slate-500 dark:text-slate-400">Status penyimpanan disk</p></div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end"><span className="text-2xl font-bold">{storageInfo.used_percentage}%</span><span className="text-xs text-slate-500">Terpakai</span></div>
                                            <div className="relative h-3 rounded-full bg-slate-100 dark:bg-neutral-800 overflow-hidden shadow-inner">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${storageInfo.used_percentage}%` }} transition={{ duration: 1, ease: 'easeOut' }} className={`absolute inset-y-0 left-0 rounded-full ${storageInfo.used_percentage > 90 ? 'bg-red-500' : storageInfo.used_percentage > 70 ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-400 to-green-500'}`} />
                                            </div>
                                            <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Free: {formatBytes(storageInfo.free_space)}</span><span>Total: {formatBytes(storageInfo.total_space)}</span></div>
                                        </div>
                                    </motion.div>

                                    <motion.div variants={cardVariants} whileHover="hover" className="group rounded-3xl border border-slate-200/60 bg-white/60 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800/60 dark:bg-neutral-900/60 hover:shadow-orange-500/10 transition-all">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20 transition-colors"><Database className="h-6 w-6" /></div>
                                            <div><h2 className="text-lg font-bold text-slate-800 dark:text-white">Utility</h2><p className="text-xs text-slate-500 dark:text-slate-400">Alat perbaikan sistem</p></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button onClick={clearCache} variant="outline" className="h-auto py-3 px-4 flex-col gap-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-transparent dark:hover:bg-neutral-800 border-slate-200 dark:border-neutral-700 hover:text-red-600 hover:border-red-200 dark:hover:border-red-900/50 transition-all">
                                                <Trash2 className="h-5 w-5" />
                                                <span className="text-xs font-semibold">Clear Cache</span>
                                            </Button>
                                            <Button onClick={optimizeSystem} variant="outline" className="h-auto py-3 px-4 flex-col gap-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-transparent dark:hover:bg-neutral-800 border-slate-200 dark:border-neutral-700 hover:text-blue-600 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all">
                                                <RefreshCw className="h-5 w-5" />
                                                <span className="text-xs font-semibold">Optimize</span>
                                            </Button>
                                        </div>
                                    </motion.div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </AppLayout>
    );
}
