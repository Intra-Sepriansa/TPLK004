import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Zap, TrendingUp, Filter, Search, Award, Crown } from 'lucide-react';
import { useState } from 'react';
import { LeaderboardCard } from '@/components/gamification/leaderboard-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <ScrollFloat
                            containerClassName="!my-0"
                            textClassName="!text-3xl font-bold text-slate-900 dark:text-white"
                            animationDuration={0.8}
                            ease="power2.out"
                            scrollStart="top bottom-=100"
                            scrollEnd="top center"
                            stagger={0.02}
                        >
                            🏆 Leaderboard
                        </ScrollFloat>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">
                            Compete with your classmates and climb to the top!
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 backdrop-blur dark:border-slate-800/70"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                                <Users className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Total Students</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.total_students}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 backdrop-blur dark:border-slate-800/70"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20">
                                <Zap className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Avg Points</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.average_points}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6 backdrop-blur dark:border-slate-800/70"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
                                <TrendingUp className="h-6 w-6 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Top Streak</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.top_streak} days
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-2">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('all')}
                        >
                            All Time
                        </Button>
                        <Button
                            variant={filter === 'week' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('week')}
                        >
                            This Week
                        </Button>
                        <Button
                            variant={filter === 'month' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('month')}
                        >
                            This Month
                        </Button>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Top 3 Podium */}
                <div className="grid gap-4 sm:grid-cols-3">
                    {topThree.map((entry, index) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`order-${index === 0 ? '2' : index === 1 ? '1' : '3'} sm:order-${index + 1}`}
                        >
                            <div className="relative">
                                {/* Podium Height */}
                                <div
                                    className={`rounded-t-2xl border-t-4 ${
                                        entry.rank === 1
                                            ? 'h-32 border-yellow-500 bg-gradient-to-b from-yellow-500/20 to-transparent'
                                            : entry.rank === 2
                                            ? 'h-24 border-slate-400 bg-gradient-to-b from-slate-400/20 to-transparent'
                                            : 'h-20 border-amber-600 bg-gradient-to-b from-amber-600/20 to-transparent'
                                    }`}
                                />
                                
                                {/* Card */}
                                <div className="absolute -top-16 left-1/2 w-full -translate-x-1/2 px-2">
                                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-center backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                                        <div className="relative mx-auto mb-3 h-16 w-16">
                                            <div className="h-full w-full overflow-hidden rounded-full border-4 border-white dark:border-slate-800">
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
                                            </div>
                                            <div className="absolute -bottom-1 -right-1">
                                                {entry.rank === 1 && <Crown className="h-6 w-6 text-yellow-500" />}
                                                {entry.rank === 2 && <Award className="h-6 w-6 text-slate-400" />}
                                                {entry.rank === 3 && <Award className="h-6 w-6 text-amber-600" />}
                                            </div>
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
                                                {entry.points}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Your Position */}
                {currentUser && currentUser.rank > 3 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h3 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
                            Your Position
                        </h3>
                        <LeaderboardCard entry={currentUser} index={0} isCurrentUser={true} />
                    </motion.div>
                )}

                {/* Rest of Leaderboard */}
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
                        All Rankings
                    </h3>
                    <div className="space-y-3">
                        <AnimatePresence>
                            {restOfLeaderboard.map((entry, index) => (
                                <LeaderboardCard
                                    key={entry.id}
                                    entry={entry}
                                    index={index + 3}
                                    isCurrentUser={entry.id === currentUser?.id}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {filteredLeaderboard.length === 0 && (
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-12 text-center backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <Trophy className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                            No results found
                        </h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Try adjusting your search or filters
                        </p>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
