import StudentLayout from '@/layouts/student-layout';
import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Award,
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    GraduationCap,
    Lightbulb,
    TrendingDown,
    TrendingUp,
    Users,
    XCircle,
    AlertTriangle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useState } from 'react';

import analyticsIcon from '@/assets/mahasiswa/analitik/analytics.png';
import rateStatIcon from '@/assets/admin/dashboard/total-icon.png';
import streakStatIcon from '@/assets/admin/verifikasi-selfie/pending.png';
import totalActivityStatIcon from '@/assets/admin/verifikasi-selfie/disetujui.png';
import rankStatIcon from '@/assets/admin/leaderboard/icon-leaderboard.png';

interface ActivityDay {
    date: string;
    count: number;
    level: number;
    types: string[];
    dayOfWeek: number;
    week: number;
    month: number;
    monthName: string;
    isFuture?: boolean;
}

interface Props {
    mahasiswa: { id: number; nama: string; nim: string };
    overview: {
        total_sessions: number;
        present: number;
        late: number;
        absent: number;
        overall_rate: number;
        on_time_rate: number;
        this_month_rate: number;
        trend: number;
        trend_direction: 'up' | 'down' | 'stable';
    };
    streakData: { current_streak: number; longest_streak: number; last_attendance: string | null };
    courseBreakdown: Array<{
        course_id: number;
        course_name: string;
        total: number;
        present: number;
        late: number;
        absent: number;
        rate: number;
        can_take_uas: boolean;
    }>;
    weeklyTrend: Array<{ date: string; day: string; status: string; time: string | null }>;
    activityGraph: {
        activities: ActivityDay[];
        weeks: ActivityDay[][];
        months: Array<{ month: number; name: string }>;
        totalActivities: number;
        activeDays: number;
        longestStreak: number;
        currentStreak: number;
        year: number;
    };
    comparison: {
        my_rate: number;
        class_average: number;
        difference: number;
        rank: number;
        total_students: number;
        percentile: number;
        status: 'above' | 'below';
    };
    badges: Array<{
        id: number;
        name: string;
        description: string;
        icon: string;
        color: string;
        category: string;
        points: number;
        earned_at: string;
    }>;
    tips: Array<{ type: 'success' | 'warning' | 'danger' | 'info'; title: string; message: string }>;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
    },
};

export default function PersonalAnalytics({
    mahasiswa,
    overview,
    streakData,
    courseBreakdown,
    weeklyTrend,
    activityGraph,
    comparison,
    badges,
    tips,
}: Props) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case 'present':
                return 'bg-emerald-500';
            case 'late':
                return 'bg-amber-500';
            case 'rejected':
            case 'absent':
                return 'bg-red-500';
            case 'permit':
            case 'sick':
                return 'bg-blue-500';
            default:
                return 'bg-neutral-300 dark:bg-neutral-700';
        }
    };

    const getActivityColor = (level: number) => {
        switch (level) {
            case -1:
                return 'bg-neutral-100/70 dark:bg-neutral-800/40';
            case 0:
                return 'bg-neutral-200 dark:bg-neutral-700';
            case 1:
                return 'bg-emerald-300 dark:bg-emerald-800';
            case 2:
                return 'bg-emerald-400 dark:bg-emerald-700';
            case 3:
                return 'bg-emerald-500 dark:bg-emerald-600';
            case 4:
                return 'bg-emerald-600 dark:bg-emerald-500';
            default:
                return 'bg-neutral-200 dark:bg-neutral-700';
        }
    };

    const getTipIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-emerald-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'danger':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Lightbulb className="h-5 w-5 text-blue-500" />;
        }
    };

    const getTipBg = (type: string) => {
        switch (type) {
            case 'success':
                return 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-900/20';
            case 'warning':
                return 'border-amber-200 bg-amber-50/70 dark:border-amber-900/60 dark:bg-amber-900/20';
            case 'danger':
                return 'border-red-200 bg-red-50/70 dark:border-red-900/60 dark:bg-red-900/20';
            default:
                return 'border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-900/20';
        }
    };

    const getBadgeGradient = (color: string) => {
        const gradients: Record<string, string> = {
            orange: 'from-orange-400 to-orange-600',
            yellow: 'from-yellow-400 to-yellow-600',
            green: 'from-green-400 to-green-600',
            blue: 'from-blue-400 to-blue-600',
            purple: 'from-purple-400 to-purple-600',
            red: 'from-red-400 to-red-600',
            emerald: 'from-emerald-400 to-emerald-600',
            pink: 'from-pink-400 to-pink-600',
        };

        return gradients[color] || 'from-slate-400 to-slate-600';
    };

    const formatActivityDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

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
                className="space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8"
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-8"
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

                    <div className="relative">
                       

                        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
                            <motion.div
                                className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                whileHover={{ scale: 1.05, rotate: 5 }}
                            >
                                <img
                                    src={analyticsIcon}
                                    alt="Personal Analytics"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                />
                            </motion.div>

                            <div className="mt-1 flex-1 sm:mt-0">
                                <motion.p
                                    className="text-sm font-medium tracking-wide text-indigo-100"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Analisis Akademik
                                </motion.p>
                                <motion.h1
                                    className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Personal Analytics
                                </motion.h1>
                                <motion.p
                                    className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100 sm:text-base"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    Pantau perkembangan akademik kamu secara real-time.
                                    <span className="ml-1 font-semibold">{mahasiswa.nama}</span>
                                    <span className="mx-1 text-white/70">|</span>
                                    <span>{mahasiswa.nim}</span>
                                </motion.p>
                                <motion.p
                                    className="mt-1 text-xs text-white/80 sm:text-sm"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.55 }}
                                >
                                    Streak kehadiran saat ini: {streakData.current_streak} hari
                                </motion.p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.2 } },
                    }}
                >
                    {[
                        {
                            key: 'rate',
                            title: 'Rate Kehadiran',
                            value: overview.overall_rate,
                            suffix: '%',
                            decimals: 1,
                            note: `${overview.trend >= 0 ? '+' : ''}${overview.trend}% bulan ini`,
                            icon: rateStatIcon,
                            iconScale: 'scale-[0.98]',
                            colorConfig: {
                                bg: 'bg-blue-500',
                                gradientBg:
                                    'from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10',
                            },
                        },
                        {
                            key: 'streak',
                            title: 'Streak Aktivitas',
                            value: activityGraph.currentStreak,
                            suffix: ' hari',
                            note: `Terpanjang ${activityGraph.longestStreak} hari`,
                            icon: streakStatIcon,
                            iconScale: 'scale-[0.98]',
                            colorConfig: {
                                bg: 'bg-amber-500',
                                gradientBg:
                                    'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
                            },
                        },
                        {
                            key: 'total',
                            title: 'Total Aktivitas',
                            value: activityGraph.totalActivities,
                            note: `${activityGraph.activeDays} hari aktif`,
                            icon: totalActivityStatIcon,
                            iconScale: 'scale-[0.98]',
                            colorConfig: {
                                bg: 'bg-emerald-500',
                                gradientBg:
                                    'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
                            },
                        },
                        {
                            key: 'rank',
                            title: 'Peringkat Kelas',
                            value: comparison.rank,
                            prefix: '#',
                            note: `Top ${comparison.percentile}%`,
                            icon: rankStatIcon,
                            iconScale: 'scale-[0.94]',
                            colorConfig: {
                                bg: 'bg-purple-500',
                                gradientBg:
                                    'from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10',
                            },
                        },
                    ].map((stat) => {
                        return (
                            <motion.div
                                key={stat.key}
                                className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 sm:rounded-3xl sm:p-6"
                                variants={itemVariants}
                                whileHover={{
                                    scale: 1.04,
                                    y: -4,
                                    transition: { type: 'spring', stiffness: 400, damping: 15 },
                                }}
                                onHoverStart={() => setHoveredCard(stat.key)}
                                onHoverEnd={() => setHoveredCard(null)}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.colorConfig.gradientBg}`} />
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: hoveredCard === stat.key ? 1.5 : 1,
                                        opacity: hoveredCard === stat.key ? 0.4 : 0.2,
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${stat.colorConfig.bg} blur-3xl`}
                                />

                                <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-12 sm:w-12"
                                    >
                                        <img
                                            src={stat.icon}
                                            alt={stat.title}
                                            className={`h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.32)] ${stat.iconScale ?? ''}`}
                                        />
                                    </motion.div>
                                    <div>
                                        <p className="text-[10px] font-medium leading-tight text-neutral-500 dark:text-neutral-400 sm:text-sm">
                                            {stat.title}
                                        </p>
                                        <div className="mt-0.5 sm:mt-1">
                                            <span className="text-lg font-bold text-neutral-900 dark:text-white sm:text-2xl">
                                                <AnimatedCounter
                                                    value={stat.value}
                                                    prefix={stat.prefix}
                                                    suffix={stat.suffix}
                                                    decimals={stat.decimals}
                                                />
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-[8px] leading-tight text-neutral-400 sm:text-xs">
                                            {stat.note}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="border-b border-white/10 p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Aktivitas Tahun {activityGraph.year}
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {activityGraph.totalActivities} aktivitas sejak 1 Januari {activityGraph.year}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto p-6">
                        <div className="mb-2 ml-8 flex text-xs text-neutral-500 dark:text-neutral-400">
                            {(() => {
                                const monthPositions: { name: string; startWeek: number; span: number }[] = [];
                                let currentMonth = -1;

                                activityGraph.weeks.forEach((week, weekIndex) => {
                                    const firstDayOfWeek = week.find((d) => d.month !== undefined);
                                    if (firstDayOfWeek && firstDayOfWeek.month !== currentMonth) {
                                        if (monthPositions.length > 0) {
                                            monthPositions[monthPositions.length - 1].span =
                                                weekIndex - monthPositions[monthPositions.length - 1].startWeek;
                                        }
                                        monthPositions.push({
                                            name: firstDayOfWeek.monthName,
                                            startWeek: weekIndex,
                                            span: 1,
                                        });
                                        currentMonth = firstDayOfWeek.month;
                                    }
                                });

                                if (monthPositions.length > 0) {
                                    monthPositions[monthPositions.length - 1].span =
                                        activityGraph.weeks.length - monthPositions[monthPositions.length - 1].startWeek;
                                }

                                return monthPositions.map((month, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            width: `${month.span * 13}px`,
                                            minWidth: month.span > 2 ? 'auto' : '0px',
                                        }}
                                        className="text-left"
                                    >
                                        {month.span > 2 ? month.name : ''}
                                    </div>
                                ));
                            })()}
                        </div>

                        <div className="flex gap-[3px]">
                            <div className="mr-2 flex flex-col gap-[3px] text-[10px] text-neutral-500 dark:text-neutral-400">
                                <div className="h-[11px]" />
                                <div className="flex h-[11px] items-center">Sen</div>
                                <div className="h-[11px]" />
                                <div className="flex h-[11px] items-center">Rab</div>
                                <div className="h-[11px]" />
                                <div className="flex h-[11px] items-center">Jum</div>
                                <div className="h-[11px]" />
                            </div>

                            <TooltipProvider>
                                <div className="flex gap-[3px]">
                                    {activityGraph.weeks.map((week, weekIndex) => (
                                        <div key={weekIndex} className="flex flex-col gap-[3px]">
                                            {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                                                const day = week.find((d) => d.dayOfWeek === dayOfWeek);

                                                if (!day) {
                                                    return <div key={dayOfWeek} className="h-[11px] w-[11px]" />;
                                                }

                                                return (
                                                    <Tooltip key={dayOfWeek}>
                                                        <TooltipTrigger asChild>
                                                            <div
                                                                className={`h-[11px] w-[11px] cursor-pointer rounded-[2px] ${getActivityColor(day.level)} transition-all hover:ring-1 hover:ring-neutral-400 hover:ring-offset-1 dark:hover:ring-neutral-500`}
                                                            />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="text-xs">
                                                            <p className="font-medium">{formatActivityDate(day.date)}</p>
                                                            {day.isFuture ? (
                                                                <p className="text-neutral-500 dark:text-neutral-400">
                                                                    Belum terjadi
                                                                </p>
                                                            ) : day.count > 0 ? (
                                                                <>
                                                                    <p>{day.count} aktivitas</p>
                                                                    <p className="text-neutral-500 dark:text-neutral-400">
                                                                        {getActivityTypeLabel(day.types)}
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <p className="text-neutral-500 dark:text-neutral-400">
                                                                    Tidak ada aktivitas
                                                                </p>
                                                            )}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </TooltipProvider>
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                            <span>Sedikit</span>
                            <div className="flex gap-[3px]">
                                {[0, 1, 2, 3, 4].map((level) => (
                                    <div key={level} className={`h-[11px] w-[11px] rounded-[2px] ${getActivityColor(level)}`} />
                                ))}
                            </div>
                            <span>Banyak</span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                            <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-emerald-500" />
                                <span>Absensi</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3 text-blue-500" />
                                <span>Tugas</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3 text-purple-500" />
                                <span>Catatan</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="border-b border-white/10 p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-lg">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Kehadiran Minggu Ini
                                </h2>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8 sm:gap-2">
                                {weeklyTrend.map((day, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        whileHover={{ scale: 1.04, y: -2 }}
                                        className="text-center"
                                    >
                                        <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
                                            {day.day}
                                        </p>
                                        <div
                                            className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${getStatusColor(day.status)}`}
                                        >
                                            {day.status === 'present' && <CheckCircle className="h-5 w-5 text-white" />}
                                            {day.status === 'late' && <Clock className="h-5 w-5 text-white" />}
                                            {(day.status === 'rejected' || day.status === 'absent') && (
                                                <XCircle className="h-5 w-5 text-white" />
                                            )}
                                            {(day.status === 'permit' || day.status === 'sick') && (
                                                <FileText className="h-5 w-5 text-white" />
                                            )}
                                        </div>
                                        <p className="mt-2 text-[11px] text-neutral-600 dark:text-neutral-300">
                                            {day.date}
                                        </p>
                                        {day.time && (
                                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                                {day.time}
                                            </p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="border-b border-white/10 p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 text-white shadow-lg">
                                    <Users className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Perbandingan dengan Kelas
                                </h2>
                            </div>
                        </div>

                        <div className="space-y-4 p-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-neutral-600 dark:text-neutral-300">Kamu</span>
                                <span className="font-bold text-neutral-900 dark:text-white">
                                    <AnimatedCounter value={comparison.my_rate} suffix="%" decimals={1} />
                                </span>
                            </div>
                            <Progress value={comparison.my_rate} className="h-3" />

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-neutral-600 dark:text-neutral-300">Rata-rata Kelas</span>
                                <span className="font-bold text-neutral-900 dark:text-white">
                                    <AnimatedCounter value={comparison.class_average} suffix="%" decimals={1} />
                                </span>
                            </div>
                            <Progress value={comparison.class_average} className="h-3 bg-neutral-200 dark:bg-neutral-700" />

                            <div
                                className={`rounded-xl border p-3 ${
                                    comparison.status === 'above'
                                        ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-900/20'
                                        : 'border-red-200 bg-red-50/70 dark:border-red-900/60 dark:bg-red-900/20'
                                }`}
                            >
                                <p
                                    className={`flex items-center gap-2 text-sm font-medium ${
                                        comparison.status === 'above'
                                            ? 'text-emerald-700 dark:text-emerald-300'
                                            : 'text-red-700 dark:text-red-300'
                                    }`}
                                >
                                    {comparison.status === 'above' ? (
                                        <TrendingUp className="h-4 w-4" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4" />
                                    )}
                                    {comparison.status === 'above'
                                        ? `Kamu ${comparison.difference}% di atas rata-rata kelas`
                                        : `Kamu ${Math.abs(comparison.difference)}% di bawah rata-rata kelas`}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="border-b border-white/10 p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                Kehadiran per Mata Kuliah
                            </h2>
                        </div>
                    </div>

                    <div className="space-y-4 p-6">
                        {courseBreakdown.length > 0 ? (
                            courseBreakdown.map((course, index) => (
                                <motion.div
                                    key={course.course_id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.04 }}
                                    whileHover={{ scale: 1.01, x: 2 }}
                                    className="rounded-2xl border border-white/30 bg-white/60 p-4 backdrop-blur dark:border-white/10 dark:bg-neutral-800/40"
                                >
                                    <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className="font-semibold text-neutral-900 dark:text-white">
                                                {course.course_name}
                                            </p>
                                            <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                                <span className="text-emerald-600 dark:text-emerald-400">
                                                    Hadir: {course.present}
                                                </span>
                                                <span className="text-amber-600 dark:text-amber-400">
                                                    Terlambat: {course.late}
                                                </span>
                                                <span className="text-red-600 dark:text-red-400">
                                                    Absen: {course.absent}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-left sm:text-right">
                                            <Badge
                                                className={
                                                    course.rate >= 80
                                                        ? 'bg-emerald-500'
                                                        : course.rate >= 60
                                                          ? 'bg-amber-500'
                                                          : 'bg-red-500'
                                                }
                                            >
                                                {course.rate}%
                                            </Badge>
                                            {!course.can_take_uas && (
                                                <p className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400 sm:justify-end">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    Tidak memenuhi syarat UAS
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <Progress value={course.rate} className="h-2" />
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-8 text-center">
                                <GraduationCap className="mx-auto mb-2 h-12 w-12 text-neutral-300 dark:text-neutral-600" />
                                <p className="text-neutral-500 dark:text-neutral-400">Belum ada data kehadiran</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="border-b border-white/10 p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg">
                                    <Award className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Badge Kamu ({badges.length})
                                </h2>
                            </div>
                        </div>

                        <div className="p-6">
                            {badges.length > 0 ? (
                                <div className="space-y-3">
                                    {badges.map((badge, index) => (
                                        <motion.div
                                            key={badge.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.04 }}
                                            whileHover={{ scale: 1.01, x: 2 }}
                                            className="flex items-center gap-3 rounded-xl border border-white/30 bg-white/60 p-3 backdrop-blur dark:border-white/10 dark:bg-neutral-800/40"
                                        >
                                            <div className="h-14 w-14 shrink-0">
                                                {badge.icon ? (
                                                    <img
                                                        src={`/images/badges/${badge.icon}`}
                                                        alt={badge.name}
                                                        className="h-full w-full object-contain"
                                                        onError={(event) => {
                                                            event.currentTarget.style.display = 'none';
                                                            if (event.currentTarget.nextElementSibling) {
                                                                (event.currentTarget.nextElementSibling as HTMLElement).style.display =
                                                                    'flex';
                                                            }
                                                        }}
                                                    />
                                                ) : null}
                                                <div
                                                    className={`h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${getBadgeGradient(badge.color)} text-white ${badge.icon ? 'hidden' : 'flex'}`}
                                                >
                                                    <Award className="h-6 w-6" />
                                                </div>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                                                        {badge.name}
                                                    </p>
                                                    <span className="rounded bg-neutral-100 px-1.5 py-0 text-[10px] text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                                                        +{badge.points} pts
                                                    </span>
                                                </div>
                                                <p className="line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                    {badge.description}
                                                </p>
                                                <p className="mt-0.5 text-[10px] text-neutral-400 dark:text-neutral-500">
                                                    Diperoleh {badge.earned_at}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <Award className="mx-auto mb-2 h-12 w-12 text-neutral-300 dark:text-neutral-600" />
                                    <p className="text-neutral-500 dark:text-neutral-400">Belum ada badge</p>
                                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                                        Tingkatkan aktivitas untuk mendapatkan badge.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="border-b border-white/10 p-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg">
                                    <Lightbulb className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Tips dan Saran
                                </h2>
                            </div>
                        </div>

                        <div className="space-y-3 p-6">
                            {tips.length > 0 ? (
                                tips.map((tip, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.04 }}
                                        whileHover={{ scale: 1.01, x: 2 }}
                                        className={`rounded-xl border p-3 ${getTipBg(tip.type)}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {getTipIcon(tip.type)}
                                            <div>
                                                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                    {tip.title}
                                                </p>
                                                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                                                    {tip.message}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-8 text-center">
                                    <Lightbulb className="mx-auto mb-2 h-12 w-12 text-neutral-300 dark:text-neutral-600" />
                                    <p className="text-neutral-500 dark:text-neutral-400">Tidak ada tips saat ini</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </StudentLayout>
    );
}
