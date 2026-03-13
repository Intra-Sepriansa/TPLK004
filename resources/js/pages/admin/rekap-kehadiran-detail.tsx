import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Activity,
    ArrowLeft,
    Award,
    BarChart3,
    BookOpen,
    CalendarDays,
    CheckCircle,
    Clock,
    Download,
    Eye,
    History,
    IdCard,
    Mail,
    MapPin,
    MessageSquareWarning,
    Phone,
    Search,
    Send,
    Smartphone,
    Sparkles,
    Target,
    TrendingUp,
    Trophy,
    Users,
    XCircle,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    PolarAngleAxis,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import ditolakIcon from '@/assets/admin/rekap-kehadiran/ditolak.png';
import hadirIcon from '@/assets/admin/rekap-kehadiran/hadir.png';
import terlambatIcon from '@/assets/admin/rekap-kehadiran/terlambat.png';
import totalScanIcon from '@/assets/admin/rekap-kehadiran/total-scan.png';
import streakIcon from '@/assets/mahasiswa/dashboard/streak.png';
import approvalIcon from '@/assets/mahasiswa/voting/approval.png';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

type StudentStatus = 'excellent' | 'good' | 'warning' | 'at_risk';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type StudentProfile = {
    id: number;
    nama: string;
    nim: string;
    kelas: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    prodi?: string | null;
    semester?: number | null;
    total_attendance: number;
    attendance_rate: number;
    rank_in_class: number;
    total_students_in_class: number;
    status: StudentStatus;
};

type Stats = {
    total_sessions: number;
    present: number;
    late: number;
    rejected: number;
    attendance_rate: number;
    punctuality_score: number;
    current_streak: number;
    longest_streak: number;
    avg_arrival_minutes: number;
    class_avg_rate: number;
    predicted_rate: number;
};

type DailyTrend = {
    labels: string[];
    datasets: Array<{ label: string; data: number[]; color: string }>;
};

type AttendanceLogItem = {
    id: number;
    status: 'present' | 'late' | 'rejected' | string;
    scanned_at: string;
    distance_m?: number | null;
    latitude?: number | null;
    longitude?: number | null;
    device_model?: string | null;
    device_os?: string | null;
    session: {
        id: number;
        meeting_number: number;
        course: {
            id: number;
            nama: string;
            dosen?: { nama: string } | null;
        } | null;
    } | null;
    selfie_verification?: {
        status: string;
        selfie_path?: string | null;
    } | null;
};

type CourseBreakdown = {
    id: number;
    nama: string;
    dosen: string;
    total_sessions: number;
    present: number;
    late: number;
    rejected: number;
    rate: number;
};

type DayOfWeekData = {
    day: string;
    count: number;
};

type MonthlySummary = {
    month: string;
    label: string;
    present: number;
    late: number;
    rejected: number;
    total: number;
    rate: number;
};

type WarningLog = {
    id: number;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
};

type TimelineItem = {
    id: number;
    status: string;
    time: string;
    course: string;
    meeting_number?: number | null;
    distance_m?: number | null;
    device?: string;
    selfie_status?: string | null;
};

type UpcomingSession = {
    id: number;
    course: string;
    dosen: string;
    meeting_number: number;
    start_at: string;
    end_at: string;
};

type PageProps = {
    student: StudentProfile;
    stats: Stats;
    dailyTrend: DailyTrend;
    courseBreakdown: CourseBreakdown[];
    hourlyDistribution: { labels: string[]; values: number[] };
    dayOfWeekData: DayOfWeekData[];
    calendarHeatmap: Record<string, 'none' | 'low' | 'medium' | 'high'>;
    monthlySummary: MonthlySummary[];
    timeline: TimelineItem[];
    upcomingSessions: UpcomingSession[];
    warnings: WarningLog[];
    attendanceLogs: {
        data: AttendanceLogItem[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        date_from: string;
        date_to: string;
        course_id: string;
        status: string;
    };
    courseOptions: Array<{ id: string; nama: string }>;
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
} as const;

const statusLabelMap: Record<StudentStatus, string> = {
    excellent: 'Excellent',
    good: 'Good',
    warning: 'Warning',
    at_risk: 'At Risk',
};

function getStudentStatusClass(status: StudentStatus): string {
    switch (status) {
        case 'excellent':
            return 'bg-emerald-100 text-emerald-700';
        case 'good':
            return 'bg-blue-100 text-blue-700';
        case 'warning':
            return 'bg-amber-100 text-amber-700';
        case 'at_risk':
            return 'bg-rose-100 text-rose-700';
        default:
            return 'bg-slate-100 text-slate-700';
    }
}

function getAttendanceStatusBadge(status: string) {
    if (status === 'present') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600">
                <CheckCircle className="h-3.5 w-3.5" /> Hadir
            </span>
        );
    }
    if (status === 'late') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600">
                <Clock className="h-3.5 w-3.5" /> Terlambat
            </span>
        );
    }
    if (status === 'rejected') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-600">
                <XCircle className="h-3.5 w-3.5" /> Ditolak
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-300/60 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            {status}
        </span>
    );
}

function heatmapClass(level: 'none' | 'low' | 'medium' | 'high') {
    switch (level) {
        case 'high':
            return 'bg-emerald-500';
        case 'medium':
            return 'bg-emerald-400/80';
        case 'low':
            return 'bg-emerald-300/70';
        default:
            return 'bg-neutral-200 dark:bg-neutral-800';
    }
}

export default function AdminRekapKehadiranDetail({
    student,
    stats,
    dailyTrend,
    courseBreakdown,
    hourlyDistribution,
    dayOfWeekData,
    calendarHeatmap,
    monthlySummary,
    timeline,
    upcomingSessions,
    warnings,
    attendanceLogs,
    filters,
    courseOptions,
}: PageProps) {
    const [activeTab, setActiveTab] = useState<
        | 'overview'
        | 'history'
        | 'courses'
        | 'analytics'
        | 'timeline'
        | 'actions'
    >('overview');
    const [historyStatus, setHistoryStatus] = useState(filters.status || 'all');
    const [historyCourse, setHistoryCourse] = useState(
        filters.course_id || 'all',
    );

    const [warningTitle, setWarningTitle] = useState('');
    const [warningMessage, setWarningMessage] = useState('');
    const [appreciationTitle, setAppreciationTitle] = useState(
        'Apresiasi Kehadiran Mahasiswa',
    );
    const [appreciationMessage, setAppreciationMessage] = useState(
        'Terima kasih atas kehadiran dan kedisiplinan Anda. Pertahankan performa ini.',
    );

    const trendData = useMemo(
        () =>
            dailyTrend.labels.map((label, index) => ({
                label,
                Hadir: dailyTrend.datasets[0]?.data[index] ?? 0,
                Terlambat: dailyTrend.datasets[1]?.data[index] ?? 0,
                Ditolak: dailyTrend.datasets[2]?.data[index] ?? 0,
            })),
        [dailyTrend],
    );

    const hourlyData = useMemo(
        () =>
            hourlyDistribution.labels.map((label, index) => ({
                label,
                total: hourlyDistribution.values[index] ?? 0,
            })),
        [hourlyDistribution],
    );

    const courseRateData = useMemo(
        () =>
            courseBreakdown.map((course) => ({
                name: course.nama,
                rate: course.rate,
            })),
        [courseBreakdown],
    );

    const filteredHistory = useMemo(() => {
        return attendanceLogs.data.filter((log) => {
            const statusPass =
                historyStatus === 'all' || log.status === historyStatus;
            const coursePass =
                historyCourse === 'all' ||
                String(log.session?.course?.id ?? '') === String(historyCourse);
            return statusPass && coursePass;
        });
    }, [attendanceLogs.data, historyStatus, historyCourse]);

    const whatsappLink = useMemo(() => {
        if (!student.phone) return null;
        const normalized = student.phone.replace(/\D/g, '');
        if (!normalized) return null;
        return `https://wa.me/${normalized}`;
    }, [student.phone]);

    const heatmapEntries = useMemo(() => {
        return Object.entries(calendarHeatmap)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-112);
    }, [calendarHeatmap]);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'history', label: 'Riwayat', icon: History },
        { id: 'courses', label: 'Mata Kuliah', icon: BookOpen },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'timeline', label: 'Timeline', icon: CalendarDays },
        { id: 'actions', label: 'Actions', icon: Zap },
    ] as const;

    const quickStats = [
        {
            label: 'Total Sessions',
            value: stats.total_sessions,
            icon: totalScanIcon,
            customIcon: null,
            cardClass:
                'border-blue-300/40 bg-blue-100/55 dark:border-blue-500/30 dark:bg-blue-900/20',
            valueClass: 'text-blue-700 dark:text-blue-200',
            hoverClass: 'hover:shadow-blue-500/15',
            iconContainerClass: '',
        },
        {
            label: 'Hadir',
            value: stats.present,
            icon: hadirIcon,
            customIcon: null,
            cardClass:
                'border-emerald-300/45 bg-emerald-100/55 dark:border-emerald-500/30 dark:bg-emerald-900/20',
            valueClass: 'text-emerald-700 dark:text-emerald-200',
            hoverClass: 'hover:shadow-emerald-500/15',
            iconContainerClass: '',
        },
        {
            label: 'Terlambat',
            value: stats.late,
            icon: terlambatIcon,
            customIcon: null,
            cardClass:
                'border-amber-300/45 bg-amber-100/55 dark:border-amber-500/30 dark:bg-amber-900/20',
            valueClass: 'text-amber-700 dark:text-amber-200',
            hoverClass: 'hover:shadow-amber-500/15',
            iconContainerClass: '',
        },
        {
            label: 'Ditolak',
            value: stats.rejected,
            icon: ditolakIcon,
            customIcon: null,
            cardClass:
                'border-rose-300/45 bg-rose-100/55 dark:border-rose-500/30 dark:bg-rose-900/20',
            valueClass: 'text-rose-700 dark:text-rose-200',
            hoverClass: 'hover:shadow-rose-500/15',
            iconContainerClass: '',
        },
        {
            label: 'Punctuality',
            value: `${stats.punctuality_score}/100`,
            icon: approvalIcon,
            customIcon: null,
            cardClass:
                'border-violet-300/45 bg-violet-100/55 dark:border-violet-500/30 dark:bg-violet-900/20',
            valueClass: 'text-violet-700 dark:text-violet-200',
            hoverClass: 'hover:shadow-violet-500/20',
            iconContainerClass: '',
        },
        {
            label: 'Current Streak',
            value: `${stats.current_streak} hari`,
            icon: streakIcon,
            customIcon: null,
            cardClass:
                'border-orange-300/45 bg-orange-100/55 dark:border-orange-500/30 dark:bg-orange-900/20',
            valueClass: 'text-orange-700 dark:text-orange-200',
            hoverClass: 'hover:shadow-orange-500/20',
            iconContainerClass:
                'border-orange-300/60 bg-orange-100/90 text-orange-600 dark:border-orange-500/40 dark:bg-orange-900/40 dark:text-orange-200',
        },
    ];

    const handleExportReport = () => {
        const params = new URLSearchParams({
            date_from: filters.date_from,
            date_to: filters.date_to,
            course_id: filters.course_id,
            mahasiswa_id: String(student.id),
        });

        window.open(
            `/admin/rekap-kehadiran/pdf?${params.toString()}`,
            '_blank',
        );
    };

    const applyServerFilter = () => {
        router.get(
            `/admin/rekap-kehadiran/${student.id}`,
            {
                date_from: filters.date_from,
                date_to: filters.date_to,
                status: historyStatus,
                course_id: historyCourse,
            },
            { preserveState: true },
        );
    };

    const sendMessage = (type: 'warning' | 'appreciation') => {
        const title =
            type === 'warning' ? warningTitle.trim() : appreciationTitle.trim();
        const message =
            type === 'warning'
                ? warningMessage.trim()
                : appreciationMessage.trim();

        if (!title || !message) {
            return;
        }

        router.post(
            '/admin/attendance/warning',
            {
                mahasiswa_id: student.id,
                title,
                message,
                type,
            },
            {
                preserveState: true,
                onSuccess: () => {
                    if (type === 'warning') {
                        setWarningTitle('');
                        setWarningMessage('');
                    }
                },
            },
        );
    };

    const predictionDelta = Number(
        (stats.predicted_rate - stats.attendance_rate).toFixed(1),
    );

    return (
        <AppLayout>
            <Head title={`Detail Kehadiran - ${student.nama}`} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-4 sm:p-6"
            >
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-6 md:p-8"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10">
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() =>
                                router.visit('/admin/rekap-kehadiran')
                            }
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Rekap Kehadiran
                        </motion.button>

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                                <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
                                    {student.avatar ? (
                                        <img
                                            src={student.avatar}
                                            alt={student.nama}
                                            className="h-full w-full rounded-full border-4 border-white/30 object-cover shadow-2xl"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-white/30 bg-gradient-to-br from-violet-500 to-fuchsia-500 text-3xl font-bold text-white shadow-2xl">
                                            {student.nama.charAt(0)}
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            'absolute -right-1 -bottom-1 h-6 w-6 rounded-full border-4 border-white',
                                            student.status === 'excellent' &&
                                                'bg-emerald-500',
                                            student.status === 'good' &&
                                                'bg-blue-500',
                                            student.status === 'warning' &&
                                                'bg-amber-500',
                                            student.status === 'at_risk' &&
                                                'bg-rose-500',
                                        )}
                                    />
                                </div>

                                <div>
                                    <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase',
                                                getStudentStatusClass(
                                                    student.status,
                                                ),
                                            )}
                                        >
                                            {statusLabelMap[student.status]}
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
                                            <Trophy className="h-3.5 w-3.5" />
                                            Rank #{student.rank_in_class}/
                                            {student.total_students_in_class}
                                        </span>
                                    </div>

                                    <h1 className="text-2xl font-bold sm:text-3xl">
                                        {student.nama}
                                    </h1>

                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-purple-100">
                                        <span className="inline-flex items-center gap-1">
                                            <IdCard className="h-4 w-4" />{' '}
                                            {student.nim}
                                        </span>
                                        <span>•</span>
                                        <span className="inline-flex items-center gap-1">
                                            <Users className="h-4 w-4" />{' '}
                                            {student.kelas}
                                        </span>
                                        <span>•</span>
                                        <span className="inline-flex items-center gap-1">
                                            <Mail className="h-4 w-4" />{' '}
                                            {student.email}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleExportReport}
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/30"
                                >
                                    <Download className="h-4 w-4" /> Export
                                    Report
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
                >
                    {quickStats.map((stat) => (
                        <motion.div
                            key={stat.label}
                            whileHover={{ y: -4, scale: 1.02 }}
                            className={cn(
                                'group relative overflow-hidden rounded-3xl border p-4 shadow-xl backdrop-blur-xl transition-all duration-300',
                                stat.cardClass,
                                stat.hoverClass,
                            )}
                        >
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-60" />
                            <div className="relative flex items-center justify-between gap-3">
                                {stat.icon ? (
                                    <img
                                        src={stat.icon}
                                        alt={stat.label}
                                        className="h-11 w-11 shrink-0 object-contain"
                                    />
                                ) : stat.customIcon ? (
                                    <div
                                        className={cn(
                                            'flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm',
                                            stat.iconContainerClass,
                                        )}
                                    >
                                        <Target className="h-5 w-5" />
                                    </div>
                                ) : null}
                                <p
                                    className={cn(
                                        'text-xl font-bold',
                                        stat.valueClass,
                                    )}
                                >
                                    {stat.value}
                                </p>
                            </div>
                            <p className="relative mt-1 text-xs text-slate-500 dark:text-slate-400">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="w-full overflow-hidden rounded-2xl border border-white/10 bg-neutral-100/50 p-1 backdrop-blur-md dark:bg-neutral-900/50"
                >
                    <div className="max-w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <div className="inline-flex min-w-max gap-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all',
                                            activeTab === tab.id
                                                ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg'
                                                : 'text-neutral-600 hover:bg-white/70 dark:text-neutral-300 dark:hover:bg-neutral-800/60',
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>

                {activeTab === 'overview' && (
                    <motion.div variants={itemVariants} className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40">
                                <h3 className="mb-4 text-sm font-bold tracking-wide text-neutral-500 uppercase">
                                    Attendance Rate
                                </h3>
                                <div className="relative mx-auto h-52 w-52">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <RadialBarChart
                                            innerRadius="65%"
                                            outerRadius="100%"
                                            data={[
                                                {
                                                    name: 'Rate',
                                                    value: stats.attendance_rate,
                                                },
                                            ]}
                                            startAngle={90}
                                            endAngle={-270}
                                        >
                                            <PolarAngleAxis
                                                type="number"
                                                domain={[0, 100]}
                                                angleAxisId={0}
                                                tick={false}
                                            />
                                            <RadialBar
                                                dataKey="value"
                                                cornerRadius={12}
                                                fill="#6366f1"
                                                background
                                            />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <p className="text-3xl font-black text-neutral-900 dark:text-white">
                                            {stats.attendance_rate}%
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            Rate
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                                    <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/70 p-3 dark:border-emerald-800/40 dark:bg-emerald-900/10">
                                        <p className="text-lg font-bold text-emerald-600">
                                            {stats.present}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            Hadir
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-amber-200/50 bg-amber-50/70 p-3 dark:border-amber-800/40 dark:bg-amber-900/10">
                                        <p className="text-lg font-bold text-amber-600">
                                            {stats.late}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            Terlambat
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40">
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide text-neutral-500 uppercase">
                                    <Target className="h-4 w-4" /> Perbandingan
                                    Kelas
                                </h3>
                                <div className="space-y-5">
                                    <div>
                                        <div className="mb-1 flex items-center justify-between text-sm">
                                            <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                                                {student.nama}
                                            </span>
                                            <span className="font-bold text-indigo-600">
                                                {stats.attendance_rate}%
                                            </span>
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                                                style={{
                                                    width: `${stats.attendance_rate}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-1 flex items-center justify-between text-sm">
                                            <span className="text-neutral-500">
                                                Rata-rata kelas
                                            </span>
                                            <span className="font-bold text-slate-600 dark:text-slate-300">
                                                {stats.class_avg_rate}%
                                            </span>
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                            <div
                                                className="h-full rounded-full bg-slate-400"
                                                style={{
                                                    width: `${stats.class_avg_rate}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl border border-violet-200/50 bg-violet-50/70 p-3 text-center dark:border-violet-800/40 dark:bg-violet-900/10">
                                            <p className="text-lg font-bold text-violet-600">
                                                {stats.current_streak}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                Current Streak
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-cyan-200/50 bg-cyan-50/70 p-3 text-center dark:border-cyan-800/40 dark:bg-cyan-900/10">
                                            <p className="text-lg font-bold text-cyan-600">
                                                {stats.longest_streak}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                Longest Streak
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40">
                                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wide text-neutral-500 uppercase">
                                    <CalendarDays className="h-4 w-4" />{' '}
                                    Upcoming Sessions
                                </h3>
                                <div className="space-y-3">
                                    {upcomingSessions.length > 0 ? (
                                        upcomingSessions.map((session) => (
                                            <div
                                                key={session.id}
                                                className="rounded-xl border border-neutral-200/70 bg-white/70 p-3 dark:border-neutral-700 dark:bg-neutral-800/60"
                                            >
                                                <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                                                    {session.course}
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    Pertemuan{' '}
                                                    {session.meeting_number} •{' '}
                                                    {session.start_at}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="py-10 text-center text-sm text-neutral-500">
                                            Belum ada sesi mendatang.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40">
                            <div className="mb-5 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-indigo-600" />
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    Tren Kehadiran 30 Hari Terakhir
                                </h3>
                            </div>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient
                                                id="gradPresent"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#10b981"
                                                    stopOpacity={0.65}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#10b981"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                            <linearGradient
                                                id="gradLate"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#f59e0b"
                                                    stopOpacity={0.65}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#f59e0b"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                            <linearGradient
                                                id="gradRejected"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#ef4444"
                                                    stopOpacity={0.65}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#ef4444"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#e5e7eb"
                                        />
                                        <XAxis
                                            dataKey="label"
                                            tick={{
                                                fontSize: 11,
                                                fill: '#64748b',
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{
                                                fontSize: 11,
                                                fill: '#64748b',
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="Hadir"
                                            stroke="#10b981"
                                            fill="url(#gradPresent)"
                                            strokeWidth={2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="Terlambat"
                                            stroke="#f59e0b"
                                            fill="url(#gradLate)"
                                            strokeWidth={2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="Ditolak"
                                            stroke="#ef4444"
                                            fill="url(#gradRejected)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'history' && (
                    <motion.div variants={itemVariants} className="space-y-4">
                        <div className="grid gap-3 rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl sm:grid-cols-4 dark:border-neutral-800 dark:bg-neutral-900/40">
                            <div>
                                <label className="mb-1 block text-xs font-bold tracking-wide text-neutral-500 uppercase">
                                    Status
                                </label>
                                <select
                                    value={historyStatus}
                                    onChange={(e) =>
                                        setHistoryStatus(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                >
                                    <option value="all">Semua</option>
                                    <option value="present">Hadir</option>
                                    <option value="late">Terlambat</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-bold tracking-wide text-neutral-500 uppercase">
                                    Mata Kuliah
                                </label>
                                <select
                                    value={historyCourse}
                                    onChange={(e) =>
                                        setHistoryCourse(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-neutral-200 bg-white/70 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                >
                                    <option value="all">Semua</option>
                                    {courseOptions.map((course) => (
                                        <option
                                            key={course.id}
                                            value={course.id}
                                        >
                                            {course.nama}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:col-span-2 sm:flex sm:items-end">
                                <button
                                    onClick={applyServerFilter}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-bold text-white transition hover:from-indigo-500 hover:to-purple-500"
                                >
                                    <Search className="h-4 w-4" /> Terapkan
                                    Filter
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((log) => (
                                    <div
                                        key={log.id}
                                        className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40"
                                    >
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                                                    {log.session?.course
                                                        ?.nama ?? '-'}
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    Pertemuan{' '}
                                                    {log.session
                                                        ?.meeting_number ??
                                                        '-'}{' '}
                                                    •{' '}
                                                    {new Date(
                                                        log.scanned_at,
                                                    ).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                            {getAttendanceStatusBadge(
                                                log.status,
                                            )}
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-3 border-t border-neutral-200/60 pt-3 text-xs text-neutral-500 dark:border-neutral-700/70">
                                            {log.device_model && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Smartphone className="h-3.5 w-3.5" />{' '}
                                                    {log.device_model}
                                                </span>
                                            )}
                                            {log.device_os && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />{' '}
                                                    {log.device_os}
                                                </span>
                                            )}
                                            {typeof log.distance_m ===
                                                'number' && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5" />{' '}
                                                    {log.distance_m} m
                                                </span>
                                            )}
                                            {log.selfie_verification && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Eye className="h-3.5 w-3.5" />{' '}
                                                    Selfie:{' '}
                                                    {
                                                        log.selfie_verification
                                                            .status
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-white/20 bg-white/40 p-10 text-center text-sm text-neutral-500 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40">
                                    Tidak ada data kehadiran dengan filter saat
                                    ini.
                                </div>
                            )}
                        </div>

                        {attendanceLogs.last_page > 1 && (
                            <div className="flex flex-wrap justify-center gap-2">
                                {attendanceLogs.links.map((link, idx) => (
                                    <button
                                        key={`${link.label}-${idx}`}
                                        disabled={!link.url}
                                        onClick={() =>
                                            link.url &&
                                            router.visit(link.url, {
                                                preserveState: true,
                                            })
                                        }
                                        className={cn(
                                            'rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-white/70 text-neutral-600 hover:bg-white dark:bg-neutral-800 dark:text-neutral-300',
                                            !link.url &&
                                                'cursor-not-allowed opacity-40',
                                        )}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'courses' && (
                    <motion.div
                        variants={itemVariants}
                        className="grid gap-6 lg:grid-cols-2"
                    >
                        <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40">
                            <h3 className="mb-5 text-lg font-bold text-neutral-900 dark:text-white">
                                Perbandingan Rate per Mata Kuliah
                            </h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={courseRateData}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#e5e7eb"
                                        />
                                        <XAxis
                                            dataKey="name"
                                            tick={{
                                                fontSize: 11,
                                                fill: '#64748b',
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{
                                                fontSize: 11,
                                                fill: '#64748b',
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip />
                                        <Bar
                                            dataKey="rate"
                                            radius={[10, 10, 0, 0]}
                                        >
                                            {courseRateData.map(
                                                (entry, idx) => (
                                                    <Cell
                                                        key={`course-cell-${idx}`}
                                                        fill={
                                                            entry.rate >= 80
                                                                ? '#10b981'
                                                                : entry.rate >=
                                                                    60
                                                                  ? '#f59e0b'
                                                                  : '#ef4444'
                                                        }
                                                    />
                                                ),
                                            )}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40">
                            <h3 className="mb-5 text-lg font-bold text-neutral-900 dark:text-white">
                                Ringkasan Mata Kuliah
                            </h3>
                            <div className="space-y-3">
                                {courseBreakdown.length > 0 ? (
                                    courseBreakdown.map((course) => (
                                        <div
                                            key={course.id}
                                            className="rounded-xl border border-neutral-200/70 bg-white/70 p-3 dark:border-neutral-700 dark:bg-neutral-800/60"
                                        >
                                            <p className="text-sm font-bold text-neutral-900 dark:text-white">
                                                {course.nama}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                {course.dosen}
                                            </p>
                                            <div className="mt-2 grid grid-cols-4 gap-2 text-center">
                                                <div>
                                                    <p className="text-sm font-bold text-indigo-600">
                                                        {course.total_sessions}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-500">
                                                        Sesi
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-emerald-600">
                                                        {course.present}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-500">
                                                        Hadir
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-amber-600">
                                                        {course.late}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-500">
                                                        Late
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-violet-600">
                                                        {course.rate}%
                                                    </p>
                                                    <p className="text-[10px] text-neutral-500">
                                                        Rate
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-12 text-center text-sm text-neutral-500">
                                        Belum ada data mata kuliah.
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'analytics' && (
                    <motion.div variants={itemVariants} className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40">
                                <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
                                    Distribusi Jam Kehadiran
                                </h3>
                                <div className="h-72">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart data={hourlyData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#e5e7eb"
                                            />
                                            <XAxis
                                                dataKey="label"
                                                tick={{
                                                    fontSize: 11,
                                                    fill: '#64748b',
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{
                                                    fontSize: 11,
                                                    fill: '#64748b',
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip />
                                            <Bar
                                                dataKey="total"
                                                fill="#6366f1"
                                                radius={[8, 8, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40">
                                <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
                                    Pola Hari Kehadiran
                                </h3>
                                <div className="h-72">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart data={dayOfWeekData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#e5e7eb"
                                            />
                                            <XAxis
                                                dataKey="day"
                                                tick={{
                                                    fontSize: 11,
                                                    fill: '#64748b',
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{
                                                    fontSize: 11,
                                                    fill: '#64748b',
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip />
                                            <Bar
                                                dataKey="count"
                                                radius={[8, 8, 0, 0]}
                                            >
                                                {dayOfWeekData.map((_, idx) => (
                                                    <Cell
                                                        key={`day-cell-${idx}`}
                                                        fill={
                                                            idx < 5
                                                                ? '#10b981'
                                                                : '#94a3b8'
                                                        }
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl lg:col-span-2 dark:border-neutral-800 dark:bg-neutral-900/40">
                                <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
                                    Ringkasan Bulanan
                                </h3>
                                <div className="h-72">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <AreaChart data={monthlySummary}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#e5e7eb"
                                            />
                                            <XAxis
                                                dataKey="label"
                                                tick={{
                                                    fontSize: 11,
                                                    fill: '#64748b',
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{
                                                    fontSize: 11,
                                                    fill: '#64748b',
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip />
                                            <Legend />
                                            <Area
                                                type="monotone"
                                                dataKey="present"
                                                stroke="#10b981"
                                                fill="#10b98133"
                                                strokeWidth={2}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="late"
                                                stroke="#f59e0b"
                                                fill="#f59e0b33"
                                                strokeWidth={2}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="rejected"
                                                stroke="#ef4444"
                                                fill="#ef444433"
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40">
                                <h3 className="mb-4 text-sm font-bold tracking-wide text-neutral-500 uppercase">
                                    Prediksi Kehadiran
                                </h3>
                                <div className="space-y-4">
                                    <div className="rounded-2xl border border-indigo-200/50 bg-indigo-50/70 p-4 dark:border-indigo-800/40 dark:bg-indigo-900/10">
                                        <p className="text-xs text-neutral-500">
                                            Rate Saat Ini
                                        </p>
                                        <p className="text-3xl font-black text-indigo-600">
                                            {stats.attendance_rate}%
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-fuchsia-200/50 bg-fuchsia-50/70 p-4 dark:border-fuchsia-800/40 dark:bg-fuchsia-900/10">
                                        <p className="text-xs text-neutral-500">
                                            Prediksi Akhir
                                        </p>
                                        <p className="text-3xl font-black text-fuchsia-600">
                                            {stats.predicted_rate}%
                                        </p>
                                    </div>
                                    <div
                                        className={cn(
                                            'rounded-xl border px-3 py-2 text-sm font-medium',
                                            predictionDelta >= 0
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/10 dark:text-emerald-300'
                                                : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/40 dark:bg-rose-900/10 dark:text-rose-300',
                                        )}
                                    >
                                        {predictionDelta >= 0 ? '+' : ''}
                                        {predictionDelta}% dibanding rate saat
                                        ini
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'timeline' && (
                    <motion.div variants={itemVariants} className="space-y-6">
                        <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    Calendar Heatmap
                                </h3>
                                <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                                    <span className="inline-flex items-center gap-1">
                                        <span className="h-3 w-3 rounded bg-neutral-200 dark:bg-neutral-700" />
                                        None
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <span className="h-3 w-3 rounded bg-emerald-300/70" />
                                        Low
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <span className="h-3 w-3 rounded bg-emerald-400/80" />
                                        Medium
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <span className="h-3 w-3 rounded bg-emerald-500" />
                                        High
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-14 gap-1.5">
                                {heatmapEntries.length > 0 ? (
                                    heatmapEntries.map(([date, level]) => (
                                        <div
                                            key={date}
                                            title={`${date} • ${level}`}
                                            className={cn(
                                                'h-4 w-full rounded-sm transition-transform hover:scale-125',
                                                heatmapClass(level),
                                            )}
                                        />
                                    ))
                                ) : (
                                    <p className="col-span-14 py-8 text-center text-sm text-neutral-500">
                                        Belum ada data heatmap.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40">
                            <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
                                Timeline Aktivitas Kehadiran
                            </h3>
                            <div className="space-y-3">
                                {timeline.length > 0 ? (
                                    timeline.map((item) => (
                                        <div
                                            key={item.id}
                                            className="rounded-xl border border-neutral-200/70 bg-white/70 p-3 dark:border-neutral-700 dark:bg-neutral-800/60"
                                        >
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-neutral-900 dark:text-white">
                                                        {item.course}
                                                    </p>
                                                    <p className="text-xs text-neutral-500">
                                                        Pertemuan{' '}
                                                        {item.meeting_number ??
                                                            '-'}{' '}
                                                        • {item.time}
                                                    </p>
                                                </div>
                                                {getAttendanceStatusBadge(
                                                    item.status,
                                                )}
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500">
                                                {item.distance_m != null && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <MapPin className="h-3.5 w-3.5" />{' '}
                                                        {item.distance_m} m
                                                    </span>
                                                )}
                                                {item.device && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Smartphone className="h-3.5 w-3.5" />{' '}
                                                        {item.device}
                                                    </span>
                                                )}
                                                {item.selfie_status && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Eye className="h-3.5 w-3.5" />{' '}
                                                        Selfie:{' '}
                                                        {item.selfie_status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-8 text-center text-sm text-neutral-500">
                                        Belum ada timeline aktivitas.
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'actions' && (
                    <motion.div variants={itemVariants} className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-3xl border border-amber-200/50 bg-amber-50/60 p-6 shadow-xl backdrop-blur-xl dark:border-amber-800/30 dark:bg-amber-900/10">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-amber-700 dark:text-amber-300">
                                    <MessageSquareWarning className="h-5 w-5" />{' '}
                                    Kirim Warning
                                </h3>
                                <div className="space-y-3">
                                    <input
                                        value={warningTitle}
                                        onChange={(e) =>
                                            setWarningTitle(e.target.value)
                                        }
                                        placeholder="Judul peringatan"
                                        className="w-full rounded-xl border border-amber-200 bg-white/80 px-4 py-2.5 text-sm text-neutral-800 dark:border-amber-800/50 dark:bg-neutral-900/60 dark:text-neutral-100"
                                    />
                                    <textarea
                                        value={warningMessage}
                                        onChange={(e) =>
                                            setWarningMessage(e.target.value)
                                        }
                                        placeholder="Isi peringatan untuk mahasiswa"
                                        rows={4}
                                        className="w-full rounded-xl border border-amber-200 bg-white/80 px-4 py-2.5 text-sm text-neutral-800 dark:border-amber-800/50 dark:bg-neutral-900/60 dark:text-neutral-100"
                                    />
                                    <button
                                        onClick={() => sendMessage('warning')}
                                        className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-600"
                                    >
                                        <Send className="h-4 w-4" /> Kirim
                                        Warning
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-emerald-200/50 bg-emerald-50/60 p-6 shadow-xl backdrop-blur-xl dark:border-emerald-800/30 dark:bg-emerald-900/10">
                                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-emerald-700 dark:text-emerald-300">
                                    <Sparkles className="h-5 w-5" /> Kirim
                                    Apresiasi
                                </h3>
                                <div className="space-y-3">
                                    <input
                                        value={appreciationTitle}
                                        onChange={(e) =>
                                            setAppreciationTitle(e.target.value)
                                        }
                                        placeholder="Judul apresiasi"
                                        className="w-full rounded-xl border border-emerald-200 bg-white/80 px-4 py-2.5 text-sm text-neutral-800 dark:border-emerald-800/50 dark:bg-neutral-900/60 dark:text-neutral-100"
                                    />
                                    <textarea
                                        value={appreciationMessage}
                                        onChange={(e) =>
                                            setAppreciationMessage(
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Isi apresiasi"
                                        rows={4}
                                        className="w-full rounded-xl border border-emerald-200 bg-white/80 px-4 py-2.5 text-sm text-neutral-800 dark:border-emerald-800/50 dark:bg-neutral-900/60 dark:text-neutral-100"
                                    />
                                    <button
                                        onClick={() =>
                                            sendMessage('appreciation')
                                        }
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600"
                                    >
                                        <Award className="h-4 w-4" /> Kirim
                                        Apresiasi
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40">
                                <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
                                    Kontak Mahasiswa
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    <a
                                        href={`mailto:${student.email}`}
                                        className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800/40 dark:bg-indigo-900/10 dark:text-indigo-300"
                                    >
                                        <Mail className="h-4 w-4" /> Email
                                    </a>
                                    {whatsappLink && (
                                        <a
                                            href={whatsappLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800/40 dark:bg-emerald-900/10 dark:text-emerald-300"
                                        >
                                            <Phone className="h-4 w-4" />{' '}
                                            WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/40">
                                <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-white">
                                    Riwayat Warning & Apresiasi
                                </h3>
                                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                                    {warnings.length > 0 ? (
                                        warnings.map((warning) => (
                                            <div
                                                key={warning.id}
                                                className="rounded-xl border border-neutral-200/70 bg-white/70 p-3 dark:border-neutral-700 dark:bg-neutral-800/60"
                                            >
                                                <div className="mb-1 flex items-center justify-between gap-2">
                                                    <span
                                                        className={cn(
                                                            'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                                                            warning.type ===
                                                                'appreciation'
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
                                                        )}
                                                    >
                                                        {warning.type}
                                                    </span>
                                                    <span className="text-[11px] text-neutral-500">
                                                        {warning.created_at}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                                                    {warning.title}
                                                </p>
                                                <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                                                    {warning.message}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="py-8 text-center text-sm text-neutral-500">
                                            Belum ada riwayat warning/apresiasi.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AppLayout>
    );
}
