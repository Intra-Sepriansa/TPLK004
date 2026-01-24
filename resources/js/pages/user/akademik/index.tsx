import { Head, Link } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    BookOpen, Calendar, CheckCircle2, Clock, AlertTriangle, 
    FileText, ArrowRight, GraduationCap, ListTodo, NotebookPen, Sparkles, Target, TrendingUp, Star, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';

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
    today: {
        day: string;
        date: string;
    };
}

export default function AcademicDashboard({ 
    todaySchedule, pendingTasks, upcomingExams, courseProgress, recentNotes, stats, today 
}: Props) {
    const completionRate = stats.totalCourses > 0 
        ? Math.round((stats.completedTasks / (stats.completedTasks + stats.pendingTasks + stats.overdueTasks)) * 100) || 0
        : 0;

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 20,
            },
        },
    };

    return (
        <StudentLayout>
            <Head title="Akademik" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="flex flex-col gap-6 p-6"
            >
                {/* Header with Advanced Animations */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-8 text-white shadow-2xl"
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
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1.5, 0],
                                    y: [0, -40, -80],
                                }}
                                transition={{
                                    duration: 3,
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
                                <GraduationCap className="h-8 w-8" />
                            </motion.div>
                            <div>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-sm text-white/90 font-medium"
                                >
                                    {today.day}, {today.date}
                                </motion.p>
                                <motion.h1
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-3xl font-bold flex items-center gap-2"
                                >
                                    Dashboard Akademik
                                </motion.h1>
                            </div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-4 text-white/90 text-lg"
                        >
                            Kelola jadwal, tugas, dan catatan kuliah kamu dengan mudah
                        </motion.p>
                        
                        {/* Quick Stats with Dock-Style Animations */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                            {[
                                { icon: BookOpen, label: 'Mata Kuliah', value: stats.totalCourses, color: 'emerald' },
                                { icon: CheckCircle2, label: 'Tugas Selesai', value: stats.completedTasks, color: 'blue' },
                                { icon: Clock, label: 'Tugas Pending', value: stats.pendingTasks, color: 'amber' },
                                { icon: Target, label: 'Completion', value: completionRate, suffix: '%', color: 'purple' },
                            ].map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6 + index * 0.1, type: "spring", stiffness: 200 }}
                                    whileHover={{ 
                                        scale: 1.05, 
                                        y: -5,
                                        boxShadow: "0 10px 30px rgba(255,255,255,0.2)"
                                    }}
                                    className="bg-white/10 backdrop-blur rounded-xl p-4 cursor-pointer group"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <motion.div
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6 }}
                                        >
                                            <stat.icon className="h-5 w-5 text-white/80" />
                                        </motion.div>
                                        <p className="text-white/80 text-xs font-medium">{stat.label}</p>
                                    </div>
                                    <p className="text-3xl font-bold">
                                        <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={1500} />
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* Stats Cards with Dock-Style Animations */}
                <motion.div
                    variants={containerVariants}
                    className="grid gap-4 grid-cols-2 md:grid-cols-4"
                >
                    {[
                        { icon: BookOpen, label: 'Mata Kuliah', value: stats.totalCourses, gradient: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/50' },
                        { icon: CheckCircle2, label: 'Tugas Selesai', value: stats.completedTasks, gradient: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-500/50' },
                        { icon: Clock, label: 'Tugas Pending', value: stats.pendingTasks, gradient: 'from-amber-400 to-amber-600', shadow: 'shadow-amber-500/50' },
                        { icon: AlertTriangle, label: 'Terlambat', value: stats.overdueTasks, gradient: 'from-red-400 to-red-600', shadow: 'shadow-red-500/50' },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            variants={itemVariants}
                            whileHover={{ 
                                scale: 1.08, 
                                y: -10,
                                boxShadow: `0 20px 40px ${stat.shadow.includes('emerald') ? 'rgba(16, 185, 129, 0.3)' : stat.shadow.includes('blue') ? 'rgba(59, 130, 246, 0.3)' : stat.shadow.includes('amber') ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative rounded-2xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50 p-5 shadow-lg backdrop-blur dark:border-slate-800/50 dark:from-slate-900/80 dark:to-black/80 overflow-hidden cursor-pointer"
                        >
                            {/* Glow Effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-current/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
                                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg ${stat.shadow}`}
                                >
                                    <stat.icon className="h-6 w-6" />
                                </motion.div>
                                <div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{stat.label}</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        <AnimatedCounter value={stat.value} duration={1500} />
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Quick Navigation with Enhanced Animations */}
                <motion.div
                    variants={containerVariants}
                    className="grid gap-3 grid-cols-2 md:grid-cols-5"
                >
                    {[
                        { href: '/user/akademik/jadwal', icon: Calendar, label: 'Jadwal', color: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-500/50' },
                        { href: '/user/akademik/tugas', icon: ListTodo, label: 'Tugas', color: 'from-amber-400 to-amber-600', shadow: 'shadow-amber-500/50' },
                        { href: '/user/akademik/catatan', icon: NotebookPen, label: 'Catatan', color: 'from-purple-400 to-purple-600', shadow: 'shadow-purple-500/50' },
                        { href: '/user/akademik/matkul', icon: BookOpen, label: 'Mata Kuliah', color: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/50' },
                        { href: '/user/akademik/ujian', icon: GraduationCap, label: 'Ujian', color: 'from-red-400 to-red-600', shadow: 'shadow-red-500/50' },
                    ].map((item, index) => (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ 
                                    scale: 1.05, 
                                    y: -5,
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
                                }}
                                whileTap={{ scale: 0.95 }}
                                className="group rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70 cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.6 }}
                                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg ${item.shadow}`}
                                    >
                                        <item.icon className="h-5 w-5" />
                                    </motion.div>
                                    <span className="font-medium text-sm text-slate-900 dark:text-white">{item.label}</span>
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        whileHover={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ArrowRight className="h-4 w-4 ml-auto text-slate-400" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </motion.div>

                <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2">
                    {/* Today's Schedule */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Jadwal Hari Ini</h2>
                                    <p className="text-xs text-slate-500">{todaySchedule.length} perkuliahan</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            {todaySchedule.length > 0 ? (
                                <div className="space-y-3">
                                    {todaySchedule.map((item, index) => (
                                        <motion.div 
                                            key={item.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                                            whileHover={{ x: 5, scale: 1.02 }}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900 dark:text-white">{item.course_name}</span>
                                                    <Badge variant={item.mode === 'offline' ? 'default' : 'secondary'} className="text-xs">
                                                        {item.mode === 'offline' ? 'Offline' : 'Online'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-500">
                                                    {item.time} • Pertemuan {item.meeting_number}/{item.total_meetings}
                                                </p>
                                            </div>
                                            {item.is_completed && (
                                                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                                        <Calendar className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 font-medium">Tidak ada jadwal hari ini</p>
                                    <p className="text-sm text-slate-400">Nikmati waktu luangmu!</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Pending Tasks */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white">
                                        <ListTodo className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Tugas Pending</h2>
                                        <p className="text-xs text-slate-500">{pendingTasks.length} tugas menunggu</p>
                                    </div>
                                </div>
                                <Link href="/user/akademik/tugas" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                    Lihat Semua <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-4">
                            {pendingTasks.length > 0 ? (
                                <div className="space-y-3">
                                    {pendingTasks.slice(0, 4).map((task, index) => (
                                        <div 
                                            key={task.id} 
                                            className={`p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                                                task.is_overdue 
                                                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30' 
                                                    : 'border-slate-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-800/50'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                                                    <p className="text-sm text-slate-500">{task.course_name}</p>
                                                </div>
                                                {task.deadline_formatted && (
                                                    <Badge 
                                                        variant={task.is_overdue ? 'destructive' : task.days_remaining !== null && task.days_remaining <= 3 ? 'secondary' : 'outline'} 
                                                        className="shrink-0"
                                                    >
                                                        {task.is_overdue ? '⚠️ Terlambat' : task.days_remaining !== null ? `${task.days_remaining} hari` : task.deadline_formatted}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                    </div>
                                    <p className="text-slate-500 font-medium">Semua tugas selesai! 🎉</p>
                                    <p className="text-sm text-slate-400">Kerja bagus!</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2">
                    {/* Upcoming Exams */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-red-400 to-red-600 text-white">
                                        <GraduationCap className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Ujian Mendatang</h2>
                                        <p className="text-xs text-slate-500">{upcomingExams.length} ujian terjadwal</p>
                                    </div>
                                </div>
                                <Link href="/user/akademik/ujian" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                    Lihat Semua <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-4">
                            {upcomingExams.length > 0 ? (
                                <div className="space-y-3">
                                    {upcomingExams.slice(0, 3).map((exam) => (
                                        <div 
                                            key={exam.id} 
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                exam.is_critical 
                                                    ? 'border-red-300 bg-gradient-to-r from-red-50 to-rose-50 dark:border-red-700 dark:from-red-950/40 dark:to-rose-950/40' 
                                                    : exam.is_warning 
                                                        ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-700 dark:from-amber-950/40 dark:to-orange-950/40' 
                                                        : 'border-slate-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-800/50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={exam.type === 'UTS' ? 'secondary' : 'default'} className="font-semibold">
                                                            {exam.type}
                                                        </Badge>
                                                        <span className="font-medium text-slate-900 dark:text-white">{exam.course_name}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-1">{exam.date_formatted}</p>
                                                </div>
                                                <div className={`text-right p-2 rounded-xl ${
                                                    exam.is_critical ? 'bg-red-100 dark:bg-red-900/30' : 
                                                    exam.is_warning ? 'bg-amber-100 dark:bg-amber-900/30' : 
                                                    'bg-slate-100 dark:bg-gray-800'
                                                }`}>
                                                    <p className={`text-2xl font-bold ${
                                                        exam.is_critical ? 'text-red-600' : 
                                                        exam.is_warning ? 'text-amber-600' : 
                                                        'text-slate-700 dark:text-gray-300'
                                                    }`}>{exam.days_remaining}</p>
                                                    <p className="text-xs text-slate-500">hari lagi</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                                        <GraduationCap className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 font-medium">Belum ada ujian terjadwal</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Course Progress */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-white">
                                        <TrendingUp className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Progress Mata Kuliah</h2>
                                        <p className="text-xs text-slate-500">Pertemuan yang sudah dilalui</p>
                                    </div>
                                </div>
                                <Link href="/user/akademik/matkul" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                    Kelola <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-4">
                            {courseProgress.length > 0 ? (
                                <div className="space-y-4">
                                    {courseProgress.slice(0, 4).map((course) => (
                                        <div key={course.id} className="group">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm text-slate-900 dark:text-white">{course.name}</span>
                                                    <Badge variant="outline" className="text-xs">{course.mode}</Badge>
                                                </div>
                                                <span className="text-sm font-medium text-slate-600 dark:text-gray-400">
                                                    {course.current_meeting}/{course.total_meetings}
                                                </span>
                                            </div>
                                            <div className="relative h-2 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 ease-out group-hover:from-emerald-500 group-hover:to-emerald-700"
                                                    style={{ width: `${course.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                                        <BookOpen className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 font-medium">Belum ada mata kuliah</p>
                                    <Link href="/user/akademik/matkul" className="text-sm text-emerald-600 hover:text-emerald-700 mt-2 inline-block">
                                        Tambah Mata Kuliah
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Recent Notes */}
                {recentNotes.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black/70 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                                        <NotebookPen className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Catatan Terbaru</h2>
                                        <p className="text-xs text-slate-500">Catatan kuliah terakhir</p>
                                    </div>
                                </div>
                                <Link href="/user/akademik/catatan" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                                    Lihat Semua <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="grid gap-3 md:grid-cols-3">
                                {recentNotes.map((note, index) => (
                                    <Link key={note.id} href="/user/akademik/catatan">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant={note.course_mode === 'offline' ? 'default' : 'secondary'} className="text-xs">
                                                    {note.course_mode}
                                                </Badge>
                                                <span className="text-xs text-slate-500 bg-slate-100 dark:bg-gray-800 px-2 py-0.5 rounded">P{note.meeting_number}</span>
                                            </div>
                                            <p className="font-medium text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{note.title}</p>
                                            <p className="text-xs text-slate-500 mt-1">{note.course_name}</p>
                                            <p className="text-xs text-slate-400 mt-2">{note.created_at}</p>
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
