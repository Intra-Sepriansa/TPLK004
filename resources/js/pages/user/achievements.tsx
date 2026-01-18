import { Head, usePage, router } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import {
    Flame, Star, Zap, Award, Trophy, Crown, CheckCircle, Footprints,
    ScanFace, Wallet, ClipboardCheck, Users, Rocket, Sparkles, Target, TrendingUp,
    ChevronRight, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

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

const getBadgeImagePath = (icon: string | undefined, type: string, level: number): string => {
    if (icon) {
        return `/images/badges/${icon}`;
    }
    const suffix = level > 1 ? `_${level}` : '';
    return `/images/badges/${type}${suffix}.png`;
};

// Advanced Badge Image Component - Shows blurred image for locked (NO lock icon)
const BadgeImage = ({ 
    type, level, unlocked, progress, target, className, isHovered, icon, size = 'md'
}: { 
    type: string; level: number; unlocked: boolean; progress: number; target: number; 
    className?: string; isHovered?: boolean; icon?: string; size?: 'sm' | 'md' | 'lg';
}) => {
    const [imageError, setImageError] = useState(false);
    const Icon = achievementIcons[type] || Award;
    const imagePath = getBadgeImagePath(icon, type, level);
    const isCompleted = progress >= target;
    const isUnlockedOrCompleted = unlocked || isCompleted;

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
                    : "bg-slate-200/80 dark:bg-slate-700/80",
                isHovered && "scale-110",
                className
            )}>
                <Icon className={cn(
                    size === 'lg' ? 'h-10 w-10' : size === 'md' ? 'h-8 w-8' : 'h-6 w-6',
                    isUnlockedOrCompleted ? "text-amber-600" : "text-slate-400 opacity-50",
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
        mahasiswa = { nama: '', nim: '' },
        achievements = [],
        totalPoints = 0,
        level = 1,
        nextLevelPoints = 100,
        rank,
        totalStudents,
    } = props as unknown as PageProps;

    const [isLoaded, setIsLoaded] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const unlockedCount = achievements.filter(a => a.unlocked || a.progress >= a.target).length;
    const levelProgress = nextLevelPoints > 0 ? (totalPoints % nextLevelPoints) / nextLevelPoints * 100 : 0;

    const filteredAchievements = achievements.filter(a => {
        const isUnlocked = a.unlocked || a.progress >= a.target;
        if (selectedFilter === 'unlocked') return isUnlocked;
        if (selectedFilter === 'locked') return !isUnlocked;
        return true;
    });

    const getLevelName = (lvl: number) => {
        if (lvl < 5) return 'Pemula';
        if (lvl < 10) return 'Rajin';
        if (lvl < 20) return 'Expert';
        return 'Master';
    };

    const getLevelColor = (lvl: number) => {
        if (lvl < 5) return 'from-slate-400 to-slate-600';
        if (lvl < 10) return 'from-blue-400 to-blue-600';
        if (lvl < 20) return 'from-purple-400 to-purple-600';
        return 'from-amber-400 to-amber-600';
    };

    return (
        <StudentLayout>
            <Head title="Pencapaian" />
            <div className="p-4 md:p-6 space-y-6">
                {/* Hero Header with Parallax Effect */}
                <div className={cn(
                    "relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6 md:p-8 text-white shadow-2xl transition-all duration-700",
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                )}>
                    {/* Animated Background Elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl animate-pulse" />
                        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-white/5 animate-bounce" style={{ animationDuration: '4s' }} />
                        {/* Floating particles */}
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute rounded-full bg-white/20 animate-float"
                                style={{
                                    width: `${4 + Math.random() * 8}px`,
                                    height: `${4 + Math.random() * 8}px`,
                                    left: `${10 + i * 12}%`,
                                    top: `${20 + (i % 3) * 25}%`,
                                    animationDelay: `${i * 0.5}s`,
                                    animationDuration: `${3 + Math.random() * 2}s`
                                }}
                            />
                        ))}
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-xl ring-2 ring-white/30">
                                    <Trophy className="h-8 w-8 animate-pulse" style={{ animationDuration: '2s' }} />
                                </div>
                                <div>
                                    <p className="text-sm text-amber-100 font-medium tracking-wide">🎮 Gamification</p>
                                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                                        Pencapaian Saya
                                        <Sparkles className="h-6 w-6 animate-spin" style={{ animationDuration: '4s' }} />
                                    </h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                                    <Trophy className="h-5 w-5" />
                                    <span className="font-bold text-lg">{unlockedCount}</span>
                                    <span className="text-sm text-white/80">/ {achievements.length}</span>
                                </div>
                            </div>
                        </div>
                        
                        <p className="mt-4 text-amber-100 text-lg">Kumpulkan badge dan tingkatkan level kamu! 🚀</p>
                        
                        {/* Quick Stats Grid */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            {[
                                { icon: Star, label: 'Total Poin', value: totalPoints, isCounter: true },
                                { icon: Target, label: 'Level', value: level, suffix: ` - ${getLevelName(level)}` },
                                { icon: Award, label: 'Badge', value: unlockedCount },
                                { icon: TrendingUp, label: 'Ranking', value: rank ? `#${rank}` : '-' },
                            ].map((stat, i) => (
                                <div 
                                    key={i}
                                    className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer group ring-1 ring-white/10"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <stat.icon className="h-4 w-4 text-amber-200 group-hover:animate-bounce" />
                                        <p className="text-amber-100 text-xs font-medium">{stat.label}</p>
                                    </div>
                                    <p className="text-xl md:text-2xl font-bold">
                                        {stat.isCounter ? <AnimatedCounter value={stat.value as number} /> : stat.value}
                                        {stat.suffix && <span className="text-sm font-normal text-white/70">{stat.suffix}</span>}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Level Progress Card */}
                <div className={cn(
                    "rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl transition-all duration-500 overflow-hidden",
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                )} style={{ transitionDelay: '100ms' }}>
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        {/* Trophy Display */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 to-orange-500/30 blur-3xl rounded-full animate-pulse" />
                            <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl shadow-amber-500/40 ring-4 ring-amber-400/30">
                                <Trophy className="h-14 w-14 text-white" />
                            </div>
                        </div>
                        
                        {/* Level Info */}
                        <div className="flex-1 min-w-[280px]">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={cn(
                                    "flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold shadow-lg",
                                    `bg-gradient-to-br ${getLevelColor(level)}`
                                )}>
                                    {level}
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Level Saat Ini</p>
                                    <p className="text-xl font-bold">{getLevelName(level)}</p>
                                    <p className="text-sm text-slate-400">
                                        <AnimatedCounter value={totalPoints} /> poin total
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Progress ke Level {level + 1}</span>
                                    <span className="text-amber-400 font-medium">
                                        {totalPoints % nextLevelPoints} / {nextLevelPoints}
                                    </span>
                                </div>
                                <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${levelProgress}%` }}
                                    />
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-white/40 to-transparent rounded-full animate-shimmer"
                                        style={{ width: `${levelProgress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500">
                                    {Math.round(nextLevelPoints - (totalPoints % nextLevelPoints))} poin lagi untuk naik level ⬆️
                                </p>
                            </div>
                        </div>

                        {/* Rank Display */}
                        {rank && totalStudents && (
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/40 ring-4 ring-violet-400/30">
                                    <Crown className="h-10 w-10 text-white" />
                                </div>
                                <div className="text-center px-4 py-2 bg-white/5 rounded-xl backdrop-blur">
                                    <p className="text-slate-400 text-xs">Peringkat</p>
                                    <p className="text-2xl font-bold text-amber-400">#{rank}</p>
                                    <p className="text-xs text-slate-500">dari {totalStudents} mahasiswa</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Badge Collection */}
                <div className={cn(
                    "rounded-2xl border border-slate-200/70 bg-white/90 shadow-lg backdrop-blur dark:border-gray-800/70 dark:bg-black/90 overflow-hidden transition-all duration-500",
                    isLoaded ? 'opacity-100' : 'opacity-0'
                )} style={{ transitionDelay: '200ms' }}>
                    {/* Header with Filter */}
                    <div className="p-4 border-b border-slate-200 dark:border-gray-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30">
                                    <Award className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-slate-900 dark:text-white">Koleksi Badge</h2>
                                    <p className="text-xs text-slate-500">{unlockedCount} dari {achievements.length} badge terbuka</p>
                                </div>
                            </div>
                            
                            {/* Filter Tabs */}
                            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-gray-800 rounded-lg">
                                {[
                                    { key: 'all', label: 'Semua', count: achievements.length },
                                    { key: 'unlocked', label: 'Terbuka', count: unlockedCount },
                                    { key: 'locked', label: 'Terkunci', count: achievements.length - unlockedCount },
                                ].map((filter) => (
                                    <button
                                        key={filter.key}
                                        onClick={() => setSelectedFilter(filter.key as any)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                            selectedFilter === filter.key
                                                ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm"
                                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                        )}
                                    >
                                        {filter.label} ({filter.count})
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Badge Grid */}
                    <div className="p-4">
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredAchievements.map((achievement, index) => {
                                const progressPercent = achievement.target > 0 
                                    ? Math.min((achievement.progress / achievement.target) * 100, 100) 
                                    : 0;
                                const isCompleted = achievement.progress >= achievement.target;
                                const isUnlocked = achievement.unlocked || isCompleted;
                                const isHovered = hoveredCard === achievement.id;

                                return (
                                    <div
                                        key={achievement.id}
                                        onClick={() => router.get(`/user/achievements/${achievement.type}`)}
                                        onMouseEnter={() => setHoveredCard(achievement.id)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                        className={cn(
                                            'rounded-2xl border-2 p-4 transition-all duration-500 cursor-pointer relative overflow-hidden group',
                                            isUnlocked
                                                ? 'border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:border-amber-700 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/20 hover:shadow-xl hover:shadow-amber-500/25'
                                                : 'border-slate-200 bg-slate-50/80 dark:border-gray-700 dark:bg-gray-900/50 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg',
                                            isHovered && 'scale-[1.02] -translate-y-1'
                                        )}
                                        style={{ 
                                            animationDelay: `${index * 50}ms`,
                                            animation: isLoaded ? 'fadeInUp 0.5s ease-out forwards' : 'none'
                                        }}
                                    >
                                        {/* Animated Background for Unlocked */}
                                        {isUnlocked && (
                                            <>
                                                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                {isHovered && (
                                                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                                        {[...Array(4)].map((_, i) => (
                                                            <Sparkles 
                                                                key={i}
                                                                className="absolute text-amber-400/60 animate-ping"
                                                                style={{
                                                                    left: `${15 + i * 25}%`,
                                                                    top: `${15 + (i % 2) * 50}%`,
                                                                    animationDelay: `${i * 0.2}s`,
                                                                    animationDuration: '1.5s'
                                                                }}
                                                                size={10}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        
                                        <div className="relative">
                                            {/* Badge Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <BadgeImage 
                                                    type={achievement.type} 
                                                    level={achievement.level} 
                                                    unlocked={achievement.unlocked}
                                                    progress={achievement.progress}
                                                    target={achievement.target}
                                                    isHovered={isHovered}
                                                    icon={achievement.icon}
                                                    size="lg"
                                                />
                                                <div className="flex flex-col items-end gap-1.5">
                                                    {isUnlocked && (
                                                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium dark:bg-emerald-900/40 dark:text-emerald-400">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Unlocked
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium dark:bg-gray-800 dark:text-slate-400">
                                                        Lv {achievement.level}/{achievement.maxLevel}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Badge Info */}
                                            <h3 className={cn(
                                                'font-bold text-base transition-colors duration-300 mb-1',
                                                isUnlocked
                                                    ? 'text-amber-900 dark:text-amber-100'
                                                    : 'text-slate-700 dark:text-slate-300',
                                                isHovered && isUnlocked && 'text-amber-600 dark:text-amber-400'
                                            )}>
                                                {achievement.name}
                                            </h3>
                                            <p className={cn(
                                                "text-xs mt-1 line-clamp-2",
                                                isUnlocked ? "text-amber-700/70 dark:text-amber-200/70" : "text-slate-500"
                                            )}>
                                                {achievement.description}
                                            </p>

                                            {/* Progress Section */}
                                            <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-gray-700/50">
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="text-slate-500 truncate max-w-[65%]">{achievement.requirement}</span>
                                                    <span className={cn(
                                                        'font-bold',
                                                        isUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                                                    )}>
                                                        {achievement.progress}/{achievement.target}
                                                    </span>
                                                </div>
                                                <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div 
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-1000 ease-out",
                                                            isUnlocked 
                                                                ? "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500" 
                                                                : "bg-gradient-to-r from-slate-400 to-slate-500"
                                                        )}
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="mt-3 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Star className={cn(
                                                        "h-4 w-4",
                                                        isUnlocked ? "text-amber-500" : "text-slate-400",
                                                        isHovered && "animate-spin"
                                                    )} style={{ animationDuration: '2s' }} />
                                                    <span className={cn(
                                                        "font-bold text-sm",
                                                        isUnlocked ? "text-amber-600 dark:text-amber-400" : "text-slate-500"
                                                    )}>{achievement.points}</span>
                                                    <span className="text-xs text-slate-400">poin</span>
                                                </div>
                                                <ChevronRight className={cn(
                                                    "h-4 w-4 transition-transform",
                                                    isUnlocked ? "text-amber-500" : "text-slate-400",
                                                    isHovered && "translate-x-1"
                                                )} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Tips Section */}
                <div className={cn(
                    "rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg backdrop-blur dark:border-gray-800/70 dark:bg-black/90 transition-all duration-500",
                    isLoaded ? 'opacity-100' : 'opacity-0'
                )} style={{ transitionDelay: '300ms' }}>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-500/30">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                            💡 Tips Mendapatkan Badge
                        </h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            { icon: Flame, color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30', text: 'Hadir setiap hari untuk membangun streak' },
                            { icon: Zap, color: 'text-sky-500 bg-sky-100 dark:bg-sky-900/30', text: 'Datang tepat waktu untuk Early Bird' },
                            { icon: Star, color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30', text: 'Pertahankan kehadiran 100%' },
                            { icon: Trophy, color: 'text-violet-500 bg-violet-100 dark:bg-violet-900/30', text: 'Bersaing untuk masuk top ranking' },
                            { icon: Wallet, color: 'text-green-500 bg-green-100 dark:bg-green-900/30', text: 'Bayar kas tepat waktu' },
                            { icon: Rocket, color: 'text-red-500 bg-red-100 dark:bg-red-900/30', text: 'Absen dalam 1 menit pertama' },
                        ].map((tip, index) => (
                            <div 
                                key={index} 
                                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-gray-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-[1.02] cursor-pointer group"
                            >
                                <div className={cn("p-2 rounded-lg shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-12", tip.color)}>
                                    <tip.icon className="h-4 w-4" />
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-400">{tip.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Custom Animations */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s ease-in-out infinite;
                }
            `}</style>
        </StudentLayout>
    );
}
