import TugasIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import PengaturanIcon from '@/assets/admin/pengaturan/pengaturan.png';
import RekapIcon from '@/assets/admin/rekap-kehadiran/rekapan.png';
import SesiBaruIcon from '@/assets/admin/sesi-absen/sesi-baru-icon.png';
import SelfieIcon from '@/assets/admin/verifikasi-selfie/verifikasi-selfie.png';
import DashboardIcon from '@/assets/dosen/dashboard/dashboard-icon.png';
import StatAttendanceRate from '@/assets/dosen/dashboard/stat-attendance-rate.png';
import StatTotalCourse from '@/assets/dosen/dashboard/stat-total-course.png';
import StatTotalSessions from '@/assets/dosen/dashboard/stat-total-sessions.png';
import StatTotalStudents from '@/assets/dosen/dashboard/stat-total-students.png';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import DosenLayout from '@/layouts/dosen-layout';
import { cn, formatShortName } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    Award,
    BookOpen,
    Calendar,
    CheckCircle2,
    ChevronRight,
    ClipboardList,
    Clock,
    Eye,
    Image,
    Play,
    QrCode,
    Sparkles,
    TrendingUp,
    Users,
    X,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface DosenInfo {
    id: number;
    nama: string;
    nidn: string;
    email: string;
    avatar_url?: string;
    initials: string;
}
interface TodaySchedule {
    id: number;
    course_name: string;
    meeting_number: number;
    time: string;
    room: string;
    student_count: number;
}
interface Stats {
    totalCourses: number;
    totalStudents: number;
    totalSessions: number;
    thisMonthSessions: number;
    attendanceRate: number;
    pendingCount: number;
    todaySessionsCount: number;
    averageAttendanceRate: number;
}
interface PendingVerification {
    id: number;
    mahasiswa: string;
    nim: string;
    course: string;
    selfie_url: string | null;
    scanned_at: string;
}
interface ActiveSession {
    id: number;
    title: string;
    meeting_number: number;
    course: string;
    start_at: string;
    end_at: string;
    attendance_count: number;
}
interface MonthlyTrend {
    month: string;
    total: number;
    present: number;
    rate: number;
}
interface CourseStat {
    id: number;
    name: string;
    sks?: number;
    sessions: number;
    present: number;
    late: number;
    absent: number;
}
interface RecentActivity {
    id: number;
    mahasiswa: string;
    nim: string;
    course: string;
    status: string;
    time: string;
}
interface CourseItem {
    id: number;
    nama: string;
}
interface WeeklyTrend {
    day: string;
    date: string;
    present: number;
    total: number;
}

interface PageProps {
    dosen: DosenInfo;
    stats: Stats;
    pendingVerifications: PendingVerification[];
    activeSessions: ActiveSession[];
    monthlyTrend: MonthlyTrend[];
    courseStats: CourseStat[];
    recentActivity: RecentActivity[];
    todaySchedule?: TodaySchedule[];
    coursesList?: CourseItem[];
    weeklyTrend?: WeeklyTrend[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
    present: {
        label: 'Hadir',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    late: {
        label: 'Terlambat',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    },
    rejected: {
        label: 'Ditolak',
        color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    },
    pending: {
        label: 'Pending',
        color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
            when: 'beforeChildren' as const,
        },
    },
} as const;

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 60,
        scale: 0.9,
        rotateX: -10,
        filter: 'blur(8px)',
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        filter: 'blur(0px)',
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 15,
            mass: 0.8,
        },
    },
} as const;

const headerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
} as const;

const cardVariants = {
    hidden: { opacity: 0, scale: 0.85, rotateX: -15, filter: 'blur(8px)' },
    visible: {
        opacity: 1,
        scale: 1,
        rotateX: 0,
        filter: 'blur(0px) brightness(1) drop-shadow(0 0px 0px rgba(0,0,0,0))',
        transition: {
            type: 'spring' as const,
            stiffness: 150,
            damping: 16,
            mass: 0.8,
        },
    },
    hover: {
        scale: 1.05,
        y: -12,
        rotateY: 4,
        rotateX: -4,
        filter: 'brightness(1.05) drop-shadow(0 20px 30px rgba(0,0,0,0.15))',
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 15,
            mass: 0.8,
        },
    },
} as const;

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-white/20 bg-white/90 p-3 shadow-xl backdrop-blur-xl dark:bg-neutral-900/90"
        >
            <p className="mb-2 font-medium text-slate-900 dark:text-white">
                {label}
            </p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-600 dark:text-slate-400">
                        {entry.name}:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                        {entry.value}
                    </span>
                </div>
            ))}
        </motion.div>
    );
};

export default function DosenDashboard({
    dosen,
    stats,
    pendingVerifications,
    activeSessions,
    monthlyTrend,
    courseStats,
    recentActivity,
    todaySchedule = [],
    coursesList = [],
    weeklyTrend = [],
}: PageProps) {
    const [showSessionModal, setShowSessionModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [selectedSession, setSelectedSession] =
        useState<ActiveSession | null>(null);
    const [selectedVerification, setSelectedVerification] =
        useState<PendingVerification | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<CourseStat | null>(
        null,
    );
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 4 && hour < 12) return 'Selamat Pagi';
        if (hour >= 12 && hour < 15) return 'Selamat Siang';
        if (hour >= 15 && hour < 19) return 'Selamat Sore';
        return 'Selamat Malam';
    };
    const greeting = getGreeting();

    // Auto-refresh active sessions every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: [
                    'activeSessions',
                    'pendingVerifications',
                    'stats',
                    'recentActivity',
                ],
            });
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const quickActions = [
        {
            imgSrc: SesiBaruIcon,
            label: 'Buat Sesi Baru',
            href: '/dosen/sessions/create',
            glow: 'bg-emerald-500',
            shadow: 'shadow-emerald-500/25',
            desc: 'Mulai sesi absensi baru',
            stat: `${stats.thisMonthSessions} bulan ini`,
            statColor: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            imgSrc: SelfieIcon,
            label: 'Verifikasi Selfie',
            href: '/dosen/verify',
            glow: 'bg-amber-500',
            shadow: 'shadow-amber-500/25',
            desc: 'Review foto kehadiran',
            stat: `${stats.pendingCount} menunggu`,
            statColor: 'text-amber-600 dark:text-amber-400',
            badge: stats.pendingCount,
        },
        {
            imgSrc: RekapIcon,
            label: 'Lihat Laporan',
            href: '/dosen/reports',
            glow: 'bg-sky-500',
            shadow: 'shadow-sky-500/25',
            desc: 'Export & analisis data',
            stat: 'Realtime',
            statColor: 'text-sky-600 dark:text-sky-400',
        },
        {
            imgSrc: TugasIcon,
            label: 'Kelola Tugas',
            href: '/dosen/tugas',
            glow: 'bg-violet-500',
            shadow: 'shadow-violet-500/25',
            desc: 'Buat & kelola tugas',
            stat: 'Buat baru',
            statColor: 'text-violet-600 dark:text-violet-400',
        },
        {
            imgSrc: StatTotalCourse,
            label: 'Statistik Kelas',
            href: '/dosen/class-insights',
            glow: 'bg-indigo-500',
            shadow: 'shadow-indigo-500/25',
            desc: 'Analisis mendalam',
            stat: `${stats.totalCourses} kelas`,
            statColor: 'text-indigo-600 dark:text-indigo-400',
        },
        {
            imgSrc: PengaturanIcon,
            label: 'Pengaturan',
            href: '/dosen/settings',
            glow: 'bg-slate-500',
            shadow: 'shadow-slate-500/25',
            desc: 'Konfigurasi akun',
            stat: 'Profil',
            statColor: 'text-slate-600 dark:text-slate-400',
        },
    ];

    const summaryCards = [
        {
            key: 'courses',
            imgSrc: StatTotalCourse,
            label: 'Total Mata Kuliah',
            value: stats.totalCourses,
            gradient: 'from-blue-400 to-cyan-600',
            glow: 'bg-blue-500',
            shadow: 'hover:shadow-blue-500/10',
        },
        {
            key: 'students',
            imgSrc: StatTotalStudents,
            label: 'Total Mahasiswa',
            value: stats.totalStudents,
            gradient: 'from-emerald-400 to-teal-600',
            glow: 'bg-emerald-500',
            shadow: 'hover:shadow-emerald-500/10',
        },
        {
            key: 'sessions',
            imgSrc: StatTotalSessions,
            label: 'Total Sesi',
            value: stats.totalSessions,
            gradient: 'from-purple-400 to-violet-600',
            glow: 'bg-purple-500',
            shadow: 'hover:shadow-purple-500/10',
        },
        {
            key: 'attendance',
            imgSrc: StatAttendanceRate,
            label: 'Tingkat Kehadiran',
            value: stats.attendanceRate,
            suffix: '%',
            gradient: 'from-amber-400 to-orange-600',
            glow: 'bg-amber-500',
            shadow: 'hover:shadow-amber-500/10',
        },
    ];

    return (
        <DosenLayout>
            <Head title="Dashboard Dosen" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
            >
                {/* ═══════ HEADER ═══════ */}
                <motion.div
                    variants={headerVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
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
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:items-start">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left lg:w-auto">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
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
                                >
                                    <img
                                        src={DashboardIcon}
                                        alt="Dashboard"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        {greeting},
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        {formatShortName(dosen.nama)}
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 text-sm leading-relaxed text-indigo-100 sm:text-base"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        NIDN: {dosen.nidn} • {dosen.email}
                                    </motion.p>
                                </div>
                            </div>

                            <div className="mt-2 flex w-full flex-col items-center gap-3 lg:mt-0 lg:w-auto lg:items-end">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-6 py-3 shadow-lg backdrop-blur-xl"
                                >
                                    <div className="rounded-lg bg-indigo-500/20 p-2">
                                        <Award className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-100">
                                            Tingkat Kehadiran
                                        </p>
                                        <p className="text-2xl font-bold text-white">
                                            {stats.attendanceRate}%
                                        </p>
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="flex flex-wrap justify-center gap-2"
                                >
                                    {[
                                        {
                                            icon: QrCode,
                                            label: 'Buat Sesi',
                                            href: '/dosen/sessions/create',
                                        },
                                        {
                                            icon: Eye,
                                            label: `Verifikasi (${stats.pendingCount})`,
                                            href: '/dosen/verify',
                                        },
                                        {
                                            icon: ClipboardList,
                                            label: 'Tugas',
                                            href: '/dosen/tugas',
                                        },
                                    ].map((btn) => (
                                        <Link key={btn.href} href={btn.href}>
                                            <motion.button
                                                whileHover={{
                                                    scale: 1.02,
                                                    backgroundColor:
                                                        'rgba(255,255,255,0.25)',
                                                }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30"
                                            >
                                                <btn.icon className="h-4 w-4" />{' '}
                                                {btn.label}
                                            </motion.button>
                                        </Link>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ SUMMARY CARDS ═══════ */}
                <motion.div
                    className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.04,
                                delayChildren: 0.2,
                            },
                        },
                    }}
                >
                    {summaryCards.map((card, i) => {
                        const colorMap: Record<string, any> = {
                            'bg-blue-500': {
                                from: 'from-sky-400',
                                to: 'to-indigo-600',
                                gradientBg:
                                    'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
                                hoverShadow: 'hover:shadow-sky-500/10',
                            },
                            'bg-emerald-500': {
                                from: 'from-emerald-400',
                                to: 'to-teal-600',
                                gradientBg:
                                    'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
                                hoverShadow: 'hover:shadow-emerald-500/10',
                            },
                            'bg-purple-500': {
                                from: 'from-purple-400',
                                to: 'to-violet-600',
                                gradientBg:
                                    'from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10',
                                hoverShadow: 'hover:shadow-purple-500/10',
                            },
                            'bg-amber-500': {
                                from: 'from-amber-400',
                                to: 'to-orange-600',
                                gradientBg:
                                    'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
                                hoverShadow: 'hover:shadow-amber-500/10',
                            },
                        };
                        const cc =
                            colorMap[card.glow] || colorMap['bg-blue-500'];
                        return (
                            <motion.div
                                key={card.key}
                                variants={{
                                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        transition: {
                                            type: 'spring',
                                            stiffness: 100,
                                            damping: 15,
                                        },
                                    },
                                }}
                                whileHover={{
                                    y: -5,
                                    scale: 1.02,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 25,
                                    },
                                }}
                                onHoverStart={() => setHoveredCard(card.key)}
                                onHoverEnd={() => setHoveredCard(null)}
                                className={cn(
                                    `group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40`,
                                    cc.hoverShadow,
                                )}
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${cc.gradientBg} opacity-50 dark:opacity-100`}
                                />
                                <motion.div
                                    className={cn(
                                        `absolute -top-8 -right-8 h-28 w-28 rounded-full blur-3xl transition-all`,
                                        card.glow,
                                    )}
                                    animate={{
                                        opacity:
                                            hoveredCard === card.key
                                                ? 0.4
                                                : 0.15,
                                    }}
                                />
                                <div className="relative z-10 flex h-full flex-col items-center justify-between gap-3 sm:items-start sm:gap-4">
                                    <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                                        <motion.div
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 10,
                                            }}
                                            className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                                        >
                                            <img
                                                src={card.imgSrc}
                                                alt={card.label}
                                                className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                            />
                                        </motion.div>
                                        <div className="flex flex-col">
                                            <p className="mb-0.5 text-[10px] leading-tight font-medium text-neutral-500 sm:mb-1 sm:text-sm dark:text-neutral-400">
                                                {card.label}
                                            </p>
                                            <div className="flex items-baseline justify-center gap-2 sm:justify-start">
                                                <span className="text-xl leading-none font-extrabold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                                                    <AnimatedCounter
                                                        value={card.value}
                                                        suffix={card.suffix}
                                                        duration={1500}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══════ QUICK ACTIONS — Premium Glassmorphism ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    {/* Background decorative elements */}
                    <motion.div
                        animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.06, 0.12, 0.06],
                        }}
                        transition={{ duration: 6, repeat: Infinity }}
                        className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.04, 0.08, 0.04],
                        }}
                        transition={{ duration: 8, repeat: Infinity, delay: 2 }}
                        className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl"
                    />

                    <div className="relative z-10 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 15 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30"
                            >
                                <Zap className="h-5 w-5 text-white" />
                            </motion.div>
                            <div>
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    Aksi Cepat
                                </h2>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Akses fitur utama dengan cepat
                                </p>
                            </div>
                        </div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="hidden rounded-full border border-indigo-200/50 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-3 py-1.5 sm:block dark:border-indigo-800/50"
                        >
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                {quickActions.length} fitur
                            </span>
                        </motion.div>
                    </div>

                    <div className="relative z-10 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                        {quickActions.map((action, i) => (
                            <Link key={action.href} href={action.href}>
                                <motion.div
                                    initial={{ opacity: 0, y: 25, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        delay: i * 0.07,
                                        type: 'spring',
                                        stiffness: 250,
                                        damping: 20,
                                    }}
                                    whileHover={{
                                        scale: 1.04,
                                        y: -6,
                                        boxShadow:
                                            '0 20px 40px -10px rgba(0,0,0,0.15)',
                                    }}
                                    whileTap={{ scale: 0.97 }}
                                    className={cn(
                                        'group relative min-h-[112px] cursor-pointer overflow-hidden rounded-2xl border border-white/30 bg-white/70 p-3 backdrop-blur-lg transition-all duration-300 sm:min-h-[132px] sm:p-5 dark:border-white/10 dark:bg-neutral-800/70',
                                        `hover:${action.shadow}`,
                                    )}
                                >
                                    {/* Animated shimmer sweep */}
                                    <motion.div className="absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full dark:via-white/10" />

                                    {/* Glow orb on hover */}
                                    <motion.div
                                        className={cn(
                                            'absolute -right-6 -bottom-6 h-24 w-24 rounded-full opacity-0 blur-3xl transition-all duration-500 group-hover:opacity-30',
                                            action.glow,
                                        )}
                                    />

                                    {/* Decorative dots grid */}
                                    <div className="absolute top-3 right-3 hidden grid-cols-3 gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-30 sm:grid">
                                        {[...Array(9)].map((_, di) => (
                                            <div
                                                key={di}
                                                className="h-1 w-1 rounded-full bg-neutral-400 dark:bg-neutral-500"
                                            />
                                        ))}
                                    </div>

                                    <div className="relative z-10 flex h-full flex-col items-center gap-2 sm:flex-row sm:items-start sm:gap-4">
                                        {/* Icon container with gradient ring */}
                                        <div className="relative flex-shrink-0">
                                            <motion.div
                                                whileHover={{
                                                    rotate: [0, -8, 8, 0],
                                                    scale: 1.15,
                                                }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 300,
                                                }}
                                                className="relative flex h-10 w-10 items-center justify-center sm:h-14 sm:w-14"
                                            >
                                                <img
                                                    src={action.imgSrc}
                                                    alt={action.label}
                                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                                />
                                            </motion.div>
                                            {/* Badge */}
                                            {(action.badge ?? 0) > 0 && (
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.2, 1],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                    }}
                                                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg ring-2 ring-white dark:ring-neutral-800"
                                                >
                                                    {action.badge}
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1 text-center sm:text-left">
                                            <h3 className="line-clamp-2 text-xs leading-snug font-bold text-neutral-900 group-hover:text-neutral-800 sm:line-clamp-1 sm:text-sm dark:text-white dark:group-hover:text-white">
                                                {action.label}
                                            </h3>
                                            <p className="mt-0.5 line-clamp-1 hidden text-xs text-neutral-500 sm:block dark:text-neutral-400">
                                                {action.desc}
                                            </p>
                                            <div className="mt-2 hidden items-center gap-1.5 sm:flex">
                                                <Sparkles className="h-3 w-3 text-neutral-400 transition-colors group-hover:text-amber-500" />
                                                <span
                                                    className={cn(
                                                        'text-xs font-semibold',
                                                        action.statColor,
                                                    )}
                                                >
                                                    {action.stat}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Arrow indicator */}
                                        <motion.div
                                            className="mt-1 hidden flex-shrink-0 opacity-0 transition-all duration-200 group-hover:opacity-100 sm:flex"
                                            initial={false}
                                            animate={{ x: 0 }}
                                        >
                                            <ChevronRight className="h-4 w-4 text-neutral-400" />
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </motion.div>

                {/* ═══════ TODAY'S SCHEDULE ═══════ */}
                {todaySchedule.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.2, 0.1],
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute top-0 right-0 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl"
                        />
                        <div className="relative z-10 mb-4 flex items-center gap-2">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <Calendar className="h-5 w-5 text-indigo-600" />
                            </motion.div>
                            <h2 className="font-semibold text-neutral-900 dark:text-white">
                                Jadwal Hari Ini
                            </h2>
                            <motion.span
                                className="ml-auto rounded-full bg-indigo-500 px-3 py-1 text-xs font-medium text-white"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {todaySchedule.length} kelas
                            </motion.span>
                        </div>
                        <div className="relative z-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {todaySchedule.map((s, i) => (
                                <motion.div
                                    key={s.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        delay: i * 0.05,
                                        type: 'spring',
                                        stiffness: 200,
                                    }}
                                    whileHover={{
                                        scale: 1.03,
                                        x: 5,
                                        boxShadow:
                                            '0 10px 20px -5px rgba(99,102,241,0.3)',
                                    }}
                                    className="cursor-pointer rounded-xl border border-indigo-200/50 bg-white/80 p-4 dark:border-indigo-800/50 dark:bg-neutral-800/80"
                                >
                                    <div className="mb-2 flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-xs font-bold text-white">
                                                {s.meeting_number}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                    {s.course_name}
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    {s.time}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />{' '}
                                            {s.student_count} mhs
                                        </span>
                                        <span>{s.room}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ═══════ ACTIVE SESSIONS & PENDING VERIFICATIONS ═══════ */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Active Sessions */}
                    <motion.div
                        variants={cardVariants}
                        className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.15, 0.1],
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl"
                        />
                        <div className="relative z-10 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    whileHover={{
                                        rotate: [0, -15, 15, 0],
                                        scale: 1.2,
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg"
                                >
                                    <Play className="h-5 w-5" />
                                </motion.div>
                                <div>
                                    <h2 className="font-semibold text-neutral-900 dark:text-white">
                                        Sesi Aktif
                                    </h2>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                        {activeSessions.length} sesi berlangsung
                                    </p>
                                </div>
                            </div>
                            <Link href="/dosen/courses">
                                <motion.div
                                    whileHover={{ scale: 1.05, x: 3 }}
                                    className="flex items-center gap-1 text-sm font-medium text-indigo-600"
                                >
                                    Lihat Semua{' '}
                                    <ChevronRight className="h-3 w-3" />
                                </motion.div>
                            </Link>
                        </div>
                        {activeSessions.length === 0 ? (
                            <div className="relative z-10 py-8 text-center text-neutral-500">
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                    }}
                                >
                                    <Calendar className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                                </motion.div>
                                <p className="font-medium">
                                    Tidak ada sesi aktif
                                </p>
                                <p className="mt-1 text-xs">
                                    Buat sesi baru untuk memulai
                                </p>
                            </div>
                        ) : (
                            <div className="relative z-10 space-y-3">
                                {activeSessions.map((session, i) => (
                                    <motion.div
                                        key={session.id}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: i * 0.04,
                                            type: 'spring',
                                            stiffness: 200,
                                        }}
                                        whileHover={{
                                            x: 8,
                                            scale: 1.03,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(16,185,129,0.3)',
                                        }}
                                        onClick={() => {
                                            setSelectedSession(session);
                                            setShowSessionModal(true);
                                        }}
                                        className="group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-xl border border-emerald-200/50 bg-white/80 p-4 hover:bg-white dark:border-emerald-800/50 dark:bg-neutral-800/60"
                                    >
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent"
                                            animate={{ x: ['-100%', '100%'] }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: 'linear',
                                                repeatDelay: 3,
                                            }}
                                        />
                                        <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 font-bold text-white shadow-lg">
                                            {session.meeting_number}
                                        </div>
                                        <div className="relative z-10 min-w-0 flex-1">
                                            <p className="truncate font-semibold text-neutral-900 dark:text-white">
                                                {session.title}
                                            </p>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                {session.course}
                                            </p>
                                        </div>
                                        <div className="relative z-10 text-right">
                                            <motion.p
                                                className="text-sm font-bold text-emerald-600"
                                                animate={{
                                                    scale: [1, 1.05, 1],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                }}
                                            >
                                                {session.attendance_count} hadir
                                            </motion.p>
                                            <p className="text-xs text-neutral-500">
                                                {session.start_at} -{' '}
                                                {session.end_at}
                                            </p>
                                        </div>
                                        <ChevronRight className="relative z-10 h-5 w-5 text-neutral-400" />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Pending Verifications */}
                    <motion.div
                        variants={cardVariants}
                        className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.15, 0.1],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                delay: 1,
                            }}
                            className="absolute top-0 right-0 h-32 w-32 rounded-full bg-amber-500/20 blur-3xl"
                        />
                        <div className="relative z-10 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    whileHover={{
                                        rotate: [0, -15, 15, 0],
                                        scale: 1.2,
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg"
                                >
                                    {stats.pendingCount > 0 && (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white"
                                        >
                                            {stats.pendingCount}
                                        </motion.div>
                                    )}
                                    <AlertCircle className="h-5 w-5" />
                                </motion.div>
                                <div>
                                    <h2 className="font-semibold text-neutral-900 dark:text-white">
                                        Verifikasi Pending
                                    </h2>
                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                        {pendingVerifications.length} menunggu
                                    </p>
                                </div>
                            </div>
                            <Link href="/dosen/verify">
                                <motion.div
                                    whileHover={{ scale: 1.05, x: 3 }}
                                    className="flex items-center gap-1 text-sm font-medium text-indigo-600"
                                >
                                    Lihat Semua{' '}
                                    <ChevronRight className="h-3 w-3" />
                                </motion.div>
                            </Link>
                        </div>
                        {pendingVerifications.length === 0 ? (
                            <div className="relative z-10 py-8 text-center text-neutral-500">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                    }}
                                >
                                    <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-400" />
                                </motion.div>
                                <p className="font-medium">
                                    Semua sudah diverifikasi
                                </p>
                                <p className="mt-1 text-xs">Kerja bagus! 🎉</p>
                            </div>
                        ) : (
                            <div className="relative z-10 space-y-3">
                                {pendingVerifications.map((v, i) => (
                                    <motion.div
                                        key={v.id}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: i * 0.04,
                                            type: 'spring',
                                            stiffness: 200,
                                        }}
                                        whileHover={{
                                            x: 8,
                                            scale: 1.03,
                                            boxShadow:
                                                '0 10px 25px -5px rgba(245,158,11,0.3)',
                                        }}
                                        onClick={() => {
                                            setSelectedVerification(v);
                                            setShowVerifyModal(true);
                                        }}
                                        className="group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-amber-200/50 bg-white/80 p-4 hover:bg-white dark:border-amber-800/50 dark:bg-neutral-800/60"
                                    >
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent"
                                            animate={{ x: ['-100%', '100%'] }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: 'linear',
                                                repeatDelay: 3,
                                            }}
                                        />
                                        <div className="relative z-10">
                                            {v.selfie_url ? (
                                                <img
                                                    src={v.selfie_url}
                                                    alt=""
                                                    className="h-14 w-14 rounded-xl object-cover shadow-lg ring-2 ring-amber-300"
                                                />
                                            ) : (
                                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-200 to-orange-200 shadow-lg">
                                                    <Image className="h-6 w-6 text-amber-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="relative z-10 min-w-0 flex-1">
                                            <p className="truncate font-semibold text-neutral-900 dark:text-white">
                                                {v.mahasiswa}
                                            </p>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                {v.nim}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                {v.course}
                                            </p>
                                        </div>
                                        <div className="relative z-10 text-right">
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                }}
                                                className="mb-1 rounded-full bg-amber-500 px-2 py-1 text-xs font-medium text-white"
                                            >
                                                Pending
                                            </motion.div>
                                            <p className="text-xs text-neutral-500">
                                                {v.scanned_at}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* ═══════ STATISTICS & ANALYTICS ═══════ */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Monthly Trend */}
                    {monthlyTrend.length > 0 && (
                        <motion.div
                            variants={cardVariants}
                            className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.08, 0.15, 0.08],
                                }}
                                transition={{ duration: 5, repeat: Infinity }}
                                className="absolute top-0 right-0 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl"
                            />
                            <div className="relative z-10 mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <motion.div
                                        whileHover={{
                                            rotate: [0, -15, 15, 0],
                                            scale: 1.2,
                                        }}
                                        transition={{ duration: 0.5 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg"
                                    >
                                        <TrendingUp className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <h2 className="font-semibold text-neutral-900 dark:text-white">
                                            Tren Kehadiran
                                        </h2>
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                            6 bulan terakhir
                                        </p>
                                    </div>
                                </div>
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className="rounded-full bg-indigo-500 px-3 py-1 text-xs font-medium text-white"
                                >
                                    {stats.averageAttendanceRate}% avg
                                </motion.div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="relative z-10"
                            >
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={monthlyTrend}>
                                        <defs>
                                            <linearGradient
                                                id="colorPresent"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#6366f1"
                                                    stopOpacity={0.4}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#6366f1"
                                                    stopOpacity={0.05}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            className="stroke-neutral-200 dark:stroke-neutral-800"
                                        />
                                        <XAxis
                                            dataKey="month"
                                            tick={{
                                                fill: '#64748b',
                                                fontSize: 12,
                                            }}
                                        />
                                        <YAxis
                                            tick={{
                                                fill: '#64748b',
                                                fontSize: 12,
                                            }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="present"
                                            name="Hadir"
                                            stroke="#6366f1"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorPresent)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Course Stats */}
                    {courseStats.length > 0 && (
                        <motion.div
                            variants={cardVariants}
                            className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.08, 0.15, 0.08],
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    delay: 1,
                                }}
                                className="absolute top-0 right-0 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl"
                            />
                            <div className="relative z-10 mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <motion.div
                                        whileHover={{
                                            rotate: [0, -15, 15, 0],
                                            scale: 1.2,
                                        }}
                                        transition={{ duration: 0.5 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-white shadow-lg"
                                    >
                                        <BookOpen className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <h2 className="font-semibold text-neutral-900 dark:text-white">
                                            Statistik Mata Kuliah
                                        </h2>
                                        <p className="text-xs text-purple-600 dark:text-purple-400">
                                            {courseStats.length} mata kuliah
                                        </p>
                                    </div>
                                </div>
                                <Link href="/dosen/reports">
                                    <motion.div
                                        whileHover={{ scale: 1.05, x: 3 }}
                                        className="flex items-center gap-1 text-sm font-medium text-indigo-600"
                                    >
                                        Detail{' '}
                                        <ChevronRight className="h-3 w-3" />
                                    </motion.div>
                                </Link>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="relative z-10"
                            >
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart
                                        data={courseStats.map((c) => ({
                                            name:
                                                c.name.length > 12
                                                    ? c.name.substring(0, 12) +
                                                      '...'
                                                    : c.name,
                                            Hadir: c.present,
                                            Terlambat: c.late,
                                            Absen: c.absent,
                                            _raw: c,
                                        }))}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            className="stroke-neutral-200 dark:stroke-neutral-800"
                                        />
                                        <XAxis
                                            dataKey="name"
                                            tick={{
                                                fill: '#64748b',
                                                fontSize: 11,
                                            }}
                                        />
                                        <YAxis
                                            tick={{
                                                fill: '#64748b',
                                                fontSize: 12,
                                            }}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar
                                            dataKey="Hadir"
                                            fill="#10b981"
                                            radius={[8, 8, 0, 0]}
                                            animationDuration={1500}
                                            cursor="pointer"
                                            onClick={(_: any, idx: number) => {
                                                setSelectedCourse(
                                                    courseStats[idx],
                                                );
                                                setShowStatsModal(true);
                                            }}
                                        />
                                        <Bar
                                            dataKey="Terlambat"
                                            fill="#f59e0b"
                                            radius={[8, 8, 0, 0]}
                                            animationDuration={1500}
                                        />
                                        <Bar
                                            dataKey="Absen"
                                            fill="#f43f5e"
                                            radius={[8, 8, 0, 0]}
                                            animationDuration={1500}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </motion.div>
                    )}
                </div>

                {/* ═══════ RECENT ACTIVITY ═══════ */}
                <motion.div
                    variants={cardVariants}
                    className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.05, 0.1, 0.05],
                        }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="absolute top-0 right-0 h-40 w-40 rounded-full bg-slate-500/20 blur-3xl"
                    />
                    <div className="relative z-10 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <motion.div
                                whileHover={{
                                    rotate: [0, -15, 15, 0],
                                    scale: 1.2,
                                }}
                                transition={{ duration: 0.5 }}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-600 text-white shadow-lg"
                            >
                                <Clock className="h-5 w-5" />
                            </motion.div>
                            <div>
                                <h2 className="font-semibold text-neutral-900 dark:text-white">
                                    Aktivitas Terbaru
                                </h2>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                    Real-time updates
                                </p>
                            </div>
                        </div>
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.7, 1, 0.7],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="h-2 w-2 rounded-full bg-emerald-500"
                        />
                    </div>
                    {recentActivity.length === 0 ? (
                        <div className="relative z-10 py-12 text-center text-neutral-500">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <Clock className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                            </motion.div>
                            <p className="font-medium">Belum ada aktivitas</p>
                        </div>
                    ) : (
                        <div className="relative z-10 divide-y divide-neutral-100 dark:divide-neutral-800">
                            {recentActivity.map((a, i) => (
                                <motion.div
                                    key={a.id}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        delay: i * 0.06,
                                        type: 'spring',
                                        stiffness: 200,
                                    }}
                                    whileHover={{
                                        x: 8,
                                        backgroundColor:
                                            'rgba(99,102,241,0.05)',
                                        scale: 1.01,
                                    }}
                                    className="-mx-2 flex cursor-pointer items-center gap-4 rounded-lg px-2 py-4"
                                >
                                    <div
                                        className={cn(
                                            'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold shadow-lg',
                                            statusConfig[a.status]?.color ||
                                                'bg-neutral-100 text-neutral-600',
                                        )}
                                    >
                                        {a.mahasiswa.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                                            {a.mahasiswa}
                                        </p>
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                            {a.nim} • {a.course}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span
                                            className={cn(
                                                'inline-block rounded-full px-3 py-1 text-xs font-medium shadow-sm',
                                                statusConfig[a.status]?.color ||
                                                    'bg-neutral-100 text-neutral-600',
                                            )}
                                        >
                                            {statusConfig[a.status]?.label ||
                                                a.status}
                                        </span>
                                        <p className="mt-1 text-xs text-neutral-400">
                                            {a.time}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* ═══════ SESSION DETAIL MODAL ═══════ */}
                <AnimatePresence>
                    {showSessionModal && selectedSession && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
                            onClick={() => setShowSessionModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/90"
                            >
                                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 text-white">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20 text-lg font-bold backdrop-blur-xl">
                                                {selectedSession.meeting_number}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold">
                                                    {selectedSession.title}
                                                </h3>
                                                <p className="mt-1 text-xs text-indigo-100">
                                                    {selectedSession.course}
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 90,
                                            }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() =>
                                                setShowSessionModal(false)
                                            }
                                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
                                        >
                                            <X className="h-5 w-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>
                                <div className="space-y-4 p-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                                            <p className="text-xs text-neutral-500">
                                                Waktu
                                            </p>
                                            <p className="font-bold text-neutral-900 dark:text-white">
                                                {selectedSession.start_at} -{' '}
                                                {selectedSession.end_at}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                                            <p className="text-xs text-neutral-500">
                                                Kehadiran
                                            </p>
                                            <p className="font-bold text-emerald-600">
                                                {
                                                    selectedSession.attendance_count
                                                }{' '}
                                                mahasiswa
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                        <Link
                                            href={`/dosen/sessions/${selectedSession.id}`}
                                        >
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg"
                                            >
                                                Lihat Detail Lengkap
                                            </motion.button>
                                        </Link>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() =>
                                                setShowSessionModal(false)
                                            }
                                            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                        >
                                            Tutup
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════ VERIFY DETAIL MODAL ═══════ */}
                <AnimatePresence>
                    {showVerifyModal && selectedVerification && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
                            onClick={() => setShowVerifyModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/90"
                            >
                                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 text-white">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20 backdrop-blur-xl">
                                                <Eye className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold">
                                                    Verifikasi Selfie
                                                </h3>
                                                <p className="mt-1 text-xs text-indigo-100">
                                                    {
                                                        selectedVerification.mahasiswa
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 90,
                                            }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() =>
                                                setShowVerifyModal(false)
                                            }
                                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
                                        >
                                            <X className="h-5 w-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>
                                <div className="space-y-4 p-6">
                                    {selectedVerification.selfie_url && (
                                        <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
                                            <img
                                                src={
                                                    selectedVerification.selfie_url
                                                }
                                                alt="Selfie"
                                                className="h-64 w-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                                            <p className="text-xs text-neutral-500">
                                                NIM
                                            </p>
                                            <p className="font-bold text-neutral-900 dark:text-white">
                                                {selectedVerification.nim}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                                            <p className="text-xs text-neutral-500">
                                                Mata Kuliah
                                            </p>
                                            <p className="font-bold text-neutral-900 dark:text-white">
                                                {selectedVerification.course}
                                            </p>
                                        </div>
                                        <div className="col-span-2 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/50">
                                            <p className="text-xs text-neutral-500">
                                                Waktu Scan
                                            </p>
                                            <p className="font-bold text-neutral-900 dark:text-white">
                                                {
                                                    selectedVerification.scanned_at
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                        <Link href="/dosen/verify">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30"
                                            >
                                                Buka Halaman Verifikasi
                                            </motion.button>
                                        </Link>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() =>
                                                setShowVerifyModal(false)
                                            }
                                            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                        >
                                            Tutup
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════ COURSE STATS DETAIL MODAL ═══════ */}
                <AnimatePresence>
                    {showStatsModal && selectedCourse && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
                            onClick={() => setShowStatsModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/90"
                            >
                                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 text-white">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20 backdrop-blur-xl">
                                                <BookOpen className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold">
                                                    {selectedCourse.name}
                                                </h3>
                                                <p className="mt-1 text-xs text-indigo-100">
                                                    {selectedCourse.sks
                                                        ? `${selectedCourse.sks} SKS •`
                                                        : ''}{' '}
                                                    {selectedCourse.sessions}{' '}
                                                    sesi
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 90,
                                            }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() =>
                                                setShowStatsModal(false)
                                            }
                                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20"
                                        >
                                            <X className="h-5 w-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>
                                <div className="space-y-4 p-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-500/10">
                                            <p className="text-xs text-emerald-600">
                                                Hadir
                                            </p>
                                            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                                                {selectedCourse.present}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-amber-50 p-3 text-center dark:bg-amber-500/10">
                                            <p className="text-xs text-amber-600">
                                                Terlambat
                                            </p>
                                            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                                                {selectedCourse.late}
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-rose-50 p-3 text-center dark:bg-rose-500/10">
                                            <p className="text-xs text-rose-600">
                                                Absen
                                            </p>
                                            <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">
                                                {selectedCourse.absent}
                                            </p>
                                        </div>
                                    </div>
                                    {(() => {
                                        const total =
                                            selectedCourse.present +
                                            selectedCourse.late +
                                            selectedCourse.absent;
                                        const rate =
                                            total > 0
                                                ? Math.round(
                                                      ((selectedCourse.present +
                                                          selectedCourse.late) /
                                                          total) *
                                                          100,
                                                  )
                                                : 0;
                                        return (
                                            <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                                                <div className="mb-2 flex justify-between text-sm">
                                                    <span className="text-neutral-500">
                                                        Tingkat Kehadiran
                                                    </span>
                                                    <span className="font-bold text-neutral-900 dark:text-white">
                                                        {rate}%
                                                    </span>
                                                </div>
                                                <div className="h-3 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width: `${rate}%`,
                                                        }}
                                                        transition={{
                                                            duration: 1,
                                                            ease: 'easeOut',
                                                        }}
                                                        className={cn(
                                                            'h-full rounded-full',
                                                            rate >= 80
                                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                                                : rate >= 50
                                                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                                                  : 'bg-gradient-to-r from-red-500 to-rose-500',
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    <div className="flex flex-wrap gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                        <Link href="/dosen/sessions/create">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30"
                                            >
                                                Buat Sesi Baru
                                            </motion.button>
                                        </Link>
                                        <Link href="/dosen/reports">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg"
                                            >
                                                Export Rekap
                                            </motion.button>
                                        </Link>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() =>
                                                setShowStatsModal(false)
                                            }
                                            className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                        >
                                            Tutup
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </DosenLayout>
    );
}
