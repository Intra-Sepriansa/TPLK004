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
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
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
                {/* Header */}
                <motion.div 
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-lg"
                >
                    <motion.div 
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0]
                        }}
                        transition={{ 
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div 
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                        animate={{ 
                            scale: [1, 1.3, 1],
                            rotate: [0, -90, 0]
                        }}
                        transition={{ 
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <motion.div 
                                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <Smartphone className="h-6 w-6" />
                            </motion.div>
                            <div>
                                <p className="text-sm text-blue-100">Analisis</p>
                                <h1 className="text-2xl font-bold">Perangkat Pengguna</h1>
                            </div>
                        </div>
                        <p className="mt-4 text-blue-100">
                            Pantau distribusi OS, tipe perangkat, dan kompatibilitas sistem
                        </p>
                    </div>
                </motion.div>

                {/* Filter */}
                <motion.div 
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black"
                    whileHover={{ scale: 1.005, y: -2 }}
                    transition={{ type: 'spring', stiffness: 300 }}
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
                                    <RefreshCw className="h-4 w-4" />
                                    Filter
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button onClick={handleExportPdf} className="bg-gradient-to-r from-blue-500 to-purple-600">
                                    <Download className="h-4 w-4" />
                                    Export PDF
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div 
                    className="grid gap-4 md:grid-cols-4 lg:grid-cols-8"
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black" whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Scan</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total_scans}</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black" whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                <Cpu className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Perangkat</p>
                                <p className="text-xl font-bold text-purple-600">{stats.unique_devices}</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black" whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Android</p>
                                <p className="text-xl font-bold text-emerald-600">{stats.android_percentage}%</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black" whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">iOS</p>
                                <p className="text-xl font-bold text-blue-600">{stats.ios_percentage}%</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black" whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Mobile</p>
                                <p className="text-xl font-bold text-cyan-600">{stats.mobile_count}</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black" whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                                <Tablet className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Tablet</p>
                                <p className="text-xl font-bold text-amber-600">{stats.tablet_count}</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black" whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                <Monitor className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Desktop</p>
                                <p className="text-xl font-bold text-slate-600">{stats.desktop_count}</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black" whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                <Cpu className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Lainnya</p>
                                <p className="text-xl font-bold text-red-600">{stats.other_count}</p>
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
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black"
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
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black"
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
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black"
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
                        className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black overflow-hidden"
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
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                            i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-200 text-slate-700' : i === 2 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{d.model}</p>
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
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black"
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
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-black overflow-hidden"
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
                                <tr className="bg-slate-50 dark:bg-slate-900/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Waktu</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Mahasiswa</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">OS</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Model</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tipe</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {recentLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center">
                                            <Smartphone className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                            <p className="text-slate-500">Tidak ada data perangkat</p>
                                        </td>
                                    </tr>
                                ) : (
                                    recentLogs.map((log, index) => (
                                        <motion.tr 
                                            key={log.id} 
                                            className="hover:bg-slate-50 dark:hover:bg-slate-900/30"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ x: 4 }}
                                        >
                                            <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{log.scanned_at}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{log.mahasiswa}</p>
                                                <p className="text-xs text-slate-500">{log.nim}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                    log.device_os?.includes('Android') ? 'bg-emerald-100 text-emerald-700' :
                                                    log.device_os?.includes('iOS') ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {log.device_os}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{log.device_model}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                                                    {getDeviceIcon(log.device_type)}
                                                    {log.device_type}
                                                </span>
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
