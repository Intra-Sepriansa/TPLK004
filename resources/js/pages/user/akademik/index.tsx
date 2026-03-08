import { Head, Link, router } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Badge } from '@/components/ui/badge';
import {
    BookOpen, Calendar, CheckCircle2, Clock, AlertTriangle,
    ArrowRight, GraduationCap, ListTodo, NotebookPen, Sparkles,
    Target, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { useState } from 'react';

// PNG Icons — matching admin dashboard pattern
import dashboardIcon from '@/assets/mahasiswa/akademik/akademik.png';
import totalIcon from '@/assets/admin/dashboard/total-icon.png';
import hadirIcon from '@/assets/admin/dashboard/hadir-icon.png';
import terlambatIcon from '@/assets/admin/dashboard/terlambat-icon.png';
import selfieIcon from '@/assets/admin/dashboard/selfie-icon.png';

interface Props {
    todaySchedule: Array<{
        id: number; course_name: string; time: string;
        meeting_number: number; total_meetings: number;
        mode: 'online' | 'offline'; is_completed: boolean;
    }>;
    pendingTasks: Array<{
        id: number; title: string; course_name: string;
        deadline: string | null; deadline_formatted: string | null;
        days_remaining: number | null; is_overdue: boolean; status: string;
    }>;
    upcomingExams: Array<{
        id: number; course_name: string; type: 'UTS' | 'UAS';
        date: string; date_formatted: string; days_remaining: number;
        is_warning: boolean; is_critical: boolean;
    }>;
    courseProgress: Array<{
        id: number; name: string; progress: number;
        current_meeting: number; total_meetings: number;
        mode: 'online' | 'offline';
    }>;
    recentNotes: Array<{
        id: number; title: string; course_name: string;
        course_mode: 'online' | 'offline'; meeting_number: number;
        created_at: string;
    }>;
    stats: {
        totalCourses: number; completedTasks: number;
        pendingTasks: number; overdueTasks: number; weeklyProgress: number;
    };
    today: { day: string; date: string };
}

/* ═══════════════════════════════════════════════════ */
/*          ANIMATION VARIANTS — Matching Admin       */
/* ═══════════════════════════════════════════════════ */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
} as const;

export default function AcademicDashboard({
    todaySchedule, pendingTasks, upcomingExams, courseProgress, recentNotes, stats, today
}: Props) {
    const completionRate = stats.totalCourses > 0
        ? Math.round((stats.completedTasks / (stats.completedTasks + stats.pendingTasks + stats.overdueTasks)) * 100) || 0
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
                from: 'from-sky-400', to: 'to-indigo-600',
                shadow: 'shadow-sky-500/30', bg: 'bg-sky-500',
                hoverShadow: 'hover:shadow-sky-500/10',
                gradientBg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
            },
        },
        {
            icon: hadirIcon,
            title: 'Tugas Selesai',
            value: stats.completedTasks,
            note: 'Completed',
            colorConfig: {
                from: 'from-emerald-400', to: 'to-teal-600',
                shadow: 'shadow-emerald-500/30', bg: 'bg-emerald-500',
                hoverShadow: 'hover:shadow-emerald-500/10',
                gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
            },
        },
        {
            icon: terlambatIcon,
            title: 'Tugas Pending',
            value: stats.pendingTasks,
            note: stats.overdueTasks > 0 ? `${stats.overdueTasks} terlambat!` : 'On track',
            colorConfig: {
                from: 'from-amber-400', to: 'to-orange-600',
                shadow: 'shadow-amber-500/30', bg: 'bg-amber-500',
                hoverShadow: 'hover:shadow-amber-500/10',
                gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
            },
        },
        {
            icon: selfieIcon,
            title: 'Completion',
            value: completionRate,
            suffix: '%',
            note: `Progress: ${stats.weeklyProgress}%`,
            colorConfig: {
                from: 'from-rose-400', to: 'to-pink-600',
                shadow: 'shadow-rose-500/30', bg: 'bg-rose-500',
                hoverShadow: 'hover:shadow-rose-500/10',
                gradientBg: 'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10',
            },
        },
    ];

    return (
        <StudentLayout>
            <Head title="Dashboard Akademik" />
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">

                {/* ═══════════════════════════════════════════════════ */}
                {/* 1️⃣ HERO HEADER - Ultra Polished with PNG Icon      */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />

                    {/* Animated Orbs */}
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(12)].map((_, i) => (
                            <motion.div key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0], y: [0, -80] }}
                                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: i * 0.25, ease: 'easeOut' }}
                                className="absolute"
                                style={{ left: `${Math.random() * 100}%`, top: `${80 + Math.random() * 20}%` }}
                            >
                                {i % 3 === 0 ? <GraduationCap className="h-3 w-3 text-white/40" /> :
                                    i % 3 === 1 ? <BookOpen className="h-3 w-3 text-white/40" /> :
                                        <Sparkles className="h-3 w-3 text-white/40" />}
                            </motion.div>
                        ))}
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-wrap items-start justify-between gap-6">
                            {/* Left: Icon + Welcome */}
                            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
                                <motion.div
                                    className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img src={dashboardIcon} alt="Dashboard Akademik" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                </motion.div>
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                                        className="text-sm text-indigo-100 font-medium tracking-wide">
                                        {today.day}, {today.date}
                                    </motion.p>
                                    <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                                        className="text-2xl sm:text-3xl font-bold text-white mt-1">
                                        Dashboard Akademik
                                    </motion.h1>
                                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                        className="mt-2 text-indigo-100 max-w-lg text-sm sm:text-base leading-relaxed">
                                        Kelola jadwal, tugas, dan catatan kuliah kamu dengan mudah
                                    </motion.p>
                                </div>
                            </div>

                            {/* Right: Weekly Progress + Stats */}
                            <div className="flex flex-col w-full sm:w-auto items-center sm:items-end gap-2 mt-4 sm:mt-0">
                                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-4 py-2 sm:px-6 sm:py-3 shadow-lg border border-white/10">
                                    <TrendingUp className="h-5 w-5" />
                                    <div className="text-center sm:text-right">
                                        <p className="text-xl sm:text-2xl font-bold tabular-nums">{stats.weeklyProgress}%</p>
                                        <p className="text-[10px] sm:text-xs text-indigo-200">Progress Minggu Ini</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <motion.div
                            initial="hidden" animate="visible"
                            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } } }}
                            className="flex flex-nowrap w-full overflow-x-auto gap-2 sm:gap-3 mt-6 sm:mt-8 pt-6 pb-2 border-t border-white/10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                        >
                            {[
                                { href: '/user/akademik/jadwal', icon: Calendar, label: 'Jadwal' },
                                { href: '/user/akademik/tugas', icon: ListTodo, label: 'Tugas' },
                                { href: '/user/akademik/catatan', icon: NotebookPen, label: 'Catatan' },
                                { href: '/user/akademik/matkul', icon: BookOpen, label: 'Mata Kuliah' },
                                { href: '/user/akademik/ujian', icon: GraduationCap, label: 'Ujian' },
                            ].map((item, index) => (
                                <motion.a key={item.href} href={item.href}
                                    className={`inline-flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl ${index === 0
                                        ? 'bg-white text-indigo-600'
                                        : 'bg-white/20 text-white backdrop-blur-md border border-white/20 hover:bg-white/30'
                                        }`}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                >
                                    <item.icon className="h-3.5 w-3.5" />
                                    {item.label}
                                </motion.a>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* 2️⃣ STATS CARDS - Admin Pattern with PNG Icons       */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
                    initial="hidden" animate="visible"
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.2 } } }}
                >
                    {statCards.map((stat, index) => {
                        const cardKey = `stat-${index}`;
                        return (
                            <motion.div key={stat.title}
                                className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl transition-all ${stat.colorConfig.hoverShadow} dark:border-white/5`}
                                variants={{ hidden: { opacity: 0, y: 30, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } } }}
                                whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                                onHoverStart={() => setHoveredCard(cardKey)}
                                onHoverEnd={() => setHoveredCard(null)}
                            >
                                {/* Background gradient overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.colorConfig.gradientBg}`} />
                                {/* Glow effect */}
                                <motion.div
                                    initial={false}
                                    animate={{ scale: hoveredCard === cardKey ? 1.5 : 1, opacity: hoveredCard === cardKey ? 0.4 : 0.2 }}
                                    transition={{ duration: 0.5 }}
                                    className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${stat.colorConfig.bg} blur-3xl transition-all duration-500`}
                                />
                                <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
                                    <motion.div whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center">
                                        <img src={stat.icon} alt={stat.title} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" />
                                    </motion.div>
                                    <div>
                                        <p className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-neutral-400">{stat.title}</p>
                                        <div className="mt-0.5 sm:mt-1">
                                            <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                            </span>
                                        </div>
                                        <p className="text-[8px] sm:text-xs leading-tight text-neutral-400 mt-0.5">{stat.note}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* 3️⃣ MAIN CONTENT - Schedule + Tasks                 */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2">
                    {/* Jadwal Hari Ini */}
                    <motion.div variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden">
                        <div className="p-5 border-b border-white/20 dark:border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <motion.div whileHover={{ scale: 1.1, rotate: 5 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                                        <Calendar className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <h2 className="font-bold text-neutral-900 dark:text-white">Jadwal Hari Ini</h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{todaySchedule.length} perkuliahan</p>
                                    </div>
                                </div>
                                <Link href="/user/akademik/jadwal" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-bold flex items-center gap-1">
                                    Semua <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-5">
                            {todaySchedule.length > 0 ? (
                                <div className="space-y-3">
                                    {todaySchedule.map((item, index) => (
                                        <motion.div key={item.id}
                                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                                            whileHover={{ scale: 1.02, x: 4 }}
                                            className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl border border-white/20 dark:border-white/5 cursor-pointer transition-all"
                                            onClick={() => router.visit('/user/akademik/jadwal')}>
                                            <div className="relative">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg ${item.is_completed
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                    }`}>
                                                    {item.is_completed ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                                </div>
                                                {!item.is_completed && (
                                                    <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className="absolute inset-0 rounded-full bg-blue-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-sm text-neutral-900 dark:text-white truncate">{item.course_name}</span>
                                                    <Badge variant={item.mode === 'offline' ? 'default' : 'secondary'} className="text-[10px] flex-shrink-0">
                                                        {item.mode === 'offline' ? '🏫 Offline' : '💻 Online'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    {item.time} • Pertemuan {item.meeting_number}/{item.total_meetings}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="relative mx-auto w-16 h-16 mb-3">
                                        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                                        <div className="relative flex items-center justify-center w-full h-full bg-neutral-100 dark:bg-neutral-800 rounded-full">
                                            <Calendar className="h-8 w-8 text-neutral-400" />
                                        </div>
                                    </div>
                                    <p className="text-neutral-700 dark:text-neutral-300 font-bold">Tidak Ada Jadwal</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Nikmati waktu luangmu! 🎉</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Tugas Pending */}
                    <motion.div variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden">
                        <div className="p-5 border-b border-white/20 dark:border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <motion.div whileHover={{ scale: 1.1, rotate: -5 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                                        <ListTodo className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <h2 className="font-bold text-neutral-900 dark:text-white">Tugas Pending</h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{pendingTasks.length} tugas menunggu</p>
                                    </div>
                                </div>
                                <Link href="/user/akademik/tugas" className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 font-bold flex items-center gap-1">
                                    Semua <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-5">
                            {pendingTasks.length > 0 ? (
                                <div className="space-y-3">
                                    {pendingTasks.slice(0, 4).map((task, index) => (
                                        <motion.div key={task.id}
                                            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ scale: 1.02, x: 4 }}
                                            className={`relative p-4 rounded-2xl border backdrop-blur-xl cursor-pointer transition-all overflow-hidden ${task.is_overdue
                                                ? 'bg-red-50/60 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                                : 'bg-white/60 dark:bg-neutral-800/60 border-white/20 dark:border-white/5'
                                                }`}>
                                            <div className={`absolute left-0 top-0 h-full w-1 ${task.is_overdue ? 'bg-gradient-to-b from-red-500 to-rose-600' : (task.days_remaining !== null && task.days_remaining <= 3) ? 'bg-gradient-to-b from-amber-500 to-orange-600' : 'bg-gradient-to-b from-blue-500 to-indigo-600'}`} />
                                            <div className="flex items-start justify-between gap-2 pl-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-1">{task.title}</p>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{task.course_name}</p>
                                                </div>
                                                {task.deadline_formatted && (
                                                    <Badge className={`shrink-0 text-[10px] font-bold ${task.is_overdue
                                                        ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                                                        : task.days_remaining !== null && task.days_remaining <= 3
                                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                                                        }`}>
                                                        {task.is_overdue ? '⚠️ Terlambat' : task.days_remaining !== null ? `⏰ ${task.days_remaining} hari` : task.deadline_formatted}
                                                    </Badge>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="relative mx-auto w-16 h-16 mb-3">
                                        <div className="relative flex items-center justify-center w-full h-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                        </div>
                                    </div>
                                    <p className="text-neutral-700 dark:text-neutral-300 font-bold">Semua Tugas Selesai! 🎉</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Kerja bagus!</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* 4️⃣ EXAMS + PROGRESS                                */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2">
                    {/* Ujian Mendatang */}
                    <motion.div variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden">
                        <div className="p-5 border-b border-white/20 dark:border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <motion.div whileHover={{ scale: 1.1, rotate: 5 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30">
                                        <GraduationCap className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <h2 className="font-bold text-neutral-900 dark:text-white">Ujian Mendatang</h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{upcomingExams.length} ujian terjadwal</p>
                                    </div>
                                </div>
                                <Link href="/user/akademik/ujian" className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 font-bold flex items-center gap-1">
                                    Semua <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-5">
                            {upcomingExams.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingExams.slice(0, 3).map((exam, index) => (
                                        <motion.div key={exam.id}
                                            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.08 }}
                                            whileHover={{ scale: 1.02, x: 4 }}
                                            className={`p-4 rounded-2xl border backdrop-blur-xl cursor-pointer transition-all ${exam.is_critical
                                                ? 'bg-red-50/60 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                                : exam.is_warning
                                                    ? 'bg-amber-50/60 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                                                    : 'bg-white/60 dark:bg-neutral-800/60 border-white/20 dark:border-white/5'
                                                }`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge className={`text-[10px] font-bold ${exam.type === 'UTS' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' : 'bg-gradient-to-r from-purple-500 to-violet-500 text-white'}`}>
                                                            {exam.type}
                                                        </Badge>
                                                        <span className="font-bold text-sm text-neutral-900 dark:text-white">{exam.course_name}</span>
                                                    </div>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{exam.date_formatted}</p>
                                                </div>
                                                <motion.div
                                                    animate={exam.is_critical ? { scale: [1, 1.1, 1] } : {}}
                                                    transition={exam.is_critical ? { duration: 1.5, repeat: Infinity } : {}}
                                                    className={`text-right p-3 rounded-xl ${exam.is_critical ? 'bg-red-100 dark:bg-red-900/30' :
                                                        exam.is_warning ? 'bg-amber-100 dark:bg-amber-900/30' :
                                                            'bg-neutral-100 dark:bg-neutral-800'
                                                        }`}>
                                                    <p className={`text-2xl font-extrabold ${exam.is_critical ? 'text-red-600 dark:text-red-400' :
                                                        exam.is_warning ? 'text-amber-600 dark:text-amber-400' :
                                                            'text-neutral-700 dark:text-neutral-300'
                                                        }`}>{exam.days_remaining}</p>
                                                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">hari lagi</p>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="relative mx-auto w-16 h-16 mb-3">
                                        <div className="relative flex items-center justify-center w-full h-full bg-neutral-100 dark:bg-neutral-800 rounded-full">
                                            <GraduationCap className="h-8 w-8 text-neutral-400" />
                                        </div>
                                    </div>
                                    <p className="text-neutral-700 dark:text-neutral-300 font-bold">Belum Ada Ujian</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Tidak ada ujian terjadwal</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Course Progress */}
                    <motion.div variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden">
                        <div className="p-5 border-b border-white/20 dark:border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <motion.div whileHover={{ scale: 1.1, rotate: -5 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                                        <TrendingUp className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <h2 className="font-bold text-neutral-900 dark:text-white">Progress Mata Kuliah</h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Pertemuan yang sudah dilalui</p>
                                    </div>
                                </div>
                                <Link href="/user/akademik/matkul" className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-bold flex items-center gap-1">
                                    Kelola <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-5">
                            {courseProgress.length > 0 ? (
                                <div className="space-y-5">
                                    {courseProgress.slice(0, 5).map((course, index) => (
                                        <motion.div key={course.id}
                                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.08 }}
                                            whileHover={{ x: 4 }}
                                            className="group cursor-pointer">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="font-bold text-sm text-neutral-900 dark:text-white truncate">{course.name}</span>
                                                    <Badge variant="outline" className="text-[10px] border-white/20 dark:border-white/5 flex-shrink-0">
                                                        {course.mode === 'offline' ? '🏫' : '💻'} {course.mode}
                                                    </Badge>
                                                </div>
                                                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 flex-shrink-0">
                                                    {course.current_meeting}/{course.total_meetings}
                                                </span>
                                            </div>
                                            <div className="relative h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${course.progress}%` }}
                                                    transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
                                                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full group-hover:from-emerald-500 group-hover:to-teal-700 transition-colors"
                                                />
                                            </div>
                                            <p className="text-right text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">{course.progress}%</p>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="relative mx-auto w-16 h-16 mb-3">
                                        <div className="relative flex items-center justify-center w-full h-full bg-neutral-100 dark:bg-neutral-800 rounded-full">
                                            <BookOpen className="h-8 w-8 text-neutral-400" />
                                        </div>
                                    </div>
                                    <p className="text-neutral-700 dark:text-neutral-300 font-bold">Belum Ada Mata Kuliah</p>
                                    <Link href="/user/akademik/matkul" className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 inline-flex items-center gap-1 font-bold">
                                        Tambah Mata Kuliah <ArrowRight className="h-4 w-4" />
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
                    <motion.div variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden">
                        <div className="p-5 border-b border-white/20 dark:border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <motion.div whileHover={{ scale: 1.1, rotate: 5 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30">
                                        <NotebookPen className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <h2 className="font-bold text-neutral-900 dark:text-white">Catatan Terbaru</h2>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Catatan kuliah terakhir</p>
                                    </div>
                                </div>
                                <Link href="/user/akademik/catatan" className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 font-bold flex items-center gap-1">
                                    Semua <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="grid gap-4 md:grid-cols-3">
                                {recentNotes.map((note, index) => (
                                    <Link key={note.id} href="/user/akademik/catatan">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.08 }}
                                            whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                                            className="group p-5 rounded-2xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-lg cursor-pointer transition-all">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Badge variant={note.course_mode === 'offline' ? 'default' : 'secondary'} className="text-[10px]">
                                                    {note.course_mode === 'offline' ? '🏫 Offline' : '💻 Online'}
                                                </Badge>
                                                <span className="text-[10px] text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-lg font-bold">
                                                    P{note.meeting_number}
                                                </span>
                                            </div>
                                            <p className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                {note.title}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{note.course_name}</p>
                                            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2 flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {note.created_at}
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
