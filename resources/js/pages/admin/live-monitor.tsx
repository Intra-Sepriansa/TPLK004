import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Echo from '@/echo';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity as ActivityIcon,
    AlertTriangle,
    BarChart3,
    Bell,
    BookOpen,
    CheckCircle,
    ChevronRight,
    Clock,
    Download,
    Eye,
    GraduationCap,
    Info,
    MapPin,
    Radio,
    RefreshCw,
    Smartphone,
    Sparkles,
    User,
    Users,
    Volume2,
    VolumeX,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { toast } from 'sonner';

import HadirIcon from '@/assets/admin/live-monitor/hadir-icon.png';
import LiveMonitorIcon from '@/assets/admin/live-monitor/live-monitor-icon.png';
import ScanIcon from '@/assets/admin/live-monitor/scan-icon.png';
import SesiAktifIcon from '@/assets/admin/live-monitor/sesi-aktif-icon.png';

type Activity = {
    id: number;
    student_name: string;
    nim: string;
    session_name: string;
    course: string;
    time: string;
    status: 'hadir' | 'terlambat' | 'izin' | 'anomali';
    distance: number;
    device?: string;
    anomaly_reason?: string;
    isNew?: boolean;
};

type Session = {
    id: number;
    course: string;
    class: string;
    lecturer: string;
    present: number;
    total: number;
    timeLeft: string;
};

type Anomaly = {
    id: number;
    type: string;
    message: string;
};

interface PageProps {
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
    initialRecentActivities: Activity[];
    initialActiveSessions: Session[];
    initialTodayStats: {
        hadir: number;
        terlambat: number;
        izin: number;
        anomali: number;
    };
    initialAnomalies: Anomaly[];
    initialChartData: any[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
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
            stiffness: 300,
            damping: 24,
        },
    },
} as const;

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
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
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 10,
        },
    },
} as const;

export default function LiveMonitor({
    initialStats,
    initialRecentActivities = [],
    initialActiveSessions = [],
    initialTodayStats,
    initialAnomalies = [],
    initialChartData = [],
}: PageProps) {
    const [stats, setStats] = useState(
        initialStats || {
            activeSessions: 0,
            totalScans: 0,
            activeStudents: 0,
            present: 0,
            late: 0,
            anomaly: 0,
            scanRate: 0,
            presentRate: 0,
            lateRate: 0,
        },
    );
    const [todayStats, setTodayStats] = useState(
        initialTodayStats || {
            hadir: 0,
            terlambat: 0,
            izin: 0,
            anomali: 0,
        },
    );
    const [activeSessions, setActiveSessions] = useState<Session[]>(
        initialActiveSessions,
    );
    const [recentActivities, setRecentActivities] = useState<Activity[]>(
        initialRecentActivities,
    );
    const [anomalies, setAnomalies] = useState<Anomaly[]>(initialAnomalies);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
        null,
    );
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [chartType, setChartType] = useState('hourly');
    const [chartData, setChartData] = useState(initialChartData);
    const activityListUrl = '/admin/live-monitor/aktivitas-terbaru';

    const playNotificationSound = () => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext ||
                (window as any).webkitAudioContext)();
            // Pleasant two-tone chime: C5 → E5
            const playTone = (
                freq: number,
                startTime: number,
                duration: number,
            ) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(
                    0.001,
                    startTime + duration,
                );
                osc.start(startTime);
                osc.stop(startTime + duration);
            };
            playTone(523.25, ctx.currentTime, 0.15); // C5
            playTone(659.25, ctx.currentTime + 0.12, 0.2); // E5
            setTimeout(() => ctx.close(), 500);
        } catch (e) {
            /* audio not supported */
        }
    };

    const playAlertSound = () => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext ||
                (window as any).webkitAudioContext)();
            // Urgent three-tone descending alert: A5 → F5 → D5
            const playTone = (
                freq: number,
                startTime: number,
                duration: number,
            ) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.4, startTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(
                    0.001,
                    startTime + duration,
                );
                osc.start(startTime);
                osc.stop(startTime + duration);
            };
            playTone(880, ctx.currentTime, 0.15); // A5
            playTone(698.46, ctx.currentTime + 0.12, 0.15); // F5
            playTone(587.33, ctx.currentTime + 0.24, 0.25); // D5
            setTimeout(() => ctx.close(), 600);
        } catch (e) {
            /* audio not supported */
        }
    };

    const updateStats = () => {
        // Mock update logic
    };

    const refreshData = async () => {
        try {
            const response = await fetch('/admin/live-monitor/refresh');
            if (response.ok) {
                const data = await response.json();
                setStats(data.initialStats);
                setRecentActivities(data.initialRecentActivities);
                setActiveSessions(data.initialActiveSessions);
                setAnomalies(data.initialAnomalies);
                setTodayStats(data.initialTodayStats);
                setChartData(data.initialChartData);
                toast.success('Data berhasil diperbarui', {
                    position: 'bottom-right',
                });
            }
        } catch (error) {
            toast.error('Gagal memperbarui data');
        }
    };

    const handleExportToday = async () => {
        try {
            toast.loading('Menyiapkan export...', { id: 'export' });
            window.location.href = '/admin/live-monitor/export-today';
            toast.success('File akan didownload', { id: 'export' });
        } catch (error) {
            toast.error('Gagal mengexport data', { id: 'export' });
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
        }, 30000); // 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        try {
            if (typeof window === 'undefined' || !Echo) return;

            const channel = Echo.channel('live-monitor');

            channel.listen('.new-activity', (data: Activity) => {
                setRecentActivities((prev) =>
                    [{ ...data, isNew: true }, ...prev].slice(0, 10),
                );
                updateStats();

                if (soundEnabled) {
                    playNotificationSound();
                }

                toast.success(`${data.student_name} telah absen`);

                setTimeout(() => {
                    setRecentActivities((prev) =>
                        prev.map((a) =>
                            a.id === data.id ? { ...a, isNew: false } : a,
                        ),
                    );
                }, 5000);
            });

            channel.listen('.anomaly-detected', (data: Anomaly) => {
                setAnomalies((prev) => [data, ...prev]);
                if (soundEnabled) {
                    playAlertSound();
                }
                toast.error(`Anomali terdeteksi: ${data.type}`);
            });

            channel.listen('.session-updated', (data: Session) => {
                setActiveSessions((prev) =>
                    prev.map((s) => (s.id === data.id ? data : s)),
                );
            });

            return () => {
                Echo.leave('live-monitor');
            };
        } catch (e) {
            console.error('Echo setup failed', e);
        }
    }, [soundEnabled]);

    const quickActionBtnClass =
        'w-full justify-start border border-neutral-300/70 bg-white text-xs font-semibold text-neutral-900 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-100 disabled:text-neutral-500 disabled:bg-neutral-100 dark:disabled:bg-neutral-800/80 dark:disabled:text-neutral-400';

    return (
        <AppLayout>
            <Head title="Live Monitor Dashboard" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* 1. HEADER SECTION */}
                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-2xl p-6 text-white shadow-2xl"
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
                                duration: 15,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                            style={{ backgroundSize: '200% 200%' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

                        
                        <div className="relative">
                            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start sm:gap-4">
                                <div className="text-center sm:text-left">
                                    <div className="mb-2 flex flex-col items-center gap-4 sm:flex-row sm:gap-3">
                                        <motion.div
                                            className="relative flex h-16 w-16 shrink-0 items-center justify-center sm:h-20 sm:w-20"
                                            initial={{
                                                opacity: 0,
                                                scale: 0.5,
                                                rotate: -10,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                rotate: 0,
                                            }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 300,
                                                damping: 15,
                                                delay: 0.2,
                                            }}
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 10,
                                            }}
                                        >
                                            <img
                                                src={LiveMonitorIcon}
                                                alt="Live Monitor"
                                                className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                            />
                                        </motion.div>
                                        <div className="mt-1 flex-1 sm:mt-0">
                                            <motion.p
                                                className="text-xs font-medium tracking-wide text-indigo-100 uppercase sm:text-sm"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                Real-time Monitoring
                                            </motion.p>
                                            <motion.h1
                                                className="text-2xl leading-tight font-bold text-white drop-shadow-md sm:text-4xl"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                Live Monitor
                                            </motion.h1>
                                        </div>
                                    </div>
                                    <motion.p
                                        className="mt-3 max-w-lg text-xs leading-relaxed text-indigo-100 sm:mt-1 sm:text-sm"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Dashboard monitoring aktivitas absensi
                                        secara real-time dengan deteksi anomali.
                                    </motion.p>
                                </div>

                                {/* Live Status Badge */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ scale: 1.05, y: -3 }}
                                    className="group relative mt-4 flex items-center gap-3 sm:mt-0"
                                >
                                    <button
                                        onClick={() => {
                                            const next = !soundEnabled;
                                            setSoundEnabled(next);
                                            if (next) {
                                                // Play test chime when turning sound ON
                                                try {
                                                    const ctx =
                                                        new (window.AudioContext ||
                                                            (window as any)
                                                                .webkitAudioContext)();
                                                    const playTone = (
                                                        freq: number,
                                                        startTime: number,
                                                        duration: number,
                                                    ) => {
                                                        const osc =
                                                            ctx.createOscillator();
                                                        const gain =
                                                            ctx.createGain();
                                                        osc.connect(gain);
                                                        gain.connect(
                                                            ctx.destination,
                                                        );
                                                        osc.type = 'sine';
                                                        osc.frequency.setValueAtTime(
                                                            freq,
                                                            startTime,
                                                        );
                                                        gain.gain.setValueAtTime(
                                                            0,
                                                            startTime,
                                                        );
                                                        gain.gain.linearRampToValueAtTime(
                                                            0.3,
                                                            startTime + 0.02,
                                                        );
                                                        gain.gain.exponentialRampToValueAtTime(
                                                            0.001,
                                                            startTime +
                                                                duration,
                                                        );
                                                        osc.start(startTime);
                                                        osc.stop(
                                                            startTime +
                                                                duration,
                                                        );
                                                    };
                                                    playTone(
                                                        523.25,
                                                        ctx.currentTime,
                                                        0.15,
                                                    );
                                                    playTone(
                                                        659.25,
                                                        ctx.currentTime + 0.12,
                                                        0.2,
                                                    );
                                                    setTimeout(
                                                        () => ctx.close(),
                                                        500,
                                                    );
                                                } catch (e) {
                                                    /* audio not supported */
                                                }
                                                toast.success(
                                                    'Suara notifikasi aktif 🔊',
                                                    {
                                                        position:
                                                            'bottom-right',
                                                    },
                                                );
                                            } else {
                                                toast(
                                                    'Suara notifikasi dimatikan 🔇',
                                                    {
                                                        position:
                                                            'bottom-right',
                                                    },
                                                );
                                            }
                                        }}
                                        className="rounded-full border border-white/20 bg-white/10 p-1.5 text-white backdrop-blur transition hover:bg-white/20"
                                        title={
                                            soundEnabled
                                                ? 'Nonaktifkan suara'
                                                : 'Aktifkan suara'
                                        }
                                    >
                                        {soundEnabled ? (
                                            <Volume2 className="h-4 w-4" />
                                        ) : (
                                            <VolumeX className="h-4 w-4" />
                                        )}
                                    </button>

                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 opacity-50 blur-md transition-opacity group-hover:opacity-75" />
                                        <div className="relative flex items-center gap-2 rounded-xl border border-white/30 bg-white/20 px-4 py-2 shadow-lg backdrop-blur-xl">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                }}
                                                className="h-2 w-2 rounded-full bg-green-400"
                                            />
                                            <div>
                                                <p className="mb-0.5 text-[10px] leading-none font-medium text-gray-200">
                                                    Status
                                                </p>
                                                <p className="text-lg leading-none font-black">
                                                    LIVE
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. REAL-TIME STATS (4 Cards — Dashboard Style) */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-2 gap-4 md:grid-cols-4"
                    >
                        <StatCard
                            imageIcon={SesiAktifIcon}
                            label="Sesi Aktif"
                            value={stats.activeSessions}
                            color="purple"
                        />
                        <StatCard
                            imageIcon={ScanIcon}
                            label="Scan Hari Ini"
                            value={stats.totalScans}
                            color="emerald"
                        />
                        <StatCard
                            imageIcon={HadirIcon}
                            label="Hadir"
                            value={stats.present}
                            color="blue"
                        />
                        <StatCard
                            icon={AlertTriangle}
                            label="Anomali"
                            value={stats.anomaly}
                            color="red"
                        />
                    </motion.div>

                    {/* 3. MAIN CONTENT (2-Column Layout) */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* LEFT: Aktivitas Terbaru Quick Preview (70%) */}
                        <div className="space-y-6 lg:col-span-2">
                            <motion.div
                                variants={itemVariants}
                                className="rounded-2xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                            className="h-2 w-2 rounded-full bg-green-500"
                                        />
                                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                            Aktivitas Terbaru
                                        </h2>
                                        <Badge
                                            variant="success"
                                            className="h-4 animate-pulse px-1.5 py-0 text-[10px]"
                                        >
                                            <Radio className="mr-1 h-2.5 w-2.5" />
                                            Live
                                        </Badge>
                                    </div>
                                    <Button
                                        onClick={() =>
                                            router.visit(activityListUrl)
                                        }
                                        variant="outline"
                                        size="sm"
                                        className="group h-8 border-white/20 bg-white/50 px-3 text-xs hover:bg-white/60 dark:bg-neutral-800 dark:hover:bg-neutral-700/50"
                                    >
                                        Lihat Semua
                                        <ChevronRight className="ml-1.5 h-3 w-3 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </div>

                                {/* QUICK PREVIEW CARDS (Dark Theme per user spec) */}
                                <div className="space-y-2.5">
                                    <AnimatePresence>
                                        {recentActivities
                                            .slice(0, 5)
                                            .map((activity, index) => (
                                                <motion.div
                                                    key={activity.id}
                                                    initial={{
                                                        opacity: 0,
                                                        x: -50,
                                                        scale: 0.9,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                        scale: 1,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        x: 50,
                                                        scale: 0.9,
                                                    }}
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 300,
                                                        damping: 24,
                                                        delay:
                                                            index < 5
                                                                ? index * 0.1
                                                                : 0,
                                                    }}
                                                    whileHover={{ scale: 1.02 }}
                                                    onClick={() =>
                                                        setSelectedActivity(
                                                            activity,
                                                        )
                                                    }
                                                    className={cn(
                                                        'cursor-pointer rounded-xl p-3 transition-all sm:p-4',
                                                        'border border-neutral-800 bg-neutral-900 hover:bg-neutral-800',
                                                        'hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10',
                                                        activity.isNew &&
                                                            'animate-pulse border-transparent ring-1 ring-green-400',
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <motion.div
                                                                animate={{
                                                                    scale: [
                                                                        1, 1.1,
                                                                        1,
                                                                    ],
                                                                }}
                                                                transition={{
                                                                    duration: 0.5,
                                                                }}
                                                                className={cn(
                                                                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-md',
                                                                    activity.status ===
                                                                        'hadir' &&
                                                                        'bg-emerald-500',
                                                                    activity.status ===
                                                                        'terlambat' &&
                                                                        'bg-amber-500',
                                                                    activity.status ===
                                                                        'izin' &&
                                                                        'bg-blue-500',
                                                                    activity.status ===
                                                                        'anomali' &&
                                                                        'animate-pulse bg-rose-500',
                                                                )}
                                                            >
                                                                {activity.status ===
                                                                    'hadir' && (
                                                                    <CheckCircle className="h-6 w-6 text-white" />
                                                                )}
                                                                {activity.status ===
                                                                    'terlambat' && (
                                                                    <Clock className="h-6 w-6 text-white" />
                                                                )}
                                                                {activity.status ===
                                                                    'izin' && (
                                                                    <Info className="h-6 w-6 text-white" />
                                                                )}
                                                                {activity.status ===
                                                                    'anomali' && (
                                                                    <AlertTriangle className="h-6 w-6 text-white" />
                                                                )}
                                                            </motion.div>
                                                            <div>
                                                                <h3 className="mb-1 text-base leading-tight font-bold tracking-wide text-white uppercase sm:text-lg">
                                                                    {
                                                                        activity.student_name
                                                                    }
                                                                </h3>
                                                                <p className="text-sm font-medium text-neutral-400">
                                                                    {
                                                                        activity.nim
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <p className="text-xl font-black tracking-wide text-white sm:text-2xl">
                                                                {activity.time}
                                                            </p>
                                                            <Badge
                                                                variant={
                                                                    activity.status ===
                                                                    'hadir'
                                                                        ? 'success'
                                                                        : activity.status ===
                                                                            'terlambat'
                                                                          ? 'warning'
                                                                          : activity.status ===
                                                                              'izin'
                                                                            ? 'default'
                                                                            : 'destructive'
                                                                }
                                                                className="rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase sm:text-xs"
                                                            >
                                                                {
                                                                    activity.status
                                                                }
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    {activity.isNew && (
                                                        <motion.div
                                                            initial={{
                                                                opacity: 0,
                                                                y: -10,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            className="absolute -top-2 -right-2"
                                                        >
                                                            <Badge className="animate-bounce bg-green-500 text-white">
                                                                <Sparkles className="mr-1 h-3 w-3" />{' '}
                                                                Baru
                                                            </Badge>
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            ))}
                                    </AnimatePresence>

                                    {recentActivities.length === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="py-12 text-center"
                                        >
                                            <ActivityIcon className="mx-auto mb-4 h-16 w-16 text-neutral-300 dark:text-neutral-700" />
                                            <p className="text-neutral-500">
                                                Belum ada aktivitas hari ini
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>

                            {/* CHART SECTION */}
                            <motion.div
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                className="rounded-2xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white">
                                        <BarChart3 className="h-4 w-4 text-indigo-500" />
                                        Grafik Kehadiran Hari Ini
                                    </h2>
                                    <Select
                                        value={chartType}
                                        onValueChange={setChartType}
                                    >
                                        <SelectTrigger className="h-8 w-[140px] bg-white/50 text-xs dark:bg-neutral-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hourly">
                                                Per Jam
                                            </SelectItem>
                                            <SelectItem value="session">
                                                Per Sesi
                                            </SelectItem>
                                            <SelectItem value="status">
                                                Per Status
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="h-56">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart data={chartData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                opacity={0.2}
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey={
                                                    chartType === 'hourly'
                                                        ? 'hour'
                                                        : 'name'
                                                }
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                cursor={{
                                                    fill: 'rgba(0,0,0,0.05)',
                                                }}
                                                contentStyle={{
                                                    borderRadius: '16px',
                                                    border: 'none',
                                                    boxShadow:
                                                        '0 10px 15px -3px rgba(0,0,0,0.1)',
                                                }}
                                            />
                                            <Legend
                                                wrapperStyle={{
                                                    paddingTop: '20px',
                                                }}
                                            />
                                            {chartType === 'hourly' ? (
                                                <Bar
                                                    dataKey="scans"
                                                    fill="#6366f1"
                                                    radius={[4, 4, 0, 0]}
                                                    name="Total Scan"
                                                />
                                            ) : chartType === 'status' ? (
                                                <Bar
                                                    dataKey="total"
                                                    fill="#3b82f6"
                                                    radius={[4, 4, 0, 0]}
                                                    name="Total"
                                                />
                                            ) : (
                                                <>
                                                    <Bar
                                                        dataKey="hadir"
                                                        fill="#10b981"
                                                        radius={[4, 4, 0, 0]}
                                                        name="Hadir"
                                                    />
                                                    <Bar
                                                        dataKey="terlambat"
                                                        fill="#f59e0b"
                                                        radius={[4, 4, 0, 0]}
                                                        name="Terlambat"
                                                    />
                                                    <Bar
                                                        dataKey="izin"
                                                        fill="#3b82f6"
                                                        radius={[4, 4, 0, 0]}
                                                        name="Izin"
                                                    />
                                                </>
                                            )}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT COLUMN: Analytics & Insights */}
                        <div className="space-y-6">
                            {/* Today's Summary */}
                            <motion.div
                                variants={itemVariants}
                                className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:bg-neutral-900/40"
                            >
                                <h3 className="mb-3 text-base font-bold text-neutral-900 dark:text-white">
                                    Ringkasan Hari Ini
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Total Hadir
                                        </span>
                                        <span className="font-bold text-green-600">
                                            {todayStats.hadir}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Total Terlambat
                                        </span>
                                        <span className="font-bold text-yellow-600">
                                            {todayStats.terlambat}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Total Izin
                                        </span>
                                        <span className="font-bold text-blue-600">
                                            {todayStats.izin}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Total Anomali
                                        </span>
                                        <span className="font-bold text-red-600">
                                            {todayStats.anomali}
                                        </span>
                                    </div>
                                    <div className="mt-3 border-t border-white/20 pt-3 dark:border-white/10">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                                Tingkat Kehadiran
                                            </span>
                                            <span className="text-lg font-bold text-indigo-600">
                                                {todayStats.hadir +
                                                    todayStats.terlambat +
                                                    todayStats.izin >
                                                0
                                                    ? (
                                                          (todayStats.hadir /
                                                              (todayStats.hadir +
                                                                  todayStats.terlambat +
                                                                  todayStats.izin)) *
                                                          100
                                                      ).toFixed(1)
                                                    : 0}
                                                %
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* ACTIVE SESSIONS */}
                            <motion.div
                                variants={itemVariants}
                                className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:bg-neutral-900/40"
                            >
                                <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-white">
                                    <Radio className="h-4 w-4 animate-pulse text-blue-500" />
                                    Sesi Aktif
                                    <Badge
                                        variant="success"
                                        className="ml-auto h-4 px-1.5 py-0 text-[10px]"
                                    >
                                        {activeSessions.length}
                                    </Badge>
                                </h3>

                                <div className="scrollbar-thin max-h-[250px] space-y-2 overflow-y-auto pr-2">
                                    {activeSessions.length === 0 ? (
                                        <p className="py-4 text-center text-xs text-neutral-500">
                                            Tidak ada sesi aktif
                                        </p>
                                    ) : (
                                        activeSessions.map((session) => (
                                            <motion.div
                                                key={session.id}
                                                variants={itemVariants}
                                                whileHover={{ scale: 1.02 }}
                                                className="cursor-pointer rounded-xl border border-white/30 bg-white/50 p-3 transition-all hover:border-blue-500/50 dark:border-white/10 dark:bg-neutral-800/50"
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <h4 className="max-w-[140px] truncate text-sm font-semibold text-neutral-900 dark:text-white">
                                                        {session.course}
                                                    </h4>
                                                    <Badge
                                                        variant="success"
                                                        className="h-4 px-1.5 py-0 text-[10px]"
                                                    >
                                                        <span className="mr-1 h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />{' '}
                                                        Live
                                                    </Badge>
                                                </div>
                                                <div className="space-y-1 text-[11px] text-neutral-600 dark:text-neutral-400">
                                                    <p className="flex items-center gap-1">
                                                        <GraduationCap className="h-3 w-3" />
                                                        {session.class}
                                                    </p>
                                                    <p className="flex items-center gap-1 truncate">
                                                        <User className="h-3 w-3" />
                                                        {session.lecturer}
                                                    </p>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="h-3.5 w-3.5 text-blue-500" />
                                                        <span className="font-medium text-neutral-900 dark:text-white">
                                                            {session.present}/
                                                            {session.total}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-neutral-500">
                                                        <Clock className="h-3 w-3" />
                                                        {session.timeLeft}
                                                    </div>
                                                </div>
                                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width: `${(session.present / session.total) * 100}%`,
                                                        }}
                                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                                    />
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>

                            {/* ANOMALY ALERTS */}
                            <motion.div
                                variants={itemVariants}
                                className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:bg-neutral-900/40"
                            >
                                <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-white">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    Anomali
                                    <Badge
                                        variant="destructive"
                                        className="ml-auto h-4 px-1.5 py-0 text-[10px]"
                                    >
                                        {anomalies.length}
                                    </Badge>
                                </h3>

                                <div className="scrollbar-thin max-h-[250px] space-y-2 overflow-y-auto pr-2">
                                    {anomalies.length === 0 ? (
                                        <div className="py-6 text-center">
                                            <CheckCircle className="mx-auto mb-2 h-10 w-10 text-green-500" />
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                Zero anomalies
                                            </p>
                                        </div>
                                    ) : (
                                        anomalies.map((anomaly) => (
                                            <motion.div
                                                key={anomaly.id}
                                                variants={itemVariants}
                                                className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800/50 dark:bg-red-950/20"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                                                    <div className="flex-1">
                                                        <h4 className="text-[13px] leading-tight font-semibold text-red-900 dark:text-red-300">
                                                            {anomaly.type}
                                                        </h4>
                                                        <p className="mt-0.5 text-[11px] leading-snug text-red-700 dark:text-red-400/80">
                                                            {anomaly.message}
                                                        </p>
                                                        <div className="mt-2 flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-6 border-red-200 bg-white/50 px-2 text-[10px]"
                                                            >
                                                                <Eye className="mr-1 h-3 w-3" />{' '}
                                                                Cek
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>

                            {/* QUICK ACTIONS */}
                            <motion.div
                                variants={itemVariants}
                                className="rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:bg-neutral-900/40"
                            >
                                <h3 className="mb-3 text-base font-bold text-neutral-900 dark:text-white">
                                    Quick Actions
                                </h3>
                                <div className="space-y-2">
                                    <Button
                                        size="sm"
                                        onClick={handleExportToday}
                                        className={quickActionBtnClass}
                                        variant="outline"
                                        type="button"
                                    >
                                        <Download className="mr-2 h-3 w-3" />{' '}
                                        Export Hari Ini
                                    </Button>
                                    <Button
                                        size="sm"
                                        className={quickActionBtnClass}
                                        variant="outline"
                                        type="button"
                                    >
                                        <Bell className="mr-2 h-3 w-3" />{' '}
                                        Broadcast Notifikasi
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={refreshData}
                                        className={quickActionBtnClass}
                                        variant="outline"
                                        type="button"
                                    >
                                        <RefreshCw className="mr-2 h-3 w-3" />{' '}
                                        Sync Data
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ACTIVITY DETAIL MODAL - ULTRA ADVANCED DARK THEME */}
            {/* ─── Detail Modal (Aktivitas Terbaru) ─── */}
            <Dialog
                open={!!selectedActivity}
                onOpenChange={(open) => !open && setSelectedActivity(null)}
            >
                <DialogContent className="overflow-hidden rounded-3xl border-neutral-800 bg-neutral-900 p-0 text-white sm:max-w-md">
                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-indigo-900/50 to-transparent" />

                    <button
                        onClick={() => setSelectedActivity(null)}
                        className="absolute top-4 right-4 z-10 rounded-full bg-neutral-800/50 p-2 text-neutral-300 transition-colors hover:bg-neutral-700/80"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {selectedActivity && (
                        <div className="relative z-10 space-y-4 p-6 pt-10">
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', damping: 15 }}
                                    className="mx-auto mb-4 h-20 w-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[3px] shadow-xl"
                                >
                                    <div className="flex h-full w-full items-center justify-center rounded-xl bg-neutral-900">
                                        <User className="h-8 w-8 text-indigo-300" />
                                    </div>
                                </motion.div>
                                <h2 className="text-2xl font-bold">
                                    {selectedActivity.student_name}
                                </h2>
                                <p className="mt-1 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                                    {selectedActivity.nim}
                                </p>

                                <Badge
                                    variant={
                                        selectedActivity.status === 'hadir'
                                            ? 'success'
                                            : selectedActivity.status ===
                                                'terlambat'
                                              ? 'warning'
                                              : selectedActivity.status ===
                                                  'izin'
                                                ? 'default'
                                                : 'destructive'
                                    }
                                    className="mt-3 px-4 py-1 text-sm"
                                >
                                    {selectedActivity.status.toUpperCase()}
                                </Badge>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="transform rounded-2xl border border-neutral-700/50 bg-neutral-800/80 p-4 transition hover:-translate-y-1">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                                            <Clock className="h-6 w-6 text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="mb-0.5 text-[10px] font-semibold tracking-widest text-blue-400/80 uppercase">
                                                Waktu Scan
                                            </p>
                                            <p className="text-xl font-bold">
                                                {selectedActivity.time}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="transform rounded-2xl border border-neutral-700/50 bg-neutral-800/80 p-4 transition hover:-translate-y-1">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10">
                                            <BookOpen className="h-6 w-6 text-purple-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="mb-0.5 text-[10px] font-semibold tracking-widest text-purple-400/80 uppercase">
                                                {selectedActivity.session_name}
                                            </p>
                                            <p className="text-lg leading-tight font-bold">
                                                {selectedActivity.course}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="transform rounded-2xl border border-neutral-700/50 bg-neutral-800/80 p-4 transition hover:-translate-y-1">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                                            <MapPin className="h-6 w-6 text-emerald-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="mb-0.5 text-[10px] font-semibold tracking-widest text-emerald-400/80 uppercase">
                                                Radius GPS
                                            </p>
                                            <p className="inline-flex items-baseline gap-1 text-lg font-bold">
                                                {selectedActivity.distance}{' '}
                                                <span className="text-sm font-normal text-gray-400">
                                                    meter
                                                </span>
                                            </p>
                                            <p className="text-[10px] text-gray-500">
                                                dari titik kordinat kampus
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="transform rounded-2xl border border-neutral-700/50 bg-neutral-800/80 p-4 transition hover:-translate-y-1">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
                                            <Smartphone className="h-6 w-6 text-amber-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="mb-0.5 text-[10px] font-semibold tracking-widest text-amber-400/80 uppercase">
                                                Perangkat & Info
                                            </p>
                                            <p
                                                className="truncate text-sm font-semibold"
                                                title={
                                                    selectedActivity.device ||
                                                    'Mobile Device'
                                                }
                                            >
                                                {selectedActivity.device ||
                                                    'Mobile Device via Browser'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={() =>
                                    router.visit(
                                        `${activityListUrl}?activity=${selectedActivity.id}`,
                                    )
                                }
                                className="group mt-4 w-full rounded-2xl border border-white/10 bg-white py-6 font-bold text-neutral-900 hover:bg-neutral-200"
                            >
                                Pilihan Lanjutan Detail
                                <ChevronRight className="ml-1 h-4 w-4 opacity-50 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

/* ─── StatCard Component — Glassmorphism + Gradient Icons (Dashboard Style) ─── */
function StatCard({
    icon: Icon,
    imageIcon,
    label,
    value,
    color,
}: {
    icon?: any;
    imageIcon?: string;
    label: string;
    value: number;
    color: string;
}) {
    const [isHovered, setIsHovered] = useState(false);

    const colorConfigs: Record<string, any> = {
        emerald: {
            bg: 'bg-emerald-500',
            hoverShadow: 'group-hover:shadow-emerald-500/10',
            gradientBg:
                'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
            iconBg: 'from-emerald-400 to-teal-600 shadow-emerald-500/30',
        },
        orange: {
            bg: 'bg-amber-500',
            hoverShadow: 'group-hover:shadow-amber-500/10',
            gradientBg:
                'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
            iconBg: 'from-orange-400 to-orange-600 shadow-orange-500/30',
        },
        blue: {
            bg: 'bg-sky-500',
            hoverShadow: 'group-hover:shadow-sky-500/10',
            gradientBg:
                'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
            iconBg: 'from-sky-400 to-indigo-600 shadow-sky-500/30',
        },
        green: {
            bg: 'bg-green-500',
            hoverShadow: 'group-hover:shadow-green-500/10',
            gradientBg:
                'from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10',
            iconBg: 'from-green-400 to-emerald-600 shadow-green-500/30',
        },
        purple: {
            bg: 'bg-purple-500',
            hoverShadow: 'group-hover:shadow-purple-500/10',
            gradientBg:
                'from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10',
            iconBg: 'from-purple-400 to-violet-600 shadow-purple-500/30',
        },
        red: {
            bg: 'bg-red-500',
            hoverShadow: 'group-hover:shadow-red-500/10',
            gradientBg:
                'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10',
            iconBg: 'from-red-400 to-rose-600 shadow-red-500/30',
        },
    };
    const c = colorConfigs[color] ?? colorConfigs.blue;

    return (
        <motion.div
            variants={cardVariants}
            whileHover="hover"
            className={`group relative h-full overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 dark:bg-neutral-900/40 ${c.hoverShadow} cursor-pointer dark:border-white/5`}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileTap={{ scale: 0.95 }}
            style={{ perspective: 1000 }}
        >
            <div
                className={`absolute inset-0 bg-gradient-to-br ${c.gradientBg}`}
            />
            <motion.div
                initial={false}
                animate={{
                    scale: isHovered ? 1.5 : 1,
                    opacity: isHovered ? 0.4 : 0.2,
                }}
                transition={{ duration: 0.5 }}
                className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${c.bg} blur-3xl transition-all duration-500`}
            />
            <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                {imageIcon ? (
                    <motion.div
                        className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <img
                            src={imageIcon}
                            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                            alt={label}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br sm:h-14 sm:w-14 sm:rounded-2xl ${c.iconBg} text-white shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        {Icon && <Icon className="h-4 w-4 sm:h-6 sm:w-6" />}
                    </motion.div>
                )}
                <div>
                    <p className="text-[10px] leading-tight font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                        {label}
                    </p>
                    <div className="mt-0.5 sm:mt-1">
                        <span className="text-lg font-bold text-neutral-900 sm:text-2xl dark:text-white">
                            {value?.toLocaleString?.() ?? value}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
