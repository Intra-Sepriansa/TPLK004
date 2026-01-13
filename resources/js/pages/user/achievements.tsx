import { Head, usePage, router } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Progress } from '@/components/ui/progress';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import {
    Flame,
    Star,
    Zap,
    Award,
    Trophy,
    Crown,
    Lock,
    CheckCircle,
    Footprints,
    ScanFace,
    Wallet,
    ClipboardCheck,
    Users,
    Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Achievement {
    id: number;
    type: string;
    name: string;
    description: string;
    requirement: string;
    progress: number;
    target: number;
    unlocked: boolean;
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

const achievementIcons: Record<string, any> = {
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

const achievementColors: Record<string, string> = {
    streak_master: 'from-orange-400 to-red-500',
    perfect_attendance: 'from-emerald-400 to-green-500',
    early_bird: 'from-sky-400 to-blue-500',
    consistent: 'from-green-400 to-emerald-500',
    champion: 'from-amber-400 to-yellow-500',
    legend: 'from-purple-400 to-violet-500',
    first_step: 'from-teal-400 to-cyan-500',
    ai_verified: 'from-cyan-400 to-blue-500',
    kas_hero: 'from-green-400 to-emerald-500',
    task_master: 'from-blue-400 to-indigo-500',
    social_star: 'from-pink-400 to-rose-500',
    speed_demon: 'from-red-400 to-orange-500',
};

// Helper function to get badge image path based on type and level
const getBadgeImagePath = (type: string, level: number): string => {
    const suffix = level > 1 ? `_${level}` : '';
    return `/images/badges/${type}${suffix}.png`;
};

// Badge Image component with fallback to Lucide icon
const BadgeImage = ({ 
    type, 
    level, 
    unlocked,
    progress,
    target,
    className 
}: { 
    type: string; 
    level: number; 
    unlocked: boolean;
    progress: number;
    target: number;
    className?: string;
}) => {
    const [imageError, setImageError] = useState(false);
    const Icon = achievementIcons[type] || Award;
    const imagePath = getBadgeImagePath(type, level);
    
    // Show badge image if unlocked OR if progress >= target (completed)
    const isCompleted = progress >= target;
    const shouldShowImage = unlocked || isCompleted;

    if (imageError || !shouldShowImage) {
        // Fallback to Lucide icon or Lock
        return shouldShowImage ? (
            <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800", className)}>
                <Icon className="h-6 w-6 text-slate-500" />
            </div>
        ) : (
            <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800", className)}>
                <Lock className="h-5 w-5 text-slate-400" />
            </div>
        );
    }

    return (
        <img
            src={imagePath}
            alt={type}
            className={cn("h-full w-full object-contain rounded-full", className)}
            onError={() => setImageError(true)}
        />
    );
};

export default function Achievements() {
    const { props } = usePage<{ props: PageProps }>();
    const {
        mahasiswa = { nama: '', nim: '' },
        achievements = [],
        totalPoints = 0,
        level = 1,
        nextLevelPoints = 100,
        rank,
        totalStudents,
    } = props as unknown as PageProps;

    const unlockedCount = achievements.filter(a => a.unlocked || a.progress >= a.target).length;
    const levelProgress = nextLevelPoints > 0 ? (totalPoints % nextLevelPoints) / nextLevelPoints * 100 : 0;

    const getLevelName = (lvl: number) => {
        if (lvl < 5) return 'Pemula';
        if (lvl < 10) return 'Rajin';
        if (lvl < 20) return 'Expert';
        return 'Master';
    };

    return (
        <StudentLayout>
            <Head title="Pencapaian" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                            Gamification
                        </p>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Pencapaian Saya
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Trophy className="h-5 w-5" />
                        <span className="font-bold">{unlockedCount}/{achievements.length}</span>
                        <span className="text-sm">unlocked</span>
                    </div>
                </div>

                {/* Level & Points Card */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl font-bold shadow-lg">
                                {level}
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Level</p>
                                <p className="text-2xl font-bold">{getLevelName(level)}</p>
                                <p className="text-sm text-slate-400">
                                    <AnimatedCounter value={totalPoints} /> poin total
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 min-w-[200px] max-w-md">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-400">Progress ke Level {level + 1}</span>
                                <span className="text-amber-400">
                                    {totalPoints % nextLevelPoints}/{nextLevelPoints}
                                </span>
                            </div>
                            <Progress
                                value={levelProgress}
                                className="h-3 bg-slate-700"
                            />
                        </div>

                        {rank && totalStudents && (
                            <div className="text-center">
                                <p className="text-slate-400 text-sm">Peringkat</p>
                                <p className="text-3xl font-bold text-amber-400">#{rank}</p>
                                <p className="text-xs text-slate-500">dari {totalStudents} mahasiswa</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Achievements Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {achievements.map((achievement) => {
                        const gradientColor = achievementColors[achievement.type] || 'from-gray-400 to-gray-500';
                        const progressPercent = achievement.target > 0 
                            ? Math.min((achievement.progress / achievement.target) * 100, 100) 
                            : 0;
                        // Consider badge as completed if progress >= target
                        const isCompleted = achievement.progress >= achievement.target;

                        return (
                            <div
                                key={achievement.id}
                                onClick={() => router.get(`/user/achievements/${achievement.type}`)}
                                className={cn(
                                    'rounded-2xl border p-5 transition-all hover:shadow-lg cursor-pointer hover:scale-[1.02]',
                                    (achievement.unlocked || isCompleted)
                                        ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/30'
                                        : 'border-slate-200/70 bg-white/80 dark:border-slate-800/70 dark:bg-slate-950/70'
                                )}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className={cn(
                                        'flex h-16 w-16 items-center justify-center rounded-full overflow-hidden p-1',
                                        !(achievement.unlocked || isCompleted) && 'bg-slate-100 text-slate-400 dark:bg-slate-800',
                                        (achievement.unlocked || isCompleted) && 'bg-transparent'
                                    )}>
                                        <BadgeImage 
                                            type={achievement.type} 
                                            level={achievement.level} 
                                            unlocked={achievement.unlocked}
                                            progress={achievement.progress}
                                            target={achievement.target}
                                        />
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {(achievement.unlocked || isCompleted) && (
                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs dark:bg-emerald-900/30 dark:text-emerald-400">
                                                <CheckCircle className="h-3 w-3" />
                                                Unlocked
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs dark:bg-slate-800 dark:text-slate-400">
                                            Lv {achievement.level}/{achievement.maxLevel}
                                        </div>
                                    </div>
                                </div>

                                <h3 className={cn(
                                    'font-bold text-base',
                                    (achievement.unlocked || isCompleted)
                                        ? 'text-amber-900 dark:text-amber-100'
                                        : 'text-slate-900 dark:text-white'
                                )}>
                                    {achievement.name}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                    {achievement.description}
                                </p>

                                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-slate-500 truncate max-w-[70%]">{achievement.requirement}</span>
                                        <span className={cn(
                                            'font-medium',
                                            (achievement.unlocked || isCompleted) ? 'text-emerald-600' : 'text-slate-600'
                                        )}>
                                            {achievement.progress}/{achievement.target}
                                        </span>
                                    </div>
                                    <Progress
                                        value={progressPercent}
                                        className="h-1.5"
                                    />
                                </div>

                                <div className="mt-3 flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-amber-600">
                                        <Star className="h-3.5 w-3.5" />
                                        <span className="font-bold text-sm">{achievement.points}</span>
                                        <span className="text-xs text-slate-500">poin</span>
                                    </div>
                                    {achievement.unlockedAt && (
                                        <span className="text-xs text-slate-400">
                                            {new Date(achievement.unlockedAt).toLocaleDateString('id-ID')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Tips */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
                        💡 Tips Mendapatkan Achievement
                    </h2>
                    <ul className="grid gap-2 sm:grid-cols-2 text-sm text-slate-600 dark:text-slate-400">
                        <li className="flex items-start gap-2">
                            <Flame className="h-4 w-4 mt-0.5 text-orange-500 shrink-0" />
                            <span>Hadir setiap hari untuk membangun streak dan mendapat bonus poin</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Zap className="h-4 w-4 mt-0.5 text-sky-500 shrink-0" />
                            <span>Datang tepat waktu untuk unlock achievement Early Bird</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Star className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                            <span>Pertahankan kehadiran 100% selama sebulan untuk Perfect Attendance</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Trophy className="h-4 w-4 mt-0.5 text-violet-500 shrink-0" />
                            <span>Bersaing dengan teman sekelas untuk masuk top 10 dan jadi Champion</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Wallet className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                            <span>Bayar kas tepat waktu untuk mendapatkan badge Kas Hero</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Rocket className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                            <span>Absen dalam 1 menit pertama untuk unlock Speed Demon</span>
                        </li>
                    </ul>
                </div>
            </div>
        </StudentLayout>
    );
}
