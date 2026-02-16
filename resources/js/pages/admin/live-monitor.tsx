import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Radar, RefreshCw, Users, Clock, CheckCircle, XCircle, Timer, Activity, Play, AlertTriangle, TrendingUp, Zap, ArrowRight, Target } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for classes
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Log {
    id: number;
    name: string;
    nim: string;
    time: string;
    status: string;
    distance_m: number | null;
    selfie_status: string | null;
    device_info: string | null;
    course: string;
}

interface TodayStats {
    total_scans: number;
    present: number;
    late: number;
    rejected: number;
}

interface SessionStats {
    total: number;
    present: number;
    late: number;
    rejected: number;
    pending_selfie: number;
}

interface HourlyData {
    hour: string;
    scans: number;
}

interface StatusDist {
    status: string;
    total: number;
}

interface RecentSession {
    id: number;
    course_name: string;
    meeting_number: number;
    is_active: boolean;
    total_attendance: number;
}

interface ActiveSession {
    id: number;
    title: string | null;
    meeting_number: number;
    course: { nama: string } | null;
    start_at: string | null;
    end_at: string | null;
}

interface PageProps {
    activeSession: ActiveSession | null;
    recentLogs: Log[];
    todayStats: TodayStats;
    sessionStats: SessionStats | null;
    hourlyData: HourlyData[];
    statusDistribution: StatusDist[];
    recentSessions: RecentSession[];
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1']; // Emerald, Amber, Red, Indigo
const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    present: { label: 'Hadir', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle },
    late: { label: 'Terlambat', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock },
    rejected: { label: 'Ditolak', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle },
};

// Animation Variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

const headerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: -20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 200,
            damping: 25,
        },
    },
};

const pulseVariants: Variants = {
    initial: { scale: 1, opacity: 1 },
    animate: {
        scale: [1, 1.1, 1],
        opacity: [1, 0.8, 1],
        boxShadow: [
            '0 0 0 0 rgba(16, 185, 129, 0)',
            '0 0 0 10px rgba(16, 185, 129, 0.2)',
            '0 0 0 0 rgba(16, 185, 129, 0)',
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

export default function LiveMonitor({ activeSession, recentLogs: initialLogs, todayStats, sessionStats, hourlyData, statusDistribution, recentSessions }: PageProps) {
    const [logs, setLogs] = useState<Log[]>(initialLogs);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const fetchLogs = useCallback(async () => {
        const query = activeSession?.id ? `?session_id=${activeSession.id}` : '';
        try {
            const res = await fetch(`/admin/live-monitor/logs${query}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs || []);
                setLastUpdate(new Date());
            }
        } catch { }
    }, [activeSession?.id]);

    useEffect(() => {
        const interval = window.setInterval(fetchLogs, 5000);
        return () => window.clearInterval(interval);
    }, [fetchLogs]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchLogs();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const pieData = statusDistribution.map(s => ({ name: statusConfig[s.status]?.label || s.status, value: s.total }));

    return (
        <AppLayout>
            <Head title="Live Monitor" />
            <motion.div
                className="p-6 space-y-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* ─── Hero Header ─── */}
                <motion.div
                    variants={headerVariants}
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

                    {/* Pulsating Rings */}
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
                    />

                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <motion.div
                                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <Radar className="h-8 w-8 text-white" />
                            </motion.div>
                            <div>
                                <motion.p
                                    className="text-sm text-indigo-100 font-medium tracking-wide uppercase"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Real-time Monitoring
                                </motion.p>
                                <motion.h1
                                    className="text-3xl font-bold text-white tracking-tight"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Live Monitor
                                </motion.h1>
                                <motion.p
                                    className="mt-1 text-indigo-100 text-sm opacity-90"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    Memantau aktivitas absensi mahasiswa secara langsung.
                                </motion.p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-indigo-200">Terakhir diperbarui</p>
                                <p className="font-mono text-lg font-bold text-white tracking-wider">{lastUpdate.toLocaleTimeString('id-ID')}</p>
                            </div>
                            <motion.button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="group relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-all backdrop-blur-xl border border-white/30 shadow-lg overflow-hidden"
                                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.3)" }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <motion.div
                                    animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                                    transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                                >
                                    <RefreshCw className={cn("h-5 w-5 text-white")} />
                                </motion.div>
                                {isRefreshing && (
                                    <motion.div
                                        className="absolute inset-0 bg-white/20"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 2, opacity: 0 }}
                                        transition={{ duration: 0.6 }}
                                    />
                                )}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* ─── Active Session Banner ─── */}
                <AnimatePresence>
                    {activeSession && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 p-6 backdrop-blur-xl shadow-lg"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent" />
                            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-lg shadow-emerald-500/30"
                                        variants={pulseVariants}
                                        initial="initial"
                                        animate="animate"
                                    >
                                        <Play className="h-6 w-6 fill-current" />
                                    </motion.div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                            </span>
                                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Sedang Berlangsung</p>
                                        </div>
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">
                                            {activeSession.course?.nama ?? 'Tanpa Mata Kuliah'}
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Pertemuan #{activeSession.meeting_number}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/40 dark:bg-neutral-900/40 px-4 py-2 rounded-2xl border border-white/20 dark:border-white/5 backdrop-blur-sm">
                                    <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <div className="text-right">
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Jadwal Sesi</p>
                                        <p className="font-mono text-lg font-bold text-neutral-900 dark:text-white">
                                            {activeSession.start_at} - {activeSession.end_at}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ─── Stats Grid ─── */}
                <motion.div
                    className="grid gap-4 md:grid-cols-4"
                    variants={containerVariants}
                >
                    <StatCard icon={Users} label="Total Scan" value={todayStats.total_scans} color="blue" delay={0.1} />
                    <StatCard icon={CheckCircle} label="Hadir" value={todayStats.present} color="emerald" delay={0.2} />
                    <StatCard icon={Clock} label="Terlambat" value={todayStats.late} color="amber" delay={0.3} />
                    <StatCard icon={XCircle} label="Ditolak" value={todayStats.rejected} color="red" delay={0.4} />
                </motion.div>

                {/* ─── Session Stats Cards ─── */}
                <AnimatePresence>
                    {sessionStats && (
                        <motion.div
                            className="grid gap-4 md:grid-cols-5"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            variants={containerVariants}
                        >
                            <SessionStatCard label="Sesi: Total" value={sessionStats.total} color="neutral" icon={Users} />
                            <SessionStatCard label="Sesi: Hadir" value={sessionStats.present} color="emerald" icon={CheckCircle} />
                            <SessionStatCard label="Sesi: Terlambat" value={sessionStats.late} color="amber" icon={Clock} />
                            <SessionStatCard label="Sesi: Ditolak" value={sessionStats.rejected} color="red" icon={XCircle} />
                            <SessionStatCard label="Selfie Pending" value={sessionStats.pending_selfie} color="purple" icon={Target} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ─── Charts Grid ─── */}
                <motion.div
                    className="grid gap-6 lg:grid-cols-2"
                    variants={containerVariants}
                >
                    <ChartCard title="Aktivitas Scan per Jam" icon={TrendingUp} gradient="from-cyan-400 to-blue-600">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                                <XAxis
                                    dataKey="hour"
                                    tick={{ fontSize: 11, fill: '#6b7280' }}
                                    stroke="#e5e7eb"
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: '#6b7280' }}
                                    stroke="#e5e7eb"
                                    axisLine={false}
                                    tickLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255,255,255,0.9)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                                />
                                <Bar dataKey="scans" radius={[6, 6, 0, 0]} barSize={32}>
                                    {hourlyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#barGradient-${index})`} />
                                    ))}
                                </Bar>
                                <defs>
                                    {hourlyData.map((entry, index) => (
                                        <linearGradient key={`barGradient-${index}`} id={`barGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8} />
                                        </linearGradient>
                                    ))}
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Distribusi Status" icon={Activity} gradient="from-violet-400 to-purple-600">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ percent }: { percent?: number }) => `${((percent || 0) * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255,255,255,0.9)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* ─── Recent Logs ─── */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden h-full"
                    >
                        <div className="p-6 border-b border-white/10 dark:border-white/5 bg-gradient-to-r from-white/30 to-white/10 dark:from-white/5 dark:to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                                    <Radar className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Aktivitas Terbaru</h2>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[500px] p-4 space-y-3">
                            <AnimatePresence mode="popLayout">
                                {logs.length === 0 ? (
                                    <motion.div
                                        className="p-16 text-center"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 mb-4">
                                            <Radar className="h-10 w-10 text-neutral-400" />
                                        </div>
                                        <p className="text-neutral-500 dark:text-neutral-400 text-lg">Belum ada scan masuk</p>
                                    </motion.div>
                                ) : logs.map((log, index) => {
                                    const cfg = statusConfig[log.status] || { label: log.status, color: 'text-neutral-600 dark:text-neutral-400', bg: 'bg-neutral-100 dark:bg-neutral-800', icon: AlertTriangle };
                                    const Icon = cfg.icon;
                                    return (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="group relative flex items-center justify-between p-4 rounded-2xl bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-all group-hover:scale-110 group-hover:rotate-6", cfg.bg, cfg.color)}>
                                                    <Icon className="h-7 w-7" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-lg text-neutral-900 dark:text-white leading-tight mb-1">{log.name}</p>
                                                    <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                                        <span className="font-mono bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded text-xs">{log.nim}</span>
                                                        <span>•</span>
                                                        <span className="truncate max-w-[150px]">{log.course}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">{log.time}</p>
                                                <div className="flex items-center gap-2 justify-end mt-2">
                                                    {log.distance_m !== null && (
                                                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
                                                            {log.distance_m}m
                                                        </span>
                                                    )}
                                                    <span className={cn("text-xs font-bold px-2 py-1 rounded-lg border shadow-sm", cfg.bg, cfg.color, cfg.bg.replace('bg-', 'border-'))}>
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* ─── Recent Sessions ─── */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden h-full"
                    >
                        <div className="p-6 border-b border-white/10 dark:border-white/5 bg-gradient-to-r from-white/30 to-white/10 dark:from-white/5 dark:to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                                    <Timer className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Sesi Terbaru</h2>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {recentSessions.map((s, index) => (
                                <motion.div
                                    key={s.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group flex items-center justify-between p-4 rounded-2xl bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 hover:bg-white dark:hover:bg-neutral-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-all group-hover:scale-110 group-hover:rotate-6",
                                            s.is_active
                                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                                : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700'
                                        )}>
                                            {s.is_active ? <Play className="h-7 w-7 fill-current" /> : <Clock className="h-7 w-7" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                                                {s.course_name}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-md bg-neutral-200/50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-700">
                                                    Pertemuan #{s.meeting_number}
                                                </span>
                                                {s.is_active && (
                                                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 animate-pulse">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                        LIVE
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-neutral-900 dark:text-white leading-none">{s.total_attendance}</p>
                                        <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 mt-1 uppercase tracking-wide">kehadiran</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </AppLayout>
    );
}

// ─── Reusable Components ───

function StatCard({ icon: Icon, label, value, color, delay = 0 }: { icon: any; label: string; value: number; color: string; delay?: number }) {
    const gradients: Record<string, { from: string; to: string; shadow: string; bg: string }> = {
        blue: { from: 'from-sky-400', to: 'to-indigo-600', shadow: 'shadow-sky-500/30', bg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10' },
        emerald: { from: 'from-emerald-400', to: 'to-teal-600', shadow: 'shadow-emerald-500/30', bg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10' },
        amber: { from: 'from-amber-400', to: 'to-orange-600', shadow: 'shadow-amber-500/30', bg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10' },
        red: { from: 'from-red-400', to: 'to-rose-600', shadow: 'shadow-red-500/30', bg: 'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10' },
    };
    const g = gradients[color] ?? gradients.blue;

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { delay, duration: 0.5 } }
            }}
            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 cursor-default transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${g.bg}`} />
            <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${g.from} ${g.to} opacity-10 blur-2xl transition-all duration-500 group-hover:opacity-20 group-hover:scale-150`} />

            <div className="relative flex items-center gap-3">
                <motion.div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${g.from} ${g.to} text-white shadow-lg ${g.shadow}`}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                    <Icon className="h-6 w-6" />
                </motion.div>
                <div>
                    <motion.p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium tracking-wide">{label}</motion.p>
                    <motion.p className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">{value}</motion.p>
                </div>
            </div>
        </motion.div>
    );
}

function SessionStatCard({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: any }) {
    const colors: Record<string, string> = {
        neutral: 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800',
        emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
        amber: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
        red: 'text-red-600 dark:text-red-400 bg-red-500/10',
        purple: 'text-purple-600 dark:text-purple-400 bg-purple-500/10'
    };

    // Parse color config
    const colorClass = colors[color] || colors.neutral;
    const [textColor, bgColor] = colorClass.split(' bg-');
    const finalBgColor = `bg-${bgColor}`;

    return (
        <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-lg backdrop-blur-xl dark:border-white/5 hover:bg-white/60 dark:hover:bg-neutral-800/60 transition-colors"
            whileHover={{ scale: 1.05 }}
        >
            <div className={cn("p-2 rounded-lg mb-2", finalBgColor)}>
                <Icon className={cn("h-5 w-5", textColor)} />
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mb-1">{label.replace('Sesi: ', '')}</p>
            <p className={cn("text-xl font-bold", textColor)}>
                {value}
            </p>
        </motion.div>
    );
}

function ChartCard({ title, icon: Icon, children, gradient }: { title: string; icon: any; children: React.ReactNode; gradient: string }) {
    const [from, to] = gradient.split(' to-');
    return (
        <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
            whileHover={{ scale: 1.01 }}
        >
            <div className="flex items-center gap-3 mb-6">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{title}</h2>
            </div>
            <div className="h-72 w-full">
                {children}
            </div>
        </motion.div>
    );
}
