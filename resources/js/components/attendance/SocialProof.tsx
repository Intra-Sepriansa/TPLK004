import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Award, Zap, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SocialProofProps {
    totalStudents?: number
    attendedCount?: number
    isFirstAttendee?: boolean
    recentAttendees?: string[]
    leaderboard?: Array<{ rank: number; name: string; streak: number; points: number }>
}

export function SocialProof({
    totalStudents = 40,
    attendedCount = 0,
    isFirstAttendee = false,
    recentAttendees = [],
    leaderboard = [],
}: SocialProofProps) {
    const percentage = totalStudents > 0 ? (attendedCount / totalStudents) * 100 : 0
    const [animatedCount, setAnimatedCount] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedCount(attendedCount), 300)
        return () => clearTimeout(timer)
    }, [attendedCount])

    return (
        <div className="space-y-4">
            {/* Real-time Counter */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm opacity-90 mb-1">Teman yang Sudah Absen</p>
                        <motion.div key={animatedCount} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold">{animatedCount}</span>
                            <span className="text-2xl opacity-75">/ {totalStudents}</span>
                        </motion.div>
                    </div>
                    <Users className="w-16 h-16 opacity-50" />
                </div>
                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span>Kehadiran Kelas</span>
                        <span className="font-bold">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} className="h-full bg-white rounded-full" />
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
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white"
                    >
                        <div className="flex items-center gap-4">
                            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                                <Crown className="w-12 h-12" />
                            </motion.div>
                            <div>
                                <h3 className="text-xl font-bold mb-1">🎉 Kamu yang Pertama!</h3>
                                <p className="text-sm opacity-90">Bonus +50 XP untuk early bird!</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recent Attendees */}
            {recentAttendees.length > 0 && (
                <div className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-white/5 shadow-xl">
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Baru Saja Absen
                    </h3>
                    <div className="space-y-2">
                        {recentAttendees.slice(0, 5).map((name, index) => (
                            <motion.div
                                key={name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-3 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {name.charAt(0)}
                                </div>
                                <span className="text-sm text-neutral-900 dark:text-white">{name}</span>
                                <span className="ml-auto text-xs text-neutral-500">Baru saja</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
                <div className="bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-white/5 shadow-xl">
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-500" />
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
                                    "flex items-center gap-4 p-4 rounded-lg",
                                    index === 0 && "bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30",
                                    index === 1 && "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700",
                                    index === 2 && "bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30",
                                    index > 2 && "bg-neutral-100 dark:bg-neutral-800"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                    index === 0 && "bg-yellow-500 text-white",
                                    index === 1 && "bg-gray-400 text-white",
                                    index === 2 && "bg-orange-500 text-white",
                                    index > 2 && "bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                                )}>
                                    {entry.rank}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-neutral-900 dark:text-white">{entry.name}</p>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">🔥 {entry.streak} hari streak</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-neutral-900 dark:text-white">{entry.points}</p>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400">XP</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Motivation */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800"
            >
                <p className="text-sm text-emerald-900 dark:text-emerald-100 text-center">
                    {percentage < 50 ? "💪 Ayo absen sekarang! Jangan sampai ketinggalan!" :
                        percentage < 80 ? "🎯 Kelas sudah ramai! Buruan absen!" :
                            "🔥 Hampir semua sudah hadir! Kamu yang terakhir?"}
                </p>
            </motion.div>
        </div>
    )
}
