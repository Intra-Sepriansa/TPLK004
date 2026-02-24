import { Head, Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentLayout from '@/layouts/student-layout';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { AchievementBadge } from '@/components/ui/achievement-badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useCountdown } from '@/hooks/use-countdown';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from 'recharts';
import {
    Calendar,
    CheckCircle,
    Clock,
    Flame,
    MapPin,
    QrCode,
    TrendingUp,
    User,
    Bell,
    ChevronRight,
    Camera,
    FileText,
    Award,
    Zap,
    BarChart3,
    PieChart as PieChartIcon,
    Target,
    Trophy,
    Star,
    Sparkles,
    Activity,
    BookOpen,
    MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MahasiswaInfo {
    id: number;
    nama: string;
    nim: string;
    avatar_url?: string;
}

interface UpcomingSession {
    id: number;
    title: string;
    course_name: string;
    meeting_number: number;
    start_at: string;
    end_at: string;
}

interface RecentActivity {
    id: number;
    type: 'attendance' | 'selfie_approved' | 'selfie_rejected' | 'achievement';
    message: string;
    time: string;
    status?: 'success' | 'warning' | 'error';
}

interface Achievement {
    type: 'streak' | 'perfect' | 'early' | 'consistent' | 'champion' | 'legend';
    value?: number;
    unlocked: boolean;
}

interface ChartDataItem {
    label: string;
    present?: number;
    late?: number;
    absent?: number;
    total?: number;
    value?: number;
}

interface ChartData {
    weekly: ChartDataItem[];
    monthly: ChartDataItem[];
    daily: ChartDataItem[];
    distribution: ChartDataItem[];
}

interface DashboardStats {
    totalAttendance: number;
    totalSessions: number;
    attendanceRate: number;
    currentStreak: number;
    longestStreak: number;
    onTimeRate: number;
    thisWeekAttendance: number;
    thisWeekTotal: number;
}

interface PageProps {
    mahasiswa: MahasiswaInfo;
    stats: DashboardStats;
    upcomingSessions: UpcomingSession[];
    recentActivity: RecentActivity[];
    achievements: Achievement[];
    notifications: { unread: number };
    chartData: ChartData;
}

const CHART_COLORS = {
    present: '#10b981',
    late: '#f59e0b',
    absent: '#f43f5e',
};

// Animation variants - ULTRA PREMIUM ENHANCED
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
            when: "beforeChildren" as const,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 60,
        scale: 0.85,
        rotateX: -15,
        filter: 'blur(8px)',
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        filter: 'blur(0px)',
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 15,
            mass: 0.8,
        },
    },
};

const cardHoverVariants = {
    rest: {
        scale: 1,
        y: 0,
        rotateY: 0,
        rotateX: 0,
        filter: 'brightness(1) drop-shadow(0 0px 0px rgba(0,0,0,0))',
    },
    hover: {
        scale: 1.05,
        y: -12,
        rotateY: 4,
        rotateX: -4,
        filter: 'brightness(1.05) drop-shadow(0 20px 30px rgba(0,0,0,0.15))',
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 15,
            mass: 0.8,
        },
    },
    tap: {
        scale: 0.96,
        rotateY: 0,
        rotateX: 0,
        filter: 'brightness(0.95)',
        transition: {
            type: 'spring' as const,
            stiffness: 500,
            damping: 25,
        },
    },
};

const floatingVariants = {
    float: {
        y: [0, -12, 0],
        x: [0, 3, 0],
        rotate: [0, 2, -2, 0],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

const pulseVariants = {
    pulse: {
        scale: [1, 1.08, 1],
        opacity: [1, 0.85, 1],
        boxShadow: [
            '0 0 0 0 rgba(16, 185, 129, 0)',
            '0 0 0 15px rgba(16, 185, 129, 0.2)',
            '0 0 0 0 rgba(16, 185, 129, 0)',
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut" as const,
        },
    },
};

const shimmerVariants = {
    shimmer: {
        backgroundPosition: ['200% 0', '-200% 0'],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "linear",
        },
    },
};

const slideInVariants = {
    hidden: {
        x: -50,
        opacity: 0,
        scale: 0.9,
    },
    visible: (i: number) => ({
        x: 0,
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 120,
            damping: 18,
            delay: i * 0.04,
        },
    }),
};

const bounceVariants = {
    bounce: {
        y: [0, -15, 0],
        transition: {
            duration: 0.75,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

const rotateVariants = {
    rotate: {
        rotate: [0, 360],
        transition: {
            duration: 20,
            repeat: Infinity,
            ease: "linear",
        },
    },
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-3 shadow-xl"
        >
            <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{entry.value}</span>
                </div>
            ))}
        </motion.div>
    );
};

function CountdownTimer({ targetDate }: { targetDate: Date }) {
    const { hours, minutes, seconds, isComplete } = useCountdown({
        targetDate,
        autoStart: true,
    });

    if (isComplete) {
        return (
            <span className="text-emerald-600 font-semibold animate-pulse">
                Sedang berlangsung!
            </span>
        );
    }

    return (
        <div className="flex items-center gap-1 font-mono">
            <span className="bg-gray-900 text-white px-2 py-1 rounded text-sm dark:bg-white dark:text-gray-900">
                {String(hours).padStart(2, '0')}
            </span>
            <span className="text-gray-400">:</span>
            <span className="bg-gray-900 text-white px-2 py-1 rounded text-sm dark:bg-white dark:text-gray-900">
                {String(minutes).padStart(2, '0')}
            </span>
            <span className="text-gray-400">:</span>
            <span className="bg-gray-900 text-white px-2 py-1 rounded text-sm dark:bg-white dark:text-gray-900">
                {String(seconds).padStart(2, '0')}
            </span>
        </div>
    );
}

function QuickStatCard({
    icon: Icon,
    label,
    value,
    suffix,
    subtext,
    color,
    trend,
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    suffix?: string;
    subtext?: string;
    color: 'emerald' | 'amber' | 'sky' | 'violet' | 'rose';
    trend?: 'up' | 'down' | 'neutral';
}) {
    const colors = {
        emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
        violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    };

    const gradients = {
        emerald: 'from-emerald-500/20 via-emerald-400/10 to-emerald-600/20',
        amber: 'from-amber-500/20 via-amber-400/10 to-amber-600/20',
        sky: 'from-sky-500/20 via-sky-400/10 to-sky-600/20',
        violet: 'from-violet-500/20 via-violet-400/10 to-violet-600/20',
        rose: 'from-rose-500/20 via-rose-400/10 to-rose-600/20',
    };

    const glowColors = {
        emerald: 'rgba(16, 185, 129, 0.3)',
        amber: 'rgba(245, 158, 11, 0.3)',
        sky: 'rgba(14, 165, 233, 0.3)',
        violet: 'rgba(139, 92, 246, 0.3)',
        rose: 'rgba(244, 63, 94, 0.3)',
    };

    return (
        <motion.div
            variants={itemVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4 shadow-lg hover:shadow-2xl transition-all cursor-pointer group perspective-1000"
            style={{ transformStyle: 'preserve-3d' }}
        >
            {/* Animated Background Gradient */}
            <motion.div
                className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500', gradients[color])}
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1 }}
            />

            {/* Shimmer Effect */}
            <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    backgroundSize: '200% 100%',
                }}
                animate={{
                    backgroundPosition: ['200% 0', '-200% 0'],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            {/* Glow Effect on Hover */}
            <motion.div
                className="absolute inset-0 rounded-2xl"
                initial={{ opacity: 0 }}
                whileHover={{
                    opacity: 1,
                    boxShadow: `0 0 30px ${glowColors[color]}`,
                }}
                transition={{ duration: 0.3 }}
            />

            {/* Advanced Animated Inner Glow Orb */}
            <motion.div
                className="absolute left-0 top-0 h-32 w-32 rounded-full blur-2xl opacity-40 mix-blend-screen pointer-events-none"
                style={{ background: `radial-gradient(circle, ${glowColors[color]}, transparent)` }}
                animate={{
                    x: [-20, 20, -20],
                    y: [-20, 40, -20],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <div className="relative flex items-center gap-3">
                <motion.div
                    whileHover={{
                        rotate: [0, -10, 10, -10, 0],
                        scale: 1.15,
                    }}
                    transition={{ duration: 0.5 }}
                    className={cn('flex h-12 w-12 items-center justify-center rounded-xl shadow-lg', colors[color])}
                >
                    <Icon className="h-6 w-6" />
                </motion.div>
                <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <motion.p
                            className="text-2xl font-bold text-gray-900 dark:text-white"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        >
                            <AnimatedCounter value={value} suffix={suffix} />
                        </motion.p>
                        {trend && (
                            <motion.span
                                initial={{ opacity: 0, x: -10, scale: 0 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                                className={cn(
                                    'text-xs font-medium',
                                    trend === 'up' && 'text-emerald-600',
                                    trend === 'down' && 'text-rose-600',
                                    trend === 'neutral' && 'text-gray-400'
                                )}
                            >
                                {trend === 'up' && '↑'}
                                {trend === 'down' && '↓'}
                                {trend === 'neutral' && '→'}
                            </motion.span>
                        )}
                    </div>
                    {subtext && (
                        <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-[10px] text-gray-400 mt-0.5"
                        >
                            {subtext}
                        </motion.p>
                    )}
                </div>
            </div>

            {/* Sparkle Effect on Hover */}
            <AnimatePresence>
                <motion.div
                    className="absolute top-2 right-2"
                    initial={{ scale: 0, rotate: 0, opacity: 0 }}
                    whileHover={{
                        scale: [0, 1.2, 1],
                        rotate: [0, 180, 360],
                        opacity: [0, 1, 1],
                    }}
                    transition={{ duration: 0.6 }}
                >
                    <Sparkles className="h-4 w-4 text-amber-400" />
                </motion.div>
            </AnimatePresence>

            {/* Corner Accent */}
            <motion.div
                className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full opacity-20"
                style={{ background: `radial-gradient(circle, ${glowColors[color]}, transparent)` }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </motion.div>
    );
}

export default function UserDashboard() {
    const { props } = usePage<{ props: PageProps }>();
    const {
        mahasiswa = { id: 0, nama: 'Mahasiswa', nim: '000000000000' },
        stats = {
            totalAttendance: 0,
            totalSessions: 0,
            attendanceRate: 0,
            currentStreak: 0,
            longestStreak: 0,
            onTimeRate: 0,
            thisWeekAttendance: 0,
            thisWeekTotal: 0,
        },
        upcomingSessions = [],
        recentActivity = [],
        achievements = [],
        notifications = { unread: 0 },
        chartData = { weekly: [], monthly: [], daily: [], distribution: [] },
    } = props as unknown as PageProps;

    const nextSession = upcomingSessions[0];

    // Transform chart data for Recharts
    const weeklyData = chartData.weekly.map(item => ({
        name: item.label,
        Hadir: item.present || 0,
        Terlambat: item.late || 0,
        'Tidak Hadir': item.absent || 0,
    }));

    const monthlyData = chartData.monthly.map(item => ({
        name: item.label,
        Hadir: item.present || 0,
        Terlambat: item.late || 0,
        'Tidak Hadir': item.absent || 0,
        Total: item.total || 0,
    }));

    const pieData = [
        { name: 'Hadir', value: chartData.distribution.find(d => d.label === 'Hadir')?.value || 0, color: CHART_COLORS.present },
        { name: 'Terlambat', value: chartData.distribution.find(d => d.label === 'Terlambat')?.value || 0, color: CHART_COLORS.late },
        { name: 'Tidak Hadir', value: chartData.distribution.find(d => d.label === 'Tidak Hadir')?.value || 0, color: CHART_COLORS.absent },
    ].filter(d => d.value > 0);

    const activityIcons = {
        attendance: CheckCircle,
        selfie_approved: Camera,
        selfie_rejected: Camera,
        achievement: Award,
    };

    const activityColors = {
        success: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
        warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
        error: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30',
    };

    return (
        <StudentLayout>
            <Head title="Dashboard" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 p-6"
            >
                {/* Welcome Card - ULTRA ADVANCED with Student Theme */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, rotateY: 1 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-8 text-white shadow-2xl"
                    style={{ transformStyle: 'preserve-3d', perspective: '1500px' }}
                >
                    {/* Ultra Advanced Animated Background Orbs */}
                    <motion.div
                        animate={{
                            scale: [1, 1.4, 1],
                            rotate: [0, 180, 360],
                            opacity: [0.1, 0.2, 0.1],
                            x: [0, 50, 0],
                            y: [0, -30, 0],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.5, 1],
                            rotate: [360, 180, 0],
                            opacity: [0.1, 0.15, 0.1],
                            x: [0, -40, 0],
                            y: [0, 40, 0],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-gradient-to-br from-teal-400/30 to-cyan-500/30 blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -90, 0],
                            opacity: [0.08, 0.12, 0.08],
                            x: [0, 30, 0],
                            y: [0, -20, 0],
                        }}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2,
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-56 w-56 rounded-full bg-gradient-to-br from-blue-400/20 to-teal-400/20 blur-3xl"
                    />

                    {/* 30 Floating Particles with Advanced Physics */}
                    {[...Array(30)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0, y: 0 }}
                            animate={{
                                opacity: [0, 0.8, 1, 0.6, 0],
                                scale: [0, 1.8, 1.2, 0.8, 0],
                                y: [0, -50, -100, -150, -200],
                                x: [0, Math.sin(i * 0.5) * 40, Math.cos(i * 0.3) * 30, Math.sin(i) * 20, 0],
                                rotate: [0, 180, 360, 540, 720],
                            }}
                            transition={{
                                duration: 5 + Math.random() * 3,
                                repeat: Infinity,
                                delay: i * 0.3,
                                ease: "easeOut"
                            }}
                            className="absolute rounded-full shadow-lg"
                            style={{
                                width: `${3 + Math.random() * 10}px`,
                                height: `${3 + Math.random() * 10}px`,
                                left: `${10 + (i * 3) % 80}%`,
                                top: `${20 + (i % 4) * 20}%`,
                                background: i % 3 === 0
                                    ? 'rgba(255, 255, 255, 0.6)'
                                    : i % 3 === 1
                                        ? 'rgba(6, 182, 212, 0.5)'
                                        : 'rgba(59, 130, 246, 0.5)',
                                filter: 'blur(1px)',
                                boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                            }}
                        />
                    ))}

                    {/* Floating Icons with Advanced Animations */}
                    <motion.div
                        animate={{
                            y: [0, -15, 0],
                            x: [0, 10, 0],
                            rotate: [0, 5, -5, 0],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-10 right-20 text-white/20"
                    >
                        <BookOpen className="h-16 w-16" />
                    </motion.div>
                    <motion.div
                        animate={{
                            y: [0, 20, 0],
                            x: [0, -15, 0],
                            rotate: [0, -10, 10, 0],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1,
                        }}
                        className="absolute bottom-10 left-20 text-white/20"
                    >
                        <Target className="h-20 w-20" />
                    </motion.div>

                    {/* Animated Rings */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 2, 3],
                                opacity: [0.3, 0.15, 0],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                delay: i * 1.3,
                                ease: "easeOut"
                            }}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30"
                            style={{
                                width: '100px',
                                height: '100px',
                            }}
                        />
                    ))}

                    <div className="relative flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-5">
                            <motion.div
                                whileHover={{
                                    scale: 1.2,
                                    rotate: [0, -8, 8, 0],
                                    boxShadow: "0 0 40px rgba(255,255,255,0.6)"
                                }}
                                whileTap={{ scale: 0.92 }}
                                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                                className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/25 backdrop-blur-xl ring-4 ring-white/40 cursor-pointer shadow-2xl"
                            >
                                {/* Glow effect behind avatar */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 0.8, 0.5],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-300/50 to-blue-300/50 blur-xl"
                                />
                                {mahasiswa.avatar_url ? (
                                    <motion.img
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                        src={mahasiswa.avatar_url}
                                        alt={mahasiswa.nama}
                                        className="relative h-16 w-16 rounded-xl object-cover shadow-lg"
                                    />
                                ) : (
                                    <motion.div
                                        whileHover={{ scale: 1.15, y: -3 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                        className="relative"
                                    >
                                        <User className="h-10 w-10" />
                                    </motion.div>
                                )}
                            </motion.div>
                            <div>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="text-sm text-cyan-100 font-semibold tracking-wide"
                                >
                                    Selamat datang kembali,
                                </motion.p>
                                <motion.h1
                                    initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
                                    className="text-3xl font-extrabold tracking-tight"
                                >
                                    {mahasiswa.nama}
                                </motion.h1>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4, type: "spring" }}
                                    className="flex items-center gap-2 mt-1"
                                >
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.7, 1, 0.7],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                        }}
                                        className="h-2 w-2 rounded-full bg-cyan-300"
                                    />
                                    <p className="text-sm text-cyan-100 font-mono">
                                        NIM: {mahasiswa.nim}
                                    </p>
                                </motion.div>
                            </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-3">
                            {stats.currentStreak > 0 && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                                    whileHover={{ scale: 1.08, y: -4 }}
                                    className="relative flex items-center gap-2 rounded-full bg-white/25 px-5 py-3 backdrop-blur-xl ring-2 ring-white/40 cursor-pointer shadow-xl"
                                >
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.15, 1],
                                            rotate: [0, 5, -5, 0],
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Flame className="h-6 w-6 text-orange-300" />
                                    </motion.div>
                                    <motion.span
                                        className="font-extrabold text-xl"
                                        animate={{ scale: [1, 1.12, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        {stats.currentStreak}
                                    </motion.span>
                                    <span className="text-sm text-cyan-100 font-semibold">hari streak</span>
                                    {/* Pulse effect */}
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.5, 0, 0.5],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                        }}
                                        className="absolute inset-0 rounded-full bg-orange-300/30"
                                    />
                                </motion.div>
                            )}
                            <Link href="/user/absen">
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                                    whileHover={{ scale: 1.1, y: -4 }}
                                    whileTap={{ scale: 0.93 }}
                                >
                                    <Button className="bg-white text-blue-600 hover:bg-cyan-50 shadow-2xl font-bold text-base px-6 py-6 relative overflow-hidden group">
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-blue-400/30"
                                            initial={{ x: '-100%' }}
                                            whileHover={{ x: '100%' }}
                                            transition={{ duration: 0.6 }}
                                        />
                                        <motion.div
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6 }}
                                            className="relative z-10"
                                        >
                                            <QrCode className="h-5 w-5 mr-2" />
                                        </motion.div>
                                        <span className="relative z-10">Absen Sekarang</span>
                                        {/* Sparkle effect */}
                                        <motion.div
                                            animate={{
                                                scale: [0, 1, 0],
                                                rotate: [0, 180, 360],
                                                opacity: [0, 1, 0],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                delay: 0.5,
                                            }}
                                            className="absolute top-1 right-1"
                                        >
                                            <Sparkles className="h-3 w-3 text-cyan-400" />
                                        </motion.div>
                                    </Button>
                                </motion.div>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile CTA with Ultra Enhanced Animation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="mt-6 flex gap-2 sm:hidden"
                    >
                        <Link href="/user/absen" className="flex-1">
                            <motion.div
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.03 }}
                            >
                                <Button className="w-full bg-white text-blue-600 hover:bg-cyan-50 shadow-xl font-bold py-6 relative overflow-hidden group">
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20"
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                    />
                                    <QrCode className="h-5 w-5 mr-2 relative z-10" />
                                    <span className="relative z-10">Absen Sekarang</span>
                                </Button>
                            </motion.div>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Quick Stats - Enhanced */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                >
                    <QuickStatCard
                        icon={CheckCircle}
                        label="Total Kehadiran"
                        value={stats.totalAttendance}
                        subtext={`dari ${stats.totalSessions} sesi`}
                        color="sky"
                        trend="up"
                    />
                    <QuickStatCard
                        icon={TrendingUp}
                        label="Persentase"
                        value={stats.attendanceRate}
                        suffix="%"
                        subtext="kehadiran"
                        color="emerald"
                        trend={stats.attendanceRate >= 75 ? "up" : "down"}
                    />
                    <QuickStatCard
                        icon={Flame}
                        label="Streak Saat Ini"
                        value={stats.currentStreak}
                        suffix=" hari"
                        subtext={`terbaik: ${stats.longestStreak}`}
                        color="amber"
                        trend={stats.currentStreak > 0 ? "up" : "neutral"}
                    />
                    <QuickStatCard
                        icon={Zap}
                        label="Tepat Waktu"
                        value={stats.onTimeRate}
                        suffix="%"
                        subtext="minggu ini"
                        color="violet"
                        trend={stats.onTimeRate >= 80 ? "up" : "neutral"}
                    />
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Upcoming & Activity */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Upcoming Session - Enhanced */}
                        {nextSession && (
                            <motion.div
                                variants={itemVariants}
                                whileHover={{
                                    scale: 1.02,
                                    y: -4,
                                    boxShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.2)",
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm backdrop-blur dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/30 relative overflow-hidden group"
                            >
                                {/* Animated shine effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{ x: ['-100%', '100%'] }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "linear",
                                        repeatDelay: 2,
                                    }}
                                />

                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <motion.div
                                            animate={{
                                                rotate: [0, 10, -10, 0],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                            }}
                                        >
                                            <Clock className="h-5 w-5 text-amber-600" />
                                        </motion.div>
                                        <h2 className="font-semibold text-gray-900 dark:text-white">
                                            Sesi Berikutnya
                                        </h2>
                                    </div>
                                    <motion.span
                                        className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-medium shadow-lg"
                                        animate={{
                                            scale: [1, 1.05, 1],
                                            boxShadow: [
                                                '0 0 0 0 rgba(245, 158, 11, 0.4)',
                                                '0 0 0 8px rgba(245, 158, 11, 0)',
                                                '0 0 0 0 rgba(245, 158, 11, 0)',
                                            ],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        Segera
                                    </motion.span>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                            {nextSession.course_name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {nextSession.title || `Pertemuan ${nextSession.meeting_number}`}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(nextSession.start_at).toLocaleString('id-ID', {
                                                weekday: 'long',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </motion.div>
                                    <motion.div
                                        className="text-center"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                    >
                                        <p className="text-xs text-gray-500 mb-2">Dimulai dalam</p>
                                        <CountdownTimer targetDate={new Date(nextSession.start_at)} />
                                    </motion.div>
                                </div>

                                <Link href="/user/absen" className="block mt-4 relative z-10">
                                    <motion.div
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg relative overflow-hidden group">
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100"
                                                transition={{ duration: 0.3 }}
                                            />
                                            <MapPin className="h-4 w-4 mr-2 relative z-10" />
                                            <span className="relative z-10">Persiapkan Absensi</span>
                                        </Button>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        )}

                        {/* This Week Progress - Enhanced */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{
                                scale: 1.01,
                                y: -3,
                                boxShadow: "0 10px 20px -5px rgba(14, 165, 233, 0.2)",
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-black relative overflow-hidden group"
                        >
                            {/* Animated background gradient */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100"
                                transition={{ duration: 0.3 }}
                            />

                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    <motion.div
                                        whileHover={{
                                            scale: 1.2,
                                            rotate: [0, -10, 10, 0],
                                        }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Calendar className="h-5 w-5 text-sky-600" />
                                    </motion.div>
                                    <h2 className="font-semibold text-gray-900 dark:text-white">
                                        Progress Minggu Ini
                                    </h2>
                                </div>
                                <motion.span
                                    className="text-sm text-gray-500"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {stats.thisWeekAttendance}/{stats.thisWeekTotal} sesi
                                </motion.span>
                            </div>

                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                style={{ transformOrigin: 'left' }}
                                className="relative z-10"
                            >
                                <Progress
                                    value={stats.thisWeekTotal > 0 ? (stats.thisWeekAttendance / stats.thisWeekTotal) * 100 : 0}
                                    className="h-3"
                                    indicatorClassName="bg-gradient-to-r from-sky-500 to-emerald-500"
                                />
                            </motion.div>

                            <div className="mt-4 grid grid-cols-7 gap-1 relative z-10">
                                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, i) => (
                                    <motion.div
                                        key={day}
                                        className="text-center"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + i * 0.05, type: "spring", stiffness: 200 }}
                                    >
                                        <p className="text-[10px] text-gray-400 mb-1">{day}</p>
                                        <motion.div
                                            className={cn(
                                                'h-8 w-8 mx-auto rounded-lg flex items-center justify-center text-xs font-medium',
                                                i < stats.thisWeekAttendance
                                                    ? 'bg-emerald-500 text-white'
                                                    : i < stats.thisWeekTotal
                                                        ? 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                                                        : 'bg-gray-50 text-gray-300 dark:bg-gray-900'
                                            )}
                                            whileHover={{
                                                scale: 1.15,
                                                rotate: i < stats.thisWeekAttendance ? [0, -5, 5, 0] : 0,
                                            }}
                                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                        >
                                            {i < stats.thisWeekAttendance ? '✓' : '-'}
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Weekly Attendance Chart - Enhanced */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{
                                scale: 1.01,
                                y: -3,
                                boxShadow: "0 10px 20px -5px rgba(99, 102, 241, 0.2)",
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-black relative overflow-hidden group"
                        >
                            {/* Animated gradient background */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100"
                                transition={{ duration: 0.3 }}
                            />

                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    <motion.div
                                        whileHover={{
                                            scale: 1.2,
                                            rotate: [0, -10, 10, 0],
                                        }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                                    </motion.div>
                                    <h2 className="font-semibold text-gray-900 dark:text-white">
                                        Tren Kehadiran Mingguan
                                    </h2>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="relative z-10"
                            >
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={weeklyData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="Hadir" fill={CHART_COLORS.present} radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Terlambat" fill={CHART_COLORS.late} radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Tidak Hadir" fill={CHART_COLORS.absent} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </motion.div>

                        {/* Monthly Trend Chart - Enhanced */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{
                                scale: 1.01,
                                y: -3,
                                boxShadow: "0 10px 20px -5px rgba(16, 185, 129, 0.2)",
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-black relative overflow-hidden group"
                        >
                            {/* Animated gradient background */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100"
                                transition={{ duration: 0.3 }}
                            />

                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    <motion.div
                                        whileHover={{
                                            scale: 1.2,
                                            y: [-2, 2, -2],
                                        }}
                                        transition={{
                                            y: { duration: 1, repeat: Infinity },
                                            scale: { duration: 0.3 }
                                        }}
                                    >
                                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                                    </motion.div>
                                    <h2 className="font-semibold text-gray-900 dark:text-white">
                                        Tren Kehadiran 6 Bulan Terakhir
                                    </h2>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="relative z-10"
                            >
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={monthlyData}>
                                        <defs>
                                            <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={CHART_COLORS.present} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={CHART_COLORS.present} stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorTerlambat" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={CHART_COLORS.late} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={CHART_COLORS.late} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="Hadir"
                                            stroke={CHART_COLORS.present}
                                            fillOpacity={1}
                                            fill="url(#colorHadir)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="Terlambat"
                                            stroke={CHART_COLORS.late}
                                            fillOpacity={1}
                                            fill="url(#colorTerlambat)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </motion.div>

                        {/* Recent Activity - Enhanced */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{
                                scale: 1.01,
                                y: -3,
                                boxShadow: "0 10px 20px -5px rgba(139, 92, 246, 0.2)",
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-black relative overflow-hidden group"
                        >
                            {/* Animated gradient background */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100"
                                transition={{ duration: 0.3 }}
                            />

                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    <motion.div
                                        animate={{
                                            rotate: [0, 15, -15, 0],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        <Bell className="h-5 w-5 text-violet-600" />
                                    </motion.div>
                                    <h2 className="font-semibold text-gray-900 dark:text-white">
                                        Aktivitas Terbaru
                                    </h2>
                                </div>
                                <Link href="/user/rekapan" className="text-sm text-emerald-600 hover:underline">
                                    <motion.span
                                        whileHover={{ x: 3 }}
                                        transition={{ type: "spring", stiffness: 400 }}
                                    >
                                        Lihat semua
                                    </motion.span>
                                </Link>
                            </div>

                            <div className="space-y-3 relative z-10">
                                {recentActivity.length === 0 ? (
                                    <motion.p
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-sm text-gray-500 text-center py-4"
                                    >
                                        Belum ada aktivitas
                                    </motion.p>
                                ) : (
                                    recentActivity.slice(0, 5).map((activity, index) => {
                                        const Icon = activityIcons[activity.type] || CheckCircle;
                                        const colorClass = activityColors[activity.status || 'success'];
                                        return (
                                            <motion.div
                                                key={activity.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: index * 0.05,
                                                    type: "spring",
                                                    stiffness: 200,
                                                }}
                                                whileHover={{
                                                    scale: 1.02,
                                                    x: 5,
                                                    backgroundColor: "rgba(0,0,0,0.02)",
                                                }}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer"
                                            >
                                                <motion.div
                                                    className={cn('flex h-9 w-9 items-center justify-center rounded-full', colorClass)}
                                                    whileHover={{
                                                        scale: 1.15,
                                                        rotate: [0, -10, 10, 0],
                                                    }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                </motion.div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-900 dark:text-white truncate">
                                                        {activity.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{activity.time}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Achievements & Quick Links */}
                    <div className="space-y-6">
                        {/* Attendance Distribution Pie Chart - Enhanced */}
                        {pieData.length > 0 && (
                            <motion.div
                                variants={itemVariants}
                                whileHover={{
                                    scale: 1.02,
                                    y: -4,
                                    boxShadow: "0 10px 20px -5px rgba(139, 92, 246, 0.2)",
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-black relative overflow-hidden group"
                            >
                                {/* Animated gradient background */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100"
                                    transition={{ duration: 0.3 }}
                                />

                                <div className="flex items-center gap-2 mb-4 relative z-10">
                                    <motion.div
                                        whileHover={{
                                            scale: 1.2,
                                            rotate: 360,
                                        }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <PieChartIcon className="h-5 w-5 text-violet-600" />
                                    </motion.div>
                                    <h2 className="font-semibold text-gray-900 dark:text-white">
                                        Distribusi Kehadiran
                                    </h2>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="relative z-10"
                                >
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </motion.div>

                                <div className="flex justify-center gap-4 mt-2 relative z-10">
                                    {pieData.map((entry, index) => (
                                        <motion.div
                                            key={index}
                                            className="flex items-center gap-2 text-xs"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                            whileHover={{ scale: 1.1 }}
                                        >
                                            <motion.div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: entry.color }}
                                                whileHover={{ scale: 1.3 }}
                                            />
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {entry.name}: {entry.value}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Achievements - Enhanced */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{
                                scale: 1.02,
                                y: -4,
                                boxShadow: "0 10px 20px -5px rgba(245, 158, 11, 0.2)",
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-black relative overflow-hidden group"
                        >
                            {/* Animated gradient background */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100"
                                transition={{ duration: 0.3 }}
                            />

                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    <motion.div
                                        animate={{
                                            rotate: [0, -10, 10, -10, 0],
                                            scale: [1, 1.1, 1],
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                    >
                                        <Award className="h-5 w-5 text-amber-600" />
                                    </motion.div>
                                    <h2 className="font-semibold text-gray-900 dark:text-white">
                                        Pencapaian
                                    </h2>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 relative z-10">
                                {(achievements.length > 0 ? achievements : [
                                    { type: 'streak' as const, value: stats.currentStreak, unlocked: stats.currentStreak >= 3 },
                                    { type: 'perfect' as const, unlocked: stats.attendanceRate === 100 },
                                    { type: 'early' as const, unlocked: stats.onTimeRate >= 90 },
                                    { type: 'consistent' as const, unlocked: stats.attendanceRate >= 80 },
                                    { type: 'champion' as const, unlocked: false },
                                    { type: 'legend' as const, unlocked: false },
                                ]).slice(0, 6).map((achievement, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                        transition={{
                                            delay: i * 0.05,
                                            type: "spring",
                                            stiffness: 200,
                                        }}
                                        whileHover={{
                                            scale: achievement.unlocked ? 1.15 : 1.05,
                                            y: -5,
                                            rotate: achievement.unlocked ? [0, -5, 5, 0] : 0,
                                        }}
                                        className={cn(
                                            'flex flex-col items-center p-2 rounded-xl transition-all cursor-pointer',
                                            achievement.unlocked
                                                ? 'bg-white dark:bg-gray-900'
                                                : 'opacity-40 grayscale'
                                        )}
                                    >
                                        <AchievementBadge
                                            type={achievement.type}
                                            value={achievement.unlocked ? achievement.value : undefined}
                                            size="sm"
                                        />
                                    </motion.div>
                                ))}
                            </div>

                            <Link href="/user/achievements" className="block mt-4 relative z-10">
                                <motion.div
                                    whileHover={{ scale: 1.02, x: 3 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button variant="ghost" className="w-full text-sm">
                                        Lihat Semua Pencapaian
                                        <motion.div
                                            animate={{ x: [0, 3, 0] }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                            }}
                                        >
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </motion.div>
                                    </Button>
                                </motion.div>
                            </Link>
                        </motion.div>

                        {/* Quick Links - Enhanced */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{
                                scale: 1.01,
                                y: -3,
                                boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.1)",
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-black relative overflow-hidden group"
                        >
                            {/* Animated gradient background */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-slate-500/5 opacity-0 group-hover:opacity-100"
                                transition={{ duration: 0.3 }}
                            />

                            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 relative z-10">
                                Menu Cepat
                            </h2>

                            <div className="space-y-2 relative z-10">
                                {[
                                    { href: "/user/absen", icon: QrCode, label: "Absensi", color: "text-emerald-600" },
                                    { href: "/user/rekapan", icon: FileText, label: "Rekapan", color: "text-sky-600" },
                                    { href: "/user/bukti-masuk", icon: Camera, label: "Bukti Masuk", color: "text-violet-600" },
                                    { href: "/user/profile", icon: User, label: "Profil", color: "text-amber-600" },
                                ].map((item, index) => (
                                    <Link key={item.href} href={item.href}>
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: index * 0.05,
                                                type: "spring",
                                                stiffness: 200,
                                            }}
                                            whileHover={{
                                                scale: 1.03,
                                                x: 5,
                                                backgroundColor: "rgba(0,0,0,0.02)",
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Button variant="ghost" className="w-full justify-start relative overflow-hidden group/btn">
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100"
                                                    animate={{ x: ['-100%', '100%'] }}
                                                    transition={{
                                                        duration: 1.5,
                                                        repeat: Infinity,
                                                        ease: "linear",
                                                    }}
                                                />
                                                <motion.div
                                                    whileHover={{
                                                        scale: 1.2,
                                                        rotate: [0, -10, 10, 0],
                                                    }}
                                                    transition={{ duration: 0.5 }}
                                                    className="relative z-10"
                                                >
                                                    <item.icon className={cn("h-4 w-4 mr-3", item.color)} />
                                                </motion.div>
                                                <span className="relative z-10">{item.label}</span>
                                                <motion.div
                                                    animate={{ x: [0, 3, 0] }}
                                                    transition={{
                                                        duration: 1.5,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                    }}
                                                    className="ml-auto relative z-10"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </motion.div>
                                            </Button>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>

                        {/* Attendance Rate Card - Enhanced with Student Theme */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{
                                scale: 1.03,
                                y: -5,
                                boxShadow: "0 20px 25px -5px rgba(6, 182, 212, 0.4)",
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-6 text-white shadow-lg dark:border-cyan-800 relative overflow-hidden group cursor-pointer"
                        >
                            {/* Animated background orbs */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.3, 1],
                                    opacity: [0.15, 0.25, 0.15],
                                    x: [0, 30, 0],
                                    y: [0, -25, 0],
                                }}
                                transition={{
                                    duration: 8,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute top-0 right-0 w-40 h-40 rounded-full bg-cyan-400/30 blur-3xl"
                            />
                            <motion.div
                                animate={{
                                    scale: [1, 1.4, 1],
                                    opacity: [0.15, 0.2, 0.15],
                                    x: [0, -25, 0],
                                    y: [0, 25, 0],
                                }}
                                transition={{
                                    duration: 10,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1,
                                }}
                                className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-blue-400/30 blur-3xl"
                            />

                            {/* Floating particles */}
                            {[...Array(10)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        y: [0, -30, -60, -90],
                                        x: [0, Math.sin(i) * 20, Math.cos(i) * 15, 0],
                                        opacity: [0, 0.6, 0.4, 0],
                                        scale: [0, 1.2, 0.8, 0],
                                    }}
                                    transition={{
                                        duration: 4 + Math.random() * 2,
                                        repeat: Infinity,
                                        delay: i * 0.4,
                                        ease: "easeOut"
                                    }}
                                    className="absolute rounded-full bg-white/40"
                                    style={{
                                        width: `${3 + Math.random() * 6}px`,
                                        height: `${3 + Math.random() * 6}px`,
                                        left: `${20 + i * 8}%`,
                                        bottom: '10%',
                                    }}
                                />
                            ))}

                            <motion.p
                                className="text-sm text-cyan-100 font-semibold relative z-10"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                Tingkat Kehadiran
                            </motion.p>
                            <div className="flex items-end gap-2 mt-2 relative z-10">
                                <motion.span
                                    className="text-5xl font-extrabold"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 200,
                                        delay: 0.3,
                                    }}
                                >
                                    <AnimatedCounter value={stats.attendanceRate} suffix="%" />
                                </motion.span>
                                {stats.attendanceRate >= 75 ? (
                                    <motion.span
                                        className="text-cyan-200 text-sm mb-2 flex items-center gap-1 font-semibold"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.3, 1],
                                                rotate: [0, 15, -15, 0],
                                            }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            ✨
                                        </motion.div>
                                        Luar Biasa!
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        className="text-amber-300 text-sm mb-2 font-semibold"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Perlu ditingkatkan
                                    </motion.span>
                                )}
                            </div>
                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 1, delay: 0.6 }}
                                style={{ transformOrigin: 'left' }}
                                className="relative z-10"
                            >
                                <Progress
                                    value={stats.attendanceRate}
                                    className="mt-4 h-3 bg-white/20 backdrop-blur"
                                    indicatorClassName={cn(
                                        stats.attendanceRate >= 75
                                            ? 'bg-gradient-to-r from-cyan-300 to-teal-300'
                                            : 'bg-gradient-to-r from-amber-300 to-orange-300'
                                    )}
                                />
                            </motion.div>
                            <motion.p
                                className="text-xs text-cyan-100 mt-3 relative z-10 font-medium"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                Minimal 75% untuk memenuhi syarat kehadiran
                            </motion.p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </StudentLayout>
    );
}
