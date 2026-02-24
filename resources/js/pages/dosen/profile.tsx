import { useState, useRef, useEffect } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import ProfileCard from '@/components/ui/profile-card';
import {
    User, Shield, Eye, EyeOff, CheckCircle2, Mail, IdCard, Sparkles,
    Lock, Phone, BookOpen, Calendar, BadgeCheck, Camera, Upload,
    Edit3, Save, X, Award, Activity, TrendingUp, ChevronRight, CreditCard,
    Globe, MapPin, Clock, Star, Zap, FileText, Settings, Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════ */
/*                     TYPES                          */
/* ═══════════════════════════════════════════════════ */
interface DosenInfo {
    id: number;
    nama: string;
    nidn: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    initials: string;
}

interface Stats {
    totalCourses: number;
    totalSessions: number;
    totalVerifications: number;
}

interface PageProps {
    dosen: DosenInfo;
    stats: Stats;
}

type TabType = 'overview' | 'card' | 'edit' | 'security';

/* ═══════════════════════════════════════════════════ */
/*              ANIMATION VARIANTS                    */
/* ═══════════════════════════════════════════════════ */
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } } } as const;
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

/* ═══════════════════════════════════════════════════ */
/*                 MAIN COMPONENT                     */
/* ═══════════════════════════════════════════════════ */
export default function DosenProfile() {
    const { props } = usePage<{ props: PageProps; flash?: { success?: string } }>();
    const { dosen, flash } = props as unknown as PageProps & { flash?: { success?: string } };
    const stats = (props as unknown as PageProps).stats ?? { totalCourses: 0, totalSessions: 0, totalVerifications: 0 };

    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showFlash, setShowFlash] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    const profileForm = useForm({ nama: dosen.nama ?? '', email: dosen.email ?? '', phone: dosen.phone ?? '' });
    const passwordForm = useForm({ current_password: '', password: '', password_confirmation: '' });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.patch('/dosen/profile', {
            onSuccess: () => { setSuccessMessage('Profil berhasil diperbarui!'); setTimeout(() => setSuccessMessage(null), 3000); },
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.patch('/dosen/profile/password', {
            onSuccess: () => { passwordForm.reset('current_password', 'password', 'password_confirmation'); setSuccessMessage('Password berhasil diubah!'); setTimeout(() => setSuccessMessage(null), 3000); },
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => setAvatarPreview(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleAvatarUpload = () => {
        const file = avatarInputRef.current?.files?.[0];
        if (!file) return;
        setIsUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', file);
        router.post('/dosen/profile/avatar', formData, {
            forceFormData: true,
            onSuccess: () => { setSuccessMessage('Foto profil berhasil diperbarui!'); setAvatarPreview(null); if (avatarInputRef.current) avatarInputRef.current.value = ''; setTimeout(() => setSuccessMessage(null), 3000); },
            onFinish: () => setIsUploadingAvatar(false),
        });
    };

    const avatarUrl = avatarPreview || dosen.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(dosen.nama)}&background=6366f1&color=fff&size=400&bold=true`;

    const tabs = [
        { key: 'overview' as TabType, label: 'Overview', icon: User, desc: 'Ringkasan profil' },
        { key: 'card' as TabType, label: 'Kartu Profil', icon: CreditCard, desc: 'Kartu interaktif' },
        { key: 'edit' as TabType, label: 'Edit Profil', icon: Edit3, desc: 'Ubah data diri' },
        { key: 'security' as TabType, label: 'Keamanan', icon: Shield, desc: 'Password & akses' },
    ];

    const statCards = [
        { icon: BookOpen, label: 'Mata Kuliah', val: stats.totalCourses, sub: 'Aktif semester ini', color: 'from-blue-500 to-indigo-600', glow: 'bg-blue-500' },
        { icon: Calendar, label: 'Total Sesi', val: stats.totalSessions, sub: 'Sesi perkuliahan', color: 'from-purple-500 to-violet-600', glow: 'bg-purple-500' },
        { icon: BadgeCheck, label: 'Verifikasi', val: stats.totalVerifications, sub: 'Kehadiran berhasil', color: 'from-emerald-500 to-teal-600', glow: 'bg-emerald-500' },
    ];

    return (
        <DosenLayout>
            <Head title="Profil Dosen" />

            {/* ═══ Success Toast ═══ */}
            <AnimatePresence>
                {(successMessage || (showFlash && flash?.success)) && (
                    <motion.div initial={{ opacity: 0, y: -20, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: -20, x: 20 }}
                        className="fixed right-6 top-6 z-50 flex items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-2xl backdrop-blur dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-200">
                        <div className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-800/50"><CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" /></div>
                        <div><p className="font-bold">Berhasil!</p><p className="text-xs opacity-80">{successMessage || flash?.success}</p></div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-4 md:p-6 space-y-6">

                {/* ═══════════════════════════════════════════════════ */}
                {/*  HERO PROFILE CARD (Inspired by reference image)  */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white dark:bg-neutral-950 shadow-2xl">
                    {/* ─── Gradient Banner ─── */}
                    <div className="relative h-44 md:h-56 overflow-hidden">
                        <motion.div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500"
                            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                            style={{ backgroundSize: '200% 200%' }} />
                        {/* Decorative elements */}
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px, 60px 60px' }} />
                        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
                        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-pink-400/20 blur-3xl" />
                        <div className="absolute right-1/3 top-1/3 h-32 w-32 rounded-full bg-indigo-300/15 blur-3xl" />
                        {/* Animated orbs */}
                        {[0, 1, 2].map(i => (
                            <motion.div key={i} className="absolute rounded-full bg-white/10"
                                style={{ width: 12 + i * 8, height: 12 + i * 8, left: `${20 + i * 30}%`, top: `${30 + i * 15}%` }}
                                animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }} />
                        ))}
                        {/* Action buttons on banner */}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                className="p-2.5 rounded-xl bg-black/20 backdrop-blur-xl border border-white/10 text-white hover:bg-black/30 transition-colors">
                                <Share2 className="h-4 w-4" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab('edit')}
                                className="p-2.5 rounded-xl bg-black/20 backdrop-blur-xl border border-white/10 text-white hover:bg-black/30 transition-colors">
                                <Settings className="h-4 w-4" />
                            </motion.button>
                        </div>
                    </div>

                    {/* ─── Profile Info Section ─── */}
                    <div className="relative px-6 md:px-8 pb-6">
                        {/* Avatar - overlapping the banner */}
                        <div className="flex flex-col items-center -mt-16 md:-mt-20">
                            <motion.div className="relative group" whileHover={{ scale: 1.02 }}>
                                {/* Glow ring */}
                                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-75 blur-sm group-hover:opacity-100 transition-opacity" />
                                {/* Avatar container */}
                                <div className="relative h-28 w-28 md:h-36 md:w-36 rounded-full overflow-hidden border-4 border-white dark:border-neutral-950 shadow-2xl">
                                    <img src={avatarUrl} alt={dosen.nama} className="h-full w-full object-cover" />
                                    {/* Hover overlay for camera */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                        onClick={() => avatarInputRef.current?.click()}>
                                        <Camera className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                {/* Verified badge */}
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' as const }}
                                    className="absolute -bottom-1 -right-1 h-9 w-9 md:h-10 md:w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 border-3 border-white dark:border-neutral-950 flex items-center justify-center shadow-lg">
                                    <CheckCircle2 className="h-5 w-5 text-white" />
                                </motion.div>
                            </motion.div>

                            {/* Hidden file input */}
                            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

                            {/* Avatar upload button (appears on preview) */}
                            <AnimatePresence>
                                {avatarPreview && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex gap-2 mt-3">
                                        <Button size="sm" className="bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg" onClick={handleAvatarUpload} disabled={isUploadingAvatar}>
                                            <Upload className="h-3.5 w-3.5 mr-1.5" />{isUploadingAvatar ? 'Mengunggah...' : 'Simpan Foto'}
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => { setAvatarPreview(null); if (avatarInputRef.current) avatarInputRef.current.value = ''; }}>
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Name & Info */}
                            <div className="mt-4 text-center space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{dosen.nama}</h1>
                                    <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                                        <Sparkles className="h-5 w-5 text-amber-500" />
                                    </motion.div>
                                </div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">@{dosen.nidn}</p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-300">Dosen Pengajar Tetap</p>

                                {/* Info pills */}
                                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                                        <Mail className="h-3 w-3" />{dosen.email}
                                    </div>
                                    {dosen.phone && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                                            <Phone className="h-3 w-3" />{dosen.phone}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />Aktif
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center justify-center gap-3 mt-4">
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow px-6"
                                            onClick={() => setActiveTab('edit')}>
                                            <Edit3 className="h-4 w-4 mr-2" /> Edit Profil
                                        </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Button variant="outline" className="border-neutral-300 dark:border-neutral-700 px-6" onClick={() => avatarInputRef.current?.click()}>
                                            <Camera className="h-4 w-4 mr-2" /> Ganti Foto
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-neutral-200/60 dark:border-neutral-800">
                            {statCards.map((s, i) => (
                                <motion.div key={i} variants={itemVariants} whileHover={{ y: -4, scale: 1.02 }}
                                    className="group relative text-center p-4 md:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 hover:shadow-lg transition-all cursor-pointer overflow-hidden">
                                    <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                                        className={`absolute -top-4 -right-4 h-20 w-20 rounded-full ${s.glow} blur-2xl`} />
                                    <div className="relative">
                                        <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow-lg mb-3`}>
                                            <s.icon className="h-5 w-5" />
                                        </div>
                                        <p className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{s.val}</p>
                                        <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 mt-1 uppercase tracking-wider">{s.label}</p>
                                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">{s.sub}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/*                  TAB NAVIGATION                    */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-1.5 backdrop-blur-xl shadow-lg">
                    <div className="flex gap-1">
                        {tabs.map(tab => (
                            <motion.button key={tab.key} onClick={() => setActiveTab(tab.key)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                                    activeTab === tab.key
                                        ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/20"
                                        : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800")}>
                                <tab.icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/*                  TAB CONTENT                       */}
                {/* ═══════════════════════════════════════════════════ */}
                <AnimatePresence mode="wait">
                    {/* ─── CARD TAB ─── */}
                    {activeTab === 'card' && (
                        <motion.div key="card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}
                            className="flex flex-col items-center justify-center py-10">
                            <ProfileCard
                                name={dosen.nama}
                                title="Dosen"
                                handle={dosen.nidn}
                                status="Aktif"
                                avatarUrl={avatarUrl}
                                contactText="Edit Profil"
                                showUserInfo={true}
                                enableTilt={true}
                                behindGlowColor="rgba(139, 92, 246, 0.6)"
                                innerGradient="linear-gradient(145deg, #6366f144 0%, #a855f744 100%)"
                                onContactClick={() => setActiveTab('edit')}
                            />
                            <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-md">Gerakkan mouse di atas kartu untuk efek 3D interaktif. Klik tombol untuk mengedit profil.</p>
                        </motion.div>
                    )}

                    {/* ─── OVERVIEW TAB ─── */}
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {/* Personal Information */}
                            <div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
                                <div className="p-5 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600"><User className="h-4 w-4 text-white" /></div>
                                    <div><h3 className="font-bold text-sm text-neutral-900 dark:text-white">Informasi Personal</h3><p className="text-[11px] text-neutral-500">Data diri dosen</p></div>
                                </div>
                                <div className="p-5 space-y-4">
                                    {[
                                        { icon: User, label: 'Nama Lengkap', val: dosen.nama },
                                        { icon: IdCard, label: 'NIDN', val: dosen.nidn },
                                        { icon: Mail, label: 'Email', val: dosen.email },
                                        { icon: Phone, label: 'Telepon', val: dosen.phone || 'Belum diatur' },
                                    ].map((inf, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                                            <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:text-violet-500 transition-colors">
                                                <inf.icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{inf.label}</p>
                                                <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">{inf.val}</p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Activity & Achievements */}
                            <div className="space-y-5">
                                {/* Quick Stats */}
                                <div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
                                    <div className="p-5 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600"><Award className="h-4 w-4 text-white" /></div>
                                        <div><h3 className="font-bold text-sm text-neutral-900 dark:text-white">Pencapaian</h3><p className="text-[11px] text-neutral-500">Highlight performa</p></div>
                                    </div>
                                    <div className="p-5 space-y-3">
                                        {[
                                            { icon: Star, label: 'Rating Pengajaran', val: '4.8/5.0', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                                            { icon: TrendingUp, label: 'Tingkat Kehadiran', val: '96%', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                                            { icon: Zap, label: 'Response Time', val: 'Cepat', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                                        ].map((ach, i) => (
                                            <div key={i} className={`flex items-center gap-4 p-3 rounded-xl ${ach.bg}`}>
                                                <ach.icon className={`h-5 w-5 ${ach.color}`} />
                                                <div className="flex-1"><p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{ach.label}</p></div>
                                                <span className={`font-bold text-sm ${ach.color}`}>{ach.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Account Status */}
                                <div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
                                    <div className="p-5 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600"><Shield className="h-4 w-4 text-white" /></div>
                                        <div><h3 className="font-bold text-sm text-neutral-900 dark:text-white">Status Akun</h3><p className="text-[11px] text-neutral-500">Keamanan & verifikasi</p></div>
                                    </div>
                                    <div className="p-5 space-y-3">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200/50 dark:border-emerald-800/30">
                                            <div className="flex items-center gap-3"><BadgeCheck className="h-5 w-5 text-emerald-500" /><span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Akun Terverifikasi</span></div>
                                            <Badge className="bg-emerald-500 text-white border-0">Active</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                                            <div className="flex items-center gap-3"><Lock className="h-5 w-5 text-neutral-500" /><span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Password</span></div>
                                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setActiveTab('security')}>Ubah</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── EDIT PROFILE TAB ─── */}
                    {activeTab === 'edit' && (
                        <motion.div key="edit" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                            <div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
                                <div className="p-6 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600"><Edit3 className="h-5 w-5 text-white" /></div>
                                    <div><h3 className="font-bold text-lg text-neutral-900 dark:text-white">Edit Profil</h3><p className="text-xs text-neutral-500">Perbarui informasi personal Anda</p></div>
                                </div>
                                <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
                                    {/* Avatar Section */}
                                    <div className="flex items-center gap-6 p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800">
                                        <div className="relative group">
                                            <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 shadow-lg">
                                                <img src={avatarUrl} alt={dosen.nama} className="h-full w-full object-cover" />
                                            </div>
                                            <button type="button" onClick={() => avatarInputRef.current?.click()}
                                                className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera className="h-5 w-5 text-white" />
                                            </button>
                                        </div>
                                        <div>
                                            <p className="font-bold text-neutral-900 dark:text-white">Foto Profil</p>
                                            <p className="text-xs text-neutral-500 mt-0.5">JPG, PNG max 2MB. Disarankan 400x400px.</p>
                                            <Button type="button" size="sm" variant="outline" className="mt-2 h-8 text-xs" onClick={() => avatarInputRef.current?.click()}>
                                                <Upload className="h-3 w-3 mr-1.5" /> Upload Baru
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Nama Lengkap</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                                <Input value={profileForm.data.nama} onChange={e => profileForm.setData('nama', e.target.value)}
                                                    className="pl-10 h-11 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                                            </div>
                                            <InputError message={profileForm.errors.nama} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">NIDN</Label>
                                            <div className="relative">
                                                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                                <Input value={dosen.nidn} disabled className="pl-10 h-11 bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed opacity-60" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                                <Input type="email" value={profileForm.data.email} onChange={e => profileForm.setData('email', e.target.value)}
                                                    className="pl-10 h-11 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                                            </div>
                                            <InputError message={profileForm.errors.email} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Telepon</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                                <Input value={profileForm.data.phone} onChange={e => profileForm.setData('phone', e.target.value)}
                                                    placeholder="08xx-xxxx-xxxx"
                                                    className="pl-10 h-11 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                                            </div>
                                            <InputError message={profileForm.errors.phone} />
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200/50 dark:border-neutral-800">
                                        <Button type="button" variant="ghost" onClick={() => setActiveTab('overview')}>Batal</Button>
                                        <Button type="submit" className="bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg px-8" disabled={profileForm.processing}>
                                            <Save className="h-4 w-4 mr-2" />{profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── SECURITY TAB ─── */}
                    {activeTab === 'security' && (
                        <motion.div key="security" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                            <div className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
                                <div className="p-6 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600"><Shield className="h-5 w-5 text-white" /></div>
                                    <div><h3 className="font-bold text-lg text-neutral-900 dark:text-white">Keamanan Akun</h3><p className="text-xs text-neutral-500">Ubah password untuk keamanan akun</p></div>
                                </div>
                                <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
                                    {/* Password Fields */}
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Password Saat Ini</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                            <Input type={showCurrent ? 'text' : 'password'} value={passwordForm.data.current_password}
                                                onChange={e => passwordForm.setData('current_password', e.target.value)}
                                                className="pl-10 pr-10 h-11 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                                            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                                                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <InputError message={passwordForm.errors.current_password} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Password Baru</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                                <Input type={showNew ? 'text' : 'password'} value={passwordForm.data.password}
                                                    onChange={e => passwordForm.setData('password', e.target.value)}
                                                    className="pl-10 pr-10 h-11 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                                                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <InputError message={passwordForm.errors.password} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Konfirmasi Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                                <Input type={showConfirm ? 'text' : 'password'} value={passwordForm.data.password_confirmation}
                                                    onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                                    className="pl-10 pr-10 h-11 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security Tips */}
                                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30">
                                        <div className="flex items-start gap-3">
                                            <Shield className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Tips Keamanan</p>
                                                <ul className="text-xs text-amber-700 dark:text-amber-400 mt-1 space-y-1 list-disc list-inside">
                                                    <li>Gunakan minimal 8 karakter</li>
                                                    <li>Kombinasikan huruf besar, kecil, angka, dan simbol</li>
                                                    <li>Jangan gunakan password yang sama dengan akun lain</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit */}
                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200/50 dark:border-neutral-800">
                                        <Button type="button" variant="ghost" onClick={() => setActiveTab('overview')}>Batal</Button>
                                        <Button type="submit" className="bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg px-8" disabled={passwordForm.processing}>
                                            <Lock className="h-4 w-4 mr-2" />{passwordForm.processing ? 'Mengubah...' : 'Ubah Password'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </DosenLayout>
    );
}
