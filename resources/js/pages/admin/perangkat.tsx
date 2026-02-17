import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Smartphone,
    Monitor,
    Tablet,
    Download,
    Filter,
    RefreshCw,
    TrendingUp,
    Cpu,
    Activity,
    Globe,
    Wifi,
    Server,
    X,
    Info,
    Calendar,
    User,
    Hash,
    Code,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';


import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    Legend,
    BarChart,
    Bar,
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

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

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
    const [selectedLog, setSelectedLog] = useState<DeviceLog | null>(null);

    const handleFilter = () => {
        router.get('/admin/perangkat', { date_from: dateFrom, date_to: dateTo }, { preserveState: true });
    };

    const handleExportPdf = () => {
        window.open(`/admin/perangkat/pdf?date_from=${dateFrom}&date_to=${dateTo}`, '_blank');
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
            case 'mobile': return <Smartphone className="h-4 w-4" />;
            case 'tablet': return <Tablet className="h-4 w-4" />;
            case 'desktop': return <Monitor className="h-4 w-4" />;
            default: return <Cpu className="h-4 w-4" />;
        }
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 12
            }
        }
    };

    const slideInLeft = {
        hidden: { opacity: 0, x: -30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 15
            }
        }
    };

    const slideInRight = {
        hidden: { opacity: 0, x: 30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <AppLayout>
            <Head title="Perangkat" />

            <motion.div className="p-6 space-y-6" initial="hidden" animate="visible" variants={containerVariants}>
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
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 2 }}
                    />

                    <div className="relative">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <motion.div
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <Monitor className="h-8 w-8 text-white" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-indigo-100 font-medium tracking-wide">Analisis Sistem</p>
                                    <h1 className="text-3xl font-bold text-white">Perangkat Pengguna</h1>
                                    <p className="mt-1 text-indigo-100 max-w-lg">
                                        Monitor distribusi sistem operasi, tipe perangkat, dan kompatibilitas aplikasi secara real-time.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Filter */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-sm backdrop-blur-xl dark:border-white/5"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="h-5 w-5 text-blue-600" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">Filter Data</h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <Label className="mb-2 block text-sm">Dari Tanggal</Label>
                            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                        </div>
                        <div>
                            <Label className="mb-2 block text-sm">Sampai Tanggal</Label>
                            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                        </div>
                        <div className="flex items-end gap-2 md:col-span-2">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button onClick={handleFilter}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Filter
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button onClick={handleExportPdf} variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export PDF
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* ══════ Key Stats Cards (Consolidated) ══════ */}
                <motion.div
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
                    variants={containerVariants}
                >
                    {/* Card 1: Total Activity */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-sm backdrop-blur-xl transition-all dark:border-white/5"
                        whileHover={{ scale: 1.03, y: -5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                                    <Activity className="h-6 w-6" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total_scans}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Scan</p>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-white/5 rounded-lg p-2 w-fit backdrop-blur-sm border border-white/10">
                                <Cpu className="h-3 w-3" />
                                {stats.unique_devices} Perangkat Unik
                            </div>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
                            <Activity className="h-40 w-40 text-blue-600" />
                        </div>
                    </motion.div>

                    {/* Card 2: Platform Dominance (Android vs iOS) */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-sm backdrop-blur-xl transition-all dark:border-white/5"
                        whileHover={{ scale: 1.03, y: -5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                                    <Smartphone className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg border border-emerald-500/20">OS Utama</span>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600 dark:text-slate-300">Android</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{stats.android_percentage}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200/50 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${stats.android_percentage}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600 dark:text-slate-300">iOS</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{stats.ios_percentage}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200/50 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${stats.ios_percentage}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Form Factors */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-sm backdrop-blur-xl transition-all dark:border-white/5"
                        whileHover={{ scale: 1.03, y: -5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                                    <Monitor className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Smartphone className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mobile</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{stats.mobile_count}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Tablet className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tablet</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{stats.tablet_count}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Monitor className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Desktop</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{stats.desktop_count}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 4: Other / Health */}
                    <motion.div
                        variants={itemVariants}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-sm backdrop-blur-xl transition-all dark:border-white/5"
                        whileHover={{ scale: 1.03, y: -5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl text-white shadow-lg shadow-amber-500/20">
                                    <Server className="h-6 w-6" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white h-9">{stats.other_count}</h3>
                                <p className="text-sm text-slate-500 font-medium">Lainnya / Tidak Terdeteksi</p>
                            </div>
                            <div className="mt-4">
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-2">
                                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(stats.other_count / stats.total_scans) * 100}%` }}></div>
                                </div>
                                <p className="text-xs text-slate-400">
                                    {(stats.other_count / stats.total_scans * 100).toFixed(1)}% dari total lalu lintas
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Charts Row */}
                <motion.div
                    className="grid gap-6 lg:grid-cols-2"
                    variants={containerVariants}
                >
                    {/* Daily Trend */}
                    <motion.div
                        variants={slideInLeft}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-sm backdrop-blur-xl dark:border-white/5"
                        whileHover={{ scale: 1.01, y: -2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Tren Penggunaan Harian</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="Android" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                                    <Area type="monotone" dataKey="iOS" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                                    <Area type="monotone" dataKey="Lainnya" stackId="1" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.6} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* OS Distribution Pie */}
                    <motion.div
                        variants={slideInRight}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-sm backdrop-blur-xl dark:border-white/5"
                        whileHover={{ scale: 1.01, y: -2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Smartphone className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Distribusi OS</h2>
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
                                        label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                    >
                                        {osDistribution.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-sm backdrop-blur-xl dark:border-white/5"
                        whileHover={{ scale: 1.01, y: -2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Cpu className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Model Perangkat</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deviceModelDistribution} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} stroke="#94a3b8" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Top Devices */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-sm backdrop-blur-xl dark:border-white/5 overflow-hidden"
                        whileHover={{ scale: 1.01, y: -2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-emerald-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Top Perangkat</h2>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-72 overflow-y-auto">
                            {topDevices.length === 0 ? (
                                <div className="p-6 text-center text-slate-500">Tidak ada data</div>
                            ) : (
                                topDevices.map((d, i) => (
                                    <motion.div
                                        key={i}
                                        className="p-3 flex items-center gap-3"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ x: 4, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                                    >
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-200 text-slate-700' : i === 2 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{cleanUserAgent(d.model)}</p>
                                            <p className="text-xs text-slate-500">{d.os}</p>
                                        </div>
                                        <span className="text-sm font-bold text-blue-600">{d.count}x</span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Device Type Distribution */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-sm backdrop-blur-xl dark:border-white/5"
                        whileHover={{ scale: 1.01, y: -2 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Monitor className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Tipe Perangkat</h2>
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
                                        label={({ name, percent }) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                    >
                                        {deviceTypeDistribution.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
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
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-sm backdrop-blur-xl dark:border-white/5 overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Log Perangkat Terbaru</h2>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-black/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Waktu</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Mahasiswa</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">OS</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Model</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tipe</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {recentLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center">
                                            <Smartphone className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                            <p className="text-slate-500">Tidak ada data perangkat</p>
                                        </td>
                                    </tr>
                                ) : (
                                    recentLogs.map((log, index) => (
                                        <motion.tr
                                            key={log.id}
                                            className="hover:bg-slate-50 dark:hover:bg-black/30 cursor-pointer group"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ x: 4 }}
                                            onClick={() => setSelectedLog(log)}
                                        >
                                            <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{log.scanned_at}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{log.mahasiswa}</p>
                                                <p className="text-xs text-slate-500">{log.nim}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${log.device_os?.includes('Android') ? 'bg-emerald-100 text-emerald-700' :
                                                    log.device_os?.includes('iOS') ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }`}>
                                                    {log.device_os}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600 truncate max-w-xs" title={log.device_model}>
                                                {cleanUserAgent(log.device_model)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                                                    {getDeviceIcon(log.device_type)}
                                                    {log.device_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
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

            {/* ══════ DETAIL MODAL ══════ */}
            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedLog(null)}
                        />
                        <motion.div
                            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-zinc-900"
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            {/* Modal Header */}
                            <div className="relative overflow-hidden bg-slate-900 p-6 text-white">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90" />
                                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                                <div className="relative flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md border border-white/20 shadow-inner">
                                            {getDeviceIcon(selectedLog.device_type)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-indigo-200">Detail Perangkat</p>
                                            <h2 className="text-xl font-bold">{cleanUserAgent(selectedLog.device_model)}</h2>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedLog(null)}
                                        className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {/* Info Grid */}
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                                            <User className="h-4 w-4" />
                                            Info Mahasiswa
                                        </h3>
                                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800/50 dark:bg-black/20">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold dark:bg-blue-900/30 dark:text-blue-400">
                                                    {selectedLog.mahasiswa.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{selectedLog.mahasiswa}</p>
                                                    <p className="text-xs text-slate-500">{selectedLog.nim}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                                            <Activity className="h-4 w-4" />
                                            Info Sesi
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800/50 dark:bg-black/20">
                                                <p className="text-xs text-slate-500 mb-1">Waktu Akses</p>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3 w-3 text-slate-400" />
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedLog.scanned_at}</p>
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800/50 dark:bg-black/20">
                                                <p className="text-xs text-slate-500 mb-1">OS System</p>
                                                <div className="flex items-center gap-2">
                                                    <Cpu className="h-3 w-3 text-slate-400" />
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedLog.device_os}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Technical Details */}
                                <div className="space-y-3">
                                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
                                        <Code className="h-4 w-4" />
                                        User Agent String (Raw)
                                    </h3>
                                    <div className="relative group">
                                        <div className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-slate-300 font-mono text-xs leading-relaxed shadow-inner">
                                            {selectedLog.device_model}
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 italic">
                                        Data ini digunakan untuk identifikasi jenis perangkat dan browser yang digunakan mahasiswa saat melakukan absensi.
                                    </p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="border-t border-slate-100 bg-slate-50 p-4 flex justify-end dark:border-slate-800 dark:bg-black/20">
                                <Button variant="outline" onClick={() => setSelectedLog(null)}>
                                    Tutup Detail
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
}
