import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Radar, RefreshCw, Users, Clock, CheckCircle, XCircle, Timer, Activity, Play, AlertTriangle, TrendingUp, Zap, Target } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

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

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    present: { label: 'Hadir', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle },
    late: { label: 'Terlambat', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
    rejected: { label: 'Ditolak', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100
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
        } catch {}
    }, [activeSession?.id]);

    useEffect(() => {
        const interval = window.setInterval(fetchLogs, 5000);
        return () => window.clearInterval(interval);
    }, [fetchLogs]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchLogs();
        setIsRefreshing(false);
    };

    const pieData = statusDistribution.map(s => ({ name: statusConfig[s.status]?.label || s.status, value: s.total }));

    return (
        <AppLayout>
            <Head title="Live Monitor" />
            <div className="min-h-screen bg-slate-50 dark:bg-black p-6 space-y-6">
                {/* Animated Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl"
                >
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -90, 0],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
                    />
                    
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    animate={{
                                        rotate: 360,
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"
                                >
                                    <Radar className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-blue-100 font-medium"
                                    >
                                        Real-time Monitoring System
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold"
                                    >
                                        Live Monitor
                                    </motion.h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm text-blue-100">Update terakhir</p>
                                    <p className="text-lg font-semibold">{lastUpdate.toLocaleTimeString('id-ID')}</p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-xl border border-white/30"
                                >
                                    <RefreshCw className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </motion.button>
                            </div>
                        </div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-4 text-blue-100"
                        >
                            Pantau scan absensi secara real-time dengan auto-refresh setiap 5 detik
                        </motion.p>
                    </div>
                </motion.div>

                {/* Active Session Banner */}
                <AnimatePresence>
                    {activeSession && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-6 dark:bg-gradient-to-r dark:from-emerald-500/20 dark:via-teal-500/20 dark:to-cyan-500/20 backdrop-blur-xl"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.1, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                        }}
                                        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    >
                                        <Play className="h-7 w-7" />
                                    </motion.div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <motion.span
                                                animate={{
                                                    opacity: [1, 0.5, 1],
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white"
                                            >
                                                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                                LIVE
                                            </motion.span>
                                            <p className="text-sm text-emerald-400 font-medium">Sesi Aktif</p>
                                        </div>
                                        <p className="text-xl font-bold text-white">{activeSession.course?.nama ?? 'Tanpa Mata Kuliah'}</p>
                                        <p className="text-sm text-emerald-300">Pertemuan #{activeSession.meeting_number}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Grid with Animation */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-4 md:grid-cols-4"
                >
                    <StatCard icon={Users} label="Total Scan Hari Ini" value={todayStats.total_scans} color="blue" trend="+12%" />
                    <StatCard icon={CheckCircle} label="Hadir" value={todayStats.present} color="emerald" trend="+8%" />
                    <StatCard icon={Clock} label="Terlambat" value={todayStats.late} color="amber" trend="-3%" />
                    <StatCard icon={XCircle} label="Ditolak" value={todayStats.rejected} color="red" trend="-5%" />
                </motion.div>

                {/* Session Stats */}
                {sessionStats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid gap-4 md:grid-cols-5"
                    >
                        <MiniStatCard label="Sesi: Total" value={sessionStats.total} />
                        <MiniStatCard label="Sesi: Hadir" value={sessionStats.present} color="emerald" />
                        <MiniStatCard label="Sesi: Terlambat" value={sessionStats.late} color="amber" />
                        <MiniStatCard label="Sesi: Ditolak" value={sessionStats.rejected} color="red" />
                        <MiniStatCard label="Selfie Pending" value={sessionStats.pending_selfie} color="purple" />
                    </motion.div>
                )}

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-2xl border border-slate-200/50 bg-white/50 dark:border-slate-800/50 dark:bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Scan per Jam</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#475569" />
                                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#475569" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            border: '1px solid rgba(148, 163, 184, 0.2)',
                                            borderRadius: '12px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Bar dataKey="scans" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-2xl border border-slate-200/50 bg-white/50 dark:border-slate-800/50 dark:bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="h-5 w-5 text-blue-500" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Distribusi Status</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {pieData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            border: '1px solid rgba(148, 163, 184, 0.2)',
                                            borderRadius: '12px',
                                            color: '#fff'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl border border-slate-200/50 bg-white/50 dark:border-slate-800/50 dark:bg-slate-900/50 shadow-xl backdrop-blur-xl overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Radar className="h-5 w-5 text-blue-500" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Aktivitas Terbaru</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [1, 0.5, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                    }}
                                    className="h-2 w-2 rounded-full bg-emerald-500"
                                />
                                <span className="text-xs text-slate-500 dark:text-slate-400">Live</span>
                            </div>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50 max-h-96 overflow-y-auto">
                        <AnimatePresence>
                            {logs.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-12 text-center"
                                >
                                    <Radar className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                                    <p className="text-slate-500 dark:text-slate-400">Belum ada scan masuk</p>
                                </motion.div>
                            ) : logs.map((log, index) => {
                                const cfg = statusConfig[log.status] || { label: log.status, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: AlertTriangle };
                                const Icon = cfg.icon;
                                return (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-4 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                className={`flex h-12 w-12 items-center justify-center rounded-xl border ${cfg.color}`}
                                            >
                                                <Icon className="h-6 w-6" />
                                            </motion.div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{log.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{log.nim} • {log.course}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{log.time}</p>
                                            <div className="flex items-center gap-2 justify-end mt-1">
                                                {log.distance_m !== null && (
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">{log.distance_m}m</span>
                                                )}
                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
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

                {/* Recent Sessions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="rounded-2xl border border-slate-200/50 bg-white/50 dark:border-slate-800/50 dark:bg-slate-900/50 shadow-xl backdrop-blur-xl overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50">
                        <div className="flex items-center gap-2">
                            <Timer className="h-5 w-5 text-blue-500" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Sesi Terbaru</h2>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                        {recentSessions.map((s, index) => (
                            <motion.div
                                key={s.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + index * 0.05 }}
                                className="p-4 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'}`}
                                    >
                                        {s.is_active ? <Play className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                    </motion.div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{s.course_name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Pertemuan #{s.meeting_number}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{s.total_attendance}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">kehadiran</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </AppLayout>
    );
}

function StatCard({ icon: Icon, label, value, color, trend }: { icon: any; label: string; value: number; color: string; trend?: string }) {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
        blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
        emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
        amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
        red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    };

    const cfg = colors[color] || colors.blue;

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`rounded-2xl border ${cfg.border} bg-white/50 dark:bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl`}
        >
            <div className="flex items-start justify-between mb-4">
                <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${cfg.bg} ${cfg.text} border ${cfg.border}`}
                >
                    <Icon className="h-6 w-6" />
                </motion.div>
                {trend && (
                    <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-3xl font-bold text-slate-900 dark:text-white"
                >
                    {value}
                </motion.p>
            </div>
        </motion.div>
    );
}

function MiniStatCard({ label, value, color = 'slate' }: { label: string; value: number; color?: string }) {
    const colors: Record<string, string> = {
        slate: 'text-slate-900 dark:text-white',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        red: 'text-red-400',
        purple: 'text-purple-400',
    };

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="rounded-xl border border-slate-200/50 bg-white/50 dark:border-slate-800/50 dark:bg-slate-900/50 p-4 shadow-lg backdrop-blur-xl"
        >
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
        </motion.div>
    );
}
