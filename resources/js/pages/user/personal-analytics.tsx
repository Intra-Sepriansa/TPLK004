import StudentLayout from '@/layouts/student-layout';
import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart3, TrendingUp, TrendingDown, Flame, Award, Calendar, CheckCircle, Clock, XCircle, AlertTriangle, Lightbulb, Users, BookOpen, FileText, GraduationCap, Sparkles, Star, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useState } from 'react';

interface ActivityDay {
    date: string; count: number; level: number; types: string[]; dayOfWeek: number; week: number; month: number; monthName: string; isFuture?: boolean;
}

interface Props {
    mahasiswa: { id: number; nama: string; nim: string };
    overview: { total_sessions: number; present: number; late: number; absent: number; overall_rate: number; on_time_rate: number; this_month_rate: number; trend: number; trend_direction: 'up' | 'down' | 'stable' };
    streakData: { current_streak: number; longest_streak: number; last_attendance: string | null };
    courseBreakdown: Array<{ course_id: number; course_name: string; total: number; present: number; late: number; absent: number; rate: number; can_take_uas: boolean }>;
    weeklyTrend: Array<{ date: string; day: string; status: string; time: string | null }>;
    activityGraph: { activities: ActivityDay[]; weeks: ActivityDay[][]; months: Array<{ month: number; name: string }>; totalActivities: number; activeDays: number; longestStreak: number; currentStreak: number; year: number };
    comparison: { my_rate: number; class_average: number; difference: number; rank: number; total_students: number; percentile: number; status: 'above' | 'below' };
    badges: Array<{ id: number; name: string; description: string; icon: string; color: string; category: string; points: number; earned_at: string }>;
    tips: Array<{ type: 'success' | 'warning' | 'danger' | 'info'; title: string; message: string }>;
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 17,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 20,
        },
    },
};

export default function PersonalAnalytics({ mahasiswa, overview, streakData, courseBreakdown, weeklyTrend, activityGraph, comparison, badges, tips }: Props) {
    const [hoveredDay, setHoveredDay] = useState<string | null>(null);
    
    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'present': return 'bg-green-500';
            case 'late': return 'bg-yellow-500';
            case 'rejected': case 'absent': return 'bg-red-500';
            case 'permit': case 'sick': return 'bg-blue-500';
            default: return 'bg-gray-200 dark:bg-gray-700';
        }
    };

    const getTipIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'danger': return <XCircle className="h-5 w-5 text-red-500" />;
            default: return <Lightbulb className="h-5 w-5 text-blue-500" />;
        }
    };

    const getTipBg = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-50 dark:bg-green-900/20 border-green-200';
            case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200';
            case 'danger': return 'bg-red-50 dark:bg-red-900/20 border-red-200';
            default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200';
        }
    };

    const getActivityColor = (level: number) => {
        switch (level) {
            case -1: return 'bg-gray-100/50 dark:bg-gray-800/30';
            case 0: return 'bg-gray-200 dark:bg-gray-700';
            case 1: return 'bg-emerald-300 dark:bg-emerald-800';
            case 2: return 'bg-emerald-400 dark:bg-emerald-600';
            case 3: return 'bg-emerald-500 dark:bg-emerald-500';
            case 4: return 'bg-emerald-600 dark:bg-emerald-400';
            default: return 'bg-gray-200 dark:bg-gray-700';
        }
    };

    const getBadgeGradient = (color: string) => {
        const gradients: Record<string, string> = {
            orange: 'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
            yellow: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white',
            green: 'bg-gradient-to-br from-green-400 to-green-600 text-white',
            blue: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white',
            purple: 'bg-gradient-to-br from-purple-400 to-purple-600 text-white',
            red: 'bg-gradient-to-br from-red-400 to-red-600 text-white',
            emerald: 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white',
            pink: 'bg-gradient-to-br from-pink-400 to-pink-600 text-white',
        };
        return gradients[color] || 'bg-gradient-to-br from-gray-400 to-gray-600 text-white';
    };

    const getBadgeEmoji = (category: string) => {
        const emojis: Record<string, string> = { streak: '🔥', attendance: '✅', achievement: '🏆', special: '⭐' };
        return emojis[category] || '🎖️';
    };

    const formatActivityDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const getActivityTypeLabel = (types: string[]) => {
        const labels: string[] = [];
        if (types.includes('attendance')) labels.push('Absensi');
        if (types.includes('task')) labels.push('Tugas');
        if (types.includes('note')) labels.push('Catatan');
        return labels.join(', ');
    };

    return (
        <StudentLayout>
            <Head title="Personal Analytics" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-6"
            >
                {/* Header with Advanced Animations */}
                <motion.div
                    variants={cardVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl"
                >
                    {/* Animated Background Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.3, 1],
                                rotate: [0, 180, 360],
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
                                scale: [1, 1.4, 1],
                                rotate: [360, 180, 0],
                            }}
                            transition={{
                                duration: 15,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-2xl"
                        />
                        
                        {/* Floating Sparkles */}
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1.5, 0],
                                    y: [0, -30, -60],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeOut"
                                }}
                                className="absolute"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                            >
                                <Sparkles className="h-4 w-4 text-white/60" />
                            </motion.div>
                        ))}
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-4">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-4 ring-white/30"
                            >
                                <BarChart3 className="h-8 w-8" />
                            </motion.div>
                            <div>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-sm text-white/80 font-medium"
                                >
                                    Analisis Akademik
                                </motion.p>
                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-bold"
                                >
                                    Personal Analytics
                                </motion.h1>
                            </div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-4 text-white/90 text-lg"
                        >
                            Pantau perkembangan dan aktivitas akademik kamu secara real-time
                        </motion.p>
                    </div>
                </motion.div>

                {/* Overview Cards with Dock-Style Animations */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    {/* Rate Kehadiran Card */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ 
                            scale: 1.08, 
                            y: -10,
                            boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-white p-5 shadow-lg backdrop-blur dark:border-blue-800/50 dark:from-blue-950/30 dark:to-black/80 overflow-hidden"
                    >
                        {/* Glow Effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            animate={{
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        
                        <div className="relative flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                            >
                                {overview.trend_direction === 'up' ? <TrendingUp className="h-6 w-6" /> : overview.trend_direction === 'down' ? <TrendingDown className="h-6 w-6" /> : <BarChart3 className="h-6 w-6" />}
                            </motion.div>
                            <div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Rate Kehadiran</p>
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    <AnimatedCounter value={overview.overall_rate} suffix="%" duration={1500} />
                                </p>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    {overview.trend > 0 ? <TrendingUp className="h-3 w-3 text-green-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                                    {overview.trend > 0 ? '+' : ''}{overview.trend}% bulan lalu
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Streak Card */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ 
                            scale: 1.08, 
                            y: -10,
                            boxShadow: "0 20px 40px rgba(249, 115, 22, 0.3)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50 to-white p-5 shadow-lg backdrop-blur dark:border-orange-800/50 dark:from-orange-950/30 dark:to-black/80 overflow-hidden"
                    >
                        {/* Animated Fire Particles */}
                        {activityGraph.currentStreak > 0 && [...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: 0, opacity: 0 }}
                                animate={{
                                    y: [-10, -40],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.3,
                                    ease: "easeOut"
                                }}
                                className="absolute"
                                style={{
                                    left: `${20 + i * 15}%`,
                                    bottom: '10%',
                                }}
                            >
                                <div className="h-2 w-2 rounded-full bg-orange-400" />
                            </motion.div>
                        ))}
                        
                        <div className="relative flex items-center gap-3">
                            <motion.div
                                animate={activityGraph.currentStreak > 0 ? {
                                    scale: [1, 1.2, 1],
                                } : {}}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-lg ${activityGraph.currentStreak > 0 ? 'bg-orange-500 text-white shadow-orange-500/50' : 'bg-slate-300 text-slate-500'}`}
                            >
                                <Flame className="h-6 w-6" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Streak Aktivitas</p>
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                    <AnimatedCounter value={activityGraph.currentStreak} duration={1500} /> hari
                                </p>
                                <p className="text-xs text-slate-500">Terpanjang: {activityGraph.longestStreak} hari</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Total Aktivitas Card */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ 
                            scale: 1.08, 
                            y: -10,
                            boxShadow: "0 20px 40px rgba(16, 185, 129, 0.3)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-lg backdrop-blur dark:border-emerald-800/50 dark:from-emerald-950/30 dark:to-black/80 overflow-hidden"
                    >
                        {/* Pulsing Glow */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent"
                            animate={{
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        
                        <div className="relative flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/50"
                            >
                                <Calendar className="h-6 w-6" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total Aktivitas</p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    <AnimatedCounter value={activityGraph.totalActivities} duration={1500} />
                                </p>
                                <p className="text-xs text-slate-500">{activityGraph.activeDays} hari aktif</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Ranking Card */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ 
                            scale: 1.08, 
                            y: -10,
                            boxShadow: "0 20px 40px rgba(168, 85, 247, 0.3)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative rounded-2xl border border-purple-200/50 bg-gradient-to-br from-purple-50 to-white p-5 shadow-lg backdrop-blur dark:border-purple-800/50 dark:from-purple-950/30 dark:to-black/80 overflow-hidden"
                    >
                        {/* Floating Stars */}
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0],
                                    y: [0, -20],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.4,
                                    ease: "easeOut"
                                }}
                                className="absolute"
                                style={{
                                    left: `${30 + i * 20}%`,
                                    top: '20%',
                                }}
                            >
                                <Star className="h-3 w-3 text-purple-400 fill-purple-400" />
                            </motion.div>
                        ))}
                        
                        <div className="relative flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-500/50"
                            >
                                <Users className="h-6 w-6" />
                            </motion.div>
                            <div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Ranking Kelas</p>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    #<AnimatedCounter value={comparison.rank} duration={1500} />
                                </p>
                                <p className="text-xs text-slate-500">Top {comparison.percentile}%</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Activity Graph */}
                <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80 overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <motion.div whileHover={{ rotate: 10 }}>
                                <Calendar className="h-5 w-5 text-indigo-600" />
                            </motion.div>
                            <h2 className="font-semibold text-slate-900 dark:text-white">Aktivitas Tahun {activityGraph.year}</h2>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{activityGraph.totalActivities} aktivitas sejak 1 Januari {activityGraph.year}</p>
                    </div>
                    <div className="p-4 overflow-x-auto">
                        <div className="flex mb-2 ml-8 text-xs text-slate-500">
                            {(() => {
                                const monthPositions: { name: string; startWeek: number; span: number }[] = [];
                                let currentMonth = -1;
                                activityGraph.weeks.forEach((week, weekIndex) => {
                                    const firstDayOfWeek = week.find(d => d.month !== undefined);
                                    if (firstDayOfWeek && firstDayOfWeek.month !== currentMonth) {
                                        if (monthPositions.length > 0) monthPositions[monthPositions.length - 1].span = weekIndex - monthPositions[monthPositions.length - 1].startWeek;
                                        monthPositions.push({ name: firstDayOfWeek.monthName, startWeek: weekIndex, span: 1 });
                                        currentMonth = firstDayOfWeek.month;
                                    }
                                });
                                if (monthPositions.length > 0) monthPositions[monthPositions.length - 1].span = activityGraph.weeks.length - monthPositions[monthPositions.length - 1].startWeek;
                                return monthPositions.map((m, i) => (
                                    <div key={i} style={{ width: `${m.span * 13}px`, minWidth: m.span > 2 ? 'auto' : '0px' }} className="text-left">{m.span > 2 ? m.name : ''}</div>
                                ));
                            })()}
                        </div>
                        <div className="flex gap-[3px]">
                            <div className="flex flex-col gap-[3px] mr-2 text-[10px] text-slate-500">
                                <div className="h-[11px]"></div>
                                <div className="h-[11px] flex items-center">Sen</div>
                                <div className="h-[11px]"></div>
                                <div className="h-[11px] flex items-center">Rab</div>
                                <div className="h-[11px]"></div>
                                <div className="h-[11px] flex items-center">Jum</div>
                                <div className="h-[11px]"></div>
                            </div>
                            <TooltipProvider>
                                <div className="flex gap-[3px]">
                                    {activityGraph.weeks.map((week, weekIndex) => (
                                        <div key={weekIndex} className="flex flex-col gap-[3px]">
                                            {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
                                                const day = week.find(d => d.dayOfWeek === dayOfWeek);
                                                if (!day) return <div key={dayOfWeek} className="w-[11px] h-[11px]" />;
                                                return (
                                                    <Tooltip key={dayOfWeek}>
                                                        <TooltipTrigger asChild>
                                                            <div className={`w-[11px] h-[11px] rounded-[2px] ${getActivityColor(day.level)} cursor-pointer hover:ring-1 hover:ring-offset-1 hover:ring-gray-400 transition-all`} />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="text-xs">
                                                            <p className="font-medium">{formatActivityDate(day.date)}</p>
                                                            {day.isFuture ? <p className="text-slate-500">Belum terjadi</p> : day.count > 0 ? (<><p>{day.count} aktivitas</p><p className="text-slate-500">{getActivityTypeLabel(day.types)}</p></>) : <p className="text-slate-500">Tidak ada aktivitas</p>}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </TooltipProvider>
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-500">
                            <span>Sedikit</span>
                            <div className="flex gap-[3px]">{[0, 1, 2, 3, 4].map(level => (<div key={level} className={`w-[11px] h-[11px] rounded-[2px] ${getActivityColor(level)}`} />))}</div>
                            <span>Banyak</span>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                            <div className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-500" /><span>Absensi</span></div>
                            <div className="flex items-center gap-1"><FileText className="h-3 w-3 text-blue-500" /><span>Tugas</span></div>
                            <div className="flex items-center gap-1"><BookOpen className="h-3 w-3 text-purple-500" /><span>Catatan</span></div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Weekly Trend */}
                    <motion.div
                        variants={cardVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <motion.div whileHover={{ rotate: 10 }}>
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </motion.div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Kehadiran Minggu Ini</h2>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between">
                                {weeklyTrend.map((d, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ scale: 1.1, y: -5 }}
                                        className="text-center"
                                    >
                                        <p className="text-xs text-slate-500 mb-2">{d.day}</p>
                                        <motion.div
                                            whileHover={{ rotate: 10 }}
                                            className={`w-10 h-10 rounded-full ${getStatusColor(d.status)} flex items-center justify-center mx-auto`}
                                        >
                                            {d.status === 'present' && <CheckCircle className="h-5 w-5 text-white" />}
                                            {d.status === 'late' && <Clock className="h-5 w-5 text-white" />}
                                            {(d.status === 'rejected' || d.status === 'absent') && <XCircle className="h-5 w-5 text-white" />}
                                        </motion.div>
                                        <p className="text-xs mt-2 text-slate-600">{d.date}</p>
                                        {d.time && <p className="text-xs text-slate-500">{d.time}</p>}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Class Comparison */}
                    <motion.div
                        variants={cardVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <motion.div whileHover={{ rotate: 10 }}>
                                    <Users className="h-5 w-5 text-purple-600" />
                                </motion.div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Perbandingan dengan Kelas</h2>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex justify-between items-center"><span className="text-sm text-slate-600">Kamu</span><span className="font-bold text-slate-900 dark:text-white"><AnimatedCounter value={comparison.my_rate} suffix="%" duration={1500} /></span></div>
                            <Progress value={comparison.my_rate} className="h-3" />
                            <div className="flex justify-between items-center"><span className="text-sm text-slate-600">Rata-rata Kelas</span><span className="font-bold text-slate-900 dark:text-white"><AnimatedCounter value={comparison.class_average} suffix="%" duration={1500} /></span></div>
                            <Progress value={comparison.class_average} className="h-3 bg-slate-200" />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className={`p-3 rounded-lg ${comparison.status === 'above' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}
                            >
                                <p className={`text-sm font-medium ${comparison.status === 'above' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                    {comparison.status === 'above' ? `🎉 Kamu ${comparison.difference}% di atas rata-rata!` : `📈 Kamu ${Math.abs(comparison.difference)}% di bawah rata-rata`}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Course Breakdown */}
                <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80 overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <motion.div whileHover={{ rotate: 10 }}>
                                <GraduationCap className="h-5 w-5 text-blue-600" />
                            </motion.div>
                            <h2 className="font-semibold text-slate-900 dark:text-white">Kehadiran per Mata Kuliah</h2>
                        </div>
                    </div>
                    <div className="p-4 space-y-4">
                        {courseBreakdown.map((course, index) => (
                            <motion.div
                                key={course.course_id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ x: 5, scale: 1.01 }}
                                className="p-4 border border-slate-200 dark:border-gray-700 rounded-xl"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{course.course_name}</p>
                                        <div className="flex gap-2 mt-1 text-xs">
                                            <span className="text-green-600">Hadir: {course.present}</span>
                                            <span className="text-yellow-600">Terlambat: {course.late}</span>
                                            <span className="text-red-600">Absen: {course.absent}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={course.rate >= 80 ? 'default' : course.rate >= 60 ? 'secondary' : 'destructive'}>{course.rate}%</Badge>
                                        {!course.can_take_uas && <p className="text-xs text-red-600 mt-1">⚠️ Tidak bisa UAS</p>}
                                    </div>
                                </div>
                                <Progress value={course.rate} className="h-2" />
                            </motion.div>
                        ))}
                        {courseBreakdown.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-8"
                            >
                                <GraduationCap className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                <p className="text-slate-500">Belum ada data kehadiran</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Badges */}
                    <motion.div
                        variants={cardVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <motion.div whileHover={{ rotate: 10 }}>
                                    <Award className="h-5 w-5 text-yellow-500" />
                                </motion.div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Badge Kamu ({badges.length})</h2>
                            </div>
                        </div>
                        <div className="p-4">
                            {badges.length > 0 ? (
                                <div className="space-y-3">
                                    {badges.map((badge, index) => (
                                        <motion.div
                                            key={badge.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ x: 5, scale: 1.02 }}
                                            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-black/30 transition-colors"
                                        >
                                            <div className="w-14 h-14 shrink-0">
                                                {badge.icon ? (
                                                    <img src={`/images/badges/${badge.icon}`} alt={badge.name} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }} />
                                                ) : null}
                                                <div className={`w-full h-full rounded-full items-center justify-center text-xl ${getBadgeGradient(badge.color)} ${badge.icon ? 'hidden' : 'flex'}`}>{getBadgeEmoji(badge.category)}</div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{badge.name}</p>
                                                    <span className="px-1.5 py-0 rounded text-[10px] bg-slate-100 text-slate-600">+{badge.points} pts</span>
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-1">{badge.description}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">Diperoleh {badge.earned_at}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-8"
                                >
                                    <Award className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                    <p className="text-slate-500">Belum ada badge</p>
                                    <p className="text-xs text-slate-400">Terus tingkatkan aktivitas untuk mendapatkan badge!</p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Tips */}
                    <motion.div
                        variants={cardVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <motion.div whileHover={{ rotate: 10 }}>
                                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                                </motion.div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Tips & Saran</h2>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            {tips.map((tip, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ x: 5, scale: 1.02 }}
                                    className={`p-3 rounded-lg border ${getTipBg(tip.type)}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <motion.div whileHover={{ rotate: 10, scale: 1.1 }}>
                                            {getTipIcon(tip.type)}
                                        </motion.div>
                                        <div>
                                            <p className="font-medium text-sm text-slate-900 dark:text-white">{tip.title}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{tip.message}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {tips.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-8"
                                >
                                    <Lightbulb className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                    <p className="text-slate-500">Tidak ada tips saat ini</p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </StudentLayout>
    );
}
