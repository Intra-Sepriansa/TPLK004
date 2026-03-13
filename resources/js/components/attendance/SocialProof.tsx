import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Crown, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SocialProofProps {
    totalStudents?: number;
    attendedCount?: number;
    isFirstAttendee?: boolean;
    recentAttendees?: string[];
    leaderboard?: Array<{
        rank: number;
        name: string;
        streak: number;
        points: number;
    }>;
}

export function SocialProof({
    totalStudents = 40,
    attendedCount = 0,
    isFirstAttendee = false,
    recentAttendees = [],
    leaderboard = [],
}: SocialProofProps) {
    const percentage =
        totalStudents > 0 ? (attendedCount / totalStudents) * 100 : 0;
    const [animatedCount, setAnimatedCount] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedCount(attendedCount), 300);
        return () => clearTimeout(timer);
    }, [attendedCount]);

    return (
        <div className="space-y-4">
            {/* Real-time Counter */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="mb-1 text-sm opacity-90">
                            Teman yang Sudah Absen
                        </p>
                        <motion.div
                            key={animatedCount}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-baseline gap-2"
                        >
                            <span className="text-5xl font-bold">
                                {animatedCount}
                            </span>
                            <span className="text-2xl opacity-75">
                                / {totalStudents}
                            </span>
                        </motion.div>
                    </div>
                    <Users className="h-16 w-16 opacity-50" />
                </div>
                <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span>Kehadiran Kelas</span>
                        <span className="font-bold">
                            {percentage.toFixed(0)}%
                        </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/20">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-full rounded-full bg-white"
                        />
                    </div>
                </div>
            </motion.div>

            {/* First Attendee Badge */}
            <AnimatePresence>
                {isFirstAttendee && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        className="rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white"
                    >
                        <div className="flex items-center gap-4">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <Crown className="h-12 w-12" />
                            </motion.div>
                            <div>
                                <h3 className="mb-1 text-xl font-bold">
                                    🎉 Kamu yang Pertama!
                                </h3>
                                <p className="text-sm opacity-90">
                                    Bonus +50 XP untuk early bird!
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recent Attendees */}
            {recentAttendees.length > 0 && (
                <div className="rounded-xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Baru Saja Absen
                    </h3>
                    <div className="space-y-2">
                        {recentAttendees.slice(0, 5).map((name, index) => (
                            <motion.div
                                key={name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-3 rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                                    {name.charAt(0)}
                                </div>
                                <span className="text-sm text-neutral-900 dark:text-white">
                                    {name}
                                </span>
                                <span className="ml-auto text-xs text-neutral-500">
                                    Baru saja
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
                <div className="rounded-xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40">
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
                        <Award className="h-5 w-5 text-purple-500" />
                        Top Performers
                    </h3>
                    <div className="space-y-3">
                        {leaderboard.slice(0, 5).map((entry, index) => (
                            <motion.div
                                key={entry.rank}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    'flex items-center gap-4 rounded-lg p-4',
                                    index === 0 &&
                                        'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30',
                                    index === 1 &&
                                        'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700',
                                    index === 2 &&
                                        'bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30',
                                    index > 2 &&
                                        'bg-neutral-100 dark:bg-neutral-800',
                                )}
                            >
                                <div
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                                        index === 0 &&
                                            'bg-yellow-500 text-white',
                                        index === 1 && 'bg-gray-400 text-white',
                                        index === 2 &&
                                            'bg-orange-500 text-white',
                                        index > 2 &&
                                            'bg-neutral-300 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300',
                                    )}
                                >
                                    {entry.rank}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-neutral-900 dark:text-white">
                                        {entry.name}
                                    </p>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                        🔥 {entry.streak} hari streak
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                        {entry.points}
                                    </p>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                        XP
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Motivation */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:border-emerald-800 dark:from-emerald-900/20 dark:to-teal-900/20"
            >
                <p className="text-center text-sm text-emerald-900 dark:text-emerald-100">
                    {percentage < 50
                        ? '💪 Ayo absen sekarang! Jangan sampai ketinggalan!'
                        : percentage < 80
                          ? '🎯 Kelas sudah ramai! Buruan absen!'
                          : '🔥 Hampir semua sudah hadir! Kamu yang terakhir?'}
                </p>
            </motion.div>
        </div>
    );
}
