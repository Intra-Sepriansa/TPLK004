import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    TrendingUp,
    Users,
    XCircle,
    ChevronRight,
    Award,
    Zap,
    AlertTriangle,
    BellRing,
    Target,
    MessageSquareWarning,
    CheckCheck,
    Minimize2,
    Trophy,
    Sparkles,
    PartyPopper,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { EvaluationDashboard } from '@/components/student/evaluation-dashboard';
import { WhatIfSimulator } from '@/components/student/what-if-simulator';
import rekapanIcon from '@/assets/mahasiswa/rekapan/rekapan&evaluasi.png';
import HadirIcon from '@/assets/admin/rekap-kehadiran/hadir.png';
import TerlambatIcon from '@/assets/admin/rekap-kehadiran/terlambat.png';
import DitolakIcon from '@/assets/admin/rekap-kehadiran/ditolak.png';
import TargetIcon from '@/assets/admin/rekap-kehadiran/total-scan.png';

interface MahasiswaInfo {
    id: number;
    nama: string;
    nim: string;
}

interface Stats {
    totalSessions: number;
    presentCount: number;
    lateCount: number;
    rejectedCount: number;
    totalAttendance: number;
    attendanceRate: number;
    onTimeRate: number;
    thisMonthTotal: number;
    thisMonthPresent: number;
}

interface CourseSummary {
    courseId: number;
    courseName: string;
    total: number;
    present: number;
    late: number;
    rejected: number;
    attended: number;
    rate: number;
}

interface MonthlyTrend {
    month: string;
    total: number;
    attended: number;
    rate: number;
}

interface Distribution {
    name: string;
    value: number;
    color: string;
}

interface RecentLog {
    id: number;
    status: string;
    courseName: string;
    meetingNumber: number;
    scannedAt: string;
    scannedAtFormatted: string;
}

interface Warning {
    id: string | number;
    title: string;
    message: string;
    type: string;
    created_at: string;
    is_read: boolean;
}

interface PageProps {
    mahasiswa: MahasiswaInfo;
    stats: Stats;
    courseSummary: CourseSummary[];
    monthlyTrend: MonthlyTrend[];
    distribution: Distribution[];
    recentLogs: RecentLog[];
    warnings: Warning[];
}

const statusConfig = {
    present: { label: 'Hadir', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
    late: { label: 'Terlambat', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    rejected: { label: 'Ditolak', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.9,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 20,
        },
    },
};

const cardHoverVariants = {
    hover: {
        scale: 1.02,
        y: -4,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 15,
        },
    },
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-white/20 bg-white/95 p-3 shadow-xl backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/95"
        >
            <p className="mb-2 font-semibold text-neutral-900 dark:text-white">
                {label}
            </p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-neutral-600 dark:text-neutral-400">
                        {entry.name}:
                    </span>
                    <span className="font-semibold text-neutral-900 dark:text-white">
                        {entry.value}
                    </span>
                </div>
            ))}
        </motion.div>
    );
};

function StatCard({
    iconSrc,
    label,
    value,
    suffix,
    subtext,
    color,
}: {
    iconSrc: string;
    label: string;
    value: number;
    suffix?: string;
    subtext?: string;
    color: 'emerald' | 'amber' | 'sky' | 'violet' | 'rose';
}) {
    const colorStyles = {
        emerald: {
            gradientBg: 'from-emerald-400/20 to-teal-600/10',
            iconBg: 'bg-emerald-500/15',
            iconText: 'text-emerald-500',
            glow: 'bg-emerald-500/50',
            hoverShadow: 'hover:shadow-emerald-500/20',
        },
        amber: {
            gradientBg: 'from-amber-400/20 to-orange-600/10',
            iconBg: 'bg-amber-500/15',
            iconText: 'text-amber-500',
            glow: 'bg-amber-500/50',
            hoverShadow: 'hover:shadow-amber-500/20',
        },
        sky: {
            gradientBg: 'from-sky-400/20 to-indigo-600/10',
            iconBg: 'bg-sky-500/15',
            iconText: 'text-sky-500',
            glow: 'bg-sky-500/50',
            hoverShadow: 'hover:shadow-sky-500/20',
        },
        violet: {
            gradientBg: 'from-violet-400/20 to-purple-600/10',
            iconBg: 'bg-violet-500/15',
            iconText: 'text-violet-500',
            glow: 'bg-violet-500/50',
            hoverShadow: 'hover:shadow-violet-500/20',
        },
        rose: {
            gradientBg: 'from-rose-400/20 to-pink-600/10',
            iconBg: 'bg-rose-500/15',
            iconText: 'text-rose-500',
            glow: 'bg-rose-500/50',
            hoverShadow: 'hover:shadow-rose-500/20',
        },
    };

    const style = colorStyles[color];

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{
                scale: 1.04,
                y: -4,
                transition: { type: 'spring', stiffness: 400, damping: 15 },
            }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 dark:border-white/5 dark:bg-neutral-900/40',
                style.hoverShadow,
            )}
        >
            <div
                className={cn(
                    'pointer-events-none absolute inset-0 bg-gradient-to-br',
                    style.gradientBg,
                )}
            />
            <div
                className={cn(
                    'pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl',
                    style.glow,
                )}
            />

            <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center sm:h-16 sm:w-16"
                >
                    <img src={iconSrc} alt={label} className="h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" />
                </div>
                <div>
                    <p className="text-[10px] font-medium leading-tight text-neutral-500 sm:text-sm dark:text-neutral-400">
                        {label}
                    </p>
                    <div className="mt-0.5 sm:mt-1">
                        <span className="text-lg font-bold text-neutral-900 sm:text-2xl dark:text-white">
                            <AnimatedCounter value={value} suffix={suffix} />
                        </span>
                    </div>
                    {subtext && (
                        <p className="mt-0.5 text-[8px] leading-tight text-neutral-400 sm:text-xs">
                            {subtext}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function UserRekapan() {
    const { props } = usePage<{ props: PageProps }>();
    const {
        mahasiswa = { id: 0, nama: '', nim: '' },
        stats = {
            totalSessions: 0, presentCount: 0, lateCount: 0, rejectedCount: 0,
            totalAttendance: 0, attendanceRate: 0, onTimeRate: 0,
            thisMonthTotal: 0, thisMonthPresent: 0,
        },
        courseSummary = [],
        monthlyTrend = [],
        distribution = [],
        recentLogs = [],
        warnings = [],
    } = props as unknown as PageProps;

    const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null);

    // Transform data for charts
    const courseChartData = courseSummary.map(c => ({
        name: c.courseName.length > 12 ? c.courseName.substring(0, 12) + '...' : c.courseName,
        Hadir: c.present,
        Terlambat: c.late,
        Ditolak: c.rejected,
    }));

    const trendChartData = monthlyTrend.map(m => ({
        name: m.month.split(' ')[0],
        Kehadiran: m.rate,
        Total: m.total,
    }));

    // Calculate remaining sessions (Assuming 16 meetings per course)
    const estimatedTotalSessions = courseSummary.length * 16;
    const remainingSessions = Math.max(0, estimatedTotalSessions - stats.totalSessions);

    return (
        <StudentLayout>
            <Head title="Rekapan Kehadiran" />

            {/* Main Background */}
            <div className="fixed inset-0 pointer-events-none z-[-1] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-black dark:to-gray-950" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6 relative z-10"
            >
                {/* Warnings Section - Only visible if there are warnings */}
                {/* Warnings moved to sidebar */}

                {/* Header Card - ULTRA ADVANCED */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-8"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:gap-6">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:w-auto sm:flex-row sm:gap-6 sm:text-left">
                                <motion.div
                                    className="relative mx-auto flex h-20 w-20 shrink-0 items-center justify-center sm:mx-0 sm:h-24 sm:w-24"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={rekapanIcon}
                                        alt="Rekapan & Evaluasi"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        className="flex items-center justify-center gap-2 text-sm font-medium tracking-wide text-indigo-100 sm:justify-start"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <BookOpen className="h-4 w-4" /> Rekapan & Evaluasi
                                    </motion.p>
                                    <motion.h1
                                        className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        {mahasiswa.nama}
                                    </motion.h1>
                                    <motion.div
                                        className="mt-1 flex flex-wrap items-center justify-center gap-3 text-sm text-indigo-100 sm:justify-start"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <span className="flex items-center gap-1">NIM: {mahasiswa.nim}</span>
                                    </motion.div>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
                                className="w-full rounded-2xl border border-white/20 bg-white/20 px-4 py-3 backdrop-blur-xl shadow-lg sm:w-auto sm:min-w-[220px]"
                            >
                                <p className="text-xs font-semibold tracking-wide text-indigo-100">Evaluasi Kehadiran</p>
                                <p className="mt-1 text-2xl font-bold text-white">{stats.attendanceRate}%</p>
                                <p className="mt-1 text-xs text-indigo-100">
                                    Bulan ini: {stats.thisMonthPresent}/{stats.thisMonthTotal || 0} hadir
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                >
                    <StatCard iconSrc={HadirIcon} label="Hadir" value={stats.presentCount} subtext="tepat waktu" color="emerald" />
                    <StatCard iconSrc={TerlambatIcon} label="Terlambat" value={stats.lateCount} subtext="sesi" color="amber" />
                    <StatCard iconSrc={DitolakIcon} label="Ditolak" value={stats.rejectedCount} subtext="sesi" color="rose" />
                    <StatCard iconSrc={TargetIcon} label="Target" value={75} suffix="%" subtext="min. kehadiran" color="violet" />
                </motion.div>

                {/* Advanced Evaluation Section */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
                >
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.005 }}
                            className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2"
                                >
                                    <Zap className="h-5 w-5 text-amber-500" />
                                </motion.div>
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    AI Insights & Health
                                </h2>
                            </div>
                            <EvaluationDashboard
                                attendanceRate={stats.attendanceRate}
                                totalSessions={stats.totalSessions}
                                missedSessions={stats.totalSessions - stats.presentCount}
                            />
                        </motion.div>
                    </div>
                    <div className="space-y-6">
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.005 }}
                            className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div className="mb-6 flex items-center gap-3">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2"
                                >
                                    <Target className="h-5 w-5 text-emerald-500" />
                                </motion.div>
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    Simulator Kelulusan
                                </h2>
                            </div>
                            <WhatIfSimulator
                                totalSessions={stats.totalSessions}
                                presentSessions={stats.presentCount}
                                remainingSessions={remainingSessions}
                            />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column */}
                    <div className="space-y-6 lg:col-span-2">
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.005 }}
                            className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-white/5">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                        className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400"
                                    >
                                        <BookOpen className="h-5 w-5" />
                                    </motion.div>
                                    <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                                        Ringkasan per Mata Kuliah
                                    </h2>
                                </div>
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: "spring" }}
                                    className="text-xs font-medium text-violet-300 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20"
                                >
                                    {courseSummary.length} mata kuliah
                                </motion.span>
                            </div>

                            <div className="divide-y divide-white/10 dark:divide-white/5 relative z-10">
                                {courseSummary.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-8 text-center"
                                    >
                                        <BookOpen className="h-12 w-12 mx-auto text-neutral-300" />
                                        <p className="mt-3 text-neutral-500">Belum ada data mata kuliah</p>
                                    </motion.div>
                                ) : (
                                    courseSummary.map((course, index) => (
                                        <motion.div
                                            key={course.courseId}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: index * 0.05,
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 20
                                            }}
                                            whileHover={{
                                                x: 5,
                                                scale: 1.01,
                                                backgroundColor: 'rgba(139, 92, 246, 0.05)',
                                                transition: { type: 'spring', stiffness: 400, damping: 15 }
                                            }}
                                            className="p-4 cursor-pointer border-l-4 border-transparent hover:border-violet-500 transition-all rounded-r-xl"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-medium text-neutral-900 dark:text-white truncate max-w-[200px]">
                                                    {course.courseName}
                                                </h3>
                                                <span className={cn(
                                                    'px-2 py-1 rounded-full text-xs font-semibold',
                                                    course.rate >= 75 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        course.rate >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                            'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                )}>
                                                    {course.rate}%
                                                </span>
                                            </div>
                                            <Progress value={course.rate} className="h-2 mb-2" />
                                            <div className="flex gap-4 text-xs text-neutral-500">
                                                <span className="flex items-center gap-1">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                    Hadir: {course.present}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                                                    Terlambat: {course.late}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                                                    Ditolak: {course.rejected}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Course Bar Chart */}
                        {courseChartData.length > 0 && (
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ scale: 1.005 }}
                                className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 overflow-hidden"
                            >
                                <div className="flex items-center gap-3 mb-6 p-6 border-b border-white/20 dark:border-white/5">
                                    <motion.div
                                        whileHover={{ scale: 1.2, rotate: -10 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                        className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
                                    >
                                        <TrendingUp className="h-5 w-5" />
                                    </motion.div>
                                    <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                                        Grafik per Mata Kuliah
                                    </h2>
                                </div>
                                <div className="relative z-10">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={courseChartData}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
                                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Bar dataKey="Hadir" fill="#10b981" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Terlambat" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Ditolak" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        )}

                        {/* Monthly Trend */}
                        {trendChartData.length > 0 && (
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ scale: 1.005 }}
                                className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 overflow-hidden"
                            >
                                <div className="flex items-center gap-3 mb-6 p-6 border-b border-white/20 dark:border-white/5">
                                    <motion.div
                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                        className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20"
                                    >
                                        <Calendar className="h-5 w-5" />
                                    </motion.div>
                                    <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                                        Tren Kehadiran 6 Bulan Terakhir
                                    </h2>
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={trendChartData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
                                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line type="monotone" dataKey="Kehadiran" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </motion.div>
                        )}
                        {/* Recent Activity - Moved to Main Column */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.005 }}
                            className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-white/5">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ scale: 1.2, rotate: -10 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                        className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20"
                                    >
                                        <Clock className="h-5 w-5" />
                                    </motion.div>
                                    <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                                        Aktivitas Terakhir
                                    </h2>
                                </div>
                            </div>
                            <div className="divide-y divide-white/10 dark:divide-white/5">
                                {recentLogs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
                                        <div className="p-4 rounded-full bg-neutral-50 dark:bg-white/5">
                                            <Clock className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium text-neutral-900 dark:text-white">Belum ada aktivitas</p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
                                                Aktivitas absensi dan perkuliahan kamu akan muncul di sini.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    recentLogs.map((log, index) => {
                                        const config = statusConfig[log.status as keyof typeof statusConfig] || statusConfig.rejected;
                                        const Icon = config.icon;
                                        return (
                                            <motion.div
                                                key={log.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                                                whileHover={{
                                                    x: 5,
                                                    backgroundColor: 'rgba(99, 102, 241, 0.05)',
                                                    transition: { type: 'spring', stiffness: 400, damping: 15 }
                                                }}
                                                className="p-4 flex items-center gap-4 cursor-pointer"
                                            >
                                                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shadow-sm', config.color)}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                                        {log.courseName}
                                                    </p>
                                                    <p className="text-xs text-neutral-500 mt-0.5">
                                                        {log.scannedAtFormatted}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                            {recentLogs.length > 0 && (
                                <div className="p-4 border-t border-white/20 dark:border-white/5 bg-white/30 dark:bg-white/5">
                                    <Link href="/user/history">
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button variant="ghost" className="w-full text-sm text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-900/20">
                                                Lihat Riwayat Lengkap
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </motion.div>
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Warnings Widget - PREMIUM STYLE */}
                        {warnings.length > 0 && (
                            <motion.div
                                variants={itemVariants}
                                className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-0 shadow-lg dark:from-amber-900/10 dark:to-orange-900/10 dark:border-amber-700/30 overflow-hidden backdrop-blur-sm"
                            >
                                <div className="p-4 border-b border-amber-200/50 dark:border-amber-700/30 flex justify-between items-center bg-white/40 dark:bg-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700/50">
                                            <BellRing className="h-4 w-4" />
                                        </div>
                                        <h3 className="font-bold text-amber-900 dark:text-amber-100 text-sm">
                                            Pemberitahuan ({warnings.length})
                                        </h3>
                                    </div>
                                    <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                                </div>

                                <div className="max-h-[300px] overflow-y-auto p-2 space-y-2 custom-scrollbar">
                                    {warnings.map((warning, index) => (
                                        <motion.div
                                            key={warning.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => setSelectedWarning(warning)}
                                            className="group relative p-3 rounded-xl bg-white/40 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 transition-all cursor-pointer border border-transparent hover:border-amber-200 dark:hover:border-amber-700/50 hover:shadow-md"
                                        >
                                            <div className="flex gap-3">
                                                <div className={cn(
                                                    "mt-1 p-1.5 h-fit rounded-lg flex-shrink-0",
                                                    warning.type === 'warning'
                                                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                                        : warning.type === 'appreciation'
                                                            ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                                                            : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                                )}>
                                                    {warning.type === 'warning' ? <AlertTriangle className="h-3.5 w-3.5" /> :
                                                        warning.type === 'appreciation' ? <PartyPopper className="h-3.5 w-3.5" /> :
                                                            <BellRing className="h-3.5 w-3.5" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate pr-2">
                                                            {warning.title}
                                                        </h4>
                                                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                                            {warning.created_at.split(',')[0]}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                        {warning.message}
                                                    </p>
                                                </div>
                                            </div>
                                            {!warning.is_read && (
                                                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-black" />
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        {/* Distribution Pie Chart */}
                        {distribution.some(d => d.value > 0) && (
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ scale: 1.005 }}
                                className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 overflow-hidden"
                            >
                                <div className="flex items-center gap-3 p-6 border-b border-white/20 dark:border-white/5">
                                    <motion.div
                                        whileHover={{ scale: 1.2, y: -2 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                        className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20"
                                    >
                                        <Award className="h-5 w-5" />
                                    </motion.div>
                                    <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                                        Distribusi Status
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={distribution.filter(d => d.value > 0)}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey="value"
                                                cornerRadius={4}
                                            >
                                                {distribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-center gap-4 mt-2 flex-wrap">
                                        {distribution.filter(d => d.value > 0).map((entry, index) => (
                                            <div key={index} className="flex items-center gap-2 text-xs font-medium">
                                                <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                                                <span className="text-neutral-600 dark:text-neutral-400">
                                                    {entry.name}: {entry.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Attendance Rate Card */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -3 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            className="rounded-3xl border border-white/20 bg-gradient-to-br from-neutral-900 to-neutral-800 p-6 text-white shadow-xl dark:from-neutral-900 dark:to-black dark:border-white/5"
                        >
                            <p className="text-sm text-neutral-400">Tingkat Kehadiran</p>
                            <div className="flex items-end gap-2 mt-2">
                                <span className="text-4xl font-bold tracking-tight">
                                    <AnimatedCounter value={stats.attendanceRate} suffix="%" />
                                </span>
                                {stats.attendanceRate >= 75 ? (
                                    <span className="text-emerald-400 text-sm mb-1 flex items-center gap-1 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                        <Zap className="h-3 w-3" /> Bagus!
                                    </span>
                                ) : (
                                    <span className="text-amber-400 text-sm mb-1 font-medium bg-amber-400/10 px-2 py-0.5 rounded-full">Perlu ditingkatkan</span>
                                )}
                            </div>
                            <Progress
                                value={stats.attendanceRate}
                                className="mt-4 h-2 bg-neutral-700/50"
                            />
                        </motion.div>

                        {/* Weekly Streak Widget - CLEAN GLASS */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Weekly Streak</p>
                                        <div className="mt-1 flex items-baseline gap-1.5">
                                            <span className="text-3xl font-black text-neutral-900 dark:text-white">
                                                {recentLogs.length > 0 ? '3' : '0'}
                                            </span>
                                            <span className="text-xs font-medium text-neutral-500">hari</span>
                                        </div>
                                    </div>
                                    <div className="p-2.5 bg-orange-100 rounded-xl dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                        <Zap className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-1">
                                    {[...Array(7)].map((_, i) => (
                                        <div key={i} className={cn(
                                            "h-1.5 flex-1 rounded-full transition-all",
                                            i < 3 ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" : "bg-slate-100 dark:bg-white/10"
                                        )} />
                                    ))}
                                </div>
                                <p className="mt-3 text-[10px] text-neutral-400 text-center">
                                    Pertahankan performa untuk badge "Rajin"!
                                </p>
                            </div>
                        </motion.div>

                        {/* Next Achievement Widget - CLEAN GLASS */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2.5 bg-indigo-100 rounded-xl dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                        <Trophy className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Top 10% Attendance</h3>
                                        <p className="text-[10px] text-neutral-500">Unlock level selanjutnya</p>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider">
                                        <span className="text-indigo-600 dark:text-indigo-400">Progres</span>
                                        <span className="text-neutral-900 dark:text-white">85%</span>
                                    </div>
                                    <Progress value={85} className="h-2 bg-indigo-50 dark:bg-white/5 text-indigo-600" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Links */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/20 dark:border-white/5">
                                <h2 className="font-bold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-yellow-500" />
                                    Aksi Cepat
                                </h2>
                            </div>
                            <div className="p-6 space-y-3">
                                <Link href="/user/absen">
                                    <motion.div whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                                        <Button className="w-full justify-start bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 h-10">
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Absen Sekarang
                                        </Button>
                                    </motion.div>
                                </Link>
                                <Link href="/user/history">
                                    <motion.div whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                                        <Button className="w-full justify-start bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 h-10">
                                            <FileText className="h-4 w-4 mr-2" />
                                            Laporan PDF
                                        </Button>
                                    </motion.div>
                                </Link>
                                <Link href="/user/profil">
                                    <motion.div whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                                        <Button className="w-full justify-start bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 h-10">
                                            <Users className="h-4 w-4 mr-2" />
                                            Profil Saya
                                        </Button>
                                    </motion.div>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Detailed Warning Modal */}
            <AnimatePresence>
                {selectedWarning && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedWarning(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 border border-white/20 shadow-2xl overflow-hidden"
                        >
                            <div className={cn(
                                "p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden",
                                selectedWarning.type === 'warning'
                                    ? "bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/20 dark:to-neutral-900"
                                    : selectedWarning.type === 'appreciation'
                                        ? "bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-900/20 dark:to-neutral-900"
                                        : "bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-neutral-900"
                            )}>
                                {/* Background Icon */}
                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                                    <motion.div
                                        initial={{ rotate: -10, scale: 0.8 }}
                                        animate={{ rotate: 0, scale: 1 }}
                                        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                                        className={cn(
                                            "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20",
                                            selectedWarning.type === 'warning' ? "bg-amber-400" :
                                                selectedWarning.type === 'appreciation' ? "bg-indigo-400" : "bg-blue-400"
                                        )}
                                    />
                                    <motion.div
                                        initial={{ rotate: 10, scale: 0.8 }}
                                        animate={{ rotate: 0, scale: 1 }}
                                        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
                                        className={cn(
                                            "absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-20",
                                            selectedWarning.type === 'warning' ? "bg-orange-400" :
                                                selectedWarning.type === 'appreciation' ? "bg-purple-400" : "bg-cyan-400"
                                        )}
                                    />
                                </div>

                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                                    className={cn(
                                        "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl ring-4 ring-white dark:ring-neutral-800 relative z-10",
                                        selectedWarning.type === 'warning'
                                            ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                                            : selectedWarning.type === 'appreciation'
                                                ? "bg-gradient-to-br from-indigo-400 to-purple-500 text-white"
                                                : "bg-gradient-to-br from-blue-400 to-cyan-500 text-white"
                                    )}
                                >
                                    {selectedWarning.type === 'warning' ? (
                                        <MessageSquareWarning className="h-10 w-10" />
                                    ) : selectedWarning.type === 'appreciation' ? (
                                        <PartyPopper className="h-10 w-10" />
                                    ) : (
                                        <BellRing className="h-10 w-10" />
                                    )}
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-2xl font-bold text-slate-900 dark:text-white mb-2 relative z-10"
                                >
                                    {selectedWarning.title}
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex items-center justify-center gap-2 relative z-10"
                                >
                                    <Clock className="h-4 w-4" />
                                    {selectedWarning.created_at}
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="w-full bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-slate-100 dark:border-white/5 relative z-10 max-h-[300px] overflow-y-auto"
                                >
                                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap text-left">
                                        {selectedWarning.message}
                                    </p>
                                </motion.div>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-neutral-900 border-t border-slate-100 dark:border-neutral-800 flex justify-between items-center">
                                <button
                                    onClick={() => setSelectedWarning(null)}
                                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    <Minimize2 className="h-5 w-5 text-slate-500" />
                                </button>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button
                                        onClick={() => setSelectedWarning(null)}
                                        className="rounded-full px-6 shadow-lg shadow-blue-500/20"
                                    >
                                        <CheckCheck className="h-4 w-4 mr-2" />
                                        Saya Mengerti
                                    </Button>
                                </motion.div>
                                <div className="w-9" /> {/* Spacer for centering */}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </StudentLayout>
    );
}
