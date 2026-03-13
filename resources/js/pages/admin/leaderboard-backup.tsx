import { AnimatedCounter } from '@/components/ui/animated-counter';
import StudentLayout from '@/layouts/student-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Award,
    Crown,
    Flame,
    Medal,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Trophy,
    Users,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

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
    mahasiswa: { id: number; nama: string; nim: string };
    leaderboard: LeaderboardEntry[];
    podium: LeaderboardEntry[];
    myRank: number | null;
    myStats: LeaderboardEntry | null;
    stats: { total_students: number; avg_attendance_rate: number };
    period: string;
}

const rankColors: Record<number, string> = {
    1: 'from-yellow-400 to-amber-500',
    2: 'from-slate-300 to-slate-400',
    3: 'from-amber-600 to-orange-700',
};

export default function Leaderboard({
    mahasiswa,
    leaderboard,
    podium,
    myRank,
    myStats,
    stats,
    period,
}: PageProps) {
    const [hoveredRank, setHoveredRank] = useState<number | null>(null);
    const [selectedStudent, setSelectedStudent] =
        useState<LeaderboardEntry | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const handlePeriodChange = (newPeriod: string) => {
        router.get(
            '/user/leaderboard',
            { period: newPeriod },
            { preserveState: true },
        );
    };

    return (
        <StudentLayout>
            <Head title="Leaderboard" />
            <div className="space-y-6 p-6">
                {/* Animated Header with Rotating Particles */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 100,
                    }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 p-8 text-white shadow-2xl"
                >
                    {/* Animated Background Orbs Removed */}

                    {/* Floating Academic Icons Removed */}

                    <div className="relative">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 200,
                                        damping: 15,
                                    }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 shadow-lg shadow-yellow-500/50"
                                >
                                    <Trophy className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm font-medium text-gray-300"
                                    >
                                        Kompetisi Kelas
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-3xl font-bold text-transparent"
                                    >
                                        Leaderboard
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="mt-1 text-sm text-gray-300"
                                    >
                                        Bersaing dan raih peringkat tertinggi!
                                    </motion.p>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-2 rounded-xl bg-white/10 p-1 backdrop-blur"
                            >
                                {[
                                    { value: 'all', label: 'Semua' },
                                    { value: 'month', label: 'Bulan Ini' },
                                    { value: 'week', label: 'Minggu Ini' },
                                ].map((p, index) => (
                                    <motion.button
                                        key={p.value}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: 0.6 + index * 0.05,
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                            handlePeriodChange(p.value)
                                        }
                                        className={cn(
                                            'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                                            period === p.value
                                                ? 'bg-white text-gray-900 shadow-lg'
                                                : 'text-white/80 hover:bg-white/10',
                                        )}
                                    >
                                        {p.label}
                                    </motion.button>
                                ))}
                            </motion.div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                            {[
                                {
                                    icon: Users,
                                    label: 'Total Peserta',
                                    value: stats.total_students,
                                    color: 'from-blue-500 to-cyan-600',
                                    delay: 0.1,
                                },
                                {
                                    icon: TrendingUp,
                                    label: 'Rata-rata',
                                    value: stats.avg_attendance_rate,
                                    suffix: '%',
                                    color: 'from-emerald-500 to-green-600',
                                    delay: 0.15,
                                },
                                {
                                    icon: Target,
                                    label: 'Peringkat Kamu',
                                    value: myRank || 0,
                                    prefix: '#',
                                    color: 'from-purple-500 to-violet-600',
                                    delay: 0.2,
                                },
                                {
                                    icon: Star,
                                    label: 'Poin Kamu',
                                    value: myStats?.points || 0,
                                    color: 'from-amber-500 to-yellow-600',
                                    delay: 0.25,
                                },
                            ].map((stat) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        delay: stat.delay,
                                        type: 'spring',
                                        stiffness: 200,
                                    }}
                                    whileHover={{
                                        scale: 1.05,
                                        y: -5,
                                        transition: {
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 10,
                                        },
                                    }}
                                    className="group relative cursor-pointer overflow-hidden rounded-xl bg-white/10 p-3 backdrop-blur"
                                >
                                    {/* Glow effect on hover */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 transition-opacity duration-300 group-hover:opacity-20`}
                                    />

                                    <div className="relative">
                                        <div className="mb-1 flex items-center gap-2">
                                            <stat.icon className="h-4 w-4 text-gray-300" />
                                            <p className="text-xs font-medium text-gray-300">
                                                {stat.label}
                                            </p>
                                        </div>
                                        <p className="text-2xl font-bold">
                                            <AnimatedCounter
                                                value={stat.value}
                                                prefix={stat.prefix || ''}
                                                suffix={stat.suffix || ''}
                                            />
                                        </p>
                                    </div>

                                    {/* Animated border */}
                                    <motion.div
                                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
                                        initial={{ width: '0%', opacity: 0 }}
                                        whileHover={{
                                            width: '100%',
                                            opacity: 0.5,
                                        }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* My Rank Card with Premium Design */}
                {myRank && myStats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="group relative"
                    >
                        {/* Animated Background Gradient */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" />
                        <motion.div
                            animate={{
                                opacity: [0.4, 0.7, 0.4],
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-pink-500/30 via-purple-500/30 to-cyan-500/30 blur-xl"
                        />

                        {/* Floating Particles Removed */}

                        <div className="relative p-8">
                            <div className="flex flex-wrap items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    {/* Rank Badge with 3D Effect */}
                                    <motion.div
                                        initial={{ scale: 0, rotateY: -180 }}
                                        animate={{ scale: 1, rotateY: 0 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 200,
                                            damping: 15,
                                            delay: 0.4,
                                        }}
                                        whileHover={{
                                            scale: 1.15,
                                            rotateY: 360,
                                            transition: { duration: 0.6 },
                                        }}
                                        className="relative"
                                        style={{
                                            transformStyle: 'preserve-3d',
                                        }}
                                    >
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 opacity-75 blur-xl" />
                                        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 shadow-2xl ring-4 ring-white/30">
                                            <span className="text-4xl font-black text-white drop-shadow-lg">
                                                #{myRank}
                                            </span>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 20,
                                                repeat: Infinity,
                                                ease: 'linear',
                                            }}
                                            className="absolute -inset-2 rounded-2xl border-2 border-dashed border-white/30"
                                        />
                                    </motion.div>

                                    {/* User Info */}
                                    <div>
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="mb-2 flex items-center gap-2"
                                        >
                                            <div className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
                                                <p className="text-xs font-bold tracking-wider text-white/90 uppercase">
                                                    Peringkat Kamu
                                                </p>
                                            </div>
                                        </motion.div>
                                        <motion.h2
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 }}
                                            className="mb-2 text-3xl font-black text-white drop-shadow-lg"
                                        >
                                            {mahasiswa.nama}
                                        </motion.h2>
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.7 }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                                                <Star className="h-4 w-4 text-yellow-300" />
                                                <span className="text-sm font-bold text-white">
                                                    <AnimatedCounter
                                                        value={myStats.points}
                                                    />{' '}
                                                    poin
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                                                <Zap className="h-4 w-4 text-cyan-300" />
                                                <span className="text-sm font-bold text-white">
                                                    Level {myStats.level}
                                                </span>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Stats Cards */}
                                <div className="flex items-center gap-4">
                                    {[
                                        {
                                            label: 'Kehadiran',
                                            value: myStats.attendance_rate,
                                            suffix: '%',
                                            gradient:
                                                'from-emerald-400 to-green-500',
                                            icon: Trophy,
                                            delay: 0.8,
                                        },
                                        {
                                            label: 'Streak',
                                            value: myStats.streak,
                                            suffix: '',
                                            gradient:
                                                'from-amber-400 to-orange-500',
                                            icon: Flame,
                                            delay: 0.85,
                                        },
                                        {
                                            label: 'Tepat Waktu',
                                            value: myStats.on_time_rate,
                                            suffix: '%',
                                            gradient:
                                                'from-blue-400 to-cyan-500',
                                            icon: Target,
                                            delay: 0.9,
                                        },
                                    ].map((stat) => (
                                        <motion.div
                                            key={stat.label}
                                            initial={{
                                                opacity: 0,
                                                scale: 0.8,
                                                y: 20,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                y: 0,
                                            }}
                                            transition={{
                                                delay: stat.delay,
                                                type: 'spring',
                                                stiffness: 200,
                                            }}
                                            whileHover={{
                                                scale: 1.1,
                                                y: -8,
                                                rotate: [0, -3, 3, 0],
                                            }}
                                            className="group/stat relative"
                                        >
                                            <div
                                                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl opacity-50 blur-lg transition-opacity group-hover/stat:opacity-75`}
                                            />
                                            <div className="relative min-w-[120px] rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-md">
                                                <div className="mb-2 flex items-center justify-center gap-2">
                                                    <stat.icon className="h-5 w-5 text-white" />
                                                    <p className="text-3xl font-black text-white">
                                                        <AnimatedCounter
                                                            value={stat.value}
                                                            suffix={stat.suffix}
                                                        />
                                                    </p>
                                                </div>
                                                <p className="text-center text-xs font-medium tracking-wide text-white/80 uppercase">
                                                    {stat.label}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Premium Podium with Advanced Animations */}
                {podium.length >= 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative overflow-hidden rounded-3xl"
                    >
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
                        <motion.div
                            animate={{
                                opacity: [0.3, 0.6, 0.3],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="absolute inset-0 bg-gradient-to-tr from-cyan-500/40 via-blue-500/40 to-violet-500/40 blur-2xl"
                        />

                        {/* Floating Particles Removed */}

                        <div className="relative">
                            <div className="border-b border-white/20 p-6">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 200,
                                            delay: 0.5,
                                        }}
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        className="rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 p-3 text-white shadow-xl"
                                    >
                                        <Crown className="h-6 w-6" />
                                    </motion.div>
                                    <div>
                                        <motion.h2
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 }}
                                            className="text-2xl font-black text-white drop-shadow-lg"
                                        >
                                            Top 3 Champions
                                        </motion.h2>
                                        <motion.p
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.7 }}
                                            className="text-sm font-medium text-white/80"
                                        >
                                            Mahasiswa dengan performa terbaik
                                        </motion.p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-10">
                                <div className="flex items-end justify-center gap-6">
                                    {/* 2nd Place - Silver */}
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: 50,
                                            scale: 0.8,
                                        }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{
                                            delay: 0.8,
                                            type: 'spring',
                                            stiffness: 200,
                                        }}
                                        whileHover={{ scale: 1.08, y: -12 }}
                                        className="group flex cursor-pointer flex-col items-center"
                                        onMouseEnter={() => setHoveredRank(2)}
                                        onMouseLeave={() =>
                                            setHoveredRank(null)
                                        }
                                    >
                                        <div className="relative mb-4">
                                            <motion.div
                                                animate={
                                                    hoveredRank === 2
                                                        ? {
                                                              rotate: [
                                                                  0, -8, 8, -8,
                                                                  0,
                                                              ],
                                                              scale: [
                                                                  1, 1.15, 1,
                                                              ],
                                                          }
                                                        : {}
                                                }
                                                transition={{ duration: 0.6 }}
                                                className="relative"
                                            >
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 opacity-60 blur-xl transition-opacity group-hover:opacity-90" />
                                                <div
                                                    className={cn(
                                                        'relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold text-white shadow-2xl ring-4 ring-white/50 transition-all duration-300',
                                                        rankColors[2],
                                                    )}
                                                >
                                                    {podium[1]?.avatar_url ? (
                                                        <img
                                                            src={
                                                                podium[1]
                                                                    .avatar_url
                                                            }
                                                            alt=""
                                                            className="h-full w-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        podium[1]?.nama?.charAt(
                                                            0,
                                                        ) || '2'
                                                    )}
                                                </div>
                                            </motion.div>
                                            <motion.div
                                                initial={{
                                                    scale: 0,
                                                    rotate: -180,
                                                }}
                                                animate={{
                                                    scale: 1,
                                                    rotate: 0,
                                                }}
                                                transition={{
                                                    delay: 0.9,
                                                    type: 'spring',
                                                    stiffness: 300,
                                                }}
                                                whileHover={{
                                                    rotate: 360,
                                                    scale: 1.2,
                                                }}
                                                className="absolute -right-2 -bottom-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-400 font-black text-slate-700 shadow-xl ring-2 ring-white"
                                            >
                                                2
                                            </motion.div>
                                        </div>
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 1 }}
                                            className="mb-2 max-w-[120px] truncate text-center text-base font-bold text-white"
                                        >
                                            {podium[1]?.nama}
                                        </motion.p>
                                        <div className="mb-3 flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
                                            <Star className="h-4 w-4 text-slate-200" />
                                            <span className="text-sm font-bold text-white">
                                                <AnimatedCounter
                                                    value={
                                                        podium[1]?.points || 0
                                                    }
                                                    suffix=" pts"
                                                />
                                            </span>
                                        </div>
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 110 }}
                                            transition={{
                                                delay: 1.1,
                                                duration: 0.6,
                                                type: 'spring',
                                            }}
                                            className="relative flex w-32 items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 shadow-2xl"
                                        >
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.2, 1],
                                                    rotate: [0, 10, -10, 0],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                }}
                                            >
                                                <Medal className="h-10 w-10 text-slate-600" />
                                            </motion.div>
                                        </motion.div>
                                    </motion.div>

                                    {/* 1st Place - Gold */}
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: 50,
                                            scale: 0.8,
                                        }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{
                                            delay: 0.9,
                                            type: 'spring',
                                            stiffness: 200,
                                        }}
                                        whileHover={{ scale: 1.08, y: -12 }}
                                        className="group -mt-12 flex cursor-pointer flex-col items-center"
                                        onMouseEnter={() => setHoveredRank(1)}
                                        onMouseLeave={() =>
                                            setHoveredRank(null)
                                        }
                                    >
                                        <motion.div
                                            animate={{
                                                y: [0, -12, 0],
                                                rotate:
                                                    hoveredRank === 1
                                                        ? [0, -12, 12, -12, 0]
                                                        : 0,
                                            }}
                                            transition={{
                                                y: {
                                                    duration: 2.5,
                                                    repeat: Infinity,
                                                    ease: 'easeInOut',
                                                },
                                                rotate: { duration: 0.6 },
                                            }}
                                            className="mb-3"
                                        >
                                            <Crown className="h-14 w-14 text-yellow-300 drop-shadow-2xl" />
                                        </motion.div>
                                        <div className="relative mb-4">
                                            <motion.div
                                                animate={
                                                    hoveredRank === 1
                                                        ? {
                                                              rotate: [
                                                                  0, -8, 8, -8,
                                                                  0,
                                                              ],
                                                              scale: [
                                                                  1, 1.15, 1,
                                                              ],
                                                          }
                                                        : {}
                                                }
                                                transition={{ duration: 0.6 }}
                                                className="relative"
                                            >
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 opacity-70 blur-2xl transition-opacity group-hover:opacity-100" />
                                                <div
                                                    className={cn(
                                                        'relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br text-3xl font-bold text-white shadow-2xl ring-4 ring-white/60 transition-all duration-300',
                                                        rankColors[1],
                                                    )}
                                                >
                                                    {podium[0]?.avatar_url ? (
                                                        <img
                                                            src={
                                                                podium[0]
                                                                    .avatar_url
                                                            }
                                                            alt=""
                                                            className="h-full w-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        podium[0]?.nama?.charAt(
                                                            0,
                                                        ) || '1'
                                                    )}
                                                </div>
                                            </motion.div>
                                            <motion.div
                                                initial={{
                                                    scale: 0,
                                                    rotate: -180,
                                                }}
                                                animate={{
                                                    scale: 1,
                                                    rotate: 0,
                                                }}
                                                transition={{
                                                    delay: 1,
                                                    type: 'spring',
                                                    stiffness: 300,
                                                }}
                                                whileHover={{
                                                    rotate: 360,
                                                    scale: 1.2,
                                                }}
                                                className="absolute -right-2 -bottom-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-lg font-black text-yellow-900 shadow-2xl ring-2 ring-white"
                                            >
                                                1
                                            </motion.div>
                                        </div>
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 1.1 }}
                                            className="mb-2 max-w-[140px] truncate text-center text-lg font-black text-white"
                                        >
                                            {podium[0]?.nama}
                                        </motion.p>
                                        <div className="mb-4 flex items-center gap-2 rounded-full bg-white/30 px-4 py-1.5 backdrop-blur-sm">
                                            <Star className="h-5 w-5 text-yellow-300" />
                                            <span className="text-base font-black text-white">
                                                <AnimatedCounter
                                                    value={
                                                        podium[0]?.points || 0
                                                    }
                                                    suffix=" pts"
                                                />
                                            </span>
                                        </div>
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 150 }}
                                            transition={{
                                                delay: 1.2,
                                                duration: 0.6,
                                                type: 'spring',
                                            }}
                                            className="relative flex w-36 items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 shadow-2xl"
                                        >
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.3, 1],
                                                    rotate: [0, 15, -15, 0],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                }}
                                            >
                                                <Trophy className="h-14 w-14 text-yellow-700" />
                                            </motion.div>
                                            {/* Shimmer effect */}
                                            <motion.div
                                                animate={{
                                                    x: ['-100%', '100%'],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: 'linear',
                                                }}
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                            />
                                        </motion.div>
                                    </motion.div>

                                    {/* 3rd Place - Bronze */}
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: 50,
                                            scale: 0.8,
                                        }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{
                                            delay: 1,
                                            type: 'spring',
                                            stiffness: 200,
                                        }}
                                        whileHover={{ scale: 1.08, y: -12 }}
                                        className="group flex cursor-pointer flex-col items-center"
                                        onMouseEnter={() => setHoveredRank(3)}
                                        onMouseLeave={() =>
                                            setHoveredRank(null)
                                        }
                                    >
                                        <div className="relative mb-4">
                                            <motion.div
                                                animate={
                                                    hoveredRank === 3
                                                        ? {
                                                              rotate: [
                                                                  0, -8, 8, -8,
                                                                  0,
                                                              ],
                                                              scale: [
                                                                  1, 1.15, 1,
                                                              ],
                                                          }
                                                        : {}
                                                }
                                                transition={{ duration: 0.6 }}
                                                className="relative"
                                            >
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 opacity-60 blur-xl transition-opacity group-hover:opacity-90" />
                                                <div
                                                    className={cn(
                                                        'relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold text-white shadow-2xl ring-4 ring-white/50 transition-all duration-300',
                                                        rankColors[3],
                                                    )}
                                                >
                                                    {podium[2]?.avatar_url ? (
                                                        <img
                                                            src={
                                                                podium[2]
                                                                    .avatar_url
                                                            }
                                                            alt=""
                                                            className="h-full w-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        podium[2]?.nama?.charAt(
                                                            0,
                                                        ) || '3'
                                                    )}
                                                </div>
                                            </motion.div>
                                            <motion.div
                                                initial={{
                                                    scale: 0,
                                                    rotate: -180,
                                                }}
                                                animate={{
                                                    scale: 1,
                                                    rotate: 0,
                                                }}
                                                transition={{
                                                    delay: 1.1,
                                                    type: 'spring',
                                                    stiffness: 300,
                                                }}
                                                whileHover={{
                                                    rotate: 360,
                                                    scale: 1.2,
                                                }}
                                                className="absolute -right-2 -bottom-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-orange-700 font-black text-white shadow-xl ring-2 ring-white"
                                            >
                                                3
                                            </motion.div>
                                        </div>
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 1.2 }}
                                            className="mb-2 max-w-[120px] truncate text-center text-base font-bold text-white"
                                        >
                                            {podium[2]?.nama}
                                        </motion.p>
                                        <div className="mb-3 flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
                                            <Star className="h-4 w-4 text-amber-200" />
                                            <span className="text-sm font-bold text-white">
                                                <AnimatedCounter
                                                    value={
                                                        podium[2]?.points || 0
                                                    }
                                                    suffix=" pts"
                                                />
                                            </span>
                                        </div>
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 80 }}
                                            transition={{
                                                delay: 1.3,
                                                duration: 0.6,
                                                type: 'spring',
                                            }}
                                            className="relative flex w-32 items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-b from-amber-500 via-orange-600 to-orange-700 shadow-2xl"
                                        >
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.2, 1],
                                                    rotate: [0, 10, -10, 0],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                }}
                                            >
                                                <Award className="h-8 w-8 text-amber-200" />
                                            </motion.div>
                                        </motion.div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Stats Cards with Dock-Style Animations */}
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        {
                            icon: Users,
                            label: 'Total Peserta',
                            value: stats.total_students,
                            color: 'from-blue-500 to-cyan-600',
                            delay: 0.5,
                        },
                        {
                            icon: TrendingUp,
                            label: 'Rata-rata Kehadiran',
                            value: stats.avg_attendance_rate,
                            suffix: '%',
                            color: 'from-emerald-500 to-green-600',
                            delay: 0.55,
                        },
                        {
                            icon: Trophy,
                            label: 'Peringkat Kamu',
                            value: myRank || 0,
                            prefix: '#',
                            color: 'from-amber-500 to-yellow-600',
                            delay: 0.6,
                        },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{
                                delay: stat.delay,
                                type: 'spring',
                                stiffness: 200,
                            }}
                            whileHover={{
                                scale: 1.05,
                                y: -5,
                                transition: {
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 10,
                                },
                            }}
                            className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                        >
                            {/* Glow effect on hover */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
                            />

                            <div className="relative flex items-center gap-3">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        delay: stat.delay + 0.1,
                                        type: 'spring',
                                        stiffness: 200,
                                    }}
                                    whileHover={{ rotate: 360 }}
                                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg transition-shadow group-hover:shadow-xl`}
                                >
                                    <stat.icon className="h-6 w-6" />
                                </motion.div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500">
                                        {stat.label}
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        <AnimatedCounter
                                            value={stat.value}
                                            prefix={stat.prefix || ''}
                                            suffix={stat.suffix || ''}
                                        />
                                    </p>
                                </div>
                            </div>

                            {/* Animated border */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-slate-900 to-transparent dark:via-white"
                                initial={{ width: '0%', opacity: 0 }}
                                whileHover={{ width: '100%', opacity: 0.5 }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Full Leaderboard with Advanced Interactions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                >
                    <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 200,
                                    delay: 0.7,
                                }}
                                className="rounded-lg bg-gradient-to-br from-gray-900 to-black p-2 text-white"
                            >
                                <Trophy className="h-4 w-4" />
                            </motion.div>
                            <div>
                                <motion.h2
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.75 }}
                                    className="font-semibold text-slate-900 dark:text-white"
                                >
                                    Ranking Lengkap
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-xs text-slate-500"
                                >
                                    Klik untuk melihat detail •{' '}
                                    {leaderboard.length} peserta
                                </motion.p>
                            </div>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        <AnimatePresence>
                            {leaderboard.map((entry, index) => {
                                const rank = index + 1;
                                const isMe = entry.id === mahasiswa.id;
                                const isExpanded = expandedId === entry.id;

                                // Special throne design for rank #1
                                if (rank === 1) {
                                    return (
                                        <motion.div
                                            key={entry.id}
                                            initial={{
                                                opacity: 0,
                                                scale: 0.95,
                                            }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                                delay: 0.9,
                                                type: 'spring',
                                                stiffness: 200,
                                            }}
                                            className="relative"
                                        >
                                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 p-6 shadow-2xl shadow-yellow-500/50">
                                                <div className="absolute inset-0 overflow-hidden">
                                                    {[...Array(12)].map(
                                                        (_, i) => (
                                                            <motion.div
                                                                key={i}
                                                                className="absolute"
                                                                initial={{
                                                                    opacity: 0,
                                                                    scale: 0,
                                                                }}
                                                                animate={{
                                                                    opacity: [
                                                                        0, 1, 0,
                                                                    ],
                                                                    scale: [
                                                                        0, 1.5,
                                                                        0,
                                                                    ],
                                                                    x: [
                                                                        0,
                                                                        Math.random() *
                                                                            40 -
                                                                            20,
                                                                    ],
                                                                    y: [
                                                                        0,
                                                                        Math.random() *
                                                                            40 -
                                                                            20,
                                                                    ],
                                                                }}
                                                                transition={{
                                                                    duration:
                                                                        2 +
                                                                        Math.random(),
                                                                    repeat: Infinity,
                                                                    delay:
                                                                        i * 0.2,
                                                                }}
                                                                style={{
                                                                    left: `${Math.random() * 100}%`,
                                                                    top: `${Math.random() * 100}%`,
                                                                }}
                                                            >
                                                                <Sparkles className="h-4 w-4 text-white" />
                                                            </motion.div>
                                                        ),
                                                    )}
                                                </div>
                                                <motion.div
                                                    animate={{
                                                        y: [0, -10, 0],
                                                        rotate: [0, 5, -5, 0],
                                                    }}
                                                    transition={{
                                                        duration: 3,
                                                        repeat: Infinity,
                                                        ease: 'easeInOut',
                                                    }}
                                                    className="absolute -top-8 left-1/2 -translate-x-1/2 transform"
                                                >
                                                    <Crown className="h-16 w-16 text-yellow-300 drop-shadow-2xl" />
                                                </motion.div>
                                                <div
                                                    onClick={() =>
                                                        setExpandedId(
                                                            isExpanded
                                                                ? null
                                                                : entry.id,
                                                        )
                                                    }
                                                    className="relative cursor-pointer pt-6"
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <motion.div
                                                            whileHover={{
                                                                scale: 1.15,
                                                                rotate: [
                                                                    0, -8, 8,
                                                                    -8, 0,
                                                                ],
                                                            }}
                                                            transition={{
                                                                duration: 0.5,
                                                            }}
                                                            className="relative"
                                                        >
                                                            <img
                                                                src="/images/crown.png"
                                                                alt="Crown"
                                                                className="h-40 w-80 object-contain brightness-125 contrast-110 drop-shadow-[0_20px_50px_rgba(251,191,36,1)] filter"
                                                            />
                                                            <motion.div
                                                                animate={{
                                                                    scale: [
                                                                        1, 1.5,
                                                                        1,
                                                                    ],
                                                                    opacity: [
                                                                        0.6,
                                                                        0.9,
                                                                        0.6,
                                                                    ],
                                                                }}
                                                                transition={{
                                                                    duration: 2,
                                                                    repeat: Infinity,
                                                                }}
                                                                className="absolute inset-0 -z-10 rounded-full bg-yellow-300 blur-[60px]"
                                                            />
                                                        </motion.div>
                                                        <div className="flex-1">
                                                            <div className="mb-2 flex items-center gap-3">
                                                                <div className="rounded-full bg-white/30 px-4 py-1 text-sm font-bold text-white shadow-lg backdrop-blur-sm">
                                                                    🏆 JUARA 1
                                                                </div>
                                                                {isMe && (
                                                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-600 shadow-lg">
                                                                        Kamu
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <h3 className="mb-1 text-2xl font-black text-white drop-shadow-lg">
                                                                {entry.nama}
                                                            </h3>
                                                            <p className="text-sm font-medium text-white/90">
                                                                {entry.nim} •{' '}
                                                                {entry.kelas ||
                                                                    '-'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <motion.div
                                                                whileHover={{
                                                                    scale: 1.1,
                                                                    y: -5,
                                                                }}
                                                                className="rounded-xl bg-white/20 px-4 py-3 text-center shadow-lg backdrop-blur-sm"
                                                            >
                                                                <div className="mb-1 flex items-center justify-center gap-1 text-white">
                                                                    <Trophy className="h-5 w-5" />
                                                                    <span className="text-2xl font-black">
                                                                        <AnimatedCounter
                                                                            value={
                                                                                entry.attendance_rate
                                                                            }
                                                                            suffix="%"
                                                                        />
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs font-medium text-white/80">
                                                                    Kehadiran
                                                                </p>
                                                            </motion.div>
                                                            <motion.div
                                                                whileHover={{
                                                                    scale: 1.1,
                                                                    y: -5,
                                                                }}
                                                                className="rounded-xl bg-white/20 px-4 py-3 text-center shadow-lg backdrop-blur-sm"
                                                            >
                                                                <div className="mb-1 flex items-center justify-center gap-1 text-white">
                                                                    <Flame className="h-5 w-5" />
                                                                    <span className="text-2xl font-black">
                                                                        <AnimatedCounter
                                                                            value={
                                                                                entry.streak
                                                                            }
                                                                        />
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs font-medium text-white/80">
                                                                    Streak
                                                                </p>
                                                            </motion.div>
                                                            <motion.div
                                                                whileHover={{
                                                                    scale: 1.1,
                                                                    y: -5,
                                                                }}
                                                                className="rounded-xl bg-white/20 px-4 py-3 text-center shadow-lg backdrop-blur-sm"
                                                            >
                                                                <div className="mb-1 flex items-center justify-center gap-1 text-white">
                                                                    <Star className="h-5 w-5" />
                                                                    <span className="text-2xl font-black">
                                                                        <AnimatedCounter
                                                                            value={
                                                                                entry.points
                                                                            }
                                                                        />
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs font-medium text-white/80">
                                                                    Poin
                                                                </p>
                                                            </motion.div>
                                                            <motion.div
                                                                whileHover={{
                                                                    scale: 1.15,
                                                                    rotate: 10,
                                                                }}
                                                                className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-black text-amber-600 shadow-xl"
                                                            >
                                                                <Zap className="h-5 w-5" />
                                                                <span className="text-lg">
                                                                    Lv.
                                                                    {
                                                                        entry.level
                                                                    }
                                                                </span>
                                                            </motion.div>
                                                        </div>
                                                        <motion.div
                                                            animate={{
                                                                rotate: isExpanded
                                                                    ? 180
                                                                    : 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.3,
                                                            }}
                                                            className="text-white"
                                                        >
                                                            <svg
                                                                className="h-6 w-6"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                                strokeWidth={3}
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M19 9l-7 7-7-7"
                                                                />
                                                            </svg>
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            </div>
                                            <AnimatePresence>
                                                {isExpanded && (
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
                                                            duration: 0.3,
                                                        }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-8 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-orange-950/30">
                                                            {/* Decorative Elements */}
                                                            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-gradient-to-br from-yellow-300/20 to-amber-400/20 blur-3xl" />
                                                            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-gradient-to-tr from-orange-300/20 to-yellow-400/20 blur-3xl" />

                                                            <div className="relative">
                                                                <div className="mb-6 flex items-center gap-2">
                                                                    <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                                                    <h3 className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-xl font-black text-transparent">
                                                                        Statistik
                                                                        Juara
                                                                    </h3>
                                                                </div>

                                                                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                                                                    {[
                                                                        {
                                                                            icon: Users,
                                                                            label: 'Total Sesi',
                                                                            value: entry.total_sessions,
                                                                            color: 'from-blue-500 via-cyan-500 to-blue-600',
                                                                            iconBg: 'from-blue-400 to-cyan-500',
                                                                        },
                                                                        {
                                                                            icon: Trophy,
                                                                            label: 'Hadir',
                                                                            value: entry.present_count,
                                                                            color: 'from-emerald-500 via-green-500 to-emerald-600',
                                                                            iconBg: 'from-emerald-400 to-green-500',
                                                                        },
                                                                        {
                                                                            icon: Target,
                                                                            label: 'Terlambat',
                                                                            value: entry.late_count,
                                                                            color: 'from-amber-500 via-orange-500 to-amber-600',
                                                                            iconBg: 'from-amber-400 to-orange-500',
                                                                        },
                                                                        {
                                                                            icon: TrendingUp,
                                                                            label: 'Tepat Waktu',
                                                                            value: entry.on_time_rate,
                                                                            suffix: '%',
                                                                            color: 'from-purple-500 via-violet-500 to-purple-600',
                                                                            iconBg: 'from-purple-400 to-violet-500',
                                                                        },
                                                                    ].map(
                                                                        (
                                                                            stat,
                                                                            i,
                                                                        ) => (
                                                                            <motion.div
                                                                                key={
                                                                                    stat.label
                                                                                }
                                                                                initial={{
                                                                                    opacity: 0,
                                                                                    y: 20,
                                                                                    scale: 0.9,
                                                                                }}
                                                                                animate={{
                                                                                    opacity: 1,
                                                                                    y: 0,
                                                                                    scale: 1,
                                                                                }}
                                                                                transition={{
                                                                                    delay:
                                                                                        0.1 +
                                                                                        i *
                                                                                            0.05,
                                                                                    type: 'spring',
                                                                                    stiffness: 200,
                                                                                }}
                                                                                whileHover={{
                                                                                    scale: 1.08,
                                                                                    y: -8,
                                                                                    rotate: [
                                                                                        0,
                                                                                        -2,
                                                                                        2,
                                                                                        0,
                                                                                    ],
                                                                                }}
                                                                                className="group relative"
                                                                            >
                                                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-amber-500/20 blur-xl transition-all group-hover:blur-2xl" />
                                                                                <div className="relative rounded-2xl border-2 border-amber-200 bg-white p-5 shadow-xl transition-all group-hover:border-amber-300 dark:border-amber-800/50 dark:bg-slate-900 dark:group-hover:border-amber-700">
                                                                                    <div className="mb-3 flex items-center gap-3">
                                                                                        <motion.div
                                                                                            whileHover={{
                                                                                                rotate: 360,
                                                                                            }}
                                                                                            transition={{
                                                                                                duration: 0.5,
                                                                                            }}
                                                                                            className={`rounded-xl bg-gradient-to-br p-3 ${stat.iconBg} shadow-lg`}
                                                                                        >
                                                                                            <stat.icon className="h-5 w-5 text-white" />
                                                                                        </motion.div>
                                                                                        <p className="text-xs font-bold tracking-wide text-slate-600 uppercase dark:text-slate-400">
                                                                                            {
                                                                                                stat.label
                                                                                            }
                                                                                        </p>
                                                                                    </div>
                                                                                    <p
                                                                                        className={`bg-gradient-to-r text-3xl font-black ${stat.color} bg-clip-text text-transparent`}
                                                                                    >
                                                                                        <AnimatedCounter
                                                                                            value={
                                                                                                stat.value
                                                                                            }
                                                                                            suffix={
                                                                                                stat.suffix ||
                                                                                                ''
                                                                                            }
                                                                                        />
                                                                                    </p>
                                                                                </div>
                                                                            </motion.div>
                                                                        ),
                                                                    )}
                                                                </div>

                                                                <motion.div
                                                                    initial={{
                                                                        opacity: 0,
                                                                        y: 20,
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                        y: 0,
                                                                    }}
                                                                    transition={{
                                                                        delay: 0.2,
                                                                    }}
                                                                    className="group relative"
                                                                >
                                                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/30 via-amber-500/30 to-orange-500/30 blur-xl" />
                                                                    <div className="relative rounded-2xl border-2 border-amber-200 bg-white p-6 shadow-2xl dark:border-amber-800/50 dark:bg-slate-900">
                                                                        <div className="mb-4 flex items-center gap-3">
                                                                            <div className="rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 p-2">
                                                                                <Star className="h-5 w-5 text-white" />
                                                                            </div>
                                                                            <p className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-sm font-black tracking-wide text-transparent uppercase">
                                                                                Performa
                                                                                Kehadiran
                                                                                Champion
                                                                            </p>
                                                                        </div>
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="flex-1">
                                                                                <div className="h-6 overflow-hidden rounded-full bg-gradient-to-r from-slate-200 to-slate-300 shadow-inner dark:from-slate-800 dark:to-slate-700">
                                                                                    <motion.div
                                                                                        initial={{
                                                                                            width: 0,
                                                                                        }}
                                                                                        animate={{
                                                                                            width: `${entry.attendance_rate}%`,
                                                                                        }}
                                                                                        transition={{
                                                                                            duration: 1.5,
                                                                                            delay: 0.5,
                                                                                            ease: 'easeOut',
                                                                                        }}
                                                                                        className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 shadow-lg"
                                                                                    >
                                                                                        <motion.div
                                                                                            animate={{
                                                                                                x: [
                                                                                                    '-100%',
                                                                                                    '100%',
                                                                                                ],
                                                                                            }}
                                                                                            transition={{
                                                                                                duration: 2,
                                                                                                repeat: Infinity,
                                                                                                ease: 'linear',
                                                                                            }}
                                                                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                                                                        />
                                                                                    </motion.div>
                                                                                </div>
                                                                            </div>
                                                                            <motion.span
                                                                                initial={{
                                                                                    scale: 0,
                                                                                }}
                                                                                animate={{
                                                                                    scale: 1,
                                                                                }}
                                                                                transition={{
                                                                                    delay: 0.8,
                                                                                    type: 'spring',
                                                                                    stiffness: 200,
                                                                                }}
                                                                                className="min-w-[80px] bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-right text-2xl font-black text-transparent"
                                                                            >
                                                                                {
                                                                                    entry.attendance_rate
                                                                                }
                                                                                %
                                                                            </motion.span>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                }

                                return (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{
                                            delay: 0.85 + index * 0.03,
                                            type: 'spring',
                                            stiffness: 200,
                                        }}
                                        className={cn(
                                            'transition-all duration-300',
                                            isMe
                                                ? 'bg-violet-50 dark:bg-violet-950/30'
                                                : '',
                                        )}
                                    >
                                        {/* Main Row */}
                                        <motion.div
                                            whileHover={{
                                                scale: 1.01,
                                                x: 5,
                                                transition: {
                                                    type: 'spring',
                                                    stiffness: 400,
                                                    damping: 10,
                                                },
                                            }}
                                            onClick={() =>
                                                setExpandedId(
                                                    isExpanded
                                                        ? null
                                                        : entry.id,
                                                )
                                            }
                                            className={cn(
                                                'group flex cursor-pointer items-center gap-4 p-4',
                                                isMe
                                                    ? 'hover:bg-violet-100 dark:hover:bg-violet-950/50'
                                                    : 'hover:bg-slate-50 dark:hover:bg-black/30',
                                            )}
                                        >
                                            {/* Rank Badge */}
                                            <motion.div
                                                initial={{
                                                    scale: 0,
                                                    rotate: -180,
                                                }}
                                                animate={{
                                                    scale: 1,
                                                    rotate: 0,
                                                }}
                                                transition={{
                                                    delay: 0.9 + index * 0.03,
                                                    type: 'spring',
                                                    stiffness: 200,
                                                }}
                                                whileHover={{
                                                    rotate: 360,
                                                    scale: 1.1,
                                                    transition: {
                                                        duration: 0.5,
                                                    },
                                                }}
                                                className={cn(
                                                    'flex h-14 w-14 items-center justify-center rounded-xl text-sm font-bold shadow-lg transition-all',
                                                    rank === 1
                                                        ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-yellow-500/30'
                                                        : rank === 2
                                                          ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-700'
                                                          : rank === 3
                                                            ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-amber-500/30'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                                                )}
                                            >
                                                {rank <= 3 ? (
                                                    rank === 1 ? (
                                                        <Crown className="h-6 w-6" />
                                                    ) : rank === 2 ? (
                                                        <Medal className="h-6 w-6" />
                                                    ) : (
                                                        <Award className="h-6 w-6" />
                                                    )
                                                ) : (
                                                    rank
                                                )}
                                            </motion.div>

                                            {/* Student Info */}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <motion.p
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{
                                                            delay:
                                                                0.95 +
                                                                index * 0.03,
                                                        }}
                                                        className={cn(
                                                            'truncate text-base font-semibold',
                                                            isMe
                                                                ? 'text-violet-700 dark:text-violet-300'
                                                                : 'text-slate-900 dark:text-white',
                                                        )}
                                                    >
                                                        {entry.nama}
                                                    </motion.p>
                                                    {isMe && (
                                                        <motion.span
                                                            initial={{
                                                                scale: 0,
                                                            }}
                                                            animate={{
                                                                scale: 1,
                                                            }}
                                                            transition={{
                                                                delay:
                                                                    1 +
                                                                    index *
                                                                        0.03,
                                                                type: 'spring',
                                                                stiffness: 300,
                                                            }}
                                                            className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                                                        >
                                                            Kamu
                                                        </motion.span>
                                                    )}
                                                </div>
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    {entry.nim} •{' '}
                                                    {entry.kelas || '-'}
                                                </p>
                                            </div>

                                            {/* Quick Stats */}
                                            <div className="flex items-center gap-4 text-sm">
                                                <motion.div
                                                    whileHover={{
                                                        scale: 1.1,
                                                        y: -2,
                                                    }}
                                                    className="hidden rounded-lg bg-emerald-50 px-3 py-2 text-center sm:block dark:bg-emerald-950/30"
                                                >
                                                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                                                        <AnimatedCounter
                                                            value={
                                                                entry.attendance_rate
                                                            }
                                                            suffix="%"
                                                        />
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Kehadiran
                                                    </p>
                                                </motion.div>
                                                <motion.div
                                                    whileHover={{
                                                        scale: 1.1,
                                                        y: -2,
                                                    }}
                                                    className="hidden rounded-lg bg-amber-50 px-3 py-2 text-center md:block dark:bg-amber-950/30"
                                                >
                                                    <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400">
                                                        <Flame className="h-4 w-4" />
                                                        <span className="font-bold">
                                                            <AnimatedCounter
                                                                value={
                                                                    entry.streak
                                                                }
                                                            />
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        Streak
                                                    </p>
                                                </motion.div>
                                                <motion.div
                                                    whileHover={{
                                                        scale: 1.1,
                                                        y: -2,
                                                    }}
                                                    className="rounded-lg bg-slate-50 px-3 py-2 text-center dark:bg-slate-900/50"
                                                >
                                                    <p className="font-bold text-slate-900 dark:text-white">
                                                        <AnimatedCounter
                                                            value={entry.points}
                                                        />
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Poin
                                                    </p>
                                                </motion.div>
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{
                                                        delay:
                                                            1.05 + index * 0.03,
                                                        type: 'spring',
                                                        stiffness: 300,
                                                    }}
                                                    whileHover={{
                                                        scale: 1.15,
                                                        rotate: 5,
                                                    }}
                                                    className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-purple-100 to-violet-100 px-3 py-2 text-purple-700 shadow-sm dark:from-purple-900/30 dark:to-violet-900/30 dark:text-purple-400"
                                                >
                                                    <Zap className="h-4 w-4" />
                                                    <span className="text-sm font-bold">
                                                        Lv.{entry.level}
                                                    </span>
                                                </motion.div>
                                            </div>

                                            {/* Expand Indicator */}
                                            <motion.div
                                                animate={{
                                                    rotate: isExpanded
                                                        ? 180
                                                        : 0,
                                                }}
                                                transition={{ duration: 0.3 }}
                                                className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                            >
                                                <motion.svg
                                                    className="h-5 w-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </motion.svg>
                                            </motion.div>
                                        </motion.div>

                                        {/* Expanded Detail */}
                                        <AnimatePresence>
                                            {isExpanded && (
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
                                                        duration: 0.3,
                                                    }}
                                                    className="overflow-hidden border-t border-slate-200 dark:border-slate-800"
                                                >
                                                    <div className="bg-slate-50/50 p-6 dark:bg-black/20">
                                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                                            {/* Detail Stats */}
                                                            <motion.div
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: 10,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                }}
                                                                transition={{
                                                                    delay: 0.1,
                                                                }}
                                                                className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900"
                                                            >
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950/30">
                                                                        <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                    </div>
                                                                    <p className="text-xs font-medium text-slate-500">
                                                                        Total
                                                                        Sesi
                                                                    </p>
                                                                </div>
                                                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                                                    <AnimatedCounter
                                                                        value={
                                                                            entry.total_sessions
                                                                        }
                                                                    />
                                                                </p>
                                                            </motion.div>

                                                            <motion.div
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: 10,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                }}
                                                                transition={{
                                                                    delay: 0.15,
                                                                }}
                                                                className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900"
                                                            >
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950/30">
                                                                        <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                                    </div>
                                                                    <p className="text-xs font-medium text-slate-500">
                                                                        Hadir
                                                                    </p>
                                                                </div>
                                                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                                                    <AnimatedCounter
                                                                        value={
                                                                            entry.present_count
                                                                        }
                                                                    />
                                                                </p>
                                                            </motion.div>

                                                            <motion.div
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: 10,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                }}
                                                                transition={{
                                                                    delay: 0.2,
                                                                }}
                                                                className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900"
                                                            >
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-950/30">
                                                                        <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                                    </div>
                                                                    <p className="text-xs font-medium text-slate-500">
                                                                        Terlambat
                                                                    </p>
                                                                </div>
                                                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                                                    <AnimatedCounter
                                                                        value={
                                                                            entry.late_count
                                                                        }
                                                                    />
                                                                </p>
                                                            </motion.div>

                                                            <motion.div
                                                                initial={{
                                                                    opacity: 0,
                                                                    y: 10,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    y: 0,
                                                                }}
                                                                transition={{
                                                                    delay: 0.25,
                                                                }}
                                                                className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900"
                                                            >
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950/30">
                                                                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                    </div>
                                                                    <p className="text-xs font-medium text-slate-500">
                                                                        Tepat
                                                                        Waktu
                                                                    </p>
                                                                </div>
                                                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                                    <AnimatedCounter
                                                                        value={
                                                                            entry.on_time_rate
                                                                        }
                                                                        suffix="%"
                                                                    />
                                                                </p>
                                                            </motion.div>
                                                        </div>

                                                        {/* Performance Bar */}
                                                        <motion.div
                                                            initial={{
                                                                opacity: 0,
                                                                y: 10,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            transition={{
                                                                delay: 0.3,
                                                            }}
                                                            className="mt-4 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-900"
                                                        >
                                                            <p className="mb-3 text-xs font-medium text-slate-500">
                                                                Performa
                                                                Kehadiran
                                                            </p>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1">
                                                                    <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                                                        <motion.div
                                                                            initial={{
                                                                                width: 0,
                                                                            }}
                                                                            animate={{
                                                                                width: `${entry.attendance_rate}%`,
                                                                            }}
                                                                            transition={{
                                                                                duration: 1,
                                                                                delay: 0.4,
                                                                            }}
                                                                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <span className="min-w-[50px] text-right text-sm font-bold text-slate-900 dark:text-white">
                                                                    {
                                                                        entry.attendance_rate
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>
                                                        </motion.div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </StudentLayout>
    );
}
