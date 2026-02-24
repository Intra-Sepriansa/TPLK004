import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
    Radio, Scan, Users, CheckCircle, Clock, AlertTriangle,
    Activity as ActivityIcon, ChevronRight, Eye, X, MapPin, Smartphone,
    BookOpen, Download, Bell, Settings, RefreshCw, Volume2, VolumeX,
    BarChart3, GraduationCap, User, Info, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Pusher from 'pusher-js';

import LiveMonitorIcon from '@/assets/admin/live-monitor/live-monitor-icon.png';
import SesiAktifIcon from '@/assets/admin/live-monitor/sesi-aktif-icon.png';
import ScanIcon from '@/assets/admin/live-monitor/scan-icon.png';
import HadirIcon from '@/assets/admin/live-monitor/hadir-icon.png';
import AnomaliIcon from '@/assets/admin/live-monitor/anomali-icon.png';

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
    initialChartData = []
}: PageProps) {
    const [stats, setStats] = useState(initialStats || {
        activeSessions: 0,
        totalScans: 0,
        activeStudents: 0,
        present: 0,
        late: 0,
        anomaly: 0,
        scanRate: 0,
        presentRate: 0,
        lateRate: 0,
    });
    const [todayStats, setTodayStats] = useState(initialTodayStats || {
        hadir: 0,
        terlambat: 0,
        izin: 0,
        anomali: 0,
    });
    const [activeSessions, setActiveSessions] = useState<Session[]>(initialActiveSessions);
    const [recentActivities, setRecentActivities] = useState<Activity[]>(initialRecentActivities);
    const [anomalies, setAnomalies] = useState<Anomaly[]>(initialAnomalies);
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [chartType, setChartType] = useState('hourly');
    const [chartData, setChartData] = useState(initialChartData);

    const playNotificationSound = () => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            // Pleasant two-tone chime: C5 → E5
            const playTone = (freq: number, startTime: number, duration: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                osc.start(startTime);
                osc.stop(startTime + duration);
            };
            playTone(523.25, ctx.currentTime, 0.15);       // C5
            playTone(659.25, ctx.currentTime + 0.12, 0.2);  // E5
            setTimeout(() => ctx.close(), 500);
        } catch (e) { /* audio not supported */ }
    };

    const playAlertSound = () => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            // Urgent three-tone descending alert: A5 → F5 → D5
            const playTone = (freq: number, startTime: number, duration: number) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, startTime);
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.4, startTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                osc.start(startTime);
                osc.stop(startTime + duration);
            };
            playTone(880, ctx.currentTime, 0.15);          // A5
            playTone(698.46, ctx.currentTime + 0.12, 0.15); // F5
            playTone(587.33, ctx.currentTime + 0.24, 0.25); // D5
            setTimeout(() => ctx.close(), 600);
        } catch (e) { /* audio not supported */ }
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
                toast.success('Data berhasil diperbarui', { position: 'bottom-right' });
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
            const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
            const pusherCluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;

            if (!pusherKey) return;

            const pusher = new Pusher(pusherKey, {
                cluster: pusherCluster,
            });

            const channel = pusher.subscribe('live-monitor');

            channel.bind('new-activity', (data: Activity) => {
                setRecentActivities(prev => [{ ...data, isNew: true }, ...prev].slice(0, 10));
                updateStats();

                if (soundEnabled) {
                    playNotificationSound();
                }

                toast.success(`${data.student_name} telah absen`);

                setTimeout(() => {
                    setRecentActivities(prev =>
                        prev.map(a => a.id === data.id ? { ...a, isNew: false } : a)
                    );
                }, 5000);
            });

            channel.bind('anomaly-detected', (data: Anomaly) => {
                setAnomalies(prev => [data, ...prev]);
                if (soundEnabled) {
                    playAlertSound();
                }
                toast.error(`Anomali terdeteksi: ${data.type}`);
            });

            channel.bind('session-updated', (data: Session) => {
                setActiveSessions(prev =>
                    prev.map(s => s.id === data.id ? data : s)
                );
            });

            return () => {
                channel.unbind_all();
                channel.unsubscribe();
                pusher.disconnect();
            };
        } catch (e) {
            console.error('Pusher setup failed', e);
        }
    }, [soundEnabled]);

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
                            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            style={{ backgroundSize: '200% 200%' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

                        <motion.div
                            className="absolute right-12 top-1/2 -translate-y-1/2 h-24 w-24 rounded-full border-2 border-white/10"
                            animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                        />

                        <div className="relative">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 sm:gap-4">
                                <div className="text-center sm:text-left">
                                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-3 mb-2">
                                        <motion.div
                                            className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 relative items-center justify-center"
                                            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                                            whileHover={{ scale: 1.1, rotate: 10 }}
                                        >
                                            <img src={LiveMonitorIcon} alt="Live Monitor" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                        </motion.div>
                                        <div className="flex-1 mt-1 sm:mt-0">
                                            <motion.p
                                                className="text-xs sm:text-sm text-indigo-100 font-medium tracking-wide uppercase"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                Real-time Monitoring
                                            </motion.p>
                                            <motion.h1
                                                className="text-2xl sm:text-4xl font-bold text-white leading-tight drop-shadow-md"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                Live Monitor
                                            </motion.h1>
                                        </div>
                                    </div>
                                    <motion.p
                                        className="text-xs sm:text-sm mt-3 sm:mt-1 text-indigo-100 max-w-lg leading-relaxed"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Dashboard monitoring aktivitas absensi secara real-time dengan deteksi anomali.
                                    </motion.p>
                                </div>

                                {/* Live Status Badge */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ scale: 1.05, y: -3 }}
                                    className="relative group flex items-center gap-3 mt-4 sm:mt-0"
                                >
                                    <button
                                        onClick={() => {
                                            const next = !soundEnabled;
                                            setSoundEnabled(next);
                                            if (next) {
                                                // Play test chime when turning sound ON
                                                try {
                                                    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                                                    const playTone = (freq: number, startTime: number, duration: number) => {
                                                        const osc = ctx.createOscillator();
                                                        const gain = ctx.createGain();
                                                        osc.connect(gain);
                                                        gain.connect(ctx.destination);
                                                        osc.type = 'sine';
                                                        osc.frequency.setValueAtTime(freq, startTime);
                                                        gain.gain.setValueAtTime(0, startTime);
                                                        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
                                                        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                                                        osc.start(startTime);
                                                        osc.stop(startTime + duration);
                                                    };
                                                    playTone(523.25, ctx.currentTime, 0.15);
                                                    playTone(659.25, ctx.currentTime + 0.12, 0.2);
                                                    setTimeout(() => ctx.close(), 500);
                                                } catch (e) { /* audio not supported */ }
                                                toast.success('Suara notifikasi aktif 🔊', { position: 'bottom-right' });
                                            } else {
                                                toast('Suara notifikasi dimatikan 🔇', { position: 'bottom-right' });
                                            }
                                        }}
                                        className="rounded-full bg-white/10 p-1.5 hover:bg-white/20 transition backdrop-blur text-white border border-white/20"
                                        title={soundEnabled ? "Nonaktifkan suara" : "Aktifkan suara"}
                                    >
                                        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                    </button>

                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                                        <div className="relative flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-xl px-4 py-2 shadow-lg border border-white/30">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="h-2 w-2 rounded-full bg-green-400"
                                            />
                                            <div>
                                                <p className="text-[10px] text-gray-200 font-medium leading-none mb-0.5">Status</p>
                                                <p className="text-lg font-black leading-none">LIVE</p>
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
                        className="grid gap-4 grid-cols-2 md:grid-cols-4"
                    >
                        <StatCard imageIcon={SesiAktifIcon} label="Sesi Aktif" value={stats.activeSessions} color="purple" />
                        <StatCard imageIcon={ScanIcon} label="Scan Hari Ini" value={stats.totalScans} color="emerald" />
                        <StatCard imageIcon={HadirIcon} label="Hadir" value={stats.present} color="blue" />
                        <StatCard imageIcon={AnomaliIcon} label="Anomali" value={stats.anomaly} color="red" />
                    </motion.div>

                    {/* 3. MAIN CONTENT (2-Column Layout) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LEFT: Aktivitas Terbaru Quick Preview (70%) */}
                        <div className="lg:col-span-2 space-y-6">
                            <motion.div
                                variants={itemVariants}
                                className="rounded-2xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="h-2 w-2 rounded-full bg-green-500"
                                        />
                                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                                            Aktivitas Terbaru
                                        </h2>
                                        <Badge variant="success" className="animate-pulse px-1.5 py-0 text-[10px] h-4">
                                            <Radio className="h-2.5 w-2.5 mr-1" />
                                            Live
                                        </Badge>
                                    </div>
                                    <Button
                                        onClick={() => router.visit('/admin/aktivitas-terbaru')}
                                        variant="outline"
                                        size="sm"
                                        className="group bg-white/50 dark:bg-neutral-800 h-8 text-xs px-3 border-white/20 hover:bg-white/60 dark:hover:bg-neutral-700/50"
                                    >
                                        Lihat Semua
                                        <ChevronRight className="h-3 w-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>

                                {/* QUICK PREVIEW CARDS (Dark Theme per user spec) */}
                                <div className="space-y-2.5">
                                    <AnimatePresence>
                                        {recentActivities.slice(0, 5).map((activity, index) => (
                                            <motion.div
                                                key={activity.id}
                                                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 300,
                                                    damping: 24,
                                                    delay: index < 5 ? index * 0.1 : 0
                                                }}
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => router.visit('/admin/aktivitas-terbaru')}
                                                className={cn(
                                                    "rounded-xl p-3 sm:p-4 cursor-pointer transition-all",
                                                    "bg-neutral-900 hover:bg-neutral-800 border border-neutral-800",
                                                    "hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10",
                                                    activity.isNew && "ring-1 ring-green-400 animate-pulse border-transparent"
                                                )}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <motion.div
                                                            animate={{ scale: [1, 1.1, 1] }}
                                                            transition={{ duration: 0.5 }}
                                                            className={cn(
                                                                "h-12 w-12 rounded-full flex items-center justify-center shadow-md shrink-0",
                                                                activity.status === 'hadir' && "bg-emerald-500",
                                                                activity.status === 'terlambat' && "bg-amber-500",
                                                                activity.status === 'izin' && "bg-blue-500",
                                                                activity.status === 'anomali' && "bg-rose-500 animate-pulse"
                                                            )}
                                                        >
                                                            {activity.status === 'hadir' && <CheckCircle className="h-6 w-6 text-white" />}
                                                            {activity.status === 'terlambat' && <Clock className="h-6 w-6 text-white" />}
                                                            {activity.status === 'izin' && <Info className="h-6 w-6 text-white" />}
                                                            {activity.status === 'anomali' && <AlertTriangle className="h-6 w-6 text-white" />}
                                                        </motion.div>
                                                        <div>
                                                            <h3 className="font-bold text-base sm:text-lg text-white leading-tight mb-1 uppercase tracking-wide">{activity.student_name}</h3>
                                                            <p className="text-sm font-medium text-neutral-400">{activity.nim}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <p className="text-xl sm:text-2xl font-black text-white tracking-wide">{activity.time}</p>
                                                        <Badge
                                                            variant={
                                                                activity.status === 'hadir' ? 'success' :
                                                                    activity.status === 'terlambat' ? 'warning' :
                                                                        activity.status === 'izin' ? 'default' :
                                                                            'destructive'
                                                            }
                                                            className="text-[10px] sm:text-xs uppercase px-2 py-0.5 rounded-sm font-bold tracking-widest"
                                                        >
                                                            {activity.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                {activity.isNew && (
                                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-2 -right-2">
                                                        <Badge className="bg-green-500 text-white animate-bounce">
                                                            <Sparkles className="h-3 w-3 mr-1" /> Baru
                                                        </Badge>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {recentActivities.length === 0 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                                            <ActivityIcon className="h-16 w-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                                            <p className="text-neutral-500">Belum ada aktivitas hari ini</p>
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
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                        <BarChart3 className="h-4 w-4 text-indigo-500" />
                                        Grafik Kehadiran Hari Ini
                                    </h2>
                                    <Select value={chartType} onValueChange={setChartType}>
                                        <SelectTrigger className="w-[140px] h-8 text-xs bg-white/50 dark:bg-neutral-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hourly">Per Jam</SelectItem>
                                            <SelectItem value="session">Per Sesi</SelectItem>
                                            <SelectItem value="status">Per Status</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                                            <XAxis dataKey={chartType === 'hourly' ? 'hour' : 'name'} axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            {chartType === 'hourly' ? (
                                                <Bar dataKey="scans" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Scan" />
                                            ) : chartType === 'status' ? (
                                                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total" />
                                            ) : (
                                                <>
                                                    <Bar dataKey="hadir" fill="#10b981" radius={[4, 4, 0, 0]} name="Hadir" />
                                                    <Bar dataKey="terlambat" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Terlambat" />
                                                    <Bar dataKey="izin" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Izin" />
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
                            <motion.div variants={itemVariants} className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 backdrop-blur-xl shadow-lg">
                                <h3 className="text-base font-bold mb-3 text-neutral-900 dark:text-white">Ringkasan Hari Ini</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Hadir</span>
                                        <span className="font-bold text-green-600">{todayStats.hadir}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Terlambat</span>
                                        <span className="font-bold text-yellow-600">{todayStats.terlambat}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Izin</span>
                                        <span className="font-bold text-blue-600">{todayStats.izin}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Anomali</span>
                                        <span className="font-bold text-red-600">{todayStats.anomali}</span>
                                    </div>
                                    <div className="pt-3 border-t border-white/20 dark:border-white/10 mt-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-neutral-900 dark:text-white">Tingkat Kehadiran</span>
                                            <span className="font-bold text-lg text-indigo-600">
                                                {todayStats.hadir + todayStats.terlambat + todayStats.izin > 0
                                                    ? ((todayStats.hadir / (todayStats.hadir + todayStats.terlambat + todayStats.izin)) * 100).toFixed(1)
                                                    : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* ACTIVE SESSIONS */}
                            <motion.div variants={itemVariants} className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 backdrop-blur-xl shadow-lg">
                                <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-neutral-900 dark:text-white">
                                    <Radio className="h-4 w-4 text-blue-500 animate-pulse" />
                                    Sesi Aktif
                                    <Badge variant="success" className="ml-auto text-[10px] px-1.5 py-0 h-4">{activeSessions.length}</Badge>
                                </h3>

                                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
                                    {activeSessions.length === 0 ? (
                                        <p className="text-xs text-neutral-500 text-center py-4">Tidak ada sesi aktif</p>
                                    ) : (
                                        activeSessions.map(session => (
                                            <motion.div key={session.id} variants={itemVariants} whileHover={{ scale: 1.02 }} className="rounded-xl border border-white/30 dark:border-white/10 p-3 cursor-pointer hover:border-blue-500/50 transition-all bg-white/50 dark:bg-neutral-800/50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold text-sm text-neutral-900 dark:text-white truncate max-w-[140px]">{session.course}</h4>
                                                    <Badge variant="success" className="text-[10px] px-1.5 py-0 h-4">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse mr-1" /> Live
                                                    </Badge>
                                                </div>
                                                <div className="text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1">
                                                    <p className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{session.class}</p>
                                                    <p className="flex items-center gap-1 truncate"><User className="h-3 w-3" />{session.lecturer}</p>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="h-3.5 w-3.5 text-blue-500" />
                                                        <span className="font-medium text-neutral-900 dark:text-white">{session.present}/{session.total}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-neutral-500"><Clock className="h-3 w-3" />{session.timeLeft}</div>
                                                </div>
                                                <div className="mt-2 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${(session.present / session.total) * 100}%` }} className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" />
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>

                            {/* ANOMALY ALERTS */}
                            <motion.div variants={itemVariants} className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 backdrop-blur-xl shadow-lg">
                                <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-neutral-900 dark:text-white">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    Anomali
                                    <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0 h-4">{anomalies.length}</Badge>
                                </h3>

                                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
                                    {anomalies.length === 0 ? (
                                        <div className="text-center py-6">
                                            <CheckCircle className="h-10 w-10 mx-auto text-green-500 mb-2" />
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Zero anomalies</p>
                                        </div>
                                    ) : (
                                        anomalies.map(anomaly => (
                                            <motion.div key={anomaly.id} variants={itemVariants} className="rounded-xl border border-red-200 dark:border-red-800/50 p-3 bg-red-50 dark:bg-red-950/20">
                                                <div className="flex items-start gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-[13px] leading-tight text-red-900 dark:text-red-300">{anomaly.type}</h4>
                                                        <p className="text-[11px] text-red-700 dark:text-red-400/80 mt-0.5 leading-snug">{anomaly.message}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] bg-white/50 border-red-200">
                                                                <Eye className="h-3 w-3 mr-1" /> Cek
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
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
                            <motion.div variants={itemVariants} className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 backdrop-blur-xl shadow-lg">
                                <h3 className="text-base font-bold mb-3 text-neutral-900 dark:text-white">Quick Actions</h3>
                                <div className="space-y-2">
                                    <Button size="sm" onClick={handleExportToday} className="w-full justify-start bg-white/80 hover:bg-white text-neutral-800 border border-white/50 text-xs" variant="outline">
                                        <Download className="h-3 w-3 mr-2" /> Export Hari Ini
                                    </Button>
                                    <Button size="sm" className="w-full justify-start bg-white/80 hover:bg-white text-neutral-800 border border-white/50 text-xs" variant="outline">
                                        <Bell className="h-3 w-3 mr-2" /> Broadcast Notifikasi
                                    </Button>
                                    <Button size="sm" onClick={refreshData} className="w-full justify-start bg-white/80 hover:bg-white text-neutral-800 border border-white/50 text-xs" variant="outline">
                                        <RefreshCw className="h-3 w-3 mr-2" /> Sync Data
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ACTIVITY DETAIL MODAL - ULTRA ADVANCED DARK THEME */}
            {/* ─── Detail Modal (Aktivitas Terbaru) ─── */}
            <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
                <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800 text-white p-0 overflow-hidden rounded-3xl">
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-900/50 to-transparent" />

                    <button onClick={() => setSelectedActivity(null)} className="absolute right-4 top-4 rounded-full p-2 bg-neutral-800/50 hover:bg-neutral-700/80 transition-colors z-10 text-neutral-300">
                        <X className="h-5 w-5" />
                    </button>

                    {selectedActivity && (
                        <div className="space-y-4 pt-10 p-6 relative z-10">
                            <div className="text-center">
                                <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 15 }} className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[3px] shadow-xl mb-4">
                                    <div className="h-full w-full bg-neutral-900 rounded-xl flex items-center justify-center">
                                        <User className="h-8 w-8 text-indigo-300" />
                                    </div>
                                </motion.div>
                                <h2 className="text-2xl font-bold">{selectedActivity.student_name}</h2>
                                <p className="text-gray-400 mt-1 uppercase tracking-widest text-xs font-semibold">{selectedActivity.nim}</p>

                                <Badge variant={
                                    selectedActivity.status === 'hadir' ? 'success' :
                                        selectedActivity.status === 'terlambat' ? 'warning' :
                                            selectedActivity.status === 'izin' ? 'default' : 'destructive'
                                }
                                    className="mt-3 text-sm px-4 py-1"
                                >
                                    {selectedActivity.status.toUpperCase()}
                                </Badge>
                            </div>

                            <div className="space-y-3 mt-6">
                                <div className="rounded-2xl bg-neutral-800/80 border border-neutral-700/50 p-4 transform transition hover:-translate-y-1">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                            <Clock className="h-6 w-6 text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-blue-400/80 font-semibold uppercase tracking-widest mb-0.5">Waktu Scan</p>
                                            <p className="text-xl font-bold">{selectedActivity.time}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-neutral-800/80 border border-neutral-700/50 p-4 transform transition hover:-translate-y-1">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                                            <BookOpen className="h-6 w-6 text-purple-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-purple-400/80 font-semibold uppercase tracking-widest mb-0.5">{selectedActivity.session_name}</p>
                                            <p className="text-lg font-bold leading-tight">{selectedActivity.course}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-neutral-800/80 border border-neutral-700/50 p-4 transform transition hover:-translate-y-1">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                            <MapPin className="h-6 w-6 text-emerald-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-emerald-400/80 font-semibold uppercase tracking-widest mb-0.5">Radius GPS</p>
                                            <p className="text-lg font-bold inline-flex items-baseline gap-1">
                                                {selectedActivity.distance} <span className="text-sm font-normal text-gray-400">meter</span>
                                            </p>
                                            <p className="text-[10px] text-gray-500">dari titik kordinat kampus</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-neutral-800/80 border border-neutral-700/50 p-4 transform transition hover:-translate-y-1">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                            <Smartphone className="h-6 w-6 text-amber-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-amber-400/80 font-semibold uppercase tracking-widest mb-0.5">Perangkat & Info</p>
                                            <p className="text-sm font-semibold truncate" title={selectedActivity.device || 'Mobile Device'}>{selectedActivity.device || 'Mobile Device via Browser'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={() => router.visit(`/admin/aktivitas-terbaru?activity=${selectedActivity.id}`)} className="w-full bg-white text-neutral-900 hover:bg-neutral-200 font-bold py-6 rounded-2xl mt-4 border border-white/10 group">
                                Pilihan Lanjutan Detail
                                <ChevronRight className="h-4 w-4 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}

/* ─── StatCard Component — Glassmorphism + Gradient Icons (Dashboard Style) ─── */
function StatCard({ icon: Icon, imageIcon, label, value, color }: { icon?: any; imageIcon?: string; label: string; value: number; color: string }) {
    const [isHovered, setIsHovered] = useState(false);

    const colorConfigs: Record<string, any> = {
        emerald: { bg: 'bg-emerald-500', hoverShadow: 'group-hover:shadow-emerald-500/10', gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10', iconBg: 'from-emerald-400 to-teal-600 shadow-emerald-500/30' },
        orange: { bg: 'bg-amber-500', hoverShadow: 'group-hover:shadow-amber-500/10', gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10', iconBg: 'from-orange-400 to-orange-600 shadow-orange-500/30' },
        blue: { bg: 'bg-sky-500', hoverShadow: 'group-hover:shadow-sky-500/10', gradientBg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10', iconBg: 'from-sky-400 to-indigo-600 shadow-sky-500/30' },
        green: { bg: 'bg-green-500', hoverShadow: 'group-hover:shadow-green-500/10', gradientBg: 'from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10', iconBg: 'from-green-400 to-emerald-600 shadow-green-500/30' },
        purple: { bg: 'bg-purple-500', hoverShadow: 'group-hover:shadow-purple-500/10', gradientBg: 'from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10', iconBg: 'from-purple-400 to-violet-600 shadow-purple-500/30' },
        red: { bg: 'bg-red-500', hoverShadow: 'group-hover:shadow-red-500/10', gradientBg: 'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10', iconBg: 'from-red-400 to-rose-600 shadow-red-500/30' },
    };
    const c = colorConfigs[color] ?? colorConfigs.blue;

    return (
        <motion.div
            variants={cardVariants}
            whileHover="hover"
            className={`group h-full relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl transition-all ${c.hoverShadow} dark:border-white/5 cursor-pointer`}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileTap={{ scale: 0.95 }}
            style={{ perspective: 1000 }}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${c.gradientBg}`} />
            <motion.div
                initial={false}
                animate={{ scale: isHovered ? 1.5 : 1, opacity: isHovered ? 0.4 : 0.2 }}
                transition={{ duration: 0.5 }}
                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${c.bg} blur-3xl transition-all duration-500`}
            />
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4">
                {imageIcon ? (
                    <motion.div
                        className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <img src={imageIcon} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" alt={label} />
                    </motion.div>
                ) : (
                    <motion.div
                        className={`relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${c.iconBg} text-white shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        {Icon && <Icon className="h-4 w-4 sm:h-6 sm:w-6" />}
                    </motion.div>
                )}
                <div>
                    <p className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-neutral-400">
                        {label}
                    </p>
                    <div className="mt-0.5 sm:mt-1">
                        <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                            {value?.toLocaleString?.() ?? value}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
