import { AnimatedCounter } from '@/components/ui/animated-counter';
import StudentLayout from '@/layouts/student-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    Award,
    Crown,
    Flame,
    Medal,
    Star,
    Target,
    TrendingUp,
    Trophy,
    Users,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

// Custom 3D Icons
import LeaderboardIcon from '@/assets/admin/leaderboard/icon-leaderboard.png';
import KehadiranIcon from '@/assets/admin/leaderboard/kehadiran.png';
import PoinStarIcon from '@/assets/admin/leaderboard/rata-rata.png';
import TotalMahasiswaIcon from '@/assets/admin/leaderboard/total-mahasiswa.png';
import ApprovalRankIcon from '@/assets/mahasiswa/voting/approval.png';

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
            <div className="space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8">
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
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/user/dashboard')}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </motion.button>
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
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex items-center justify-center gap-2 text-sm font-medium tracking-wide text-indigo-100 sm:justify-start"
                                    >
                                        <Zap className="h-4 w-4" />
                                        Kompetisi Kelas
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="mt-1 text-2xl font-bold sm:text-3xl"
                                    >
                                        Leaderboard
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:mx-0 sm:text-base"
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
                    </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                    {[
                        {
                            isCustom: true,
                            src: TotalMahasiswaIcon,
                            label: 'Total Peserta',
                            value: stats.total_students,
                            bgGradient: 'from-sky-500/10 to-indigo-500/10',
                            glowBg: 'bg-sky-500',
                            hoverShadow: 'hover:shadow-sky-500/20',
                            delay: 0.1,
                        },
                        {
                            isCustom: true,
                            src: KehadiranIcon,
                            label: 'Rata-rata',
                            value: stats.avg_attendance_rate,
                            suffix: '%',
                            bgGradient: 'from-emerald-500/10 to-teal-500/10',
                            glowBg: 'bg-emerald-500',
                            hoverShadow: 'hover:shadow-emerald-500/20',
                            delay: 0.15,
                        },
                        {
                            isCustom: true,
                            src: ApprovalRankIcon,
                            label: 'Peringkat Kamu',
                            value: myRank || 0,
                            prefix: '#',
                            bgGradient: 'from-purple-500/10 to-violet-500/10',
                            glowBg: 'bg-purple-500',
                            hoverShadow: 'hover:shadow-purple-500/20',
                            delay: 0.2,
                        },
                        {
                            isCustom: true,
                            src: PoinStarIcon,
                            label: 'Poin Kamu',
                            value: myStats?.points || 0,
                            bgGradient: 'from-amber-500/10 to-orange-500/10',
                            glowBg: 'bg-amber-500',
                            hoverShadow: 'hover:shadow-amber-500/20',
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
                                scale: 1.04,
                                y: -4,
                                transition: {
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 15,
                                },
                            }}
                            className={`group relative cursor-pointer overflow-hidden rounded-xl border border-white/20 bg-white/40 p-2 shadow-xl backdrop-blur-xl transition-all sm:rounded-2xl sm:p-4 dark:border-white/5 dark:bg-neutral-900/40 ${stat.hoverShadow}`}
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                            />
                            <motion.div
                                className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${stat.glowBg} opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40`}
                            />
                            <div className="relative flex flex-col items-center gap-1 text-center sm:flex-row sm:gap-3 sm:text-left">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="relative mx-auto flex h-6 w-6 shrink-0 items-center justify-center sm:mx-0 sm:h-10 sm:w-10"
                                >
                                    <img
                                        src={stat.src}
                                        alt={stat.label}
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                    />
                                </motion.div>
                                <div>
                                    <p className="line-clamp-1 text-[9px] leading-tight font-medium text-neutral-600 sm:text-xs dark:text-neutral-300">
                                        {stat.label}
                                    </p>
                                    <div className="mt-0.5 sm:mt-1">
                                        <span className="text-xs font-bold text-neutral-900 sm:text-lg dark:text-white">
                                            <AnimatedCounter
                                                value={stat.value}
                                                prefix={stat.prefix || ''}
                                                suffix={stat.suffix || ''}
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Premium Podium with Advanced Animations */}
                {podium.length >= 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div>
                            <div className="border-b border-white/10 p-6">
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
                                            className="text-2xl font-black text-neutral-900 dark:text-white"
                                        >
                                            Top 3 Champions
                                        </motion.h2>
                                        <motion.p
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.7 }}
                                            className="text-sm font-medium text-neutral-500 dark:text-neutral-400"
                                        >
                                            Mahasiswa dengan performa terbaik
                                        </motion.p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 sm:p-10">
                                <div className="flex items-end justify-center gap-2 sm:gap-6">
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
                                        whileHover={{ scale: 1.05, y: -6 }}
                                        className="group flex w-[30%] flex-col items-center sm:w-auto"
                                        onMouseEnter={() => setHoveredRank(2)}
                                        onMouseLeave={() =>
                                            setHoveredRank(null)
                                        }
                                    >
                                        <div className="relative mb-2 sm:mb-4">
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
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 opacity-60 blur-md transition-opacity group-hover:opacity-90 sm:blur-xl" />
                                                <div
                                                    className={cn(
                                                        'relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-xl font-bold text-white shadow-xl ring-2 ring-white/50 transition-all duration-300 sm:h-24 sm:w-24 sm:text-2xl sm:shadow-2xl sm:ring-4',
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
                                                className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-xs font-black text-slate-700 shadow-xl ring-2 ring-white sm:-right-2 sm:-bottom-2 sm:h-10 sm:w-10 sm:text-base"
                                            >
                                                2
                                            </motion.div>
                                        </div>
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 1 }}
                                            className="mb-1 w-full truncate px-1 text-center text-[10px] font-bold text-white sm:mb-2 sm:px-0 sm:text-base"
                                            title={podium[1]?.nama}
                                        >
                                            {podium[1]?.nama}
                                        </motion.p>
                                        <div className="mb-2 flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 backdrop-blur-sm sm:mb-3 sm:gap-2 sm:px-3 sm:py-1">
                                            <Star className="h-3 w-3 text-slate-200 sm:h-4 sm:w-4" />
                                            <span className="text-[10px] font-bold text-white sm:text-sm">
                                                <AnimatedCounter
                                                    value={
                                                        podium[1]?.points || 0
                                                    }
                                                />
                                                <span className="hidden sm:inline">
                                                    {' '}
                                                    pts
                                                </span>
                                            </span>
                                        </div>
                                        <motion.div
                                            initial={{ scaleY: 0 }}
                                            animate={{ scaleY: 1 }}
                                            transition={{
                                                delay: 1.1,
                                                duration: 0.6,
                                                type: 'spring',
                                            }}
                                            style={{
                                                transformOrigin: 'bottom',
                                            }}
                                            className="relative flex h-[160px] w-full items-center justify-center overflow-hidden rounded-t-xl bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 shadow-2xl sm:h-[205px] sm:w-32 sm:rounded-t-2xl"
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
                                                <Medal className="h-6 w-6 text-slate-600 sm:h-10 sm:w-10" />
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
                                        whileHover={{ scale: 1.05, y: -6 }}
                                        className="group z-10 -mt-6 flex w-[36%] flex-col items-center sm:-mt-12 sm:w-auto"
                                        onMouseEnter={() => setHoveredRank(1)}
                                        onMouseLeave={() =>
                                            setHoveredRank(null)
                                        }
                                    >
                                        <motion.div
                                            animate={
                                                hoveredRank === 1
                                                    ? {
                                                          rotate: [
                                                              0, -12, 12, -12,
                                                              0,
                                                          ],
                                                      }
                                                    : { rotate: 0 }
                                            }
                                            transition={{ duration: 0.6 }}
                                            className="mb-1 sm:mb-3"
                                        >
                                            <Crown className="h-8 w-8 text-yellow-300 drop-shadow-2xl sm:h-14 sm:w-14" />
                                        </motion.div>
                                        <div className="relative mb-2 sm:mb-4">
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
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 opacity-70 blur-lg transition-opacity group-hover:opacity-100 sm:blur-2xl" />
                                                <div
                                                    className={cn(
                                                        'relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold text-white shadow-xl ring-2 ring-white/60 transition-all duration-300 sm:h-28 sm:w-28 sm:text-3xl sm:shadow-2xl sm:ring-4',
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
                                                className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-sm font-black text-yellow-900 shadow-2xl ring-2 ring-white sm:-right-2 sm:-bottom-2 sm:h-12 sm:w-12 sm:text-lg"
                                            >
                                                1
                                            </motion.div>
                                        </div>
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 1.1 }}
                                            className="mb-1 w-full truncate px-1 text-center text-xs font-black text-white sm:mb-2 sm:px-0 sm:text-lg"
                                            title={podium[0]?.nama}
                                        >
                                            {podium[0]?.nama}
                                        </motion.p>
                                        <div className="mb-2 flex items-center gap-1 rounded-full bg-white/30 px-2 py-0.5 backdrop-blur-sm sm:mb-4 sm:gap-2 sm:px-4 sm:py-1.5">
                                            <Star className="h-3 w-3 text-yellow-300 sm:h-5 sm:w-5" />
                                            <span className="text-xs font-black text-white sm:text-base">
                                                <AnimatedCounter
                                                    value={
                                                        podium[0]?.points || 0
                                                    }
                                                />
                                                <span className="hidden sm:inline">
                                                    {' '}
                                                    pts
                                                </span>
                                            </span>
                                        </div>
                                        <motion.div
                                            initial={{ scaleY: 0 }}
                                            animate={{ scaleY: 1 }}
                                            transition={{
                                                delay: 1.2,
                                                duration: 0.6,
                                                type: 'spring',
                                            }}
                                            style={{
                                                transformOrigin: 'bottom',
                                            }}
                                            className="relative flex h-[205px] w-full items-center justify-center overflow-hidden rounded-t-xl bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 shadow-2xl sm:h-[250px] sm:w-36 sm:rounded-t-2xl"
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
                                                <Trophy className="h-7 w-7 text-yellow-700 sm:h-14 sm:w-14" />
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
                                        whileHover={{ scale: 1.05, y: -6 }}
                                        className="group flex w-[30%] flex-col items-center sm:w-auto"
                                        onMouseEnter={() => setHoveredRank(3)}
                                        onMouseLeave={() =>
                                            setHoveredRank(null)
                                        }
                                    >
                                        <div className="relative mb-2 sm:mb-4">
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
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 opacity-60 blur-md transition-opacity group-hover:opacity-90 sm:blur-xl" />
                                                <div
                                                    className={cn(
                                                        'relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-xl font-bold text-white shadow-xl ring-2 ring-white/50 transition-all duration-300 sm:h-24 sm:w-24 sm:text-2xl sm:shadow-2xl sm:ring-4',
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
                                                className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-orange-700 text-xs font-black text-white shadow-xl ring-2 ring-white sm:-right-2 sm:-bottom-2 sm:h-10 sm:w-10 sm:text-base"
                                            >
                                                3
                                            </motion.div>
                                        </div>
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 1.2 }}
                                            className="mb-1 w-full truncate px-1 text-center text-[10px] font-bold text-white sm:mb-2 sm:px-0 sm:text-base"
                                            title={podium[2]?.nama}
                                        >
                                            {podium[2]?.nama}
                                        </motion.p>
                                        <div className="mb-2 flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 backdrop-blur-sm sm:mb-3 sm:gap-2 sm:px-3 sm:py-1">
                                            <Star className="h-3 w-3 text-amber-200 sm:h-4 sm:w-4" />
                                            <span className="text-[10px] font-bold text-white sm:text-sm">
                                                <AnimatedCounter
                                                    value={
                                                        podium[2]?.points || 0
                                                    }
                                                />
                                                <span className="hidden sm:inline">
                                                    {' '}
                                                    pts
                                                </span>
                                            </span>
                                        </div>
                                        <motion.div
                                            initial={{ scaleY: 0 }}
                                            animate={{ scaleY: 1 }}
                                            transition={{
                                                delay: 1.3,
                                                duration: 0.6,
                                                type: 'spring',
                                            }}
                                            style={{
                                                transformOrigin: 'bottom',
                                            }}
                                            className="relative flex h-[140px] w-full items-center justify-center overflow-hidden rounded-t-xl bg-gradient-to-b from-amber-500 via-orange-600 to-orange-700 shadow-2xl sm:h-[165px] sm:w-32 sm:rounded-t-2xl"
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
                                                <Award className="h-5 w-5 text-amber-200 sm:h-8 sm:w-8" />
                                            </motion.div>
                                        </motion.div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Stats Cards with Dock-Style Animations */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-3">
                    {[
                        {
                            isCustom: true,
                            src: TotalMahasiswaIcon,
                            label: 'Total Peserta',
                            value: stats.total_students,
                            color: 'from-blue-500 to-cyan-600',
                            delay: 0.5,
                        },
                        {
                            isCustom: true,
                            src: KehadiranIcon,
                            label: 'Rata-rata Kehadiran',
                            value: stats.avg_attendance_rate,
                            suffix: '%',
                            color: 'from-emerald-500 to-green-600',
                            delay: 0.55,
                        },
                        {
                            isCustom: false,
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
                                scale: 1.04,
                                y: -4,
                                transition: {
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 15,
                                },
                            }}
                            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl sm:rounded-3xl dark:border-white/5 dark:bg-neutral-900/40"
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
                                    className={`flex h-12 w-12 items-center justify-center ${stat.isCustom ? '' : 'rounded-xl bg-gradient-to-br ' + stat.color + ' text-white shadow-lg transition-shadow group-hover:shadow-xl'}`}
                                >
                                    {stat.isCustom ? (
                                        <img
                                            src={stat.src}
                                            alt={stat.label}
                                            className={`h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.3)]`}
                                        />
                                    ) : (
                                        stat.icon && (
                                            <stat.icon className="h-6 w-6" />
                                        )
                                    )}
                                </motion.div>
                                <div>
                                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                        {stat.label}
                                    </p>
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
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
                                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-neutral-900 to-transparent dark:via-white"
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
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="border-b border-white/10 p-6">
                        <div className="flex items-center gap-2">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 200,
                                    delay: 0.7,
                                }}
                                className="rounded-lg bg-gradient-to-br from-indigo-400 to-purple-600 p-2 text-white shadow-lg"
                            >
                                <Trophy className="h-4 w-4" />
                            </motion.div>
                            <div>
                                <motion.h2
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.75 }}
                                    className="font-semibold text-neutral-900 dark:text-white"
                                >
                                    Ranking Lengkap
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-xs text-neutral-500 dark:text-neutral-400"
                                >
                                    Klik untuk melihat detail |{' '}
                                    {leaderboard.length} peserta
                                </motion.p>
                            </div>
                        </div>
                    </div>
                    <div className="divide-y divide-white/20 dark:divide-white/5">
                        <AnimatePresence>
                            {leaderboard.map((entry, index) => {
                                const rank = index + 1;
                                const isMe = entry.id === mahasiswa.id;
                                const isExpanded = expandedId === entry.id;

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
                                                ? 'bg-indigo-50/40 dark:bg-neutral-900/40'
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
                                                    ? 'hover:bg-indigo-50/60 dark:hover:bg-neutral-800/50'
                                                    : 'hover:bg-white/70 dark:hover:bg-neutral-800/40',
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
                                                            : 'bg-slate-100 text-slate-600 dark:bg-neutral-800/70 dark:text-slate-300',
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
                                                            className="rounded-full border border-white/20 bg-white/70 px-2 py-0.5 text-xs font-medium text-violet-700 backdrop-blur-xl dark:border-white/5 dark:bg-neutral-800/60 dark:text-violet-300"
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
                                                    className="hidden rounded-lg border border-white/20 bg-white/70 px-3 py-2 text-center backdrop-blur-xl sm:block dark:border-white/5 dark:bg-neutral-800/60"
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
                                                    className="hidden rounded-lg border border-white/20 bg-white/70 px-3 py-2 text-center backdrop-blur-xl md:block dark:border-white/5 dark:bg-neutral-800/60"
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
                                                    className="rounded-lg border border-white/20 bg-white/70 px-3 py-2 text-center backdrop-blur-xl dark:border-white/5 dark:bg-neutral-800/60"
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
                                                    className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/70 px-3 py-2 text-purple-700 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-800/60 dark:text-purple-400"
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
                                                    className="overflow-hidden border-t border-white/10 dark:border-white/5"
                                                >
                                                    <div className="bg-white/50 p-6 backdrop-blur-xl dark:bg-neutral-900/40">
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
                                                                className="rounded-xl border border-white/20 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-800/60"
                                                            >
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <div className="rounded-lg bg-white/80 p-2 dark:bg-white/10">
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
                                                                className="rounded-xl border border-white/20 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-800/60"
                                                            >
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <div className="rounded-lg bg-white/80 p-2 dark:bg-white/10">
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
                                                                className="rounded-xl border border-white/20 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-800/60"
                                                            >
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <div className="rounded-lg bg-white/80 p-2 dark:bg-white/10">
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
                                                                className="rounded-xl border border-white/20 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-800/60"
                                                            >
                                                                <div className="mb-2 flex items-center gap-2">
                                                                    <div className="rounded-lg bg-white/80 p-2 dark:bg-white/10">
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
                                                            className="mt-4 rounded-xl border border-white/20 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-800/60"
                                                        >
                                                            <p className="mb-3 text-xs font-medium text-slate-500">
                                                                Performa
                                                                Kehadiran
                                                            </p>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1">
                                                                    <div className="h-3 overflow-hidden rounded-full bg-slate-200/80 dark:bg-neutral-700/60">
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
