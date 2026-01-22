import { motion } from 'framer-motion';
import { Award, Crown, Medal, TrendingUp, Zap, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
    rank: number;
    id: number;
    name: string;
    nim?: string;
    avatar?: string;
    points: number;
    streak: number;
    attendance_rate: number;
    badges_count: number;
    trend?: 'up' | 'down' | 'same';
    rank_change?: number;
}

interface LeaderboardCardProps {
    entry: LeaderboardEntry;
    index: number;
    isCurrentUser?: boolean;
}

export function LeaderboardCard({ entry, index, isCurrentUser = false }: LeaderboardCardProps) {
    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-6 w-6 text-yellow-500" />;
            case 2:
                return <Medal className="h-6 w-6 text-slate-400" />;
            case 3:
                return <Medal className="h-6 w-6 text-amber-600" />;
            default:
                return null;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30';
            case 2:
                return 'from-slate-400/20 to-slate-500/20 border-slate-400/30';
            case 3:
                return 'from-amber-600/20 to-amber-700/20 border-amber-600/30';
            default:
                return 'from-slate-100/50 to-slate-200/50 dark:from-slate-800/50 dark:to-slate-900/50 border-slate-200/50 dark:border-slate-700/50';
        }
    };

    const getTrendIcon = () => {
        if (!entry.trend || entry.trend === 'same') return null;
        return entry.trend === 'up' ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
        ) : (
            <TrendingUp className="h-4 w-4 text-rose-500 rotate-180" />
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={cn(
                'relative overflow-hidden rounded-2xl border p-4 backdrop-blur-sm transition-all',
                isCurrentUser
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 ring-2 ring-blue-500/50'
                    : `bg-gradient-to-r ${getRankColor(entry.rank)}`
            )}
        >
            {/* Rank Badge */}
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
            
            <div className="relative flex items-center gap-4">
                {/* Rank Number */}
                <div className="flex flex-col items-center">
                    {getRankIcon(entry.rank) || (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/50 dark:bg-slate-700/50">
                            <span className="text-lg font-bold text-slate-700 dark:text-slate-200">
                                {entry.rank}
                            </span>
                        </div>
                    )}
                    {entry.rank_change && entry.rank_change !== 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mt-1 flex items-center gap-1 text-xs"
                        >
                            {getTrendIcon()}
                            <span className={cn(
                                'font-semibold',
                                entry.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'
                            )}>
                                {Math.abs(entry.rank_change)}
                            </span>
                        </motion.div>
                    )}
                </div>

                {/* Avatar */}
                <div className="relative">
                    <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-white/50 dark:border-slate-700/50">
                        {entry.avatar ? (
                            <img
                                src={entry.avatar}
                                alt={entry.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-lg font-bold text-white">
                                {entry.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    {entry.streak > 0 && (
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow-lg"
                        >
                            <Flame className="h-3 w-3" />
                        </motion.div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                            {entry.name}
                        </h3>
                        {isCurrentUser && (
                            <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-semibold text-white">
                                You
                            </span>
                        )}
                    </div>
                    {entry.nim && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {entry.nim}
                        </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                        <div className="flex items-center gap-1 rounded-full bg-white/50 dark:bg-slate-800/50 px-2 py-1 text-xs">
                            <Zap className="h-3 w-3 text-yellow-500" />
                            <span className="font-semibold">{entry.points}</span>
                            <span className="text-slate-500">pts</span>
                        </div>
                        {entry.streak > 0 && (
                            <div className="flex items-center gap-1 rounded-full bg-orange-500/20 px-2 py-1 text-xs">
                                <Flame className="h-3 w-3 text-orange-500" />
                                <span className="font-semibold text-orange-700 dark:text-orange-300">
                                    {entry.streak} days
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs">
                            <Award className="h-3 w-3 text-emerald-500" />
                            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                                {entry.badges_count}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Attendance Rate */}
                <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {entry.attendance_rate}%
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        Attendance
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200/50 dark:bg-slate-700/50">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${entry.attendance_rate}%` }}
                    transition={{ duration: 1, delay: index * 0.05 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
            </div>
        </motion.div>
    );
}
