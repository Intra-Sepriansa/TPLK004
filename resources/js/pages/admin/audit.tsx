import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    ShieldCheck,
    Calendar,
    Search,
    Download,
    AlertTriangle,
    Clock,
    MapPin,
    UserX,
    Filter,
    TrendingUp,
    Eye,
    RefreshCw,
    Shield,
    AlertCircle,
    CheckCircle,
    XCircle,
    Activity,
    BookOpen,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

interface AuditLog {
    id: number;
    event_type: string;
    message: string;
    created_at: string;
    mahasiswa?: { nama: string; nim: string } | null;
    session?: { course?: { nama: string } } | null;
}

interface SecurityStats {
    total_events: number;
    token_expired: number;
    token_duplicate: number;
    geofence_violation: number;
    selfie_rejected: number;
    selfie_pending: number;
    login_failed: number;
    suspicious_activity: number;
}

interface EventDistribution {
    event_type: string;
    total: number;
}

interface DailyTrend {
    labels: string[];
    values: number[];
}

interface SuspiciousActivity {
    id: number;
    event_type: string;
    message: string;
    mahasiswa: string;
    nim: string;
    course: string;
    created_at: string;
}

interface FlaggedStudent {
    id: number;
    nama: string;
    nim: string;
    total_flags: number;
}

interface EventType {
    value: string;
    label: string;
}

interface PageProps {
    auditLogs: {
        data: AuditLog[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    securityStats: SecurityStats;
    eventDistribution: EventDistribution[];
    dailyTrend: DailyTrend;
    suspiciousActivities: SuspiciousActivity[];
    topFlaggedStudents: FlaggedStudent[];
    filters: {
        date_from: string;
        date_to: string;
        event_type: string;
    };
    eventTypes: EventType[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];

const eventTypeConfig: Record<string, { label: string; color: string; icon: any }> = {
    token_expired: { label: 'Token Expired', color: 'bg-amber-100 text-amber-700', icon: Clock },
    token_duplicate: { label: 'Token Duplikat', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
    geofence_violation: { label: 'Pelanggaran Zona', color: 'bg-rose-100 text-rose-700', icon: MapPin },
    login_failed: { label: 'Login Gagal', color: 'bg-orange-100 text-orange-700', icon: UserX },
    login_success: { label: 'Login Berhasil', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    suspicious_activity: { label: 'Aktivitas Mencurigakan', color: 'bg-purple-100 text-purple-700', icon: AlertCircle },
    attendance_success: { label: 'Absensi Berhasil', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    selfie_uploaded: { label: 'Selfie Diupload', color: 'bg-blue-100 text-blue-700', icon: Eye },
};

export default function AdminAudit({
    auditLogs,
    securityStats,
    eventDistribution,
    dailyTrend,
    suspiciousActivities,
    topFlaggedStudents,
    filters,
    eventTypes,
}: PageProps) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [eventType, setEventType] = useState(filters.event_type);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const handleFilter = () => {
        router.get('/admin/audit', { date_from: dateFrom, date_to: dateTo, event_type: eventType }, { preserveState: true });
    };

    const handleExportPdf = () => {
        window.open(`/admin/audit/pdf?date_from=${dateFrom}&date_to=${dateTo}&event_type=${eventType}`, '_blank');
    };

    const trendData = dailyTrend.labels.map((label, i) => ({
        name: label,
        events: dailyTrend.values[i],
    }));

    const pieData = eventDistribution.map(e => ({
        name: eventTypeConfig[e.event_type]?.label || e.event_type,
        value: e.total,
    }));

    const getEventBadge = (type: string) => {
        const config = eventTypeConfig[type] || { label: type, color: 'bg-slate-100 text-slate-700', icon: Activity };
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </span>
        );
    };

    return (
        <AppLayout>
            <Head title="Audit Keamanan" />

            <div className="p-6 space-y-6">
                {/* ═══════ HEADER — Matching Uang Kas Style ═══════ */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
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

                    {/* Floating Animations (Pulses) */}
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

                    <div className="relative flex items-center gap-6">
                        <motion.div
                            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.15, duration: 0.5, type: "spring", stiffness: 200 }}
                            whileHover={{ scale: 1.1, rotate: 10 }}
                        >
                            <ShieldCheck className="h-10 w-10 text-white" />
                        </motion.div>
                        <div>
                            <motion.p
                                className="text-indigo-100 font-medium tracking-wide mb-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.2 }}
                            >
                                Keamanan Sistem
                            </motion.p>
                            <motion.h1
                                className="text-4xl font-bold text-white tracking-tight"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25, duration: 0.2 }}
                            >
                                Audit Keamanan
                            </motion.h1>
                            <motion.p
                                className="mt-2 text-indigo-50 border-l-2 border-indigo-300/50 pl-3 italic text-sm max-w-xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.2 }}
                            >
                                Monitor aktivitas keamanan realtime, deteksi anomali, dan riwayat akses sistem untuk memastikan integritas data.
                            </motion.p>
                        </div>
                    </div>
                </motion.div>

                {/* Security Stats - Advanced Glassmorphism & Glowing Orbs */}
                <div className="grid gap-6 md:grid-cols-4">
                    {[
                        { id: 'events', icon: Activity, label: 'Total Event', value: securityStats.total_events, color: 'from-blue-500 to-cyan-500', glow: 'bg-blue-500' },
                        { id: 'duplicate', icon: AlertTriangle, label: 'Token Duplikat', value: securityStats.token_duplicate, color: 'from-red-500 to-rose-500', glow: 'bg-red-500' },
                        { id: 'geofence', icon: MapPin, label: 'Pelanggaran Zona', value: securityStats.geofence_violation, color: 'from-rose-500 to-pink-500', glow: 'bg-rose-500' },
                        { id: 'expired', icon: Clock, label: 'Token Expired', value: securityStats.token_expired, color: 'from-amber-500 to-yellow-500', glow: 'bg-amber-500' },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            whileHover="hover"
                            className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-white/5"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 dark:opacity-10`} />

                            {/* Glowing Orb */}
                            <motion.div
                                variants={{
                                    hover: { scale: 1.5, opacity: 0.5 },
                                    initial: { scale: 1, opacity: 0.2 }
                                }}
                                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${stat.glow} blur-3xl transition-all duration-500`}
                            />

                            <div className="relative flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}
                                >
                                    <stat.icon className="h-7 w-7" />
                                </motion.div>
                                <div>
                                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">{stat.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Filter Section - Glassmorphism */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                >
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="font-bold text-lg text-gray-800 dark:text-white">Filter & Export</h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dari Tanggal</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={e => setDateFrom(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sampai Tanggal</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={e => setDateTo(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipe Event</label>
                            <div className="relative">
                                <select
                                    value={eventType}
                                    onChange={e => setEventType(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20 text-sm focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                >
                                    {eventTypes.map(et => (
                                        <option key={et.value} value={et.value}>{et.label}</option>
                                    ))}
                                </select>
                                <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex items-end gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleFilter}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white py-2.5 text-sm font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Terapkan
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleExportPdf}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 text-gray-700 py-2.5 text-sm font-semibold shadow-sm hover:bg-gray-50 transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                                <Download className="h-4 w-4" />
                                Export PDF
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Charts Row - Glassmorphism */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Daily Trend Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12, duration: 0.2, ease: "easeOut" }}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="font-bold text-lg text-gray-800 dark:text-white">Tren Harian</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11, fill: '#64748B' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#64748B' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            color: '#1e293b'
                                        }}
                                        itemStyle={{ color: '#1e293b' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="events"
                                        stroke="#ef4444"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorEvents)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Event Distribution Pie */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.14, duration: 0.2, ease: "easeOut" }}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="font-bold text-lg text-gray-800 dark:text-white">Distribusi Event</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }: { name?: string | number; percent?: number }) => `${name ?? ''} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                    >
                                        {pieData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            color: '#1e293b'
                                        }}
                                        itemStyle={{ color: '#1e293b' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Suspicious Activities & Flagged Students */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Suspicious Activities */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                </div>
                                <h2 className="font-bold text-lg text-gray-800 dark:text-white">Aktivitas Mencurigakan</h2>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-800/50 max-h-80 overflow-y-auto">
                            {suspiciousActivities.length === 0 ? (
                                <div className="p-8 text-center">
                                    <CheckCircle className="h-10 w-10 mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
                                    <p className="text-slate-600 dark:text-slate-400">Tidak ada aktivitas mencurigakan</p>
                                </div>
                            ) : (
                                suspiciousActivities.map((activity, index) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.18 + index * 0.02, duration: 0.15 }}
                                        className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{activity.mahasiswa}</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">{activity.nim} • {activity.course}</p>
                                                <p className="text-xs text-slate-500 mt-1">{activity.message}</p>
                                            </div>
                                            <div className="text-right">
                                                {getEventBadge(activity.event_type)}
                                                <p className="text-xs text-slate-500 mt-1">{activity.created_at}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Top Flagged Students */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                    <UserX className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <h2 className="font-bold text-lg text-gray-800 dark:text-white">Mahasiswa Paling Banyak Flag</h2>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-800/50">
                            {topFlaggedStudents.length === 0 ? (
                                <div className="p-8 text-center">
                                    <CheckCircle className="h-10 w-10 mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
                                    <p className="text-slate-600 dark:text-slate-400">Tidak ada mahasiswa yang di-flag</p>
                                </div>
                            ) : (
                                topFlaggedStudents.map((student, index) => (
                                    <motion.div
                                        key={student.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + index * 0.015, duration: 0.15 }}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        className="p-4 flex items-center gap-4 hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                                    >
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold text-sm ${index === 0 ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30' :
                                            index === 1 ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                                                'bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/30'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{student.nama}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">{student.nim}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30">
                                                {student.total_flags} flags
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Audit Logs Table - Glassmorphism */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                                    <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h2 className="font-bold text-lg text-gray-800 dark:text-white">Log Audit</h2>
                            </div>
                            <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                Halaman {auditLogs.current_page} dari {auditLogs.last_page}
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/5">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipe Event</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pesan</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mahasiswa</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Info Tambahan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                <AnimatePresence>
                                    {auditLogs.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <Activity className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                                <p className="text-gray-500 font-medium">Tidak ada log audit yang ditemukan</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        auditLogs.data.map((log, index) => (
                                            <motion.tr
                                                key={log.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: 0.05 * index }}
                                                className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('Row clicked, log:', log);
                                                    setSelectedLog(log);
                                                    setShowDetailModal(true);
                                                }}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-300">
                                                    {log.created_at}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getEventBadge(log.event_type)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                                                    {log.message}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {log.mahasiswa ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs ring-2 ring-white ml-1">
                                                                {log.mahasiswa.nama.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-800 dark:text-white">{log.mahasiswa.nama}</p>
                                                                <p className="text-xs text-gray-500">{log.mahasiswa.nim}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">System / Guest</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {log.session?.course?.nama || '-'}
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* ═══════ DETAIL MODAL ═══════ */}
            <AnimatePresence>
                {(() => {
                    console.log('Modal state:', { showDetailModal, selectedLog });
                    return showDetailModal && selectedLog;
                })() && (
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
                                    <div className="relative h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 flex items-start justify-between overflow-hidden">
                                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                                        {/* Floating Particles */}
                                        {[...Array(8)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute w-2 h-2 bg-white/30 rounded-full"
                                                style={{
                                                    left: `${Math.random() * 100}%`,
                                                    top: `${Math.random() * 100}%`,
                                                }}
                                                animate={{
                                                    y: [0, -20, 0],
                                                    opacity: [0.3, 0.6, 0.3],
                                                }}
                                                transition={{
                                                    duration: 3 + Math.random() * 2,
                                                    repeat: Infinity,
                                                    delay: Math.random() * 2,
                                                }}
                                            />
                                        ))}

                                        <div className="relative z-10 flex items-center gap-4">
                                            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                                                {selectedLog.mahasiswa?.nama.charAt(0) || 'S'}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white">
                                                    {selectedLog.mahasiswa?.nama || 'System Event'}
                                                </h3>
                                                <p className="text-blue-100">
                                                    {selectedLog.mahasiswa?.nim || 'Automated Process'}
                                                </p>
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
                                        <div className="flex items-center justify-between flex-wrap gap-3">
                                            <div className="flex items-center gap-3">
                                                {getEventBadge(selectedLog.event_type)}
                                                <span className="text-sm text-neutral-500 font-medium flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    {selectedLog.created_at}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Event Message */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 p-6 border border-neutral-200 dark:border-neutral-700"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                                    <AlertCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-neutral-900 dark:text-white text-lg mb-2">
                                                        Event Message
                                                    </p>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                                        {selectedLog.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Course Info (if available) */}
                                        {selectedLog.session?.course?.nama && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 border border-blue-200 dark:border-blue-800"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                                        <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-neutral-900 dark:text-white text-lg mb-1">
                                                            {selectedLog.session.course.nama}
                                                        </p>
                                                        <p className="text-sm text-neutral-500">
                                                            Related Course
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Event Details Grid */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            {/* Event Type Card */}
                                            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 border border-purple-200 dark:border-purple-800">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                        <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                        Event Type
                                                    </p>
                                                </div>
                                                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                                                    {eventTypeConfig[selectedLog.event_type]?.label || selectedLog.event_type}
                                                </p>
                                            </div>

                                            {/* Event ID Card */}
                                            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 border border-amber-200 dark:border-amber-800">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                                        <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                    </div>
                                                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                        Event ID
                                                    </p>
                                                </div>
                                                <p className="text-sm font-bold text-neutral-900 dark:text-white font-mono">
                                                    #{selectedLog.id}
                                                </p>
                                            </div>
                                        </motion.div>

                                        {/* Security Notice */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-4 border border-red-200 dark:border-red-800"
                                        >
                                            <div className="flex items-start gap-3">
                                                <ShieldCheck className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-bold text-red-900 dark:text-red-100 mb-1">
                                                        Security Log Entry
                                                    </p>
                                                    <p className="text-xs text-red-700 dark:text-red-300">
                                                        This event has been recorded in the security audit trail for monitoring and compliance purposes.
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Action Buttons */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="flex gap-3 pt-4"
                                        >
                                            <button
                                                onClick={() => setShowDetailModal(false)}
                                                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 text-neutral-700 dark:text-neutral-200 font-bold hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                                            >
                                                Close
                                            </button>
                                            <Link
                                                href={`/admin/audit/${selectedLog.id}`}
                                                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Full Details
                                            </Link>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </div>
                        </>
                    )}
            </AnimatePresence>
        </AppLayout>
    );
}
