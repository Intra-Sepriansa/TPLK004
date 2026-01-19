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
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-black p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-100">Keamanan Sistem</p>
                                <h1 className="text-2xl font-bold">Audit Keamanan</h1>
                            </div>
                        </div>
                        <p className="mt-4 text-blue-100">
                            Monitor aktivitas keamanan dan deteksi anomali sistem
                        </p>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-blue-600" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">Filter Data</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dari Tanggal</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-black dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-black dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipe Event</label>
                            <select
                                value={eventType}
                                onChange={e => setEventType(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-black dark:text-white"
                            >
                                {eventTypes.map(et => (
                                    <option key={et.value} value={et.value}>{et.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                onClick={handleFilter}
                                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Filter
                            </button>
                            <button
                                onClick={handleExportPdf}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-gray-900 to-black px-4 py-2.5 text-sm font-medium text-white hover:from-gray-800 hover:to-gray-900 transition-all"
                            >
                                <Download className="h-4 w-4" />
                                PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Total Event</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{securityStats.total_events}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Token Duplikat</p>
                                <p className="text-xl font-bold text-red-600 dark:text-red-400">{securityStats.token_duplicate}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Pelanggaran Zona</p>
                                <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{securityStats.geofence_violation}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Token Expired</p>
                                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{securityStats.token_expired}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Daily Trend Chart */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Tren Harian</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255,255,255,0.95)',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Area type="monotone" dataKey="events" stroke="#6366f1" fill="url(#colorEvents)" strokeWidth={2} />
                                    <defs>
                                        <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Event Distribution Pie */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="h-5 w-5 text-blue-600" />
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
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Suspicious Activities & Flagged Students */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Suspicious Activities */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Aktivitas Mencurigakan</h2>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-80 overflow-y-auto">
                            {suspiciousActivities.length === 0 ? (
                                <div className="p-8 text-center">
                                    <CheckCircle className="h-10 w-10 mx-auto text-emerald-400 mb-2" />
                                    <p className="text-slate-500">Tidak ada aktivitas mencurigakan</p>
                                </div>
                            ) : (
                                suspiciousActivities.map(activity => (
                                    <div key={activity.id} className="p-4 hover:bg-slate-50 dark:hover:bg-black/30">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{activity.mahasiswa}</p>
                                                <p className="text-xs text-slate-500">{activity.nim} • {activity.course}</p>
                                                <p className="text-xs text-slate-400 mt-1">{activity.message}</p>
                                            </div>
                                            <div className="text-right">
                                                {getEventBadge(activity.event_type)}
                                                <p className="text-xs text-slate-400 mt-1">{activity.created_at}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Top Flagged Students */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <UserX className="h-5 w-5 text-amber-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Mahasiswa Paling Banyak Flag</h2>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {topFlaggedStudents.length === 0 ? (
                                <div className="p-8 text-center">
                                    <CheckCircle className="h-10 w-10 mx-auto text-emerald-400 mb-2" />
                                    <p className="text-slate-500">Tidak ada mahasiswa yang di-flag</p>
                                </div>
                            ) : (
                                topFlaggedStudents.map((student, index) => (
                                    <div key={student.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-black/30">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${
                                            index === 0 ? 'bg-red-100 text-red-700' :
                                            index === 1 ? 'bg-amber-100 text-amber-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{student.nama}</p>
                                            <p className="text-xs text-slate-500">{student.nim}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                                {student.total_flags} flags
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Audit Logs Table */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Log Audit</h2>
                            </div>
                            <span className="text-sm text-slate-500">
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
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {auditLogs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center">
                                            <Activity className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                            <p className="text-slate-500">Tidak ada log audit</p>
                                        </td>
                                    </tr>
                                ) : (
                                    auditLogs.data.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-black/30 transition-colors">
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
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                                {log.session?.course?.nama || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {auditLogs.last_page > 1 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-2">
                            {auditLogs.links.map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    disabled={!link.url}
                                    className={`px-3 py-1 rounded text-sm ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : link.url
                                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                            : 'bg-slate-50 text-slate-400 cursor-not-allowed dark:bg-black'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
