import { useState, useRef, useEffect } from 'react';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import ProfileCard from '@/components/ui/profile-card';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Shield,
    Eye,
    EyeOff,
    CheckCircle2,
    KeyRound,
    Mail,
    IdCard,
    Sparkles,
    AlertCircle,
    Lock,
    TrendingUp,
    Camera,
    Upload,
    CreditCard,
    Award,
    Trophy,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MahasiswaInfo {
    id: number;
    nama: string;
    nim: string;
    email?: string;
    avatar_url?: string;
}

interface Stats {
    totalAttendance: number;
    attendanceRate: number;
    currentStreak: number;
}

interface Badge {
    id: number;
    type: string;
    name: string;
    level: number;
    maxLevel: number;
    icon: string;
    unlocked: boolean;
    progress: number;
    target: number;
}

interface PageProps {
    mahasiswa: MahasiswaInfo;
    stats?: Stats;
    badges?: Badge[];
}

type TabType = 'card' | 'profile' | 'security';

// Badge Image component for profile
const BadgeImageProfile = ({ icon, name }: { icon: string; name: string }) => {
    const [imageError, setImageError] = useState(false);

    if (imageError || !icon) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500">
                <Award className="h-5 w-5 text-white" />
            </div>
        );
    }

    return (
        <img
            src={`/images/badges/${icon}`}
            alt={name}
            className="h-full w-full object-contain"
            onError={() => setImageError(true)}
        />
    );
};

export default function StudentProfile() {
    const { props } = usePage<{ props: PageProps; flash?: { success?: string } }>();
    const { mahasiswa, flash } = props as unknown as PageProps & { flash?: { success?: string } };
    const stats = (props as unknown as PageProps).stats ?? {
        totalAttendance: 0,
        attendanceRate: 0,
        currentStreak: 0,
    };
    const badges = (props as unknown as PageProps).badges ?? [];

    const [activeTab, setActiveTab] = useState<TabType>('card');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showFlash, setShowFlash] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Auto-hide flash message after 2 seconds
    useEffect(() => {
        if (flash?.success) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    // Profile form
    const profileForm = useForm({
        nama: mahasiswa.nama ?? '',
    });

    // Password form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.patch('/user/profile', {
            onSuccess: () => {
                setSuccessMessage('Profil berhasil diperbarui!');
                setTimeout(() => setSuccessMessage(null), 200);
            },
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.patch('/user/password', {
            onSuccess: () => {
                passwordForm.reset('current_password', 'password', 'password_confirmation');
                setSuccessMessage('Password berhasil diubah!');
                setTimeout(() => setSuccessMessage(null), 2000);
            },
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
        router.post('/user/profile/avatar', formData, {
            forceFormData: true,
            onSuccess: () => {
                setSuccessMessage('Foto profil berhasil diperbarui!');
                setAvatarPreview(null);
                if (avatarInputRef.current) avatarInputRef.current.value = '';
                setTimeout(() => setSuccessMessage(null), 2000);
            },
            onFinish: () => setIsUploadingAvatar(false),
        });
    };

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const tabs = [
        { key: 'card' as TabType, label: 'Kartu Profil', icon: CreditCard },
        { key: 'profile' as TabType, label: 'Edit Profil', icon: User },
        { key: 'security' as TabType, label: 'Keamanan', icon: Shield },
    ];

    const avatarUrl = avatarPreview || mahasiswa.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(mahasiswa.nama)}&background=10b981&color=fff&size=400&bold=true`;

    return (
        <StudentLayout>
            <Head title="Profil" />

            <div className="p-6 space-y-6">
                {/* Success Toast dengan animasi */}
                <AnimatePresence>
                    {(successMessage || (showFlash && flash?.success)) && (
                        <motion.div
                            initial={{ opacity: 0, x: 100, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.8 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="fixed right-6 top-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-lg backdrop-blur dark:border-emerald-200/30 dark:bg-emerald-500/10 dark:text-emerald-100"
                        >
                            <Sparkles className="mt-0.5 h-5 w-5 text-emerald-500" />
                            <div>
                                <p className="font-semibold">Berhasil!</p>
                                <p className="text-xs text-emerald-700/70 dark:text-emerald-100/80">
                                    {successMessage || flash?.success || ''}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header Card dengan animasi */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-2xl"
                >
                    {/* Animated background particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, -90, 0],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl"
                        />
                    </div>

                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {/* Avatar dengan animasi */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur text-2xl font-bold overflow-hidden"
                                >
                                    <img
                                        src={avatarUrl}
                                        alt={mahasiswa.nama}
                                        className="h-full w-full rounded-2xl object-cover"
                                    />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-emerald-100"
                                    >
                                        Profil Mahasiswa
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-2xl font-bold"
                                    >
                                        {mahasiswa.nama}
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-sm text-emerald-100"
                                    >
                                        NIM: {mahasiswa.nim}
                                    </motion.p>
                                </div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-sm">Akun Aktif</span>
                            </motion.div>
                        </div>

                        {/* Quick Stats dengan animasi */}
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            {[
                                { label: 'Total Kehadiran', value: stats.totalAttendance, delay: 0.6 },
                                { label: 'Rata-rata', value: `${stats.attendanceRate}%`, delay: 0.65 },
                                { label: 'Streak', value: `${stats.currentStreak} hari`, delay: 0.7 },
                            ].map((stat) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: stat.delay }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="rounded-xl bg-white/10 p-3 backdrop-blur cursor-pointer"
                                >
                                    <p className="text-xs text-emerald-100">{stat.label}</p>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Badges Section dengan animasi */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                            >
                                <Trophy className="h-5 w-5" />
                            </motion.div>
                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Pencapaian</h2>
                                <p className="text-sm text-slate-500">{badges.filter(b => b.unlocked).length} dari {badges.length} badge terbuka</p>
                            </div>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link 
                                href="/user/achievements" 
                                className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                            >
                                Lihat Semua
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </motion.div>
                    </div>

                    {/* Badges Grid dengan animasi stagger */}
                    <div className="flex flex-wrap gap-3">
                        {badges.map((badge, index) => {
                            const isCompleted = badge.progress >= badge.target;
                            const shouldShow = badge.unlocked || isCompleted;
                            
                            return (
                                <motion.div
                                    key={badge.id}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 + index * 0.05, type: "spring", stiffness: 200 }}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    onClick={() => router.get(`/user/achievements/${badge.type}`)}
                                    className={cn(
                                        'group relative cursor-pointer',
                                        !shouldShow && 'opacity-40 grayscale'
                                    )}
                                    title={`${badge.name} - Lv ${badge.level}/${badge.maxLevel}`}
                                >
                                    <div className="h-14 w-14 transition-transform">
                                        {shouldShow ? (
                                            <BadgeImageProfile 
                                                icon={badge.icon} 
                                                name={badge.name}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                                                <Lock className="h-4 w-4 text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                            {badge.name}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Tab Navigation dengan animasi */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-2 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                >
                    <div className="flex gap-2">
                        {tabs.map((tab, index) => {
                            const Icon = tab.icon;
                            return (
                                <motion.button
                                    key={tab.key}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={cn(
                                        'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                                        activeTab === tab.key
                                            ? 'bg-emerald-500 text-white shadow-md'
                                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Tab Content dengan AnimatePresence */}
                <AnimatePresence mode="wait">
                    {activeTab === 'card' && (
                        <motion.div
                            key="card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center justify-center py-8"
                        >
                            <ProfileCard
                                name={mahasiswa.nama}
                                title="Mahasiswa"
                                handle={mahasiswa.nim}
                                status="Aktif"
                                avatarUrl={avatarUrl}
                                contactText="Edit Profil"
                                showUserInfo={true}
                                enableTilt={true}
                                behindGlowColor="rgba(16, 185, 129, 0.6)"
                                innerGradient="linear-gradient(145deg, #10b98144 0%, #14b8a644 100%)"
                                onContactClick={() => setActiveTab('profile')}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid gap-6 lg:grid-cols-2"
                        >
                            {/* Edit Profile Form dengan animasi */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                            >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Edit Profil</h2>
                                    <p className="text-sm text-slate-500">Perbarui informasi akun kamu</p>
                                </div>
                            </div>

                            <form onSubmit={handleProfileSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nama" className="text-slate-700 dark:text-white">
                                        Nama Lengkap
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="nama"
                                            value={profileForm.data.nama}
                                            onChange={e => profileForm.setData('nama', e.target.value)}
                                            className="pl-10"
                                            placeholder="Nama lengkap"
                                        />
                                    </div>
                                    <InputError message={profileForm.errors.nama} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nim" className="text-slate-700 dark:text-white">
                                        NIM
                                    </Label>
                                    <div className="relative">
                                        <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="nim"
                                            value={mahasiswa.nim}
                                            disabled
                                            className="pl-10 bg-slate-50 dark:bg-black"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">NIM tidak dapat diubah</p>
                                </div>

                                {mahasiswa.email && (
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-slate-700 dark:text-white">
                                            Email
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <Input
                                                id="email"
                                                value={mahasiswa.email}
                                                disabled
                                                className="pl-10 bg-slate-50 dark:bg-black"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-slate-700 dark:text-white">Foto Profil</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            <img src={avatarUrl} alt="Preview" className="h-full w-full object-cover" />
                                            {avatarPreview && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20">
                                                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" id="avatar-upload" />
                                            <div className="flex gap-2">
                                                <Button type="button" variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()} className="flex items-center gap-2">
                                                    <Camera className="h-4 w-4" />
                                                    Pilih Foto
                                                </Button>
                                                {avatarPreview && (
                                                    <Button type="button" size="sm" onClick={handleAvatarUpload} disabled={isUploadingAvatar} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600">
                                                        <Upload className="h-4 w-4" />
                                                        {isUploadingAvatar ? 'Uploading...' : 'Upload'}
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500">PNG, JPG max 2MB</p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                                    disabled={profileForm.processing}
                                >
                                    {profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </form>
                            </motion.div>

                            {/* Account Info Card dengan animasi */}
                            <div className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                                >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                                        <IdCard className="h-5 w-5" />
                                    </div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Informasi Akun</h2>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black">
                                        <span className="text-sm text-slate-500">Nama</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{mahasiswa.nama}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black">
                                        <span className="text-sm text-slate-500">NIM</span>
                                        <span className="font-medium text-slate-900 dark:text-white">{mahasiswa.nim}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black">
                                        <span className="text-sm text-slate-500">Status</span>
                                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span className="font-medium">Aktif</span>
                                        </span>
                                    </div>
                                </div>
                                </motion.div>

                                {/* Stats Card dengan animasi */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-black to-slate-800 p-6 text-white shadow-sm dark:from-slate-800 dark:to-black"
                                >
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                                    <h2 className="font-semibold">Statistik Kehadiran</h2>
                                </div>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-bold">
                                        <AnimatedCounter value={stats.attendanceRate} suffix="%" />
                                    </span>
                                    <span className="text-slate-400 mb-1">rata-rata</span>
                                </div>
                                <Progress value={stats.attendanceRate} className="mt-4 h-2 bg-slate-700" />
                                <p className="text-xs text-slate-400 mt-2">
                                    {stats.totalAttendance} total kehadiran • {stats.currentStreak} hari streak
                                </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid gap-6 lg:grid-cols-2"
                        >
                            {/* Change Password Form dengan animasi */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                            >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                                    <KeyRound className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Ganti Password</h2>
                                    <p className="text-sm text-slate-500">Perbarui password untuk keamanan</p>
                                </div>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current_password" className="text-slate-700 dark:text-white">
                                        Password Saat Ini
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="current_password"
                                            type={showCurrent ? 'text' : 'password'}
                                            value={passwordForm.data.current_password}
                                            onChange={e => passwordForm.setData('current_password', e.target.value)}
                                            className="pl-10 pr-10"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrent(!showCurrent)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <InputError message={passwordForm.errors.current_password} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-slate-700 dark:text-white">
                                        Password Baru
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="password"
                                            type={showNew ? 'text' : 'password'}
                                            value={passwordForm.data.password}
                                            onChange={e => passwordForm.setData('password', e.target.value)}
                                            className="pl-10 pr-10"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNew(!showNew)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <InputError message={passwordForm.errors.password} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-slate-700 dark:text-white">
                                        Konfirmasi Password Baru
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="password_confirmation"
                                            type={showConfirm ? 'text' : 'password'}
                                            value={passwordForm.data.password_confirmation}
                                            onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                            className="pl-10 pr-10"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <InputError message={passwordForm.errors.password_confirmation} />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-violet-500 hover:bg-violet-600 text-white"
                                    disabled={passwordForm.processing}
                                >
                                    {passwordForm.processing ? 'Menyimpan...' : 'Ubah Password'}
                                </Button>
                            </form>
                            </motion.div>

                            {/* Security Tips dengan animasi */}
                            <div className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                                >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Tips Keamanan</h2>
                                </div>

                                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>Gunakan minimal 8 karakter</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>Kombinasikan huruf besar, kecil, dan angka</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>Hindari menggunakan NIM atau tanggal lahir</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>Jangan gunakan password yang sama dengan akun lain</span>
                                    </li>
                                </ul>
                                </motion.div>

                                {/* Account Security Status dengan animasi */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-sm"
                                >
                                <div className="flex items-center gap-3 mb-4">
                                    <Shield className="h-6 w-6" />
                                    <h2 className="font-semibold">Status Keamanan</h2>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="font-medium">Akun Terlindungi</span>
                                </div>
                                <p className="text-sm text-emerald-100">
                                    Password terakhir diubah lebih dari 30 hari yang lalu. Pertimbangkan untuk mengubahnya secara berkala.
                                </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </StudentLayout>
    );
}
