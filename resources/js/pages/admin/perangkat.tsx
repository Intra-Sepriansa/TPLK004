import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Activity,
    Cpu,
    Download,
    Filter,
    Info,
    Monitor,
    RefreshCw,
    Smartphone,
    Tablet,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

import iconLainnya from '@/assets/admin/perangkat/lainnya.png';
import iconOS from '@/assets/admin/perangkat/os.png';
import iconPerangkat from '@/assets/admin/perangkat/perangkat-icon.png';
import iconPerangkatCard from '@/assets/admin/perangkat/perangkat.png';
import iconTotalScan from '@/assets/admin/perangkat/total-scan.png';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Stats {
    total_scans: number;
    unique_devices: number;
    android_count: number;
    ios_count: number;
    other_count: number;
    mobile_count: number;
    tablet_count: number;
    desktop_count: number;
    android_percentage: number;
    ios_percentage: number;
}

interface Distribution {
    name: string;
    value: number;
}

interface DailyTrend {
    labels: string[];
    datasets: { label: string; data: number[]; color: string }[];
}

interface DeviceLog {
    id: number;
    mahasiswa: string;
    nim: string;
    device_os: string;
    device_model: string;
    device_type: string;
    scanned_at: string;
}

interface TopDevice {
    model: string;
    os: string;
    count: number;
}

interface PageProps {
    osDistribution: Distribution[];
    deviceTypeDistribution: Distribution[];
    deviceModelDistribution: Distribution[];
    stats: Stats;
    dailyTrend: DailyTrend;
    recentLogs: DeviceLog[];
    topDevices: TopDevice[];
    browserDistribution: Distribution[];
    filters: {
        date_from: string;
        date_to: string;
    };
}

const COLORS = [
    '#22c55e',
    '#3b82f6',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#ec4899',
    '#84cc16',
];

const cleanUserAgent = (ua: string) => {
    if (!ua) return 'Unknown Device';
    // Simple regex to extract common device names or return the string if short
    const match = ua.match(/\(([^)]+)\)/);
    if (match && match[1]) {
        return match[1].split(';')[0];
    }
    return ua.length > 30 ? ua.substring(0, 30) + '...' : ua;
};

export default function AdminPerangkat({
    osDistribution,
    deviceTypeDistribution,
    deviceModelDistribution,
    stats,
    dailyTrend,
    recentLogs,
    topDevices,
    filters,
}: PageProps) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);

    const handleFilter = () => {
        router.get(
            '/admin/perangkat',
            { date_from: dateFrom, date_to: dateTo },
            { preserveState: true },
        );
    };

    const handleExportPdf = () => {
        window.open(
            `/admin/perangkat/pdf?date_from=${dateFrom}&date_to=${dateTo}`,
            '_blank',
        );
    };

    // Prepare chart data
    const trendData = dailyTrend.labels.map((label, i) => ({
        name: label,
        Android: dailyTrend.datasets[0]?.data[i] || 0,
        iOS: dailyTrend.datasets[1]?.data[i] || 0,
        Lainnya: dailyTrend.datasets[2]?.data[i] || 0,
    }));

    const getDeviceIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'mobile':
                return <Smartphone className="h-4 w-4" />;
            case 'tablet':
                return <Tablet className="h-4 w-4" />;
            case 'desktop':
                return <Monitor className="h-4 w-4" />;
            default:
                return <Cpu className="h-4 w-4" />;
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04,
                delayChildren: 0.15,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 12,
            },
        },
    };

    const slideInLeft = {
        hidden: { opacity: 0, x: -30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 15,
            },
        },
    };

    const slideInRight = {
        hidden: { opacity: 0, x: 30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 15,
            },
        },
    };

    return (
        <AppLayout>
            <Head title="Perangkat" />

            <motion.div
                className="space-y-6 p-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* ═══════ HEADER — Matching Mahasiswa Style ═══════ */}
                <motion.div
                    variants={itemVariants}
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
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating Animations (Pulses) */}

                    <div className="relative">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
                                <motion.div
                                    className="relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24"
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
                                        delay: 0.2,
                                    }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={iconPerangkat}
                                        alt="Perangkat"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <p className="text-sm font-medium tracking-wide text-indigo-100">
                                        Analisis Sistem
                                    </p>
                                    <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                                        Perangkat Pengguna
                                    </h1>
                                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
                                        Monitor distribusi sistem operasi, tipe
                                        perangkat, dan kompatibilitas aplikasi
                                        secara real-time.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ══════ Key Stats Cards (Matching Dashboard Style) ══════ */}
                <motion.div
                    className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
                    variants={containerVariants}
                >
                    {[
                        {
                            id: 'total',
                            label: 'Total Scan',
                            value: stats.total_scans,
                            sub: `${stats.unique_devices} Perangkat Unik`,
                            iconImg: iconTotalScan,
                            hoverShadow: 'hover:shadow-blue-500/10',
                            glowBg: 'bg-blue-500',
                            gradBg: 'from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10',
                        },
                        {
                            id: 'os',
                            label: 'OS Utama',
                            value: `${stats.android_percentage}%`,
                            sub: `Android: ${stats.android_count} | iOS: ${stats.ios_count}`,
                            iconImg: iconOS,
                            hoverShadow: 'hover:shadow-emerald-500/10',
                            glowBg: 'bg-emerald-500',
                            gradBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
                        },
                        {
                            id: 'device',
                            label: 'Perangkat',
                            value:
                                stats.mobile_count +
                                stats.tablet_count +
                                stats.desktop_count,
                            sub: `Mobile: ${stats.mobile_count} | Desktop: ${stats.desktop_count}`,
                            iconImg: iconPerangkatCard,
                            hoverShadow: 'hover:shadow-purple-500/10',
                            glowBg: 'bg-purple-500',
                            gradBg: 'from-purple-500/5 to-fuchsia-500/5 dark:from-purple-500/10 dark:to-fuchsia-500/10',
                        },
                        {
                            id: 'other',
                            label: 'Lainnya',
                            value: stats.other_count,
                            sub: `${stats.total_scans > 0 ? ((stats.other_count / stats.total_scans) * 100).toFixed(1) : 0}% dari total`,
                            iconImg: iconLainnya,
                            hoverShadow: 'hover:shadow-amber-500/10',
                            glowBg: 'bg-amber-500',
                            gradBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
                        },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.id}
                            variants={itemVariants}
                            className={`group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-6 dark:bg-neutral-900/40 ${stat.hoverShadow} dark:border-white/5`}
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
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${stat.gradBg}`}
                            />
                            <motion.div
                                className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${stat.glowBg} opacity-20 blur-3xl transition-all duration-500 group-hover:opacity-40`}
                            />

                            <div className="relative flex flex-row items-center gap-3 text-left sm:gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                                >
                                    <img
                                        src={stat.iconImg}
                                        alt={stat.label}
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                    />
                                </motion.div>
                                <div>
                                    <p className="text-[10px] leading-tight font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                                        {stat.label}
                                    </p>
                                    <motion.p
                                        className="mt-0.5 text-lg font-bold text-neutral-900 sm:mt-1 sm:text-2xl dark:text-white"
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 200,
                                            damping: 15,
                                            delay: i * 0.05,
                                        }}
                                    >
                                        {stat.value}
                                    </motion.p>
                                    <p className="mt-0.5 text-[9px] text-neutral-400 sm:text-xs dark:text-neutral-500">
                                        {stat.sub}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filter */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-4 flex items-center gap-2">
                        <Filter className="h-5 w-5 text-blue-600" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                            Filter Data
                        </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <Label className="mb-2 block text-sm">
                                Dari Tanggal
                            </Label>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="mb-2 block text-sm">
                                Sampai Tanggal
                            </Label>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end gap-2 md:col-span-2">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button onClick={handleFilter}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Filter
                                </Button>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    onClick={handleExportPdf}
                                    variant="outline"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Export PDF
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Charts Row */}
                <motion.div
                    className="grid gap-6 lg:grid-cols-2"
                    variants={containerVariants}
                >
                    {/* Daily Trend */}
                    <motion.div
                        variants={slideInLeft}
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        whileHover={{ scale: 1.01, y: -2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                Tren Penggunaan Harian
                            </h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e2e8f0"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11 }}
                                        stroke="#94a3b8"
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        stroke="#94a3b8"
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="Android"
                                        stackId="1"
                                        stroke="#22c55e"
                                        fill="#22c55e"
                                        fillOpacity={0.6}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="iOS"
                                        stackId="1"
                                        stroke="#3b82f6"
                                        fill="#3b82f6"
                                        fillOpacity={0.6}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Lainnya"
                                        stackId="1"
                                        stroke="#94a3b8"
                                        fill="#94a3b8"
                                        fillOpacity={0.6}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* OS Distribution Pie */}
                    <motion.div
                        variants={slideInRight}
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        whileHover={{ scale: 1.01, y: -2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="mb-4 flex items-center gap-2">
                            <Smartphone className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                Distribusi OS
                            </h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={osDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) =>
                                            `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`
                                        }
                                    >
                                        {osDistribution.map((_, index) => (
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
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Device Model & Recent Logs */}
                <motion.div
                    className="grid gap-6 lg:grid-cols-3"
                    variants={containerVariants}
                >
                    {/* Device Model Distribution */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        whileHover={{ scale: 1.01, y: -2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="mb-4 flex items-center gap-2">
                            <Cpu className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                Model Perangkat
                            </h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={deviceModelDistribution}
                                    layout="vertical"
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e2e8f0"
                                    />
                                    <XAxis
                                        type="number"
                                        tick={{ fontSize: 10 }}
                                        stroke="#94a3b8"
                                    />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tick={{ fontSize: 9 }}
                                        stroke="#94a3b8"
                                        width={100}
                                    />
                                    <Tooltip />
                                    <Bar
                                        dataKey="value"
                                        fill="#6366f1"
                                        radius={[0, 4, 4, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Top Devices */}
                    <motion.div
                        variants={itemVariants}
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        whileHover={{ scale: 1.01, y: -2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-emerald-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    Top Perangkat
                                </h2>
                            </div>
                        </div>
                        <div className="max-h-72 divide-y divide-slate-200 overflow-y-auto dark:divide-slate-800">
                            {topDevices.length === 0 ? (
                                <div className="p-6 text-center text-slate-500">
                                    Tidak ada data
                                </div>
                            ) : (
                                topDevices.map((d, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex items-center gap-3 p-3"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{
                                            x: 4,
                                            backgroundColor:
                                                'rgba(59, 130, 246, 0.05)',
                                        }}
                                    >
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                                i === 0
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : i === 1
                                                      ? 'bg-slate-200 text-slate-700'
                                                      : i === 2
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {i + 1}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                                {cleanUserAgent(d.model)}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {d.os}
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold text-blue-600">
                                            {d.count}x
                                        </span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Device Type Distribution */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        whileHover={{ scale: 1.01, y: -2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="mb-4 flex items-center gap-2">
                            <Monitor className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                Tipe Perangkat
                            </h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={deviceTypeDistribution}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, percent }) =>
                                            `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`
                                        }
                                    >
                                        {deviceTypeDistribution.map(
                                            (_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        COLORS[
                                                            index %
                                                                COLORS.length
                                                        ]
                                                    }
                                                />
                                            ),
                                        )}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Recent Logs Table */}
                <motion.div
                    variants={itemVariants}
                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">
                                Log Perangkat Terbaru
                            </h2>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-black/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                                        Waktu
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                                        Mahasiswa
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                                        OS
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                                        Model
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                                        Tipe
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {recentLogs.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-12 text-center"
                                        >
                                            <Smartphone className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                                            <p className="text-slate-500">
                                                Tidak ada data perangkat
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    recentLogs.map((log, index) => (
                                        <motion.tr
                                            key={log.id}
                                            className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-black/30"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ x: 4 }}
                                            onClick={() =>
                                                router.visit(
                                                    `/admin/perangkat/${log.id}`,
                                                )
                                            }
                                        >
                                            <td className="px-4 py-3 text-sm whitespace-nowrap text-slate-600">
                                                {log.scanned_at}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {log.mahasiswa}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {log.nim}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                                                        log.device_os?.includes(
                                                            'Android',
                                                        )
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : log.device_os?.includes(
                                                                    'iOS',
                                                                )
                                                              ? 'bg-blue-100 text-blue-700'
                                                              : 'bg-slate-100 text-slate-700'
                                                    }`}
                                                >
                                                    {log.device_os}
                                                </span>
                                            </td>
                                            <td
                                                className="max-w-xs truncate px-4 py-3 text-sm text-slate-600"
                                                title={log.device_model}
                                            >
                                                {cleanUserAgent(
                                                    log.device_model,
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                                                    {getDeviceIcon(
                                                        log.device_type,
                                                    )}
                                                    {log.device_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="opacity-0 transition-opacity group-hover:opacity-100"
                                                >
                                                    <Info className="h-4 w-4 text-slate-400 hover:text-blue-500" />
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}
