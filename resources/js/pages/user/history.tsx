import { useState, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Calendar } from '@/components/ui/calendar';
import { AttendanceStats } from '@/components/ui/attendance-stats';
import { AchievementBadge } from '@/components/ui/achievement-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PDFGenerator } from '@/components/export/pdf-generator';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import {
    BarChart,
    Bar,
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
    Search,
    Calendar as CalendarIcon,
    List,
    MapPin,
    Clock,
    Camera,
    ChevronRight,
    X,
    Flame,
    BarChart3,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Image,
    BadgeCheck,
    XCircle,
    User,
    FileText,
    Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface AttendanceRecord {
    id: number;
    date: string;
    course: string;
    courseId: number;
    meetingNumber: number;
    status: 'present' | 'absent' | 'late' | 'pending' | 'rejected';
    checkInTime: string | null;
    distance: number | null;
    selfieUrl: string | null;
    selfieStatus?: 'approved' | 'pending' | 'rejected' | null;
    note: string | null;
    location?: { lat: number; lng: number };
}

interface Course {
    id: number;
    name: string;
}

interface PageProps {
    mahasiswa: { id: number; nama: string; nim: string };
    records: AttendanceRecord[];
    courses: Course[];
    stats: {
        present: number;
        absent: number;
        late: number;
        pending: number;
        total: number;
        streak: number;
        longestStreak: number;
    };
}

const statusConfig = {
    present: { label: 'Hadir', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
    absent: { label: 'Tidak Hadir', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
    rejected: { label: 'Ditolak', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
    late: { label: 'Terlambat', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    pending: { label: 'Pending', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', icon: AlertCircle },
};

const selfieStatusConfig = {
    approved: { label: 'Terverifikasi', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: BadgeCheck },
    pending: { label: 'Menunggu', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400', icon: Clock },
    rejected: { label: 'Ditolak', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
};

const CHART_COLORS = {
    present: '#10b981',
    late: '#f59e0b',
    absent: '#f43f5e',
};

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
    hover: {
        scale: 1.03,
        y: -8,
        rotateY: 5,
        rotateX: 5,
        z: 50,
        boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.4)",
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 20,
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

export default function AttendanceHistory() {
    const { props } = usePage<{ props: PageProps }>();
    const {
        mahasiswa = { id: 0, nama: '', nim: '' },
        records = [],
        courses = [],
        stats = { present: 0, absent: 0, late: 0, pending: 0, total: 0, streak: 0, longestStreak: 0 },
    } = props as unknown as PageProps;

    const [view, setView] = useState<'calendar' | 'list'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [courseFilter, setCourseFilter] = useState<string>('all');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

    const filteredRecords = useMemo(() => {
        return records.filter(record => {
            if (searchQuery && !record.course.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (statusFilter !== 'all' && record.status !== statusFilter) return false;
            if (courseFilter !== 'all' && record.courseId.toString() !== courseFilter) return false;
            if (selectedDate) {
                const recordDate = new Date(record.date);
                if (recordDate.getDate() !== selectedDate.getDate() ||
                    recordDate.getMonth() !== selectedDate.getMonth() ||
                    recordDate.getFullYear() !== selectedDate.getFullYear()) return false;
            }
            return true;
        });
    }, [records, searchQuery, statusFilter, courseFilter, selectedDate]);

    const markedDates = useMemo(() => records.map(r => ({ date: new Date(r.date), status: r.status })), [records]);

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setCourseFilter('all');
        setSelectedDate(undefined);
    };

    const hasActiveFilters = searchQuery || statusFilter !== 'all' || courseFilter !== 'all' || selectedDate;

    const courseChartData = useMemo(() => {
        const courseStats: Record<string, { present: number; late: number; absent: number }> = {};
        records.forEach(record => {
            if (!courseStats[record.course]) courseStats[record.course] = { present: 0, late: 0, absent: 0 };
            if (record.status === 'present') courseStats[record.course].present++;
            else if (record.status === 'late') courseStats[record.course].late++;
            else courseStats[record.course].absent++;
        });
        return Object.entries(courseStats).map(([course, data]) => ({
            name: course.length > 15 ? course.substring(0, 15) + '...' : course,
            Hadir: data.present,
            Terlambat: data.late,
            'Tidak Hadir': data.absent,
        }));
    }, [records]);

    const monthlyTrendData = useMemo(() => {
        const monthStats: Record<string, { present: number; late: number; absent: number }> = {};
        records.forEach(record => {
            const date = new Date(record.date);
            const monthKey = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
            if (!monthStats[monthKey]) monthStats[monthKey] = { present: 0, late: 0, absent: 0 };
            if (record.status === 'present') monthStats[monthKey].present++;
            else if (record.status === 'late') monthStats[monthKey].late++;
            else monthStats[monthKey].absent++;
        });
        return Object.entries(monthStats).slice(-6).map(([month, data]) => ({
            name: month,
            Hadir: data.present,
            Terlambat: data.late,
            'Tidak Hadir': data.absent,
        }));
    }, [records]);

    return (
        <StudentLayout>
            <Head title="Riwayat Kehadiran" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-6"
            >
                {/* Header Card - ULTRA ADVANCED matching Dashboard */}
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
                                <motion.div
                                    whileHover={{ scale: 1.15, y: -3 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                    className="relative"
                                >
                                    <User className="h-10 w-10" />
                                </motion.div>
                            </motion.div>
                            <div>
                                <motion.p 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="text-sm text-cyan-100 font-semibold tracking-wide"
                                >
                                    Riwayat Kehadiran
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
                        
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <PDFGenerator student={mahasiswa} records={filteredRecords} stats={stats} />
                        </motion.div>
                    </div>

                    <div className="relative mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="rounded-xl bg-white/10 p-3 backdrop-blur cursor-pointer"
                        >
                            <p className="text-xs text-cyan-100">Total Record</p>
                            <p className="text-2xl font-bold">
                                <AnimatedCounter value={stats.total} duration={1500} />
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="rounded-xl bg-white/10 p-3 backdrop-blur cursor-pointer"
                        >
                            <p className="text-xs text-cyan-100">Hadir</p>
                            <p className="text-2xl font-bold">
                                <AnimatedCounter value={stats.present} duration={1500} />
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="rounded-xl bg-white/10 p-3 backdrop-blur cursor-pointer"
                        >
                            <p className="text-xs text-cyan-100">Terlambat</p>
                            <p className="text-2xl font-bold">
                                <AnimatedCounter value={stats.late} duration={1500} />
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="rounded-xl bg-white/10 p-3 backdrop-blur cursor-pointer"
                        >
                            <p className="text-xs text-cyan-100">Tidak Hadir</p>
                            <p className="text-2xl font-bold">
                                <AnimatedCounter value={stats.absent} duration={1500} />
                            </p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Stats & Streak */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <motion.div
                        variants={cardVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="lg:col-span-2"
                    >
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80">
                            <AttendanceStats present={stats.present} absent={stats.absent} late={stats.late} pending={stats.pending} total={stats.total} />
                        </div>
                    </motion.div>
                    <motion.div
                        variants={cardVariants}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <motion.div
                                whileHover={{ scale: 1.2, y: -2 }}
                                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            >
                                <Flame className="h-6 w-6" />
                            </motion.div>
                            <span className="font-semibold">Streak Kehadiran</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-bold">
                                <AnimatedCounter value={stats.streak} duration={1500} />
                            </span>
                            <span className="text-orange-100 mb-1">hari</span>
                        </div>
                        <p className="text-sm text-orange-100 mt-2">Streak terbaik: {stats.longestStreak} hari</p>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 flex gap-2"
                        >
                            <AchievementBadge type="streak" value={stats.streak} size="sm" />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Charts */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {courseChartData.length > 0 && (
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <motion.div whileHover={{ rotate: 10 }}>
                                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                                </motion.div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Kehadiran per Mata Kuliah</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={courseChartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 11 }} width={100} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="Hadir" fill={CHART_COLORS.present} stackId="a" />
                                    <Bar dataKey="Terlambat" fill={CHART_COLORS.late} stackId="a" />
                                    <Bar dataKey="Tidak Hadir" fill={CHART_COLORS.absent} stackId="a" />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}
                    {monthlyTrendData.length > 0 && (
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <motion.div whileHover={{ rotate: 10 }}>
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                </motion.div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Tren Kehadiran Bulanan</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={monthlyTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="Hadir" stroke={CHART_COLORS.present} strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="Terlambat" stroke={CHART_COLORS.late} strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="Tidak Hadir" stroke={CHART_COLORS.absent} strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}
                </div>

                {/* Filters */}
                <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input placeholder="Cari mata kuliah..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                        </div>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
                            <option value="all">Semua Status</option>
                            <option value="present">Hadir</option>
                            <option value="late">Terlambat</option>
                            <option value="absent">Tidak Hadir</option>
                            <option value="pending">Pending</option>
                        </select>
                        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900">
                            <option value="all">Semua Mata Kuliah</option>
                            {courses.map(course => (<option key={course.id} value={course.id}>{course.name}</option>))}
                        </select>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                <X className="h-4 w-4 mr-1" /> Reset
                            </Button>
                        )}
                        <div className="flex rounded-lg border border-slate-200 dark:border-gray-700 p-1">
                            <button onClick={() => setView('list')} className={cn('px-3 py-1.5 rounded-md text-sm transition-colors', view === 'list' ? 'bg-black text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400')}>
                                <List className="h-4 w-4" />
                            </button>
                            <button onClick={() => setView('calendar')} className={cn('px-3 py-1.5 rounded-md text-sm transition-colors', view === 'calendar' ? 'bg-black text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400')}>
                                <CalendarIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-gray-800">
                            <span className="text-xs text-slate-500">Filter aktif:</span>
                            {searchQuery && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600 dark:bg-gray-800 dark:text-slate-400">"{searchQuery}"</span>}
                            {statusFilter !== 'all' && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600 dark:bg-gray-800 dark:text-slate-400">{statusConfig[statusFilter as keyof typeof statusConfig]?.label}</span>}
                            {selectedDate && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-600 dark:bg-gray-800 dark:text-slate-400">{selectedDate.toLocaleDateString('id-ID')}</span>}
                        </div>
                    )}
                </motion.div>

                {/* Content */}
                <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
                    {view === 'calendar' && (
                        <div>
                            <Calendar selected={selectedDate} onSelect={setSelectedDate} markedDates={markedDates} />
                            {selectedDate && (
                                <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setSelectedDate(undefined)}>
                                    Tampilkan semua tanggal
                                </Button>
                            )}
                        </div>
                    )}
                    <div className={cn(view === 'list' && 'lg:col-span-2')}>
                        <motion.div
                            variants={cardVariants}
                            whileHover={{ scale: 1.01, y: -2 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                        >
                            <div className="p-4 border-b border-slate-100 dark:border-gray-800">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Daftar Kehadiran</h2>
                                    <span className="text-sm text-slate-500">{filteredRecords.length} dari {records.length}</span>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-gray-800 max-h-[600px] overflow-y-auto">
                                {filteredRecords.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <CalendarIcon className="h-12 w-12 mx-auto text-slate-300" />
                                        <p className="mt-3 text-slate-500">Tidak ada data kehadiran</p>
                                    </div>
                                ) : (
                                    filteredRecords.map((record, index) => {
                                        const StatusIcon = statusConfig[record.status].icon;
                                        return (
                                            <motion.button
                                                key={record.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ x: 5, backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setSelectedRecord(record)}
                                                className="w-full p-4 flex items-center gap-4 transition-colors text-left"
                                            >
                                                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl shrink-0', statusConfig[record.status].color)}>
                                                    <StatusIcon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-900 dark:text-white truncate">{record.course}</p>
                                                    <p className="text-sm text-slate-500">
                                                        Pertemuan {record.meetingNumber} • {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                    </p>
                                                    {record.checkInTime && <p className="text-xs text-slate-400 mt-1"><Clock className="h-3 w-3 inline mr-1" />{record.checkInTime}</p>}
                                                </div>
                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusConfig[record.status].color)}>{statusConfig[record.status].label}</span>
                                                    {record.selfieUrl && (
                                                        <span className="flex items-center gap-1 text-xs text-slate-400">
                                                            <Camera className="h-3 w-3" /> Bukti
                                                        </span>
                                                    )}
                                                </div>
                                                <motion.div
                                                    whileHover={{ x: 5 }}
                                                    transition={{ type: 'spring', stiffness: 400 }}
                                                >
                                                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                                                </motion.div>
                                            </motion.button>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {selectedRecord && <RecordDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
        </StudentLayout>
    );
}

function RecordDetailModal({ record, onClose }: { record: AttendanceRecord; onClose: () => void }) {
    const StatusIcon = statusConfig[record.status].icon;
    const selfieStatus = record.selfieStatus ?? (record.selfieUrl ? 'pending' : null);
    const selfieConfig = selfieStatus ? selfieStatusConfig[selfieStatus] : null;
    const SelfieIcon = selfieConfig?.icon;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: -15 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 50, rotateX: 15 }}
                    transition={{ 
                        type: 'spring', 
                        stiffness: 300, 
                        damping: 25,
                        mass: 0.8
                    }}
                    style={{ perspective: '1500px' }}
                    className="relative w-full max-w-lg rounded-3xl bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-200/50 dark:border-gray-700/50"
                >
                    {/* Animated background orbs */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.15, 0.1],
                            rotate: [0, 90, 0],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-br from-blue-400/30 to-cyan-500/30 blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.08, 0.12, 0.08],
                            rotate: [0, -90, 0],
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-gradient-to-br from-teal-400/20 to-blue-500/20 blur-3xl"
                    />

                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:bg-slate-100 dark:hover:bg-slate-700 shadow-lg z-10"
                    >
                        <X className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    </motion.button>

                    <div className="space-y-6 relative z-10">
                        {/* Header with enhanced badges */}
                        <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <motion.span 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    className={cn('inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold shadow-lg', statusConfig[record.status].color)}
                                >
                                    <StatusIcon className="h-4 w-4" />
                                    {statusConfig[record.status].label}
                                </motion.span>
                                {selfieConfig && SelfieIcon && (
                                    <motion.span 
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        className={cn('inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold shadow-lg', selfieConfig.color)}
                                    >
                                        <SelfieIcon className="h-4 w-4" />
                                        {selfieConfig.label}
                                    </motion.span>
                                )}
                            </div>
                            <motion.h2 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-2xl font-bold text-slate-900 dark:text-white mb-1"
                            >
                                {record.course}
                            </motion.h2>
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-slate-500 dark:text-slate-400"
                            >
                                Pertemuan {record.meetingNumber}
                            </motion.p>
                        </div>

                        {/* Enhanced Selfie / Bukti Masuk */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 dark:from-gray-800 dark:to-gray-700 shadow-xl"
                        >
                            {record.selfieUrl ? (
                                <div className="relative group">
                                    <motion.img 
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.3 }}
                                        src={record.selfieUrl} 
                                        alt="Bukti selfie" 
                                        className="w-full h-64 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                        {selfieConfig && SelfieIcon && (
                                            <motion.span 
                                                whileHover={{ scale: 1.1 }}
                                                className={cn('inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-xl shadow-2xl', selfieConfig.color)}
                                            >
                                                <SelfieIcon className="h-4 w-4" />
                                                {selfieConfig.label}
                                            </motion.span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                                    <motion.div
                                        animate={{ 
                                            scale: [1, 1.1, 1],
                                            opacity: [0.5, 0.8, 0.5]
                                        }}
                                        transition={{ 
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <Image className="h-12 w-12 mb-3" />
                                    </motion.div>
                                    <span className="text-sm font-medium">Tidak ada bukti selfie</span>
                                </div>
                            )}
                        </motion.div>

                        {/* Enhanced Details */}
                        <div className="space-y-3">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ x: 4, scale: 1.02 }}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800/30 shadow-sm"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                                    <CalendarIcon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Tanggal</p>
                                    <p className="font-bold text-slate-900 dark:text-white">
                                        {new Date(record.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </motion.div>
                            {record.checkInTime && (
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                    whileHover={{ x: 4, scale: 1.02 }}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/30 shadow-sm"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                                        <Clock className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Waktu Check-in</p>
                                        <p className="font-bold text-slate-900 dark:text-white">{record.checkInTime}</p>
                                    </div>
                                </motion.div>
                            )}
                            {record.distance !== null && (
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 }}
                                    whileHover={{ x: 4, scale: 1.02 }}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-100 dark:border-violet-800/30 shadow-sm"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                                        <MapPin className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide">Jarak dari Lokasi</p>
                                        <p className="font-bold text-slate-900 dark:text-white">{Math.round(record.distance)} meter</p>
                                    </div>
                                </motion.div>
                            )}
                            {record.note && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-800/50 shadow-lg"
                                >
                                    <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wide">Catatan</p>
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{record.note}</p>
                                </motion.div>
                            )}
                        </div>

                        <div className="flex gap-3 pt-6 border-t-2 border-slate-200 dark:border-gray-700">
                            <motion.div 
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }} 
                                className="flex-1"
                            >
                                <Button 
                                    variant="outline" 
                                    className="w-full h-12 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-shadow border-2" 
                                    onClick={onClose}
                                >
                                    Tutup
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
