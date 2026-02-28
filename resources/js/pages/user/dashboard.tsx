import { Head, Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentLayout from '@/layouts/student-layout';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { AchievementBadge } from '@/components/ui/achievement-badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useCountdown } from '@/hooks/use-countdown';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadialBar,
    RadialBarChart,
} from 'recharts';
import {
    Calendar,
    CheckCircle,
    CheckCircle2,
    Clock,
    Flame,
    QrCode,
    TrendingUp,
    User,
    ChevronRight,
    Camera,
    FileText,
    Award,
    Zap,
    BarChart3,
    PieChart as PieChartIcon,
    Target,
    Sparkles,
    Activity,
    BookOpen,
    XCircle,
    RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import dashboardIcon from '@/assets/admin/dashboard/dashboard-icon.png';
import totalIcon from '@/assets/admin/dashboard/total-icon.png';
import hadirIcon from '@/assets/admin/dashboard/hadir-icon.png';
import streakIcon from '@/assets/mahasiswa/dashboard/streak.png';
import selfieIcon from '@/assets/admin/dashboard/selfie-icon.png';
import { router } from '@inertiajs/react';

/* ═══════════════════════════════════════════════════ */
/*                     TYPES                          */
/* ═══════════════════════════════════════════════════ */
interface MahasiswaInfo {
    id: number;
    nama: string;
    nim: string;
    avatar_url?: string;
}

interface UpcomingSession {
    id: number;
    title: string;
    course_name: string;
    meeting_number: number;
    start_at: string;
    end_at: string;
}

interface RecentActivity {
    id: number;
    type: 'attendance' | 'selfie_approved' | 'selfie_rejected' | 'achievement';
    message: string;
    time: string;
    status?: 'success' | 'warning' | 'error';
}

interface Achievement {
    type: 'streak' | 'perfect' | 'early' | 'consistent' | 'champion' | 'legend';
    value?: number;
    unlocked: boolean;
}

interface ChartDataItem {
    label: string;
    present?: number;
    late?: number;
    absent?: number;
    total?: number;
    value?: number;
}

interface ChartData {
    weekly: ChartDataItem[];
    monthly: ChartDataItem[];
    daily: ChartDataItem[];
    distribution: ChartDataItem[];
}

interface DashboardStats {
    totalAttendance: number;
    totalSessions: number;
    attendanceRate: number;
    currentStreak: number;
    longestStreak: number;
    onTimeRate: number;
    thisWeekAttendance: number;
    thisWeekTotal: number;
}

interface PageProps {
    mahasiswa: MahasiswaInfo;
    stats: DashboardStats;
    upcomingSessions: UpcomingSession[];
    recentActivity: RecentActivity[];
    achievements: Achievement[];
    notifications: { unread: number };
    chartData: ChartData;
}

/* ═══════════════════════════════════════════════════ */
/*          ANIMATION VARIANTS — Matching Admin       */
/* ═══════════════════════════════════════════════════ */
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
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
} as const;

/* ═══════════════════════════════════════════════════ */
/*                CUSTOM TOOLTIP                      */
/* ═══════════════════════════════════════════════════ */
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-white/20 bg-white/95 p-3 shadow-xl backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/95">
            <p className="font-semibold text-neutral-900 dark:text-white mb-2">{label}</p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-neutral-600 dark:text-neutral-400">{entry.name}:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

/* ═══════════════════════════════════════════════════ */
/*              COUNTDOWN TIMER                       */
/* ═══════════════════════════════════════════════════ */
function CountdownTimer({ targetDate }: { targetDate: Date }) {
    const { hours, minutes, seconds, isComplete } = useCountdown({
        targetDate,
        autoStart: true,
    });

    if (isComplete) {
        return (
            <span className="text-emerald-600 font-semibold animate-pulse">
                Sedang berlangsung!
            </span>
        );
    }

    return (
        <div className="flex items-center gap-1 font-mono">
            <span className="bg-neutral-900 text-white px-2 py-1 rounded text-sm dark:bg-white dark:text-neutral-900">
                {String(hours).padStart(2, '0')}
            </span>
            <span className="text-neutral-400">:</span>
            <span className="bg-neutral-900 text-white px-2 py-1 rounded text-sm dark:bg-white dark:text-neutral-900">
                {String(minutes).padStart(2, '0')}
            </span>
            <span className="text-neutral-400">:</span>
            <span className="bg-neutral-900 text-white px-2 py-1 rounded text-sm dark:bg-white dark:text-neutral-900">
                {String(seconds).padStart(2, '0')}
            </span>
        </div>
    );
}

/* ═══════════════════════════════════════════════════ */
/*                 MAIN COMPONENT                     */
/* ═══════════════════════════════════════════════════ */
export default function UserDashboard() {
    const { props } = usePage<{ props: PageProps }>();
    const {
        mahasiswa = { id: 0, nama: 'Mahasiswa', nim: '000000000000' },
        stats = {
            totalAttendance: 0,
            totalSessions: 0,
            attendanceRate: 0,
            currentStreak: 0,
            longestStreak: 0,
            onTimeRate: 0,
            thisWeekAttendance: 0,
            thisWeekTotal: 0,
        },
        upcomingSessions = [],
        recentActivity = [],
        achievements = [],
        chartData = { weekly: [], monthly: [], daily: [], distribution: [] },
    } = props as unknown as PageProps;

    const [currentTime, setCurrentTime] = useState(new Date());
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const nextSession = upcomingSessions[0];

    // Transform chart data
    const weeklyChartData = chartData.weekly.map(item => ({
        name: item.label,
        hadir: item.present || 0,
        terlambat: item.late || 0,
        tidakHadir: item.absent || 0,
    }));

    const pieData = [
        { name: 'Hadir', value: chartData.distribution.find(d => d.label === 'Hadir')?.value || 0, color: '#10b981' },
        { name: 'Terlambat', value: chartData.distribution.find(d => d.label === 'Terlambat')?.value || 0, color: '#f59e0b' },
        { name: 'Tidak Hadir', value: chartData.distribution.find(d => d.label === 'Tidak Hadir')?.value || 0, color: '#f43f5e' },
    ].filter(d => d.value > 0);

    const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
        success: { label: 'Hadir', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: CheckCircle2 },
        warning: { label: 'Terlambat', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Clock },
        error: { label: 'Tidak Hadir', color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30', icon: XCircle },
    };

    // Stats card config — matching admin pattern with PNG icons
    const statCards = [
        {
            icon: hadirIcon,
            title: 'Total Kehadiran',
            value: stats.totalAttendance,
            note: `dari ${stats.totalSessions} sesi`,
            colorConfig: { from: 'from-emerald-400', to: 'to-teal-600', shadow: 'shadow-emerald-500/30', bg: 'bg-emerald-500', hoverShadow: 'hover:shadow-emerald-500/10', gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10' },
        },
        {
            icon: totalIcon,
            title: 'Persentase Kehadiran',
            value: stats.attendanceRate,
            suffix: '%',
            note: 'Target: 85%',
            colorConfig: { from: 'from-sky-400', to: 'to-indigo-600', shadow: 'shadow-sky-500/30', bg: 'bg-sky-500', hoverShadow: 'hover:shadow-sky-500/10', gradientBg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10' },
        },
        {
            icon: streakIcon,
            title: 'Streak Saat Ini',
            value: stats.currentStreak,
            note: `Terbaik: ${stats.longestStreak} hari`,
            colorConfig: { from: 'from-amber-400', to: 'to-orange-600', shadow: 'shadow-amber-500/30', bg: 'bg-amber-500', hoverShadow: 'hover:shadow-amber-500/10', gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10' },
        },
        {
            icon: selfieIcon,
            title: 'Tepat Waktu',
            value: stats.onTimeRate,
            suffix: '%',
            note: `Minggu ini: ${stats.thisWeekAttendance}/${stats.thisWeekTotal}`,
            colorConfig: { from: 'from-rose-400', to: 'to-pink-600', shadow: 'shadow-rose-500/30', bg: 'bg-rose-500', hoverShadow: 'hover:shadow-rose-500/10', gradientBg: 'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10' },
        },
    ];

    return (
        <StudentLayout>
            <Head title="Dashboard" />

            <motion.div
                className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* ═══════ HERO HEADER — Matching Admin Dashboard ═══════ */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200% 200%' }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
                                <motion.div
                                    className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img src={dashboardIcon} alt="Dashboard" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                </motion.div>
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm text-indigo-100 font-medium tracking-wide"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Selamat datang kembali,
                                    </motion.p>
                                    <motion.h1
                                        className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        {mahasiswa.nama}
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 text-indigo-100 max-w-lg text-sm sm:text-base leading-relaxed"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Pantau kehadiran, capaian, dan progress studi Anda di satu tempat.
                                    </motion.p>
                                </div>
                            </div>

                            <div className="flex flex-col w-full sm:w-auto items-center sm:items-end gap-2 mt-4 sm:mt-0">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-4 py-2 sm:px-6 sm:py-3 shadow-lg border border-white/10"
                                >
                                    <div className="text-center sm:text-right">
                                        <p className="text-2xl sm:text-3xl font-bold tabular-nums">
                                            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-indigo-200">
                                            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </motion.div>
                                {/* Streak badge */}
                                {stats.currentStreak > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.7, type: 'spring' }}
                                        className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-xl border border-white/10"
                                    >
                                        <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                                            <Flame className="h-5 w-5 text-orange-300" />
                                        </motion.div>
                                        <span className="font-bold text-lg">{stats.currentStreak}</span>
                                        <span className="text-sm text-indigo-100">hari streak</span>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
                            }}
                            className="flex flex-nowrap w-full overflow-x-auto gap-2 sm:gap-3 mt-6 sm:mt-8 pt-6 pb-2 border-t border-white/10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        >
                            <motion.a
                                href="/user/absen"
                                className="inline-flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold text-indigo-600 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <QrCode className="h-3.5 w-3.5" />
                                Absen Sekarang
                            </motion.a>
                            <motion.a
                                href="/user/rekapan"
                                className="inline-flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl bg-white/20 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/30 border border-white/20 shadow-lg"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FileText className="h-3.5 w-3.5" />
                                Rekapan
                            </motion.a>
                            <motion.a
                                href="/user/tugas"
                                className="inline-flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl bg-white/20 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/30 border border-white/20 shadow-lg"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <BookOpen className="h-3.5 w-3.5" />
                                Tugas
                            </motion.a>
                            <motion.button
                                onClick={() => router.reload()}
                                className="inline-flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl bg-white/20 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/30 border border-white/20 shadow-lg"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Refresh
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══════ STATS CARDS — Matching Admin Glassmorphism ═══════ */}
                <motion.div
                    className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.2 } },
                    }}
                >
                    {statCards.map((stat, index) => {
                        const cardKey = `stat-${index}`;
                        return (
                            <motion.div
                                key={stat.title}
                                className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl transition-all ${stat.colorConfig.hoverShadow} dark:border-white/5`}
                                variants={{
                                    hidden: { opacity: 0, y: 30, scale: 0.9 },
                                    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
                                }}
                                whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                                onHoverStart={() => setHoveredCard(cardKey)}
                                onHoverEnd={() => setHoveredCard(null)}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.colorConfig.gradientBg}`} />
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: hoveredCard === cardKey ? 1.5 : 1,
                                        opacity: hoveredCard === cardKey ? 0.4 : 0.2,
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${stat.colorConfig.bg} blur-3xl transition-all duration-500`}
                                />
                                <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center"
                                    >
                                        <img src={stat.icon} alt={stat.title} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" />
                                    </motion.div>
                                    <div>
                                        <p className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-neutral-400">{stat.title}</p>
                                        <div className="mt-0.5 sm:mt-1">
                                            <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                            </span>
                                        </div>
                                        <p className="text-[8px] sm:text-xs leading-tight text-neutral-400 mt-0.5">{stat.note}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══════ MAIN CONTENT GRID — Charts ═══════ */}
                <motion.div
                    className="grid gap-6 lg:grid-cols-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
                    }}
                >
                    {/* Weekly Attendance Chart */}
                    <motion.div
                        className="lg:col-span-2 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                        variants={itemVariants}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Kehadiran Mingguan</h2>
                                    <p className="text-sm text-neutral-500">Statistik 7 hari terakhir</p>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-4 text-xs">
                                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Hadir</span>
                                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Terlambat</span>
                                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />Tidak Hadir</span>
                            </div>
                        </div>
                        <div className="h-72">
                            {weeklyChartData.length === 0 ? (
                                <div className="flex items-center justify-center h-full rounded-2xl border border-white/10 bg-neutral-50/50 text-sm text-neutral-500 dark:bg-neutral-800/50">
                                    Belum ada data mingguan.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={weeklyChartData}>
                                        <defs>
                                            <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorTerlambat" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
                                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="hadir" name="Hadir" stroke="#10b981" strokeWidth={2} fill="url(#colorHadir)" />
                                        <Area type="monotone" dataKey="terlambat" name="Terlambat" stroke="#f59e0b" strokeWidth={2} fill="url(#colorTerlambat)" />
                                        <Area type="monotone" dataKey="tidakHadir" name="Tidak Hadir" stroke="#ef4444" strokeWidth={2} fillOpacity={0.1} fill="#ef4444" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </motion.div>

                    {/* Attendance Rate Gauge */}
                    <motion.div
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Tingkat Kehadiran</h2>
                                <p className="text-sm text-neutral-500">Persentase keseluruhan</p>
                            </div>
                        </div>
                        <div className="h-52 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: stats.attendanceRate, fill: stats.attendanceRate >= 75 ? '#10b981' : '#f59e0b' }]} startAngle={180} endAngle={0}>
                                    <RadialBar background dataKey="value" cornerRadius={10} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center -mt-8">
                            <p className="text-4xl font-bold text-neutral-900 dark:text-white">{stats.attendanceRate}%</p>
                            <p className="text-sm text-neutral-500">
                                {stats.attendanceRate >= 75 ? '✨ Luar biasa!' : 'Perlu ditingkatkan'}
                            </p>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                            <div className="rounded-xl bg-emerald-50/80 p-2 dark:bg-emerald-900/20 backdrop-blur">
                                <p className="font-semibold text-emerald-600">{stats.onTimeRate}%</p>
                                <p className="text-emerald-600/70">Tepat Waktu</p>
                            </div>
                            <div className="rounded-xl bg-amber-50/80 p-2 dark:bg-amber-900/20 backdrop-blur">
                                <p className="font-semibold text-amber-600">{stats.currentStreak}</p>
                                <p className="text-amber-600/70">Streak</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* ═══════ SECOND ROW — Activity & Quick Links ═══════ */}
                <motion.div
                    className="grid gap-6 lg:grid-cols-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
                    }}
                >
                    {/* Recent Activity */}
                    <motion.div
                        className="lg:col-span-2 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                        variants={itemVariants}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 text-white shadow-lg shadow-violet-500/30">
                                    <Activity className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Aktivitas Terbaru</h2>
                                    <p className="text-sm text-neutral-500">Riwayat kehadiran Anda</p>
                                </div>
                            </div>
                            <Link href="/user/history" className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                Lihat semua <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentActivity.length === 0 ? (
                                <div className="rounded-2xl border border-white/10 bg-neutral-50/50 p-6 text-center text-sm text-neutral-500 dark:bg-neutral-800/50">
                                    Belum ada aktivitas.
                                </div>
                            ) : (
                                recentActivity.slice(0, 5).map((item, idx) => {
                                    const config = statusConfig[item.status || 'success'] ?? statusConfig.success;
                                    const Icon = config.icon;
                                    return (
                                        <motion.div
                                            key={item.id}
                                            className="flex items-center gap-4 p-3 rounded-2xl bg-neutral-50/50 dark:bg-neutral-800/50 hover:bg-neutral-100/60 dark:hover:bg-neutral-700/50 transition-colors backdrop-blur"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            whileHover={{ scale: 1.02, x: 4 }}
                                        >
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg}`}>
                                                <Icon className={`h-5 w-5 ${config.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-neutral-900 dark:text-white truncate">{item.message}</p>
                                                <p className="text-xs text-neutral-500">{item.time}</p>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                                                {config.label}
                                            </span>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>

                    {/* Right Column — Quick Links & Upcoming */}
                    <div className="space-y-6">
                        {/* Upcoming Session */}
                        <motion.div
                            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Sesi Mendatang</h2>
                                    <p className="text-sm text-neutral-500">{upcomingSessions.length} sesi dijadwalkan</p>
                                </div>
                            </div>
                            {nextSession ? (
                                <div className="space-y-3">
                                    <div className="rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 p-4 dark:from-indigo-900/20 dark:to-purple-900/20 backdrop-blur">
                                        <p className="font-semibold text-neutral-900 dark:text-white">{nextSession.course_name}</p>
                                        <p className="text-sm text-neutral-500">{nextSession.title} — Pertemuan {nextSession.meeting_number}</p>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                                            <Clock className="h-3 w-3" />
                                            <CountdownTimer targetDate={new Date(nextSession.start_at)} />
                                        </div>
                                    </div>
                                    {upcomingSessions.slice(1, 3).map((session) => (
                                        <div key={session.id} className="flex items-center gap-3 p-2 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/50 backdrop-blur">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-neutral-900 dark:text-white text-sm truncate">{session.course_name}</p>
                                                <p className="text-xs text-neutral-500">{new Date(session.start_at).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-white/10 bg-neutral-50/50 p-4 text-center text-sm text-neutral-500 dark:bg-neutral-800/50">
                                    Tidak ada sesi mendatang.
                                </div>
                            )}
                        </motion.div>

                        {/* Quick Links */}
                        <motion.div
                            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                            variants={itemVariants}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 text-white shadow-lg shadow-pink-500/30">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Menu Cepat</h2>
                                    <p className="text-sm text-neutral-500">Akses fitur utama</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { href: '/user/absen', icon: QrCode, label: 'Absensi', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
                                    { href: '/user/rekapan', icon: FileText, label: 'Rekapan', color: 'text-sky-600', bg: 'bg-sky-100 dark:bg-sky-900/30' },
                                    { href: '/user/bukti-masuk', icon: Camera, label: 'Bukti Masuk', color: 'text-violet-600', bg: 'bg-violet-100 dark:bg-violet-900/30' },
                                    { href: '/user/profile', icon: User, label: 'Profil', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
                                ].map((item) => (
                                    <Link key={item.href} href={item.href}>
                                        <motion.div
                                            whileHover={{ scale: 1.03, x: 4 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-100/60 dark:hover:bg-neutral-700/50 transition-colors cursor-pointer"
                                        >
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                                                <item.icon className={`h-4 w-4 ${item.color}`} />
                                            </div>
                                            <span className="flex-1 text-sm font-medium text-neutral-900 dark:text-white">{item.label}</span>
                                            <ChevronRight className="h-4 w-4 text-neutral-400" />
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══════ THIRD ROW — Distribution & Achievements ═══════ */}
                <motion.div
                    className="grid gap-6 lg:grid-cols-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
                    }}
                >
                    {/* Attendance Distribution */}
                    {pieData.length > 0 && (
                        <motion.div
                            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                            variants={itemVariants}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-blue-600 text-white shadow-lg shadow-indigo-500/30">
                                    <PieChartIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Distribusi Kehadiran</h2>
                                    <p className="text-sm text-neutral-500">Proporsi status kehadiran</p>
                                </div>
                            </div>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4 mt-2">
                                {pieData.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-1.5 text-xs">
                                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                        <span className="text-neutral-600 dark:text-neutral-400">{entry.name}</span>
                                        <span className="font-semibold text-neutral-900 dark:text-white">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Achievements */}
                    <motion.div
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                        variants={itemVariants}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                                    <Award className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Pencapaian</h2>
                                    <p className="text-sm text-neutral-500">Badge dan achievement</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {(achievements.length > 0 ? achievements : [
                                { type: 'streak' as const, value: stats.currentStreak, unlocked: stats.currentStreak >= 3 },
                                { type: 'perfect' as const, unlocked: stats.attendanceRate === 100 },
                                { type: 'early' as const, unlocked: stats.onTimeRate >= 90 },
                                { type: 'consistent' as const, unlocked: stats.attendanceRate >= 80 },
                                { type: 'champion' as const, unlocked: false },
                                { type: 'legend' as const, unlocked: false },
                            ]).slice(0, 6).map((achievement, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 200 }}
                                    whileHover={{
                                        scale: achievement.unlocked ? 1.15 : 1.05,
                                        y: -5,
                                    }}
                                    className={cn(
                                        'flex flex-col items-center p-3 rounded-xl transition-all cursor-pointer bg-neutral-50/50 dark:bg-neutral-800/50 backdrop-blur',
                                        !achievement.unlocked && 'opacity-40 grayscale',
                                    )}
                                >
                                    <AchievementBadge
                                        type={achievement.type}
                                        value={achievement.unlocked ? achievement.value : undefined}
                                        size="sm"
                                    />
                                </motion.div>
                            ))}
                        </div>
                        <Link href="/user/achievements" className="block mt-4">
                            <motion.div whileHover={{ scale: 1.02, x: 3 }} whileTap={{ scale: 0.98 }}>
                                <Button variant="ghost" className="w-full text-sm text-indigo-600 hover:text-indigo-700">
                                    Lihat Semua Pencapaian
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </motion.div>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* ═══════ PROGRESS SECTION ═══════ */}
                <motion.div
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
                            <Target className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Progress Kehadiran</h2>
                            <p className="text-sm text-neutral-500">Target dan pencapaian semester ini</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">Kehadiran Keseluruhan</span>
                                <span className="text-sm font-semibold text-neutral-900 dark:text-white">{stats.attendanceRate}%</span>
                            </div>
                            <Progress value={stats.attendanceRate} className="h-2.5" />
                            <p className="text-xs text-neutral-500 mt-1">Minimal 75% untuk memenuhi syarat</p>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">Ketepatan Waktu</span>
                                <span className="text-sm font-semibold text-neutral-900 dark:text-white">{stats.onTimeRate}%</span>
                            </div>
                            <Progress value={stats.onTimeRate} className="h-2.5" />
                            <p className="text-xs text-neutral-500 mt-1">Datang tepat waktu atau lebih awal</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </StudentLayout>
    );
}
