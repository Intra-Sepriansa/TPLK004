import { Head, Link, router } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
    BookOpen, Users, Calendar, TrendingUp, TrendingDown, Clock,
    AlertTriangle, CheckCircle, XCircle, Search, Filter, Download,
    ChevronRight, MoreVertical, Plus, ArrowLeft, ArrowUpRight,
    Sparkles, Target, Zap, Award, BarChart3, PieChart as PieChartIcon,
    Activity, FileText, Bell, Share2, Settings, QrCode, Play, Pause,
    ChevronDown, Check
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
    Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Types & Interfaces ---

interface Course {
    id: number;
    nama: string;
    kode: string;
    sks: number;
    semester?: string;
    academic_year?: string;
}

interface Session {
    id: number;
    title: string;
    meeting_number: number;
    start_at: string;
    end_at: string;
    is_active: boolean;
    status: 'active' | 'completed' | 'scheduled';
    attendance_count: number;
    present_count: number;
    late_count: number;
    absent_count: number;
    rate: number;
}

interface Student {
    id: number;
    nama: string;
    nim: string;
    kelas: string;
    total: number;
    present: number;
    late: number;
    absent: number;
    rate: number;
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'fail';
    trend?: 'up' | 'down' | 'stable';
    avatar_url?: string;
}

interface Stats {
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    totalStudents: number;
    attendanceRate: number;
    lateRate: number;
    absentRate: number;
    atRiskCount: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
}

interface ActivityItem {
    type: string;
    icon: string;
    text: string;
    detail: string;
    time: string;
    timestamp: string;
}

interface ChartData {
    meeting: string;
    meetingNumber: number;
    hadir: number;
    terlambat: number;
    tidakHadir: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    total: number;
}

interface Prediction {
    nextSessionAttendance: { predicted: number; confidence: 'high' | 'medium' | 'low' };
    atRiskStudents: { count: number; students: Partial<Student>[] };
    passRate: { predicted: number };
}

interface Distribution {
    name: string;
    value: number;
    color: string;
}

interface PageProps {
    dosen: { id: number; nama: string; nidn: string };
    course: Course;
    sessions: Session[];
    students: Student[];
    stats: Stats;
    distribution: Distribution[];
    chartData: ChartData[];
    activities: ActivityItem[];
    predictions: Prediction;
}

// --- Animation Variants ---

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 25,
        },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
        },
    },
    hover: {
        scale: 1.02,
        y: -5,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10,
        },
    },
};


// Helper Component for Animated Numbers
function AnimatedCounter({ value, suffix = '' }: { value: number | string, suffix?: string }) {
    return (
        <span className="tabular-nums">
            {value}{suffix}
        </span>
    );
}

export default function CourseDetail({
    dosen, course, sessions, students, stats, distribution,
    chartData, activities, predictions
}: PageProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'mahasiswa' | 'sesi-absen'>('overview');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Student; direction: 'asc' | 'desc' } | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedSessionDate, setSelectedSessionDate] = useState<string | null>(null);

    // Derived State: Filtered Students
    const filteredStudents = useMemo(() => {
        let filtered = [...students];

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.nama.toLowerCase().includes(lowerQuery) ||
                s.nim.toLowerCase().includes(lowerQuery)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(s => s.status === statusFilter);
        }

        if (sortConfig) {
            filtered.sort((a, b) => {
                const key = sortConfig.key;
                // @ts-ignore
                if (a[key] < b[key]) return sortConfig.direction === 'asc' ? -1 : 1;
                // @ts-ignore
                if (a[key] > b[key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [students, searchQuery, statusFilter, sortConfig]);

    // Sorting Helper
    const requestSort = (key: keyof Student) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Derived State: Session Performance Data for Bar Chart
    const sessionPerformanceData = useMemo(() => {
        return chartData.map(item => ({
            name: item.meeting,
            Hadir: item.presentCount,
            Terlambat: item.lateCount,
            TidakHadir: item.absentCount,
        }));
    }, [chartData]);


    const handleExport = (type: 'pdf' | 'excel' | 'csv') => {
        // In a real app, this would trigger a download
        alert(`Exporting course data to ${type.toUpperCase()}...`);
        // router.get(`/dosen/courses/${course.id}/export?type=${type}`);
    };

    const handleCreateSession = () => {
        // router.visit(`/dosen/courses/${course.id}/sessions/create`);
        alert("Navigating to create session page...");
    };

    const handleSendAnnouncement = () => {
        alert("Opening announcement modal...");
    };


    return (
        <DosenLayout>
            <Head title={`Detail ${course.nama || "Mata Kuliah"}`} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-4 space-y-6"
            >
                {/* ═══════ ENHANCED HEADER ═══════ */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] p-5 md:p-6 text-white shadow-2xl isolate">
                    <div className="absolute inset-0 bg-neutral-900 z-0" />
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-fuchsia-600 z-0 opacity-90"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                            filter: ['hue-rotate(0deg)', 'hue-rotate(15deg)', 'hue-rotate(0deg)'],
                        }}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    {/* Complex Floating Orbs & Light Effects */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay" />
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-500/40 rounded-full blur-[100px] mix-blend-screen" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/40 rounded-full blur-[100px] mix-blend-screen" />

                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-white/10 blur-xl mix-blend-overlay"
                            style={{
                                width: Math.random() * 100 + 50,
                                height: Math.random() * 100 + 50,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, Math.random() * -100, 0],
                                x: [0, Math.random() * 50 - 25, 0],
                                opacity: [0.3, 0.6, 0.3],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: Math.random() * 10 + 10,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: Math.random() * 5,
                            }}
                        />
                    ))}

                    <div className="relative z-10">
                        <Link href="/dosen/courses">
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ x: -5, backgroundColor: 'rgba(255,255,255,0.15)' }}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-8 hover:bg-white/20 transition-all group"
                            >
                                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Daftar
                            </motion.button>
                        </Link>

                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                            <div className="flex items-start gap-6">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <BookOpen className="h-10 w-10 text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]" />
                                </motion.div>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className="bg-indigo-500/30 text-indigo-100 hover:bg-indigo-500/40 border-indigo-400/30 backdrop-blur-md px-3 py-1 text-xs uppercase tracking-wider font-bold shadow-lg">
                                            {course.kode}
                                        </Badge>
                                        <Badge className="bg-purple-500/30 text-purple-100 hover:bg-purple-500/40 border-purple-400/30 backdrop-blur-md px-3 py-1 text-xs uppercase tracking-wider font-bold shadow-lg">
                                            {course.sks} SKS
                                        </Badge>
                                        <Badge className="bg-emerald-500/30 text-emerald-100 hover:bg-emerald-500/40 border-emerald-400/30 backdrop-blur-md px-3 py-1 text-xs uppercase tracking-wider font-bold shadow-lg">
                                            Semester {course.semester}
                                        </Badge>
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                                        {course.nama}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-indigo-50 font-medium">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 backdrop-blur border border-white/10">
                                            <Users className="h-4 w-4 text-pink-300" />
                                            <span>{stats.totalStudents} Mahasiswa</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 backdrop-blur border border-white/10">
                                            <Calendar className="h-4 w-4 text-blue-300" />
                                            <span>{stats.totalSessions} Sesi ({stats.activeSessions} Aktif)</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 backdrop-blur border border-white/10">
                                            <TrendingUp className="h-4 w-4 text-emerald-300" />
                                            <span className={stats.attendanceRate >= 80 ? "text-emerald-300" : "text-amber-300"}>{stats.attendanceRate}% Kehadiran</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCreateSession}
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 border border-emerald-400 backdrop-blur-xl text-sm font-bold shadow-lg transition-all"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Buat Sesi</span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleExport('pdf')}
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl text-sm font-bold shadow-lg transition-all"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Export</span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSendAnnouncement}
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl text-sm font-bold shadow-lg transition-all"
                                >
                                    <Bell className="h-4 w-4" />
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl text-sm font-bold shadow-lg transition-all"
                                >
                                    <Settings className="h-4 w-4" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ ENHANCED SUMMARY CARDS ═══════ */}
                <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Mahasiswa */}
                    <motion.div variants={cardVariants} whileHover="hover" className="group relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/40 dark:bg-neutral-900/60 p-4 shadow-xl backdrop-blur-2xl transition-all dark:border-white/5 box-border">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/20 dark:to-blue-500/20" />
                        <motion.div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/30 blur-3xl transition-all duration-500 group-hover:bg-indigo-500/50" />

                        <div className="relative flex items-center gap-4">
                            <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/30">
                                <Users className="h-7 w-7" />
                            </motion.div>
                            <div>
                                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Total Mahasiswa</p>
                                <p className="text-xl font-black text-neutral-900 dark:text-white mt-1">
                                    <AnimatedCounter value={stats.totalStudents} />
                                </p>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit mt-1">
                                    <ArrowUpRight className="h-3 w-3" /> +100% Aktif
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sesi Berlangsung */}
                    <motion.div variants={cardVariants} whileHover="hover" className="group relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/40 dark:bg-neutral-900/60 p-4 shadow-xl backdrop-blur-2xl transition-all dark:border-white/5 box-border">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/20" />
                        <motion.div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/30 blur-3xl transition-all duration-500 group-hover:bg-amber-500/50" />

                        <div className="relative flex items-center gap-4">
                            <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                                <div className="absolute inset-0 rounded-2xl border-2 border-white/30 opacity-20" />
                                <Clock className="h-7 w-7 relative z-10" />
                            </motion.div>
                            <div>
                                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Sesi Berlangsung</p>
                                <p className="text-xl font-black text-neutral-900 dark:text-white mt-1">
                                    <AnimatedCounter value={stats.activeSessions} />
                                </p>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-neutral-500 bg-neutral-500/10 px-2 py-0.5 rounded-full w-fit mt-1">
                                    {stats.completedSessions} Selesai
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tingkat Kehadiran */}
                    <motion.div variants={cardVariants} whileHover="hover" className="group relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/40 dark:bg-neutral-900/60 p-4 shadow-xl backdrop-blur-2xl transition-all dark:border-white/5 box-border">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/20 dark:to-teal-500/20" />
                        <motion.div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/30 blur-3xl transition-all duration-500 group-hover:bg-emerald-500/50" />

                        <div className="relative flex items-center gap-4">
                            <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                                <TrendingUp className="h-7 w-7" />
                            </motion.div>
                            <div>
                                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Tingkat Kehadiran</p>
                                <p className="text-xl font-black text-neutral-900 dark:text-white mt-1">
                                    <AnimatedCounter value={stats.attendanceRate} suffix="%" />
                                </p>
                                <div className={cn("flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mt-1",
                                    stats.attendanceRate >= 80 ? "text-emerald-500 bg-emerald-500/10" : "text-amber-500 bg-amber-500/10"
                                )}>
                                    {stats.attendanceRate >= 80 ? "Bagus" : "Perlu ditingkatkan"}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tingkat < 70% */}
                    <motion.div variants={cardVariants} whileHover="hover" className="group relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/40 dark:bg-neutral-900/60 p-4 shadow-xl backdrop-blur-2xl transition-all dark:border-white/5 box-border">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5 dark:from-rose-500/20 dark:to-red-500/20" />
                        <motion.div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-rose-500/30 blur-3xl transition-all duration-500 group-hover:bg-rose-500/50" />

                        <div className="relative flex items-center gap-4">
                            <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30">
                                <AlertTriangle className="h-7 w-7" />
                            </motion.div>
                            <div>
                                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Tingkat &lt; 70%</p>
                                <p className="text-xl font-black text-neutral-900 dark:text-white mt-1">
                                    <AnimatedCounter value={stats.atRiskCount} />
                                </p>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full w-fit mt-1">
                                    Perlu Perhatian
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* ═══════ ENHANCED TABS NAVIGATION ═══════ */}
                <div className="flex p-1.5 gap-2 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-2xl backdrop-blur-xl w-fit border border-white/10 shadow-sm">
                    {['overview', 'mahasiswa', 'sesi-absen'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "relative px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300",
                                activeTab === tab
                                    ? "text-indigo-600 dark:text-indigo-300"
                                    : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                            )}
                        >
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-black/5 dark:border-white/10"
                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 capitalize tracking-wide">{tab.replace('-', ' ')}</span>
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Charts Row 1: Attendance Trend & Donut */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 p-4 shadow-xl bg-white/40 backdrop-blur-xl dark:bg-neutral-900/40 dark:border-white/10">
                                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-indigo-500" /> Trend Kehadiran</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="meeting" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} domain={[0, 100]} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                            <Legend />
                                            <Line type="monotone" dataKey="hadir" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981', strokeWidth: 2 }} activeDot={{ r: 6 }} name="Hadir (%)" />
                                            <Line type="monotone" dataKey="tidakHadir" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#EF4444', strokeWidth: 2 }} name="Tidak Hadir (%)" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </motion.div>

                                <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 p-4 shadow-xl bg-white/40 backdrop-blur-xl relative dark:bg-neutral-900/40 dark:border-white/10">
                                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-indigo-500" /> Distribusi Kehadiran</h3>
                                    <div className="flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie data={distribution} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                                                    {distribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ right: 0 }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="text-center">
                                                <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.totalStudents}</span>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Mahasiswa</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* AI Predictions Panel */}
                            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white shadow-xl relative overflow-hidden">
                                    <Sparkles className="absolute top-4 right-4 h-6 w-6 text-white/50" />
                                    <h4 className="text-xs font-medium text-indigo-100 uppercase tracking-wider mb-2">Prediksi Kehadiran</h4>
                                    <div className="text-3xl font-bold mb-1">{predictions.nextSessionAttendance.predicted}%</div>
                                    <p className="text-xs text-indigo-100 mb-4">Estimasi kehadiran sesi berikutnya</p>
                                    <div className="flex items-center gap-2 text-xs bg-white/20 rounded-full px-3 py-1 w-fit">
                                        <Target className="h-3 w-3" /> Confidence: {predictions.nextSessionAttendance.confidence.toUpperCase()}
                                    </div>
                                </div>

                                <div className="rounded-3xl bg-white p-4 shadow-xl border border-gray-100 relative overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 dark:text-gray-400">At-Risk Students</h4>
                                    <div className="text-3xl font-bold text-red-500 mb-1">{predictions.atRiskStudents.count}</div>
                                    <p className="text-xs text-gray-400 mb-4">Mahasiswa perlu perhatian khusus</p>
                                    <div className="space-y-2">
                                        {predictions.atRiskStudents.students.map((s, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs">
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{s.nama}</span>
                                                <span className="text-red-500 font-bold">{s.rate}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-3xl bg-white p-4 shadow-xl border border-gray-100 relative overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 dark:text-gray-400">Projected Pass Rate</h4>
                                    <div className="text-3xl font-bold text-emerald-500 mb-1">{predictions.passRate.predicted}%</div>
                                    <p className="text-xs text-gray-400 mb-4">Berdasarkan data kehadiran saat ini</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
                                        <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${predictions.passRate.predicted}%` }}></div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Recent Activity Timeline */}
                            <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 p-4 shadow-xl bg-white/40 backdrop-blur-xl dark:bg-neutral-900/40 dark:border-white/10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-semibold text-lg flex items-center gap-2"><Activity className="h-5 w-5 text-indigo-500" /> Aktivitas Terbaru</h3>
                                    <Button variant="ghost" size="sm" className="text-indigo-600">Lihat Semua</Button>
                                </div>
                                <div className="space-y-6">
                                    {activities.map((activity, idx) => (
                                        <div key={idx} className="flex gap-4 group">
                                            <div className="flex flex-col items-center">
                                                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                                                    {activity.icon === 'check' ? <CheckCircle className="h-5 w-5 text-emerald-500" /> :
                                                        activity.icon === 'clock' ? <Clock className="h-5 w-5 text-amber-500" /> :
                                                            <Activity className="h-5 w-5 text-indigo-500" />}
                                                </div>
                                                {idx < activities.length - 1 && <div className="w-px h-full bg-gray-200 my-2" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm dark:text-gray-100">{activity.text}</p>
                                                <p className="text-xs text-gray-500 mb-1">{activity.detail}</p>
                                                <p className="text-[10px] text-gray-400 font-mono">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════ TAB: MAHASISWA ═══════ */}
                <AnimatePresence mode="wait">
                    {activeTab === 'mahasiswa' && (
                        <motion.div
                            key="mahasiswa"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Filter & Search Bar */}
                            <div className="bg-white/50 backdrop-blur-xl border border-white/20 p-3 rounded-3xl flex flex-wrap gap-4 items-center justify-between shadow-lg dark:bg-neutral-900/50 dark:border-white/10">
                                <div className="flex items-center flex-1 min-w-[300px] relative">
                                    <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama atau NIM..."
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow dark:bg-neutral-800 dark:border-neutral-700"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        className="rounded-xl border-gray-200 bg-white/80 py-2 pl-3 pr-8 text-sm focus:ring-indigo-500/50 dark:bg-neutral-800 dark:border-neutral-700"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="excellent">Excellent</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="poor">Poor</option>
                                        <option value="fail">Fail</option>
                                    </select>
                                    <Button variant="outline" size="sm" className="hidden md:flex bg-white/50"><Filter className="mr-2 h-4 w-4" /> Filter Lanjutan</Button>
                                </div>
                            </div>

                            {/* Students Grid/Table */}
                            <div className="bg-white/40 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden dark:bg-neutral-900/40 dark:border-white/10">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:bg-gray-800/50 dark:text-gray-400">
                                            <th className="px-6 py-4 cursor-pointer hover:text-indigo-600" onClick={() => requestSort('nama')}>Mahasiswa</th>
                                            <th className="px-6 py-4 cursor-pointer hover:text-indigo-600" onClick={() => requestSort('nim')}>NIM & Kelas</th>
                                            <th className="px-6 py-4 text-center">Kehadiran</th>
                                            <th className="px-6 py-4 text-center cursor-pointer hover:text-indigo-600" onClick={() => requestSort('rate')}>Rate</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredStudents.map((student, idx) => (
                                            <motion.tr
                                                key={student.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="hover:bg-indigo-50/50 transition-colors dark:hover:bg-indigo-900/20"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                            {student.nama.charAt(0)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.nama}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{student.nim}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-gray-100">{student.nim}</div>
                                                    <div className="text-xs text-gray-500">{student.kelas}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="text-xs text-gray-500 space-x-1">
                                                        <span className="text-emerald-600 font-medium">{student.present} H</span>
                                                        <span className="text-amber-600 font-medium">{student.late} T</span>
                                                        <span className="text-red-600 font-medium">{student.absent} A</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className={cn(
                                                            "font-bold text-sm",
                                                            student.rate >= 90 ? "text-emerald-500" :
                                                                student.rate >= 70 ? "text-amber-500" : "text-red-500"
                                                        )}>{student.rate}%</span>
                                                    </div>
                                                    <Progress value={student.rate} className="h-1.5 mt-1 w-20 mx-auto" />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <Badge variant={
                                                        student.status === 'excellent' ? 'default' :
                                                            student.status === 'good' ? 'secondary' :
                                                                student.status === 'fair' ? 'outline' :
                                                                    'destructive'
                                                    } className="capitalize">
                                                        {student.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(student)}>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════ TAB: SESI ABSEN ═══════ */}
                <AnimatePresence mode="wait">
                    {activeTab === 'sesi-absen' && (
                        <motion.div
                            key="sesi-absen"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-sm dark:bg-neutral-900/50 dark:border-white/10">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 pl-2">Daftar Sesi Perkuliahan</h3>
                                <Button onClick={handleCreateSession} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                                    <Plus className="mr-2 h-4 w-4" /> Buat Sesi Baru
                                </Button>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {sessions.map((session, idx) => (
                                    <motion.div
                                        key={session.id}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        transition={{ delay: idx * 0.05 }}
                                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-4 shadow-lg backdrop-blur-xl transition-all hover:shadow-2xl hover:-translate-y-1 dark:bg-neutral-900/60 dark:border-white/10"
                                    >
                                        <div className={`absolute top-0 right-0 p-3 rounded-bl-2xl text-xs font-bold uppercase tracking-wider ${session.status === 'active' ? 'bg-emerald-100 text-emerald-600' :
                                            session.status === 'completed' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {session.status}
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Pertemuan {session.meeting_number}</p>
                                            <h4 className="text-xl font-bold text-gray-900 dark:text-white truncate" title={session.title}>{session.title}</h4>
                                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                                <Calendar className="h-4 w-4" /> {session.start_at}
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Hadir</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{session.present_count} <span className="text-gray-400 font-normal">/ {stats.totalStudents}</span></span>
                                            </div>
                                            <Progress value={session.rate} className="h-2" />
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                            <div className="flex -space-x-2">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 dark:border-gray-800 dark:bg-gray-700">
                                                        {String.fromCharCode(65 + i)}
                                                    </div>
                                                ))}
                                                {session.attendance_count > 3 && (
                                                    <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-bold dark:border-gray-800 dark:bg-gray-800">
                                                        +{session.attendance_count - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <Button variant="outline" size="sm" className="rounded-full hover:bg-indigo-50 hover:text-indigo-600 border-gray-200 dark:border-gray-700 dark:hover:bg-indigo-900/20" onClick={() => router.visit(`/dosen/sesi-absen/${session.id}`)}>
                                                Detail <ChevronRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Student Detail Modal */}
                <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                    <DialogContent className="sm:max-w-2xl bg-white/90 backdrop-blur-xl border-white/20">
                        <DialogHeader>
                            <DialogTitle>Detail Mahasiswa</DialogTitle>
                        </DialogHeader>
                        {selectedStudent && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                                        {selectedStudent.nama.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">{selectedStudent.nama}</h3>
                                        <p className="text-gray-500 flex items-center gap-2"><Badge variant="outline">{selectedStudent.nim}</Badge> {selectedStudent.kelas}</p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <div className="text-3xl font-bold text-indigo-600">{selectedStudent.rate}%</div>
                                        <p className="text-xs text-gray-400 uppercase tracking-widest">Kehadiran</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
                                        <div className="text-2xl font-bold text-emerald-600">{selectedStudent.present}</div>
                                        <div className="text-xs text-emerald-600 font-medium uppercase">Hadir</div>
                                    </div>
                                    <div className="bg-amber-50 p-4 rounded-xl text-center border border-amber-100">
                                        <div className="text-2xl font-bold text-amber-600">{selectedStudent.late}</div>
                                        <div className="text-xs text-amber-600 font-medium uppercase">Terlambat</div>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-xl text-center border border-red-100">
                                        <div className="text-2xl font-bold text-red-600">{selectedStudent.absent}</div>
                                        <div className="text-xs text-red-600 font-medium uppercase">Absen</div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setSelectedStudent(null)}>Tutup</Button>
                                    <Button className="bg-indigo-600 text-white hover:bg-indigo-700">Lihat Riwayat Lengkap</Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

            </motion.div>
        </DosenLayout >
    );
}
