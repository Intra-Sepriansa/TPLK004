import { Head, Link } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {
    BookOpen,
    Users,
    Calendar,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Play,
    Image,
    QrCode,
    FileText,
    Download,
    BarChart3,
    Settings,
    Plus,
    Eye,
    UserCheck,
    ClipboardList,
    Award,
    Target,
    Zap,
    Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DosenInfo {
    id: number;
    nama: string;
    nidn: string;
    email: string;
    avatar_url?: string;
    initials: string;
}

interface TodaySchedule {
    id: number;
    course_name: string;
    meeting_number: number;
    time: string;
    room: string;
    student_count: number;
}

interface Stats {
    totalCourses: number;
    totalStudents: number;
    totalSessions: number;
    thisMonthSessions: number;
    attendanceRate: number;
    pendingCount: number;
    todaySessionsCount: number;
    averageAttendanceRate: number;
}

interface PendingVerification {
    id: number;
    mahasiswa: string;
    nim: string;
    course: string;
    selfie_url: string | null;
    scanned_at: string;
}

interface ActiveSession {
    id: number;
    title: string;
    meeting_number: number;
    course: string;
    start_at: string;
    end_at: string;
    attendance_count: number;
}

interface MonthlyTrend {
    month: string;
    total: number;
    present: number;
    rate: number;
}

interface CourseStat {
    id: number;
    name: string;
    sessions: number;
    present: number;
    late: number;
    absent: number;
}

interface RecentActivity {
    id: number;
    mahasiswa: string;
    nim: string;
    course: string;
    status: string;
    time: string;
}

interface PageProps {
    dosen: DosenInfo;
    stats: Stats;
    pendingVerifications: PendingVerification[];
    activeSessions: ActiveSession[];
    monthlyTrend: MonthlyTrend[];
    courseStats: CourseStat[];
    recentActivity: RecentActivity[];
    todaySchedule?: TodaySchedule[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
    present: { label: 'Hadir', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    late: { label: 'Terlambat', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    rejected: { label: 'Ditolak', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
    pending: { label: 'Pending', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
};

// Enhanced Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.08,
            when: "beforeChildren" as const,
        },
    },
};

const itemVariants = {
    hidden: { 
        opacity: 0, 
        y: 30,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 260,
            damping: 20,
            mass: 0.8,
        },
    },
};

const cardVariants = {
    hidden: { 
        opacity: 0, 
        scale: 0.92,
        y: 20,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 25,
        },
    },
};

const headerVariants = {
    hidden: { 
        opacity: 0, 
        y: -30,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 25,
            delay: 0.1,
        },
    },
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-black"
        >
            <p className="font-medium text-slate-900 dark:text-white mb-2">{label}</p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{entry.value}</span>
                </div>
            ))}
        </motion.div>
    );
};

export default function DosenDashboard({ dosen, stats, pendingVerifications, activeSessions, monthlyTrend, courseStats, recentActivity, todaySchedule = [] }: PageProps) {
    // Quick action items
    const quickActions = [
        { 
            icon: QrCode, 
            label: 'Buat Sesi Baru', 
            href: '/dosen/sessions/create', 
            color: 'from-emerald-500 to-emerald-600',
            description: 'Mulai sesi absensi'
        },
        { 
            icon: Eye, 
            label: 'Verifikasi Selfie', 
            href: '/dosen/verify', 
            color: 'from-amber-500 to-amber-600',
            description: `${stats.pendingCount} pending`,
            badge: stats.pendingCount
        },
        { 
            icon: FileText, 
            label: 'Lihat Laporan', 
            href: '/dosen/reports', 
            color: 'from-sky-500 to-sky-600',
            description: 'Export & analisis'
        },
        { 
            icon: ClipboardList, 
            label: 'Kelola Tugas', 
            href: '/dosen/tugas', 
            color: 'from-violet-500 to-violet-600',
            description: 'Buat & nilai tugas'
        },
        { 
            icon: BarChart3, 
            label: 'Statistik Kelas', 
            href: '/dosen/class-insights', 
            color: 'from-indigo-500 to-indigo-600',
            description: 'Analisis mendalam'
        },
        { 
            icon: Settings, 
            label: 'Pengaturan', 
            href: '/dosen/settings', 
            color: 'from-slate-500 to-slate-600',
            description: 'Konfigurasi sistem'
        },
    ];

    return (
        <DosenLayout>
            <Head title="Dashboard Dosen" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-6"
            >
                {/* Enhanced Header with Black Background */}
                <motion.div
                    variants={headerVariants}
                    whileHover={{ 
                        scale: 1.01,
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 text-white shadow-2xl"
                >
                    {/* Animated Background Elements */}
                    <motion.div
                        animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.15, 0.25, 0.15],
                            rotate: [0, 90, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl"
                    />
                    <motion.div
                        animate={{ 
                            scale: [1, 1.4, 1],
                            opacity: [0.1, 0.2, 0.1],
                            rotate: [0, -90, 0],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
                        className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl"
                    />
                    
                    {/* Floating particles */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ 
                                opacity: [0, 0.6, 0],
                                scale: [0, 1.5, 0],
                                y: [0, -60, -120],
                                x: [0, Math.sin(i) * 40, 0],
                            }}
                            transition={{
                                duration: 4 + Math.random() * 2,
                                repeat: Infinity,
                                delay: i * 0.8,
                                ease: "easeOut"
                            }}
                            className="absolute rounded-full bg-white/30"
                            style={{
                                width: `${4 + Math.random() * 6}px`,
                                height: `${4 + Math.random() * 6}px`,
                                left: `${20 + i * 12}%`,
                                top: `${30 + (i % 3) * 20}%`,
                                filter: 'blur(1px)',
                            }}
                        />
                    ))}

                    <div className="relative z-10">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ 
                                        scale: 1.15, 
                                        rotate: [0, -5, 5, 0],
                                        boxShadow: "0 0 30px rgba(99, 102, 241, 0.6)"
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 backdrop-blur-xl text-2xl font-bold ring-2 ring-white/20 cursor-pointer"
                                >
                                    {dosen.initials}
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-indigo-200 font-medium"
                                    >
                                        Selamat Datang,
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                        className="text-2xl font-bold"
                                    >
                                        {dosen.nama}
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-sm text-indigo-200"
                                    >
                                        NIDN: {dosen.nidn}
                                    </motion.p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {stats.pendingCount > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                                    >
                                        <Link href="/dosen/verify">
                                            <motion.div
                                                whileHover={{ scale: 1.08, y: -3 }}
                                                whileTap={{ scale: 0.95 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                            >
                                                <Button className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg relative overflow-hidden group">
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100"
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                    <motion.div
                                                        animate={{ 
                                                            rotate: [0, 15, -15, 0],
                                                        }}
                                                        transition={{ 
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: "easeInOut",
                                                        }}
                                                        className="relative z-10"
                                                    >
                                                        <AlertCircle className="h-4 w-4 mr-2" />
                                                    </motion.div>
                                                    <span className="relative z-10">{stats.pendingCount} Verifikasi Pending</span>
                                                </Button>
                                            </motion.div>
                                        </Link>
                                    </motion.div>
                                )}
                                
                                {todaySchedule.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                                        className="hidden sm:flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-xl ring-1 ring-white/20"
                                    >
                                        <motion.div
                                            animate={{ 
                                                scale: [1, 1.2, 1],
                                            }}
                                            transition={{ 
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                            }}
                                        >
                                            <Calendar className="h-4 w-4 text-emerald-300" />
                                        </motion.div>
                                        <span className="text-sm font-medium">{todaySchedule.length} kelas hari ini</span>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Enhanced Stats Grid */}
                        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[
                                { icon: BookOpen, label: 'Mata Kuliah', value: stats.totalCourses, delay: 0.2, color: 'from-emerald-500/20 to-emerald-600/20' },
                                { icon: Users, label: 'Mahasiswa', value: stats.totalStudents, delay: 0.3, color: 'from-sky-500/20 to-sky-600/20' },
                                { icon: Calendar, label: 'Total Sesi', value: stats.totalSessions, delay: 0.4, color: 'from-violet-500/20 to-violet-600/20' },
                                { icon: TrendingUp, label: 'Kehadiran', value: stats.attendanceRate, suffix: '%', delay: 0.5, color: 'from-amber-500/20 to-amber-600/20' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ 
                                        delay: stat.delay, 
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20,
                                    }}
                                    whileHover={{ 
                                        scale: 1.08, 
                                        y: -5,
                                        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        "rounded-xl bg-gradient-to-br p-3 backdrop-blur-xl ring-1 ring-white/10 cursor-pointer relative overflow-hidden group",
                                        stat.color
                                    )}
                                >
                                    {/* Shimmer effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{ 
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear",
                                            repeatDelay: 3,
                                        }}
                                    />
                                    
                                    <div className="flex items-center gap-2 text-indigo-100 mb-1 relative z-10">
                                        <motion.div 
                                            whileHover={{ 
                                                rotate: [0, -10, 10, 0],
                                                scale: 1.2,
                                            }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <stat.icon className="h-4 w-4" />
                                        </motion.div>
                                        <span className="text-xs font-medium">{stat.label}</span>
                                    </div>
                                    <motion.p 
                                        className="text-2xl font-bold relative z-10"
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ 
                                            type: "spring",
                                            stiffness: 200,
                                            delay: stat.delay + 0.2,
                                        }}
                                    >
                                        <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={1500} />
                                    </motion.p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions Menu - NEW */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <motion.div
                            whileHover={{ 
                                scale: 1.2,
                                rotate: [0, -10, 10, 0],
                            }}
                            transition={{ duration: 0.5 }}
                        >
                            <Zap className="h-5 w-5 text-amber-600" />
                        </motion.div>
                        <h2 className="font-semibold text-slate-900 dark:text-white">Aksi Cepat</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {quickActions.map((action, index) => (
                            <Link key={action.href} href={action.href}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ 
                                        delay: index * 0.08,
                                        type: "spring",
                                        stiffness: 200,
                                    }}
                                    whileHover={{ 
                                        scale: 1.08, 
                                        y: -8,
                                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        "relative overflow-hidden rounded-xl bg-gradient-to-br p-4 text-white cursor-pointer group",
                                        action.color
                                    )}
                                >
                                    {/* Shimmer effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{ 
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear",
                                            repeatDelay: 3,
                                        }}
                                    />
                                    
                                    {/* Badge for pending items */}
                                    {action.badge && action.badge > 0 && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/30 backdrop-blur text-xs font-bold"
                                        >
                                            <motion.span
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                {action.badge}
                                            </motion.span>
                                        </motion.div>
                                    )}
                                    
                                    <div className="relative z-10">
                                        <motion.div
                                            whileHover={{ 
                                                rotate: [0, -10, 10, -10, 0],
                                                scale: 1.2,
                                            }}
                                            transition={{ duration: 0.6 }}
                                            className="mb-3"
                                        >
                                            <action.icon className="h-6 w-6" />
                                        </motion.div>
                                        <p className="text-sm font-semibold mb-1">{action.label}</p>
                                        <p className="text-xs opacity-90">{action.description}</p>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </motion.div>

                {/* Today's Schedule - NEW */}
                {todaySchedule.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ 
                            scale: 1.01, 
                            y: -3,
                            boxShadow: "0 10px 20px -5px rgba(99, 102, 241, 0.2)",
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-sm dark:border-indigo-800 dark:from-indigo-950/30 dark:to-purple-950/30 relative overflow-hidden"
                    >
                        {/* Animated background */}
                        <motion.div
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.2, 0.1],
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute top-0 right-0 w-40 h-40 rounded-full bg-indigo-500/20 blur-3xl"
                        />
                        
                        <div className="flex items-center gap-2 mb-4 relative z-10">
                            <motion.div
                                animate={{ 
                                    rotate: [0, 10, -10, 0],
                                }}
                                transition={{ 
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            >
                                <Calendar className="h-5 w-5 text-indigo-600" />
                            </motion.div>
                            <h2 className="font-semibold text-slate-900 dark:text-white">Jadwal Hari Ini</h2>
                            <motion.span 
                                className="ml-auto px-3 py-1 rounded-full bg-indigo-500 text-white text-xs font-medium"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {todaySchedule.length} kelas
                            </motion.span>
                        </div>
                        
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
                            {todaySchedule.map((schedule, index) => (
                                <motion.div
                                    key={schedule.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ 
                                        delay: index * 0.1,
                                        type: "spring",
                                        stiffness: 200,
                                    }}
                                    whileHover={{ 
                                        scale: 1.03, 
                                        x: 5,
                                        boxShadow: "0 10px 20px -5px rgba(99, 102, 241, 0.3)",
                                    }}
                                    className="p-4 rounded-xl bg-white/80 dark:bg-black/80 border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white text-xs font-bold">
                                                {schedule.meeting_number}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    {schedule.course_name}
                                                </p>
                                                <p className="text-xs text-slate-500">{schedule.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {schedule.student_count} mhs
                                        </span>
                                        <span>{schedule.room}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Active Sessions & Pending Verifications - ENHANCED */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Active Sessions - Enhanced */}
                    <motion.div
                        variants={cardVariants}
                        whileHover={{ 
                            scale: 1.02, 
                            y: -5,
                            boxShadow: "0 15px 30px -10px rgba(16, 185, 129, 0.3)",
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 p-6 shadow-sm backdrop-blur dark:border-emerald-800/70 dark:from-emerald-950/30 dark:to-teal-950/30 relative overflow-hidden"
                    >
                        {/* Animated background orb */}
                        <motion.div
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.15, 0.1],
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/20 blur-3xl"
                        />
                        
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <motion.div 
                                    whileHover={{ 
                                        rotate: [0, -15, 15, 0],
                                        scale: 1.2,
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg"
                                >
                                    <Play className="h-5 w-5" />
                                </motion.div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Sesi Aktif</h2>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                        {activeSessions.length} sesi berlangsung
                                    </p>
                                </div>
                            </div>
                            <Link href="/dosen/courses">
                                <motion.div
                                    whileHover={{ scale: 1.05, x: 3 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                                >
                                    Lihat Semua
                                    <ChevronRight className="h-3 w-3" />
                                </motion.div>
                            </Link>
                        </div>
                        {activeSessions.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8 text-slate-500 relative z-10"
                            >
                                <motion.div
                                    animate={{ 
                                        y: [0, -10, 0],
                                        rotate: [0, 5, -5, 0],
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                </motion.div>
                                <p className="font-medium">Tidak ada sesi aktif</p>
                                <p className="text-xs mt-1">Buat sesi baru untuk memulai</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-3 relative z-10">
                                {activeSessions.map((session, index) => (
                                    <Link key={session.id} href={`/dosen/sessions/${session.id}`}>
                                        <motion.div
                                            initial={{ opacity: 0, x: -30, scale: 0.9 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            transition={{ 
                                                delay: index * 0.08,
                                                type: "spring",
                                                stiffness: 200,
                                            }}
                                            whileHover={{ 
                                                x: 8, 
                                                scale: 1.03,
                                                boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)",
                                            }}
                                            whileTap={{ scale: 0.97 }}
                                            className="flex items-center gap-4 p-4 rounded-xl bg-white/80 hover:bg-white border border-emerald-200 dark:bg-black/60 dark:hover:bg-black/80 dark:border-emerald-800 cursor-pointer relative overflow-hidden group"
                                        >
                                            {/* Shimmer effect */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent"
                                                animate={{ x: ['-100%', '100%'] }}
                                                transition={{ 
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                    repeatDelay: 3,
                                                }}
                                            />
                                            
                                            <motion.div 
                                                whileHover={{ 
                                                    rotate: [0, -10, 10, 0],
                                                    scale: 1.1,
                                                }}
                                                transition={{ duration: 0.5 }}
                                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold shadow-lg relative z-10"
                                            >
                                                {session.meeting_number}
                                            </motion.div>
                                            <div className="flex-1 min-w-0 relative z-10">
                                                <p className="font-semibold text-slate-900 dark:text-white truncate">{session.title}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">{session.course}</p>
                                            </div>
                                            <div className="text-right relative z-10">
                                                <motion.p 
                                                    className="text-sm font-bold text-emerald-600 dark:text-emerald-400"
                                                    animate={{ scale: [1, 1.05, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                >
                                                    {session.attendance_count} hadir
                                                </motion.p>
                                                <p className="text-xs text-slate-500">{session.start_at} - {session.end_at}</p>
                                            </div>
                                            <motion.div 
                                                whileHover={{ x: 5 }}
                                                className="relative z-10"
                                            >
                                                <ChevronRight className="h-5 w-5 text-slate-400" />
                                            </motion.div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Pending Verifications - Enhanced */}
                    <motion.div
                        variants={cardVariants}
                        whileHover={{ 
                            scale: 1.02, 
                            y: -5,
                            boxShadow: "0 15px 30px -10px rgba(245, 158, 11, 0.3)",
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/80 to-orange-50/80 p-6 shadow-sm backdrop-blur dark:border-amber-800/70 dark:from-amber-950/30 dark:to-orange-950/30 relative overflow-hidden"
                    >
                        {/* Animated background orb */}
                        <motion.div
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.15, 0.1],
                            }}
                            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                            className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-500/20 blur-3xl"
                        />
                        
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2">
                                <motion.div 
                                    whileHover={{ 
                                        rotate: [0, -15, 15, 0],
                                        scale: 1.2,
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg relative"
                                >
                                    {stats.pendingCount > 0 && (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center"
                                        >
                                            {stats.pendingCount}
                                        </motion.div>
                                    )}
                                    <Image className="h-5 w-5" />
                                </motion.div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Verifikasi Pending</h2>
                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                        {pendingVerifications.length} menunggu verifikasi
                                    </p>
                                </div>
                            </div>
                            <Link href="/dosen/verify">
                                <motion.div
                                    whileHover={{ scale: 1.05, x: 3 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                                >
                                    Lihat Semua
                                    <ChevronRight className="h-3 w-3" />
                                </motion.div>
                            </Link>
                        </div>
                        {pendingVerifications.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8 text-slate-500 relative z-10"
                            >
                                <motion.div
                                    animate={{ 
                                        scale: [1, 1.1, 1],
                                        rotate: [0, 10, -10, 0],
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-400" />
                                </motion.div>
                                <p className="font-medium">Semua selfie sudah diverifikasi</p>
                                <p className="text-xs mt-1">Kerja bagus! 🎉</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-3 relative z-10">
                                {pendingVerifications.map((v, index) => (
                                    <Link key={v.id} href="/dosen/verify">
                                        <motion.div
                                            initial={{ opacity: 0, x: -30, scale: 0.9 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            transition={{ 
                                                delay: index * 0.08,
                                                type: "spring",
                                                stiffness: 200,
                                            }}
                                            whileHover={{ 
                                                x: 8, 
                                                scale: 1.03,
                                                boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.3)",
                                            }}
                                            whileTap={{ scale: 0.97 }}
                                            className="flex items-center gap-3 p-4 rounded-xl bg-white/80 hover:bg-white border border-amber-200 dark:bg-black/60 dark:hover:bg-black/80 dark:border-amber-800 cursor-pointer relative overflow-hidden group"
                                        >
                                            {/* Shimmer effect */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent"
                                                animate={{ x: ['-100%', '100%'] }}
                                                transition={{ 
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                    repeatDelay: 3,
                                                }}
                                            />
                                            
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                className="relative z-10"
                                            >
                                                {v.selfie_url ? (
                                                    <img src={v.selfie_url} alt="" className="h-14 w-14 rounded-xl object-cover ring-2 ring-amber-300 shadow-lg" />
                                                ) : (
                                                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center shadow-lg">
                                                        <Image className="h-6 w-6 text-amber-600" />
                                                    </div>
                                                )}
                                            </motion.div>
                                            <div className="flex-1 min-w-0 relative z-10">
                                                <p className="font-semibold text-slate-900 dark:text-white truncate">{v.mahasiswa}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">{v.nim}</p>
                                                <p className="text-xs text-slate-500">{v.course}</p>
                                            </div>
                                            <div className="text-right relative z-10">
                                                <motion.div
                                                    animate={{ scale: [1, 1.1, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="px-2 py-1 rounded-full bg-amber-500 text-white text-xs font-medium mb-1"
                                                >
                                                    Pending
                                                </motion.div>
                                                <p className="text-xs text-slate-500">{v.scanned_at}</p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Charts - ENHANCED */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Monthly Trend - Enhanced */}
                    {monthlyTrend.length > 0 && (
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ 
                                scale: 1.02, 
                                y: -5,
                                boxShadow: "0 15px 30px -10px rgba(99, 102, 241, 0.3)",
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 p-6 shadow-sm backdrop-blur dark:border-indigo-800/70 dark:from-indigo-950/30 dark:to-purple-950/30 relative overflow-hidden"
                        >
                            {/* Animated background orb */}
                            <motion.div
                                animate={{ 
                                    scale: [1, 1.3, 1],
                                    opacity: [0.08, 0.15, 0.08],
                                }}
                                transition={{ duration: 5, repeat: Infinity }}
                                className="absolute top-0 right-0 w-40 h-40 rounded-full bg-indigo-500/20 blur-3xl"
                            />
                            
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    <motion.div 
                                        whileHover={{ 
                                            rotate: [0, -15, 15, 0],
                                            scale: 1.2,
                                        }}
                                        transition={{ duration: 0.5 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg"
                                    >
                                        <TrendingUp className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Tren Kehadiran</h2>
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400">6 bulan terakhir</p>
                                    </div>
                                </div>
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="px-3 py-1 rounded-full bg-indigo-500 text-white text-xs font-medium"
                                >
                                    {stats.averageAttendanceRate}% avg
                                </motion.div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="relative z-10"
                            >
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={monthlyTrend}>
                                        <defs>
                                            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area 
                                            type="monotone" 
                                            dataKey="present" 
                                            name="Hadir" 
                                            stroke="#6366f1" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorPresent)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Course Stats - Enhanced */}
                    {courseStats.length > 0 && (
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ 
                                scale: 1.02, 
                                y: -5,
                                boxShadow: "0 15px 30px -10px rgba(139, 92, 246, 0.3)",
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="rounded-2xl border border-purple-200/70 bg-gradient-to-br from-purple-50/80 to-pink-50/80 p-6 shadow-sm backdrop-blur dark:border-purple-800/70 dark:from-purple-950/30 dark:to-pink-950/30 relative overflow-hidden"
                        >
                            {/* Animated background orb */}
                            <motion.div
                                animate={{ 
                                    scale: [1, 1.3, 1],
                                    opacity: [0.08, 0.15, 0.08],
                                }}
                                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                                className="absolute top-0 right-0 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl"
                            />
                            
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    <motion.div 
                                        whileHover={{ 
                                            rotate: [0, -15, 15, 0],
                                            scale: 1.2,
                                        }}
                                        transition={{ duration: 0.5 }}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-white shadow-lg"
                                    >
                                        <BookOpen className="h-5 w-5" />
                                    </motion.div>
                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Statistik Mata Kuliah</h2>
                                        <p className="text-xs text-purple-600 dark:text-purple-400">{courseStats.length} mata kuliah</p>
                                    </div>
                                </div>
                                <Link href="/dosen/reports">
                                    <motion.div
                                        whileHover={{ scale: 1.05, x: 3 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                                    >
                                        Detail
                                        <ChevronRight className="h-3 w-3" />
                                    </motion.div>
                                </Link>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="relative z-10"
                            >
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={courseStats.map(c => ({ 
                                        name: c.name.length > 12 ? c.name.substring(0, 12) + '...' : c.name, 
                                        Hadir: c.present, 
                                        Terlambat: c.late, 
                                        Absen: c.absent 
                                    }))}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="Hadir" fill="#10b981" radius={[8, 8, 0, 0]} animationDuration={1500} />
                                        <Bar dataKey="Terlambat" fill="#f59e0b" radius={[8, 8, 0, 0]} animationDuration={1500} />
                                        <Bar dataKey="Absen" fill="#f43f5e" radius={[8, 8, 0, 0]} animationDuration={1500} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </motion.div>
                    )}
                </div>

                {/* Recent Activity - ENHANCED */}
                <motion.div
                    variants={cardVariants}
                    whileHover={{ 
                        scale: 1.01, 
                        y: -3,
                        boxShadow: "0 15px 30px -10px rgba(100, 116, 139, 0.3)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50/80 to-gray-50/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:from-slate-950/30 dark:to-gray-950/30 relative overflow-hidden"
                >
                    {/* Animated background orb */}
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.05, 0.1, 0.05],
                        }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="absolute top-0 right-0 w-40 h-40 rounded-full bg-slate-500/20 blur-3xl"
                    />
                    
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-2">
                            <motion.div 
                                whileHover={{ 
                                    rotate: [0, -15, 15, 0],
                                    scale: 1.2,
                                }}
                                transition={{ duration: 0.5 }}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-600 text-white shadow-lg"
                            >
                                <Clock className="h-5 w-5" />
                            </motion.div>
                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Aktivitas Terbaru</h2>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Real-time updates</p>
                            </div>
                        </div>
                        <motion.div
                            animate={{ 
                                scale: [1, 1.1, 1],
                                opacity: [0.7, 1, 0.7],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="h-2 w-2 rounded-full bg-emerald-500"
                        />
                    </div>
                    {recentActivity.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12 text-slate-500 relative z-10"
                        >
                            <motion.div
                                animate={{ 
                                    y: [0, -10, 0],
                                    rotate: [0, 5, -5, 0],
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                            </motion.div>
                            <p className="font-medium">Belum ada aktivitas</p>
                            <p className="text-xs mt-1">Aktivitas akan muncul di sini</p>
                        </motion.div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-gray-800 relative z-10">
                            {recentActivity.map((activity, index) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -30, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    transition={{ 
                                        delay: index * 0.06,
                                        type: "spring",
                                        stiffness: 200,
                                    }}
                                    whileHover={{ 
                                        x: 8, 
                                        backgroundColor: 'rgba(99, 102, 241, 0.05)',
                                        scale: 1.01,
                                    }}
                                    className="flex items-center gap-4 py-4 cursor-pointer rounded-lg px-2 -mx-2 relative overflow-hidden group"
                                >
                                    {/* Shimmer effect on hover */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100"
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{ 
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                    />
                                    
                                    <motion.div 
                                        whileHover={{ 
                                            scale: 1.15,
                                            rotate: [0, -5, 5, 0],
                                        }}
                                        transition={{ duration: 0.5 }}
                                        className={cn(
                                            'flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold shadow-lg relative z-10',
                                            statusConfig[activity.status]?.color || 'bg-slate-100 text-slate-600'
                                        )}
                                    >
                                        {activity.mahasiswa.charAt(0)}
                                    </motion.div>
                                    <div className="flex-1 min-w-0 relative z-10">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                            {activity.mahasiswa}
                                        </p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            {activity.nim} • {activity.course}
                                        </p>
                                    </div>
                                    <div className="text-right relative z-10">
                                        <motion.span 
                                            whileHover={{ scale: 1.05 }}
                                            className={cn(
                                                'inline-block px-3 py-1 rounded-full text-xs font-medium shadow-sm',
                                                statusConfig[activity.status]?.color || 'bg-slate-100 text-slate-600'
                                            )}
                                        >
                                            {statusConfig[activity.status]?.label || activity.status}
                                        </motion.span>
                                        <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                                    </div>
                                    <motion.div
                                        whileHover={{ x: 5 }}
                                        className="relative z-10"
                                    >
                                        <ChevronRight className="h-4 w-4 text-slate-400" />
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </DosenLayout>
    );
}
