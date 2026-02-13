import { Head, Link, usePage } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    FileText,
    TrendingUp,
    Users,
    XCircle,
    ChevronRight,
    Award,
    Target,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MahasiswaInfo {
    id: number;
    nama: string;
    nim: string;
}

interface Stats {
    totalSessions: number;
    presentCount: number;
    lateCount: number;
    rejectedCount: number;
    totalAttendance: number;
    attendanceRate: number;
    onTimeRate: number;
    thisMonthTotal: number;
    thisMonthPresent: number;
}

interface CourseSummary {
    courseId: number;
    courseName: string;
    total: number;
    present: number;
    late: number;
    rejected: number;
    attended: number;
    rate: number;
}

interface MonthlyTrend {
    month: string;
    total: number;
    attended: number;
    rate: number;
}

interface Distribution {
    name: string;
    value: number;
    color: string;
}

interface RecentLog {
    id: number;
    status: string;
    courseName: string;
    meetingNumber: number;
    scannedAt: string;
    scannedAtFormatted: string;
}

interface PageProps {
    mahasiswa: MahasiswaInfo;
    stats: Stats;
    courseSummary: CourseSummary[];
    monthlyTrend: MonthlyTrend[];
    distribution: Distribution[];
    recentLogs: RecentLog[];
}

const statusConfig = {
    present: { label: 'Hadir', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
    late: { label: 'Terlambat', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    rejected: { label: 'Ditolak', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
};

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
    hidden: { 
        opacity: 0, 
        y: 40,
        scale: 0.9,
        rotateX: -10,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 100,
            damping: 15,
            mass: 0.8,
        },
    },
};

const cardHoverVariants = {
    hover: {
        scale: 1.02,
        y: -4,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 15,
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

function StatCard({
    icon: Icon,
    label,
    value,
    suffix,
    subtext,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    suffix?: string;
    subtext?: string;
    color: 'emerald' | 'amber' | 'sky' | 'violet' | 'rose';
}) {
    const colors = {
        emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
        violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    };

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ 
                scale: 1.05, 
                y: -4,
            }}
            whileTap={{ scale: 0.98 }}
            className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80 cursor-pointer relative overflow-hidden"
        >
            <div className="flex items-center gap-3 relative z-10">
                <motion.div
                    whileHover={{ scale: 1.2, y: -2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className={cn('flex h-12 w-12 items-center justify-center rounded-xl', colors[color])}
                >
                    <Icon className="h-6 w-6" />
                </motion.div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        <AnimatedCounter value={value} suffix={suffix} />
                    </p>
                    {subtext && <p className="text-[10px] text-slate-400">{subtext}</p>}
                </div>
            </div>
        </motion.div>
    );
}

export default function UserRekapan() {
    const { props } = usePage<{ props: PageProps }>();
    const {
        mahasiswa = { id: 0, nama: '', nim: '' },
        stats = {
            totalSessions: 0, presentCount: 0, lateCount: 0, rejectedCount: 0,
            totalAttendance: 0, attendanceRate: 0, onTimeRate: 0,
            thisMonthTotal: 0, thisMonthPresent: 0,
        },
        courseSummary = [],
        monthlyTrend = [],
        distribution = [],
        recentLogs = [],
    } = props as unknown as PageProps;

    // Transform data for charts
    const courseChartData = courseSummary.map(c => ({
        name: c.courseName.length > 12 ? c.courseName.substring(0, 12) + '...' : c.courseName,
        Hadir: c.present,
        Terlambat: c.late,
        Ditolak: c.rejected,
    }));

    const trendChartData = monthlyTrend.map(m => ({
        name: m.month.split(' ')[0],
        Kehadiran: m.rate,
        Total: m.total,
    }));

    return (
        <StudentLayout>
            <Head title="Rekapan Kehadiran" />

            {/* Subtle Background Gradient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-gradient-to-br from-blue-50/30 to-cyan-50/30 dark:from-blue-950/10 dark:to-cyan-950/10" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6 relative z-10"
            >
                {/* Header Card - ULTRA ADVANCED */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ 
                        scale: 1.01,
                        rotateY: 1,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
                        }}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2,
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-56 w-56 rounded-full bg-gradient-to-br from-blue-400/20 to-teal-400/20 blur-3xl"
                    />

                    {/* 25 Floating Particles */}
                    {[...Array(25)].map((_, i) => (
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
                                delay: i * 0.2,
                                ease: "easeOut"
                            }}
                            className="absolute rounded-full shadow-lg"
                            style={{
                                width: `${3 + Math.random() * 10}px`,
                                height: `${3 + Math.random() * 10}px`,
                                left: `${10 + (i * 3.5) % 80}%`,
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

                    {/* Floating Icons */}
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
                        <FileText className="h-16 w-16" />
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
                        <Award className="h-20 w-20" />
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
                    
                    <div className="relative z-10">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <motion.p 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-sm text-cyan-100 font-semibold tracking-wide"
                                >
                                    Rekapan Kehadiran
                                </motion.p>
                                <motion.h1 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                                    className="text-3xl font-extrabold tracking-tight"
                                >
                                    {mahasiswa.nama}
                                </motion.h1>
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-sm text-cyan-100 font-mono"
                                >
                                    NIM: {mahasiswa.nim}
                                </motion.p>
                            </div>
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
                                {/* Glow effect */}
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
                                <FileText className="h-10 w-10 relative z-10" />
                            </motion.div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {[
                                { label: "Total Sesi", value: stats.totalSessions, delay: 0.2 },
                                { label: "Kehadiran", value: stats.attendanceRate, suffix: "%", delay: 0.3 },
                                { label: "Tepat Waktu", value: stats.onTimeRate, suffix: "%", delay: 0.4 },
                                { label: "Bulan Ini", value: stats.thisMonthPresent, extra: `/${stats.thisMonthTotal}`, delay: 0.5 },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ 
                                        delay: item.delay, 
                                        type: "spring",
                                        stiffness: 200
                                    }}
                                    whileHover={{ 
                                        scale: 1.08, 
                                        y: -4,
                                        boxShadow: "0 10px 25px -5px rgba(6, 182, 212, 0.3)",
                                    }}
                                    className="rounded-xl bg-white/15 p-4 backdrop-blur-xl cursor-pointer relative overflow-hidden group shadow-lg ring-1 ring-white/20"
                                >
                                    {/* Shimmer effect on hover */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{ 
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                    />
                                    <p className="text-xs text-cyan-100 font-semibold relative z-10">{item.label}</p>
                                    <p className="text-2xl font-bold relative z-10">
                                        <AnimatedCounter value={item.value} suffix={item.suffix || ""} duration={1500} />
                                        {item.extra || ""}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-4"
                >
                    <StatCard icon={CheckCircle} label="Hadir" value={stats.presentCount} subtext="tepat waktu" color="emerald" />
                    <StatCard icon={Clock} label="Terlambat" value={stats.lateCount} subtext="sesi" color="amber" />
                    <StatCard icon={XCircle} label="Ditolak" value={stats.rejectedCount} subtext="sesi" color="rose" />
                    <StatCard icon={Target} label="Target" value={75} suffix="%" subtext="min. kehadiran" color="violet" />
                </motion.div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Course Summary Table */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.01, y: -2 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80 relative overflow-hidden"
                        >
                            
                            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-gray-800 relative z-10">
                                <div className="flex items-center gap-2">
                                    <motion.div 
                                        whileHover={{ scale: 1.2, y: -2 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    >
                                        <BookOpen className="h-5 w-5 text-violet-600" />
                                    </motion.div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Ringkasan per Mata Kuliah
                                    </h2>
                                </div>
                                <motion.span 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: "spring" }}
                                    className="text-sm text-slate-500"
                                >
                                    {courseSummary.length} mata kuliah
                                </motion.span>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-gray-800 relative z-10">
                                {courseSummary.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-8 text-center"
                                    >
                                        <BookOpen className="h-12 w-12 mx-auto text-slate-300" />
                                        <p className="mt-3 text-slate-500">Belum ada data mata kuliah</p>
                                    </motion.div>
                                ) : (
                                    courseSummary.map((course, index) => (
                                        <motion.div
                                            key={course.courseId}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ 
                                                delay: index * 0.05,
                                                type: "spring",
                                                stiffness: 200
                                            }}
                                            whileHover={{ 
                                                x: 3, 
                                                scale: 1.005,
                                            }}
                                            className="p-4 cursor-pointer border-l-2 border-transparent hover:border-violet-500 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                                                    {course.courseName}
                                                </h3>
                                                <span className={cn(
                                                    'px-2 py-1 rounded-full text-xs font-semibold',
                                                    course.rate >= 75 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    course.rate >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                )}>
                                                    {course.rate}%
                                                </span>
                                            </div>
                                            <Progress value={course.rate} className="h-2 mb-2" />
                                            <div className="flex gap-4 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                    Hadir: {course.present}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                                                    Terlambat: {course.late}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                                                    Ditolak: {course.rejected}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        {/* Course Bar Chart */}
                        {courseChartData.length > 0 && (
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ scale: 1.01, y: -2 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80 relative overflow-hidden"
                            >
                                
                                <div className="flex items-center gap-2 mb-4 relative z-10">
                                    <motion.div 
                                        whileHover={{ scale: 1.2, y: -2 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    >
                                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                                    </motion.div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Grafik per Mata Kuliah
                                    </h2>
                                </div>
                                <div className="relative z-10">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={courseChartData}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Bar dataKey="Hadir" fill="#10b981" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Terlambat" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Ditolak" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        )}

                        {/* Monthly Trend */}
                        {trendChartData.length > 0 && (
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ scale: 1.01, y: -2 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <motion.div 
                                        whileHover={{ scale: 1.2, y: -2 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    >
                                        <Calendar className="h-5 w-5 text-sky-600" />
                                    </motion.div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Tren Kehadiran 6 Bulan Terakhir
                                    </h2>
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={trendChartData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line type="monotone" dataKey="Kehadiran" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Distribution Pie Chart */}
                        {distribution.some(d => d.value > 0) && (
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ scale: 1.01, y: -2 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <motion.div 
                                        whileHover={{ scale: 1.2, y: -2 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    >
                                        <Award className="h-5 w-5 text-amber-600" />
                                    </motion.div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Distribusi Status
                                    </h2>
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={distribution.filter(d => d.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-4 mt-2">
                                    {distribution.filter(d => d.value > 0).map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2 text-xs">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <span className="text-slate-600 dark:text-slate-400">
                                                {entry.name}: {entry.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Attendance Rate Card */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -3 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-black to-slate-800 p-6 text-white shadow-sm dark:from-gray-900 dark:to-black"
                        >
                            <p className="text-sm text-slate-400">Tingkat Kehadiran</p>
                            <div className="flex items-end gap-2 mt-2">
                                <span className="text-4xl font-bold">
                                    <AnimatedCounter value={stats.attendanceRate} suffix="%" />
                                </span>
                                {stats.attendanceRate >= 75 ? (
                                    <span className="text-emerald-400 text-sm mb-1 flex items-center gap-1">
                                        <Zap className="h-4 w-4" /> Bagus!
                                    </span>
                                ) : (
                                    <span className="text-amber-400 text-sm mb-1">Perlu ditingkatkan</span>
                                )}
                            </div>
                            <Progress
                                value={stats.attendanceRate}
                                className="mt-4 h-2 bg-slate-700"
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                Minimal 75% untuk memenuhi syarat kehadiran
                            </p>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.01, y: -2 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-gray-800">
                                <div className="flex items-center gap-2">
                                    <motion.div 
                                        whileHover={{ scale: 1.2, y: -2 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    >
                                        <Clock className="h-5 w-5 text-sky-600" />
                                    </motion.div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Aktivitas Terakhir
                                    </h2>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-gray-800">
                                {recentLogs.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-slate-500">
                                        Belum ada aktivitas
                                    </div>
                                ) : (
                                    recentLogs.map((log, index) => {
                                        const config = statusConfig[log.status as keyof typeof statusConfig] || statusConfig.rejected;
                                        const Icon = config.icon;
                                        return (
                                            <motion.div
                                                key={log.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ x: 5, backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
                                                className="p-3 flex items-center gap-3"
                                            >
                                                <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', config.color)}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                        {log.courseName}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {log.scannedAtFormatted}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                            <div className="p-3 border-t border-slate-100 dark:border-gray-800">
                                <Link href="/user/history">
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Button variant="ghost" className="w-full text-sm">
                                            Lihat Riwayat Lengkap
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </motion.div>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Quick Links */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.01, y: -2 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                        >
                            <h2 className="font-semibold text-slate-900 dark:text-white mb-3">
                                Aksi Cepat
                            </h2>
                            <div className="space-y-2">
                                <Link href="/user/absen">
                                    <motion.div whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                                        <Button variant="outline" className="w-full justify-start">
                                            <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                                            Absen Sekarang
                                        </Button>
                                    </motion.div>
                                </Link>
                                <Link href="/user/history">
                                    <motion.div whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                                        <Button variant="outline" className="w-full justify-start">
                                            <Calendar className="h-4 w-4 mr-2 text-sky-600" />
                                            Lihat Riwayat
                                        </Button>
                                    </motion.div>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </StudentLayout>
    );
}
