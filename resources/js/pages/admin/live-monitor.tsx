import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Radar, RefreshCw, Users, Clock, CheckCircle, XCircle, Timer, Activity, Play, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
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

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#6366f1'];
const statusConfig: Record<string, { label: string; color: string; darkColor: string; icon: any }> = {
    present: { label: 'Hadir', color: 'bg-emerald-100 text-emerald-700', darkColor: 'dark:bg-emerald-500/20 dark:text-emerald-400', icon: CheckCircle },
    late: { label: 'Terlambat', color: 'bg-amber-100 text-amber-700', darkColor: 'dark:bg-amber-500/20 dark:text-amber-400', icon: Clock },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700', darkColor: 'dark:bg-red-500/20 dark:text-red-400', icon: XCircle },
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
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

const pulseVariants = {
    initial: { scale: 1, opacity: 1 },
    animate: {
        scale: [1, 1.2, 1],
        opacity: [1, 0.8, 1],
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
        } catch {}
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
                className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-black dark:via-slate-950 dark:to-black p-6 space-y-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Header Card with Gradient */}
                <motion.div 
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl"
                >
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <motion.div 
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Radar className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p 
                                        className="text-sm text-blue-100 font-medium"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        Real-time Monitoring System
                                    </motion.p>
                                    <motion.h1 
                                        className="text-3xl font-bold"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Live Monitor
                                    </motion.h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm text-blue-100">Update terakhir</p>
                                    <p className="font-semibold text-lg">{lastUpdate.toLocaleTimeString('id-ID')}</p>
                                </div>
                                <motion.button 
                                    onClick={handleRefresh} 
                                    disabled={isRefreshing}
                                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-all backdrop-blur-xl border border-white/30"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <RefreshCw className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </motion.button>
                            </div>
                        </div>
                        <motion.p 
                            className="mt-4 text-blue-100 text-lg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Pantau scan absensi secara real-time dengan auto-refresh setiap 5 detik
                        </motion.p>
                    </div>
                </motion.div>

                {/* Active Session Banner */}
                <AnimatePresence>
                    {activeSession && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20 p-6 backdrop-blur-xl"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <motion.div 
                                        className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                        variants={pulseVariants}
                                        initial="initial"
                                        animate="animate"
                                    >
                                        <Play className="h-7 w-7" />
                                    </motion.div>
                                    <div>
                                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                            <motion.span 
                                                className="h-2 w-2 rounded-full bg-emerald-500"
                                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                            Sesi Aktif
                                        </p>
                                        <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                                            {activeSession.course?.nama ?? 'Tanpa Mata Kuliah'} - Pertemuan #{activeSession.meeting_number}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Waktu</p>
                                    <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
                                        {activeSession.start_at} - {activeSession.end_at}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Grid */}
                <motion.div 
                    className="grid gap-4 md:grid-cols-4"
                    variants={containerVariants}
                >
                    <StatCard icon={Users} label="Total Scan Hari Ini" value={todayStats.total_scans} color="blue" gradient="from-blue-500 to-cyan-500" />
                    <StatCard icon={CheckCircle} label="Hadir" value={todayStats.present} color="emerald" gradient="from-emerald-500 to-green-500" />
                    <StatCard icon={Clock} label="Terlambat" value={todayStats.late} color="amber" gradient="from-amber-500 to-orange-500" />
                    <StatCard icon={XCircle} label="Ditolak" value={todayStats.rejected} color="red" gradient="from-red-500 to-pink-500" />
                </motion.div>

                {/* Session Stats */}
                <AnimatePresence>
                    {sessionStats && (
                        <motion.div 
                            className="grid gap-4 md:grid-cols-5"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            variants={containerVariants}
                        >
                            <SessionStatCard label="Sesi: Total" value={sessionStats.total} color="slate" />
                            <SessionStatCard label="Sesi: Hadir" value={sessionStats.present} color="emerald" />
                            <SessionStatCard label="Sesi: Terlambat" value={sessionStats.late} color="amber" />
                            <SessionStatCard label="Sesi: Ditolak" value={sessionStats.rejected} color="red" />
                            <SessionStatCard label="Selfie Pending" value={sessionStats.pending_selfie} color="purple" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Charts Grid */}
                <motion.div 
                    className="grid gap-6 lg:grid-cols-2"
                    variants={containerVariants}
                >
                    <ChartCard title="Scan per Jam" icon={TrendingUp}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                                <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'rgba(255,255,255,0.95)', 
                                        border: '1px solid #e2e8f0', 
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }} 
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
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
                    </ChartCard>

                    <ChartCard title="Distribusi Status" icon={Activity}>
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
                                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </motion.div>

                {/* Recent Logs */}
                <motion.div 
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 dark:bg-black dark:border-slate-800/70 shadow-xl backdrop-blur-xl overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <Radar className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Aktivitas Terbaru</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <motion.div 
                                    className="h-2 w-2 rounded-full bg-emerald-500"
                                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Live</span>
                            </div>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                        <AnimatePresence mode="popLayout">
                            {logs.length === 0 ? (
                                <motion.div 
                                    className="p-16 text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Radar className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                                    <p className="text-slate-500 dark:text-slate-400 text-lg">Belum ada scan masuk</p>
                                </motion.div>
                            ) : logs.map((log, index) => {
                                const cfg = statusConfig[log.status] || { label: log.status, color: 'bg-slate-100 text-slate-700', darkColor: 'dark:bg-slate-800 dark:text-slate-300', icon: AlertTriangle };
                                const Icon = cfg.icon;
                                return (
                                    <motion.div 
                                        key={log.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer group"
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <motion.div 
                                                className={`flex h-12 w-12 items-center justify-center rounded-xl ${cfg.color} ${cfg.darkColor}`}
                                                whileHover={{ scale: 1.1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Icon className="h-6 w-6" />
                                            </motion.div>
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-white text-lg">{log.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{log.nim} • {log.course}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base font-bold text-slate-900 dark:text-white">{log.time}</p>
                                            <div className="flex items-center gap-2 justify-end mt-1">
                                                {log.distance_m !== null && (
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                                        {log.distance_m}m
                                                    </span>
                                                )}
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${cfg.color} ${cfg.darkColor}`}>
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
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 dark:bg-black dark:border-slate-800/70 shadow-xl backdrop-blur-xl overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <Timer className="h-5 w-5" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sesi Terbaru</h2>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {recentSessions.map((s, index) => (
                            <motion.div 
                                key={s.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer group"
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="flex items-center gap-4">
                                    <motion.div 
                                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.is_active ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {s.is_active ? <Play className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                                    </motion.div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white text-lg">{s.course_name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Pertemuan #{s.meeting_number}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.total_attendance}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">kehadiran</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}

function StatCard({ icon: Icon, label, value, color, gradient }: { icon: any; label: string; value: number; color: string; gradient: string }) {
    return (
        <motion.div 
            variants={itemVariants}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 dark:bg-black dark:border-slate-800/70 p-6 shadow-lg backdrop-blur-xl hover:shadow-2xl transition-all"
            whileHover={{ scale: 1.05, y: -5 }}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
            <div className="relative flex items-center gap-4">
                <motion.div 
                    className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Icon className="h-7 w-7" />
                </motion.div>
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                    <motion.p 
                        className="text-3xl font-bold text-slate-900 dark:text-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                    >
                        {value}
                    </motion.p>
                </div>
            </div>
        </motion.div>
    );
}

function SessionStatCard({ label, value, color }: { label: string; value: number; color: string }) {
    const colors: Record<string, string> = {
        slate: 'text-slate-900 dark:text-white',
        emerald: 'text-emerald-600 dark:text-emerald-400',
        amber: 'text-amber-600 dark:text-amber-400',
        red: 'text-red-600 dark:text-red-400',
        purple: 'text-purple-600 dark:text-purple-400'
    };

    return (
        <motion.div 
            variants={itemVariants}
            className="rounded-xl border border-slate-200/70 bg-white/80 dark:bg-black dark:border-slate-800/70 p-5 shadow-lg backdrop-blur-xl hover:shadow-xl transition-all"
            whileHover={{ scale: 1.05 }}
        >
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{label}</p>
            <motion.p 
                className={`text-3xl font-bold ${colors[color]}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
            >
                {value}
            </motion.p>
        </motion.div>
    );
}

function ChartCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
    return (
        <motion.div 
            variants={itemVariants}
            className="rounded-2xl border border-slate-200/70 bg-white/80 dark:bg-black dark:border-slate-800/70 p-6 shadow-xl backdrop-blur-xl"
            whileHover={{ scale: 1.02 }}
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            </div>
            <div className="h-72">
                {children}
            </div>
        </motion.div>
    );
}
