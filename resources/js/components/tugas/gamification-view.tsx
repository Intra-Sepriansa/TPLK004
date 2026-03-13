import { motion } from 'framer-motion';
import {
    Award,
    BookOpen,
    CheckCircle,
    Crown,
    Eye,
    GraduationCap,
    Lock,
    Medal,
    Sparkles,
    Star,
    TrendingUp,
    Trophy,
    type LucideIcon,
} from 'lucide-react';
import { useMemo } from 'react';

interface Tugas {
    id: number;
    judul: string;
    deskripsi: string;
    jenis: string;
    deadline: string;
    deadline_display: string;
    prioritas: string;
    course: { id: number; nama: string; dosen: string | null };
    created_by: string;
    is_overdue: boolean;
    days_until_deadline: number;
    is_read: boolean;
    diskusi_count: number;
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    points: number;
    unlocked: boolean;
    progress: number;
    total: number;
}

const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-amber-400 to-amber-600',
};

const rarityGlow = {
    common: 'shadow-gray-500/20',
    rare: 'shadow-blue-500/30',
    epic: 'shadow-purple-500/40',
    legendary: 'shadow-amber-500/50',
};

export default function GamificationView({
    tugasList,
    stats,
}: {
    tugasList: Tugas[];
    stats: { total: number; upcoming: number; overdue: number; unread: number };
}) {
    const gameData = useMemo(() => {
        const readCount = tugasList.filter((t) => t.is_read).length;
        const onTrackCount = stats.total - stats.overdue;
        const points =
            readCount * 10 +
            onTrackCount * 15 +
            (stats.total - stats.unread) * 5;
        const level = Math.floor(points / 200) + 1;
        const pointsInLevel = points % 200;
        const readRate =
            stats.total > 0 ? Math.round((readCount / stats.total) * 100) : 0;
        const onTrackRate =
            stats.total > 0
                ? Math.round((onTrackCount / stats.total) * 100)
                : 0;
        const courses = new Set(tugasList.map((t) => t.course.nama)).size;

        const achievements: Achievement[] = [
            {
                id: 'first_read',
                title: 'Pembaca Pertama',
                description: 'Baca tugas pertama',
                icon: BookOpen,
                rarity: 'common',
                points: 10,
                unlocked: readCount >= 1,
                progress: Math.min(readCount, 1),
                total: 1,
            },
            {
                id: 'reader_5',
                title: 'Rajin Membaca',
                description: 'Baca 5 tugas',
                icon: Eye,
                rarity: 'common',
                points: 25,
                unlocked: readCount >= 5,
                progress: Math.min(readCount, 5),
                total: 5,
            },
            {
                id: 'reader_all',
                title: 'Pembaca Sempurna',
                description: 'Baca semua tugas',
                icon: Medal,
                rarity: 'rare',
                points: 50,
                unlocked: readCount === stats.total && stats.total > 0,
                progress: readCount,
                total: stats.total,
            },
            {
                id: 'no_overdue',
                title: 'Tanpa Overdue',
                description: '0 tugas terlewat',
                icon: CheckCircle,
                rarity: 'rare',
                points: 75,
                unlocked: stats.overdue === 0 && stats.total > 0,
                progress: stats.overdue === 0 ? 1 : 0,
                total: 1,
            },
            {
                id: 'multi_course',
                title: 'Multi Talent',
                description: 'Tugas dari 3+ mata kuliah',
                icon: GraduationCap,
                rarity: 'epic',
                points: 100,
                unlocked: courses >= 3,
                progress: Math.min(courses, 3),
                total: 3,
            },
            {
                id: 'on_track_90',
                title: 'Superstar',
                description: '90%+ tugas on-track',
                icon: Star,
                rarity: 'epic',
                points: 150,
                unlocked: onTrackRate >= 90 && stats.total > 3,
                progress: Math.min(onTrackRate, 90),
                total: 90,
            },
            {
                id: 'level_5',
                title: 'Master Student',
                description: 'Capai Level 5',
                icon: Crown,
                rarity: 'legendary',
                points: 200,
                unlocked: level >= 5,
                progress: Math.min(level, 5),
                total: 5,
            },
            {
                id: 'total_10',
                title: 'Heavy Loader',
                description: 'Punya 10+ tugas',
                icon: Trophy,
                rarity: 'rare',
                points: 50,
                unlocked: stats.total >= 10,
                progress: Math.min(stats.total, 10),
                total: 10,
            },
        ];

        const unlockedCount = achievements.filter((a) => a.unlocked).length;
        return {
            points,
            level,
            pointsInLevel,
            readRate,
            onTrackRate,
            achievements,
            unlockedCount,
            readCount,
        };
    }, [tugasList, stats]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Level & Progress */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
            >
                <motion.div
                    animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        repeatType: 'reverse',
                    }}
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, rgba(99,102,241,0.4) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                    }}
                />
                <div className="relative z-10">
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="relative"
                            >
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white shadow-lg">
                                    {gameData.level}
                                </div>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500"
                                />
                            </motion.div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    Level {gameData.level}
                                </h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {gameData.points} total points
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400">
                                Progress ke Level {gameData.level + 1}
                            </span>
                            <span className="font-bold text-neutral-900 dark:text-white">
                                {200 - gameData.pointsInLevel} pts lagi
                            </span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${(gameData.pointsInLevel / 200) * 100}%`,
                                }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                            >
                                <motion.div
                                    animate={{ x: ['-100%', '100%'] }}
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
                    {/* Quick Stats */}
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:border-emerald-800 dark:from-emerald-900/20 dark:to-teal-900/20"
                        >
                            <div className="mb-2 flex items-center gap-2">
                                <div className="rounded-lg bg-emerald-500/15 p-1.5">
                                    <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                    On-Track Rate
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">
                                {gameData.onTrackRate}%
                            </p>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20"
                        >
                            <div className="mb-2 flex items-center gap-2">
                                <div className="rounded-lg bg-blue-500/15 p-1.5">
                                    <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                                    Read Rate
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                                {gameData.readRate}%
                            </p>
                        </motion.div>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:border-amber-800 dark:from-amber-900/20 dark:to-orange-900/20"
                        >
                            <div className="mb-2 flex items-center gap-2">
                                <div className="rounded-lg bg-amber-500/15 p-1.5">
                                    <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                    Achievements
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-amber-900 dark:text-amber-300">
                                {gameData.unlockedCount}/
                                {gameData.achievements.length}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Achievements Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
            >
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-3 text-white">
                        <Award className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                            Achievements
                        </h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {gameData.unlockedCount} /{' '}
                            {gameData.achievements.length} unlocked
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {gameData.achievements.map((a, i) => (
                        <motion.div
                            key={a.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className={`relative cursor-pointer rounded-2xl p-4 transition-all ${
                                a.unlocked
                                    ? `bg-gradient-to-br ${rarityColors[a.rarity]} text-white shadow-xl ${rarityGlow[a.rarity]}`
                                    : 'bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600'
                            }`}
                        >
                            {a.unlocked && (
                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                    }}
                                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"
                                />
                            )}
                            <div className="relative z-10">
                                <div className="mb-2 flex justify-center">
                                    {a.unlocked ? (
                                        <a.icon className="h-8 w-8" />
                                    ) : (
                                        <Lock className="h-7 w-7" />
                                    )}
                                </div>
                                <h4 className="mb-1 text-center text-xs font-bold">
                                    {a.title}
                                </h4>
                                <p
                                    className={`mb-2 text-center text-[10px] ${a.unlocked ? 'opacity-90' : 'opacity-60'}`}
                                >
                                    {a.description}
                                </p>
                                {!a.unlocked && a.progress > 0 && (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span>Progress</span>
                                            <span>
                                                {a.progress}/{a.total}
                                            </span>
                                        </div>
                                        <div className="h-1 overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-700">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${(a.progress / a.total) * 100}%`,
                                                }}
                                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="mt-2 text-center">
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${a.unlocked ? 'bg-white/20' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                                    >
                                        <Sparkles className="h-2.5 w-2.5" />
                                        {a.points} pts
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
