import { router } from '@inertiajs/react';
import {
    Award,
    BarChart3,
    BookOpen,
    CalendarCheck,
    Camera,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileBarChart,
    Flame,
    MapPin,
    QrCode,
    RefreshCw,
    Settings,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Timer,
    TrendingUp,
    Users,
    UserCheck,
    XCircle,
    Zap,
    Activity,
    Target,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart as RechartsPie,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface OverviewProps {
    stats: any[];
    activity: any[];
    weekly: { labels: string[]; values: number[] };
    weeklyDetailed?: { day: string; hadir: number; terlambat: number; tidakHadir: number }[];
    hourlyData?: { hour: string; count: number }[];
    topStudents?: { id: number; name: string; nim: string; attendance: number; streak: number }[];
    courseStats?: { name: string; hadir: number; terlambat: number; tidakHadir: number }[];
    attendanceRate?: number;
    upcomingSessions: any[];
    deviceDistribution: { label: string; total: number }[];
    activeSession?: any;
    settings?: any;
    activeStats?: any;
    securitySummary?: any;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-white/20 bg-white/95 p-3 shadow-xl backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/95">
            <p className="font-semibold text-neutral-900 dark:text-white mb-2">{label}</p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-neutral-600 dark:text-neutral-400">{entry.name}:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

// Animation variants — Matching Uang Kas
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
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

export default function DashboardOverview({
    stats,
    activity,
    weekly,
    weeklyDetailed,
    hourlyData,
    topStudents,
    courseStats,
    attendanceRate,
    upcomingSessions,
    deviceDistribution,
    activeSession,
    settings,
    activeStats,
    securitySummary,
}: OverviewProps) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
        present: { label: 'Hadir', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: CheckCircle2 },
        late: { label: 'Terlambat', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Clock },
        rejected: { label: 'Ditolak', color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30', icon: XCircle },
    };

    const weeklyChartData = weeklyDetailed ?? weekly.labels.map((label, i) => ({
        day: label,
        hadir: weekly.values[i] ?? 0,
        terlambat: 0,
        tidakHadir: 0,
    }));

    const deviceChartData = deviceDistribution.map((d, i) => ({
        name: d.label,
        value: d.total,
        color: COLORS[i % COLORS.length],
    }));

    return (
        <motion.div
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* ═══════ HERO HEADER — Matching Uang Kas Style ═══════ */}
            <motion.div
                className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                variants={itemVariants}
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
                <motion.div
                    className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                    animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 2 }}
                />

                <div className="relative">
                    <div className="flex flex-wrap items-start justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <motion.div
                                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <Sparkles className="h-8 w-8" />
                            </motion.div>
                            <div>
                                <p className="text-sm text-indigo-100 font-medium tracking-wide">Selamat datang di</p>
                                <h1 className="text-3xl font-bold text-white">Dashboard Admin</h1>
                                <p className="mt-1 text-indigo-100 max-w-lg">
                                    Pantau kehadiran mahasiswa secara real-time dengan sistem absensi berbasis AI, QR code dinamis, dan verifikasi selfie.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, type: 'spring' }}
                                className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg border border-white/10"
                            >
                                <div className="text-right">
                                    <p className="text-3xl font-bold tabular-nums">
                                        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-xs text-indigo-200">
                                        {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/10"
                    >
                        <motion.a
                            href="/admin/sesi-absen"
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-600 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <CalendarCheck className="h-4 w-4" />
                            Buat Sesi
                        </motion.a>
                        <motion.a
                            href="/admin/qr-builder"
                            className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/30 border border-white/20 shadow-lg"
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <QrCode className="h-4 w-4" />
                            Generate QR
                        </motion.a>
                        <motion.a
                            href="/admin/rekap-kehadiran"
                            className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/30 border border-white/20 shadow-lg"
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FileBarChart className="h-4 w-4" />
                            Export Laporan
                        </motion.a>
                        <motion.button
                            onClick={() => router.reload()}
                            className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/30 border border-white/20 shadow-lg"
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </motion.button>
                        <motion.a
                            href="/admin/pengaturan"
                            className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/30 border border-white/20 shadow-lg"
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Settings className="h-4 w-4" />
                            Pengaturan
                        </motion.a>
                    </motion.div>
                </div>
            </motion.div>

            {/* ═══════ STATS CARDS — Advanced Glassmorphism ═══════ */}
            <motion.div
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                variants={containerVariants}
            >
                {stats.map((stat, index) => {
                    const icons = [UserCheck, Clock, Camera, Users];
                    const Icon = icons[index] ?? Users;
                    const colorConfigs = [
                        { from: 'from-emerald-400', to: 'to-teal-600', shadow: 'shadow-emerald-500/30', bg: 'bg-emerald-500', hoverShadow: 'hover:shadow-emerald-500/10', gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10' },
                        { from: 'from-amber-400', to: 'to-orange-600', shadow: 'shadow-amber-500/30', bg: 'bg-amber-500', hoverShadow: 'hover:shadow-amber-500/10', gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10' },
                        { from: 'from-rose-400', to: 'to-pink-600', shadow: 'shadow-rose-500/30', bg: 'bg-rose-500', hoverShadow: 'hover:shadow-rose-500/10', gradientBg: 'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10' },
                        { from: 'from-sky-400', to: 'to-indigo-600', shadow: 'shadow-sky-500/30', bg: 'bg-sky-500', hoverShadow: 'hover:shadow-sky-500/10', gradientBg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10' },
                    ];
                    const colorConfig = colorConfigs[index] ?? colorConfigs[3];
                    const cardKey = `stat-${index}`;

                    return (
                        <motion.div
                            key={stat.title}
                            className={`group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all ${colorConfig.hoverShadow} dark:border-white/5`}
                            variants={cardVariants}
                            whileHover="hover"
                            onHoverStart={() => setHoveredCard(cardKey)}
                            onHoverEnd={() => setHoveredCard(null)}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${colorConfig.gradientBg}`} />
                            <motion.div
                                animate={{
                                    scale: hoveredCard === cardKey ? 1.5 : 1,
                                    opacity: hoveredCard === cardKey ? 0.4 : 0.2,
                                }}
                                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${colorConfig.bg} blur-3xl transition-all duration-500`}
                            />
                            <div className="relative flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${colorConfig.from} ${colorConfig.to} text-white shadow-lg ${colorConfig.shadow}`}
                                >
                                    <Icon className="h-7 w-7" />
                                </motion.div>
                                <div>
                                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.title}</p>
                                    <div className="mt-1">
                                        <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                            {stat.value?.toLocaleString?.() ?? stat.value}
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-0.5">{stat.note}</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>


            {/* ═══════ MAIN CONTENT GRID ═══════ */}
            <motion.div
                className="grid gap-6 lg:grid-cols-3"
                variants={containerVariants}
            >
                {/* Weekly Attendance Chart */}
                <motion.div
                    className="lg:col-span-2 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Kehadiran Mingguan</h2>
                                <p className="text-sm text-neutral-500">Statistik 7 hari terakhir</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Hadir</span>
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Terlambat</span>
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />Tidak Hadir</span>
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyChartData}>
                                <defs>
                                    <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorTerlambat" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
                                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="hadir" name="Hadir" stroke="#10b981" strokeWidth={2} fill="url(#colorHadir)" />
                                <Area type="monotone" dataKey="terlambat" name="Terlambat" stroke="#f59e0b" strokeWidth={2} fill="url(#colorTerlambat)" />
                                <Area type="monotone" dataKey="tidakHadir" name="Tidak Hadir" stroke="#ef4444" strokeWidth={2} fillOpacity={0.1} fill="#ef4444" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Attendance Rate Gauge */}
                <motion.div
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Tingkat Kehadiran</h2>
                            <p className="text-sm text-neutral-500">Persentase keseluruhan</p>
                        </div>
                    </div>
                    <div className="h-52 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: attendanceRate ?? 0, fill: '#10b981' }]} startAngle={180} endAngle={0}>
                                <RadialBar background dataKey="value" cornerRadius={10} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center -mt-8">
                        <p className="text-4xl font-bold text-neutral-900 dark:text-white">{attendanceRate ?? 0}%</p>
                        <p className="text-sm text-neutral-500">Rata-rata kehadiran</p>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-xl bg-emerald-50/80 p-2 dark:bg-emerald-900/20 backdrop-blur">
                            <p className="font-semibold text-emerald-600">{stats[0]?.value ?? 0}</p>
                            <p className="text-emerald-600/70">Hadir</p>
                        </div>
                        <div className="rounded-xl bg-amber-50/80 p-2 dark:bg-amber-900/20 backdrop-blur">
                            <p className="font-semibold text-amber-600">{stats[1]?.value ?? 0}</p>
                            <p className="text-amber-600/70">Terlambat</p>
                        </div>
                        <div className="rounded-xl bg-rose-50/80 p-2 dark:bg-rose-900/20 backdrop-blur">
                            <p className="font-semibold text-rose-600">{stats[2]?.value ?? 0}</p>
                            <p className="text-rose-600/70">Ditolak</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* ═══════ SECOND ROW ═══════ */}
            <motion.div
                className="grid gap-6 lg:grid-cols-3"
                variants={containerVariants}
            >
                {/* Recent Activity */}
                <motion.div
                    className="lg:col-span-2 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                    variants={itemVariants}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 text-white shadow-lg shadow-violet-500/30">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Aktivitas Terbaru</h2>
                                <p className="text-sm text-neutral-500">Real-time absensi mahasiswa</p>
                            </div>
                        </div>
                        <a href="/admin/live-monitor" className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            Lihat semua <ChevronRight className="h-4 w-4" />
                        </a>
                    </div>
                    <div className="space-y-3">
                        {activity.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-neutral-50/50 p-6 text-center text-sm text-neutral-500 dark:bg-neutral-800/50">
                                Belum ada aktivitas hari ini.
                            </div>
                        ) : (
                            activity.slice(0, 5).map((item, idx) => {
                                const config = statusConfig[item.status] ?? statusConfig.present;
                                const Icon = config.icon;
                                return (
                                    <motion.div
                                        key={item.id}
                                        className="flex items-center gap-4 p-3 rounded-2xl bg-neutral-50/50 dark:bg-neutral-800/50 hover:bg-neutral-100/60 dark:hover:bg-neutral-700/50 transition-colors backdrop-blur"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                    >
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg}`}>
                                            <Icon className={`h-5 w-5 ${config.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-neutral-900 dark:text-white truncate">{item.name}</p>
                                            <p className="text-xs text-neutral-500">{item.distance_m ? `Radius ${item.distance_m}m` : 'Data jarak belum ada'}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                                                {config.label}
                                            </span>
                                            <p className="text-xs text-neutral-400 mt-1">{item.time}</p>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </motion.div>

                {/* Top Students */}
                <motion.div
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                                <Award className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Top Mahasiswa</h2>
                                <p className="text-sm text-neutral-500">Kehadiran terbaik</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {(topStudents ?? []).length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-neutral-50/50 p-4 text-center text-sm text-neutral-500 dark:bg-neutral-800/50">
                                Belum ada data.
                            </div>
                        ) : (
                            (topStudents ?? []).map((student, index) => (
                                <motion.div
                                    key={student.id}
                                    className="flex items-center gap-3 p-2 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/50 hover:bg-neutral-100/60 dark:hover:bg-neutral-700/50 transition-colors backdrop-blur"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.03, x: 4 }}
                                >
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${index === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                                            index === 1 ? 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200' :
                                                index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                                    'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-neutral-900 dark:text-white text-sm truncate">{student.name}</p>
                                        <p className="text-xs text-neutral-500">{student.nim}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-emerald-600 text-sm">{student.attendance}%</p>
                                        <div className="flex items-center gap-1 text-xs text-amber-600">
                                            <Flame className="h-3 w-3" />
                                            {student.streak}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </motion.div>


            {/* ═══════ THIRD ROW ═══════ */}
            <motion.div
                className="grid gap-6 lg:grid-cols-2"
                variants={containerVariants}
            >
                {/* Course Stats */}
                <motion.div
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                    variants={itemVariants}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-blue-600 text-white shadow-lg shadow-indigo-500/30">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Kehadiran per Mata Kuliah</h2>
                                <p className="text-sm text-neutral-500">Perbandingan antar mata kuliah</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-64">
                        {(courseStats ?? []).length === 0 ? (
                            <div className="flex items-center justify-center h-full rounded-2xl border border-white/10 bg-neutral-50/50 text-sm text-neutral-500 dark:bg-neutral-800/50">
                                Belum ada data mata kuliah.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={courseStats} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
                                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 11 }} width={100} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="hadir" name="Hadir" fill="#10b981" stackId="a" />
                                    <Bar dataKey="terlambat" name="Terlambat" fill="#f59e0b" stackId="a" />
                                    <Bar dataKey="tidakHadir" name="Tidak Hadir" fill="#ef4444" stackId="a" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.div>

                {/* Device & Hourly Stats */}
                <motion.div
                    className="grid gap-6 sm:grid-cols-2"
                    variants={containerVariants}
                >
                    {/* Device Distribution */}
                    <motion.div
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                        variants={itemVariants}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-400 to-rose-600 text-white shadow-lg shadow-pink-500/30">
                                    <Smartphone className="h-4 w-4" />
                                </div>
                                <h2 className="font-semibold text-neutral-900 dark:text-white">Perangkat</h2>
                            </div>
                        </div>
                        <div className="h-40">
                            {deviceChartData.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-sm text-neutral-500">
                                    Belum ada data.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPie>
                                        <Pie data={deviceChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                            {deviceChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                            {deviceChartData.map((device, index) => (
                                <div key={index} className="flex items-center gap-1.5 text-xs">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: device.color }} />
                                    <span className="text-neutral-600 dark:text-neutral-400">{device.name}</span>
                                    <span className="font-semibold text-neutral-900 dark:text-white">{device.value}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Hourly Distribution */}
                    <motion.div
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                        variants={itemVariants}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <h2 className="font-semibold text-neutral-900 dark:text-white">Jam Absen</h2>
                            </div>
                        </div>
                        <div className="h-40">
                            {(hourlyData ?? []).length === 0 ? (
                                <div className="flex items-center justify-center h-full text-sm text-neutral-500">
                                    Belum ada data hari ini.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={hourlyData}>
                                        <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <YAxis hide />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="count" name="Absen" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* ═══════ SECURITY & SESSION INFO ═══════ */}
            <motion.div
                className="grid gap-6 lg:grid-cols-3"
                variants={containerVariants}
            >
                {/* Active Session */}
                <motion.div
                    className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                    variants={itemVariants}
                >
                    <div className={`absolute inset-0 bg-gradient-to-br ${activeSession ? 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10' : 'from-neutral-500/5 to-neutral-500/5'}`} />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${activeSession ? 'from-emerald-400 to-teal-600 shadow-emerald-500/30' : 'from-neutral-400 to-neutral-600 shadow-neutral-500/30'} text-white shadow-lg`}>
                                    <Zap className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Sesi Aktif</h2>
                                    <p className="text-sm text-neutral-500">Status sesi saat ini</p>
                                </div>
                            </div>
                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${activeSession ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}`}>
                                <span className={`h-2 w-2 rounded-full ${activeSession ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
                                {activeSession ? 'Live' : 'Idle'}
                            </span>
                        </div>
                        {activeSession ? (
                            <div className="space-y-3">
                                <div className="rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 p-4 dark:from-indigo-900/20 dark:to-purple-900/20 backdrop-blur">
                                    <p className="font-semibold text-neutral-900 dark:text-white">{activeSession.course?.nama ?? activeSession.title}</p>
                                    <p className="text-sm text-neutral-500">Pertemuan {activeSession.meeting_number}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="rounded-xl bg-neutral-50/80 p-3 dark:bg-neutral-800/50 backdrop-blur">
                                        <p className="text-xs text-neutral-500">Scan masuk</p>
                                        <p className="font-semibold text-neutral-900 dark:text-white">{activeStats?.total ?? 0}</p>
                                    </div>
                                    <div className="rounded-xl bg-neutral-50/80 p-3 dark:bg-neutral-800/50 backdrop-blur">
                                        <p className="text-xs text-neutral-500">Ditolak</p>
                                        <p className="font-semibold text-rose-600">{activeStats?.rejected ?? 0}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-white/10 bg-neutral-50/50 p-6 text-center dark:bg-neutral-800/50">
                                <Zap className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                                <p className="text-sm text-neutral-500">Belum ada sesi aktif</p>
                                <a href="/admin/sesi-absen" className="inline-flex items-center gap-2 mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                    Buat sesi baru <ChevronRight className="h-4 w-4" />
                                </a>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Security Summary */}
                <motion.div
                    className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                    variants={itemVariants}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white shadow-lg shadow-sky-500/30">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Keamanan</h2>
                                    <p className="text-sm text-neutral-500">Audit & kepatuhan</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-2xl bg-neutral-50/80 p-3 dark:bg-neutral-800/50 backdrop-blur">
                                <span className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                                    <Target className="h-4 w-4 text-emerald-500" />
                                    Token ganda
                                </span>
                                <span className="font-semibold text-emerald-600">{securitySummary?.duplicate_tokens ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-neutral-50/80 p-3 dark:bg-neutral-800/50 backdrop-blur">
                                <span className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                                    <Camera className="h-4 w-4 text-sky-500" />
                                    Selfie lolos
                                </span>
                                <span className="font-semibold text-sky-600">{securitySummary?.selfie_rate ?? 0}%</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl bg-neutral-50/80 p-3 dark:bg-neutral-800/50 backdrop-blur">
                                <span className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                                    <Timer className="h-4 w-4 text-amber-500" />
                                    Token kadaluarsa
                                </span>
                                <span className="font-semibold text-amber-600">{securitySummary?.expired_tokens ?? 0}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Upcoming Sessions */}
                <motion.div
                    className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                    variants={itemVariants}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 text-white shadow-lg shadow-violet-500/30">
                                    <CalendarCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Sesi Berikutnya</h2>
                                    <p className="text-sm text-neutral-500">Jadwal mendatang</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {upcomingSessions.length === 0 ? (
                                <div className="rounded-2xl border border-white/10 bg-neutral-50/50 p-4 text-center text-sm text-neutral-500 dark:bg-neutral-800/50">
                                    Belum ada jadwal.
                                </div>
                            ) : (
                                upcomingSessions.slice(0, 3).map((session) => (
                                    <div key={session.id} className="rounded-2xl bg-neutral-50/80 p-3 dark:bg-neutral-800/50 backdrop-blur">
                                        <p className="font-medium text-neutral-900 dark:text-white text-sm">{session.course?.nama}</p>
                                        <p className="text-xs text-neutral-500">Pertemuan {session.meeting_number}</p>
                                        <p className="text-xs text-neutral-400 mt-1">{session.start_at}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* ═══════ QUICK ACTIONS — Advanced Glassmorphism ═══════ */}
            <motion.div
                className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                variants={itemVariants}
            >
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Aksi Cepat</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <motion.a
                        href="/admin/qr-builder"
                        className="group flex items-center gap-4 rounded-2xl border border-white/20 bg-neutral-50/50 p-4 transition-all hover:bg-white/80 hover:shadow-lg dark:border-white/5 dark:bg-neutral-800/50 dark:hover:bg-neutral-800/80 backdrop-blur"
                        whileHover={{ scale: 1.03, y: -2 }}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-110">
                            <QrCode className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-neutral-900 dark:text-white">QR Builder</p>
                            <p className="text-sm text-neutral-500">Buat QR code absensi</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-neutral-400 transition-transform group-hover:translate-x-1" />
                    </motion.a>
                    <motion.a
                        href="/admin/mahasiswa"
                        className="group flex items-center gap-4 rounded-2xl border border-white/20 bg-neutral-50/50 p-4 transition-all hover:bg-white/80 hover:shadow-lg dark:border-white/5 dark:bg-neutral-800/50 dark:hover:bg-neutral-800/80 backdrop-blur"
                        whileHover={{ scale: 1.03, y: -2 }}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-110">
                            <Users className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-neutral-900 dark:text-white">Mahasiswa</p>
                            <p className="text-sm text-neutral-500">Kelola data mahasiswa</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-neutral-400 transition-transform group-hover:translate-x-1" />
                    </motion.a>
                    <motion.a
                        href="/admin/sesi-absen"
                        className="group flex items-center gap-4 rounded-2xl border border-white/20 bg-neutral-50/50 p-4 transition-all hover:bg-white/80 hover:shadow-lg dark:border-white/5 dark:bg-neutral-800/50 dark:hover:bg-neutral-800/80 backdrop-blur"
                        whileHover={{ scale: 1.03, y: -2 }}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30 transition-transform group-hover:scale-110">
                            <CalendarCheck className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-neutral-900 dark:text-white">Sesi Absen</p>
                            <p className="text-sm text-neutral-500">Kelola sesi absensi</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-neutral-400 transition-transform group-hover:translate-x-1" />
                    </motion.a>
                    <motion.a
                        href="/admin/rekap-kehadiran"
                        className="group flex items-center gap-4 rounded-2xl border border-white/20 bg-neutral-50/50 p-4 transition-all hover:bg-white/80 hover:shadow-lg dark:border-white/5 dark:bg-neutral-800/50 dark:hover:bg-neutral-800/80 backdrop-blur"
                        whileHover={{ scale: 1.03, y: -2 }}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-600 text-white shadow-lg shadow-rose-500/30 transition-transform group-hover:scale-110">
                            <FileBarChart className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-neutral-900 dark:text-white">Rekap</p>
                            <p className="text-sm text-neutral-500">Lihat rekap kehadiran</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-neutral-400 transition-transform group-hover:translate-x-1" />
                    </motion.a>
                </div>
            </motion.div>
        </motion.div>
    );
}
