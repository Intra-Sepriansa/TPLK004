import { AttendanceChart } from '@/components/analytics/attendance-chart';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Award,
    CheckCircle,
    Clock,
    Crown,
    Filter,
    Flame,
    Medal,
    Star,
    TrendingUp,
    Trophy,
    Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
} from 'recharts';

// Custom 3D Icons
import LeaderboardIcon from '@/assets/admin/leaderboard/icon-leaderboard.png';
import KehadiranIcon from '@/assets/admin/leaderboard/kehadiran.png';
import RataRataIcon from '@/assets/admin/leaderboard/rata-rata.png';
import TotalMahasiswaIcon from '@/assets/admin/leaderboard/total-mahasiswa.png';

interface LeaderboardEntry {
    id: number;
    nama: string;
    nim: string;
    kelas: string;
    avatar_url: string | null;
    total_sessions: number;
    total_attendance: number;
    present_count: number;
    late_count: number;
    attendance_rate: number;
    on_time_rate: number;
    streak: number;
    points: number;
    level: number;
}

interface PageProps {
    leaderboard: LeaderboardEntry[];
    podium: LeaderboardEntry[];
    stats: {
        total_students: number;
        avg_attendance_rate: number;
        avg_points: number;
    };
    kelasList: string[];
    filters: { period: string; kelas: string };
}

const rankColors = {
    1: 'from-yellow-400 to-amber-500',
    2: 'from-slate-300 to-slate-400',
    3: 'from-amber-600 to-orange-700',
};

export default function AdminLeaderboard({
    leaderboard,
    podium,
    stats,
    kelasList,
    filters,
}: PageProps) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [hoveredRank, setHoveredRank] = useState<number | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const handleFilter = (key: string, value: string) => {
        router.get(
            '/admin/leaderboard',
            { ...filters, [key]: value },
            { preserveState: true },
        );
    };

    return (
        <AppLayout>
            <Head title="Leaderboard" />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 p-6"
            >
                {/* Animated Header with Dashboard Ultra Advanced Style */}
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
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating Academic Icons */}
                    {[Trophy, Award, Medal, Crown, Star].map((Icon, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0, 0.4, 0],
                                scale: [0, 1, 0],
                                y: [0, -40, -80],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                delay: i * 0.8,
                                ease: 'easeOut',
                            }}
                            style={{
                                left: `${15 + i * 18}%`,
                                top: `${20 + (i % 2) * 40}%`,
                            }}
                        >
                            <Icon className="h-6 w-6 text-white" />
                        </motion.div>
                    ))}

                    <div className="relative">
                        <div className="mb-4 flex flex-col items-center justify-between gap-6 sm:flex-row sm:gap-6">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:w-auto sm:flex-row sm:gap-6 sm:text-left">
                                <motion.div
                                    className="relative mx-auto flex h-20 w-20 shrink-0 items-center justify-center sm:mx-0 sm:h-24 sm:w-24"
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
                                        src={LeaderboardIcon}
                                        alt="Leaderboard"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex items-center justify-center gap-2 text-sm font-medium tracking-wide text-indigo-100 sm:justify-start"
                                    >
                                        <Zap className="h-4 w-4" />
                                        Gamifikasi & Kompetisi
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-1 text-2xl font-bold sm:text-3xl"
                                    >
                                        Leaderboard Mahasiswa
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:mx-0 sm:text-base"
                                    >
                                        Ranking mahasiswa berdasarkan kehadiran
                                        dan pencapaian
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/80"
                >
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                Filter:
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {['all', 'month', 'week'].map((p) => (
                                <motion.button
                                    key={p}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleFilter('period', p)}
                                    className={cn(
                                        'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                                        filters.period === p
                                            ? 'bg-gradient-to-r from-gray-800 to-black text-white shadow-lg'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400',
                                    )}
                                >
                                    {p === 'all'
                                        ? 'Semua Waktu'
                                        : p === 'month'
                                          ? 'Bulan Ini'
                                          : 'Minggu Ini'}
                                </motion.button>
                            ))}
                        </div>
                        <select
                            value={filters.kelas}
                            onChange={(e) =>
                                handleFilter('kelas', e.target.value)
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-black dark:text-white"
                        >
                            <option value="all">Semua Kelas</option>
                            {kelasList.map((k) => (
                                <option key={k} value={k}>
                                    {k}
                                </option>
                            ))}
                        </select>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-3 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-3"
                >
                    <motion.div
                        whileHover={{
                            scale: 1.04,
                            y: -4,
                            transition: {
                                type: 'spring',
                                stiffness: 400,
                                damping: 15,
                            },
                        }}
                        onHoverStart={() => setHoveredCard('students')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative overflow-hidden rounded-xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all hover:shadow-sky-500/10 sm:rounded-3xl sm:p-5 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10" />
                        <motion.div
                            initial={false}
                            animate={{
                                scale: hoveredCard === 'students' ? 1.5 : 1,
                                opacity: hoveredCard === 'students' ? 0.4 : 0.2,
                            }}
                            transition={{ duration: 0.5 }}
                            className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-sky-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-4 sm:text-left">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative mx-auto flex h-10 w-10 shrink-0 items-center justify-center sm:mx-0 sm:h-14 sm:w-14"
                            >
                                <img
                                    src={TotalMahasiswaIcon}
                                    alt="Total Mahasiswa"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                />
                            </motion.div>
                            <div>
                                <p className="text-[10px] leading-tight font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                                    Total Mahasiswa
                                </p>
                                <div className="mt-0.5 sm:mt-1">
                                    <span className="text-sm font-bold text-neutral-900 sm:text-2xl dark:text-white">
                                        {stats.total_students}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{
                            scale: 1.04,
                            y: -4,
                            transition: {
                                type: 'spring',
                                stiffness: 400,
                                damping: 15,
                            },
                        }}
                        onHoverStart={() => setHoveredCard('attendance')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative overflow-hidden rounded-xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all hover:shadow-emerald-500/10 sm:rounded-3xl sm:p-5 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10" />
                        <motion.div
                            initial={false}
                            animate={{
                                scale: hoveredCard === 'attendance' ? 1.5 : 1,
                                opacity:
                                    hoveredCard === 'attendance' ? 0.4 : 0.2,
                            }}
                            transition={{ duration: 0.5 }}
                            className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-4 sm:text-left">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative mx-auto flex h-10 w-10 shrink-0 items-center justify-center sm:mx-0 sm:h-14 sm:w-14"
                            >
                                <img
                                    src={KehadiranIcon}
                                    alt="Kehadiran"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                />
                            </motion.div>
                            <div>
                                <p className="text-[10px] leading-tight font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                                    Rata-rata Kehadiran
                                </p>
                                <div className="mt-0.5 sm:mt-1">
                                    <span className="text-sm font-bold text-neutral-900 sm:text-2xl dark:text-white">
                                        {stats.avg_attendance_rate}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{
                            scale: 1.04,
                            y: -4,
                            transition: {
                                type: 'spring',
                                stiffness: 400,
                                damping: 15,
                            },
                        }}
                        onHoverStart={() => setHoveredCard('points')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative overflow-hidden rounded-xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all hover:shadow-amber-500/10 sm:rounded-3xl sm:p-5 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10" />
                        <motion.div
                            initial={false}
                            animate={{
                                scale: hoveredCard === 'points' ? 1.5 : 1,
                                opacity: hoveredCard === 'points' ? 0.4 : 0.2,
                            }}
                            transition={{ duration: 0.5 }}
                            className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-4 sm:text-left">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative mx-auto flex h-10 w-10 shrink-0 items-center justify-center sm:mx-0 sm:h-14 sm:w-14"
                            >
                                <img
                                    src={RataRataIcon}
                                    alt="Rata-rata Poin"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                />
                            </motion.div>
                            <div>
                                <p className="text-[10px] leading-tight font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                                    Rata-rata Poin
                                </p>
                                <div className="mt-0.5 sm:mt-1">
                                    <span className="text-sm font-bold text-neutral-900 sm:text-2xl dark:text-white">
                                        {stats.avg_points}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Podium - Top 3 with Premium Design */}
                {podium.length >= 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 shadow-lg backdrop-blur dark:border-slate-800/70 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30"
                    >
                        {/* Animated Background */}
                        <div className="absolute inset-0 overflow-hidden"></div>

                        <div className="relative border-b border-slate-200 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-3 sm:p-4 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                    className="rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 p-1.5 text-white shadow-lg sm:p-2"
                                >
                                    <Crown className="h-4 w-4 sm:h-5 sm:w-5" />
                                </motion.div>
                                <div>
                                    <h2 className="text-base leading-tight font-semibold text-slate-900 sm:text-lg dark:text-white">
                                        Top 3 Terbaik
                                    </h2>
                                    <p className="text-[11px] text-slate-500 sm:text-xs">
                                        Mahasiswa dengan performa terbaik
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="relative px-2 py-5 sm:p-8">
                            <div className="flex items-end justify-center gap-2 sm:gap-6">
                                {/* 2nd Place */}
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    whileHover={{ scale: 1.05, y: -10 }}
                                    onHoverStart={() => setHoveredRank(2)}
                                    onHoverEnd={() => setHoveredRank(null)}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative">
                                        <motion.div
                                            animate={{
                                                boxShadow:
                                                    hoveredRank === 2
                                                        ? '0 20px 40px -5px rgba(148, 163, 184, 0.5)'
                                                        : '0 10px 20px -3px rgba(148, 163, 184, 0.3)',
                                            }}
                                            className={cn(
                                                'flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white ring-4 ring-slate-300 transition-all sm:h-24 sm:w-24 sm:text-2xl',
                                                rankColors[2],
                                            )}
                                        >
                                            {podium[1]?.avatar_url ? (
                                                <img
                                                    src={podium[1].avatar_url}
                                                    alt=""
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                            ) : (
                                                podium[1]?.nama?.charAt(0) ||
                                                '2'
                                            )}
                                        </motion.div>
                                        <motion.div
                                            animate={{
                                                scale:
                                                    hoveredRank === 2
                                                        ? [1, 1.2, 1]
                                                        : 1,
                                            }}
                                            transition={{ duration: 0.5 }}
                                            className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-300 text-sm font-bold text-slate-700 shadow-lg sm:-right-2 sm:-bottom-2 sm:h-10 sm:w-10 sm:text-lg"
                                        >
                                            2
                                        </motion.div>
                                    </div>
                                    <p className="mt-2 max-w-[88px] truncate text-center text-sm font-semibold text-slate-900 sm:mt-3 sm:max-w-[120px] sm:text-base dark:text-white">
                                        {podium[1]?.nama}
                                    </p>
                                    <p className="text-[11px] text-slate-500 sm:text-xs">
                                        {podium[1]?.nim}
                                    </p>
                                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-600 sm:text-sm">
                                        <Star className="h-3.5 w-3.5 text-slate-400 sm:h-4 sm:w-4" />
                                        {podium[1]?.points} pts
                                    </p>
                                    <motion.div
                                        animate={{
                                            height: hoveredRank === 2 ? 92 : 84,
                                        }}
                                        className="mt-2 flex w-20 items-center justify-center rounded-t-xl bg-gradient-to-b from-slate-200 to-slate-300 shadow-xl sm:mt-3 sm:w-28 dark:from-slate-700 dark:to-slate-800"
                                    >
                                        <Medal className="h-7 w-7 text-slate-500 sm:h-10 sm:w-10" />
                                    </motion.div>
                                </motion.div>

                                {/* 1st Place - Special Throne Design */}
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, type: 'spring' }}
                                    whileHover={{ scale: 1.05, y: -10 }}
                                    onHoverStart={() => setHoveredRank(1)}
                                    onHoverEnd={() => setHoveredRank(null)}
                                    className="relative -mt-6 flex flex-col items-center sm:-mt-12"
                                >
                                    {/* Crown Image with Animation */}
                                    <motion.div
                                        animate={{
                                            y: [0, -8, 0],
                                            rotate:
                                                hoveredRank === 1
                                                    ? [0, -3, 3, -3, 0]
                                                    : 0,
                                            scale:
                                                hoveredRank === 1
                                                    ? [1, 1.1, 1]
                                                    : 1,
                                        }}
                                        transition={{
                                            y: {
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                            },
                                            rotate: { duration: 0.5 },
                                            scale: { duration: 0.5 },
                                        }}
                                        className="relative mb-2"
                                    >
                                        <motion.div
                                            className="absolute inset-0 rounded-full bg-yellow-400/30 blur-xl"
                                            animate={{
                                                scale: [0.8, 1.2, 0.8],
                                                opacity: [0.3, 0.6, 0.3],
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                            }}
                                        />
                                        <img
                                            src="/images/crown.png"
                                            alt="Crown"
                                            className="relative z-10 h-14 w-auto drop-shadow-[0_10px_20px_rgba(234,179,8,0.5)] sm:h-24"
                                        />
                                    </motion.div>

                                    <div className="relative">
                                        <motion.div
                                            animate={{
                                                boxShadow:
                                                    hoveredRank === 1
                                                        ? '0 30px 60px -12px rgba(234, 179, 8, 0.8)'
                                                        : '0 25px 50px -12px rgba(234, 179, 8, 0.5)',
                                            }}
                                            className={cn(
                                                'flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold text-white shadow-2xl ring-4 ring-yellow-400 transition-all sm:h-32 sm:w-32 sm:text-3xl',
                                                rankColors[1],
                                            )}
                                        >
                                            {podium[0]?.avatar_url ? (
                                                <img
                                                    src={podium[0].avatar_url}
                                                    alt=""
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                            ) : (
                                                podium[0]?.nama?.charAt(0) ||
                                                '1'
                                            )}
                                        </motion.div>
                                        <motion.div
                                            animate={{
                                                scale:
                                                    hoveredRank === 1
                                                        ? [1, 1.3, 1]
                                                        : 1,
                                                rotate:
                                                    hoveredRank === 1
                                                        ? [0, 360]
                                                        : 0,
                                            }}
                                            transition={{ duration: 0.6 }}
                                            className="absolute -right-2 -bottom-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-lg font-bold text-yellow-900 shadow-2xl sm:-right-3 sm:-bottom-3 sm:h-12 sm:w-12 sm:text-xl"
                                        >
                                            1
                                        </motion.div>
                                    </div>

                                    {/* Badge "JUARA 1" */}
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.05, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: 'easeInOut',
                                        }}
                                        className="mt-3 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg sm:mt-4 sm:px-4 sm:text-sm"
                                    >
                                        JUARA 1
                                    </motion.div>

                                    <p className="mt-2 max-w-[96px] truncate text-center text-base font-bold text-slate-900 sm:max-w-[140px] sm:text-lg dark:text-white">
                                        {podium[0]?.nama}
                                    </p>
                                    <p className="text-xs text-slate-500 sm:text-sm">
                                        {podium[0]?.nim}
                                    </p>
                                    <p className="mt-1 flex items-center gap-1 text-base font-bold text-amber-600 sm:text-lg">
                                        <Star className="h-4 w-4 fill-amber-500 sm:h-5 sm:w-5" />
                                        {podium[0]?.points} pts
                                    </p>
                                    <motion.div
                                        animate={{
                                            height:
                                                hoveredRank === 1 ? 108 : 100,
                                        }}
                                        className="relative mt-3 flex w-24 items-center justify-center overflow-hidden rounded-t-xl bg-gradient-to-b from-yellow-300 via-amber-400 to-orange-500 shadow-2xl sm:mt-4 sm:w-36 dark:from-yellow-600 dark:to-amber-700"
                                    >
                                        {/* Shimmer Effect */}
                                        <motion.div
                                            animate={{
                                                x: ['-100%', '200%'],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: 'linear',
                                            }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                        />
                                        <Trophy className="relative z-10 h-8 w-8 text-yellow-700 sm:h-12 sm:w-12" />
                                    </motion.div>
                                </motion.div>

                                {/* 3rd Place */}
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7, type: 'spring' }}
                                    whileHover={{ scale: 1.05, y: -10 }}
                                    onHoverStart={() => setHoveredRank(3)}
                                    onHoverEnd={() => setHoveredRank(null)}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative">
                                        <motion.div
                                            animate={{
                                                boxShadow:
                                                    hoveredRank === 3
                                                        ? '0 20px 40px -5px rgba(217, 119, 6, 0.5)'
                                                        : '0 10px 20px -3px rgba(217, 119, 6, 0.3)',
                                            }}
                                            className={cn(
                                                'flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white ring-4 ring-amber-600 transition-all sm:h-24 sm:w-24 sm:text-2xl',
                                                rankColors[3],
                                            )}
                                        >
                                            {podium[2]?.avatar_url ? (
                                                <img
                                                    src={podium[2].avatar_url}
                                                    alt=""
                                                    className="h-full w-full rounded-full object-cover"
                                                />
                                            ) : (
                                                podium[2]?.nama?.charAt(0) ||
                                                '3'
                                            )}
                                        </motion.div>
                                        <motion.div
                                            animate={{
                                                scale:
                                                    hoveredRank === 3
                                                        ? [1, 1.2, 1]
                                                        : 1,
                                            }}
                                            transition={{ duration: 0.5 }}
                                            className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white shadow-lg sm:-right-2 sm:-bottom-2 sm:h-10 sm:w-10 sm:text-lg"
                                        >
                                            3
                                        </motion.div>
                                    </div>
                                    <p className="mt-2 max-w-[88px] truncate text-center text-sm font-semibold text-slate-900 sm:mt-3 sm:max-w-[120px] sm:text-base dark:text-white">
                                        {podium[2]?.nama}
                                    </p>
                                    <p className="text-[11px] text-slate-500 sm:text-xs">
                                        {podium[2]?.nim}
                                    </p>
                                    <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-600 sm:text-sm">
                                        <Star className="h-3.5 w-3.5 text-amber-500 sm:h-4 sm:w-4" />
                                        {podium[2]?.points} pts
                                    </p>
                                    <motion.div
                                        animate={{
                                            height: hoveredRank === 3 ? 68 : 62,
                                        }}
                                        className="mt-2 flex w-20 items-center justify-center rounded-t-xl bg-gradient-to-b from-amber-500 to-orange-600 shadow-xl sm:mt-3 sm:w-28 dark:from-amber-700 dark:to-orange-800"
                                    >
                                        <Award className="h-6 w-6 text-amber-200 sm:h-8 sm:w-8" />
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Full Leaderboard Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-lg backdrop-blur dark:border-slate-800/70 dark:bg-black/80"
                >
                    <div className="border-b border-slate-200 bg-gradient-to-r from-gray-50 to-slate-50 p-4 dark:border-slate-800 dark:from-gray-950/30 dark:to-black/30">
                        <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 p-2 text-white">
                                <Trophy className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    Ranking Lengkap
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Semua mahasiswa berdasarkan poin
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-black/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                                        Rank
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                                        Mahasiswa
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                                        Kelas
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                                        Kehadiran
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                                        Tepat Waktu
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                                        Streak
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                                        Poin
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase dark:text-slate-400">
                                        Level
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {leaderboard.map((entry, index) => {
                                    const rank = index + 1;
                                    return (
                                        <React.Fragment key={entry.id}>
                                            <motion.tr
                                                key={entry.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: 0.6 + index * 0.05,
                                                }}
                                                onClick={() =>
                                                    setExpandedId(
                                                        expandedId === entry.id
                                                            ? null
                                                            : entry.id,
                                                    )
                                                }
                                                className={cn(
                                                    'cursor-pointer border-b border-slate-100 transition-colors dark:border-slate-800',
                                                    expandedId === entry.id
                                                        ? 'bg-slate-50 dark:bg-slate-900/50'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/30',
                                                )}
                                            >
                                                <td className="px-4 py-3">
                                                    <motion.div
                                                        whileHover={{
                                                            scale: 1.1,
                                                        }}
                                                        className={cn(
                                                            'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold',
                                                            rank === 1
                                                                ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-500/30'
                                                                : rank === 2
                                                                  ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700 shadow-lg'
                                                                  : rank === 3
                                                                    ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-lg shadow-amber-500/30'
                                                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                                                        )}
                                                    >
                                                        {rank <= 3 ? (
                                                            rank === 1 ? (
                                                                <Crown className="h-5 w-5" />
                                                            ) : rank === 2 ? (
                                                                <Medal className="h-5 w-5" />
                                                            ) : (
                                                                <Award className="h-5 w-5" />
                                                            )
                                                        ) : (
                                                            rank
                                                        )}
                                                    </motion.div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <div
                                                                className={cn(
                                                                    'flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white',
                                                                    rank <= 3
                                                                        ? 'ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-black'
                                                                        : 'bg-slate-400',
                                                                )}
                                                            >
                                                                {entry.avatar_url ? (
                                                                    <img
                                                                        src={
                                                                            entry.avatar_url
                                                                        }
                                                                        alt=""
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                                                                        {entry.nama.charAt(
                                                                            0,
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {rank <= 3 && (
                                                                <div className="absolute -top-1 -right-1">
                                                                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 drop-shadow-sm" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white">
                                                                {entry.nama}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {entry.nim}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                    {entry.kelas || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Badge
                                                        variant={
                                                            entry.attendance_rate >=
                                                            90
                                                                ? 'success'
                                                                : entry.attendance_rate >=
                                                                    75
                                                                  ? 'warning'
                                                                  : 'destructive'
                                                        }
                                                    >
                                                        {entry.attendance_rate}%
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={cn(
                                                            'text-sm font-medium',
                                                            entry.on_time_rate >=
                                                                90
                                                                ? 'text-blue-600'
                                                                : 'text-slate-600',
                                                        )}
                                                    >
                                                        {entry.on_time_rate}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1 text-amber-600">
                                                        <Flame
                                                            className={cn(
                                                                'h-4 w-4',
                                                                entry.streak >
                                                                    0 &&
                                                                    'animate-pulse fill-amber-500',
                                                            )}
                                                        />
                                                        <span className="font-semibold">
                                                            {entry.streak}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="font-bold text-slate-900 dark:text-white">
                                                        {entry.points}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                                        <Zap className="h-3 w-3" />
                                                        Lv.{entry.level}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                            ,
                                            <AnimatePresence
                                                key={`detail-${entry.id}`}
                                            >
                                                {expandedId === entry.id && (
                                                    <motion.tr
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                    >
                                                        <td
                                                            colSpan={8}
                                                            className="border-b border-slate-100 p-0 dark:border-slate-800"
                                                        >
                                                            <motion.div
                                                                initial={{
                                                                    height: 0,
                                                                    opacity: 0,
                                                                }}
                                                                animate={{
                                                                    height: 'auto',
                                                                    opacity: 1,
                                                                }}
                                                                exit={{
                                                                    height: 0,
                                                                    opacity: 0,
                                                                }}
                                                                transition={{
                                                                    type: 'spring',
                                                                    stiffness: 300,
                                                                    damping: 30,
                                                                }}
                                                                className="overflow-hidden bg-slate-50/50 dark:bg-black/20"
                                                            >
                                                                <div className="grid gap-6 p-6 md:grid-cols-3">
                                                                    {/* Column 1: Attendance Stats */}
                                                                    <div className="space-y-4">
                                                                        <div className="rounded-xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                                                                            <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                                                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                                                                Statistik
                                                                                Kehadiran
                                                                            </h4>
                                                                            <AttendanceChart
                                                                                data={[
                                                                                    {
                                                                                        label: 'Kehadiran',
                                                                                        present:
                                                                                            entry.present_count,
                                                                                        late: entry.late_count,
                                                                                        absent: Math.max(
                                                                                            0,
                                                                                            entry.total_sessions -
                                                                                                (entry.present_count +
                                                                                                    entry.late_count),
                                                                                        ),
                                                                                        value: entry.total_sessions,
                                                                                    },
                                                                                ]}
                                                                                type="pie"
                                                                                height={
                                                                                    200
                                                                                }
                                                                                showLegend={
                                                                                    true
                                                                                }
                                                                                className="!border-none !bg-transparent !p-0 !shadow-none"
                                                                            />
                                                                            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                                                                <div className="rounded-lg bg-emerald-100/50 p-2 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                                                                                    <p className="text-xs">
                                                                                        Hadir
                                                                                    </p>
                                                                                    <p className="font-bold">
                                                                                        {
                                                                                            entry.present_count
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                                <div className="rounded-lg bg-amber-100/50 p-2 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                                                                                    <p className="text-xs">
                                                                                        Telat
                                                                                    </p>
                                                                                    <p className="font-bold">
                                                                                        {
                                                                                            entry.late_count
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                                <div className="rounded-lg bg-red-100/50 p-2 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                                                                    <p className="text-xs">
                                                                                        Absen
                                                                                    </p>
                                                                                    <p className="font-bold">
                                                                                        {Math.max(
                                                                                            0,
                                                                                            entry.total_sessions -
                                                                                                (entry.present_count +
                                                                                                    entry.late_count),
                                                                                        )}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Column 2: Badges & Achievements (Mock Data) */}
                                                                    <div className="space-y-4">
                                                                        <div className="h-full rounded-xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                                                                            <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                                                                <Medal className="h-4 w-4 text-amber-500" />
                                                                                Pencapaian
                                                                                &
                                                                                Badges
                                                                            </h4>
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                {[
                                                                                    {
                                                                                        label: 'Rajin',
                                                                                        icon: CheckCircle,
                                                                                        color: 'text-emerald-500',
                                                                                        bg: 'bg-emerald-100/50',
                                                                                        active:
                                                                                            entry.attendance_rate >
                                                                                            90,
                                                                                    },
                                                                                    {
                                                                                        label: 'On Time',
                                                                                        icon: Clock,
                                                                                        color: 'text-blue-500',
                                                                                        bg: 'bg-blue-100/50',
                                                                                        active:
                                                                                            entry.on_time_rate >
                                                                                            90,
                                                                                    },
                                                                                    {
                                                                                        label: 'Top 10',
                                                                                        icon: Trophy,
                                                                                        color: 'text-yellow-500',
                                                                                        bg: 'bg-yellow-100/50',
                                                                                        active:
                                                                                            rank <=
                                                                                            10,
                                                                                    },
                                                                                    {
                                                                                        label: 'Star',
                                                                                        icon: Star,
                                                                                        color: 'text-purple-500',
                                                                                        bg: 'bg-purple-100/50',
                                                                                        active:
                                                                                            entry.points >
                                                                                            100,
                                                                                    },
                                                                                ].map(
                                                                                    (
                                                                                        badge,
                                                                                        i,
                                                                                    ) => (
                                                                                        <div
                                                                                            key={
                                                                                                i
                                                                                            }
                                                                                            className={cn(
                                                                                                'flex flex-col items-center justify-center rounded-xl border p-3 transition-all',
                                                                                                badge.active
                                                                                                    ? cn(
                                                                                                          badge.bg,
                                                                                                          'border-transparent',
                                                                                                      )
                                                                                                    : 'border-slate-200 bg-slate-100 opacity-50 grayscale dark:border-slate-700 dark:bg-slate-800',
                                                                                            )}
                                                                                        >
                                                                                            <badge.icon
                                                                                                className={cn(
                                                                                                    'mb-2 h-6 w-6',
                                                                                                    badge.active
                                                                                                        ? badge.color
                                                                                                        : 'text-slate-400',
                                                                                                )}
                                                                                            />
                                                                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                                                                {
                                                                                                    badge.label
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                            {rank <=
                                                                                3 && (
                                                                                <div className="mt-4 flex items-center gap-3 rounded-xl border border-yellow-400/30 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 p-3">
                                                                                    <Crown className="h-8 w-8 animate-bounce text-yellow-600" />
                                                                                    <div>
                                                                                        <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                                                                                            Champion!
                                                                                        </p>
                                                                                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                                                                            Salah
                                                                                            satu
                                                                                            yang
                                                                                            terbaik
                                                                                            di
                                                                                            kelas.
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Column 3: Points History (Mock Visualization) */}
                                                                    <div className="space-y-4">
                                                                        <div className="h-full rounded-xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5">
                                                                            <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                                                                                <TrendingUp className="h-4 w-4 text-blue-500" />
                                                                                Riwayat
                                                                                Poin
                                                                            </h4>

                                                                            <div className="relative mt-2 h-48 w-full">
                                                                                <ResponsiveContainer
                                                                                    width="100%"
                                                                                    height="100%"
                                                                                >
                                                                                    <AreaChart
                                                                                        data={[
                                                                                            {
                                                                                                name: 'Minggu 1',
                                                                                                points: Math.floor(
                                                                                                    entry.points *
                                                                                                        0.2,
                                                                                                ),
                                                                                            },
                                                                                            {
                                                                                                name: 'Minggu 2',
                                                                                                points: Math.floor(
                                                                                                    entry.points *
                                                                                                        0.45,
                                                                                                ),
                                                                                            },
                                                                                            {
                                                                                                name: 'Minggu 3',
                                                                                                points: Math.floor(
                                                                                                    entry.points *
                                                                                                        0.6,
                                                                                                ),
                                                                                            },
                                                                                            {
                                                                                                name: 'Minggu 4',
                                                                                                points: Math.floor(
                                                                                                    entry.points *
                                                                                                        0.85,
                                                                                                ),
                                                                                            },
                                                                                            {
                                                                                                name: 'Minggu 5',
                                                                                                points: entry.points,
                                                                                            },
                                                                                        ]}
                                                                                    >
                                                                                        <defs>
                                                                                            <linearGradient
                                                                                                id={`gradientPoints-${entry.id}`}
                                                                                                x1="0"
                                                                                                y1="0"
                                                                                                x2="0"
                                                                                                y2="1"
                                                                                            >
                                                                                                <stop
                                                                                                    offset="5%"
                                                                                                    stopColor="#3b82f6"
                                                                                                    stopOpacity={
                                                                                                        0.3
                                                                                                    }
                                                                                                />
                                                                                                <stop
                                                                                                    offset="95%"
                                                                                                    stopColor="#3b82f6"
                                                                                                    stopOpacity={
                                                                                                        0
                                                                                                    }
                                                                                                />
                                                                                            </linearGradient>
                                                                                        </defs>
                                                                                        <CartesianGrid
                                                                                            strokeDasharray="3 3"
                                                                                            className="stroke-slate-200 dark:stroke-slate-800"
                                                                                            vertical={
                                                                                                false
                                                                                            }
                                                                                        />
                                                                                        <XAxis
                                                                                            dataKey="name"
                                                                                            axisLine={
                                                                                                false
                                                                                            }
                                                                                            tickLine={
                                                                                                false
                                                                                            }
                                                                                            tick={{
                                                                                                fill: '#94a3b8',
                                                                                                fontSize: 10,
                                                                                            }}
                                                                                            dy={
                                                                                                10
                                                                                            }
                                                                                        />
                                                                                        <Tooltip
                                                                                            content={({
                                                                                                active,
                                                                                                payload,
                                                                                                label,
                                                                                            }) => {
                                                                                                if (
                                                                                                    active &&
                                                                                                    payload &&
                                                                                                    payload.length
                                                                                                ) {
                                                                                                    return (
                                                                                                        <div className="rounded-lg border border-slate-200 bg-white/90 p-2 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/90">
                                                                                                            <p className="mb-1 text-[10px] text-slate-500">
                                                                                                                {
                                                                                                                    label
                                                                                                                }
                                                                                                            </p>
                                                                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                                                                                {
                                                                                                                    payload[0]
                                                                                                                        .value
                                                                                                                }{' '}
                                                                                                                Poin
                                                                                                            </p>
                                                                                                        </div>
                                                                                                    );
                                                                                                }
                                                                                                return null;
                                                                                            }}
                                                                                        />
                                                                                        <Area
                                                                                            type="monotone"
                                                                                            dataKey="points"
                                                                                            stroke="#3b82f6"
                                                                                            strokeWidth={
                                                                                                2
                                                                                            }
                                                                                            fill={`url(#gradientPoints-${entry.id})`}
                                                                                        />
                                                                                    </AreaChart>
                                                                                </ResponsiveContainer>
                                                                            </div>

                                                                            <div className="mt-4 space-y-2">
                                                                                <div className="flex items-center justify-between rounded-lg bg-blue-50 p-2 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                                                                                    <span>
                                                                                        Minggu
                                                                                        Ini
                                                                                    </span>
                                                                                    <span className="font-bold">
                                                                                        +
                                                                                        {entry.points >
                                                                                        0
                                                                                            ? Math.ceil(
                                                                                                  entry.points *
                                                                                                      0.15,
                                                                                              )
                                                                                            : 0}{' '}
                                                                                        Pts
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-2 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                                                                                    <span>
                                                                                        Kehadiran
                                                                                    </span>
                                                                                    <span className="font-bold">
                                                                                        +
                                                                                        {entry.points -
                                                                                            (entry.points >
                                                                                            0
                                                                                                ? Math.ceil(
                                                                                                      entry.points *
                                                                                                          0.15,
                                                                                                  )
                                                                                                : 0)}{' '}
                                                                                        Pts
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        </td>
                                                    </motion.tr>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}
