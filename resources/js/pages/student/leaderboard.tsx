import { LeaderboardCard } from '@/components/gamification/leaderboard-card';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StudentLayout from '@/layouts/student-layout';
import { Head } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Crown, Search, TrendingUp, Trophy, Zap } from 'lucide-react';
import { useState } from 'react';

// Custom 3D Icons
import LeaderboardIcon from '@/assets/admin/leaderboard/icon-leaderboard.png';
import RataRataIcon from '@/assets/admin/leaderboard/rata-rata.png';
import TotalMahasiswaIcon from '@/assets/admin/leaderboard/total-mahasiswa.png';

interface LeaderboardEntry {
    rank: number;
    id: number;
    name: string;
    nim: string;
    avatar?: string;
    points: number;
    streak: number;
    attendance_rate: number;
    badges_count: number;
    trend?: 'up' | 'down' | 'same';
    rank_change?: number;
}

interface LeaderboardPageProps {
    leaderboard: LeaderboardEntry[];
    currentUser: LeaderboardEntry;
    stats: {
        total_students: number;
        average_points: number;
        top_streak: number;
    };
}

export default function LeaderboardPage({
    leaderboard,
    currentUser,
    stats,
}: LeaderboardPageProps) {
    const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLeaderboard = leaderboard.filter(
        (entry) =>
            entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.nim.includes(searchQuery),
    );

    const topThree = filteredLeaderboard.slice(0, 3);
    const restOfLeaderboard = filteredLeaderboard.slice(3);

    return (
        <StudentLayout>
            <Head title="Leaderboard" />

            <div className="space-y-6 p-6">
                {/* Animated Header with Dashboard Ultra Advanced Style */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 100,
                    }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 p-8 text-white shadow-2xl"
                    style={{
                        transformStyle: 'preserve-3d',
                        perspective: '1500px',
                    }}
                >
                    {/* Ultra Advanced Animated Background Orbs */}
                    <motion.div
                        animate={{
                            scale: [1, 1.4, 1],
                            rotate: [0, 180, 360],
                            opacity: [0.1, 0.2, 0.1],
                            x: [0, 50, 0],
                            y: [0, -30, 0],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-white/30 to-yellow-200/30 blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.5, 1],
                            rotate: [360, 180, 0],
                            opacity: [0.1, 0.15, 0.1],
                            x: [0, -40, 0],
                            y: [0, 40, 0],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-orange-300/30 to-red-400/30 blur-3xl"
                    />

                    {/* Floating Academic Icons */}
                    {[Trophy, Award, Crown, Zap].map((Icon, i) => (
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
                                left: `${15 + i * 22}%`,
                                top: `${20 + (i % 2) * 40}%`,
                            }}
                        >
                            <Icon className="h-6 w-6 text-white" />
                        </motion.div>
                    ))}

                    <div className="relative">
                        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:gap-6">
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
                                        className="flex items-center justify-center gap-2 text-sm font-medium tracking-wide text-yellow-100 sm:justify-start"
                                    >
                                        <Zap className="h-4 w-4" />
                                        Kompetisi Kelas
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-1 text-2xl font-bold sm:text-3xl"
                                    >
                                        Leaderboard
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-yellow-100 sm:mx-0 sm:text-base"
                                    >
                                        Compete with your classmates and climb
                                        to the top!
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards dengan animasi dan count up */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                        {
                            isCustom: true,
                            src: TotalMahasiswaIcon,
                            label: 'Total Students',
                            value: stats.total_students,
                            bgGradient:
                                'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
                            glowBg: 'bg-sky-500',
                            hoverShadow: 'hover:shadow-sky-500/10',
                            delay: 0.1,
                        },
                        {
                            isCustom: true,
                            src: RataRataIcon,
                            label: 'Avg Points',
                            value: stats.average_points,
                            bgGradient:
                                'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
                            glowBg: 'bg-amber-500',
                            hoverShadow: 'hover:shadow-amber-500/10',
                            delay: 0.15,
                        },
                        {
                            isCustom: false,
                            icon: TrendingUp,
                            label: 'Top Streak',
                            value: stats.top_streak,
                            suffix: ' days',
                            iconColor: 'text-orange-500',
                            bgGradient:
                                'from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10',
                            glowBg: 'bg-orange-500',
                            hoverShadow: 'hover:shadow-orange-500/10',
                            delay: 0.2,
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
                            className={`group relative overflow-hidden rounded-xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-5 dark:bg-neutral-900/40 ${stat.hoverShadow} cursor-pointer dark:border-white/5`}
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient}`}
                            />
                            <motion.div
                                className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${stat.glowBg} scale-100 transform opacity-20 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-40`}
                            />

                            <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="relative mx-auto flex h-10 w-10 shrink-0 items-center justify-center sm:mx-0 sm:h-14 sm:w-14"
                                >
                                    {stat.isCustom ? (
                                        <img
                                            src={stat.src}
                                            alt={stat.label}
                                            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                        />
                                    ) : (
                                        stat.icon && (
                                            <stat.icon
                                                className={`h-full w-full object-contain ${stat.iconColor} drop-shadow-md`}
                                            />
                                        )
                                    )}
                                </motion.div>
                                <div>
                                    <p className="text-[10px] leading-tight font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                                        {stat.label}
                                    </p>
                                    <div className="mt-0.5 sm:mt-1">
                                        <span className="text-sm font-bold text-neutral-900 sm:text-2xl dark:text-white">
                                            <AnimatedCounter
                                                value={stat.value}
                                                suffix={stat.suffix || ''}
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Filters & Search dengan animasi */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex gap-2">
                        {['all', 'week', 'month'].map((filterType, index) => (
                            <motion.div
                                key={filterType}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.05 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    variant={
                                        filter === filterType
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => setFilter(filterType as any)}
                                >
                                    {filterType === 'all'
                                        ? 'All Time'
                                        : filterType === 'week'
                                          ? 'This Week'
                                          : 'This Month'}
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="relative w-full sm:w-64"
                    >
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </motion.div>
                </motion.div>

                {/* Top 3 Podium dengan animasi enhanced */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid gap-4 sm:grid-cols-3"
                >
                    {topThree.map((entry, index) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{
                                delay: 0.7 + index * 0.1,
                                type: 'spring',
                                stiffness: 200,
                                damping: 15,
                            }}
                            whileHover={{ scale: 1.05, y: -10 }}
                            className={`order-${index === 0 ? '2' : index === 1 ? '1' : '3'} sm:order-${index + 1}`}
                        >
                            <div className="relative">
                                {/* Podium Height dengan animasi */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{
                                        height:
                                            entry.rank === 1
                                                ? 128
                                                : entry.rank === 2
                                                  ? 96
                                                  : 80,
                                    }}
                                    transition={{
                                        delay: 0.8 + index * 0.1,
                                        duration: 0.5,
                                    }}
                                    className={`rounded-t-2xl border-t-4 ${
                                        entry.rank === 1
                                            ? 'border-yellow-500 bg-gradient-to-b from-yellow-500/20 to-transparent'
                                            : entry.rank === 2
                                              ? 'border-slate-400 bg-gradient-to-b from-slate-400/20 to-transparent'
                                              : 'border-amber-600 bg-gradient-to-b from-amber-600/20 to-transparent'
                                    }`}
                                />

                                {/* Card dengan animasi */}
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.6,
                                        type: 'spring',
                                        stiffness: 100,
                                    }}
                                    className="absolute -top-16 left-1/2 w-full -translate-x-1/2 px-2"
                                >
                                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-center shadow-xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                                        <div className="relative mx-auto mb-3 h-16 w-16">
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
                                                    delay: 1 + index * 0.1,
                                                    type: 'spring',
                                                    stiffness: 200,
                                                }}
                                                className="h-full w-full overflow-hidden rounded-full border-4 border-white dark:border-slate-800"
                                            >
                                                {entry.avatar ? (
                                                    <img
                                                        src={entry.avatar}
                                                        alt={entry.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-xl font-bold text-white">
                                                        {entry.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                )}
                                            </motion.div>
                                            <motion.div
                                                initial={{
                                                    scale: 0,
                                                    rotate: 180,
                                                }}
                                                animate={{
                                                    scale: 1,
                                                    rotate: 0,
                                                }}
                                                transition={{
                                                    delay: 1.1 + index * 0.1,
                                                    type: 'spring',
                                                    stiffness: 300,
                                                }}
                                                className="absolute -right-1 -bottom-1"
                                            >
                                                {entry.rank === 1 && (
                                                    <Crown className="h-6 w-6 text-yellow-500" />
                                                )}
                                                {entry.rank === 2 && (
                                                    <Award className="h-6 w-6 text-slate-400" />
                                                )}
                                                {entry.rank === 3 && (
                                                    <Award className="h-6 w-6 text-amber-600" />
                                                )}
                                            </motion.div>
                                        </div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            {entry.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {entry.nim}
                                        </p>
                                        <div className="mt-3 flex items-center justify-center gap-2">
                                            <Zap className="h-4 w-4 text-yellow-500" />
                                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                                                <AnimatedCounter
                                                    value={entry.points}
                                                />
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Your Position dengan animasi */}
                {currentUser && currentUser.rank > 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
                            Your Position
                        </h3>
                        <LeaderboardCard
                            entry={currentUser}
                            index={0}
                            isCurrentUser={true}
                        />
                    </motion.div>
                )}

                {/* Rest of Leaderboard dengan animasi */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
                        All Rankings
                    </h3>
                    <div className="space-y-3">
                        <AnimatePresence>
                            {restOfLeaderboard.map((entry, index) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <LeaderboardCard
                                        entry={entry}
                                        index={index + 3}
                                        isCurrentUser={
                                            entry.id === currentUser?.id
                                        }
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Empty state dengan animasi */}
                {filteredLeaderboard.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-12 text-center backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                type: 'spring',
                                stiffness: 200,
                                delay: 0.2,
                            }}
                        >
                            <Trophy className="mx-auto h-12 w-12 text-slate-400" />
                        </motion.div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                            No results found
                        </h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Try adjusting your search or filters
                        </p>
                    </motion.div>
                )}
            </div>
        </StudentLayout>
    );
}
