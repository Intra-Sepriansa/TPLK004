import { Head, router, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import {
    ArrowLeft, CheckCircle, Star, Sparkles, Lightbulb, Trophy, ChevronRight,
    Flame, Zap, Award, Crown, Footprints, ScanFace, Wallet, ClipboardCheck, Users, Rocket, Eye, type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface BadgeLevel {
    id: number;
    level: number;
    name: string;
    description: string;
    requirement: string;
    requirementValue: number;
    points: number;
    unlocked: boolean;
    icon: string;
    color: string;
}

interface HowToEarnStep {
    step: number;
    title: string;
    description: string;
}

interface RelatedBadge {
    type: string;
    name: string;
    icon: string;
    color: string;
    unlocked: boolean;
}

interface PageProps {
    mahasiswa: { nama: string; nim: string };
    badge: {
        type: string;
        name: string;
        description: string;
        icon: string;
        color: string;
        category: string;
        currentLevel: number;
        maxLevel: number;
    };
    levels: BadgeLevel[];
    progress: { current: number; target: number; percentage: number };
    tips: string[];
    howToEarn: HowToEarnStep[];
    relatedBadges: RelatedBadge[];
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

const colorGradients: Record<string, string> = {
    orange: 'from-orange-400 to-red-500',
    emerald: 'from-emerald-400 to-green-500',
    sky: 'from-gray-900 to-black',
    green: 'from-green-400 to-emerald-500',
    amber: 'from-amber-400 to-yellow-500',
    purple: 'from-purple-400 to-violet-500',
    teal: 'from-teal-400 to-cyan-500',
    cyan: 'from-cyan-400 to-blue-500',
    blue: 'from-blue-400 to-indigo-500',
    pink: 'from-pink-400 to-rose-500',
    red: 'from-red-400 to-orange-500',
};

const getBadgeImagePath = (icon: string | undefined, type: string, level: number): string => {
    if (icon) {
        return `/images/badges/${icon}`;
    }
    const suffix = level > 1 ? `_${level}` : '';
    return `/images/badges/${type}${suffix}.png`;
};

// Badge Image Component - Blur for locked, NO lock icon
const BadgeImage = ({
    type, level, unlocked, size = 'lg', showAnimation = true
}: {
    type: string; level: number; unlocked: boolean; size?: 'sm' | 'md' | 'lg' | 'xl'; showAnimation?: boolean;
}) => {
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const Icon = achievementIcons[type] || Award;

    const suffix = level > 1 ? `_${level}` : '';
    const imagePath = `/images/badges/${type}${suffix}.png`;

    const sizeClasses = {
        sm: 'h-12 w-12',
        md: 'h-16 w-16',
        lg: 'h-24 w-24',
        xl: 'h-32 w-32',
    };

    if (imageError) {
        return (
            <div className={cn(
                sizeClasses[size],
                'flex items-center justify-center rounded-full transition-all duration-300',
                unlocked
                    ? 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30'
                    : 'bg-neutral-200/80 dark:bg-neutral-700/80'
            )}>
                <Icon className={cn(
                    size === 'xl' ? 'h-16 w-16' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8',
                    unlocked ? 'text-amber-600' : 'text-neutral-400 opacity-50'
                )} />
            </div>
        );
    }

    return (
        <div
            className={cn(sizeClasses[size], 'relative group cursor-pointer')}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <img
                src={imagePath}
                alt={type}
                className={cn(
                    'h-full w-full object-contain rounded-full transition-all duration-500',
                    !unlocked && 'grayscale blur-[2px] opacity-40',
                    !unlocked && isHovered && 'grayscale-[50%] blur-[1px] opacity-60',
                    unlocked && isHovered && showAnimation && 'scale-110',
                    unlocked && 'drop-shadow-lg'
                )}
                onError={() => setImageError(true)}
            />

            {/* Glow effect for unlocked */}
            {unlocked && showAnimation && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 animate-pulse pointer-events-none" />
            )}

            {/* Hover hint for locked - just eye icon, no lock */}
            {!unlocked && isHovered && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-[1px]">
                    <Eye className={cn(
                        size === 'xl' ? 'h-8 w-8' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4',
                        'text-white/80 animate-pulse'
                    )} />
                </div>
            )}
        </div>
    );
};

export default function BadgeDetail({
    mahasiswa, badge, levels, progress, tips, howToEarn, relatedBadges,
}: PageProps) {
    const [selectedLevel, setSelectedLevel] = useState<number>(badge.currentLevel);

    const gradient = colorGradients[badge.color] || 'from-gray-400 to-gray-500';
    const Icon = achievementIcons[badge.type] || Award;

    const currentLevelData = levels.find(l => l.level === selectedLevel);
    const isCurrentUnlocked = currentLevelData?.unlocked || false;

    return (
        <StudentLayout>
            <Head title={`Badge: ${badge.name}`} />
            <div className="p-4 md:p-6 lg:p-8 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    className="relative overflow-hidden rounded-3xl p-5 sm:p-6 md:p-8 text-white shadow-2xl"
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

                    <div className="relative z-20">
                        <Link href="/user/achievements">
                            <motion.button
                                whileHover={{ x: -4 }}
                                whileTap={{ scale: 0.98 }}
                                className="mb-4 flex items-center gap-2 text-sm font-medium text-indigo-100 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Kembali
                            </motion.button>
                        </Link>

                        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                                className="relative flex h-16 w-16 shrink-0 sm:h-24 sm:w-24"
                            >
                                <img
                                    src={getBadgeImagePath(badge.icon, badge.type, selectedLevel)}
                                    alt={badge.name}
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                />
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.4 }}
                                    className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                                >
                                    <div className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                                        <span>Lv {selectedLevel}</span>
                                        <span className="text-white/70">/ {badge.maxLevel}</span>
                                    </div>
                                </motion.div>
                            </motion.div>

                            <div className="mt-1 w-full flex-1 sm:mt-0">
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-sm text-indigo-100 font-medium tracking-wide uppercase"
                                >
                                    {badge.category}
                                </motion.p>
                                <motion.h1
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="mt-1 text-xl font-bold leading-tight sm:text-3xl"
                                >
                                    {currentLevelData?.name || badge.name}
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-indigo-100 sm:mx-0 sm:max-w-2xl sm:text-base"
                                >
                                    {currentLevelData?.description || badge.description}
                                </motion.p>
                                <p className="mt-2 text-xs text-indigo-100/80 sm:text-sm">
                                    {mahasiswa.nama} ({mahasiswa.nim})
                                </p>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                                    className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2"
                                >
                                    {isCurrentUnlocked && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/30 px-3 py-1 text-xs font-semibold">
                                            <CheckCircle className="h-4 w-4" />
                                            Unlocked
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                                        <Star className="h-4 w-4 text-amber-300" />
                                        <AnimatedCounter value={currentLevelData?.points || 0} /> poin
                                    </span>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Level Selector with Advanced Animations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-4 flex items-center gap-3">
                        <Trophy className="h-5 w-5 shrink-0 text-amber-500" />
                        <div>
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-lg font-semibold text-neutral-900 dark:text-white"
                            >
                                Level Badge
                            </motion.h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Pilih level untuk melihat detail pencapaian
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                        {levels.map((level, index) => (
                            <motion.button
                                key={level.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + index * 0.1, type: "spring", stiffness: 200 }}
                                whileHover={{ scale: 1.03, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedLevel(level.level)}
                                className={cn(
                                    'relative rounded-2xl border border-white/20 bg-white/40 p-2 transition-all duration-300 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 md:p-4',
                                    selectedLevel === level.level && 'ring-2 ring-amber-400/50',
                                    !level.unlocked && 'opacity-70'
                                )}
                            >
                                <div className="flex flex-col items-center gap-1.5 md:gap-3">
                                    <BadgeImage
                                        type={badge.type}
                                        level={level.level}
                                        unlocked={level.unlocked}
                                        size="sm"
                                        showAnimation={selectedLevel === level.level}
                                    />

                                    <div className="text-center">
                                        <p className={cn(
                                            'font-bold text-xs md:text-sm',
                                            level.unlocked
                                                ? 'text-amber-700 dark:text-amber-400'
                                                : 'text-neutral-600 dark:text-neutral-400'
                                        )}>
                                            Level {level.level}
                                        </p>
                                        <p className="mt-0.5 text-[10px] md:text-xs text-neutral-500 dark:text-neutral-400">
                                            <AnimatedCounter value={level.requirementValue} /> target
                                        </p>
                                    </div>

                                    {level.unlocked && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-emerald-500" />
                                        </motion.div>
                                    )}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Progress Section with Advanced Animations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-4 flex items-center gap-3">
                        <Trophy className="h-5 w-5 shrink-0 text-indigo-500" />
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg font-semibold text-neutral-900 dark:text-white"
                        >
                            Progress Saat Ini
                        </motion.h2>
                    </div>

                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center justify-between"
                        >
                            <span className="text-neutral-600 dark:text-neutral-400">
                                {currentLevelData?.requirement}
                            </span>
                            <span className={cn(
                                'font-bold text-lg',
                                progress.percentage >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-white'
                            )}>
                                <AnimatedCounter value={progress.current} /> / <AnimatedCounter value={progress.target} />
                            </span>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 }}
                            className="relative"
                        >
                            <Progress value={progress.percentage} className="h-4" />
                            <motion.div
                                initial={{ left: 0 }}
                                animate={{ left: `${Math.min(progress.percentage, 100)}%` }}
                                transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                                className="absolute top-1/2 -translate-y-1/2"
                            >
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 360, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className={cn(
                                        'h-6 w-6 rounded-full -ml-3 flex items-center justify-center shadow-lg',
                                        `bg-gradient-to-br ${gradient}`
                                    )}
                                >
                                    <Icon className="h-3 w-3 text-white" />
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-center text-sm text-neutral-500 dark:text-neutral-400"
                        >
                            {progress.percentage >= 100
                                ? 'Target tercapai. Badge sudah terbuka.'
                                : `${Math.round(100 - progress.percentage)}% lagi untuk membuka badge ini`
                            }
                        </motion.p>
                    </div>
                </motion.div>

                {/* How to Earn with Staggered Animations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-4 flex items-center gap-3">
                        <Sparkles className="h-5 w-5 shrink-0 text-purple-500" />
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-lg font-semibold text-neutral-900 dark:text-white"
                        >
                            Cara Mendapatkan
                        </motion.h2>
                    </div>

                    <div className="space-y-3">
                        {howToEarn.map((step, index) => {
                            const isCompleted = index < progress.percentage / 25;
                            return (
                                <motion.div
                                    key={step.step}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + index * 0.1, type: "spring", stiffness: 200 }}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    className={cn(
                                        'flex items-start gap-4 p-4 rounded-xl transition-all',
                                        isCompleted
                                            ? 'border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                                            : 'border border-white/20 bg-white/50 dark:border-white/5 dark:bg-neutral-900/40'
                                    )}
                                >
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.7 + index * 0.1, type: "spring", stiffness: 300 }}
                                        className={cn(
                                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm',
                                            isCompleted
                                                ? 'bg-emerald-500 text-white'
                                                : `bg-gradient-to-br ${gradient} text-white`
                                        )}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : (
                                            step.step
                                        )}
                                    </motion.div>
                                    <div>
                                        <h3 className={cn(
                                            'font-semibold',
                                            isCompleted
                                                ? 'text-emerald-700 dark:text-emerald-400'
                                                : 'text-neutral-900 dark:text-white'
                                        )}>
                                            {step.title}
                                        </h3>
                                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                            {step.description}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Tips with Staggered Animations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-4 flex items-center gap-3">
                        <Lightbulb className="h-5 w-5 shrink-0 text-amber-500" />
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="text-lg font-semibold text-neutral-900 dark:text-white"
                        >
                            Tips dan Trik
                        </motion.h2>
                    </div>

                    <ul className="grid gap-3 sm:grid-cols-2">
                        {tips.map((tip, index) => (
                            <motion.li
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 + index * 0.05, type: "spring", stiffness: 200 }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                className="flex items-start gap-3 rounded-xl border border-white/20 bg-white/60 p-3 cursor-pointer dark:border-white/5 dark:bg-neutral-900/40"
                            >
                                <motion.div
                                    whileHover={{ rotate: 360, scale: 1.2 }}
                                    transition={{ duration: 0.5 }}
                                    className={cn(
                                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                        `bg-gradient-to-br ${gradient} text-white`
                                    )}
                                >
                                    {index + 1}
                                </motion.div>
                                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                    {tip}
                                </span>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>

                {/* Related Badges with Staggered Animations */}
                {relatedBadges.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex items-center gap-3">
                            <Trophy className="h-5 w-5 shrink-0 text-sky-500" />
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                                className="text-lg font-semibold text-neutral-900 dark:text-white"
                            >
                                Badge Lainnya
                            </motion.h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                            {relatedBadges.map((related, index) => (
                                <motion.button
                                    key={related.type}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.8 + index * 0.05, type: "spring", stiffness: 200 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.visit(`/user/achievements/${related.type}`)}
                                    className="group flex flex-col items-center gap-2 rounded-xl border border-white/20 bg-white/60 p-4 dark:border-white/5 dark:bg-neutral-900/40"
                                >
                                    <BadgeImage
                                        type={related.type}
                                        level={1}
                                        unlocked={related.unlocked}
                                        size="md"
                                        showAnimation={false}
                                    />
                                    <span className="text-center text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        {related.name}
                                    </span>
                                    <motion.div
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    >
                                        <ChevronRight className="h-4 w-4 text-neutral-400" />
                                    </motion.div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </StudentLayout>
    );
}
