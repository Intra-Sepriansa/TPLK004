import { Flame, Star, Trophy, Award, Zap, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

type AchievementType = 'streak' | 'perfect' | 'early' | 'consistent' | 'champion' | 'legend';

interface AchievementBadgeProps {
    type: AchievementType;
    value?: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

const achievements = {
    streak: {
        icon: Flame,
        label: 'Streak',
        description: 'Hadir berturut-turut',
        colors: 'bg-gradient-to-br from-orange-400 to-red-500',
        glow: 'shadow-orange-500/30',
    },
    perfect: {
        icon: Star,
        label: 'Perfect',
        description: 'Kehadiran sempurna',
        colors: 'bg-gradient-to-br from-yellow-400 to-amber-500',
        glow: 'shadow-amber-500/30',
    },
    early: {
        icon: Zap,
        label: 'Early Bird',
        description: 'Selalu tepat waktu',
        colors: 'bg-gradient-to-br from-sky-400 to-blue-500',
        glow: 'shadow-blue-500/30',
    },
    consistent: {
        icon: Award,
        label: 'Consistent',
        description: 'Kehadiran konsisten',
        colors: 'bg-gradient-to-br from-emerald-400 to-green-500',
        glow: 'shadow-emerald-500/30',
    },
    champion: {
        icon: Trophy,
        label: 'Champion',
        description: 'Top performer',
        colors: 'bg-gradient-to-br from-violet-400 to-purple-500',
        glow: 'shadow-violet-500/30',
    },
    legend: {
        icon: Crown,
        label: 'Legend',
        description: 'Pencapaian tertinggi',
        colors: 'bg-gradient-to-br from-rose-400 to-pink-500',
        glow: 'shadow-rose-500/30',
    },
};

const sizes = {
    sm: {
        container: 'h-8 w-8',
        icon: 'h-4 w-4',
        badge: 'text-[8px] -top-1 -right-1 h-4 min-w-4 px-1',
    },
    md: {
        container: 'h-12 w-12',
        icon: 'h-6 w-6',
        badge: 'text-[10px] -top-1 -right-1 h-5 min-w-5 px-1.5',
    },
    lg: {
        container: 'h-16 w-16',
        icon: 'h-8 w-8',
        badge: 'text-xs -top-2 -right-2 h-6 min-w-6 px-2',
    },
};

export function AchievementBadge({
    type,
    value,
    size = 'md',
    showLabel = false,
}: AchievementBadgeProps) {
    const achievement = achievements[type];
    const sizeStyles = sizes[size];
    const Icon = achievement.icon;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative">
                <div
                    className={cn(
                        'flex items-center justify-center rounded-full text-white shadow-lg',
                        achievement.colors,
                        achievement.glow,
                        sizeStyles.container
                    )}
                >
                    <Icon className={sizeStyles.icon} />
                </div>
                {value !== undefined && (
                    <span
                        className={cn(
                            'absolute flex items-center justify-center rounded-full bg-slate-900 text-white font-bold',
                            sizeStyles.badge
                        )}
                    >
                        {value}
                    </span>
                )}
            </div>
            {showLabel && (
                <div className="text-center">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        {achievement.label}
                    </p>
                    <p className="text-[10px] text-slate-500">
                        {achievement.description}
                    </p>
                </div>
            )}
        </div>
    );
}

interface AchievementListProps {
    achievements: {
        type: AchievementType;
        value?: number;
        unlocked: boolean;
    }[];
}

export function AchievementList({ achievements: userAchievements }: AchievementListProps) {
    return (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {userAchievements.map((achievement, index) => (
                <div
                    key={index}
                    className={cn(
                        'flex flex-col items-center p-3 rounded-xl transition-all',
                        achievement.unlocked
                            ? 'bg-white dark:bg-slate-900'
                            : 'bg-slate-100 dark:bg-slate-800 opacity-40 grayscale'
                    )}
                >
                    <AchievementBadge
                        type={achievement.type}
                        value={achievement.unlocked ? achievement.value : undefined}
                        size="md"
                        showLabel
                    />
                </div>
            ))}
        </div>
    );
}
