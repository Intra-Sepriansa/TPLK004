import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    ShieldCheck,
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
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-black p-8 text-white shadow-2xl border border-slate-200 dark:border-slate-800/50"
                >
                    <motion.div 
                        className="flex items-center gap-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                    >
                        <motion.div
                            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur border border-red-500/30"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.15, duration: 0.3, type: "spring", stiffness: 200 }}
                            whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                            <ShieldCheck className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </motion.div>
                        <div>
                            <motion.p 
                                className="text-sm text-red-200/80"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.2 }}
                            >
                                Keamanan Sistem
                            </motion.p>
                            <motion.h1 
                                className="text-3xl font-bold bg-gradient-to-r from-white to-red-200 bg-clip-text text-transparent"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25, duration: 0.2 }}
                            >
                                Audit Keamanan
                            </motion.h1>
                        </div>
                    </motion.div>
                    <motion.p 
                        className="mt-4 text-red-100/70 max-w-2xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.2 }}
                    >
                        Monitor aktivitas keamanan dan deteksi anomali sistem
                    </motion.p>
                </motion.div>

                {/* Filter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6 shadow-xl"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">Filter Data</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dari Tanggal</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-red-500 focus:ring-red-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-red-500 focus:ring-red-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipe Event</label>
                            <select
                                value={eventType}
                                onChange={e => setEventType(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black/50 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-red-500 focus:ring-red-500 transition-colors"
                            >
                                {eventTypes.map(et => (
                                    <option key={et.value} value={et.value}>{et.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleFilter}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:from-red-500 hover:to-orange-500 transition-all shadow-lg"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Filter
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleExportPdf}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:from-slate-600 hover:to-slate-700 transition-all shadow-lg"
                            >
                                <Download className="h-4 w-4" />
                                PDF
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Security Stats - Dock Style */}
                <div className="grid gap-4 md:grid-cols-4">
                    {[
                        { icon: Activity, label: 'Total Event', value: securityStats.total_events, color: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-blue-600 dark:text-blue-400', borderColor: 'border-blue-500/30' },
                        { icon: AlertTriangle, label: 'Token Duplikat', value: securityStats.token_duplicate, color: 'from-red-500/20 to-rose-500/20', iconColor: 'text-red-600 dark:text-red-400', borderColor: 'border-red-500/30' },
                        { icon: MapPin, label: 'Pelanggaran Zona', value: securityStats.geofence_violation, color: 'from-rose-500/20 to-pink-500/20', iconColor: 'text-rose-400', borderColor: 'border-rose-500/30' },
                        { icon: Clock, label: 'Token Expired', value: securityStats.token_expired, color: 'from-amber-500/20 to-yellow-500/20', iconColor: 'text-amber-600 dark:text-amber-400', borderColor: 'border-amber-500/30' },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ 
                                delay: 0.05 + index * 0.015, 
                                duration: 0.15,
                                ease: "easeOut"
                            }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6 shadow-xl cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundImage: `linear-gradient(to bottom right, ${stat.color})` }} />
                            
                            <div className="relative z-10 flex items-center gap-4">
                                <motion.div
                                    className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} backdrop-blur border ${stat.borderColor}`}
                                    whileHover={{ rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Daily Trend Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12, duration: 0.2, ease: "easeOut" }}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6 shadow-xl"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Tren Harian</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} stroke="#475569" />
                                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} stroke="#475569" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                            border: '1px solid #334155',
                                            borderRadius: '8px',
                                            color: '#fff',
                                        }}
                                    />
                                    <Area type="monotone" dataKey="events" stroke="#ef4444" fill="url(#colorEvents)" strokeWidth={2} />
                                    <defs>
                                        <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Event Distribution Pie */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.14, duration: 0.2, ease: "easeOut" }}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black p-6 shadow-xl"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Distribusi Event</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {pieData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                            border: '1px solid #334155',
                                            borderRadius: '8px',
                                            color: '#fff',
                                        }}
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
                        transition={{ delay: 0.16, duration: 0.2, ease: "easeOut" }}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black shadow-xl overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800/50">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Aktivitas Mencurigakan</h2>
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
                        transition={{ delay: 0.18, duration: 0.2, ease: "easeOut" }}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black shadow-xl overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800/50">
                            <div className="flex items-center gap-2">
                                <UserX className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Mahasiswa Paling Banyak Flag</h2>
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
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${
                                            index === 0 ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30' :
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

                {/* Audit Logs Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.2, ease: "easeOut" }}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-black shadow-xl overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-red-600 dark:text-red-400" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Log Audit</h2>
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                Halaman {auditLogs.current_page} dari {auditLogs.last_page}
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-black/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Waktu</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tipe Event</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Pesan</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Mahasiswa</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Mata Kuliah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                <AnimatePresence>
                                    {auditLogs.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center">
                                                <Activity className="h-10 w-10 mx-auto text-slate-600 mb-2" />
                                                <p className="text-slate-600 dark:text-slate-400">Tidak ada log audit</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        auditLogs.data.map((log, index) => (
                                            <motion.tr
                                                key={log.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: 0.24 + index * 0.01, duration: 0.15 }}
                                                whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.3)' }}
                                                className="transition-colors"
                                            >
                                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                    {log.created_at}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getEventBadge(log.event_type)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                                    {log.message}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {log.mahasiswa ? (
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{log.mahasiswa.nama}</p>
                                                            <p className="text-xs text-slate-500">{log.mahasiswa.nim}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-slate-500">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                    {log.session?.course?.nama || '-'}
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {auditLogs.last_page > 1 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800/50 flex justify-center gap-2">
                            {auditLogs.links.map((link, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: link.url ? 1.05 : 1 }}
                                    whileTap={{ scale: link.url ? 0.95 : 1 }}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    disabled={!link.url}
                                    className={`px-3 py-1 rounded text-sm transition-all ${
                                        link.active
                                            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                                            : link.url
                                            ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-700/50'
                                            : 'bg-slate-900/50 text-slate-600 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </AppLayout>
    );
}
