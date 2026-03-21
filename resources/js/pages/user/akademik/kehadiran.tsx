import { AnimatedCounter } from '@/components/ui/animated-counter';
import StudentLayout from '@/layouts/student-layout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Calendar,
    CalendarCheck,
    CheckCircle2,
    Clock,
    Filter,
    GraduationCap,
    Info,
    MapPin,
    RefreshCw,
    Search,
    Sparkles,
    TrendingUp,
    Wifi,
    X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

// PNG Icons — matching admin/student dashboard pattern
import hadirIcon from '@/assets/admin/dashboard/hadir-icon.png';
import selfieIcon from '@/assets/admin/dashboard/selfie-icon.png';
import terlambatIcon from '@/assets/admin/dashboard/terlambat-icon.png';
import totalIcon from '@/assets/admin/dashboard/total-icon.png';
import kehadiranIcon from '@/assets/mahasiswa/monitoring/monitoring.png';

/* ═══════════════════════════════════════════════════ */
/*                  TYPE DEFINITIONS                   */
/* ═══════════════════════════════════════════════════ */
interface Meeting {
    number: number;
    date: string | null;
    status: 'hadir' | 'tidak-hadir' | 'aktif' | 'belum-dimulai' | 'belum-dibuat';
    mode: 'online' | 'offline';
    notes: string | null;
    completedAt: string | null;
}

interface Course {
    id: number;
    name: string;
    code: string;
    sks: 2 | 3;
    period: 1 | 2;
    mode: string;
    modeName: string;
    day: string;
    time: string;
    room: string;
    lecturer: string;
    totalMeetings: number;
    attendedCount: number;
    absentCount: number;
    attendanceRate: number;
    meetings: Meeting[];
    currentMeeting: number;
}

interface Stats {
    totalCourses: number;
    totalMeetings: number;
    attendedMeetings: number;
    absentMeetings: number;
    attendancePercentage: number;
    absentPercentage: number;
}

interface Props {
    courses: Course[];
    stats: Stats;
    isBeforeUTS: boolean;
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
/*            COURSE GRADIENT COLORS                   */
/* ═══════════════════════════════════════════════════ */
const courseGradients = [
    {
        from: 'from-blue-500',
        to: 'to-indigo-600',
        shadow: 'shadow-blue-500/30',
    },
    {
        from: 'from-purple-500',
        to: 'to-violet-600',
        shadow: 'shadow-purple-500/30',
    },
    {
        from: 'from-emerald-500',
        to: 'to-teal-600',
        shadow: 'shadow-emerald-500/30',
    },
    { from: 'from-rose-500', to: 'to-pink-600', shadow: 'shadow-rose-500/30' },
    {
        from: 'from-amber-500',
        to: 'to-orange-600',
        shadow: 'shadow-amber-500/30',
    },
    { from: 'from-cyan-500', to: 'to-sky-600', shadow: 'shadow-cyan-500/30' },
    {
        from: 'from-fuchsia-500',
        to: 'to-pink-600',
        shadow: 'shadow-fuchsia-500/30',
    },
    { from: 'from-lime-500', to: 'to-green-600', shadow: 'shadow-lime-500/30' },
];

/* ═══════════════════════════════════════════════════ */
/*               HELPER FUNCTIONS                      */
/* ═══════════════════════════════════════════════════ */

function calculateStreak(meetings: Meeting[]) {
    const sorted = meetings
        .filter((m) => m.status !== 'belum-dimulai' && m.status !== 'belum-dibuat' && m.status !== 'aktif')
        .sort((a, b) => a.number - b.number);
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (const meeting of sorted) {
        if (meeting.status === 'hadir') {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 0;
        }
    }

    for (let i = sorted.length - 1; i >= 0; i--) {
        if (sorted[i].status === 'hadir') currentStreak++;
        else break;
    }

    return { currentStreak, longestStreak, isActive: currentStreak > 0 };
}

/* ═══════════════════════════════════════════════════ */
/*                 MAIN COMPONENT                      */
/* ═══════════════════════════════════════════════════ */
export default function MonitoringKehadiran({
    courses,
    stats,
    isBeforeUTS,
}: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPeriode, setFilterPeriode] = useState('');
    const [filterSKS, setFilterSKS] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const filteredCourses = useMemo(() => {
        let filtered = courses;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.lecturer.toLowerCase().includes(q) ||
                    c.code.toLowerCase().includes(q),
            );
        }
        if (filterPeriode)
            filtered = filtered.filter(
                (c) => c.period.toString() === filterPeriode,
            );
        if (filterSKS)
            filtered = filtered.filter((c) => c.sks.toString() === filterSKS);
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'attendance-asc':
                    return a.attendanceRate - b.attendanceRate;
                case 'attendance-desc':
                    return b.attendanceRate - a.attendanceRate;
                case 'sks':
                    return b.sks - a.sks;
                default:
                    return a.name.localeCompare(b.name);
            }
        });
    }, [courses, searchQuery, filterPeriode, filterSKS, sortBy]);

    // Stats card config — matching admin dashboard pattern exactly
    const statCards = [
        {
            icon: totalIcon,
            title: 'Mata Kuliah',
            value: stats.totalCourses,
            note: `${stats.totalMeetings} pertemuan total`,
            colorConfig: {
                from: 'from-sky-400',
                to: 'to-indigo-600',
                shadow: 'shadow-sky-500/30',
                bg: 'bg-sky-500',
                hoverShadow: 'hover:shadow-sky-500/10',
                gradientBg:
                    'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
            },
        },
        {
            icon: hadirIcon,
            title: 'Total Hadir',
            value: stats.attendedMeetings,
            note: `${stats.attendancePercentage}% kehadiran`,
            colorConfig: {
                from: 'from-emerald-400',
                to: 'to-teal-600',
                shadow: 'shadow-emerald-500/30',
                bg: 'bg-emerald-500',
                hoverShadow: 'hover:shadow-emerald-500/10',
                gradientBg:
                    'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
            },
        },
        {
            icon: terlambatIcon,
            title: 'Tidak Hadir',
            value: stats.absentMeetings,
            note: `${stats.absentPercentage}% absensi`,
            colorConfig: {
                from: 'from-rose-400',
                to: 'to-red-600',
                shadow: 'shadow-rose-500/30',
                bg: 'bg-rose-500',
                hoverShadow: 'hover:shadow-rose-500/10',
                gradientBg:
                    'from-rose-500/5 to-red-500/5 dark:from-rose-500/10 dark:to-red-500/10',
            },
        },
        {
            icon: selfieIcon,
            title: 'Persentase',
            value: Math.round(stats.attendancePercentage),
            suffix: '%',
            note:
                stats.attendancePercentage >= 75
                    ? 'Memenuhi syarat ✓'
                    : '⚠️ Di bawah minimum!',
            colorConfig: {
                from: 'from-amber-400',
                to: 'to-orange-600',
                shadow: 'shadow-amber-500/30',
                bg: 'bg-amber-500',
                hoverShadow: 'hover:shadow-amber-500/10',
                gradientBg:
                    'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
            },
        },
    ];

    return (
        <StudentLayout>
            <Head title="Monitoring Kehadiran" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8"
            >
                {/* ═══════════════════════════════════════════════════ */}
                {/* 1️⃣ HERO HEADER — Matching Admin/Student Dashboard  */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 100,
                    }}
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

                    {/* Animated Orbs */}
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 0.6, 0],
                                    scale: [0, 1, 0],
                                    y: [0, -80],
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: i * 0.25,
                                    ease: 'easeOut',
                                }}
                                className="absolute"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${80 + Math.random() * 20}%`,
                                }}
                            >
                                {i % 3 === 0 ? (
                                    <CalendarCheck className="h-3 w-3 text-white/40" />
                                ) : i % 3 === 1 ? (
                                    <CheckCircle2 className="h-3 w-3 text-white/40" />
                                ) : (
                                    <Sparkles className="h-3 w-3 text-white/40" />
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-wrap items-start justify-between gap-6">
                            {/* Left: Icon + Title — matching dashboard pattern */}
                            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
                                <motion.div
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
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={kehadiranIcon}
                                        alt="Monitoring Kehadiran"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                    >
                                        {isBeforeUTS
                                            ? 'Sebelum UTS'
                                            : 'Setelah UTS (Rolling)'}
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                    >
                                        Monitoring Kehadiran
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="mt-2 max-w-lg text-sm leading-relaxed text-indigo-100 sm:text-base"
                                    >
                                        Pantau kehadiran Anda di setiap
                                        pertemuan mata kuliah
                                    </motion.p>
                                </div>
                            </div>

                            {/* Right: Overall Stats Badge */}
                            <div className="mt-4 flex w-full flex-col items-center gap-2 sm:mt-0 sm:w-auto sm:items-end">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-4 py-2 shadow-lg backdrop-blur-xl sm:px-6 sm:py-3"
                                >
                                    <TrendingUp className="h-5 w-5" />
                                    <div className="text-center sm:text-right">
                                        <p className="text-xl font-bold tabular-nums sm:text-2xl">
                                            {stats.attendancePercentage}%
                                        </p>
                                        <p className="text-[10px] text-indigo-200 sm:text-xs">
                                            Kehadiran Keseluruhan
                                        </p>
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7, type: 'spring' }}
                                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/20 px-4 py-2 backdrop-blur-xl"
                                >
                                    <Info className="h-4 w-4" />
                                    <span className="text-xs font-medium">
                                        {isBeforeUTS
                                            ? 'P1 = Offline · P2 = Online'
                                            : 'P1 → Online · P2 → Offline'}
                                    </span>
                                </motion.div>
                            </div>
                        </div>

                        {/* Action Buttons — matching dashboard pattern */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.05,
                                        delayChildren: 0.2,
                                    },
                                },
                            }}
                            className="mt-6 flex w-full flex-nowrap gap-2 overflow-x-auto border-t border-white/10 pt-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-8 sm:gap-3 [&::-webkit-scrollbar]:hidden"
                        >
                            {[
                                {
                                    href: '/user/akademik',
                                    icon: GraduationCap,
                                    label: 'Akademik',
                                },
                                {
                                    href: '/user/akademik/jadwal',
                                    icon: Calendar,
                                    label: 'Jadwal',
                                },
                                {
                                    href: '/user/akademik/matkul',
                                    icon: BookOpen,
                                    label: 'Mata Kuliah',
                                },
                                {
                                    href: '/user/akademik/ujian',
                                    icon: GraduationCap,
                                    label: 'Ujian',
                                },
                            ].map((item, index) => (
                                <motion.a
                                    key={item.href}
                                    href={item.href}
                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:gap-2 sm:px-4 sm:py-2 sm:text-xs ${
                                        index === 0
                                            ? 'bg-white text-indigo-600'
                                            : 'border border-white/20 bg-white/20 text-white backdrop-blur-md hover:bg-white/30'
                                    }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <item.icon className="h-3.5 w-3.5" />
                                    {item.label}
                                </motion.a>
                            ))}
                            <motion.button
                                onClick={() => router.reload()}
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/20 bg-white/20 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-white/30 sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Refresh
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* 2️⃣ STATS CARDS — Admin Pattern with PNG Icons       */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
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
                    {statCards.map((stat, index) => {
                        const cardKey = `stat-${index}`;
                        return (
                            <motion.div
                                key={stat.title}
                                className={`group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 dark:bg-neutral-900/40 ${stat.colorConfig.hoverShadow} dark:border-white/5`}
                                variants={{
                                    hidden: { opacity: 0, y: 30, scale: 0.9 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        transition: {
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 20,
                                        },
                                    },
                                }}
                                whileHover={{
                                    scale: 1.04,
                                    y: -4,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 15,
                                    },
                                }}
                                onHoverStart={() => setHoveredCard(cardKey)}
                                onHoverEnd={() => setHoveredCard(null)}
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${stat.colorConfig.gradientBg}`}
                                />
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale:
                                            hoveredCard === cardKey ? 1.5 : 1,
                                        opacity:
                                            hoveredCard === cardKey ? 0.4 : 0.2,
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${stat.colorConfig.bg} blur-3xl transition-all duration-500`}
                                />
                                <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                                    >
                                        <img
                                            src={stat.icon}
                                            alt={stat.title}
                                            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                        />
                                    </motion.div>
                                    <div>
                                        <p className="text-[10px] leading-tight font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                                            {stat.title}
                                        </p>
                                        <div className="mt-0.5 sm:mt-1">
                                            <span className="text-lg font-bold text-neutral-900 sm:text-2xl dark:text-white">
                                                <AnimatedCounter
                                                    value={stat.value}
                                                    suffix={stat.suffix}
                                                />
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-[8px] leading-tight text-neutral-400 sm:text-xs">
                                            {stat.note}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* 3️⃣ FILTER BAR                                      */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:rounded-3xl sm:p-5 dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-4 flex items-center gap-2">
                        <Filter className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                        <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                            Filter & Pencarian
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="relative sm:col-span-2 lg:col-span-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Cari mata kuliah, dosen, kode..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-white/60 py-2.5 pr-4 pl-10 text-sm text-neutral-900 transition-all placeholder:text-neutral-400 focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-white"
                            />
                        </div>
                        <select
                            value={filterPeriode}
                            onChange={(e) => setFilterPeriode(e.target.value)}
                            className="rounded-xl border border-neutral-200 bg-white/60 px-4 py-2.5 text-sm text-neutral-900 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-white"
                        >
                            <option value="">Semua Periode</option>
                            <option value="1">
                                Periode 1{' '}
                                {isBeforeUTS ? '(Offline)' : '(Online)'}
                            </option>
                            <option value="2">
                                Periode 2{' '}
                                {isBeforeUTS ? '(Online)' : '(Offline)'}
                            </option>
                        </select>
                        <select
                            value={filterSKS}
                            onChange={(e) => setFilterSKS(e.target.value)}
                            className="rounded-xl border border-neutral-200 bg-white/60 px-4 py-2.5 text-sm text-neutral-900 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-white"
                        >
                            <option value="">Semua SKS</option>
                            <option value="2">SKS 2 (14 pertemuan)</option>
                            <option value="3">SKS 3 (21 pertemuan)</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="rounded-xl border border-neutral-200 bg-white/60 px-4 py-2.5 text-sm text-neutral-900 transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800/60 dark:text-white"
                        >
                            <option value="name">Urutkan: Nama</option>
                            <option value="attendance-asc">
                                Kehadiran Terendah
                            </option>
                            <option value="attendance-desc">
                                Kehadiran Tertinggi
                            </option>
                            <option value="sks">SKS Terbanyak</option>
                        </select>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* 5️⃣ COURSE CARDS                                    */}
                {/* ═══════════════════════════════════════════════════ */}
                {filteredCourses.length === 0 ? (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-12 text-center shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <BookOpen className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                        <p className="font-bold text-neutral-700 dark:text-neutral-300">
                            Tidak ada mata kuliah ditemukan
                        </p>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            {searchQuery
                                ? 'Coba ubah kata pencarian'
                                : 'Belum ada mata kuliah terdaftar'}
                        </p>
                    </motion.div>
                ) : (
                    filteredCourses.map((course, courseIndex) => {
                        const gradient =
                            courseGradients[
                                courseIndex % courseGradients.length
                            ];
                        const streak = calculateStreak(course.meetings);

                        return (
                            <motion.div
                                key={course.id}
                                variants={itemVariants}
                                className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                            >
                                {/* Course Header */}
                                <div
                                    className={`relative bg-gradient-to-r ${gradient.from} ${gradient.to} overflow-hidden p-5 text-white sm:p-6`}
                                >
                                    <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                                    <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                                    <div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:flex-row">
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <img
                                                    src={kehadiranIcon}
                                                    className="h-5 w-5 flex-shrink-0 object-contain drop-shadow-md"
                                                    alt="icon"
                                                />
                                                <a
                                                    href={`/user/akademik/kehadiran/${course.id}`}
                                                    className="truncate text-lg font-bold hover:underline sm:text-xl"
                                                >
                                                    {course.name}
                                                </a>
                                            </div>
                                            <p className="mb-2 text-xs text-white/80">
                                                [{course.sks}] {course.name} #{' '}
                                                {course.code} ({course.day}) [K-
                                                {course.period}]
                                            </p>
                                            <p className="mb-2 text-sm text-white/90">
                                                Dosen:{' '}
                                                <span className="font-semibold">
                                                    {course.lecturer}
                                                </span>
                                            </p>
                                            <div className="flex flex-wrap gap-2 text-xs text-white/90">
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-0.5">
                                                    Kode: {course.code}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-0.5">
                                                    SKS {course.sks}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-0.5">
                                                    Periode {course.period}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-0.5">
                                                    <MapPin className="h-3 w-3" />
                                                    {course.room}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-0.5">
                                                    <Clock className="h-3 w-3" />
                                                    {course.day}, {course.time}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-0.5">
                                                    {course.mode ===
                                                    'online' ? (
                                                        <Wifi className="h-3 w-3" />
                                                    ) : (
                                                        <MapPin className="h-3 w-3" />
                                                    )}
                                                    {course.modeName}
                                                </span>
                                            </div>
                                            {streak.isActive && (
                                                <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-1 text-xs font-medium">
                                                    🔥 Streak:{' '}
                                                    {streak.currentStreak}{' '}
                                                    pertemuan
                                                    {streak.longestStreak >
                                                        streak.currentStreak && (
                                                        <span className="text-white/70">
                                                            • Rekor:{' '}
                                                            {
                                                                streak.longestStreak
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0 rounded-2xl bg-white/20 px-4 py-3 text-center backdrop-blur-sm">
                                            <p className="mb-0.5 text-[10px] text-white/80">
                                                Kehadiran
                                            </p>
                                            <p className="text-2xl font-extrabold tabular-nums sm:text-3xl">
                                                {course.attendanceRate.toFixed(
                                                    0,
                                                )}
                                                %
                                            </p>
                                            <p className="text-[10px] text-white/80">
                                                {course.attendedCount}/
                                                {course.totalMeetings}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative z-10 mt-4">
                                        <div className="h-2 overflow-hidden rounded-full bg-white/20">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${course.attendanceRate}%`,
                                                }}
                                                transition={{
                                                    duration: 1,
                                                    delay: courseIndex * 0.1,
                                                    ease: 'easeOut',
                                                }}
                                                className="h-full rounded-full bg-white"
                                            />
                                        </div>
                                        <div className="mt-3 flex justify-end">
                                            <a
                                                href={`/user/akademik/kehadiran/${course.id}`}
                                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-white/30"
                                            >
                                                Lihat Detail{' '}
                                                <img
                                                    src={kehadiranIcon}
                                                    className="h-4 w-4 object-contain"
                                                    alt="detail"
                                                />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Meetings Checklist */}
                                <div className="p-4 sm:p-6">
                                    <h4 className="mb-4 text-sm font-bold text-neutral-900 dark:text-white">
                                        Daftar Pertemuan ({course.totalMeetings}{' '}
                                        Pertemuan — SKS {course.sks})
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-7">
                                        {course.meetings.map(
                                            (meeting, meetingIndex) => {
                                                const isAttended = meeting.status === 'hadir';
                                                const isAbsent = meeting.status === 'tidak-hadir';
                                                const isActive = meeting.status === 'aktif';
                                                const isUnmade = meeting.status === 'belum-dibuat';
                                                const isScheduled = meeting.status === 'belum-dimulai';
                                                const isOnline = meeting.mode === 'online';
                                                const midPoint = course.sks === 2 ? 7 : 10;

                                                const utsDone = !isBeforeUTS;
                                                const uasDone = course.attendedCount + course.absentCount === course.totalMeetings;

                                                return (
                                                    <React.Fragment
                                                        key={meeting.number}
                                                    >
                                                        <motion.button
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: meetingIndex * 0.02 }}
                                                            whileHover={{ scale: 1.08, y: -2 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => router.visit(`/user/akademik/kehadiran/${course.id}`)}
                                                            className={`group relative cursor-pointer rounded-xl border-2 p-2.5 transition-all duration-200 sm:p-3 ${
                                                                isAttended
                                                                    ? 'border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-500/10 dark:border-emerald-600 dark:bg-emerald-900/20'
                                                                    : isAbsent
                                                                      ? 'border-red-400 bg-red-50 shadow-md shadow-red-500/10 dark:border-red-600 dark:bg-red-900/20'
                                                                      : isActive
                                                                      ? 'border-blue-400 bg-blue-50 shadow-md shadow-blue-500/10 dark:border-blue-600 dark:bg-blue-900/20 ring-2 ring-blue-500/20'
                                                                      : isUnmade
                                                                      ? 'border-neutral-200 border-dashed bg-transparent hover:border-neutral-300 dark:border-neutral-700/50 dark:hover:border-neutral-600'
                                                                      : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800/60 dark:hover:border-neutral-600'
                                                            }`}
                                                        >
                                                            <div className="mb-1.5 text-center">
                                                                <p className="text-[9px] font-medium text-neutral-400 sm:text-[10px] dark:text-neutral-500">
                                                                    Pertemuan
                                                                </p>
                                                                <p
                                                                    className={`text-xl font-extrabold tabular-nums sm:text-2xl ${
                                                                        isAttended
                                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                                            : isAbsent
                                                                              ? 'text-red-600 dark:text-red-400'
                                                                              : isActive
                                                                              ? 'text-blue-600 dark:text-blue-400 animate-pulse'
                                                                              : isUnmade
                                                                              ? 'text-neutral-300 dark:text-neutral-600'
                                                                              : 'text-neutral-500 dark:text-neutral-400'
                                                                    }`}
                                                                >
                                                                    {meeting.number}
                                                                </p>
                                                            </div>
                                                            <div
                                                                className={`flex items-center justify-center gap-1 rounded-lg px-1.5 py-0.5 text-[9px] font-semibold sm:text-[10px] ${
                                                                    isOnline
                                                                        ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                                                                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                                }`}
                                                            >
                                                                {isOnline ? (
                                                                    <>
                                                                        <Wifi className="h-2.5 w-2.5" />
                                                                        <span>
                                                                            Online
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <MapPin className="h-2.5 w-2.5" />
                                                                        <span>
                                                                            Offline
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            {isActive && (
                                                                <div className="absolute -top-1.5 -right-1.5">
                                                                    <div className="relative flex h-4 w-4">
                                                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                                                                        <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"></span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {isAttended && (
                                                                <div className="absolute -top-1.5 -right-1.5">
                                                                    <div className="rounded-full bg-emerald-500 p-0.5 shadow-lg shadow-emerald-500/30">
                                                                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {isAbsent && (
                                                                <div className="absolute -top-1.5 -right-1.5">
                                                                    <div className="rounded-full bg-red-500 p-0.5 shadow-lg shadow-red-500/30">
                                                                        <X className="h-3.5 w-3.5 text-white" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {meeting.date && (
                                                                <p className="mt-1.5 truncate text-center text-[8px] text-neutral-400 sm:text-[9px] dark:text-neutral-500">
                                                                    {
                                                                        meeting.date
                                                                    }
                                                                </p>
                                                            )}
                                                        </motion.button>
                                                        {meeting.number ===
                                                            midPoint && (
                                                            <div className="relative col-span-full my-2">
                                                                <div
                                                                    className="absolute inset-0 flex items-center"
                                                                    aria-hidden="true"
                                                                >
                                                                    <div className="w-full border-t-2 border-dashed border-neutral-300 dark:border-neutral-700"></div>
                                                                </div>
                                                                <div className="relative flex justify-center">
                                                                    <span
                                                                        className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-1 text-[10px] font-bold tracking-wider shadow-sm sm:text-xs ${utsDone ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' : 'border-indigo-100 bg-white text-indigo-600 dark:border-indigo-900/50 dark:bg-neutral-900 dark:text-indigo-400'}`}
                                                                    >
                                                                        <CalendarCheck className="h-3.5 w-3.5" />{' '}
                                                                        JEDA UTS{' '}
                                                                        {utsDone
                                                                            ? '(Selesai)'
                                                                            : '(Belum)'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {meeting.number ===
                                                            course.totalMeetings && (
                                                            <div className="relative col-span-full my-2">
                                                                <div
                                                                    className="absolute inset-0 flex items-center"
                                                                    aria-hidden="true"
                                                                >
                                                                    <div className="w-full border-t-2 border-dashed border-neutral-300 dark:border-neutral-700"></div>
                                                                </div>
                                                                <div className="relative flex justify-center">
                                                                    <span
                                                                        className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-1 text-[10px] font-bold tracking-wider shadow-sm sm:text-xs ${uasDone ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400' : 'border-rose-100 bg-white text-rose-600 dark:border-rose-900/50 dark:bg-neutral-900 dark:text-rose-400'}`}
                                                                    >
                                                                        <GraduationCap className="h-3.5 w-3.5" />{' '}
                                                                        JEDA UAS{' '}
                                                                        {uasDone
                                                                            ? '(Selesai)'
                                                                            : '(Belum)'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            },
                                        )}
                                    </div>
                                    {/* Legend */}
                                    <div className="mt-5 border-t border-neutral-200 pt-4 dark:border-neutral-700/50">
                                        <div className="flex flex-wrap items-center gap-4 text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500">
                                                    <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                                                </div>
                                                <span className="text-neutral-600 dark:text-neutral-400">
                                                    Hadir
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500">
                                                    <X className="h-2.5 w-2.5 text-white" />
                                                </div>
                                                <span className="text-neutral-600 dark:text-neutral-400">
                                                    Tidak Hadir
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="relative flex h-3.5 w-3.5">
                                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                                                    <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-blue-500" />
                                                </div>
                                                <span className="text-neutral-600 dark:text-neutral-400">
                                                    Sedang Aktif
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-3.5 w-3.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                                <span className="text-neutral-600 dark:text-neutral-400">
                                                    Akan Datang
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-3.5 w-3.5 rounded-full border border-dashed border-neutral-400 bg-transparent dark:border-neutral-500" />
                                                <span className="text-neutral-600 dark:text-neutral-400">
                                                    Belum Dibuat
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Wifi className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                                                <span className="text-neutral-600 dark:text-neutral-400">
                                                    Online
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                                <span className="text-neutral-600 dark:text-neutral-400">
                                                    Offline
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}

                {/* ═══════════════════════════════════════════════════ */}
                {/* 6️⃣ OVERALL STATISTICS                              */}
                {/* ═══════════════════════════════════════════════════ */}
                {courses.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="border-b border-white/20 p-5 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                                >
                                    <TrendingUp className="h-5 w-5" />
                                </motion.div>
                                <div>
                                    <h2 className="font-bold text-neutral-900 dark:text-white">
                                        Statistik Keseluruhan
                                    </h2>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        Ringkasan kehadiran semua mata kuliah
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="mb-5">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                        Kehadiran Keseluruhan
                                    </span>
                                    <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                                        {stats.attendancePercentage}%
                                    </span>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${stats.attendancePercentage}%`,
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            ease: 'easeOut',
                                        }}
                                        className={`h-full rounded-full ${stats.attendancePercentage >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}
                                    />
                                </div>
                                {stats.attendancePercentage < 75 &&
                                    stats.attendedMeetings +
                                        stats.absentMeetings >
                                        0 && (
                                        <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                                            ⚠️ Kehadiran di bawah minimum 75%!
                                            Target:{' '}
                                            {Math.ceil(
                                                stats.totalMeetings * 0.75,
                                            )}{' '}
                                            pertemuan hadir.
                                        </p>
                                    )}
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-2xl bg-emerald-50 p-3 text-center sm:p-4 dark:bg-emerald-900/20">
                                    <p className="text-2xl font-extrabold text-emerald-600 tabular-nums sm:text-3xl dark:text-emerald-400">
                                        {stats.attendedMeetings}
                                    </p>
                                    <p className="mt-1 text-[10px] font-medium text-neutral-600 sm:text-xs dark:text-neutral-400">
                                        Hadir
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-red-50 p-3 text-center sm:p-4 dark:bg-red-900/20">
                                    <p className="text-2xl font-extrabold text-red-600 tabular-nums sm:text-3xl dark:text-red-400">
                                        {stats.absentMeetings}
                                    </p>
                                    <p className="mt-1 text-[10px] font-medium text-neutral-600 sm:text-xs dark:text-neutral-400">
                                        Tidak Hadir
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-neutral-100 p-3 text-center sm:p-4 dark:bg-neutral-800">
                                    <p className="text-2xl font-extrabold text-neutral-600 tabular-nums sm:text-3xl dark:text-neutral-400">
                                        {stats.totalMeetings -
                                            stats.attendedMeetings -
                                            stats.absentMeetings}
                                    </p>
                                    <p className="mt-1 text-[10px] font-medium text-neutral-600 sm:text-xs dark:text-neutral-400">
                                        Mendatang
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </StudentLayout>
    );
}
