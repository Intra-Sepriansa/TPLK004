import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, Flame, TrendingUp, Trophy, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress: number;
    total: number;
}

interface GamificationRewardsProps {
    xpGained: number;
    currentStreak: number;
    achievements: Achievement[];
    leaderboardPosition: number;
    comboMultiplier: number;
}

export function GamificationRewards({
    xpGained,
    currentStreak,
    achievements,
    leaderboardPosition,
    comboMultiplier,
}: GamificationRewardsProps) {
    const [showXPAnimation, setShowXPAnimation] = useState(false);
    const [showAchievement, setShowAchievement] = useState<Achievement | null>(
        null,
    );

    useEffect(() => {
        if (xpGained > 0) {
            setShowXPAnimation(true);
            setTimeout(() => setShowXPAnimation(false), 3000);
        }
    }, [xpGained]);

    useEffect(() => {
        const newAch = achievements.find(
            (a) => a.unlocked && a.progress === a.total,
        );
        if (newAch) {
            setShowAchievement(newAch);
            setTimeout(() => setShowAchievement(null), 5000);
        }
    }, [achievements]);

    return (
        <div className="space-y-4">
            {/* XP Gain Animation */}
            <AnimatePresence>
                {showXPAnimation && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.5 }}
                        className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 5, -5, 0],
                            }}
                            transition={{ duration: 0.5, repeat: 2 }}
                            className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-4 text-white shadow-2xl"
                        >
                            <div className="flex items-center gap-3">
                                <Zap className="h-6 w-6" />
                                <div>
                                    <p className="text-2xl font-bold">
                                        +{xpGained} XP
                                    </p>
                                    {comboMultiplier > 1 && (
                                        <p className="text-sm">
                                            Combo x{comboMultiplier}!
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Achievement Unlock */}
            <AnimatePresence>
                {showAchievement && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -100 }}
                        className="fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4"
                    >
                        <div className="rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 p-6 shadow-2xl">
                            <div className="text-center text-white">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        duration: 1,
                                        ease: 'easeInOut',
                                    }}
                                    className="mx-auto mb-4 h-20 w-20"
                                >
                                    <Award className="h-full w-full" />
                                </motion.div>
                                <h3 className="mb-2 text-2xl font-bold">
                                    Achievement Unlocked!
                                </h3>
                                <p className="mb-1 text-xl font-semibold">
                                    {showAchievement.name}
                                </p>
                                <p className="text-sm opacity-90">
                                    {showAchievement.description}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Streak Counter */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Flame className="h-12 w-12" />
                        </motion.div>
                        <div>
                            <p className="text-sm opacity-90">Current Streak</p>
                            <p className="text-4xl font-bold">
                                {currentStreak}
                            </p>
                            <p className="text-xs opacity-75">
                                hari berturut-turut
                            </p>
                        </div>
                    </div>
                    {comboMultiplier > 1 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm"
                        >
                            <p className="text-2xl font-bold">
                                x{comboMultiplier}
                            </p>
                            <p className="text-xs">Combo!</p>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Leaderboard Position */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Peringkat Kelas
                            </p>
                            <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                                #{leaderboardPosition}
                            </p>
                        </div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
            </motion.div>

            {/* Achievements Grid */}
            <div>
                <h3 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
                    Achievements
                </h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {achievements.map((achievement) => (
                        <motion.div
                            key={achievement.id}
                            whileHover={{ scale: 1.05, y: -4 }}
                            className={cn(
                                'rounded-xl border-2 p-4 transition-all',
                                achievement.unlocked
                                    ? 'border-yellow-500 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30'
                                    : 'border-neutral-300 bg-neutral-100 opacity-50 dark:border-neutral-700 dark:bg-neutral-800',
                            )}
                        >
                            <div className="text-center">
                                <div className="mb-2 text-3xl">
                                    {achievement.icon}
                                </div>
                                <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                                    {achievement.name}
                                </p>
                                {!achievement.unlocked && (
                                    <div className="mt-2">
                                        <div className="h-1 overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-700">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${(achievement.progress / achievement.total) * 100}%`,
                                                }}
                                                className="h-full bg-emerald-500"
                                            />
                                        </div>
                                        <p className="mt-1 text-[10px] text-neutral-600 dark:text-neutral-400">
                                            {achievement.progress}/
                                            {achievement.total}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
