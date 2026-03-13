import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Badge } from '@/components/ui/badge';
import StudentLayout from '@/layouts/student-layout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    GraduationCap,
    NotebookPen,
    Sparkles,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

// PNG Icons — matching admin dashboard pattern
import hadirIcon from '@/assets/admin/dashboard/hadir-icon.png';
import selfieIcon from '@/assets/admin/dashboard/selfie-icon.png';
import terlambatIcon from '@/assets/admin/dashboard/terlambat-icon.png';
import totalIcon from '@/assets/admin/dashboard/total-icon.png';
import dashboardIcon from '@/assets/mahasiswa/akademik/akademik.png';

interface Props {
    todaySchedule: Array<{
        id: number;
        course_name: string;
        time: string;
        meeting_number: number;
        total_meetings: number;
        mode: 'online' | 'offline';
        is_completed: boolean;
    }>;
    pendingTasks: Array<{
        id: number;
        title: string;
        course_name: string;
        deadline: string | null;
        deadline_formatted: string | null;
        days_remaining: number | null;
        is_overdue: boolean;
        status: string;
    }>;
    upcomingExams: Array<{
        id: number;
        course_name: string;
        type: 'UTS' | 'UAS';
        date: string;
        date_formatted: string;
        days_remaining: number;
        is_warning: boolean;
        is_critical: boolean;
    }>;
    courseProgress: Array<{
        id: number;
        name: string;
        progress: number;
        current_meeting: number;
        total_meetings: number;
        mode: 'online' | 'offline';
    }>;
    recentNotes: Array<{
        id: number;
        title: string;
        course_name: string;
        course_mode: 'online' | 'offline';
        meeting_number: number;
        created_at: string;
    }>;
    stats: {
        totalCourses: number;
        completedTasks: number;
        pendingTasks: number;
        overdueTasks: number;
        weeklyProgress: number;
    };
    today: { day: string; date: string };
}

/* ═══════════════════════════════════════════════════ */
/*          ANIMATION VARIANTS — Matching Admin       */
/* ═══════════════════════════════════════════════════ */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
} as const;

export default function AcademicDashboard({
    todaySchedule,
    pendingTasks,
    upcomingExams,
    courseProgress,
    recentNotes,
    stats,
    today,
}: Props) {
    const completionRate =
        stats.totalCourses > 0
            ? Math.round(
                  (stats.completedTasks /
                      (stats.completedTasks +
                          stats.pendingTasks +
                          stats.overdueTasks)) *
                      100,
              ) || 0
            : 0;

    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // Stats card config — matching admin pattern with PNG icons & colorConfigs
    const statCards = [
        {
            icon: totalIcon,
            title: 'Mata Kuliah',
            value: stats.totalCourses,
            note: 'Semester ini',
            colorConfig: {
                from: 'from-sky-400',
                to: 'to-indigo-600',
                shadow: 'shadow-sky-500/30',
                bg: 'bg-sky-500',
                hoverShadow: 'hover:shadow-sky-500/10',
                gradientBg:
                    'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
            },
        },
        {
            icon: hadirIcon,
            title: 'Tugas Selesai',
            value: stats.completedTasks,
            note: 'Completed',
            colorConfig: {
                from: 'from-emerald-400',
                to: 'to-teal-600',
                shadow: 'shadow-emerald-500/30',
                bg: 'bg-emerald-500',
                hoverShadow: 'hover:shadow-emerald-500/10',
                gradientBg:
                    'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
            },
        },
        {
            icon: terlambatIcon,
            title: 'Tugas Pending',
            value: stats.pendingTasks,
            note:
                stats.overdueTasks > 0
                    ? `${stats.overdueTasks} terlambat!`
                    : 'On track',
            colorConfig: {
                from: 'from-amber-400',
                to: 'to-orange-600',
                shadow: 'shadow-amber-500/30',
                bg: 'bg-amber-500',
                hoverShadow: 'hover:shadow-amber-500/10',
                gradientBg:
                    'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
            },
        },
        {
            icon: selfieIcon,
            title: 'Completion',
            value: completionRate,
            suffix: '%',
            note: `Progress: ${stats.weeklyProgress}%`,
            colorConfig: {
                from: 'from-rose-400',
                to: 'to-pink-600',
                shadow: 'shadow-rose-500/30',
                bg: 'bg-rose-500',
                hoverShadow: 'hover:shadow-rose-500/10',
                gradientBg:
                    'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10',
            },
        },
    ];

    return (
        <StudentLayout>
            <Head title="Dashboard Akademik" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex flex-col gap-6 p-4 md:p-6 lg:p-8"
            >
                {/* ═══════════════════════════════════════════════════ */}
                {/* 1️⃣ HERO HEADER - Ultra Polished with PNG Icon      */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 100,
                    }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />

                    {/* Animated Orbs */}
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 0.6, 0],
                                    scale: [0, 1, 0],
                                    y: [0, -80],
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: i * 0.25,
                                    ease: 'easeOut',
                                }}
                                className="absolute"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${80 + Math.random() * 20}%`,
                                }}
                            >
                                {i % 3 === 0 ? (
                                    <GraduationCap className="h-3 w-3 text-white/40" />
                                ) : i % 3 === 1 ? (
                                    <BookOpen className="h-3 w-3 text-white/40" />
                                ) : (
                                    <Sparkles className="h-3 w-3 text-white/40" />
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-wrap items-start justify-between gap-6">
                            {/* Left: Icon + Welcome */}
                            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
                                <motion.div
                                    className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                                    initial={{
                                        opacity: 0,
                                        scale: 0.5,
                                        rotate: -10,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        rotate: 0,
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        delay: 0.2,
                                    }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={dashboardIcon}
                                        alt="Dashboard Akademik"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                    >
                                        {today.day}, {today.date}
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                    >
                                        Dashboard Akademik
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="mt-2 max-w-lg text-sm leading-relaxed text-indigo-100 sm:text-base"
                                    >
                                        Kelola jadwal, tugas, dan catatan kuliah
                                        kamu dengan mudah
                                    </motion.p>
                                </div>
                            </div>

                            {/* Right: Weekly Progress + Stats */}
                            <div className="mt-4 flex w-full flex-col items-center gap-2 sm:mt-0 sm:w-auto sm:items-end">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-4 py-2 shadow-lg backdrop-blur-xl sm:px-6 sm:py-3"
                                >
                                    <TrendingUp className="h-5 w-5" />
                                    <div className="text-center sm:text-right">
                                        <p className="text-xl font-bold tabular-nums sm:text-2xl">
                                            {stats.weeklyProgress}%
                                        </p>
                                        <p className="text-[10px] text-indigo-200 sm:text-xs">
                                            Progress Minggu Ini
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.05,
                                        delayChildren: 0.2,
                                    },
                                },
                            }}
                            className="mt-6 flex w-full flex-nowrap gap-2 overflow-x-auto border-t border-white/10 pt-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-8 sm:gap-3 [&::-webkit-scrollbar]:hidden"
                        >
                            {[
                                {
                                    href: '/user/akademik/jadwal',
                                    icon: Calendar,
                                    label: 'Jadwal',
                                },
                                {
                                    href: '/user/akademik/catatan',
                                    icon: NotebookPen,
                                    label: 'Catatan',
                                },
                                {
                                    href: '/user/akademik/matkul',
                                    icon: BookOpen,
                                    label: 'Mata Kuliah',
                                },
                                {
                                    href: '/user/akademik/ujian',
                                    icon: GraduationCap,
                                    label: 'Ujian',
                                },
                            ].map((item, index) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl sm:gap-2 sm:px-4 sm:py-2 sm:text-xs ${
                                        index === 0
                                            ? 'bg-white text-indigo-600'
                                            : 'border border-white/20 bg-white/20 text-white backdrop-blur-md hover:bg-white/30'
                                    }`}
                                >
                                    <item.icon className="h-3.5 w-3.5" />
                                    {item.label}
                                </Link>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* 2️⃣ STATS CARDS - Admin Pattern with PNG Icons       */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.04,
                                delayChildren: 0.2,
                            },
                        },
                    }}
                >
                    {statCards.map((stat, index) => {
                        const cardKey = `stat-${index}`;
                        return (
                            <motion.div
                                key={stat.title}
                                className={`group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 dark:bg-neutral-900/40 ${stat.colorConfig.hoverShadow} dark:border-white/5`}
                                variants={{
                                    hidden: { opacity: 0, y: 30, scale: 0.9 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        transition: {
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 20,
                                        },
                                    },
                                }}
                                whileHover={{
                                    scale: 1.04,
                                    y: -4,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 15,
                                    },
                                }}
                                onHoverStart={() => setHoveredCard(cardKey)}
                                onHoverEnd={() => setHoveredCard(null)}
                            >
                                {/* Background gradient overlay */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${stat.colorConfig.gradientBg}`}
                                />
                                {/* Glow effect */}
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale:
                                            hoveredCard === cardKey ? 1.5 : 1,
                                        opacity:
                                            hoveredCard === cardKey ? 0.4 : 0.2,
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${stat.colorConfig.bg} blur-3xl transition-all duration-500`}
                                />
                                <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                                    >
                                        <img
                                            src={stat.icon}
                                            alt={stat.title}
                                            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                        />
                                    </motion.div>
                                    <div>
                                        <p className="text-[10px] leading-tight font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                                            {stat.title}
                                        </p>
                                        <div className="mt-0.5 sm:mt-1">
                                            <span className="text-lg font-bold text-neutral-900 sm:text-2xl dark:text-white">
                                                <AnimatedCounter
                                                    value={stat.value}
                                                    suffix={stat.suffix}
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

                {/* ═══════════════════════════════════════════════════ */}
                {/* 3️⃣ MAIN CONTENT - Schedule + Tasks                 */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={containerVariants}
                    className="grid gap-6 md:grid-cols-2"
                >
                    {/* Jadwal Hari Ini */}
                    <motion.div
                        variants={itemVariants}
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="border-b border-white/20 p-5 dark:border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                                    >
                                        <Calendar className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <h2 className="font-bold text-neutral-900 dark:text-white">
                                            Jadwal Hari Ini
                                        </h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            {todaySchedule.length} perkuliahan
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/user/akademik/jadwal"
                                    className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                                >
                                    Semua <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-5">
                            {todaySchedule.length > 0 ? (
                                <div className="space-y-3">
                                    {todaySchedule.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: index * 0.05,
                                                type: 'spring',
                                                stiffness: 300,
                                                damping: 20,
                                            }}
                                            whileHover={{ scale: 1.02, x: 4 }}
                                            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/20 bg-white/60 p-4 backdrop-blur-xl transition-all dark:border-white/5 dark:bg-neutral-800/60"
                                            onClick={() =>
                                                router.visit(
                                                    '/user/akademik/jadwal',
                                                )
                                            }
                                        >
                                            <div className="relative">
                                                <div
                                                    className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg ${
                                                        item.is_completed
                                                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}
                                                >
                                                    {item.is_completed ? (
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    ) : (
                                                        <Clock className="h-5 w-5" />
                                                    )}
                                                </div>
                                                {!item.is_completed && (
                                                    <motion.div
                                                        animate={{
                                                            scale: [1, 1.5, 1],
                                                            opacity: [
                                                                0.5, 0, 0.5,
                                                            ],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                        }}
                                                        className="absolute inset-0 rounded-full bg-blue-400"
                                                    />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <span className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                                                        {item.course_name}
                                                    </span>
                                                    <Badge
                                                        variant={
                                                            item.mode ===
                                                            'offline'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="flex-shrink-0 text-[10px]"
                                                    >
                                                        {item.mode === 'offline'
                                                            ? '🏫 Offline'
                                                            : '💻 Online'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    {item.time} • Pertemuan{' '}
                                                    {item.meeting_number}/
                                                    {item.total_meetings}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center">
                                    <div className="relative mx-auto mb-3 h-16 w-16">
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.2, 0.3, 0.2],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                            className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                        />
                                        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                            <Calendar className="h-8 w-8 text-neutral-400" />
                                        </div>
                                    </div>
                                    <p className="font-bold text-neutral-700 dark:text-neutral-300">
                                        Tidak Ada Jadwal
                                    </p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Nikmati waktu luangmu! 🎉
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* 4️⃣ EXAMS + PROGRESS                                */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={containerVariants}
                    className="grid gap-6 md:grid-cols-2"
                >
                    {/* Ujian Mendatang */}
                    <motion.div
                        variants={itemVariants}
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="border-b border-white/20 p-5 dark:border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30"
                                    >
                                        <GraduationCap className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <h2 className="font-bold text-neutral-900 dark:text-white">
                                            Ujian Mendatang
                                        </h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            {upcomingExams.length} ujian
                                            terjadwal
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/user/akademik/ujian"
                                    className="flex items-center gap-1 text-sm font-bold text-red-600 hover:text-red-700 dark:text-red-400"
                                >
                                    Semua <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-5">
                            {upcomingExams.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingExams
                                        .slice(0, 3)
                                        .map((exam, index) => (
                                            <motion.div
                                                key={exam.id}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: index * 0.08,
                                                }}
                                                whileHover={{
                                                    scale: 1.02,
                                                    x: 4,
                                                }}
                                                className={`cursor-pointer rounded-2xl border p-4 backdrop-blur-xl transition-all ${
                                                    exam.is_critical
                                                        ? 'border-red-200 bg-red-50/60 dark:border-red-800 dark:bg-red-900/20'
                                                        : exam.is_warning
                                                          ? 'border-amber-200 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-900/20'
                                                          : 'border-white/20 bg-white/60 dark:border-white/5 dark:bg-neutral-800/60'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="mb-1 flex items-center gap-2">
                                                            <Badge
                                                                className={`text-[10px] font-bold ${exam.type === 'UTS' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' : 'bg-gradient-to-r from-purple-500 to-violet-500 text-white'}`}
                                                            >
                                                                {exam.type}
                                                            </Badge>
                                                            <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                                                {
                                                                    exam.course_name
                                                                }
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                            {
                                                                exam.date_formatted
                                                            }
                                                        </p>
                                                    </div>
                                                    <motion.div
                                                        animate={
                                                            exam.is_critical
                                                                ? {
                                                                      scale: [
                                                                          1,
                                                                          1.1,
                                                                          1,
                                                                      ],
                                                                  }
                                                                : {}
                                                        }
                                                        transition={
                                                            exam.is_critical
                                                                ? {
                                                                      duration: 1.5,
                                                                      repeat: Infinity,
                                                                  }
                                                                : {}
                                                        }
                                                        className={`rounded-xl p-3 text-right ${
                                                            exam.is_critical
                                                                ? 'bg-red-100 dark:bg-red-900/30'
                                                                : exam.is_warning
                                                                  ? 'bg-amber-100 dark:bg-amber-900/30'
                                                                  : 'bg-neutral-100 dark:bg-neutral-800'
                                                        }`}
                                                    >
                                                        <p
                                                            className={`text-2xl font-extrabold ${
                                                                exam.is_critical
                                                                    ? 'text-red-600 dark:text-red-400'
                                                                    : exam.is_warning
                                                                      ? 'text-amber-600 dark:text-amber-400'
                                                                      : 'text-neutral-700 dark:text-neutral-300'
                                                            }`}
                                                        >
                                                            {
                                                                exam.days_remaining
                                                            }
                                                        </p>
                                                        <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                                                            hari lagi
                                                        </p>
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center">
                                    <div className="relative mx-auto mb-3 h-16 w-16">
                                        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                            <GraduationCap className="h-8 w-8 text-neutral-400" />
                                        </div>
                                    </div>
                                    <p className="font-bold text-neutral-700 dark:text-neutral-300">
                                        Belum Ada Ujian
                                    </p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Tidak ada ujian terjadwal
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Course Progress */}
                    <motion.div
                        variants={itemVariants}
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="border-b border-white/20 p-5 dark:border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: -5 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                                    >
                                        <TrendingUp className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <h2 className="font-bold text-neutral-900 dark:text-white">
                                            Progress Mata Kuliah
                                        </h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Pertemuan yang sudah dilalui
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/user/akademik/matkul"
                                    className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                                >
                                    Kelola <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-5">
                            {courseProgress.length > 0 ? (
                                <div className="space-y-5">
                                    {courseProgress
                                        .slice(0, 5)
                                        .map((course, index) => (
                                            <motion.div
                                                key={course.id}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: index * 0.08,
                                                }}
                                                whileHover={{ x: 4 }}
                                                className="group cursor-pointer"
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <span className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                                                            {course.name}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className="flex-shrink-0 border-white/20 text-[10px] dark:border-white/5"
                                                        >
                                                            {course.mode ===
                                                            'offline'
                                                                ? '🏫'
                                                                : '💻'}{' '}
                                                            {course.mode}
                                                        </Badge>
                                                    </div>
                                                    <span className="flex-shrink-0 text-xs font-bold text-neutral-500 dark:text-neutral-400">
                                                        {course.current_meeting}
                                                        /{course.total_meetings}
                                                    </span>
                                                </div>
                                                <div className="relative h-3 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width: `${course.progress}%`,
                                                        }}
                                                        transition={{
                                                            duration: 1,
                                                            delay: index * 0.1,
                                                            ease: 'easeOut',
                                                        }}
                                                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-600 transition-colors group-hover:from-emerald-500 group-hover:to-teal-700"
                                                    />
                                                </div>
                                                <p className="mt-1 text-right text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                    {course.progress}%
                                                </p>
                                            </motion.div>
                                        ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center">
                                    <div className="relative mx-auto mb-3 h-16 w-16">
                                        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                            <BookOpen className="h-8 w-8 text-neutral-400" />
                                        </div>
                                    </div>
                                    <p className="font-bold text-neutral-700 dark:text-neutral-300">
                                        Belum Ada Mata Kuliah
                                    </p>
                                    <Link
                                        href="/user/akademik/matkul"
                                        className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400"
                                    >
                                        Tambah Mata Kuliah{' '}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* 5️⃣ CATATAN TERBARU                                  */}
                {/* ═══════════════════════════════════════════════════ */}
                {recentNotes.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="border-b border-white/20 p-5 dark:border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30"
                                    >
                                        <NotebookPen className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <h2 className="font-bold text-neutral-900 dark:text-white">
                                            Catatan Terbaru
                                        </h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Catatan kuliah terakhir
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/user/akademik/catatan"
                                    className="flex items-center gap-1 text-sm font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400"
                                >
                                    Semua <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="grid gap-4 md:grid-cols-3">
                                {recentNotes.map((note, index) => (
                                    <Link
                                        key={note.id}
                                        href="/user/akademik/catatan"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.08 }}
                                            whileHover={{
                                                scale: 1.04,
                                                y: -4,
                                                transition: {
                                                    type: 'spring',
                                                    stiffness: 400,
                                                    damping: 15,
                                                },
                                            }}
                                            className="group cursor-pointer rounded-2xl border border-white/20 bg-white/60 p-5 shadow-lg backdrop-blur-xl transition-all dark:border-white/5 dark:bg-neutral-800/60"
                                        >
                                            <div className="mb-3 flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        note.course_mode ===
                                                        'offline'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className="text-[10px]"
                                                >
                                                    {note.course_mode ===
                                                    'offline'
                                                        ? '🏫 Offline'
                                                        : '💻 Online'}
                                                </Badge>
                                                <span className="rounded-lg bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                                    P{note.meeting_number}
                                                </span>
                                            </div>
                                            <p className="line-clamp-1 text-sm font-bold text-neutral-900 transition-colors group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
                                                {note.title}
                                            </p>
                                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                {note.course_name}
                                            </p>
                                            <p className="mt-2 flex items-center gap-1 text-[10px] text-neutral-400 dark:text-neutral-500">
                                                <Clock className="h-3 w-3" />{' '}
                                                {note.created_at}
                                            </p>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </StudentLayout>
    );
}
