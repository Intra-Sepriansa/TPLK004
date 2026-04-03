import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    Eye,
    Filter,
    Globe,
    Laptop,
    MapPin,
    RefreshCw,
    Shield,
    TrendingUp,
    UserX,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';

import auditIcon from '@/assets/admin/audit/audit-icon.png';
import expiredIcon from '@/assets/admin/audit/expired.png';
import pelanggaranZonaIcon from '@/assets/admin/audit/pelanggaran-zona.png';
import tokenDuplikatIcon from '@/assets/admin/audit/token-duplikat.png';
import totalEventIcon from '@/assets/admin/audit/total-event.png';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
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
        links: unknown[];
        current_page: number;
        last_page: number;
    };
    securityStats: SecurityStats;
    eventDistribution: EventDistribution[];
    dailyTrend: DailyTrend;
    suspiciousActivities: SuspiciousActivity[];
    topFlaggedStudents: FlaggedStudent[];
    websiteLoginHistory: Array<{
        id: string;
        source: string;
        action: string;
        label: string;
        status: 'success' | 'failed';
        user_name: string;
        user_identifier: string;
        user_type: string;
        ip_address?: string | null;
        user_agent?: string | null;
        device: string;
        description?: string | null;
        created_at: string;
    }>;
    loginInsights: {
        total_logins: number;
        successful_logins: number;
        failed_logins: number;
        unique_users: number;
        unique_ips: number;
    };
    filters: {
        date_from: string;
        date_to: string;
        event_type: string;
    };
    eventTypes: EventType[];
}

const COLORS = [
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#f43f5e',
    '#f97316',
    '#eab308',
    '#22c55e',
    '#14b8a6',
];

const eventTypeConfig: Record<
    string,
    { label: string; color: string; icon: LucideIcon }
> = {
    token_expired: {
        label: 'Token Expired',
        color: 'bg-amber-100 text-amber-700',
        icon: Clock,
    },
    token_duplicate: {
        label: 'Token Duplikat',
        color: 'bg-red-100 text-red-700',
        icon: AlertTriangle,
    },
    geofence_violation: {
        label: 'Pelanggaran Zona',
        color: 'bg-rose-100 text-rose-700',
        icon: MapPin,
    },
    login_failed: {
        label: 'Login Gagal',
        color: 'bg-orange-100 text-orange-700',
        icon: UserX,
    },
    login_success: {
        label: 'Login Berhasil',
        color: 'bg-emerald-100 text-emerald-700',
        icon: CheckCircle,
    },
    suspicious_activity: {
        label: 'Aktivitas Mencurigakan',
        color: 'bg-purple-100 text-purple-700',
        icon: AlertCircle,
    },
    attendance_success: {
        label: 'Absensi Berhasil',
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle,
    },
    selfie_uploaded: {
        label: 'Selfie Diupload',
        color: 'bg-blue-100 text-blue-700',
        icon: Eye,
    },
};

export default function AdminAudit({
    auditLogs,
    securityStats,
    eventDistribution,
    dailyTrend,
    suspiciousActivities,
    topFlaggedStudents,
    websiteLoginHistory,
    loginInsights,
    filters,
    eventTypes,
}: PageProps) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [eventType, setEventType] = useState(filters.event_type);

    const handleFilter = () => {
        router.get(
            '/admin/audit',
            { date_from: dateFrom, date_to: dateTo, event_type: eventType },
            { preserveState: true },
        );
    };

    const handleExportPdf = () => {
        window.open(
            `/admin/audit/pdf?date_from=${dateFrom}&date_to=${dateTo}&event_type=${eventType}`,
            '_blank',
        );
    };

    const trendData = dailyTrend.labels.map((label, i) => ({
        name: label,
        events: dailyTrend.values[i],
    }));

    const pieData = eventDistribution.map((e) => ({
        name: eventTypeConfig[e.event_type]?.label || e.event_type,
        value: e.total,
    }));

    const getEventBadge = (type: string) => {
        const config = eventTypeConfig[type] || {
            label: type,
            color: 'bg-slate-100 text-slate-700',
            icon: Activity,
        };
        const Icon = config.icon;
        return (
            <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.color}`}
            >
                <Icon className="h-3 w-3" />
                {config.label}
            </span>
        );
    };

    return (
        <AppLayout>
            <Head title="Audit Keamanan" />

            <div className="space-y-6 p-6">
                {/* ═══════ HEADER — Advanced Animated Gradient ═══════ */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 100,
                    }}
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
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />

                    {/* Overlay & Glow Orbs */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                    <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center md:gap-4">
                        <div className="flex w-full flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left">
                            <motion.div
                                className="relative flex h-24 w-24 shrink-0 sm:h-20 sm:w-20"
                                initial={{
                                    opacity: 0,
                                    scale: 0.5,
                                    rotate: -10,
                                }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    delay: 0.2,
                                }}
                                whileHover={{ scale: 1.05, rotate: 5 }}
                            >
                                <img
                                    src={auditIcon}
                                    alt="Audit Keamanan"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
                                />
                            </motion.div>
                            <div className="mt-1 flex-1 sm:mt-0">
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mb-1 text-sm font-medium tracking-wide text-indigo-100"
                                >
                                    Keamanan Sistem
                                </motion.p>
                                <motion.h1
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-2xl font-bold tracking-tight sm:text-3xl"
                                >
                                    Audit Keamanan
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-2 max-w-xl border-l-2 border-indigo-300/50 pl-3 text-sm text-indigo-50 italic"
                                >
                                    Monitor aktivitas keamanan realtime, deteksi
                                    anomali, dan riwayat akses sistem untuk
                                    memastikan integritas data.
                                </motion.p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Security Stats - Staggered Spring Animations */}
                <motion.div
                    className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.04 },
                        },
                    }}
                >
                    {[
                        {
                            imageIcon: totalEventIcon,
                            label: 'Total Event',
                            value: securityStats.total_events,
                            color: 'blue',
                        },
                        {
                            imageIcon: tokenDuplikatIcon,
                            label: 'Token Duplikat',
                            value: securityStats.token_duplicate,
                            color: 'red',
                        },
                        {
                            imageIcon: pelanggaranZonaIcon,
                            label: 'Pelanggaran Zona',
                            value: securityStats.geofence_violation,
                            color: 'purple',
                        },
                        {
                            imageIcon: expiredIcon,
                            label: 'Token Expired',
                            value: securityStats.token_expired,
                            color: 'amber',
                        },
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            variants={{
                                hidden: { opacity: 0, y: 30, scale: 0.9 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 20,
                                    },
                                },
                            }}
                            whileHover={{
                                scale: 1.04,
                                y: -4,
                                transition: {
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 15,
                                },
                            }}
                        >
                            <StatCard
                                imageIcon={card.imageIcon}
                                label={card.label}
                                value={card.value}
                                color={card.color}
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filter Section - Glassmorphism */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-700">
                        <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
                            <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                            Filter & Export
                        </h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                Dari Tanggal
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-white/50 py-2.5 pr-4 pl-10 text-sm transition-all focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-black/20"
                                />
                                <Calendar className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                Sampai Tanggal
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white/50 py-2.5 pr-4 pl-10 text-sm transition-all focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-black/20"
                                />
                                <Calendar className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                Tipe Event
                            </label>
                            <div className="relative">
                                <select
                                    value={eventType}
                                    onChange={(e) =>
                                        setEventType(e.target.value)
                                    }
                                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white/50 py-2.5 pr-4 pl-10 text-sm transition-all focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-black/20"
                                >
                                    {eventTypes.map((et) => (
                                        <option key={et.value} value={et.value}>
                                            {et.label}
                                        </option>
                                    ))}
                                </select>
                                <Filter className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex items-end gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleFilter}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Terapkan
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleExportPdf}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
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
                        transition={{
                            delay: 0.12,
                            duration: 0.2,
                            ease: 'easeOut',
                        }}
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-6 flex items-center gap-3">
                            <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                                <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                                Tren Harian
                            </h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient
                                            id="colorEvents"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#ef4444"
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#ef4444"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#E2E8F0"
                                        opacity={0.5}
                                    />
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
                                            backgroundColor:
                                                'rgba(255, 255, 255, 0.9)',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow:
                                                '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            color: '#1e293b',
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
                        transition={{
                            delay: 0.14,
                            duration: 0.2,
                            ease: 'easeOut',
                        }}
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-6 flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                                Distribusi Event
                            </h2>
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
                                        label={({
                                            name,
                                            percent,
                                        }: {
                                            name?: string | number;
                                            percent?: number;
                                        }) =>
                                            `${name ?? ''} ${(percent ? percent * 100 : 0).toFixed(0)}%`
                                        }
                                    >
                                        {pieData.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    COLORS[
                                                        index % COLORS.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor:
                                                'rgba(255, 255, 255, 0.9)',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow:
                                                '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            color: '#1e293b',
                                        }}
                                        itemStyle={{ color: '#1e293b' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {[
                        {
                            label: 'Total Login',
                            value: loginInsights.total_logins,
                            icon: Globe,
                            color:
                                'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
                        },
                        {
                            label: 'User Unik',
                            value: loginInsights.unique_users,
                            icon: CheckCircle,
                            color:
                                'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
                        },
                        {
                            label: 'IP Unik',
                            value: loginInsights.unique_ips,
                            icon: Laptop,
                            color:
                                'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
                        },
                    ].map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.16 + index * 0.03 }}
                                className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`rounded-2xl p-3 ${item.color}`}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {item.label}
                                        </p>
                                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="border-b border-gray-100 p-6 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
                                <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                                    Riwayat Login Website
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Menampilkan login sukses dan gagal dari data
                                    baru maupun data lama yang sudah pernah
                                    terekam.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/5">
                                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        Waktu
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        IP / Device
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        Sumber
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {websiteLoginHistory.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-12 text-center"
                                        >
                                            <Globe className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                            <p className="font-medium text-gray-500">
                                                Belum ada riwayat login website
                                                pada rentang tanggal ini
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    websiteLoginHistory.map((entry, index) => (
                                        <motion.tr
                                            key={entry.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.01 * index }}
                                            className="transition-colors hover:bg-blue-50/40 dark:hover:bg-blue-900/10"
                                        >
                                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-600 dark:text-gray-300">
                                                {entry.created_at}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {entry.user_name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {entry.user_identifier}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {entry.user_type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        entry.status ===
                                                        'success'
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                                                    }`}
                                                >
                                                    {entry.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-600 dark:text-slate-300">
                                                    <p>{entry.ip_address || '-'}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {entry.device}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-slate-600 dark:text-slate-300">
                                                    <p>{entry.source}</p>
                                                    {entry.description && (
                                                        <p className="mt-1 max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">
                                                            {entry.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Suspicious Activities & Flagged Students */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Suspicious Activities */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="border-b border-gray-100 p-6 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
                                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                                    Aktivitas Mencurigakan
                                </h2>
                            </div>
                        </div>
                        <div className="max-h-80 divide-y divide-slate-800/50 overflow-y-auto">
                            {suspiciousActivities.length === 0 ? (
                                <div className="p-8 text-center">
                                    <CheckCircle className="mx-auto mb-2 h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Tidak ada aktivitas mencurigakan
                                    </p>
                                </div>
                            ) : (
                                suspiciousActivities.map((activity, index) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: 0.18 + index * 0.02,
                                            duration: 0.15,
                                        }}
                                        className="p-4 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/30"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                                    {activity.mahasiswa}
                                                </p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                                    {activity.nim} •{' '}
                                                    {activity.course}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {activity.message}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                {getEventBadge(
                                                    activity.event_type,
                                                )}
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {activity.created_at}
                                                </p>
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
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="border-b border-gray-100 p-6 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
                                    <UserX className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                                    Mahasiswa Paling Banyak Flag
                                </h2>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-800/50">
                            {topFlaggedStudents.length === 0 ? (
                                <div className="p-8 text-center">
                                    <CheckCircle className="mx-auto mb-2 h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Tidak ada mahasiswa yang di-flag
                                    </p>
                                </div>
                            ) : (
                                topFlaggedStudents.map((student, index) => (
                                    <motion.div
                                        key={student.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: 0.2 + index * 0.015,
                                            duration: 0.15,
                                        }}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        className="flex cursor-pointer items-center gap-4 p-4 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/30"
                                    >
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold ${
                                                index === 0
                                                    ? 'border border-red-500/30 bg-red-500/20 text-red-600 dark:text-red-400'
                                                    : index === 1
                                                      ? 'border border-amber-500/30 bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                      : 'border border-slate-500/30 bg-slate-500/20 text-slate-600 dark:text-slate-400'
                                            }`}
                                        >
                                            {index + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                                {student.nama}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                                {student.nim}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/20 px-2 py-1 text-xs font-bold text-red-600 dark:text-red-400">
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
                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="border-b border-gray-100 p-6 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/30">
                                    <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                                    Log Audit
                                </h2>
                            </div>
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500 dark:bg-gray-800">
                                Halaman {auditLogs.current_page} dari{' '}
                                {auditLogs.last_page}
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-white/5">
                                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        Waktu
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        Tipe Event
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        Pesan
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        Mahasiswa
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold tracking-wider text-gray-500 uppercase">
                                        Info Tambahan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                <AnimatePresence>
                                    {auditLogs.data.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-12 text-center"
                                            >
                                                <Activity className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                                <p className="font-medium text-gray-500">
                                                    Tidak ada log audit yang
                                                    ditemukan
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        auditLogs.data.map((log, index) => (
                                            <motion.tr
                                                key={log.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{
                                                    delay: 0.05 * index,
                                                }}
                                                className="cursor-pointer transition-colors hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.visit(
                                                        `/admin/audit/${log.id}`,
                                                    );
                                                }}
                                            >
                                                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-600 dark:text-gray-300">
                                                    {log.created_at}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getEventBadge(
                                                        log.event_type,
                                                    )}
                                                </td>
                                                <td className="max-w-xs truncate px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                    {log.message}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {log.mahasiswa ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 ring-2 ring-white">
                                                                {log.mahasiswa.nama.charAt(
                                                                    0,
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-800 dark:text-white">
                                                                    {
                                                                        log
                                                                            .mahasiswa
                                                                            .nama
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {
                                                                        log
                                                                            .mahasiswa
                                                                            .nim
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">
                                                            System / Guest
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {log.session?.course
                                                        ?.nama || '-'}
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

            {/* Detail Modal removed in favor of dedicated detail page */}
        </AppLayout>
    );
}

function StatCard({
    icon: Icon,
    imageIcon,
    label,
    value,
    sub,
    color,
}: {
    icon?: LucideIcon;
    imageIcon?: string;
    label: string;
    value: number | string;
    sub?: string;
    color: string;
}) {
    const [isHovered, setIsHovered] = useState(false);

    // Map colors to matching dashboard configurations
    const colorConfigs: Record<
        string,
        {
            bg: string;
            hoverShadow: string;
            gradientBg: string;
            iconBg: string;
        }
    > = {
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
        amber: {
            bg: 'bg-amber-500',
            hoverShadow: 'group-hover:shadow-amber-500/10',
            gradientBg:
                'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
            iconBg: 'from-amber-400 to-orange-600 shadow-amber-500/30',
        },
        purple: {
            bg: 'bg-violet-500',
            hoverShadow: 'group-hover:shadow-violet-500/10',
            gradientBg:
                'from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10',
            iconBg: 'from-violet-400 to-purple-600 shadow-violet-500/30',
        },
        blue: {
            bg: 'bg-sky-500',
            hoverShadow: 'group-hover:shadow-sky-500/10',
            gradientBg:
                'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
            iconBg: 'from-sky-400 to-indigo-600 shadow-sky-500/30',
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
        <div
            className={`group relative h-full overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 dark:bg-neutral-900/40 ${c.hoverShadow} cursor-pointer dark:border-white/5`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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
                    <p className="text-[10px] leading-tight font-medium tracking-wider text-neutral-500 uppercase sm:text-sm dark:text-gray-400">
                        {label}
                    </p>
                    <div className="mt-0.5 sm:mt-1">
                        <span className="text-lg font-bold text-neutral-900 sm:text-2xl dark:text-white">
                            {value}
                        </span>
                    </div>
                    {sub && (
                        <p className="mt-0.5 text-[8px] leading-tight text-neutral-400 sm:text-xs">
                            {sub}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
