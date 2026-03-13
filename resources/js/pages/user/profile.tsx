import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertCircle,
    Award,
    BadgeCheck,
    BookOpen,
    Camera,
    CheckCircle2,
    ChevronRight,
    Clock,
    CreditCard,
    Edit3,
    Eye,
    EyeOff,
    Flame,
    IdCard,
    KeyRound,
    Lock,
    Mail,
    Phone,
    Save,
    Shield,
    Sparkles,
    Target,
    TrendingUp,
    Trophy,
    Upload,
    User,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import InputError from '@/components/input-error';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProfileCard from '@/components/ui/profile-card';
import { Progress } from '@/components/ui/progress';
import StudentLayout from '@/layouts/student-layout';
import { cn } from '@/lib/utils';

interface MahasiswaInfo {
    id: number;
    nama: string;
    nim: string;
    email?: string | null;
    phone?: string | null;
    avatar_url?: string | null;
    fakultas?: string | null;
    prodi?: string | null;
    kelas?: string | null;
    semester?: string | null;
    jenis_reguler?: string | null;
    last_activity_at?: string | null;
    created_at?: string | null;
}

interface Stats {
    totalAttendance: number;
    attendanceRate: number;
    currentStreak: number;
    onTimeRate: number;
}

interface StudentBadge {
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

interface RecentActivity {
    id: number;
    title: string;
    description: string;
    status: string;
    occurred_at?: string | null;
}

interface PageProps {
    mahasiswa: MahasiswaInfo;
    stats?: Stats;
    badges?: StudentBadge[];
    recentActivities?: RecentActivity[];
    flash?: {
        success?: string;
    };
}

type TabType = 'overview' | 'card' | 'edit' | 'security';
const validTabs: TabType[] = ['overview', 'card', 'edit', 'security'];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 24,
        },
    },
} as const;

const defaultStats: Stats = {
    totalAttendance: 0,
    attendanceRate: 0,
    currentStreak: 0,
    onTimeRate: 0,
};

const BadgeImageProfile = ({ icon, name }: { icon: string; name: string }) => {
    const [imageError, setImageError] = useState(false);

    if (imageError || !icon) {
        return (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
                <Award className="h-5 w-5 text-white" />
            </div>
        );
    }

    return (
        <img
            src={`/images/badges/${icon}`}
            alt={name}
            className="h-full w-full rounded-full object-contain"
            onError={() => setImageError(true)}
        />
    );
};

const formatDateTime = (value?: string | null) => {
    if (!value) return 'Belum tersedia';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Belum tersedia';

    return parsed.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getPasswordStrength = (password: string) => {
    const checks = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /\d/.test(password),
    ];
    const score = checks.filter(Boolean).length;

    if (score <= 1) return { label: 'Lemah', value: 25, color: 'text-red-500' };
    if (score <= 3)
        return { label: 'Sedang', value: 65, color: 'text-amber-500' };
    return { label: 'Kuat', value: 100, color: 'text-emerald-500' };
};

const getTabFromQuery = (search: string): TabType => {
    const tab = new URLSearchParams(search).get('tab');
    if (!tab) return 'overview';
    return validTabs.includes(tab as TabType) ? (tab as TabType) : 'overview';
};

const formatActivityTime = (value?: string | null) => {
    if (!value) return 'Waktu tidak tersedia';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Waktu tidak tersedia';

    const diffMs = Date.now() - parsed.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) return 'Baru saja';
    if (diffMs < hour) return `${Math.floor(diffMs / minute)} menit lalu`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)} jam lalu`;
    if (diffMs < 7 * day) return `${Math.floor(diffMs / day)} hari lalu`;

    return formatDateTime(value);
};

const getActivityMeta = (status: string) => {
    const normalized = status.toLowerCase();

    if (['present', 'hadir'].includes(normalized)) {
        return {
            icon: CheckCircle2,
            label: 'Hadir',
            iconColor: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            badgeClass:
                'border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-900/30 dark:text-emerald-300',
        };
    }

    if (normalized === 'late') {
        return {
            icon: Clock,
            label: 'Terlambat',
            iconColor: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            badgeClass:
                'border border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-700/40 dark:bg-amber-900/30 dark:text-amber-300',
        };
    }

    if (normalized === 'pending') {
        return {
            icon: Clock,
            label: 'Menunggu',
            iconColor: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            badgeClass:
                'border border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-700/40 dark:bg-blue-900/30 dark:text-blue-300',
        };
    }

    if (normalized === 'rejected') {
        return {
            icon: AlertCircle,
            label: 'Ditolak',
            iconColor: 'text-rose-500',
            bg: 'bg-rose-50 dark:bg-rose-900/20',
            badgeClass:
                'border border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-700/40 dark:bg-rose-900/30 dark:text-rose-300',
        };
    }

    if (['absent', 'alpha'].includes(normalized)) {
        return {
            icon: AlertCircle,
            label: 'Tidak Hadir',
            iconColor: 'text-rose-500',
            bg: 'bg-rose-50 dark:bg-rose-900/20',
            badgeClass:
                'border border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-700/40 dark:bg-rose-900/30 dark:text-rose-300',
        };
    }

    if (['izin', 'sick', 'permit'].includes(normalized)) {
        return {
            icon: CheckCircle2,
            label: 'Izin',
            iconColor: 'text-sky-500',
            bg: 'bg-sky-50 dark:bg-sky-900/20',
            badgeClass:
                'border border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-700/40 dark:bg-sky-900/30 dark:text-sky-300',
        };
    }

    return {
        icon: Activity,
        label: 'Aktivitas',
        iconColor: 'text-neutral-500',
        bg: 'bg-neutral-50 dark:bg-neutral-800/50',
        badgeClass:
            'border border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-700/50 dark:bg-neutral-800 dark:text-neutral-300',
    };
};

export default function StudentProfile() {
    const { props } = usePage();
    const pageProps = props as unknown as PageProps;
    const { mahasiswa, flash } = pageProps;
    const stats = pageProps.stats ?? defaultStats;
    const badges = pageProps.badges ?? [];
    const recentActivities = pageProps.recentActivities ?? [];

    const [activeTab, setActiveTab] = useState<TabType>(() => {
        if (typeof window === 'undefined') return 'overview';
        return getTabFromQuery(window.location.search);
    });
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [avatarError, setAvatarError] = useState<string | null>(null);

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement>(null);

    const profileForm = useForm({
        nama: mahasiswa.nama ?? '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const avatarUrl = useMemo(() => {
        if (avatarPreview) return avatarPreview;
        if (mahasiswa.avatar_url) return mahasiswa.avatar_url;

        return `https://ui-avatars.com/api/?name=${encodeURIComponent(mahasiswa.nama)}&background=7c3aed&color=fff&size=400&bold=true`;
    }, [avatarPreview, mahasiswa.avatar_url, mahasiswa.nama]);

    const profileCompletion = useMemo(() => {
        const flags = [
            Boolean(mahasiswa.nama),
            Boolean(mahasiswa.avatar_url),
            Boolean(mahasiswa.prodi),
            Boolean(mahasiswa.kelas),
            Boolean(mahasiswa.semester),
        ];

        const complete = flags.filter(Boolean).length;
        return Math.round((complete / flags.length) * 100);
    }, [
        mahasiswa.nama,
        mahasiswa.avatar_url,
        mahasiswa.prodi,
        mahasiswa.kelas,
        mahasiswa.semester,
    ]);

    const passwordStrength = getPasswordStrength(passwordForm.data.password);

    const unlockedBadgesCount = badges.filter((badge) => badge.unlocked).length;

    const tabs: Array<{
        key: TabType;
        label: string;
        icon: typeof User;
        desc: string;
    }> = [
        {
            key: 'overview',
            label: 'Overview',
            icon: User,
            desc: 'Ringkasan profil',
        },
        {
            key: 'card',
            label: 'Kartu Profil',
            icon: CreditCard,
            desc: 'Kartu interaktif',
        },
        {
            key: 'edit',
            label: 'Edit Profil',
            icon: Edit3,
            desc: 'Ubah data diri',
        },
        {
            key: 'security',
            label: 'Keamanan',
            icon: Shield,
            desc: 'Password & akses',
        },
    ];

    const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        profileForm.patch('/user/profile', {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage('Profil berhasil diperbarui.');
                setTimeout(() => setSuccessMessage(null), 3000);
            },
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (
            passwordForm.data.password !==
            passwordForm.data.password_confirmation
        ) {
            passwordForm.setError(
                'password_confirmation',
                'Konfirmasi password tidak sama.',
            );
            return;
        }

        passwordForm.patch('/user/password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset(
                    'current_password',
                    'password',
                    'password_confirmation',
                );
                setSuccessMessage('Password berhasil diperbarui.');
                setTimeout(() => setSuccessMessage(null), 3000);
            },
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarError(null);

        if (!file.type.startsWith('image/')) {
            setAvatarError('File harus berupa gambar.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setAvatarError('Ukuran file maksimal 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) =>
            setAvatarPreview(event.target?.result as string);
        reader.readAsDataURL(file);

        // Auto-upload immediately after a valid file is selected.
        window.setTimeout(() => {
            handleAvatarUpload();
        }, 0);
    };

    const handleAvatarUpload = () => {
        const file = avatarInputRef.current?.files?.[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        setAvatarError(null);

        const formData = new FormData();
        formData.append('avatar', file);

        router.post('/user/profile/avatar', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setAvatarPreview(null);
                if (avatarInputRef.current) avatarInputRef.current.value = '';
                setSuccessMessage('Foto profil berhasil diperbarui.');
                setTimeout(() => setSuccessMessage(null), 3000);
            },
            onError: (errors) => {
                const message =
                    typeof errors.avatar === 'string'
                        ? errors.avatar
                        : 'Upload foto gagal.';
                setAvatarError(message);
            },
            onFinish: () => setIsUploadingAvatar(false),
        });
    };

    const resetAvatarPreview = () => {
        setAvatarPreview(null);
        setAvatarError(null);
        if (avatarInputRef.current) avatarInputRef.current.value = '';
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);

        if (typeof window === 'undefined') return;

        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.replaceState(window.history.state, '', url.toString());
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const onPopState = () =>
            setActiveTab(getTabFromQuery(window.location.search));
        window.addEventListener('popstate', onPopState);

        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    return (
        <StudentLayout>
            <Head title="Profil Mahasiswa" />

            <AnimatePresence>
                {(successMessage || flash?.success) && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -20, x: 20 }}
                        className="fixed top-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-2xl backdrop-blur dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-200"
                    >
                        <div className="rounded-lg bg-emerald-100 p-1 dark:bg-emerald-800/50">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                        </div>
                        <div>
                            <p className="font-bold">Berhasil</p>
                            <p className="text-xs opacity-80">
                                {successMessage || flash?.success}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-4 md:p-6"
            >
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="relative h-44 overflow-hidden md:h-56">
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-500 to-fuchsia-500"
                            animate={{
                                backgroundPosition: [
                                    '0% 0%',
                                    '100% 100%',
                                    '0% 0%',
                                ],
                            }}
                            transition={{
                                duration: 12,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            style={{ backgroundSize: '200% 200%' }}
                        />

                        <div
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage:
                                    'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                                backgroundSize: '40px 40px, 60px 60px',
                            }}
                        />

                        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
                        <div className="absolute bottom-0 -left-10 h-40 w-40 rounded-full bg-pink-400/20 blur-3xl" />
                        <div className="absolute top-1/3 right-1/3 h-32 w-32 rounded-full bg-indigo-300/15 blur-3xl" />

                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="absolute rounded-full bg-white/10"
                                style={{
                                    width: 12 + i * 8,
                                    height: 12 + i * 8,
                                    left: `${20 + i * 30}%`,
                                    top: `${30 + i * 15}%`,
                                }}
                                animate={{
                                    y: [0, -20, 0],
                                    opacity: [0.3, 0.6, 0.3],
                                }}
                                transition={{
                                    duration: 3 + i,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    delay: i * 0.5,
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative px-4 pb-6 md:px-8">
                        <div className="-mt-16 flex flex-col items-center md:-mt-20">
                            <motion.div
                                className="group relative"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-75 blur-sm transition-opacity group-hover:opacity-100" />

                                <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-2xl md:h-36 md:w-36 dark:border-neutral-950">
                                    <img
                                        src={avatarUrl}
                                        alt={mahasiswa.nama}
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                                        onClick={() =>
                                            avatarInputRef.current?.click()
                                        }
                                    >
                                        <Camera className="h-6 w-6 text-white" />
                                    </button>
                                </div>

                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        delay: 0.4,
                                        type: 'spring',
                                        stiffness: 280,
                                        damping: 18,
                                    }}
                                    className="absolute -right-1 -bottom-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg md:h-10 md:w-10 dark:border-neutral-950"
                                >
                                    <CheckCircle2 className="h-5 w-5 text-white" />
                                </motion.div>
                            </motion.div>

                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />

                            <AnimatePresence>
                                {avatarPreview && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="mt-3 flex flex-wrap justify-center gap-2"
                                    >
                                        <Button
                                            size="sm"
                                            onClick={handleAvatarUpload}
                                            disabled={isUploadingAvatar}
                                            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                                        >
                                            <Upload className="mr-1.5 h-3.5 w-3.5" />
                                            {isUploadingAvatar
                                                ? 'Mengunggah...'
                                                : 'Simpan Foto'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={resetAvatarPreview}
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {avatarError && (
                                <p className="mt-2 text-center text-xs text-rose-500">
                                    {avatarError}
                                </p>
                            )}

                            <div className="mt-4 space-y-2 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 md:text-3xl dark:text-white">
                                        {mahasiswa.nama}
                                    </h1>
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                    >
                                        <Sparkles className="h-5 w-5 text-amber-500" />
                                    </motion.div>
                                </div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    @{mahasiswa.nim}
                                </p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                    Mahasiswa Aktif
                                </p>

                                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                                    <div className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                                        <Mail className="h-3 w-3" />
                                        {mahasiswa.email ||
                                            'Email belum diatur'}
                                    </div>
                                    <div className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                                        <IdCard className="h-3 w-3" />
                                        {mahasiswa.nim}
                                    </div>
                                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                        <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                        Aktif
                                    </div>
                                </div>

                                <div className="mt-4 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <Button
                                            onClick={() =>
                                                handleTabChange('edit')
                                            }
                                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 px-6 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 sm:w-auto"
                                        >
                                            <Edit3 className="mr-2 h-4 w-4" />
                                            Edit Profil
                                        </Button>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full border-neutral-300 px-6 sm:w-auto dark:border-neutral-700"
                                            onClick={() =>
                                                avatarInputRef.current?.click()
                                            }
                                        >
                                            <Camera className="mr-2 h-4 w-4" />
                                            Ganti Foto
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                >
                    {[
                        {
                            label: 'Total Kehadiran',
                            value: stats.totalAttendance,
                            suffix: '',
                            icon: CheckCircle2,
                            color: 'from-emerald-400 to-teal-600',
                            textColor: 'text-emerald-600',
                        },
                        {
                            label: 'Rata-rata Hadir',
                            value: stats.attendanceRate,
                            suffix: '%',
                            icon: TrendingUp,
                            color: 'from-blue-400 to-indigo-600',
                            textColor: 'text-blue-600',
                        },
                        {
                            label: 'Streak Saat Ini',
                            value: stats.currentStreak,
                            suffix: ' hari',
                            icon: Flame,
                            color: 'from-amber-400 to-orange-600',
                            textColor: 'text-amber-600',
                        },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            whileHover={{ scale: 1.04, y: -4 }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 15,
                            }}
                            className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                                    {stat.label}
                                </p>
                                <div
                                    className={cn(
                                        'rounded-xl bg-gradient-to-r p-2',
                                        stat.color,
                                    )}
                                >
                                    <stat.icon className="h-4 w-4 text-white" />
                                </div>
                            </div>
                            <p
                                className={cn(
                                    'text-2xl font-bold dark:text-white',
                                    stat.textColor,
                                )}
                            >
                                <AnimatedCounter
                                    value={stat.value}
                                    suffix={stat.suffix}
                                />
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg">
                                <Trophy className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-neutral-900 sm:text-lg dark:text-white">
                                    Pencapaian
                                </h2>
                                <p className="text-xs text-neutral-500 sm:text-sm dark:text-neutral-400">
                                    {unlockedBadgesCount} dari {badges.length}{' '}
                                    badge terbuka
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/user/achievements"
                            className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400"
                        >
                            Lihat Semua
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {badges.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {badges.slice(0, 8).map((badge, index) => {
                                const visibleBadge =
                                    badge.unlocked ||
                                    badge.progress >= badge.target;

                                return (
                                    <motion.button
                                        key={badge.id}
                                        type="button"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            delay: 0.2 + index * 0.04,
                                            type: 'spring',
                                            stiffness: 260,
                                            damping: 18,
                                        }}
                                        whileHover={{ scale: 1.08, rotate: 5 }}
                                        onClick={() =>
                                            router.get(
                                                `/user/achievements/${badge.type}`,
                                            )
                                        }
                                        className={cn(
                                            'group relative h-14 w-14',
                                            !visibleBadge &&
                                                'opacity-40 grayscale',
                                        )}
                                        title={`${badge.name} - Lv ${badge.level}/${badge.maxLevel}`}
                                    >
                                        {visibleBadge ? (
                                            <BadgeImageProfile
                                                icon={badge.icon}
                                                name={badge.name}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                                                <Lock className="h-4 w-4 text-neutral-400" />
                                            </div>
                                        )}

                                        <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-[10px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                                            {badge.name}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-white/30 bg-white/30 p-6 text-center text-sm text-neutral-500 dark:border-white/10 dark:bg-neutral-800/30 dark:text-neutral-400">
                            Belum ada badge untuk ditampilkan.
                        </div>
                    )}
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-1.5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <motion.button
                                    key={tab.key}
                                    type="button"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleTabChange(tab.key)}
                                    className={cn(
                                        'min-w-fit flex-1 rounded-2xl px-3 py-2.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm',
                                        'flex items-center justify-center gap-2',
                                        activeTab === tab.key
                                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                                            : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800',
                                    )}
                                    title={tab.desc}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        {tab.label}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                            className="grid grid-cols-1 gap-5 lg:grid-cols-2"
                        >
                            <div className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                <div className="flex items-center gap-3 border-b border-white/20 p-5 dark:border-white/5">
                                    <div className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 p-2">
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                            Informasi Personal
                                        </h3>
                                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                            Data profil mahasiswa
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 p-5">
                                    {[
                                        {
                                            icon: User,
                                            label: 'Nama Lengkap',
                                            value:
                                                mahasiswa.nama ||
                                                'Belum diatur',
                                        },
                                        {
                                            icon: IdCard,
                                            label: 'NIM',
                                            value:
                                                mahasiswa.nim || 'Belum diatur',
                                        },
                                        {
                                            icon: Mail,
                                            label: 'Email',
                                            value:
                                                mahasiswa.email ||
                                                'Belum diatur',
                                        },
                                        {
                                            icon: Phone,
                                            label: 'Telepon',
                                            value:
                                                mahasiswa.phone ||
                                                'Belum diatur',
                                        },
                                        {
                                            icon: BookOpen,
                                            label: 'Program Studi',
                                            value:
                                                mahasiswa.prodi ||
                                                'Belum diatur',
                                        },
                                        {
                                            icon: Activity,
                                            label: 'Kelas',
                                            value:
                                                mahasiswa.kelas ||
                                                'Belum diatur',
                                        },
                                        {
                                            icon: Clock,
                                            label: 'Semester',
                                            value:
                                                mahasiswa.semester ||
                                                'Belum diatur',
                                        },
                                        {
                                            icon: Clock,
                                            label: 'Jenis Reguler',
                                            value:
                                                mahasiswa.jenis_reguler ||
                                                'Belum diatur',
                                        },
                                    ].map((item, index) => (
                                        <div
                                            key={`${item.label}-${index}`}
                                            className="group flex items-center gap-4 rounded-2xl p-3 transition-colors hover:bg-white/60 dark:hover:bg-neutral-800/50"
                                        >
                                            <div className="rounded-xl bg-neutral-100 p-2.5 text-neutral-500 transition-colors group-hover:text-violet-500 dark:bg-neutral-800">
                                                <item.icon className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                                    {item.label}
                                                </p>
                                                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                                                    {item.value}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                    <div className="flex items-center gap-3 border-b border-white/20 p-5 dark:border-white/5">
                                        <div className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-2">
                                            <TrendingUp className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                                Statistik Akademik
                                            </h3>
                                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                                Data kehadiran real-time
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-5">
                                        {[
                                            {
                                                icon: CheckCircle2,
                                                label: 'Total Kehadiran',
                                                value: `${stats.totalAttendance} sesi`,
                                                color: 'text-emerald-500',
                                                bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                                            },
                                            {
                                                icon: TrendingUp,
                                                label: 'Persentase Hadir',
                                                value: `${stats.attendanceRate}%`,
                                                color: 'text-blue-500',
                                                bg: 'bg-blue-50 dark:bg-blue-900/20',
                                            },
                                            {
                                                icon: Flame,
                                                label: 'Streak Saat Ini',
                                                value: `${stats.currentStreak} hari`,
                                                color: 'text-amber-500',
                                                bg: 'bg-amber-50 dark:bg-amber-900/20',
                                            },
                                            {
                                                icon: Target,
                                                label: 'Tepat Waktu',
                                                value: `${stats.onTimeRate}%`,
                                                color: 'text-violet-500',
                                                bg: 'bg-violet-50 dark:bg-violet-900/20',
                                            },
                                        ].map((item) => (
                                            <div
                                                key={item.label}
                                                className={cn(
                                                    'flex items-center gap-4 rounded-2xl p-3',
                                                    item.bg,
                                                )}
                                            >
                                                <item.icon
                                                    className={cn(
                                                        'h-5 w-5',
                                                        item.color,
                                                    )}
                                                />
                                                <div className="flex-1">
                                                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                                        {item.label}
                                                    </p>
                                                </div>
                                                <span
                                                    className={cn(
                                                        'text-sm font-bold',
                                                        item.color,
                                                    )}
                                                >
                                                    {item.value}
                                                </span>
                                            </div>
                                        ))}

                                        <div className="rounded-2xl border border-blue-200/60 bg-blue-50 p-4 dark:border-blue-800/30 dark:bg-blue-900/20">
                                            <div className="mb-2 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
                                                <span className="font-semibold">
                                                    Kelengkapan Profil
                                                </span>
                                                <span className="font-bold">
                                                    {profileCompletion}%
                                                </span>
                                            </div>
                                            <Progress
                                                value={profileCompletion}
                                                className="h-2"
                                            />
                                            {profileCompletion < 100 && (
                                                <p className="mt-2 text-xs text-blue-600/80 dark:text-blue-300/80">
                                                    Lengkapi data profil agar
                                                    pengalaman penggunaan lebih
                                                    optimal.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                    <div className="flex items-center gap-3 border-b border-white/20 p-5 dark:border-white/5">
                                        <div className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 p-2">
                                            <Shield className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                                Status Akun
                                            </h3>
                                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                                Keamanan dan aktivitas akun
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-5">
                                        <div className="flex items-center justify-between rounded-2xl border border-emerald-200/50 bg-emerald-50 p-3 dark:border-emerald-800/30 dark:bg-emerald-900/15">
                                            <div className="flex items-center gap-3">
                                                <BadgeCheck className="h-5 w-5 text-emerald-500" />
                                                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                                    Akun Terverifikasi
                                                </span>
                                            </div>
                                            <Badge className="border-0 bg-emerald-500 text-white">
                                                Active
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                                            <div className="flex items-center gap-3">
                                                <Lock className="h-5 w-5 text-neutral-500" />
                                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                    Password
                                                </span>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs"
                                                onClick={() =>
                                                    handleTabChange('security')
                                                }
                                            >
                                                Ubah
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                                            <div className="flex items-center gap-3">
                                                <Clock className="h-5 w-5 text-neutral-500" />
                                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                    Aktivitas Terakhir
                                                </span>
                                            </div>
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {formatDateTime(
                                                    mahasiswa.last_activity_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                    <div className="flex items-center gap-3 border-b border-white/20 p-5 dark:border-white/5">
                                        <div className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 p-2">
                                            <Activity className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                                Aktivitas Terkini
                                            </h3>
                                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                                Data aktivitas real dari histori
                                                absensi
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-5">
                                        {recentActivities.length > 0 ? (
                                            recentActivities.map((activity) => {
                                                const meta = getActivityMeta(
                                                    activity.status,
                                                );
                                                const ActivityIcon = meta.icon;

                                                return (
                                                    <div
                                                        key={activity.id}
                                                        className={cn(
                                                            'rounded-2xl p-3',
                                                            meta.bg,
                                                        )}
                                                    >
                                                        <div className="mb-2 flex items-start justify-between gap-3">
                                                            <div className="flex items-start gap-3">
                                                                <div className="rounded-xl bg-white/80 p-2 dark:bg-neutral-900/60">
                                                                    <ActivityIcon
                                                                        className={cn(
                                                                            'h-4 w-4',
                                                                            meta.iconColor,
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                                        {
                                                                            activity.title
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                        {
                                                                            activity.description
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span
                                                                className={cn(
                                                                    'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                                                    meta.badgeClass,
                                                                )}
                                                            >
                                                                {meta.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                                            {formatActivityTime(
                                                                activity.occurred_at,
                                                            )}
                                                        </p>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-white/30 bg-white/20 p-5 text-center text-sm text-neutral-500 dark:border-white/10 dark:bg-neutral-800/30 dark:text-neutral-400">
                                                Belum ada aktivitas terbaru.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'card' && (
                        <motion.div
                            key="card"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                            className="flex flex-col items-center justify-center py-10"
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
                                behindGlowColor="rgba(139, 92, 246, 0.6)"
                                innerGradient="linear-gradient(145deg, #6366f144 0%, #a855f744 100%)"
                                onContactClick={() => handleTabChange('edit')}
                            />
                            <p className="mt-6 max-w-md text-center text-sm text-neutral-500 dark:text-neutral-400">
                                Gerakkan mouse di atas kartu untuk efek 3D
                                interaktif. Klik tombol untuk mengedit profil.
                            </p>
                        </motion.div>
                    )}

                    {activeTab === 'edit' && (
                        <motion.div
                            key="edit"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                <div className="flex items-center gap-3 border-b border-white/20 p-6 dark:border-white/5">
                                    <div className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 p-2.5">
                                        <Edit3 className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                            Edit Profil
                                        </h3>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Perbarui informasi profil mahasiswa
                                        </p>
                                    </div>
                                </div>

                                <form
                                    onSubmit={handleProfileSubmit}
                                    className="space-y-6 p-6"
                                >
                                    <div className="flex flex-col gap-5 rounded-2xl border border-neutral-200/60 bg-neutral-50 p-5 sm:flex-row sm:items-center dark:border-neutral-800 dark:bg-neutral-900">
                                        <div className="group relative">
                                            <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-neutral-200 shadow-lg dark:border-neutral-700">
                                                <img
                                                    src={avatarUrl}
                                                    alt={mahasiswa.nama}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    avatarInputRef.current?.click()
                                                }
                                                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                                            >
                                                <Camera className="h-5 w-5 text-white" />
                                            </button>
                                        </div>
                                        <div>
                                            <p className="font-bold text-neutral-900 dark:text-white">
                                                Foto Profil
                                            </p>
                                            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                                                JPG/PNG maksimal 2MB. Disarankan
                                                rasio 1:1.
                                            </p>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="mt-2 h-8 text-xs"
                                                onClick={() =>
                                                    avatarInputRef.current?.click()
                                                }
                                            >
                                                <Upload className="mr-1.5 h-3.5 w-3.5" />
                                                Pilih Foto
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="nama"
                                                className="text-xs font-bold tracking-wider text-neutral-500 uppercase"
                                            >
                                                Nama Lengkap
                                            </Label>
                                            <div className="relative">
                                                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                                <Input
                                                    id="nama"
                                                    value={
                                                        profileForm.data.nama
                                                    }
                                                    onChange={(e) =>
                                                        profileForm.setData(
                                                            'nama',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-11 border-neutral-200 bg-white pl-10 dark:border-neutral-700 dark:bg-neutral-900"
                                                    placeholder="Nama lengkap"
                                                />
                                            </div>
                                            <InputError
                                                message={
                                                    profileForm.errors.nama
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="nim"
                                                className="text-xs font-bold tracking-wider text-neutral-500 uppercase"
                                            >
                                                NIM
                                            </Label>
                                            <div className="relative">
                                                <IdCard className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                                <Input
                                                    id="nim"
                                                    value={mahasiswa.nim}
                                                    disabled
                                                    className="h-11 cursor-not-allowed border-neutral-200 bg-neutral-100 pl-10 opacity-70 dark:border-neutral-700 dark:bg-neutral-800"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="email"
                                                className="text-xs font-bold tracking-wider text-neutral-500 uppercase"
                                            >
                                                Email
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                                <Input
                                                    id="email"
                                                    value={
                                                        mahasiswa.email ||
                                                        'Belum diatur'
                                                    }
                                                    disabled
                                                    className="h-11 cursor-not-allowed border-neutral-200 bg-neutral-100 pl-10 opacity-70 dark:border-neutral-700 dark:bg-neutral-800"
                                                />
                                            </div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                Email dikelola oleh sistem
                                                autentikasi.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="prodi"
                                                className="text-xs font-bold tracking-wider text-neutral-500 uppercase"
                                            >
                                                Program Studi
                                            </Label>
                                            <div className="relative">
                                                <Activity className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                                <Input
                                                    id="prodi"
                                                    value={
                                                        mahasiswa.prodi ||
                                                        'Belum diatur'
                                                    }
                                                    disabled
                                                    className="h-11 cursor-not-allowed border-neutral-200 bg-neutral-100 pl-10 opacity-70 dark:border-neutral-700 dark:bg-neutral-800"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 border-t border-white/20 pt-4 sm:flex-row sm:justify-end dark:border-white/5">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => profileForm.reset()}
                                            disabled={profileForm.processing}
                                            className="w-full sm:w-auto"
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={profileForm.processing}
                                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white sm:w-auto"
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            {profileForm.processing
                                                ? 'Menyimpan...'
                                                : 'Simpan Perubahan'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                            className="grid grid-cols-1 gap-5 lg:grid-cols-2"
                        >
                            <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                <div className="flex items-center gap-3 border-b border-white/20 p-6 dark:border-white/5">
                                    <div className="rounded-xl bg-gradient-to-r from-red-500 to-rose-600 p-2.5">
                                        <Shield className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                            Keamanan Akun
                                        </h3>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Ubah password untuk menjaga keamanan
                                            akun
                                        </p>
                                    </div>
                                </div>

                                <form
                                    onSubmit={handlePasswordSubmit}
                                    className="space-y-5 p-6"
                                >
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="current_password"
                                            className="text-xs font-bold tracking-wider text-neutral-500 uppercase"
                                        >
                                            Password Saat Ini
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                            <Input
                                                id="current_password"
                                                type={
                                                    showCurrent
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                value={
                                                    passwordForm.data
                                                        .current_password
                                                }
                                                onChange={(e) =>
                                                    passwordForm.setData(
                                                        'current_password',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-11 border-neutral-200 bg-white pr-10 pl-10 dark:border-neutral-700 dark:bg-neutral-900"
                                                placeholder="Masukkan password saat ini"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowCurrent(
                                                        (value) => !value,
                                                    )
                                                }
                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                            >
                                                {showCurrent ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        <InputError
                                            message={
                                                passwordForm.errors
                                                    .current_password
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="password"
                                            className="text-xs font-bold tracking-wider text-neutral-500 uppercase"
                                        >
                                            Password Baru
                                        </Label>
                                        <div className="relative">
                                            <KeyRound className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                            <Input
                                                id="password"
                                                type={
                                                    showNew
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                value={
                                                    passwordForm.data.password
                                                }
                                                onChange={(e) =>
                                                    passwordForm.setData(
                                                        'password',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-11 border-neutral-200 bg-white pr-10 pl-10 dark:border-neutral-700 dark:bg-neutral-900"
                                                placeholder="Masukkan password baru"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowNew(
                                                        (value) => !value,
                                                    )
                                                }
                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                            >
                                                {showNew ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        <InputError
                                            message={
                                                passwordForm.errors.password
                                            }
                                        />
                                    </div>

                                    {passwordForm.data.password && (
                                        <div className="rounded-2xl border border-blue-200/60 bg-blue-50 p-4 dark:border-blue-800/30 dark:bg-blue-900/20">
                                            <div className="mb-2 flex items-center justify-between text-xs">
                                                <span className="font-medium text-blue-700 dark:text-blue-300">
                                                    Kekuatan Password
                                                </span>
                                                <span
                                                    className={cn(
                                                        'font-bold',
                                                        passwordStrength.color,
                                                    )}
                                                >
                                                    {passwordStrength.label}
                                                </span>
                                            </div>
                                            <Progress
                                                value={passwordStrength.value}
                                                className="h-2"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="password_confirmation"
                                            className="text-xs font-bold tracking-wider text-neutral-500 uppercase"
                                        >
                                            Konfirmasi Password Baru
                                        </Label>
                                        <div className="relative">
                                            <KeyRound className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                            <Input
                                                id="password_confirmation"
                                                type={
                                                    showConfirm
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                value={
                                                    passwordForm.data
                                                        .password_confirmation
                                                }
                                                onChange={(e) =>
                                                    passwordForm.setData(
                                                        'password_confirmation',
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-11 border-neutral-200 bg-white pr-10 pl-10 dark:border-neutral-700 dark:bg-neutral-900"
                                                placeholder="Konfirmasi password baru"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirm(
                                                        (value) => !value,
                                                    )
                                                }
                                                className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                                            >
                                                {showConfirm ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        <InputError
                                            message={
                                                passwordForm.errors
                                                    .password_confirmation
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-3 border-t border-white/20 pt-4 sm:flex-row sm:justify-end dark:border-white/5">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => passwordForm.reset()}
                                            disabled={passwordForm.processing}
                                            className="w-full sm:w-auto"
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Batal
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={passwordForm.processing}
                                            className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white sm:w-auto"
                                        >
                                            <Shield className="mr-2 h-4 w-4" />
                                            {passwordForm.processing
                                                ? 'Menyimpan...'
                                                : 'Ubah Password'}
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            <div className="space-y-5">
                                <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                    <div className="flex items-center gap-3 border-b border-white/20 p-6 dark:border-white/5">
                                        <div className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 p-2.5">
                                            <AlertCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                                Tips Keamanan
                                            </h3>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                Praktik terbaik untuk menjaga
                                                akun
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-6">
                                        {[
                                            'Gunakan minimal 8 karakter dengan kombinasi huruf besar, kecil, dan angka.',
                                            'Jangan gunakan password yang sama dengan aplikasi lain.',
                                            'Simpan password di password manager, bukan catatan terbuka.',
                                            'Ubah password secara berkala jika merasa akun pernah diakses pihak lain.',
                                        ].map((tip, index) => (
                                            <div
                                                key={`${tip}-${index}`}
                                                className="flex items-start gap-3 rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-800/50"
                                            >
                                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                                    {tip}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                                    <div className="flex items-center gap-3 border-b border-white/20 p-6 dark:border-white/5">
                                        <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-2.5">
                                            <Shield className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                                Ringkasan Keamanan
                                            </h3>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                Status keamanan akun saat ini
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-6">
                                        <div className="flex items-center justify-between rounded-2xl border border-emerald-200/50 bg-emerald-50 p-3 dark:border-emerald-800/30 dark:bg-emerald-900/15">
                                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                                Verifikasi Akun
                                            </span>
                                            <Badge className="border-0 bg-emerald-500 text-white">
                                                Aktif
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Update Password
                                            </span>
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                Disarankan rutin
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Aktivitas Terakhir
                                            </span>
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {formatDateTime(
                                                    mahasiswa.last_activity_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </StudentLayout>
    );
}
