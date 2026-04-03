import TokenDuplikatIcon from '@/assets/admin/audit/token-duplikat.png';
import HadirIcon from '@/assets/admin/live-monitor/hadir-icon.png';
import LiveMonitorIcon from '@/assets/admin/live-monitor/live-monitor-icon.png';
import ScanIcon from '@/assets/admin/live-monitor/scan-icon.png';
import SesiAktifIcon from '@/assets/admin/live-monitor/sesi-aktif-icon.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ChevronRight,
    Play,
    RefreshCw,
    Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { toast } from 'sonner';

type ActivityItem = {
    id: number;
    student_name: string;
    nim: string;
    session_name: string;
    course: string;
    meeting_number?: number | null;
    session_id?: number | null;
    time: string | null;
    status: 'hadir' | 'terlambat' | 'izin' | 'anomali';
    distance: number | null;
    device?: string | null;
    anomaly_reason?: string | null;
};

type SessionItem = {
    id: number;
    course: string;
    course_id: number;
    meeting_number: number;
    lecturer: string;
    present: number;
    total: number;
    timeLeft: string;
    is_active: boolean;
};

type FilterOption = {
    value: string;
    label: string;
};

type SelectedSession = {
    id: number;
    course_name: string;
    course_id: number;
    meeting_number: number;
    lecturer: string;
    start_at: string | null;
    end_at: string | null;
    is_active: boolean;
} | null;

interface PageProps {
    filters: {
        course_id: string;
        meeting_number: string;
        session_id: string;
        status: string;
    };
    selectedSession: SelectedSession;
    initialStats: {
        activeSessions: number;
        totalScans: number;
        activeStudents: number;
        present: number;
        late: number;
        anomaly: number;
        scanRate: number;
        presentRate: number;
        lateRate: number;
    };
    initialRecentActivities: ActivityItem[];
    initialActiveSessions: SessionItem[];
    initialTodayStats: {
        hadir: number;
        terlambat: number;
        izin: number;
        anomali: number;
    };
    initialAnomalies: Array<{
        id: number;
        type: string;
        message: string;
    }>;
    initialChartData: Array<{
        hour: string;
        scans: number;
    }>;
    filterOptions: {
        courses: FilterOption[];
        meetings: FilterOption[];
        sessions: FilterOption[];
        statuses: FilterOption[];
    };
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.08,
        },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 280,
            damping: 22,
        },
    },
} as const;

const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 260,
            damping: 20,
        },
    },
    hover: {
        y: -6,
        scale: 1.01,
        transition: {
            type: 'spring' as const,
            stiffness: 320,
            damping: 18,
        },
    },
} as const;

export default function LiveMonitor({
    filters,
    selectedSession,
    initialStats,
    initialRecentActivities,
    initialActiveSessions,
    initialTodayStats,
    initialAnomalies,
    initialChartData,
    filterOptions,
}: PageProps) {
    const [stats, setStats] = useState(initialStats);
    const [activities, setActivities] = useState(initialRecentActivities);
    const [activeSessions, setActiveSessions] = useState(initialActiveSessions);
    const [todayStats, setTodayStats] = useState(initialTodayStats);
    const [anomalies, setAnomalies] = useState(initialAnomalies);
    const [chartData, setChartData] = useState(initialChartData);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const applyFilter = (
        next: Partial<{
            course_id: string;
            meeting_number: string;
            session_id: string;
            status: string;
        }>,
    ) => {
        const payload = {
            ...filters,
            ...next,
        };

        router.get('/admin/live-monitor', payload, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleCourseChange = (value: string) => {
        applyFilter({
            course_id: value,
            meeting_number: 'all',
            session_id: 'all',
        });
    };

    const handleMeetingChange = (value: string) => {
        applyFilter({
            meeting_number: value,
            session_id: 'all',
        });
    };

    const handleSessionChange = (value: string) => {
        applyFilter({
            session_id: value,
        });
    };

    const handleStatusChange = (value: string) => {
        applyFilter({
            status: value,
        });
    };

    const refreshData = async () => {
        setIsRefreshing(true);

        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`/admin/live-monitor/refresh?${params.toString()}`);

            if (!response.ok) {
                throw new Error('refresh_failed');
            }

            const data = (await response.json()) as PageProps;
            setStats(data.initialStats);
            setActivities(data.initialRecentActivities);
            setActiveSessions(data.initialActiveSessions);
            setTodayStats(data.initialTodayStats);
            setAnomalies(data.initialAnomalies);
            setChartData(data.initialChartData);
            toast.success('Live monitor berhasil diperbarui.');
        } catch {
            toast.error('Gagal memuat ulang live monitor.');
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        setStats(initialStats);
        setActivities(initialRecentActivities);
        setActiveSessions(initialActiveSessions);
        setTodayStats(initialTodayStats);
        setAnomalies(initialAnomalies);
        setChartData(initialChartData);
    }, [
        initialActiveSessions,
        initialAnomalies,
        initialChartData,
        initialRecentActivities,
        initialStats,
        initialTodayStats,
    ]);

    const statusSummary = useMemo(
        () => [
            {
                label: 'Hadir',
                value: todayStats.hadir,
                color: 'text-emerald-600',
            },
            {
                label: 'Terlambat',
                value: todayStats.terlambat,
                color: 'text-amber-500',
            },
            {
                label: 'Izin',
                value: todayStats.izin,
                color: 'text-sky-500',
            },
            {
                label: 'Anomali',
                value: todayStats.anomali,
                color: 'text-red-500',
            },
        ],
        [todayStats],
    );

    return (
        <AppLayout>
            <Head title="Live Monitor" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="space-y-7"
                >
                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                            animate={{
                                backgroundPosition: [
                                    '0% 0%',
                                    '100% 100%',
                                    '0% 0%',
                                ],
                            }}
                            transition={{
                                duration: 16,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            style={{ backgroundSize: '200% 200%' }}
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.14),transparent_30%)]" />
                        <motion.div
                            className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
                            animate={{ scale: [1, 1.08, 1], x: [0, -10, 0] }}
                            transition={{ duration: 8, repeat: Infinity }}
                        />
                        <motion.div
                            className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
                            animate={{ scale: [1, 1.06, 1], y: [0, -8, 0] }}
                            transition={{ duration: 9, repeat: Infinity }}
                        />

                        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                            <div className="max-w-2xl">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 280,
                                            damping: 16,
                                            delay: 0.15,
                                        }}
                                        className="relative flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20"
                                    >
                                        <img
                                            src={LiveMonitorIcon}
                                            alt="Live Monitor"
                                            className="h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                        />
                                    </motion.div>
                                    <div>
                                        <p className="text-xs font-semibold tracking-wide text-indigo-100 uppercase">
                                            Monitoring Kehadiran
                                        </p>
                                        <h1 className="text-3xl font-bold">
                                            Live Monitor
                                        </h1>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm leading-relaxed text-indigo-100">
                                    Pantau absensi mahasiswa berdasarkan sesi
                                    absen, mata kuliah, dan pertemuan yang
                                    dipilih. Halaman ini sekarang fokus pada
                                    data sesi yang aktif atau sesi yang Anda
                                    pilih, bukan campuran semua kelas.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Badge className="border border-white/20 bg-white/15 px-3 py-2 text-white">
                                    <span className="mr-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                                    Live
                                </Badge>
                                <Button
                                    type="button"
                                    onClick={refreshData}
                                    disabled={isRefreshing}
                                    className="border border-white/20 bg-white/15 text-white shadow-lg shadow-black/10 hover:bg-white/25"
                                >
                                    <RefreshCw
                                        className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                                    />
                                    Muat Ulang
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/65 p-5 shadow-xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/60"
                    >
                        <div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-neutral-500 uppercase">
                            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                            <span>Filter Monitoring</span>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <FilterSelect
                                label="Mata Kuliah"
                                value={filters.course_id}
                                options={filterOptions.courses}
                                allLabel="Semua Mata Kuliah"
                                onValueChange={handleCourseChange}
                            />
                            <FilterSelect
                                label="Pertemuan"
                                value={filters.meeting_number}
                                options={filterOptions.meetings}
                                allLabel="Semua Pertemuan"
                                onValueChange={handleMeetingChange}
                            />
                            <FilterSelect
                                label="Sesi Absen"
                                value={filters.session_id}
                                options={filterOptions.sessions}
                                allLabel="Semua Sesi"
                                onValueChange={handleSessionChange}
                            />
                            <FilterSelect
                                label="Status"
                                value={filters.status}
                                options={filterOptions.statuses}
                                allLabel="Semua Status"
                                onValueChange={handleStatusChange}
                            />
                        </div>

                        {selectedSession && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm dark:border-emerald-800/40 dark:bg-emerald-900/20"
                            >
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Play className="h-4 w-4 text-emerald-600" />
                                            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                                                Sesi Dipantau
                                            </p>
                                        </div>
                                        <h2 className="mt-1 text-lg font-bold text-neutral-900 dark:text-white">
                                            {selectedSession.course_name} •
                                            Pertemuan {selectedSession.meeting_number}
                                        </h2>
                                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                                            {selectedSession.lecturer}
                                        </p>
                                    </div>
                                    <div className="text-sm text-neutral-600 dark:text-neutral-300">
                                        <p>
                                            Mulai: {selectedSession.start_at ?? '-'}
                                        </p>
                                        <p>
                                            Selesai: {selectedSession.end_at ?? '-'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
                    >
                        <StatCard
                            imageIcon={SesiAktifIcon}
                            label="Sesi Aktif"
                            value={stats.activeSessions}
                        />
                        <StatCard
                            imageIcon={ScanIcon}
                            label="Total Scan"
                            value={stats.totalScans}
                        />
                        <StatCard
                            imageIcon={HadirIcon}
                            label="Mahasiswa Aktif"
                            value={stats.activeStudents}
                        />
                        <StatCard
                            imageIcon={TokenDuplikatIcon}
                            label="Anomali"
                            value={stats.anomaly}
                        />
                    </motion.div>

                    <div className="grid gap-6 xl:grid-cols-3">
                        <motion.div
                            variants={itemVariants}
                            className="space-y-6 xl:col-span-2"
                        >
                            <motion.div
                                variants={cardVariants}
                                whileHover="hover"
                                className="rounded-3xl border border-white/20 bg-white/60 p-5 shadow-xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/60"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                            Aktivitas Kehadiran
                                        </h3>
                                        <p className="text-sm text-neutral-500">
                                            Mahasiswa yang masuk pada filter sesi
                                            saat ini.
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            router.visit(
                                                '/admin/live-monitor/aktivitas-terbaru',
                                            )
                                        }
                                    >
                                        Lihat Semua
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {activities.length === 0 ? (
                                        <EmptyState text="Belum ada data kehadiran pada filter yang dipilih." />
                                    ) : (
                                        activities.map((activity, index) => (
                                            <motion.div
                                                key={activity.id}
                                                initial={{ opacity: 0, x: -14 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/60 lg:flex-row lg:items-center lg:justify-between"
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <StatusDot status={activity.status} />
                                                        <p className="truncate font-semibold text-neutral-900 dark:text-white">
                                                            {activity.student_name}
                                                        </p>
                                                    </div>
                                                    <p className="mt-1 text-sm text-neutral-500">
                                                        {activity.nim} • {activity.course} •
                                                        {' '}Pertemuan {activity.meeting_number ?? '-'}
                                                    </p>
                                                    {activity.anomaly_reason && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {activity.anomaly_reason}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 self-start lg:self-center">
                                                    <span className="text-sm text-neutral-500">
                                                        {activity.time ?? '-'}
                                                    </span>
                                                    <Badge
                                                        className={statusBadgeClass(
                                                            activity.status,
                                                        )}
                                                    >
                                                        {labelForStatus(activity.status)}
                                                    </Badge>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>

                            <motion.div
                                variants={cardVariants}
                                whileHover="hover"
                                className="rounded-3xl border border-white/20 bg-white/60 p-5 shadow-xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/60"
                            >
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                        Scan Per Jam
                                    </h3>
                                    <p className="text-sm text-neutral-500">
                                        Distribusi waktu scan untuk sesi atau
                                        filter yang sedang dipilih.
                                    </p>
                                </div>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                                stroke="#94a3b8"
                                                opacity={0.15}
                                            />
                                            <XAxis
                                                dataKey="hour"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 12 }}
                                            />
                                            <Tooltip />
                                            <Bar
                                                dataKey="scans"
                                                fill="#7c3aed"
                                                radius={[8, 8, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            className="space-y-6"
                        >
                            <motion.div
                                variants={cardVariants}
                                whileHover="hover"
                                className="rounded-3xl border border-white/20 bg-white/60 p-5 shadow-xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/60"
                            >
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    Ringkasan Status
                                </h3>
                                <div className="mt-4 space-y-3">
                                    {statusSummary.map((item) => (
                                        <div
                                            key={item.label}
                                            className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white/70 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950/60"
                                        >
                                            <span className="text-sm text-neutral-500">
                                                {item.label}
                                            </span>
                                            <span className={`text-lg font-bold ${item.color}`}>
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                variants={cardVariants}
                                whileHover="hover"
                                className="rounded-3xl border border-white/20 bg-white/60 p-5 shadow-xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/60"
                            >
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    Sesi Yang Sedang Aktif
                                </h3>
                                <div className="mt-4 space-y-3">
                                    {activeSessions.length === 0 ? (
                                        <EmptyState text="Belum ada sesi aktif saat ini." />
                                    ) : (
                                        activeSessions.map((session) => (
                                            <motion.button
                                                key={session.id}
                                                type="button"
                                                whileHover={{ y: -3, scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={() =>
                                                    applyFilter({
                                                        course_id: String(
                                                            session.course_id,
                                                        ),
                                                        meeting_number: String(
                                                            session.meeting_number,
                                                        ),
                                                        session_id: String(
                                                            session.id,
                                                        ),
                                                    })
                                                }
                                                className="w-full rounded-2xl border border-neutral-200 bg-white/70 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/70 dark:border-neutral-800 dark:bg-neutral-950/60 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/20"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold text-neutral-900 dark:text-white">
                                                            {session.course}
                                                        </p>
                                                        <p className="mt-1 text-sm text-neutral-500">
                                                            Pertemuan {session.meeting_number}
                                                        </p>
                                                        <p className="mt-1 text-xs text-neutral-400">
                                                            {session.lecturer}
                                                        </p>
                                                    </div>
                                                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                                                        {session.present}/{session.total}
                                                    </Badge>
                                                </div>
                                            </motion.button>
                                        ))
                                    )}
                                </div>
                            </motion.div>

                            <motion.div
                                variants={cardVariants}
                                whileHover="hover"
                                className="rounded-3xl border border-white/20 bg-white/60 p-5 shadow-xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/60"
                            >
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                    Notifikasi Anomali
                                </h3>
                                <div className="mt-4 space-y-3">
                                    {anomalies.length === 0 ? (
                                        <EmptyState text="Belum ada anomali pada filter saat ini." />
                                    ) : (
                                        anomalies.map((anomaly) => (
                                            <motion.div
                                                key={anomaly.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="rounded-2xl border border-red-200 bg-red-50/80 p-4 dark:border-red-900/40 dark:bg-red-950/20"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                                    <p className="font-semibold text-red-700 dark:text-red-300">
                                                        {anomaly.type}
                                                    </p>
                                                </div>
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-200">
                                                    {anomaly.message}
                                                </p>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}

function FilterSelect({
    label,
    value,
    options,
    allLabel,
    onValueChange,
}: {
    label: string;
    value: string;
    options: FilterOption[];
    allLabel: string;
    onValueChange: (value: string) => void;
}) {
    return (
        <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50/90 p-3 dark:border-neutral-800 dark:bg-neutral-950/40">
            <p className="mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                {label}
            </p>
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger className="w-full border-white/40 bg-white/90 dark:border-neutral-700 dark:bg-neutral-900">
                    <SelectValue placeholder={allLabel} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{allLabel}</SelectItem>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

function StatCard({
    imageIcon,
    label,
    value,
}: {
    imageIcon?: string;
    label: string;
    value: number;
}) {
    return (
        <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-5 shadow-xl backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-900/60"
        >
            <div className="flex items-center gap-4">
                {imageIcon ? (
                    <img
                        src={imageIcon}
                        alt={label}
                        className="h-14 w-14 shrink-0 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
                    />
                ) : null}
                <div>
                    <p className="text-sm text-neutral-500">{label}</p>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                        {value}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/80 p-6 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-400">
            {text}
        </div>
    );
}

function StatusDot({ status }: { status: ActivityItem['status'] }) {
    const classes =
        status === 'hadir'
            ? 'bg-emerald-500'
            : status === 'terlambat'
              ? 'bg-amber-500'
              : status === 'izin'
                ? 'bg-sky-500'
                : 'bg-red-500';

    return <span className={`inline-flex h-2.5 w-2.5 rounded-full ${classes}`} />;
}

function labelForStatus(status: ActivityItem['status']) {
    return status === 'hadir'
        ? 'Hadir'
        : status === 'terlambat'
          ? 'Terlambat'
          : status === 'izin'
            ? 'Izin'
            : 'Anomali';
}

function statusBadgeClass(status: ActivityItem['status']) {
    return status === 'hadir'
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
        : status === 'terlambat'
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
          : status === 'izin'
            ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300'
            : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
}
