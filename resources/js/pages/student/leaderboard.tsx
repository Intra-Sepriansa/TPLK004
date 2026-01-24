import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Zap, TrendingUp, Filter, Search, Award, Crown } from 'lucide-react';
import { useState } from 'react';
import { LeaderboardCard } from '@/components/gamification/leaderboard-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import StudentLayout from '@/layouts/student-layout';
import ScrollFloat from '@/components/ui/scroll-float';

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

export default function LeaderboardPage({ leaderboard, currentUser, stats }: LeaderboardPageProps) {
    const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLeaderboard = leaderboard.filter(entry =>
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.nim.includes(searchQuery)
    );

    const topThree = filteredLeaderboard.slice(0, 3);
    const restOfLeaderboard = filteredLeaderboard.slice(3);

    return (
        <StudentLayout>
            <Head title="Leaderboard" />

            <div className="space-y-6 p-6">
                {/* Header dengan animasi */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 p-8 text-white shadow-2xl"
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
                        <div className="flex items-center gap-4">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur"
                            >
                                <Trophy className="h-8 w-8" />
                            </motion.div>
                            <div>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-sm text-yellow-100"
                                >
                                    Kompetisi Kelas
                                </motion.p>
                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-bold"
                                >
                                    Leaderboard
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-sm text-yellow-100"
                                >
                                    Compete with your classmates and climb to the top!
                                </motion.p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards dengan animasi dan count up */}
                <div className="grid gap-4 sm:grid-cols-3">
                    {[
                        {
                            icon: Users,
                            label: 'Total Students',
                            value: stats.total_students,
                            gradient: 'from-blue-500 to-purple-500',
                            iconBg: 'bg-blue-500/20',
                            iconColor: 'text-blue-500',
                            delay: 0.1
                        },
                        {
                            icon: Zap,
                            label: 'Avg Points',
                            value: stats.average_points,
                            gradient: 'from-yellow-500 to-orange-500',
                            iconBg: 'bg-yellow-500/20',
                            iconColor: 'text-yellow-500',
                            delay: 0.15
                        },
                        {
                            icon: TrendingUp,
                            label: 'Top Streak',
                            value: stats.top_streak,
                            suffix: ' days',
                            gradient: 'from-orange-500 to-red-500',
                            iconBg: 'bg-orange-500/20',
                            iconColor: 'text-orange-500',
                            delay: 0.2
                        }
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: stat.delay, type: "spring", stiffness: 200 }}
                            whileHover={{ 
                                scale: 1.05, 
                                y: -5,
                                transition: { type: "spring", stiffness: 400, damping: 10 }
                            }}
                            className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 cursor-pointer"
                        >
                            {/* Glow effect on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                            
                            <div className="relative flex items-center gap-3">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: stat.delay + 0.1, type: "spring", stiffness: 200 }}
                                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg}`}
                                >
                                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
                                    </p>
                                </div>
                            </div>
                            
                            {/* Animated border */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-slate-900 dark:via-white to-transparent"
                                initial={{ width: "0%", opacity: 0 }}
                                whileHover={{ width: "100%", opacity: 0.5 }}
                                transition={{ duration: 0.3 }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Filters & Search dengan animasi */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
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
                                    variant={filter === filterType ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilter(filterType as any)}
                                >
                                    {filterType === 'all' ? 'All Time' : filterType === 'week' ? 'This Week' : 'This Month'}
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
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                    transition={{ delay: 0.6 }}
                    className="grid gap-4 sm:grid-cols-3"
                >
                    {topThree.map((entry, index) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ 
                                delay: 0.7 + index * 0.1,
                                type: "spring",
                                stiffness: 200,
                                damping: 15
                            }}
                            whileHover={{ scale: 1.05, y: -10 }}
                            className={`order-${index === 0 ? '2' : index === 1 ? '1' : '3'} sm:order-${index + 1}`}
                        >
                            <div className="relative">
                                {/* Podium Height dengan animasi */}
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ 
                                        height: entry.rank === 1 ? 128 : entry.rank === 2 ? 96 : 80
                                    }}
                                    transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
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
                                    transition={{ delay: 0.9 + index * 0.1 }}
                                    className="absolute -top-16 left-1/2 w-full -translate-x-1/2 px-2"
                                >
                                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-center backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 shadow-xl">
                                        <div className="relative mx-auto mb-3 h-16 w-16">
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ delay: 1 + index * 0.1, type: "spring", stiffness: 200 }}
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
                                                        {entry.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </motion.div>
                                            <motion.div
                                                initial={{ scale: 0, rotate: 180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ delay: 1.1 + index * 0.1, type: "spring", stiffness: 300 }}
                                                className="absolute -bottom-1 -right-1"
                                            >
                                                {entry.rank === 1 && <Crown className="h-6 w-6 text-yellow-500" />}
                                                {entry.rank === 2 && <Award className="h-6 w-6 text-slate-400" />}
                                                {entry.rank === 3 && <Award className="h-6 w-6 text-amber-600" />}
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
                                                <AnimatedCounter value={entry.points} />
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
                        transition={{ delay: 1.2 }}
                    >
                        <h3 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
                            Your Position
                        </h3>
                        <LeaderboardCard entry={currentUser} index={0} isCurrentUser={true} />
                    </motion.div>
                )}

                {/* Rest of Leaderboard dengan animasi */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
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
                                        isCurrentUser={entry.id === currentUser?.id}
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
                        transition={{ type: "spring", stiffness: 200 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-12 text-center backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
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
