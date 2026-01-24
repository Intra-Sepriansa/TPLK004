import { Head, router } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import {
    ArrowLeft, CheckCircle, Star, Sparkles, Lightbulb, Trophy, ChevronRight,
    Flame, Zap, Award, Crown, Footprints, ScanFace, Wallet, ClipboardCheck, Users, Rocket, Eye
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
    progress: { current: number; target: number; percentage: number };
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

// Themed Particle Animation Component
const ThemedParticles = ({ type, isUnlocked }: { type: string; isUnlocked: boolean }) => {
    console.log('🎨 ThemedParticles rendering:', { type, isUnlocked });
    
    // Show particles for unlocked badges
    if (!isUnlocked) return null;

    // Fire/Flame animation for streak_master - MUCH BIGGER AND MORE VISIBLE
    if (type === 'streak_master') {
        return (
            <>
                {[...Array(25)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: 0, opacity: 0, scale: 0 }}
                        animate={{
                            y: [-30, -120, -200],
                            opacity: [0, 1, 0.8, 0],
                            scale: [0.8, 1.5, 1.2, 0.5],
                            x: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 80]
                        }}
                        transition={{
                            duration: 2.5 + Math.random() * 0.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: "easeOut"
                        }}
                        className="absolute rounded-full"
                        style={{
                            left: `${20 + Math.random() * 60}%`,
                            bottom: '0%',
                            width: `${20 + Math.random() * 30}px`,
                            height: `${20 + Math.random() * 30}px`,
                            background: `radial-gradient(circle, ${['#ff4400', '#ff6b00', '#ff8800', '#ffaa00'][Math.floor(Math.random() * 4)]}, rgba(255, 100, 0, 0.3))`,
                            boxShadow: `0 0 20px ${['#ff4400', '#ff6b00', '#ff8800'][Math.floor(Math.random() * 3)]}`,
                            filter: 'blur(3px)',
                        }}
                    />
                ))}
            </>
        );
    }

    // Lightning/Zap animation for early_bird and speed_demon - BIGGER
    if (type === 'early_bird' || type === 'speed_demon') {
        return (
            <>
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            scale: [0.5, 1.5, 1.2, 0.5],
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.4,
                            ease: "easeInOut"
                        }}
                        className="absolute"
                        style={{
                            left: `${10 + i * 8}%`,
                            top: `${15 + Math.random() * 50}%`,
                        }}
                    >
                        <Zap className="h-12 w-12 text-yellow-300 fill-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]" />
                    </motion.div>
                ))}
            </>
        );
    }

    // Stars animation for perfect_attendance, champion, and legend - BIGGER
    if (type === 'perfect_attendance' || type === 'champion' || type === 'legend') {
        return (
            <>
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0, rotate: 0 }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            scale: [0, 2, 1.5, 0],
                            rotate: [0, 180, 360],
                            y: [0, -80]
                        }}
                        transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeOut"
                        }}
                        className="absolute"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    >
                        <Star className="h-8 w-8 text-amber-300 fill-amber-300 drop-shadow-[0_0_15px_rgba(252,211,77,0.8)]" />
                    </motion.div>
                ))}
            </>
        );
    }

    // Money/Coins animation for kas_hero - BIGGER
    if (type === 'kas_hero') {
        return (
            <>
                {[...Array(18)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: -50, opacity: 0, rotateY: 0 }}
                        animate={{
                            y: [0, 150],
                            opacity: [0, 1, 1, 0],
                            rotateY: [0, 720]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.25,
                            ease: "easeIn"
                        }}
                        className="absolute"
                        style={{
                            left: `${10 + i * 5}%`,
                            top: '-10%',
                        }}
                    >
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-2xl shadow-yellow-500/50 flex items-center justify-center text-lg font-bold text-white border-4 border-yellow-200">
                            $
                        </div>
                    </motion.div>
                ))}
            </>
        );
    }

    // Sparkles for consistent and task_master - BIGGER
    if (type === 'consistent' || type === 'task_master') {
        return (
            <>
                {[...Array(35)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 2, 0],
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: "easeInOut"
                        }}
                        className="absolute"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                    >
                        <Sparkles className="h-6 w-6 text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]" />
                    </motion.div>
                ))}
            </>
        );
    }

    // Hearts/Social animation for social_star - BIGGER
    if (type === 'social_star') {
        return (
            <>
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: 0, opacity: 0, scale: 0 }}
                        animate={{
                            y: [0, -120],
                            opacity: [0, 1, 1, 0],
                            scale: [0, 1.5, 1.2, 0.5],
                        }}
                        transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            delay: i * 0.25,
                            ease: "easeOut"
                        }}
                        className="absolute"
                        style={{
                            left: `${Math.random() * 100}%`,
                            bottom: '-10%',
                        }}
                    >
                        <Users className="h-10 w-10 text-pink-400 drop-shadow-[0_0_15px_rgba(244,114,182,0.8)]" />
                    </motion.div>
                ))}
            </>
        );
    }

    // Footprints trail for first_step - BIGGER
    if (type === 'first_step') {
        return (
            <>
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0, x: 0 }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            scale: [0, 1.5, 1.2, 0.5],
                            x: [0, 80]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeOut"
                        }}
                        className="absolute"
                        style={{
                            left: `${5 + i * 6}%`,
                            top: `${30 + (i % 2) * 30}%`,
                        }}
                    >
                        <Footprints className="h-8 w-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                    </motion.div>
                ))}
            </>
        );
    }

    // AI/Tech particles for ai_verified - BIGGER
    if (type === 'ai_verified') {
        return (
            <>
                {[...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                            x: [0, (Math.random() - 0.5) * 200],
                            y: [0, (Math.random() - 0.5) * 200],
                        }}
                        transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            delay: i * 0.12,
                            ease: "easeInOut"
                        }}
                        className="absolute"
                        style={{
                            left: '50%',
                            top: '50%',
                        }}
                    >
                        <div className="h-4 w-4 rounded-full bg-cyan-400 shadow-2xl shadow-cyan-400/80" />
                    </motion.div>
                ))}
            </>
        );
    }

    // Default sparkle animation - BIGGER and MORE VISIBLE
    return (
        <>
            {[...Array(25)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 2, 0],
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: "easeInOut"
                    }}
                    className="absolute"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                >
                    <div className="h-5 w-5 rounded-full bg-white shadow-2xl shadow-white/80" />
                </motion.div>
            ))}
        </>
    );
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
                    : 'bg-slate-200/80 dark:bg-slate-700/80'
            )}>
                <Icon className={cn(
                    size === 'xl' ? 'h-16 w-16' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8',
                    unlocked ? 'text-amber-600' : 'text-slate-400 opacity-50'
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
    const [showConfetti, setShowConfetti] = useState(false);
    
    const gradient = colorGradients[badge.color] || 'from-gray-400 to-gray-500';
    const Icon = achievementIcons[badge.type] || Award;
    
    const currentLevelData = levels.find(l => l.level === selectedLevel);
    const isCurrentUnlocked = currentLevelData?.unlocked || false;
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

            {/* Confetti with Framer Motion */}
            <AnimatePresence>
                {showConfetti && (
                    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                        {[...Array(50)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: -10, opacity: 1, rotate: 0 }}
                                animate={{ 
                                    y: '100vh', 
                                    opacity: 0,
                                    rotate: 720
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    delay: Math.random() * 2,
                                    ease: "easeOut"
                                }}
                                className="fixed w-3 h-3 rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    backgroundColor: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
                                }}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <div className="p-4 md:p-6 space-y-6">
                {/* Back Button with Animation */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.get('/user/achievements')}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors group"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm font-medium">Kembali ke Pencapaian</span>
                </motion.button>

                {/* Hero Section with Advanced Animations */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                        'relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-2xl',
                        `bg-gradient-to-br ${gradient}`
                    )}
                >
                    {/* Animated Background Particles */}
                    <div className="absolute inset-0 overflow-hidden z-0">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 90, 0],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, -90, 0],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-2xl"
                        />
                    </div>

                    {/* Themed Particles Animation - Higher z-index */}
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        <ThemedParticles type={badge.type} isUnlocked={isCurrentUnlocked} />
                    </div>
                    
                    <div className="relative z-20 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        {/* Badge Display with Pulse Animation */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                            className="relative"
                        >
                            <motion.div
                                animate={isCurrentUnlocked ? {
                                    boxShadow: [
                                        '0 0 0 0 rgba(251, 191, 36, 0.4)',
                                        '0 0 0 10px rgba(251, 191, 36, 0)',
                                        '0 0 0 0 rgba(251, 191, 36, 0)'
                                    ]
                                } : {}}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className={cn(
                                    'rounded-full p-3',
                                    isCurrentUnlocked ? 'bg-white/20 ring-4 ring-white/30' : 'bg-white/10'
                                )}
                            >
                                <BadgeImage 
                                    type={badge.type} 
                                    level={selectedLevel} 
                                    unlocked={isCurrentUnlocked}
                                    size="xl"
                                />
                            </motion.div>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                            >
                                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-sm font-bold">
                                    <span>Lv {selectedLevel}</span>
                                    <span className="text-white/60">/</span>
                                    <span className="text-white/60">{badge.maxLevel}</span>
                                </div>
                            </motion.div>
                        </motion.div>
                        
                        {/* Badge Info with Staggered Animation */}
                        <div className="flex-1 text-center md:text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center justify-center md:justify-start gap-2 mb-2"
                            >
                                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-medium uppercase tracking-wider">
                                    {badge.category}
                                </span>
                                {isCurrentUnlocked && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/30 text-xs font-medium"
                                    >
                                        <CheckCircle className="h-3 w-3" />
                                        Unlocked
                                    </motion.span>
                                )}
                            </motion.div>
                            
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-2xl md:text-3xl font-bold mb-2"
                            >
                                {currentLevelData?.name || badge.name}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="text-white/80 text-base md:text-lg mb-4"
                            >
                                {currentLevelData?.description || badge.description}
                            </motion.p>
                            
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                                className="flex items-center justify-center md:justify-start gap-2"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                >
                                    <Star className="h-5 w-5 text-amber-300" />
                                </motion.div>
                                <span className="text-2xl font-bold">
                                    <AnimatedCounter value={currentLevelData?.points || 0} />
                                </span>
                                <span className="text-white/60">poin</span>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Level Selector with Advanced Animations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/90"
                >
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2"
                    >
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Level Badge
                    </motion.h2>
                    
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                        {levels.map((level, index) => (
                            <motion.button
                                key={level.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + index * 0.1, type: "spring", stiffness: 200 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedLevel(level.level)}
                                className={cn(
                                    'relative rounded-2xl p-3 md:p-4 transition-all duration-300 border-2',
                                    selectedLevel === level.level
                                        ? level.unlocked
                                            ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 shadow-lg shadow-amber-500/20'
                                            : 'border-slate-400 bg-slate-100 dark:bg-slate-800/50'
                                        : 'border-transparent bg-slate-100 dark:bg-slate-800/30'
                                )}
                            >
                                <div className="flex flex-col items-center gap-2 md:gap-3">
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
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            <AnimatedCounter value={level.requirementValue} /> target
                                        </p>
                                    </div>
                                    
                                    {level.unlocked && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <CheckCircle className="absolute top-2 right-2 h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
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
                    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/90"
                >
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="font-bold text-lg text-slate-900 dark:text-white mb-4"
                    >
                        📊 Progress Saat Ini
                    </motion.h2>
                    
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center justify-between"
                        >
                            <span className="text-slate-600 dark:text-slate-400">
                                {currentLevelData?.requirement}
                            </span>
                            <span className={cn(
                                'font-bold text-lg',
                                progress.percentage >= 100 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
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
                            className="text-center text-sm text-slate-500"
                        >
                            {progress.percentage >= 100 
                                ? '🎉 Target tercapai! Badge sudah terbuka.'
                                : `${Math.round(100 - progress.percentage)}% lagi untuk membuka badge ini`
                            }
                        </motion.p>
                    </div>
                </motion.div>

                {/* How to Earn with Staggered Animations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/90"
                >
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2"
                    >
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        Cara Mendapatkan
                    </motion.h2>
                    
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
                                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800'
                                            : 'bg-slate-50 dark:bg-slate-800/30'
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
                                                : 'text-slate-900 dark:text-white'
                                        )}>
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
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
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/90"
                >
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2"
                    >
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        Tips & Trik
                    </motion.h2>
                    
                    <ul className="grid gap-3 sm:grid-cols-2">
                        {tips.map((tip, index) => (
                            <motion.li
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 + index * 0.05, type: "spring", stiffness: 200 }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 cursor-pointer"
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
                                <span className="text-sm text-slate-700 dark:text-slate-300">
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
                        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/90"
                    >
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="font-bold text-lg text-slate-900 dark:text-white mb-4"
                        >
                            🏆 Badge Lainnya
                        </motion.h2>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                            {relatedBadges.map((related, index) => (
                                <motion.button
                                    key={related.type}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.8 + index * 0.05, type: "spring", stiffness: 200 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => router.get(`/user/achievements/${related.type}`)}
                                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 group"
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
                                    <motion.div
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    >
                                        <ChevronRight className="h-4 w-4 text-slate-400" />
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
