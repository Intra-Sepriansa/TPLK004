import OverdueIcon from '@/assets/admin/informasi-tugas/overdue.png';
import CourseIcon from '@/assets/dosen/dashboard/course-icon.png';
import StatAttendanceRate from '@/assets/dosen/dashboard/stat-attendance-rate.png';
import StatTotalSessions from '@/assets/dosen/dashboard/stat-total-sessions.png';
import StatTotalStudents from '@/assets/dosen/dashboard/stat-total-students.png';
import BasisDataIcon from '@/assets/matkul/basis-data.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import DosenLayout from '@/layouts/dosen-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import {
    Activity,
    ArrowLeft,
    ArrowUpRight,
    Bell,
    Calendar,
    CheckCircle,
    ChevronRight,
    Clock,
    Download,
    Filter,
    MoreVertical,
    PieChart as PieChartIcon,
    Plus,
    Search,
    Settings,
    Sparkles,
    Target,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

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
    nextSessionAttendance: {
        predicted: number;
        confidence: 'high' | 'medium' | 'low';
    };
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
            staggerChildren: 0.05,
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
function AnimatedCounter({
    value,
    suffix = '',
}: {
    value: number | string;
    suffix?: string;
}) {
    return (
        <span className="tabular-nums">
            {value}
            {suffix}
        </span>
    );
}

export default function CourseDetail({
    dosen,
    course,
    sessions,
    students,
    stats,
    distribution,
    chartData,
    activities,
    predictions,
}: PageProps) {
    const [activeTab, setActiveTab] = useState<
        'overview' | 'mahasiswa' | 'sesi-absen'
    >('overview');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<{
        key: keyof Student;
        direction: 'asc' | 'desc';
    } | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(
        null,
    );
    const [selectedSessionDate, setSelectedSessionDate] = useState<
        string | null
    >(null);

    // Derived State: Filtered Students
    const filteredStudents = useMemo(() => {
        let filtered = [...students];

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (s) =>
                    s.nama.toLowerCase().includes(lowerQuery) ||
                    s.nim.toLowerCase().includes(lowerQuery),
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((s) => s.status === statusFilter);
        }

        if (sortConfig) {
            filtered.sort((a, b) => {
                const key = sortConfig.key;
                // @ts-ignore
                if (a[key] < b[key])
                    return sortConfig.direction === 'asc' ? -1 : 1;
                // @ts-ignore
                if (a[key] > b[key])
                    return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [students, searchQuery, statusFilter, sortConfig]);

    // Sorting Helper
    const requestSort = (key: keyof Student) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === 'asc'
        ) {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Derived State: Session Performance Data for Bar Chart
    const sessionPerformanceData = useMemo(() => {
        return chartData.map((item) => ({
            name: item.meeting,
            Hadir: item.presentCount,
            Terlambat: item.lateCount,
            TidakHadir: item.absentCount,
        }));
    }, [chartData]);

    const handleExport = (type: 'pdf' | 'excel' | 'csv') => {
        if (type === 'pdf') {
            window.location.href = `/dosen/courses/${course.id}/export-pdf`;
        } else {
            alert(`Belum didukung untuk format ${type.toUpperCase()}`);
        }
    };

    const handleCreateSession = () => {
        router.visit(`/dosen/sesi-absen/create?course_id=${course.id}`);
    };

    const handleSendAnnouncement = () => {
        alert('Opening announcement modal...');
    };

    // Dynamic Icon Mapping
    const getCourseIcon = (courseName: string) => {
        const name = courseName.toLowerCase();
        if (name.includes('basis data')) return BasisDataIcon;
        return CourseIcon;
    };

    return (
        <DosenLayout>
            <Head title={`Detail ${course.nama || 'Mata Kuliah'}`} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-4"
            >
                {/* ═══════ ENHANCED HEADER ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative isolate overflow-hidden rounded-[2.5rem] p-5 text-white shadow-2xl md:p-6"
                >
                    <div className="absolute inset-0 z-0 bg-neutral-900" />
                    <motion.div
                        className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-fuchsia-600 opacity-90"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                            filter: [
                                'hue-rotate(0deg)',
                                'hue-rotate(15deg)',
                                'hue-rotate(0deg)',
                            ],
                        }}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    {/* Complex Floating Orbs & Light Effects */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay brightness-100" />
                    <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-pink-500/40 mix-blend-screen blur-[100px]" />
                    <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-600/40 mix-blend-screen blur-[100px]" />

                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-white/10 mix-blend-overlay blur-xl"
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
                                ease: 'easeInOut',
                                delay: Math.random() * 5,
                            }}
                        />
                    ))}

                    <div className="relative z-10">
                        {/* ═══ BACK BUTTON ═══ */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mb-6"
                        >
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/dosen/courses')}
                                className="group transition-all duration-300 hover:bg-white/60 dark:hover:bg-neutral-800/60"
                            >
                                <motion.div
                                    whileHover={{ x: -4 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 25,
                                    }}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                </motion.div>
                                Kembali ke Daftar
                            </Button>
                        </motion.div>

                        <div className="flex w-full flex-col justify-between gap-6 lg:flex-row lg:items-end lg:gap-8">
                            <div className="flex w-full flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left lg:w-auto">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-visible sm:h-24 sm:w-24"
                                >
                                    <img
                                        src={getCourseIcon(course.nama)}
                                        alt="Course Icon"
                                        className="h-16 w-16 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] sm:h-20 sm:w-20"
                                    />
                                </motion.div>
                                <div className="space-y-3 sm:space-y-2">
                                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                        <Badge className="border-indigo-400/30 bg-indigo-500/30 px-3 py-1 text-xs font-bold tracking-wider text-indigo-100 uppercase shadow-lg backdrop-blur-md hover:bg-indigo-500/40">
                                            {course.kode}
                                        </Badge>
                                        <Badge className="border-purple-400/30 bg-purple-500/30 px-3 py-1 text-xs font-bold tracking-wider text-purple-100 uppercase shadow-lg backdrop-blur-md hover:bg-purple-500/40">
                                            {course.sks} SKS
                                        </Badge>
                                        <Badge className="border-emerald-400/30 bg-emerald-500/30 px-3 py-1 text-xs font-bold tracking-wider text-emerald-100 uppercase shadow-lg backdrop-blur-md hover:bg-emerald-500/40">
                                            Semester {course.semester}
                                        </Badge>
                                    </div>
                                    <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-sm md:text-3xl">
                                        {course.nama}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-indigo-50 sm:justify-start sm:gap-x-6 sm:text-sm">
                                        <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 backdrop-blur sm:gap-2 sm:px-3 sm:py-1.5">
                                            <Users className="h-3.5 w-3.5 text-pink-300 sm:h-4 sm:w-4" />
                                            <span>
                                                {stats.totalStudents} Mahasiswa
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 backdrop-blur sm:gap-2 sm:px-3 sm:py-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-blue-300 sm:h-4 sm:w-4" />
                                            <span>
                                                {stats.totalSessions} Sesi (
                                                {stats.activeSessions} Aktif)
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 backdrop-blur sm:gap-2 sm:px-3 sm:py-1.5">
                                            <TrendingUp className="h-3.5 w-3.5 text-emerald-300 sm:h-4 sm:w-4" />
                                            <span
                                                className={
                                                    stats.attendanceRate >= 80
                                                        ? 'text-emerald-300'
                                                        : 'text-amber-300'
                                                }
                                            >
                                                {stats.attendanceRate}%
                                                Kehadiran
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:gap-3 lg:w-auto lg:justify-end">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCreateSession}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-400 bg-emerald-500 px-4 py-2.5 text-xs font-bold shadow-lg backdrop-blur-xl transition-all hover:bg-emerald-600 sm:flex-none sm:px-5 sm:py-3 sm:text-sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Buat Sesi</span>
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleExport('pdf')}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold shadow-lg backdrop-blur-xl transition-all hover:bg-white/20 sm:flex-none sm:px-5 sm:py-3 sm:text-sm"
                                >
                                    <Download className="h-4 w-4" />
                                    <span>Export</span>
                                </motion.button>

                                <div className="mt-2 flex w-full gap-2 sm:mt-0 sm:w-auto sm:gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                            router.visit(
                                                '/dosen/notifications/create',
                                            )
                                        }
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold shadow-lg backdrop-blur-xl transition-all hover:bg-white/20 sm:flex-none sm:py-3"
                                        title="Kirim Pengumuman"
                                    >
                                        <Bell className="h-4 w-4" />
                                        <span className="text-xs sm:hidden">
                                            Pengumuman
                                        </span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                            router.visit('/dosen/settings')
                                        }
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold shadow-lg backdrop-blur-xl transition-all hover:bg-white/20 sm:flex-none sm:py-3"
                                        title="Pengaturan"
                                    >
                                        <Settings className="h-4 w-4" />
                                        <span className="text-xs sm:hidden">
                                            Pengaturan
                                        </span>
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ ENHANCED SUMMARY CARDS ═══════ */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4"
                >
                    {/* Total Mahasiswa */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        className="group relative box-border overflow-hidden rounded-[2rem] border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-2xl transition-all dark:border-white/5 dark:bg-neutral-900/60"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 dark:from-teal-500/20 dark:to-cyan-500/20" />
                        <motion.div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-teal-500/30 blur-3xl transition-all duration-500 group-hover:bg-teal-500/50" />

                        <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                            >
                                <img
                                    src={StatTotalStudents}
                                    alt="Total Mahasiswa"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-xl"
                                />
                            </motion.div>
                            <div className="flex flex-col items-center sm:items-start">
                                <p className="text-[10px] font-medium text-neutral-500 sm:text-xs dark:text-neutral-400">
                                    Total Mahasiswa
                                </p>
                                <p className="mt-0.5 text-lg font-black text-neutral-900 sm:mt-1 sm:text-xl dark:text-white">
                                    <AnimatedCounter
                                        value={stats.totalStudents}
                                    />
                                </p>
                                <div className="mt-1 flex w-fit items-center justify-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-500 sm:justify-start sm:text-[10px]">
                                    <ArrowUpRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />{' '}
                                    <span className="hidden sm:inline">
                                        +100% Aktif
                                    </span>
                                    <span className="sm:hidden">Aktif</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sesi Berlangsung */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        className="group relative box-border overflow-hidden rounded-[2rem] border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-2xl transition-all dark:border-white/5 dark:bg-neutral-900/60"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 dark:from-purple-500/20 dark:to-fuchsia-500/20" />
                        <motion.div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-purple-500/30 blur-3xl transition-all duration-500 group-hover:bg-purple-500/50" />

                        <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                            >
                                <img
                                    src={StatTotalSessions}
                                    alt="Sesi Berlangsung"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-xl"
                                />
                            </motion.div>
                            <div className="flex flex-col items-center sm:items-start">
                                <p className="text-[10px] font-medium whitespace-nowrap text-neutral-500 sm:text-xs dark:text-neutral-400">
                                    Sesi Berlangsung
                                </p>
                                <p className="mt-0.5 text-lg font-black text-neutral-900 sm:mt-1 sm:text-xl dark:text-white">
                                    <AnimatedCounter
                                        value={stats.activeSessions}
                                    />
                                </p>
                                <div className="mt-1 flex w-fit items-center justify-center gap-1 rounded-full bg-neutral-500/10 px-2 py-0.5 text-[9px] font-bold whitespace-nowrap text-neutral-500 sm:justify-start sm:text-[10px]">
                                    {stats.completedSessions} Selesai
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tingkat Kehadiran */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        className="group relative box-border overflow-hidden rounded-[2rem] border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-2xl transition-all dark:border-white/5 dark:bg-neutral-900/60"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/20" />
                        <motion.div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-amber-500/30 blur-3xl transition-all duration-500 group-hover:bg-amber-500/50" />

                        <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                            >
                                <img
                                    src={StatAttendanceRate}
                                    alt="Tingkat Kehadiran"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-xl"
                                />
                            </motion.div>
                            <div className="flex flex-col items-center sm:items-start">
                                <p className="text-[10px] font-medium text-neutral-500 sm:text-xs dark:text-neutral-400">
                                    Kehadiran
                                </p>
                                <p className="mt-0.5 text-lg font-black text-neutral-900 sm:mt-1 sm:text-xl dark:text-white">
                                    <AnimatedCounter
                                        value={stats.attendanceRate}
                                        suffix="%"
                                    />
                                </p>
                                <div
                                    className={cn(
                                        'mt-1 flex w-fit items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold whitespace-nowrap sm:justify-start sm:text-[10px]',
                                        stats.attendanceRate >= 80
                                            ? 'bg-emerald-500/10 text-emerald-500'
                                            : 'bg-amber-500/10 text-amber-500',
                                    )}
                                >
                                    {stats.attendanceRate >= 80
                                        ? 'Bagus'
                                        : 'Tingkat'}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tingkat < 70% */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        className="group relative box-border overflow-hidden rounded-[2rem] border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-2xl transition-all dark:border-white/5 dark:bg-neutral-900/60"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5 dark:from-rose-500/20 dark:to-red-500/20" />
                        <motion.div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-rose-500/30 blur-3xl transition-all duration-500 group-hover:bg-rose-500/50" />

                        <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                            >
                                <img
                                    src={OverdueIcon}
                                    alt="Tingkat < 70%"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-xl"
                                />
                            </motion.div>
                            <div className="flex flex-col items-center sm:items-start">
                                <p className="text-[10px] font-medium whitespace-nowrap text-neutral-500 sm:text-xs dark:text-neutral-400">
                                    Tingkat &lt; 70%
                                </p>
                                <p className="mt-0.5 text-lg font-black text-neutral-900 sm:mt-1 sm:text-xl dark:text-white">
                                    <AnimatedCounter
                                        value={stats.atRiskCount}
                                    />
                                </p>
                                <div className="mt-1 flex w-fit items-center justify-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-bold whitespace-nowrap text-rose-500 sm:justify-start sm:text-[10px]">
                                    <span className="hidden sm:inline">
                                        Perlu Perhatian
                                    </span>
                                    <span className="sm:hidden">Waspada</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* ═══════ ENHANCED TABS NAVIGATION ═══════ */}
                <div className="flex w-fit gap-2 rounded-2xl border border-white/10 bg-neutral-100/50 p-1.5 shadow-sm backdrop-blur-xl dark:bg-neutral-900/50">
                    {['overview', 'mahasiswa', 'sesi-absen'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                'relative rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-300',
                                activeTab === tab
                                    ? 'text-indigo-600 dark:text-indigo-300'
                                    : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200',
                            )}
                        >
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 rounded-xl border border-black/5 bg-white shadow-md dark:border-white/10 dark:bg-neutral-800"
                                    transition={{
                                        type: 'spring',
                                        bounce: 0.2,
                                        duration: 0.6,
                                    }}
                                />
                            )}
                            <span className="relative z-10 tracking-wide capitalize">
                                {tab.replace('-', ' ')}
                            </span>
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
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/40"
                                >
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                        <TrendingUp className="h-5 w-5 text-indigo-500" />{' '}
                                        Trend Kehadiran
                                    </h3>
                                    <ResponsiveContainer
                                        width="100%"
                                        height={300}
                                    >
                                        <LineChart data={chartData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#E5E7EB"
                                            />
                                            <XAxis
                                                dataKey="meeting"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fontSize: 12,
                                                    fill: '#6B7280',
                                                }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fontSize: 12,
                                                    fill: '#6B7280',
                                                }}
                                                domain={[0, 100]}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    boxShadow:
                                                        '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                }}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="hadir"
                                                stroke="#10B981"
                                                strokeWidth={3}
                                                dot={{
                                                    r: 4,
                                                    fill: '#10B981',
                                                    strokeWidth: 2,
                                                }}
                                                activeDot={{ r: 6 }}
                                                name="Hadir (%)"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="tidakHadir"
                                                stroke="#EF4444"
                                                strokeWidth={3}
                                                dot={{
                                                    r: 4,
                                                    fill: '#EF4444',
                                                    strokeWidth: 2,
                                                }}
                                                name="Tidak Hadir (%)"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </motion.div>

                                <motion.div
                                    variants={itemVariants}
                                    className="relative rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/40"
                                >
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                        <PieChartIcon className="h-5 w-5 text-indigo-500" />{' '}
                                        Distribusi Kehadiran
                                    </h3>
                                    <div className="flex items-center justify-center">
                                        <ResponsiveContainer
                                            width="100%"
                                            height={300}
                                        >
                                            <PieChart>
                                                <Pie
                                                    data={distribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={70}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {distribution.map(
                                                        (entry, index) => (
                                                            <Cell
                                                                key={`cell-${index}`}
                                                                fill={
                                                                    entry.color
                                                                }
                                                                strokeWidth={0}
                                                            />
                                                        ),
                                                    )}
                                                </Pie>
                                                <Tooltip />
                                                <Legend
                                                    verticalAlign="middle"
                                                    align="right"
                                                    layout="vertical"
                                                    iconType="circle"
                                                    wrapperStyle={{ right: 0 }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                                    {stats.totalStudents}
                                                </span>
                                                <p className="text-xs tracking-wider text-muted-foreground uppercase">
                                                    Mahasiswa
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* AI Predictions Panel */}
                            <motion.div
                                variants={itemVariants}
                                className="grid grid-cols-1 gap-6 md:grid-cols-3"
                            >
                                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white shadow-xl">
                                    <Sparkles className="absolute top-4 right-4 h-6 w-6 text-white/50" />
                                    <h4 className="mb-2 text-xs font-medium tracking-wider text-indigo-100 uppercase">
                                        Prediksi Kehadiran
                                    </h4>
                                    <div className="mb-1 text-3xl font-bold">
                                        {
                                            predictions.nextSessionAttendance
                                                .predicted
                                        }
                                        %
                                    </div>
                                    <p className="mb-4 text-xs text-indigo-100">
                                        Estimasi kehadiran sesi berikutnya
                                    </p>
                                    <div className="flex w-fit items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs">
                                        <Target className="h-3 w-3" />{' '}
                                        Confidence:{' '}
                                        {predictions.nextSessionAttendance.confidence.toUpperCase()}
                                    </div>
                                </div>

                                <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                                    <h4 className="mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                        At-Risk Students
                                    </h4>
                                    <div className="mb-1 text-3xl font-bold text-red-500">
                                        {predictions.atRiskStudents.count}
                                    </div>
                                    <p className="mb-4 text-xs text-gray-400">
                                        Mahasiswa perlu perhatian khusus
                                    </p>
                                    <div className="space-y-2">
                                        {predictions.atRiskStudents.students.map(
                                            (s, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between text-xs"
                                                >
                                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                                        {s.nama}
                                                    </span>
                                                    <span className="font-bold text-red-500">
                                                        {s.rate}%
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>

                                <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                                    <h4 className="mb-2 text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                        Projected Pass Rate
                                    </h4>
                                    <div className="mb-1 text-3xl font-bold text-emerald-500">
                                        {predictions.passRate.predicted}%
                                    </div>
                                    <p className="mb-4 text-xs text-gray-400">
                                        Berdasarkan data kehadiran saat ini
                                    </p>
                                    <div className="mt-4 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                        <div
                                            className="h-2.5 rounded-full bg-emerald-500"
                                            style={{
                                                width: `${predictions.passRate.predicted}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Recent Activity Timeline */}
                            <motion.div
                                variants={itemVariants}
                                className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/40"
                            >
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <Activity className="h-5 w-5 text-indigo-500" />{' '}
                                        Aktivitas Terbaru
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-indigo-600"
                                    >
                                        Lihat Semua
                                    </Button>
                                </div>
                                <div className="space-y-6">
                                    {activities.map((activity, idx) => (
                                        <div
                                            key={idx}
                                            className="group flex gap-4"
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 transition-colors group-hover:bg-indigo-100">
                                                    {activity.icon ===
                                                    'check' ? (
                                                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                                                    ) : activity.icon ===
                                                      'clock' ? (
                                                        <Clock className="h-5 w-5 text-amber-500" />
                                                    ) : (
                                                        <Activity className="h-5 w-5 text-indigo-500" />
                                                    )}
                                                </div>
                                                {idx <
                                                    activities.length - 1 && (
                                                    <div className="my-2 h-full w-px bg-gray-200" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {activity.text}
                                                </p>
                                                <p className="mb-1 text-xs text-gray-500">
                                                    {activity.detail}
                                                </p>
                                                <p className="font-mono text-[10px] text-gray-400">
                                                    {activity.time}
                                                </p>
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
                            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/20 bg-white/50 p-3 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/50">
                                <div className="relative flex min-w-[300px] flex-1 items-center">
                                    <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari nama atau NIM..."
                                        className="w-full rounded-xl border border-gray-200 bg-white/80 py-2 pr-4 pl-10 transition-shadow focus:ring-2 focus:ring-indigo-500/50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        className="rounded-xl border-gray-200 bg-white/80 py-2 pr-8 pl-3 text-sm focus:ring-indigo-500/50 dark:border-neutral-700 dark:bg-neutral-800"
                                        value={statusFilter}
                                        onChange={(e) =>
                                            setStatusFilter(e.target.value)
                                        }
                                    >
                                        <option value="all">
                                            Semua Status
                                        </option>
                                        <option value="excellent">
                                            Excellent
                                        </option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="poor">Poor</option>
                                        <option value="fail">Fail</option>
                                    </select>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="hidden bg-white/50 md:flex"
                                    >
                                        <Filter className="mr-2 h-4 w-4" />{' '}
                                        Filter Lanjutan
                                    </Button>
                                </div>
                            </div>

                            {/* Students Grid/Table */}
                            <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-900/40">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50/50 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                                            <th
                                                className="cursor-pointer px-6 py-4 hover:text-indigo-600"
                                                onClick={() =>
                                                    requestSort('nama')
                                                }
                                            >
                                                Mahasiswa
                                            </th>
                                            <th
                                                className="cursor-pointer px-6 py-4 hover:text-indigo-600"
                                                onClick={() =>
                                                    requestSort('nim')
                                                }
                                            >
                                                NIM & Kelas
                                            </th>
                                            <th className="px-6 py-4 text-center">
                                                Kehadiran
                                            </th>
                                            <th
                                                className="cursor-pointer px-6 py-4 text-center hover:text-indigo-600"
                                                onClick={() =>
                                                    requestSort('rate')
                                                }
                                            >
                                                Rate
                                            </th>
                                            <th className="px-6 py-4 text-center">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-right">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredStudents.map(
                                            (student, idx) => (
                                                <motion.tr
                                                    key={student.id}
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{
                                                        delay: idx * 0.05,
                                                    }}
                                                    className="transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-bold text-white">
                                                                {student.nama.charAt(
                                                                    0,
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {
                                                                        student.nama
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {
                                                                        student.nim
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100">
                                                            {student.nim}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {student.kelas}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                                        <div className="space-x-1 text-xs text-gray-500">
                                                            <span className="font-medium text-emerald-600">
                                                                {
                                                                    student.present
                                                                }{' '}
                                                                H
                                                            </span>
                                                            <span className="font-medium text-amber-600">
                                                                {student.late} T
                                                            </span>
                                                            <span className="font-medium text-red-600">
                                                                {student.absent}{' '}
                                                                A
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <span
                                                                className={cn(
                                                                    'text-sm font-bold',
                                                                    student.rate >=
                                                                        90
                                                                        ? 'text-emerald-500'
                                                                        : student.rate >=
                                                                            70
                                                                          ? 'text-amber-500'
                                                                          : 'text-red-500',
                                                                )}
                                                            >
                                                                {student.rate}%
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={student.rate}
                                                            className="mx-auto mt-1 h-1.5 w-20"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap">
                                                        <Badge
                                                            variant={
                                                                student.status ===
                                                                'excellent'
                                                                    ? 'default'
                                                                    : student.status ===
                                                                        'good'
                                                                      ? 'secondary'
                                                                      : student.status ===
                                                                          'fair'
                                                                        ? 'outline'
                                                                        : 'destructive'
                                                            }
                                                            className="capitalize"
                                                        >
                                                            {student.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                setSelectedStudent(
                                                                    student,
                                                                )
                                                            }
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </motion.tr>
                                            ),
                                        )}
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
                            <div className="flex items-center justify-between rounded-3xl border border-white/20 bg-white/50 p-4 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-neutral-900/50">
                                <h3 className="pl-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    Daftar Sesi Perkuliahan
                                </h3>
                                <Button
                                    onClick={handleCreateSession}
                                    className="bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Buat Sesi
                                    Baru
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
                                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-4 shadow-lg backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:bg-neutral-900/60"
                                    >
                                        <div
                                            className={`absolute top-0 right-0 rounded-bl-2xl p-3 text-xs font-bold tracking-wider uppercase ${
                                                session.status === 'active'
                                                    ? 'bg-emerald-100 text-emerald-600'
                                                    : session.status ===
                                                        'completed'
                                                      ? 'bg-blue-100 text-blue-600'
                                                      : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {session.status}
                                        </div>

                                        <div className="mb-4">
                                            <p className="mb-1 text-xs font-bold tracking-widest text-indigo-500 uppercase">
                                                Pertemuan{' '}
                                                {session.meeting_number}
                                            </p>
                                            <h4
                                                className="truncate text-xl font-bold text-gray-900 dark:text-white"
                                                title={session.title}
                                            >
                                                {session.title}
                                            </h4>
                                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="h-4 w-4" />{' '}
                                                {session.start_at}
                                            </div>
                                        </div>

                                        <div className="mb-6 space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">
                                                    Hadir
                                                </span>
                                                <span className="font-bold text-gray-900 dark:text-white">
                                                    {session.present_count}{' '}
                                                    <span className="font-normal text-gray-400">
                                                        / {stats.totalStudents}
                                                    </span>
                                                </span>
                                            </div>
                                            <Progress
                                                value={session.rate}
                                                className="h-2"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                                            <div className="flex -space-x-2">
                                                {[...Array(3)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[10px] text-gray-500 dark:border-gray-800 dark:bg-gray-700"
                                                    >
                                                        {String.fromCharCode(
                                                            65 + i,
                                                        )}
                                                    </div>
                                                ))}
                                                {session.attendance_count >
                                                    3 && (
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-500 dark:border-gray-800 dark:bg-gray-800">
                                                        +
                                                        {session.attendance_count -
                                                            3}
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-gray-700 dark:hover:bg-indigo-900/20"
                                                onClick={() =>
                                                    router.visit(
                                                        `/dosen/sesi-absen/${session.id}`,
                                                    )
                                                }
                                            >
                                                Detail{' '}
                                                <ChevronRight className="ml-1 h-3 w-3" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Student Detail Modal */}
                <Dialog
                    open={!!selectedStudent}
                    onOpenChange={(open) => !open && setSelectedStudent(null)}
                >
                    <DialogContent className="border-white/20 bg-white/90 backdrop-blur-xl sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Detail Mahasiswa</DialogTitle>
                        </DialogHeader>
                        {selectedStudent && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl font-bold text-white">
                                        {selectedStudent.nama.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold">
                                            {selectedStudent.nama}
                                        </h3>
                                        <p className="flex items-center gap-2 text-gray-500">
                                            <Badge variant="outline">
                                                {selectedStudent.nim}
                                            </Badge>{' '}
                                            {selectedStudent.kelas}
                                        </p>
                                    </div>
                                    <div className="ml-auto text-right">
                                        <div className="text-3xl font-bold text-indigo-600">
                                            {selectedStudent.rate}%
                                        </div>
                                        <p className="text-xs tracking-widest text-gray-400 uppercase">
                                            Kehadiran
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center">
                                        <div className="text-2xl font-bold text-emerald-600">
                                            {selectedStudent.present}
                                        </div>
                                        <div className="text-xs font-medium text-emerald-600 uppercase">
                                            Hadir
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-center">
                                        <div className="text-2xl font-bold text-amber-600">
                                            {selectedStudent.late}
                                        </div>
                                        <div className="text-xs font-medium text-amber-600 uppercase">
                                            Terlambat
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center">
                                        <div className="text-2xl font-bold text-red-600">
                                            {selectedStudent.absent}
                                        </div>
                                        <div className="text-xs font-medium text-red-600 uppercase">
                                            Absen
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedStudent(null)}
                                    >
                                        Tutup
                                    </Button>
                                    <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
                                        Lihat Riwayat Lengkap
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </motion.div>
        </DosenLayout>
    );
}
