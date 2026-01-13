import { Head, Link, router } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Progress } from '@/components/ui/progress';
import {
    ArrowLeft,
    Lock,
    CheckCircle,
    Star,
    Sparkles,
    Lightbulb,
    Trophy,
    ChevronRight,
    Flame,
    Zap,
    Award,
    Crown,
    Footprints,
    ScanFace,
    Wallet,
    ClipboardCheck,
    Users,
    Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

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
    progress: {
        current: number;
        target: number;
        percentage: number;
    };
    tips: string[];
    howToEarn: HowToEarnStep[];
    relatedBadges: RelatedBadge[];
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

const colorGradients: Record<string, string> = {
    orange: 'from-orange-400 to-red-500',
    emerald: 'from-emerald-400 to-green-500',
    sky: 'from-sky-400 to-blue-500',
    green: 'from-green-400 to-emerald-500',
    amber: 'from-amber-400 to-yellow-500',
    purple: 'from-purple-400 to-violet-500',
    teal: 'from-teal-400 to-cyan-500',
    cyan: 'from-cyan-400 to-blue-500',
    blue: 'from-blue-400 to-indigo-500',
    pink: 'from-pink-400 to-rose-500',
    red: 'from-red-400 to-orange-500',
};

const colorBg: Record<string, string> = {
    orange: 'bg-orange-500',
    emerald: 'bg-emerald-500',
    sky: 'bg-sky-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
    teal: 'bg-teal-500',
    cyan: 'bg-cyan-500',
    blue: 'bg-blue-500',
    pink: 'bg-pink-500',
    red: 'bg-red-500',
};

// Badge Image component with lock animation
const BadgeImage = ({ 
    type, 
    level, 
    unlocked,
    size = 'lg',
    showAnimation = true,
}: { 
    type: string; 
    level: number; 
    unlocked: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showAnimation?: boolean;
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
        // Fallback to icon
        return (
            <div className={cn(
                sizeClasses[size],
                'flex items-center justify-center rounded-full',
                unlocked 
                    ? 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30'
                    : 'bg-slate-100 dark:bg-slate-800'
            )}>
                {unlocked ? (
                    <Icon className={cn(
                        size === 'xl' ? 'h-16 w-16' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8',
                        'text-amber-600'
                    )} />
                ) : (
                    <Lock className={cn(
                        size === 'xl' ? 'h-12 w-12' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6',
                        'text-slate-400'
                    )} />
                )}
            </div>
        );
    }

    if (unlocked) {
        return (
            <div 
                className={cn(sizeClasses[size], 'relative')}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <img
                    src={imagePath}
                    alt={type}
                    className={cn(
                        'h-full w-full object-contain rounded-full transition-transform duration-300',
                        showAnimation && isHovered && 'scale-110'
                    )}
                    onError={() => setImageError(true)}
                />
                {showAnimation && (
                    <div className="absolute inset-0 rounded-full animate-pulse-ring" />
                )}
            </div>
        );
    }

    // Locked badge with animation
    return (
        <div 
            className={cn(
                sizeClasses[size], 
                'relative group cursor-pointer'
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Grayscale badge image */}
            <img
                src={imagePath}
                alt={type}
                className={cn(
                    'h-full w-full object-contain rounded-full transition-all duration-500',
                    'grayscale opacity-30 blur-[1px]',
                    isHovered && 'grayscale-0 opacity-60 blur-0'
                )}
                onError={() => setImageError(true)}
            />
            
            {/* Lock overlay with animation */}
            <div className={cn(
                'absolute inset-0 flex items-center justify-center rounded-full',
                'bg-slate-900/40 backdrop-blur-[2px] transition-all duration-500',
                isHovered && 'bg-slate-900/20 backdrop-blur-0'
            )}>
                <div className={cn(
                    'relative transition-all duration-500',
                    isHovered && 'scale-90 opacity-70'
                )}>
                    {/* Animated lock */}
                    <div className="relative">
                        <Lock className={cn(
                            size === 'xl' ? 'h-12 w-12' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6',
                            'text-white drop-shadow-lg transition-transform duration-300',
                            showAnimation && 'animate-bounce-slow'
                        )} />
                        
                        {/* Sparkle effects */}
                        {showAnimation && (
                            <>
                                <Sparkles className="absolute -top-2 -right-2 h-3 w-3 text-amber-400 animate-twinkle" />
                                <Sparkles className="absolute -bottom-1 -left-2 h-2 w-2 text-amber-300 animate-twinkle-delay" />
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Hover hint */}
            {isHovered && showAnimation && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs text-slate-500 dark:text-slate-400 animate-fade-in">
                        Belum terbuka
                    </span>
                </div>
            )}
        </div>
    );
};

export default function BadgeDetail({
    mahasiswa,
    badge,
    levels,
    progress,
    tips,
    howToEarn,
    relatedBadges,
}: PageProps) {
    const [selectedLevel, setSelectedLevel] = useState<number>(badge.currentLevel);
    const [showConfetti, setShowConfetti] = useState(false);
    
    const gradient = colorGradients[badge.color] || 'from-gray-400 to-gray-500';
    const bgColor = colorBg[badge.color] || 'bg-gray-500';
    const Icon = achievementIcons[badge.type] || Award;
    
    const currentLevelData = levels.find(l => l.level === selectedLevel);
    const isCurrentUnlocked = currentLevelData?.unlocked || false;
    
    // Check if all levels are unlocked
    const allUnlocked = levels.every(l => l.unlocked);
    
    useEffect(() => {
        if (allUnlocked) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [allUnlocked]);

    return (
        <StudentLayout>
            <Head title={`Badge: ${badge.name}`} />
            
            {/* Custom CSS for animations */}
            <style>{`
                @keyframes pulse-ring {
                    0% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(251, 191, 36, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
                }
                .animate-pulse-ring {
                    animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 2s ease-in-out infinite;
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 0; transform: scale(0.5); }
                    50% { opacity: 1; transform: scale(1); }
                }
                .animate-twinkle {
                    animation: twinkle 1.5s ease-in-out infinite;
                }
                .animate-twinkle-delay {
                    animation: twinkle 1.5s ease-in-out infinite 0.5s;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                @keyframes confetti {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
                .confetti-piece {
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    top: -10px;
                    animation: confetti 3s ease-out forwards;
                }
            `}</style>

            {/* Confetti effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="confetti-piece rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                backgroundColor: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="p-6 space-y-6">
                {/* Back Button */}
                <button
                    onClick={() => router.get('/user/achievements')}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm font-medium">Kembali ke Pencapaian</span>
                </button>

                {/* Hero Section */}
                <div className={cn(
                    'relative overflow-hidden rounded-3xl p-8 text-white shadow-xl',
                    `bg-gradient-to-br ${gradient}`
                )}>
                    {/* Background decorations */}
                    <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/5" />
                    
                    <div className="relative flex flex-col md:flex-row items-center gap-8">
                        {/* Badge Display */}
                        <div className="relative">
                            <div className={cn(
                                'rounded-full p-2',
                                isCurrentUnlocked ? 'bg-white/20 ring-4 ring-white/30' : 'bg-white/10'
                            )}>
                                <BadgeImage 
                                    type={badge.type} 
                                    level={selectedLevel} 
                                    unlocked={isCurrentUnlocked}
                                    size="xl"
                                    showAnimation={true}
                                />
                            </div>
                            
                            {/* Level indicator */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-sm font-bold">
                                    <span>Lv {selectedLevel}</span>
                                    <span className="text-white/60">/</span>
                                    <span className="text-white/60">{badge.maxLevel}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Badge Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium uppercase tracking-wider">
                                    {badge.category}
                                </span>
                                {isCurrentUnlocked && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/30 text-xs font-medium">
                                        <CheckCircle className="h-3 w-3" />
                                        Unlocked
                                    </span>
                                )}
                            </div>
                            
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                {currentLevelData?.name || badge.name}
                            </h1>
                            <p className="text-white/80 text-lg mb-4">
                                {currentLevelData?.description || badge.description}
                            </p>
                            
                            {/* Points */}
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <Star className="h-5 w-5 text-amber-300" />
                                <span className="text-2xl font-bold">{currentLevelData?.points || 0}</span>
                                <span className="text-white/60">poin</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Level Selector */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Level Badge
                    </h2>
                    
                    <div className="grid grid-cols-3 gap-4">
                        {levels.map((level) => (
                            <button
                                key={level.id}
                                onClick={() => setSelectedLevel(level.level)}
                                className={cn(
                                    'relative rounded-2xl p-4 transition-all duration-300',
                                    'border-2',
                                    selectedLevel === level.level
                                        ? level.unlocked
                                            ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
                                            : 'border-slate-400 bg-slate-50 dark:bg-slate-800/50'
                                        : 'border-transparent bg-slate-100 dark:bg-slate-800/30 hover:bg-slate-200 dark:hover:bg-slate-800/50'
                                )}
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <BadgeImage 
                                        type={badge.type} 
                                        level={level.level} 
                                        unlocked={level.unlocked}
                                        size="md"
                                        showAnimation={selectedLevel === level.level}
                                    />
                                    
                                    <div className="text-center">
                                        <p className={cn(
                                            'font-bold text-sm',
                                            level.unlocked 
                                                ? 'text-amber-700 dark:text-amber-400'
                                                : 'text-slate-600 dark:text-slate-400'
                                        )}>
                                            Level {level.level}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {level.requirementValue} target
                                        </p>
                                    </div>
                                    
                                    {level.unlocked && (
                                        <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-emerald-500" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Progress Section */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
                        Progress Saat Ini
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 dark:text-slate-400">
                                {currentLevelData?.requirement}
                            </span>
                            <span className={cn(
                                'font-bold',
                                progress.percentage >= 100 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                            )}>
                                {progress.current} / {progress.target}
                            </span>
                        </div>
                        
                        <div className="relative">
                            <Progress value={progress.percentage} className="h-4" />
                            <div 
                                className="absolute top-1/2 -translate-y-1/2 transition-all duration-500"
                                style={{ left: `${Math.min(progress.percentage, 100)}%` }}
                            >
                                <div className={cn(
                                    'h-6 w-6 rounded-full -ml-3 flex items-center justify-center',
                                    `bg-gradient-to-br ${gradient}`,
                                    'shadow-lg'
                                )}>
                                    <Icon className="h-3 w-3 text-white" />
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-center text-sm text-slate-500">
                            {progress.percentage >= 100 
                                ? '🎉 Target tercapai! Badge sudah terbuka.'
                                : `${100 - progress.percentage}% lagi untuk membuka badge ini`
                            }
                        </p>
                    </div>
                </div>

                {/* How to Earn */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        Cara Mendapatkan
                    </h2>
                    
                    <div className="space-y-4">
                        {howToEarn.map((step, index) => (
                            <div 
                                key={step.step}
                                className={cn(
                                    'flex items-start gap-4 p-4 rounded-xl transition-all',
                                    index < progress.percentage / 25 
                                        ? 'bg-emerald-50 dark:bg-emerald-950/20'
                                        : 'bg-slate-50 dark:bg-slate-800/30'
                                )}
                            >
                                <div className={cn(
                                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm',
                                    index < progress.percentage / 25
                                        ? 'bg-emerald-500 text-white'
                                        : `bg-gradient-to-br ${gradient} text-white`
                                )}>
                                    {index < progress.percentage / 25 ? (
                                        <CheckCircle className="h-4 w-4" />
                                    ) : (
                                        step.step
                                    )}
                                </div>
                                <div>
                                    <h3 className={cn(
                                        'font-semibold',
                                        index < progress.percentage / 25
                                            ? 'text-emerald-700 dark:text-emerald-400'
                                            : 'text-slate-900 dark:text-white'
                                    )}>
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tips */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <h2 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        Tips & Trik
                    </h2>
                    
                    <ul className="grid gap-3 sm:grid-cols-2">
                        {tips.map((tip, index) => (
                            <li 
                                key={index}
                                className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20"
                            >
                                <div className={cn(
                                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                    `bg-gradient-to-br ${gradient} text-white`
                                )}>
                                    {index + 1}
                                </div>
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                    {tip}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Related Badges */}
                {relatedBadges.length > 0 && (
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
                            Badge Lainnya
                        </h2>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {relatedBadges.map((related) => (
                                <button
                                    key={related.type}
                                    onClick={() => router.get(`/user/achievements/${related.type}`)}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <BadgeImage 
                                        type={related.type} 
                                        level={1} 
                                        unlocked={related.unlocked}
                                        size="md"
                                        showAnimation={false}
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center">
                                        {related.name}
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
