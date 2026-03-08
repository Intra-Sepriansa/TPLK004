import { Head, usePage, router } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Flame, Star, Zap, Award, Trophy, Crown, CheckCircle, Footprints,
    ScanFace, Wallet, ClipboardCheck, Users, Rocket, Sparkles, Target, TrendingUp,
    ChevronRight, Eye, ArrowLeft, type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import pencapaianIcon from '@/assets/mahasiswa/pencapaian/pencapaian.png';

interface Achievement {
    id: number;
    type: string;
    name: string;
    description: string;
    requirement: string;
    progress: number;
    target: number;
    unlocked: boolean;
    completed: boolean;
    claimable: boolean;
    unlockedAt?: string;
    points: number;
    level: number;
    maxLevel: number;
    icon: string;
    color: string;
}

interface PageProps {
    mahasiswa: { nama: string; nim: string };
    achievements: Achievement[];
    totalPoints: number;
    level: number;
    nextLevelPoints: number;
    rank?: number;
    totalStudents?: number;
}

const achievementIcons: Record<string, LucideIcon> = {
    streak_master: Flame,
    perfect_attendance: Star,
    early_bird: Zap,
    consistent: Award,
    champion: Trophy,
    legend: Crown,
    first_step: Footprints,
    ai_verified: ScanFace,
    kas_hero: Wallet,
    task_master: ClipboardCheck,
    social_star: Users,
    speed_demon: Rocket,
};

const getBadgeImagePath = (icon: string | undefined, type: string, level: number): string => {
    if (icon) {
        return `/images/badges/${icon}`;
    }
    const suffix = level > 1 ? `_${level}` : '';
    return `/images/badges/${type}${suffix}.png`;
};

// Advanced Badge Image Component - Shows blurred image for locked (NO lock icon)
const BadgeImage = ({
    type, level, unlocked, className, isHovered, icon, size = 'md'
}: {
    type: string; level: number; unlocked: boolean;
    className?: string; isHovered?: boolean; icon?: string; size?: 'sm' | 'md' | 'lg';
}) => {
    const [imageError, setImageError] = useState(false);
    const Icon = achievementIcons[type] || Award;
    const imagePath = getBadgeImagePath(icon, type, level);
    const isUnlockedOrCompleted = unlocked;

    const sizeClasses = {
        sm: 'h-12 w-12',
        md: 'h-16 w-16',
        lg: 'h-20 w-20',
    };

    if (imageError) {
        return (
            <div className={cn(
                sizeClasses[size],
                "flex items-center justify-center rounded-full transition-all duration-500",
                isUnlockedOrCompleted
                    ? "bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30"
                    : "bg-neutral-200/80 dark:bg-neutral-700/80",
                isHovered && "scale-110",
                className
            )}>
                <Icon className={cn(
                    size === 'lg' ? 'h-10 w-10' : size === 'md' ? 'h-8 w-8' : 'h-6 w-6',
                    isUnlockedOrCompleted ? "text-amber-600" : "text-neutral-400 opacity-50",
                    isHovered && isUnlockedOrCompleted && "animate-bounce"
                )} />
            </div>
        );
    }

    return (
        <div className={cn(sizeClasses[size], "relative group/badge", className)}>
            <img
                src={imagePath}
                alt={type}
                className={cn(
                    "h-full w-full object-contain rounded-full transition-all duration-500",
                    !isUnlockedOrCompleted && "grayscale blur-[2px] opacity-40",
                    !isUnlockedOrCompleted && isHovered && "grayscale-[50%] blur-[1px] opacity-60",
                    isUnlockedOrCompleted && isHovered && "scale-110 rotate-6",
                    isUnlockedOrCompleted && "drop-shadow-lg"
                )}
                onError={() => setImageError(true)}
            />
            {/* Glow effect for unlocked */}
            {isUnlockedOrCompleted && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 animate-pulse pointer-events-none" />
            )}
            {/* Hover reveal hint for locked */}
            {!isUnlockedOrCompleted && isHovered && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-[1px]">
                    <Eye className="h-4 w-4 text-white/80 animate-pulse" />
                </div>
            )}
        </div>
    );
};

export default function Achievements() {
    const { props } = usePage<{ props: PageProps }>();
    const {
        achievements = [],
        totalPoints = 0,
        level = 1,
        nextLevelPoints = 100,
        rank,
        totalStudents,
    } = props as unknown as PageProps;

    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
    const [claimingId, setClaimingId] = useState<number | null>(null);
    const [justClaimedType, setJustClaimedType] = useState<string | null>(null);

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const claimableCount = achievements.filter(a => a.claimable).length;
    const levelProgress = nextLevelPoints > 0 ? (totalPoints % nextLevelPoints) / nextLevelPoints * 100 : 0;

    const filteredAchievements = achievements.filter(a => {
        const isUnlocked = a.unlocked;
        if (selectedFilter === 'unlocked') return isUnlocked;
        if (selectedFilter === 'locked') return !isUnlocked;
        return true;
    });

    const playClaimSound = () => {
        if (typeof window === 'undefined') return;
        const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;

        try {
            const ctx = new AudioCtx();
            const now = ctx.currentTime;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
            gain.connect(ctx.destination);

            const osc1 = ctx.createOscillator();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(880, now);
            osc1.frequency.linearRampToValueAtTime(1174, now + 0.15);
            osc1.connect(gain);
            osc1.start(now);
            osc1.stop(now + 0.16);

            const osc2 = ctx.createOscillator();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(1318, now + 0.12);
            osc2.frequency.linearRampToValueAtTime(1567, now + 0.32);
            osc2.connect(gain);
            osc2.start(now + 0.12);
            osc2.stop(now + 0.34);
        } catch {
            // Ignore audio errors, visual feedback still shown.
        }
    };

    const handleClaimBadge = (achievement: Achievement) => {
        if (!achievement.claimable || claimingId !== null) return;

        setClaimingId(achievement.id);
        router.post(`/user/achievements/${achievement.id}/claim`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setJustClaimedType(achievement.type);
                playClaimSound();
                window.setTimeout(() => setJustClaimedType(null), 1600);
            },
            onFinish: () => setClaimingId(null),
        });
    };

    const getLevelName = (lvl: number) => {
        if (lvl < 5) return 'Pemula';
        if (lvl < 10) return 'Rajin';
        if (lvl < 20) return 'Expert';
        return 'Master';
    };

    return (
        <StudentLayout>
            <Head title="Pencapaian" />
            <div className="p-4 md:p-6 space-y-6">
                {/* Hero Header with Advanced Animations */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    className="relative overflow-hidden rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-2xl"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10">


                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex w-full flex-col sm:w-auto sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
                                <motion.div
                                    className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={pencapaianIcon}
                                        alt="Pencapaian"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-indigo-100 font-medium tracking-wide"
                                    >
                                        Gamification
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-2xl sm:text-3xl font-bold"
                                    >
                                        Pencapaian Saya
                                    </motion.h1>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                        className="mt-3"
                                    >
                                        <button
                                            onClick={() => router.get('/user/leaderboard')}
                                            className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-md ring-1 ring-white/30 transition-all hover:bg-white/30 hover:scale-105 active:scale-95"
                                        >
                                            <Trophy className="h-4 w-4 text-amber-300" />
                                            Lihat Leaderboard
                                        </button>
                                    </motion.div>
                                </div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                                whileHover={{ scale: 1.05 }}
                                className="w-full sm:w-auto flex flex-col items-center sm:items-end gap-2"
                            >
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                                    <Trophy className="h-5 w-5" />
                                    <span className="font-bold text-lg">
                                        <AnimatedCounter value={unlockedCount} />
                                    </span>
                                    <span className="text-sm text-white/80">/ {achievements.length}</span>
                                </div>
                                {claimableCount > 0 && (
                                    <div className="inline-flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                        <span><AnimatedCounter value={claimableCount} /> badge siap diklaim</span>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-indigo-100 text-base sm:text-lg text-center sm:text-left"
                        >
                            Kumpulkan badge dan tingkatkan level kamu.
                        </motion.p>

                        {/* Quick Stats Grid with Staggered Animation */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                            {[
                                { icon: Star, label: 'Total Poin', value: totalPoints, isCounter: true, delay: 0.1 },
                                { icon: Target, label: 'Level', value: level, suffix: ` - ${getLevelName(level)}`, delay: 0.15 },
                                { icon: Award, label: 'Badge', value: unlockedCount, delay: 0.2 },
                                { icon: TrendingUp, label: 'Ranking', value: rank ? `#${rank}` : '-', delay: 0.25 },
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
                                    className="group bg-white/10 backdrop-blur-sm rounded-xl p-2.5 sm:p-3 md:p-4 cursor-pointer ring-1 ring-white/10 min-h-[88px] sm:min-h-[96px]"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <motion.div
                                            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <stat.icon className="h-4 w-4 text-amber-200" />
                                        </motion.div>
                                        <p className="text-indigo-100 text-[11px] sm:text-xs font-medium leading-tight">{stat.label}</p>
                                    </div>
                                    <p className="text-base sm:text-lg md:text-2xl font-bold leading-tight">
                                        {stat.isCounter ? <AnimatedCounter value={stat.value as number} /> : stat.value}
                                        {stat.suffix && <span className="block sm:inline text-[11px] sm:text-sm font-normal text-white/70 sm:ml-1">{stat.suffix}</span>}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Level Progress Card with Advanced Animations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                >
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        {/* Trophy Display with Pulsing Glow */}
                        <div className="relative">
                            <motion.div
                                animate={{
                                    opacity: [0.3, 0.6, 0.3],
                                    scale: [1, 1.2, 1],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute inset-0 bg-gradient-to-r from-amber-500/30 to-orange-500/30 blur-3xl rounded-full"
                            />
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                                whileHover={{
                                    scale: 1.1,
                                    rotate: [0, -10, 10, -10, 0],
                                    transition: { duration: 0.5 }
                                }}
                                className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl shadow-amber-500/40 ring-4 ring-amber-400/30 cursor-pointer"
                            >
                                <Trophy className="h-14 w-14 text-white" />
                            </motion.div>
                        </div>

                        {/* Level Info */}
                        <div className="flex-1 min-w-[280px]">
                            <div className="mb-4">
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="text-neutral-400 text-sm"
                                    >
                                        Level Saat Ini
                                    </motion.p>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="text-xl font-bold text-neutral-900 dark:text-white"
                                    >
                                        {getLevelName(level)}
                                    </motion.p>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 }}
                                        className="text-sm text-neutral-400"
                                    >
                                        <AnimatedCounter value={totalPoints} /> poin total
                                    </motion.p>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                className="space-y-2"
                            >
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">Progress ke Level {level + 1}</span>
                                    <span className="text-amber-400 font-medium">
                                        <AnimatedCounter value={totalPoints % nextLevelPoints} /> / {nextLevelPoints}
                                    </span>
                                </div>
                                <div className="relative h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${levelProgress}%` }}
                                        transition={{ duration: 1, delay: 1, ease: "easeOut" }}
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                    />
                                    <motion.div
                                        animate={{
                                            x: ['-100%', '100%']
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                        className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                        style={{ width: `${levelProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-neutral-500">
                                    <AnimatedCounter value={Math.round(nextLevelPoints - (totalPoints % nextLevelPoints))} /> poin lagi untuk naik level
                                </p>
                            </motion.div>
                        </div>

                        {/* Rank Display */}
                        {rank && totalStudents && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <motion.div
                                    whileHover={{
                                        rotate: [0, -10, 10, -10, 0],
                                        transition: { duration: 0.5 }
                                    }}
                                    className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-900 to-black shadow-xl shadow-violet-500/40 ring-4 ring-violet-400/30 cursor-pointer"
                                >
                                    <Crown className="h-10 w-10 text-white" />
                                </motion.div>
                                <div className="text-center px-4 py-2 bg-white/60 dark:bg-neutral-800/60 rounded-xl backdrop-blur">
                                    <p className="text-neutral-400 text-xs">Peringkat</p>
                                    <p className="text-2xl font-bold text-amber-400">
                                        #<AnimatedCounter value={rank} />
                                    </p>
                                    <p className="text-xs text-neutral-500">dari {totalStudents} mahasiswa</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Badge Collection with Advanced Animations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                >
                    {/* Header with Filter */}
                    <div className="p-4 sm:p-6 border-b border-white/10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30">
                                    <Award className="h-5 w-5" />
                                </div>
                                <div>
                                    <motion.h2
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="text-lg font-semibold text-neutral-900 dark:text-white"
                                    >
                                        Koleksi Badge
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="text-sm text-neutral-500 dark:text-neutral-400"
                                    >
                                        <AnimatedCounter value={unlockedCount} /> dari {achievements.length} badge terbuka
                                    </motion.p>
                                </div>
                            </div>

                            {/* Filter Tabs with Animation */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8 }}
                                className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/40 p-1 backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                            >
                                {([
                                    { key: 'all', label: 'Semua', count: achievements.length },
                                    { key: 'unlocked', label: 'Terbuka', count: unlockedCount },
                                    { key: 'locked', label: 'Terkunci', count: achievements.length - unlockedCount },
                                ] as const).map((filter, index) => (
                                    <motion.button
                                        key={filter.key}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.9 + index * 0.05 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedFilter(filter.key)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                            selectedFilter === filter.key
                                                ? "bg-white/90 dark:bg-neutral-800/80 text-neutral-900 dark:text-white shadow-sm"
                                                : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                                        )}
                                    >
                                        {filter.label} ({filter.count})
                                    </motion.button>
                                ))}
                            </motion.div>
                        </div>
                    </div>

                    {/* Badge Grid with Staggered Animations */}
                    <div className="p-4">
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            <AnimatePresence mode="popLayout">
                                {filteredAchievements.map((achievement, index) => {
                                    const progressPercent = achievement.target > 0
                                        ? Math.min((achievement.progress / achievement.target) * 100, 100)
                                        : 0;
                                    const isCompleted = achievement.completed ?? achievement.progress >= achievement.target;
                                    const isUnlocked = achievement.unlocked;
                                    const isClaimable = achievement.claimable ?? (isCompleted && !isUnlocked);
                                    const isHovered = hoveredCard === achievement.id;
                                    const isJustClaimed = justClaimedType === achievement.type;

                                    return (
                                        <motion.div
                                            key={achievement.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                            transition={{
                                                delay: index * 0.05,
                                                type: "spring",
                                                stiffness: 200,
                                                damping: 15
                                            }}
                                            whileHover={{
                                                scale: 1.02,
                                                y: -5,
                                                transition: { type: "spring", stiffness: 400, damping: 10 }
                                            }}
                                            onClick={() => router.get(`/user/achievements/${achievement.type}`)}
                                            onMouseEnter={() => setHoveredCard(achievement.id)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                            className={cn(
                                                'relative cursor-pointer overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40',
                                                isUnlocked && 'ring-2 ring-amber-400/30',
                                                isClaimable && !isUnlocked && 'ring-2 ring-red-400/40',
                                                isJustClaimed && 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900'
                                            )}
                                        >
                                            {isClaimable && (
                                                <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                                            )}

                                            {/* Animated Background for Unlocked */}
                                            {isUnlocked && (
                                                <>
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: isHovered ? 1 : 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-orange-400/10"
                                                    />
                                                </>
                                            )}

                                            {isJustClaimed && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: [0, 0.35, 0] }}
                                                    transition={{ duration: 1.2 }}
                                                    className="absolute inset-0 bg-emerald-400/30 pointer-events-none"
                                                />
                                            )}

                                            <div className="relative">
                                                {/* Badge Header */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <BadgeImage
                                                        type={achievement.type}
                                                        level={achievement.level}
                                                        unlocked={achievement.unlocked}
                                                        isHovered={isHovered}
                                                        icon={achievement.icon}
                                                        size="lg"
                                                    />
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        {isUnlocked && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                                                                className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium dark:bg-emerald-900/40 dark:text-emerald-400"
                                                            >
                                                                <CheckCircle className="h-3 w-3" />
                                                                Unlocked
                                                            </motion.div>
                                                        )}
                                                        {isClaimable && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                                                                className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium dark:bg-red-900/40 dark:text-red-400"
                                                            >
                                                                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                                                Siap Diklaim
                                                            </motion.div>
                                                        )}
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
                                                            className="flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-medium dark:bg-neutral-800 dark:text-neutral-400"
                                                        >
                                                            Lv {achievement.level}/{achievement.maxLevel}
                                                        </motion.div>
                                                    </div>
                                                </div>

                                                {/* Badge Info */}
                                                <motion.h3
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.4 }}
                                                    className={cn(
                                                        'font-bold text-base transition-colors duration-300 mb-1',
                                                        isUnlocked
                                                            ? 'text-amber-900 dark:text-amber-100'
                                                            : 'text-neutral-700 dark:text-neutral-300',
                                                        isHovered && isUnlocked && 'text-amber-600 dark:text-amber-400'
                                                    )}
                                                >
                                                    {achievement.name}
                                                </motion.h3>
                                                <p className={cn(
                                                    "text-xs mt-1 line-clamp-2",
                                                    isUnlocked ? "text-amber-700/70 dark:text-amber-200/70" : "text-neutral-500"
                                                )}>
                                                    {achievement.description}
                                                </p>

                                                {/* Progress Section */}
                                                <div className="mt-3 pt-3 border-t border-neutral-200/50 dark:border-neutral-700/50">
                                                    <div className="flex justify-between text-xs mb-1.5">
                                                        <span className="text-neutral-500 truncate max-w-[65%]">{achievement.requirement}</span>
                                                        <span className={cn(
                                                            'font-bold',
                                                            isUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-600 dark:text-neutral-400'
                                                        )}>
                                                            <AnimatedCounter value={achievement.progress} />/<AnimatedCounter value={achievement.target} />
                                                        </span>
                                                    </div>
                                                    <div className="relative h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progressPercent}%` }}
                                                            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                                                            className={cn(
                                                                "h-full rounded-full",
                                                                isUnlocked
                                                                    ? "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500"
                                                                    : "bg-gradient-to-r from-neutral-400 to-neutral-500"
                                                            )}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="mt-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <motion.div
                                                            animate={isHovered ? { rotate: 360 } : {}}
                                                            transition={{ duration: 2 }}
                                                        >
                                                            <Star className={cn(
                                                                "h-4 w-4",
                                                                isUnlocked ? "text-amber-500" : "text-neutral-400"
                                                            )} />
                                                        </motion.div>
                                                        <span className={cn(
                                                            "font-bold text-sm",
                                                            isUnlocked ? "text-amber-600 dark:text-amber-400" : "text-neutral-500"
                                                        )}>
                                                            <AnimatedCounter value={achievement.points} />
                                                        </span>
                                                        <span className="text-xs text-neutral-400">poin</span>
                                                    </div>
                                                    <motion.div
                                                        animate={isHovered ? { x: 5 } : { x: 0 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                    >
                                                        {isClaimable ? (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleClaimBadge(achievement);
                                                                }}
                                                                disabled={claimingId === achievement.id}
                                                                className={cn(
                                                                    "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                                                                    claimingId === achievement.id
                                                                        ? "bg-red-300 text-white cursor-not-allowed"
                                                                        : "bg-red-500 text-white hover:bg-red-600"
                                                                )}
                                                            >
                                                                {claimingId === achievement.id ? 'Mengklaim...' : 'Klaim'}
                                                            </button>
                                                        ) : (
                                                            <ChevronRight className={cn(
                                                                "h-4 w-4",
                                                                isUnlocked ? "text-amber-500" : "text-neutral-400"
                                                            )} />
                                                        )}
                                                    </motion.div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>

                {/* Tips Section with Advanced Animations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-500/30">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="text-lg font-semibold text-neutral-900 dark:text-white"
                        >
                            Tips Mendapatkan Badge
                        </motion.h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { icon: Flame, color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30', text: 'Hadir setiap hari untuk membangun streak', delay: 0.1 },
                            { icon: Zap, color: 'text-sky-500 bg-sky-100 dark:bg-sky-900/30', text: 'Datang tepat waktu untuk Early Bird', delay: 0.15 },
                            { icon: Star, color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30', text: 'Pertahankan kehadiran 100%', delay: 0.2 },
                            { icon: Trophy, color: 'text-violet-500 bg-violet-100 dark:bg-violet-900/30', text: 'Bersaing untuk masuk top ranking', delay: 0.25 },
                            { icon: Wallet, color: 'text-green-500 bg-green-100 dark:bg-green-900/30', text: 'Bayar kas tepat waktu', delay: 0.3 },
                            { icon: Rocket, color: 'text-red-500 bg-red-100 dark:bg-red-900/30', text: 'Absen dalam 1 menit pertama', delay: 0.35 },
                        ].map((tip, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + tip.delay, type: "spring", stiffness: 200 }}
                                whileHover={{
                                    scale: 1.02,
                                    x: 5,
                                    transition: { type: "spring", stiffness: 400, damping: 10 }
                                }}
                                className="flex items-start gap-3 p-3 rounded-xl bg-white/60 dark:bg-neutral-800/60 cursor-pointer group border border-white/20 dark:border-white/5"
                            >
                                <motion.div
                                    whileHover={{
                                        scale: 1.1,
                                        rotate: 12,
                                        transition: { type: "spring", stiffness: 400, damping: 10 }
                                    }}
                                    className={cn("p-2 rounded-lg shrink-0", tip.color)}
                                >
                                    <tip.icon className="h-4 w-4" />
                                </motion.div>
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">{tip.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </StudentLayout>
    );
}
