import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Flame, Zap, Award, TrendingUp } from 'lucide-react'
import confetti from 'canvas-confetti'
import { cn } from '@/lib/utils'

interface Achievement {
    id: string
    name: string
    description: string
    icon: string
    unlocked: boolean
    progress: number
    total: number
}

interface GamificationRewardsProps {
    xpGained: number
    currentStreak: number
    achievements: Achievement[]
    leaderboardPosition: number
    comboMultiplier: number
}

export function GamificationRewards({
    xpGained, currentStreak, achievements, leaderboardPosition, comboMultiplier,
}: GamificationRewardsProps) {
    const [showXPAnimation, setShowXPAnimation] = useState(false)
    const [showAchievement, setShowAchievement] = useState<Achievement | null>(null)

    useEffect(() => {
        if (xpGained > 0) {
            setShowXPAnimation(true)
            if (xpGained >= 100) {
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } })
            }
            setTimeout(() => setShowXPAnimation(false), 3000)
        }
    }, [xpGained])

    useEffect(() => {
        const newAch = achievements.find(a => a.unlocked && a.progress === a.total)
        if (newAch) {
            setShowAchievement(newAch)
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500', '#FF6347'] })
            setTimeout(() => setShowAchievement(null), 5000)
        }
    }, [achievements])

    return (
        <div className="space-y-4">
            {/* XP Gain Animation */}
            <AnimatePresence>
                {showXPAnimation && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.5 }}
                        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 0.5, repeat: 2 }}
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-full shadow-2xl"
                        >
                            <div className="flex items-center gap-3">
                                <Zap className="w-6 h-6" />
                                <div>
                                    <p className="text-2xl font-bold">+{xpGained} XP</p>
                                    {comboMultiplier > 1 && <p className="text-sm">Combo x{comboMultiplier}!</p>}
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
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
                    >
                        <div className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 p-6 rounded-2xl shadow-2xl">
                            <div className="text-center text-white">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, ease: 'easeInOut' }} className="w-20 h-20 mx-auto mb-4">
                                    <Award className="w-full h-full" />
                                </motion.div>
                                <h3 className="text-2xl font-bold mb-2">Achievement Unlocked!</h3>
                                <p className="text-xl font-semibold mb-1">{showAchievement.name}</p>
                                <p className="text-sm opacity-90">{showAchievement.description}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Streak Counter */}
            <motion.div whileHover={{ scale: 1.02 }} className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                            <Flame className="w-12 h-12" />
                        </motion.div>
                        <div>
                            <p className="text-sm opacity-90">Current Streak</p>
                            <p className="text-4xl font-bold">{currentStreak}</p>
                            <p className="text-xs opacity-75">hari berturut-turut</p>
                        </div>
                    </div>
                    {comboMultiplier > 1 && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                            <p className="text-2xl font-bold">x{comboMultiplier}</p>
                            <p className="text-xs">Combo!</p>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Leaderboard Position */}
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-white/5 shadow-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Peringkat Kelas</p>
                            <p className="text-3xl font-bold text-neutral-900 dark:text-white">#{leaderboardPosition}</p>
                        </div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
            </motion.div>

            {/* Achievements Grid */}
            <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">Achievements</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {achievements.map((achievement) => (
                        <motion.div
                            key={achievement.id}
                            whileHover={{ scale: 1.05, y: -4 }}
                            className={cn(
                                "p-4 rounded-xl border-2 transition-all",
                                achievement.unlocked
                                    ? "bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-500"
                                    : "bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 opacity-50"
                            )}
                        >
                            <div className="text-center">
                                <div className="text-3xl mb-2">{achievement.icon}</div>
                                <p className="text-xs font-semibold text-neutral-900 dark:text-white">{achievement.name}</p>
                                {!achievement.unlocked && (
                                    <div className="mt-2">
                                        <div className="h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${(achievement.progress / achievement.total) * 100}%` }} className="h-full bg-emerald-500" />
                                        </div>
                                        <p className="text-[10px] text-neutral-600 dark:text-neutral-400 mt-1">{achievement.progress}/{achievement.total}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
