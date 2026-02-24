import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileBarChart,
    Download,
    Users,
    Clock,
    CheckCircle,
    XCircle,
    Filter,
    TrendingUp,
    RefreshCw,
    Calendar,
    BookOpen,
    Award,
    AlertTriangle,
    BarChart3,
    Search,
    ChevronDown,
    ArrowDownRight,
    Zap,
    MessageSquareWarning,
    PartyPopper,
    Sparkles
} from 'lucide-react';
import { useState } from 'react';
import rekapanIcon from '@/assets/admin/rekap-kehadiran/rekapan.png';
import totalScanIcon from '@/assets/admin/rekap-kehadiran/total-scan.png';
import hadirIcon from '@/assets/admin/rekap-kehadiran/hadir.png';
import terlambatIcon from '@/assets/admin/rekap-kehadiran/terlambat.png';
import ditolakIcon from '@/assets/admin/rekap-kehadiran/ditolak.png';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    Cell,
} from 'recharts';

interface AttendanceLog {
    id: number;
    status: string;
    scanned_at: string;
    mahasiswa: { nama: string; nim: string; kelas?: string } | null;
    session: { meeting_number: number; course: { nama: string; dosen?: { nama: string } } } | null;
    selfie_verification?: { status: string; selfie_path?: string } | null;
    lat?: number;
    long?: number;
    distance?: number;
    device_info?: string;
    created_at?: string;
}

interface Stats {
    total: number;
    present: number;
    late: number;
    rejected: number;
    total_sessions: number;
    unique_students: number;
    avg_per_session: number;
    attendance_rate: number;
}

interface DailyTrend {
    labels: string[];
    datasets: { label: string; data: number[]; color: string }[];
}

interface CourseSummary {
    id: number;
    nama: string;
    dosen: string;
    total_sessions: number;
    total_attendance: number;
    present: number;
    late: number;
    rate: number;
}

interface TopAttendee {
    id: number;
    nama: string;
    nim: string;
    total_attendance: number;
}

interface LowAttendance {
    id: number;
    nama: string;
    nim: string;
    attendance_count: number;
    rate: number;
}

interface HourlyDistribution {
    labels: string[];
    values: number[];
}

interface Course {
    id: number;
    nama: string;
    dosen?: { nama: string };
}

interface PageProps {
    attendanceLogs: {
        data: AttendanceLog[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    stats: Stats;
    dailyTrend: DailyTrend;
    courseSummary: CourseSummary[];
    topAttendees: TopAttendee[];
    lowAttendance: LowAttendance[];
    hourlyDistribution: HourlyDistribution;
    courses: Course[];
    filters: {
        date_from: string;
        date_to: string;
        course_id: string;
        status: string;
    };
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        }
    }
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    }
} as const;

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    hover: {
        scale: 1.04,
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 15 }
    }
} as const;

export default function AdminRekapKehadiran({
    attendanceLogs,
    stats,
    dailyTrend,
    courseSummary,
    topAttendees,
    lowAttendance,
    hourlyDistribution,
    courses,
    filters,
}: PageProps) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [courseId, setCourseId] = useState(filters.course_id);
    const [status, setStatus] = useState(filters.status);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [selectedLog, setSelectedLog] = useState<AttendanceLog | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Warning System State
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [selectedStudentForWarning, setSelectedStudentForWarning] = useState<LowAttendance | null>(null);
    const [warningMessage, setWarningMessage] = useState('');

    // Appreciation System State
    const [showAppreciationModal, setShowAppreciationModal] = useState(false);
    const [selectedStudentForAppreciation, setSelectedStudentForAppreciation] = useState<TopAttendee | null>(null);
    const [appreciationMessage, setAppreciationMessage] = useState('');

    const handleFilter = () => {
        router.get('/admin/rekap-kehadiran', { date_from: dateFrom, date_to: dateTo, course_id: courseId, status }, { preserveState: true });
    };

    const handleExportPdf = () => {
        window.open(`/admin/rekap-kehadiran/pdf?date_from=${dateFrom}&date_to=${dateTo}&course_id=${courseId}`, '_blank');
    };

    // Prepare chart data
    const trendData = dailyTrend.labels.map((label, i) => ({
        name: label,
        Hadir: dailyTrend.datasets[0]?.data[i] || 0,
        Terlambat: dailyTrend.datasets[1]?.data[i] || 0,
        Ditolak: dailyTrend.datasets[2]?.data[i] || 0,
    }));

    const hourlyData = hourlyDistribution.labels.map((label, i) => ({
        name: label,
        total: hourlyDistribution.values[i],
    }));

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <CheckCircle className="h-3.5 w-3.5" />Hadir
                    </span>
                );
            case 'late':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <Clock className="h-3.5 w-3.5" />Terlambat
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                        <XCircle className="h-3.5 w-3.5" />Ditolak
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700">
                        {status}
                    </span>
                );
        }
    };

    return (
        <AppLayout>
            <Head title="Rekap Kehadiran" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-8"
            >
                {/* ═══════ HEADER — Matching Uang Kas Style ═══════ */}
                <motion.div
                    variants={itemVariants}
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
                            ease: "linear"
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left w-full sm:w-auto">
                                <motion.div
                                    className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24 items-center justify-center mx-auto sm:mx-0"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img src={rekapanIcon} alt="Rekap Kehadiran" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                </motion.div>
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm text-indigo-100 font-medium tracking-wide flex items-center justify-center sm:justify-start gap-2"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Analisis & Laporan
                                    </motion.p>
                                    <motion.h1
                                        className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Rekap Kehadiran
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 text-indigo-100 max-w-xl text-sm sm:text-base leading-relaxed mx-auto sm:mx-0"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Monitoring kehadiran mahasiswa secara komprehensif dan realtime.
                                    </motion.p>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleExportPdf}
                                className="flex items-center justify-center gap-2 rounded-xl bg-white/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/30 border border-white/20 shadow-lg w-fit mt-2 sm:mt-0"
                            >
                                <Download className="h-5 w-5" />
                                Export Laporan
                            </motion.button>
                        </div>
                    </div>
                </motion.div>


                {/* Summary Cards - Advanced Glassmorphism */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-4"
                >
                    {/* Total Visitors Card */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('total')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-sky-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10" />
                        <motion.div
                            initial={false}
                            animate={{
                                scale: hoveredCard === 'total' ? 1.5 : 1,
                                opacity: hoveredCard === 'total' ? 0.4 : 0.2,
                            }}
                            transition={{ duration: 0.5 }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center mx-auto sm:mx-0"
                            >
                                <img src={totalScanIcon} alt="Total Scan" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" />
                            </motion.div>
                            <div>
                                <p className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-neutral-400">Total Scan</p>
                                <div className="mt-0.5 sm:mt-1">
                                    <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                        {stats.total}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Hadir Card */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('hadir')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-emerald-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10" />
                        <motion.div
                            initial={false}
                            animate={{
                                scale: hoveredCard === 'hadir' ? 1.5 : 1,
                                opacity: hoveredCard === 'hadir' ? 0.4 : 0.2,
                            }}
                            transition={{ duration: 0.5 }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center mx-auto sm:mx-0"
                            >
                                <img src={hadirIcon} alt="Hadir" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" />
                            </motion.div>
                            <div>
                                <p className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-neutral-400">Hadir</p>
                                <div className="mt-0.5 sm:mt-1 flex items-baseline gap-2">
                                    <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                        {stats.present}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Terlambat Card */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('terlambat')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-amber-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10" />
                        <motion.div
                            initial={false}
                            animate={{
                                scale: hoveredCard === 'terlambat' ? 1.5 : 1,
                                opacity: hoveredCard === 'terlambat' ? 0.4 : 0.2,
                            }}
                            transition={{ duration: 0.5 }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center mx-auto sm:mx-0"
                            >
                                <img src={terlambatIcon} alt="Terlambat" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" />
                            </motion.div>
                            <div>
                                <p className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-neutral-400">Terlambat</p>
                                <div className="mt-0.5 sm:mt-1">
                                    <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                        {stats.late}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Ditolak Card */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('ditolak')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-rose-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10" />
                        <motion.div
                            initial={false}
                            animate={{
                                scale: hoveredCard === 'ditolak' ? 1.5 : 1,
                                opacity: hoveredCard === 'ditolak' ? 0.4 : 0.2,
                            }}
                            transition={{ duration: 0.5 }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rose-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center mx-auto sm:mx-0"
                            >
                                <img src={ditolakIcon} alt="Ditolak" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" />
                            </motion.div>
                            <div>
                                <p className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-neutral-400">Ditolak</p>
                                <div className="mt-0.5 sm:mt-1">
                                    <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                        {stats.rejected}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Compact Filters - Modern Glass */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
                >
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[200px] space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-500 uppercase ml-1">Dari Tanggal</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-white/60 px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                            />
                        </div>
                        <div className="flex-1 min-w-[200px] space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-500 uppercase ml-1">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="w-full rounded-xl border border-neutral-200 bg-white/60 px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                            />
                        </div>
                        <div className="flex-1 min-w-[200px] space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-500 uppercase ml-1">Mata Kuliah</label>
                            <div className="relative">
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                                <select
                                    value={courseId}
                                    onChange={e => setCourseId(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white/60 px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                >
                                    <option value="all">Semua Mata Kuliah</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.nama}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex-1 min-w-[200px] space-y-1.5">
                            <label className="text-xs font-semibold text-neutral-500 uppercase ml-1">Status</label>
                            <div className="relative">
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white/60 px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="present">Hadir</option>
                                    <option value="late">Terlambat</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleFilter}
                            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all h-[42px]"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Filter
                        </motion.button>
                    </div>
                </motion.div>


                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Daily Trend Chart */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40 p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/20">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Tren Kehadiran Harian</h2>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.)', border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                        itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                                        cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Area type="monotone" dataKey="Hadir" stackId="1" stroke="#10b981" strokeWidth={3} fill="url(#colorHadir)" />
                                    <Area type="monotone" dataKey="Terlambat" stackId="1" stroke="#f59e0b" strokeWidth={3} fill="url(#colorLate)" />
                                    <Area type="monotone" dataKey="Ditolak" stackId="1" stroke="#ef4444" strokeWidth={3} fill="url(#colorRejected)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Hourly Distribution */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40 p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/20">
                                <Clock className="h-5 w-5" />
                            </div>
                            <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Distribusi Per Jam</h2>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 10, fill: '#64748b' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={30}>
                                        {
                                            hourlyData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Course Summary & Top/Low Attendance */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Course Summary */}
                    <motion.div
                        variants={itemVariants}
                        className="lg:col-span-2 rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40 overflow-hidden"
                    >
                        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-white/50 dark:bg-black/20">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Ringkasan Per Mata Kuliah</h2>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-neutral-50/50 dark:bg-neutral-800/20">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Mata Kuliah</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider">Sesi</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider">Hadir</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider">Terlambat</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider">Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                                    {courseSummary.map((course, index) => (
                                        <motion.tr
                                            key={course.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + index * 0.05 }}
                                            className="group hover:bg-white/60 dark:hover:bg-neutral-800/50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-neutral-900 dark:text-white">{course.nama}</p>
                                                <p className="text-xs text-neutral-500">{course.dosen}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 font-bold dark:bg-neutral-800">{course.total_sessions}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                                                    {course.present}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                                                    {course.late}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-16 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${course.rate >= 80 ? 'bg-emerald-500' :
                                                                course.rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${course.rate}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{course.rate}%</span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Side Section (Top & Low) */}
                    <div className="space-y-6">
                        {/* Top Attendees — Advanced UI (Matching Mahasiswa Menu) */}
                        <motion.div
                            variants={itemVariants}
                            className="relative overflow-hidden rounded-3xl text-white shadow-2xl"
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
                                    ease: "linear"
                                }}
                                style={{
                                    backgroundSize: '200% 200%',
                                }}
                            />

                            {/* Decorative Orbs */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                            <div className="relative p-6 border-b border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg">
                                        <Award className="h-6 w-6 text-yellow-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Top Kehadiran</h2>
                                        <p className="text-xs text-indigo-100">Mahasiswa paling rajin</p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative p-4 space-y-2">
                                {topAttendees.map((student, i) => (
                                    <motion.div
                                        key={student.id}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all cursor-pointer border border-white/10 hover:border-white/30 group"
                                    >
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-lg ${i === 0 ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-amber-900 border border-yellow-200' :
                                            i === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 border border-slate-200' :
                                                i === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-900 border border-orange-200' :
                                                    'bg-white/20 text-white border border-white/20'
                                            }`}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white truncate group-hover:text-yellow-100 transition-colors">{student.nama}</p>
                                            <p className="text-xs text-indigo-200">{student.nim}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-100 text-xs font-bold border border-emerald-400/30">
                                                {student.total_attendance}x
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedStudentForAppreciation(student);
                                                    setShowAppreciationModal(true);
                                                }}
                                                className="p-2 rounded-lg bg-white/20 hover:bg-white/40 text-white border border-white/30 transition-all shadow-lg hover:rotate-12 hover:scale-110 active:scale-95"
                                                title="Kirim Apresiasi"
                                            >
                                                <PartyPopper className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Low Attendance */}
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40 overflow-hidden"
                        >
                            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-white/50 dark:bg-black/20">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <h2 className="font-bold text-neutral-900 dark:text-white">Perlu Perhatian</h2>
                                </div>
                            </div>
                            <div className="p-2 space-y-1">
                                {lowAttendance.map((student, index) => (
                                    <motion.div
                                        key={student.id}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/60 dark:hover:bg-neutral-800/50 transition-all cursor-pointer border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                            <Zap className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{student.nama}</p>
                                            <p className="text-xs text-neutral-500">{student.nim}</p>
                                        </div>
                                        <div className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-bold border border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
                                            {student.rate}%
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedStudentForWarning(student);
                                                setShowWarningModal(true);
                                            }}
                                            className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-400 transition-colors"
                                            title="Kirim Peringatan"
                                        >
                                            <MessageSquareWarning className="h-4 w-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Attendance Logs Table */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40 overflow-hidden"
                >
                    <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-white/50 dark:bg-black/20 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/20">
                                <Users className="h-5 w-5" />
                            </div>
                            <h2 className="font-bold text-neutral-900 dark:text-white text-lg">Detail Kehadiran</h2>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-white/50 border border-neutral-200 text-sm font-medium text-neutral-600 dark:bg-neutral-800/50 dark:border-neutral-700 dark:text-neutral-300">
                            Total {attendanceLogs.total} Data
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-neutral-50/50 dark:bg-neutral-800/20 border-b border-neutral-100 dark:border-neutral-800">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Waktu Print</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Mahasiswa</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Mata Kuliah / Sesi</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-neutral-500 uppercase tracking-wider">Verifikasi Selfie</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                                {attendanceLogs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="mx-auto h-20 w-20 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                                                <Users className="h-10 w-10 text-neutral-400" />
                                            </div>
                                            <p className="text-neutral-500 font-medium">Tidak ada data kehadiran yang ditemukan</p>
                                        </td>
                                    </tr>
                                ) : (
                                    attendanceLogs.data.map((log, index) => (
                                        <motion.tr
                                            key={log.id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
                                            onClick={() => {
                                                setSelectedLog(log);
                                                setShowDetailModal(true);
                                            }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                                        {new Date(log.scanned_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-xs text-neutral-500">
                                                        {new Date(log.scanned_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center text-xs font-bold text-neutral-600">
                                                        {log.mahasiswa?.nama.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{log.mahasiswa?.nama}</p>
                                                        <p className="text-xs text-neutral-500">{log.mahasiswa?.nim}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">{log.session?.course?.nama}</span>
                                                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                        Pertemuan {log.session?.meeting_number}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(log.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {log.selfie_verification ? (
                                                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold border ${log.selfie_verification.status === 'approved'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                        : log.selfie_verification.status === 'pending'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                                                        }`}>
                                                        {log.selfie_verification.status === 'approved' ? 'Verified' :
                                                            log.selfie_verification.status === 'pending' ? 'Pending' : 'Rejected'}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-neutral-400 italic">No Selfie</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {attendanceLogs.last_page > 1 && (
                        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-white/50 dark:bg-black/20 flex justify-center gap-2">
                            {attendanceLogs.links.map((link, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: link.url ? 1.05 : 1 }}
                                    whileTap={{ scale: link.url ? 0.95 : 1 }}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    disabled={!link.url}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${link.active
                                        ? 'bg-blue-600 text-white shadow-blue-500/30'
                                        : link.url
                                            ? 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-700'
                                            : 'bg-neutral-100 text-neutral-400 border border-neutral-100 cursor-not-allowed dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-600'
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* ═══════ DETAIL MODAL ═══════ */}
            <AnimatePresence>
                {showDetailModal && selectedLog && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDetailModal(false)}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Container */}
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-white/20 dark:border-neutral-800"
                            >
                                {/* Modal Header with Gradient */}
                                <div className="relative h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 flex items-start justify-between overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                                            {selectedLog.mahasiswa?.nama.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">{selectedLog.mahasiswa?.nama}</h3>
                                            <p className="text-blue-100">{selectedLog.mahasiswa?.nim}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="relative z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
                                    >
                                        <XCircle className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Modal Body */}
                                <div className="p-6 space-y-6">
                                    {/* Status Badge & Time */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {getStatusBadge(selectedLog.status)}
                                            <span className="text-sm text-neutral-500 font-medium">
                                                {selectedLog.scanned_at}
                                            </span>
                                        </div>
                                        {selectedLog.selfie_verification && (
                                            <div className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                                                Selfie Verification: {selectedLog.selfie_verification.status}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Course Info */}
                                        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 space-y-3">
                                            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                                                <BookOpen className="h-5 w-5" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Mata Kuliah</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-neutral-900 dark:text-white text-lg">
                                                    {selectedLog.session?.course.nama}
                                                </p>
                                                <p className="text-sm text-neutral-500">
                                                    Kelas {selectedLog.mahasiswa?.kelas || '-'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Session Info */}
                                        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800 space-y-3">
                                            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                                                <Calendar className="h-5 w-5" />
                                                <span className="text-xs font-bold uppercase tracking-wider">Sesi Pertemuan</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-neutral-900 dark:text-white text-lg">
                                                    Pertemuan ke-{selectedLog.session?.meeting_number}
                                                </p>
                                                <p className="text-sm text-neutral-500">
                                                    {selectedLog.session?.course.dosen?.nama}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selfie Preview (if available) - Assuming path might be available in future */}
                                    <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 relative bg-neutral-900 aspect-video flex items-center justify-center group">
                                        {selectedLog.selfie_verification?.selfie_path ? (
                                            <>
                                                <img
                                                    src={`/storage/${selectedLog.selfie_verification.selfie_path}`}
                                                    alt="Attendance Evidence"
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                                                    <p className="text-white font-bold flex items-center gap-2">
                                                        <Search className="h-4 w-4" /> Bukti Kehadiran
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center space-y-2">
                                                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto backdrop-blur-sm">
                                                    <Users className="h-8 w-8 text-white/50" />
                                                </div>
                                                <p className="text-neutral-400 text-sm">Tidak ada bukti foto</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Details */}
                                    <div className="grid grid-cols-3 gap-2 text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                        <div>
                                            <p className="uppercase tracking-wider font-bold mb-1">ID Log</p>
                                            <p className="font-mono bg-neutral-100 dark:bg-neutral-800 py-1 rounded-md">#{selectedLog.id}</p>
                                        </div>
                                        <div>
                                            <p className="uppercase tracking-wider font-bold mb-1">Jarak</p>
                                            <p className="font-mono bg-neutral-100 dark:bg-neutral-800 py-1 rounded-md">
                                                {selectedLog.distance ? `${selectedLog.distance.toFixed(1)}m` : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="uppercase tracking-wider font-bold mb-1">Perangkat</p>
                                            <p className="font-mono bg-neutral-100 dark:bg-neutral-800 py-1 rounded-md truncate px-2">
                                                {selectedLog.device_info || 'Mobile App'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* ═══════ WARNING MODAL ═══════ */}
            <AnimatePresence>
                {showWarningModal && selectedStudentForWarning && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowWarningModal(false)}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Container */}
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-white/20 dark:border-neutral-800"
                            >
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                            <MessageSquareWarning className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Kirim Peringatan</h3>
                                            <p className="text-sm text-neutral-500">Kepada {selectedStudentForWarning.nama}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Pesan Peringatan</label>
                                        <textarea
                                            value={warningMessage}
                                            onChange={(e) => setWarningMessage(e.target.value)}
                                            placeholder="Tulis pesan peringatan di sini..."
                                            className="w-full h-32 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 focus:border-red-500 focus:ring-red-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 resize-none"
                                        />
                                        <p className="text-xs text-neutral-500">
                                            Pesan ini akan muncul di menu <strong>Evaluasi Studi</strong> mahasiswa.
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setShowWarningModal(false)}
                                            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!warningMessage.trim()) return;

                                                router.post('/admin/attendance/warning', {
                                                    mahasiswa_id: selectedStudentForWarning.id,
                                                    title: 'Evaluasi Kehadiran',
                                                    message: warningMessage,
                                                }, {
                                                    onSuccess: () => {
                                                        setShowWarningModal(false);
                                                        setWarningMessage('');
                                                    },
                                                    preserveScroll: true,
                                                });
                                            }}
                                            disabled={!warningMessage.trim()}
                                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Kirim Peringatan
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* ═══════ APPRECIATION MODAL ═══════ */}
            <AnimatePresence>
                {showAppreciationModal && selectedStudentForAppreciation && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAppreciationModal(false)}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Container */}
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto border border-white/20 dark:border-neutral-800"
                            >
                                {/* Modal Header */}
                                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                    <div className="relative flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
                                            <Sparkles className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Kirim Apresiasi</h3>
                                            <p className="text-sm text-indigo-100">Kepada {selectedStudentForAppreciation.nama}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Pesan Apresiasi</label>
                                        <textarea
                                            value={appreciationMessage}
                                            onChange={(e) => setAppreciationMessage(e.target.value)}
                                            placeholder="Tulis pesan apresiasi di sini... (Contoh: Pertahankan kehadiranmu!)"
                                            className="w-full h-32 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 focus:border-indigo-500 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 resize-none"
                                        />
                                        <p className="text-xs text-neutral-500">
                                            Pesan ini akan muncul di menu <strong>Evaluasi Studi</strong> mahasiswa.
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setShowAppreciationModal(false)}
                                            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!appreciationMessage.trim()) return;

                                                router.post('/admin/attendance/warning', {
                                                    mahasiswa_id: selectedStudentForAppreciation.id,
                                                    title: 'Apresiasi Kehadiran',
                                                    message: appreciationMessage,
                                                    type: 'appreciation'
                                                }, {
                                                    onSuccess: () => {
                                                        setShowAppreciationModal(false);
                                                        setAppreciationMessage('');
                                                    },
                                                    preserveScroll: true,
                                                });
                                            }}
                                            disabled={!appreciationMessage.trim()}
                                            className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Kirim Apresiasi
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </AppLayout >
    );
}
