import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Settings, Shield, Bell, Server, HardDrive, Save, Trash2, Activity, CheckCircle, XCircle, Database, Zap, Lock, RefreshCw, Smartphone, Mail, Calendar, FileText, BarChart3, Palette, Moon, Sun, Monitor, KeyRound, ShieldCheck, Eye, EyeOff, History, AlertTriangle, Globe, UserCog, Fingerprint, Sparkles } from 'lucide-react';
import { FormEvent, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import { useAppearance } from '@/hooks/use-appearance';
import { motion, AnimatePresence } from 'framer-motion';

interface Settings { token_ttl_seconds: number; late_minutes: number; selfie_required: boolean; notify_rejected: boolean; notify_selfie_blur: boolean; email_notifications: boolean; push_notifications: boolean; daily_report: boolean; weekly_report: boolean; max_login_attempts: number; lockout_duration: number; session_lifetime: number; ai_verification_enabled: boolean; face_match_threshold: number; blur_detection_enabled: boolean; auto_approve_verified: boolean; maintenance_mode: boolean; }
interface SystemInfo { php_version: string; laravel_version: string; server_time: string; timezone: string; environment: string; debug_mode: boolean; db_connection: string; cache_driver: string; }
interface StorageInfo { total_space: number; free_space: number; used_percentage: number; }
interface User { id: number; name: string; email: string; two_factor_confirmed_at?: string; }
interface PageProps { settings: Settings; systemInfo: SystemInfo; storageInfo: StorageInfo; auth: { user: User }; flash?: { success?: string; error?: string }; }
type TabType = 'general' | 'security' | 'notifications' | 'advanced' | 'system';

export default function AdminPengaturan({ settings, systemInfo, storageInfo, auth, flash }: PageProps) {
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { appearance, updateAppearance } = useAppearance();

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
            <div className="p-6 space-y-6">
                {toast && (
                    <div className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'}`}>
                        {toast.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                )}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-lg">
                    {/* Animated background circles */}
                    <motion.div 
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5"
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ 
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div 
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5"
                        animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5
                        }}
                    />
                    
                    {/* Floating Sparkles */}
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            initial={{ 
                                x: Math.random() * 100 + '%',
                                y: Math.random() * 100 + '%',
                                opacity: 0
                            }}
                            animate={{ 
                                y: [null, (Math.random() - 0.5) * 50],
                                opacity: [0, 1, 0]
                            }}
                            transition={{ 
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: i * 0.4
                            }}
                        >
                            <Sparkles className="h-4 w-4 text-white/40" />
                        </motion.div>
                    ))}
                    
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <motion.div 
                                className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 backdrop-blur"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400 }}
                            >
                                <Settings className="h-8 w-8" />
                            </motion.div>
                            <div><p className="text-sm text-slate-300">Konfigurasi</p><h1 className="text-2xl font-bold">Pengaturan Sistem</h1></div>
                        </div>
                        <p className="mt-4 text-slate-300">Kelola pengaturan sistem, keamanan, dan konfigurasi aplikasi</p>
                    </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <motion.button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id)} 
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-black text-white shadow-lg dark:bg-white dark:text-slate-900' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'}`}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <tab.icon className="h-4 w-4" />{tab.label}
                        </motion.button>
                    ))}
                </div>

                <div className="space-y-6">
                    {activeTab === 'general' && (
                        <motion.div 
                            className="grid gap-6 lg:grid-cols-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div 
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                            >
                                <div className="flex items-center gap-2 mb-4"><Shield className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Keamanan Sesi</h2></div>
                                <form onSubmit={submitSecurity} className="space-y-4">
                                    <div><Label className="text-slate-700 dark:text-slate-300">Token TTL (detik)</Label><Input type="number" value={securityForm.data.token_ttl_seconds} onChange={e => securityForm.setData('token_ttl_seconds', parseInt(e.target.value))} className="mt-1 dark:bg-black dark:border-slate-700" /><p className="text-xs text-slate-500 mt-1">Durasi validitas QR code (30-600 detik)</p></div>
                                    <div><Label className="text-slate-700 dark:text-slate-300">Toleransi Terlambat (menit)</Label><Input type="number" value={securityForm.data.late_minutes} onChange={e => securityForm.setData('late_minutes', parseInt(e.target.value))} className="mt-1 dark:bg-black dark:border-slate-700" /></div>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer"><Checkbox checked={securityForm.data.selfie_required} onCheckedChange={(c) => securityForm.setData('selfie_required', !!c)} /><span className="text-sm text-slate-700 dark:text-slate-300">Wajib selfie saat absen</span></label>
                                        <label className="flex items-center gap-3 cursor-pointer"><Checkbox checked={securityForm.data.notify_rejected} onCheckedChange={(c) => securityForm.setData('notify_rejected', !!c)} /><span className="text-sm text-slate-700 dark:text-slate-300">Notifikasi absen ditolak</span></label>
                                        <label className="flex items-center gap-3 cursor-pointer"><Checkbox checked={securityForm.data.notify_selfie_blur} onCheckedChange={(c) => securityForm.setData('notify_selfie_blur', !!c)} /><span className="text-sm text-slate-700 dark:text-slate-300">Notifikasi selfie blur</span></label>
                                    </div>
                                    <Button type="submit" disabled={securityForm.processing} className="w-full"><Save className="h-4 w-4 mr-2" />{securityForm.processing ? 'Menyimpan...' : 'Simpan Pengaturan'}</Button>
                                </form>
                            </motion.div>
                            <motion.div 
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                            >
                                <div className="flex items-center gap-2 mb-4"><Palette className="h-5 w-5 text-purple-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Tema Tampilan</h2></div>
                                <div className="space-y-3">
                                    {[{ mode: 'light' as const, icon: Sun, label: 'Terang', desc: 'Tampilan cerah untuk siang hari' }, { mode: 'dark' as const, icon: Moon, label: 'Gelap', desc: 'Tampilan gelap untuk malam hari' }, { mode: 'system' as const, icon: Monitor, label: 'Sistem', desc: 'Ikuti pengaturan sistem' }].map(({ mode, icon: Icon, label, desc }) => (
                                        <button key={mode} onClick={() => updateAppearance(mode)} className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${appearance === mode ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'}`}>
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${appearance === mode ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}><Icon className="h-5 w-5" /></div>
                                            <div className="text-left"><p className="font-medium text-slate-900 dark:text-white">{label}</p><p className="text-xs text-slate-500">{desc}</p></div>
                                            {appearance === mode && <CheckCircle className="h-5 w-5 text-blue-600 ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div 
                            className="grid gap-6 lg:grid-cols-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div 
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                            >
                                <div className="flex items-center gap-2 mb-4"><KeyRound className="h-5 w-5 text-amber-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Ganti Password</h2></div>
                                <form onSubmit={submitPassword} className="space-y-4">
                                    <div><Label className="text-slate-700 dark:text-slate-300">Password Saat Ini</Label><div className="relative mt-1"><Input type={showCurrentPassword ? 'text' : 'password'} value={passwordForm.data.current_password} onChange={e => passwordForm.setData('current_password', e.target.value)} className="pr-10 dark:bg-black dark:border-slate-700" /><button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div><InputError message={passwordForm.errors.current_password} /></div>
                                    <div><Label className="text-slate-700 dark:text-slate-300">Password Baru</Label><div className="relative mt-1"><Input type={showNewPassword ? 'text' : 'password'} value={passwordForm.data.password} onChange={e => passwordForm.setData('password', e.target.value)} className="pr-10 dark:bg-black dark:border-slate-700" /><button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div><InputError message={passwordForm.errors.password} /></div>
                                    <div><Label className="text-slate-700 dark:text-slate-300">Konfirmasi Password Baru</Label><div className="relative mt-1"><Input type={showConfirmPassword ? 'text' : 'password'} value={passwordForm.data.password_confirmation} onChange={e => passwordForm.setData('password_confirmation', e.target.value)} className="pr-10 dark:bg-black dark:border-slate-700" /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div><InputError message={passwordForm.errors.password_confirmation} /></div>
                                    <Button type="submit" disabled={passwordForm.processing} className="w-full"><Lock className="h-4 w-4 mr-2" />{passwordForm.processing ? 'Menyimpan...' : 'Ubah Password'}</Button>
                                </form>
                            </motion.div>
                            <motion.div 
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                            >
                                <div className="flex items-center gap-2 mb-4"><Fingerprint className="h-5 w-5 text-green-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Autentikasi Dua Faktor (2FA)</h2></div>
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-xl border ${is2FAEnabled ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'}`}>
                                        <div className="flex items-center gap-3">
                                            {is2FAEnabled ? <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> : <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
                                            <div><p className={`font-medium ${is2FAEnabled ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>{is2FAEnabled ? '2FA Aktif' : '2FA Tidak Aktif'}</p><p className="text-xs text-slate-500 dark:text-slate-400">{is2FAEnabled ? 'Akun Anda dilindungi dengan autentikasi dua faktor' : 'Aktifkan 2FA untuk keamanan tambahan'}</p></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Autentikasi dua faktor menambahkan lapisan keamanan ekstra dengan memerlukan kode verifikasi dari aplikasi authenticator saat login.</p>
                                    <a href="/admin/profile" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 text-sm font-medium transition-colors"><UserCog className="h-4 w-4" />Kelola 2FA di Profil</a>
                                </div>
                            </motion.div>
                            <motion.div 
                                className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                whileHover={{ scale: 1.01, y: -4 }}
                            >
                                <div className="flex items-center gap-2 mb-4"><History className="h-5 w-5 text-indigo-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Sesi Aktif</h2></div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Kelola sesi login aktif Anda di berbagai perangkat.</p>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"><Globe className="h-5 w-5" /></div>
                                        <div className="flex-1"><p className="font-medium text-slate-900 dark:text-white">Sesi Saat Ini</p><p className="text-xs text-slate-500">Browser ini - Aktif sekarang</p></div>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Aktif</span>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {activeTab === 'notifications' && (
                        <motion.div 
                            className="grid gap-6 lg:grid-cols-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div 
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                            >
                                <div className="flex items-center gap-2 mb-4"><Bell className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Pengaturan Notifikasi</h2></div>
                                <form onSubmit={submitNotifications} className="space-y-4">
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-black/50 cursor-pointer">
                                            <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-slate-500" /><div><p className="font-medium text-slate-900 dark:text-white">Notifikasi Email</p><p className="text-xs text-slate-500">Terima notifikasi via email</p></div></div>
                                            <Checkbox checked={notificationForm.data.email_notifications} onCheckedChange={(c) => notificationForm.setData('email_notifications', !!c)} />
                                        </label>
                                        <label className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-black/50 cursor-pointer">
                                            <div className="flex items-center gap-3"><Smartphone className="h-5 w-5 text-slate-500" /><div><p className="font-medium text-slate-900 dark:text-white">Push Notification</p><p className="text-xs text-slate-500">Terima notifikasi push di browser</p></div></div>
                                            <Checkbox checked={notificationForm.data.push_notifications} onCheckedChange={(c) => notificationForm.setData('push_notifications', !!c)} />
                                        </label>
                                    </div>
                                    <Button type="submit" disabled={notificationForm.processing} className="w-full"><Save className="h-4 w-4 mr-2" />{notificationForm.processing ? 'Menyimpan...' : 'Simpan Notifikasi'}</Button>
                                </form>
                            </motion.div>
                            <motion.div 
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                            >
                                <div className="flex items-center gap-2 mb-4"><FileText className="h-5 w-5 text-green-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Laporan Otomatis</h2></div>
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-black/50 cursor-pointer">
                                        <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-slate-500" /><div><p className="font-medium text-slate-900 dark:text-white">Laporan Harian</p><p className="text-xs text-slate-500">Ringkasan kehadiran setiap hari</p></div></div>
                                        <Checkbox checked={notificationForm.data.daily_report} onCheckedChange={(c) => notificationForm.setData('daily_report', !!c)} />
                                    </label>
                                    <label className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-black/50 cursor-pointer">
                                        <div className="flex items-center gap-3"><BarChart3 className="h-5 w-5 text-slate-500" /><div><p className="font-medium text-slate-900 dark:text-white">Laporan Mingguan</p><p className="text-xs text-slate-500">Statistik kehadiran mingguan</p></div></div>
                                        <Checkbox checked={notificationForm.data.weekly_report} onCheckedChange={(c) => notificationForm.setData('weekly_report', !!c)} />
                                    </label>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {activeTab === 'advanced' && (
                        <motion.div 
                            className="grid gap-6 lg:grid-cols-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div 
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                            >
                                <div className="flex items-center gap-2 mb-4"><Lock className="h-5 w-5 text-red-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Keamanan Login</h2></div>
                                <form onSubmit={submitAdvanced} className="space-y-4">
                                    <div><Label className="text-slate-700 dark:text-slate-300">Maksimal Percobaan Login</Label><Input type="number" value={advancedForm.data.max_login_attempts} onChange={e => advancedForm.setData('max_login_attempts', parseInt(e.target.value))} className="mt-1 dark:bg-black dark:border-slate-700" /><p className="text-xs text-slate-500 mt-1">Jumlah percobaan sebelum akun dikunci (3-10)</p></div>
                                    <div><Label className="text-slate-700 dark:text-slate-300">Durasi Lockout (menit)</Label><Input type="number" value={advancedForm.data.lockout_duration} onChange={e => advancedForm.setData('lockout_duration', parseInt(e.target.value))} className="mt-1 dark:bg-black dark:border-slate-700" /><p className="text-xs text-slate-500 mt-1">Durasi akun dikunci setelah gagal login (5-60)</p></div>
                                    <div><Label className="text-slate-700 dark:text-slate-300">Session Lifetime (menit)</Label><Input type="number" value={advancedForm.data.session_lifetime} onChange={e => advancedForm.setData('session_lifetime', parseInt(e.target.value))} className="mt-1 dark:bg-black dark:border-slate-700" /><p className="text-xs text-slate-500 mt-1">Durasi sesi login aktif (30-480)</p></div>
                                    <Button type="submit" disabled={advancedForm.processing} className="w-full"><Save className="h-4 w-4 mr-2" />{advancedForm.processing ? 'Menyimpan...' : 'Simpan Keamanan'}</Button>
                                </form>
                            </motion.div>
                            <motion.div 
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                            >
                                <div className="flex items-center gap-2 mb-4"><Zap className="h-5 w-5 text-purple-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Verifikasi AI</h2></div>
                                <div className="space-y-4">
                                    <label className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-black/50 cursor-pointer">
                                        <div className="flex items-center gap-3"><Activity className="h-5 w-5 text-slate-500" /><div><p className="font-medium text-slate-900 dark:text-white">Verifikasi AI</p><p className="text-xs text-slate-500">Aktifkan verifikasi wajah dengan AI</p></div></div>
                                        <Checkbox checked={advancedForm.data.ai_verification_enabled} onCheckedChange={(c) => advancedForm.setData('ai_verification_enabled', !!c)} />
                                    </label>
                                    <div><Label className="text-slate-700 dark:text-slate-300">Threshold Kecocokan Wajah (%)</Label><Input type="number" value={advancedForm.data.face_match_threshold} onChange={e => advancedForm.setData('face_match_threshold', parseInt(e.target.value))} className="mt-1 dark:bg-black dark:border-slate-700" /><p className="text-xs text-slate-500 mt-1">Persentase minimum kecocokan wajah (50-99)</p></div>
                                    <label className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-black/50 cursor-pointer">
                                        <div className="flex items-center gap-3"><Eye className="h-5 w-5 text-slate-500" /><div><p className="font-medium text-slate-900 dark:text-white">Deteksi Blur</p><p className="text-xs text-slate-500">Tolak foto yang blur/tidak jelas</p></div></div>
                                        <Checkbox checked={advancedForm.data.blur_detection_enabled} onCheckedChange={(c) => advancedForm.setData('blur_detection_enabled', !!c)} />
                                    </label>
                                    <label className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-black/50 cursor-pointer">
                                        <div className="flex items-center gap-3"><CheckCircle className="h-5 w-5 text-slate-500" /><div><p className="font-medium text-slate-900 dark:text-white">Auto Approve</p><p className="text-xs text-slate-500">Otomatis setujui jika verifikasi berhasil</p></div></div>
                                        <Checkbox checked={advancedForm.data.auto_approve_verified} onCheckedChange={(c) => advancedForm.setData('auto_approve_verified', !!c)} />
                                    </label>
                                </div>
                            </motion.div>
                            <motion.div 
                                className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                whileHover={{ scale: 1.01, y: -4 }}
                            >
                                <div className="flex items-center gap-2 mb-4"><AlertTriangle className="h-5 w-5 text-amber-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Mode Maintenance</h2></div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${advancedForm.data.maintenance_mode ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}><AlertTriangle className="h-5 w-5" /></div>
                                        <div><p className="font-medium text-slate-900 dark:text-white">Mode Maintenance</p><p className="text-xs text-slate-500">Nonaktifkan akses pengguna sementara</p></div>
                                    </div>
                                    <Checkbox checked={advancedForm.data.maintenance_mode} onCheckedChange={(c) => advancedForm.setData('maintenance_mode', !!c)} />
                                </div>
                                {advancedForm.data.maintenance_mode && <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">⚠️ Mode maintenance aktif. Pengguna tidak dapat mengakses sistem.</p>}
                            </motion.div>
                        </motion.div>
                    )}

                    {activeTab === 'system' && (
                        <motion.div 
                            className="grid gap-6 lg:grid-cols-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div 
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                            >
                                <div className="flex items-center gap-2 mb-4"><Server className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Informasi Server</h2></div>
                                <div className="space-y-2">
                                    {[{ label: 'PHP Version', value: systemInfo.php_version }, { label: 'Laravel Version', value: systemInfo.laravel_version }, { label: 'Server Time', value: systemInfo.server_time }, { label: 'Timezone', value: systemInfo.timezone }, { label: 'Environment', value: systemInfo.environment }, { label: 'Debug Mode', value: systemInfo.debug_mode ? 'Aktif' : 'Nonaktif' }, { label: 'Database', value: systemInfo.db_connection }, { label: 'Cache Driver', value: systemInfo.cache_driver }].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-black/50"><span className="text-sm text-slate-500">{label}</span><span className="text-sm font-medium text-slate-900 dark:text-white">{value}</span></div>
                                    ))}
                                </div>
                            </motion.div>
                            <motion.div 
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                            >
                                <div className="flex items-center gap-2 mb-4"><HardDrive className="h-5 w-5 text-green-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Penyimpanan</h2></div>
                                <div className="space-y-4">
                                    <div className="relative h-4 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                        <div className={`absolute inset-y-0 left-0 rounded-full transition-all ${storageInfo.used_percentage > 90 ? 'bg-red-500' : storageInfo.used_percentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${storageInfo.used_percentage}%` }} />
                                    </div>
                                    <div className="flex justify-between text-sm"><span className="text-slate-500">Terpakai: {formatBytes(storageInfo.total_space - storageInfo.free_space)}</span><span className="text-slate-500">Total: {formatBytes(storageInfo.total_space)}</span></div>
                                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-black/50"><div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-400">Ruang Tersedia</span><span className="text-lg font-bold text-slate-900 dark:text-white">{formatBytes(storageInfo.free_space)}</span></div></div>
                                </div>
                            </motion.div>
                            <motion.div 
                                className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                whileHover={{ scale: 1.01, y: -4 }}
                            >
                                <div className="flex items-center gap-2 mb-4"><Database className="h-5 w-5 text-purple-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Aksi Sistem</h2></div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <button onClick={clearCache} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 dark:border-slate-700 dark:hover:border-red-800 dark:hover:bg-red-900/20 transition-all">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"><Trash2 className="h-5 w-5" /></div>
                                        <div className="text-left"><p className="font-medium text-slate-900 dark:text-white">Bersihkan Cache</p><p className="text-xs text-slate-500">Hapus semua cache aplikasi</p></div>
                                    </button>
                                    <button onClick={optimizeSystem} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-800 dark:hover:bg-blue-900/20 transition-all">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"><RefreshCw className="h-5 w-5" /></div>
                                        <div className="text-left"><p className="font-medium text-slate-900 dark:text-white">Optimasi Sistem</p><p className="text-xs text-slate-500">Cache config, route, dan view</p></div>
                                    </button>
                                </div>
                            </motion.div>
                            <motion.div 
                                className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ scale: 1.01, y: -4 }}
                            >
                                <div className="flex items-center gap-2 mb-4"><Activity className="h-5 w-5 text-emerald-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Status Layanan</h2></div>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {[{ name: 'Database', status: true, icon: Database }, { name: 'Cache', status: true, icon: Zap }, { name: 'Storage', status: storageInfo.used_percentage < 95, icon: HardDrive }].map(({ name, status, icon: Icon }) => (
                                        <div key={name} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-black/50">
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${status ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}><Icon className="h-4 w-4" /></div>
                                            <div><p className="text-sm font-medium text-slate-900 dark:text-white">{name}</p><p className={`text-xs ${status ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{status ? 'Online' : 'Offline'}</p></div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
