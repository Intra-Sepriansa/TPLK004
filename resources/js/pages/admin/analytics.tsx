import { Head } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Users,
    Activity,
    AlertTriangle,
    BarChart3,
    Calendar,
    Clock,
    Target,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Brain,
    Eye,
    TrendingUpDown,
    Cpu,
    Layers,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import ScrollFloat from '@/components/ui/scroll-float';
import { Button } from '@/components/ui/button';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart,
} from 'recharts';

interface AnalyticsProps {
    stats: {
        total_sessions: number;
        total_attendance: number;
        attendance_rate: number;
        rate_change: number;
        total_students: number;
        active_students: number;
    };
    attendanceTrend: Array<{
        date: string;
        attendance: number;
        sessions: number;
        rate: number;
    }>;
    heatmapData: Array<{
        day: number;
        hour: number;
        value: number;
    }>;
    courseComparison: Array<{
        course_name: string;
        sessions: number;
        attendance: number;
        rate: number;
    }>;
    deviceDistribution: Array<{
        device: string;
        count: number;
    }>;
    hourlyPattern: Array<{
        hour: string;
        count: number;
    }>;
    predictions: Array<{
        date: string;
        predicted_rate: number;
        confidence: number;
    }>;
    anomalies: Array<{
        id: number;
        type: string;
        severity: string;
        description: string;
        created_at: string;
    }>;
    topPerformers: Array<{
        id: number;
        name: string;
        nim: string;
        attendance_count: number;
    }>;
    atRiskStudents: Array<{
        id: number;
        name: string;
        nim: string;
        attendance_rate: number;
        risk_level: string;
    }>;
    period: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export default function AnalyticsPage({
    stats,
    attendanceTrend,
    courseComparison,
    deviceDistribution,
    hourlyPattern,
    predictions,
    anomalies,
    topPerformers,
    atRiskStudents,
    period,
}: AnalyticsProps) {
    const [selectedPeriod, setSelectedPeriod] = useState(period);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'border-rose-500/50 bg-rose-500/10';
            case 'high':
                return 'border-orange-500/50 bg-orange-500/10';
            case 'medium':
                return 'border-yellow-500/50 bg-yellow-500/10';
            default:
                return 'border-blue-500/50 bg-blue-500/10';
        }
    };

    const getSeverityTextColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'text-rose-400';
            case 'high':
                return 'text-orange-400';
            case 'medium':
                return 'text-yellow-400';
            default:
                return 'text-blue-400';
        }
    };

    return (
        <AppLayout>
            <Head title="Advanced Analytics" />

            <div className="space-y-8 pb-12">
                {/* Animated Header with ScrollFloat */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl"
                >
                    {/* Animated Background Gradient */}
                    <motion.div
                        className="absolute inset-0 opacity-30"
                        animate={{
                            background: [
                                'radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 50%)',
                                'radial-gradient(circle at 100% 100%, #8b5cf6 0%, transparent 50%)',
                                'radial-gradient(circle at 0% 100%, #ec4899 0%, transparent 50%)',
                                'radial-gradient(circle at 100% 0%, #3b82f6 0%, transparent 50%)',
                                'radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 50%)',
                            ],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    />

                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50"
                            >
                                <Brain className="h-8 w-8 text-white" />
                            </motion.div>
                            <div>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <p className="text-sm font-medium text-blue-400">Sistem Analitik Cerdas</p>
                                    <h1 className="text-4xl font-bold text-white">
                                        Advanced Analytics
                                    </h1>
                                </motion.div>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="mt-2 text-slate-300"
                                >
                                    Analisis mendalam dengan prediksi AI dan deteksi anomali real-time
                                </motion.p>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex gap-2"
                        >
                            {['day', 'week', 'month', 'year'].map((p, index) => (
                                <motion.button
                                    key={p}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedPeriod(p)}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                        selectedPeriod === p
                                            ? 'bg-white text-slate-900 shadow-lg'
                                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                                    }`}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                >
                                    {p === 'day' ? 'Hari' : p === 'week' ? 'Minggu' : p === 'month' ? 'Bulan' : 'Tahun'}
                                </motion.button>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* ScrollFloat Section Title */}
                <ScrollFloat
                    containerClassName="text-center"
                    textClassName="font-bold text-white"
                >
                    Metrik Utama
                </ScrollFloat>

                {/* Metric Cards dengan Animasi Advanced */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            icon: BarChart3,
                            label: 'Tingkat Kehadiran',
                            value: `${stats.attendance_rate}%`,
                            change: stats.rate_change,
                            color: 'blue',
                            gradient: 'from-blue-500 to-cyan-500',
                        },
                        {
                            icon: Users,
                            label: 'Mahasiswa Aktif',
                            value: stats.active_students,
                            subValue: `dari ${stats.total_students}`,
                            color: 'emerald',
                            gradient: 'from-emerald-500 to-teal-500',
                        },
                        {
                            icon: Calendar,
                            label: 'Total Sesi',
                            value: stats.total_sessions,
                            subValue: 'sesi aktif',
                            color: 'purple',
                            gradient: 'from-purple-500 to-pink-500',
                        },
                        {
                            icon: AlertTriangle,
                            label: 'Anomali Terdeteksi',
                            value: anomalies.length,
                            subValue: 'perlu perhatian',
                            color: 'rose',
                            gradient: 'from-rose-500 to-orange-500',
                        },
                    ].map((metric, index) => (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="group relative overflow-hidden rounded-2xl bg-slate-900 p-6 shadow-2xl"
                        >
                            {/* Animated Glow Effect */}
                            <motion.div
                                className={`absolute -inset-1 bg-gradient-to-r ${metric.gradient} opacity-0 blur-xl transition-opacity group-hover:opacity-30`}
                                animate={{
                                    scale: [1, 1.2, 1],
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            />

                            <div className="relative z-10">
                                <div className="flex items-start justify-between">
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.6 }}
                                        className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${metric.gradient} shadow-lg`}
                                    >
                                        <metric.icon className="h-7 w-7 text-white" />
                                    </motion.div>

                                    {metric.change !== undefined && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                                                metric.change >= 0
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-rose-500/20 text-rose-400'
                                            }`}
                                        >
                                            {metric.change >= 0 ? (
                                                <TrendingUp className="h-3 w-3" />
                                            ) : (
                                                <TrendingDown className="h-3 w-3" />
                                            )}
                                            {Math.abs(metric.change)}%
                                        </motion.div>
                                    )}
                                </div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    className="mt-4"
                                >
                                    <p className="text-sm font-medium text-slate-400">{metric.label}</p>
                                    <p className="mt-2 text-3xl font-bold text-white">{metric.value}</p>
                                    {metric.subValue && (
                                        <p className="mt-1 text-xs text-slate-500">{metric.subValue}</p>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ScrollFloat Section Title */}
                <ScrollFloat
                    containerClassName="text-center"
                    textClassName="font-bold text-white"
                >
                    Tren & Analisis
                </ScrollFloat>

                {/* Attendance Trend Chart dengan Container Hitam */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    whileHover={{ y: -4 }}
                    className="group relative overflow-hidden rounded-2xl bg-slate-900 p-8 shadow-2xl"
                >
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 blur-2xl transition-opacity group-hover:opacity-20" />

                    <div className="relative z-10">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                                        <TrendingUpDown className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Tren Kehadiran</h3>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Pola kehadiran dalam periode waktu
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <motion.div
                                animate={{ rotate: [0, 5, 0, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <Activity className="h-8 w-8 text-blue-400" />
                            </motion.div>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={attendanceTrend}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    style={{ fontSize: '12px', fontWeight: 500 }}
                                />
                                <YAxis stroke="#94a3b8" style={{ fontSize: '12px', fontWeight: 500 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.98)',
                                        border: '1px solid #475569',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                    }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Area
                                    type="monotone"
                                    dataKey="rate"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fill="url(#colorRate)"
                                    name="Tingkat Kehadiran (%)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="attendance"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    fill="url(#colorAttendance)"
                                    name="Total Kehadiran"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Course Comparison & Device Distribution */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        whileHover={{ y: -4 }}
                        className="group relative overflow-hidden rounded-2xl bg-slate-900 p-8 shadow-2xl"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 blur-2xl transition-opacity group-hover:opacity-20" />

                        <div className="relative z-10">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                                    <Layers className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Performa Mata Kuliah</h3>
                                    <p className="text-sm text-slate-400">Perbandingan tingkat kehadiran</p>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={courseComparison}>
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                                    <XAxis
                                        dataKey="course_name"
                                        stroke="#94a3b8"
                                        style={{ fontSize: '11px', fontWeight: 500 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                    />
                                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px', fontWeight: 500 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.98)',
                                            border: '1px solid #475569',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                        }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                    <Bar
                                        dataKey="rate"
                                        fill="url(#barGradient)"
                                        name="Tingkat Kehadiran (%)"
                                        radius={[10, 10, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        whileHover={{ y: -4 }}
                        className="group relative overflow-hidden rounded-2xl bg-slate-900 p-8 shadow-2xl"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 blur-2xl transition-opacity group-hover:opacity-20" />

                        <div className="relative z-10">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                                    <Cpu className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Distribusi Perangkat</h3>
                                    <p className="text-sm text-slate-400">Perangkat yang digunakan</p>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={320}>
                                <PieChart>
                                    <Pie
                                        data={deviceDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(0)}%`
                                        }
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                        animationBegin={0}
                                        animationDuration={1000}
                                    >
                                        {deviceDistribution.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.98)',
                                            border: '1px solid #475569',
                                            borderRadius: '12px',
                                            color: '#fff',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Hourly Pattern */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    whileHover={{ y: -4 }}
                    className="group relative overflow-hidden rounded-2xl bg-slate-900 p-8 shadow-2xl"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-orange-500 opacity-0 blur-2xl transition-opacity group-hover:opacity-20" />

                    <div className="relative z-10">
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-orange-500">
                                    <Clock className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Pola Kehadiran Per Jam</h3>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Distribusi kehadiran berdasarkan waktu
                                    </p>
                                </div>
                            </div>
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Target className="h-8 w-8 text-pink-400" />
                            </motion.div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={hourlyPattern}>
                                <defs>
                                    <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.9} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                                <XAxis
                                    dataKey="hour"
                                    stroke="#94a3b8"
                                    style={{ fontSize: '12px', fontWeight: 500 }}
                                />
                                <YAxis stroke="#94a3b8" style={{ fontSize: '12px', fontWeight: 500 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.98)',
                                        border: '1px solid #475569',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                    }}
                                />
                                <Bar dataKey="count" fill="url(#hourlyGradient)" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* ScrollFloat Section Title */}
                <ScrollFloat
                    containerClassName="text-center"
                    textClassName="font-bold text-white"
                >
                    Prediksi & Deteksi
                </ScrollFloat>

                {/* Top Performers & At-Risk Students */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9, duration: 0.6 }}
                        whileHover={{ y: -4 }}
                        className="group relative overflow-hidden rounded-2xl bg-slate-900 p-8 shadow-2xl"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 blur-2xl transition-opacity group-hover:opacity-20" />

                        <div className="relative z-10">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                                        <Sparkles className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Top Performers</h3>
                                        <p className="text-sm text-slate-400">Mahasiswa terbaik</p>
                                    </div>
                                </div>
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                >
                                    <Zap className="h-6 w-6 text-yellow-400" />
                                </motion.div>
                            </div>
                            <div className="space-y-3">
                                {topPerformers.map((student, index) => (
                                    <motion.div
                                        key={student.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.9 + index * 0.05 }}
                                        whileHover={{ x: 4, scale: 1.02 }}
                                        className="flex items-center gap-4 rounded-xl bg-slate-800/50 p-4 backdrop-blur transition-all hover:bg-slate-800"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white ${
                                                index === 0
                                                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50'
                                                    : index === 1
                                                    ? 'bg-gradient-to-br from-slate-300 to-slate-500 shadow-lg shadow-slate-500/50'
                                                    : index === 2
                                                    ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/50'
                                                    : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                                            }`}
                                        >
                                            {index + 1}
                                        </motion.div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-white">{student.name}</p>
                                            <p className="text-xs text-slate-400">{student.nim}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-emerald-400">
                                                {student.attendance_count}
                                            </p>
                                            <p className="text-xs text-slate-500">kehadiran</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0, duration: 0.6 }}
                        whileHover={{ y: -4 }}
                        className="group relative overflow-hidden rounded-2xl bg-slate-900 p-8 shadow-2xl"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 to-orange-500 opacity-0 blur-2xl transition-opacity group-hover:opacity-20" />

                        <div className="relative z-10">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500">
                                        <AlertTriangle className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Mahasiswa Berisiko</h3>
                                        <p className="text-sm text-slate-400">Perlu perhatian khusus</p>
                                    </div>
                                </div>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Eye className="h-6 w-6 text-rose-400" />
                                </motion.div>
                            </div>
                            <div className="space-y-3">
                                {atRiskStudents.map((student, index) => (
                                    <motion.div
                                        key={student.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.0 + index * 0.05 }}
                                        whileHover={{ x: 4, scale: 1.02 }}
                                        className="flex items-center gap-4 rounded-xl bg-slate-800/50 p-4 backdrop-blur transition-all hover:bg-slate-800"
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: -5 }}
                                            className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/50"
                                        >
                                            <AlertTriangle className="h-6 w-6" />
                                        </motion.div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-white">{student.name}</p>
                                            <p className="text-xs text-slate-400">{student.nim}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-rose-400">
                                                {student.attendance_rate}%
                                            </p>
                                            <p className="text-xs capitalize text-slate-500">
                                                {student.risk_level === 'high'
                                                    ? 'Tinggi'
                                                    : student.risk_level === 'medium'
                                                    ? 'Sedang'
                                                    : 'Rendah'}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Anomalies dengan Design Baru */}
                {anomalies.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1, duration: 0.6 }}
                        whileHover={{ y: -4 }}
                        className="group relative overflow-hidden rounded-2xl bg-slate-900 p-8 shadow-2xl"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-orange-500 to-yellow-500 opacity-0 blur-2xl transition-opacity group-hover:opacity-20" />

                        <div className="relative z-10">
                            <div className="mb-8 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500">
                                        <Eye className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Anomali Terdeteksi</h3>
                                        <p className="mt-1 text-sm text-slate-400">
                                            Pola tidak biasa yang terdeteksi sistem AI
                                        </p>
                                    </div>
                                </div>
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, 180, 360],
                                    }}
                                    transition={{ duration: 4, repeat: Infinity }}
                                >
                                    <Brain className="h-8 w-8 text-rose-400" />
                                </motion.div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {anomalies.map((anomaly, index) => (
                                    <motion.div
                                        key={anomaly.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 1.1 + index * 0.05 }}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        className={`rounded-xl border-2 p-5 backdrop-blur transition-all ${getSeverityColor(
                                            anomaly.severity
                                        )}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <motion.div
                                                        animate={{ rotate: [0, 10, -10, 0] }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            delay: index * 0.2,
                                                        }}
                                                    >
                                                        <AlertTriangle
                                                            className={`h-5 w-5 ${getSeverityTextColor(
                                                                anomaly.severity
                                                            )}`}
                                                        />
                                                    </motion.div>
                                                    <p
                                                        className={`text-sm font-bold uppercase ${getSeverityTextColor(
                                                            anomaly.severity
                                                        )}`}
                                                    >
                                                        {anomaly.severity === 'critical'
                                                            ? 'Kritis'
                                                            : anomaly.severity === 'high'
                                                            ? 'Tinggi'
                                                            : anomaly.severity === 'medium'
                                                            ? 'Sedang'
                                                            : 'Rendah'}
                                                    </p>
                                                </div>
                                                <p className="mt-3 font-semibold text-white">
                                                    {anomaly.type
                                                        .replace(/_/g, ' ')
                                                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                                                </p>
                                                <p className="mt-2 text-sm text-slate-300">
                                                    {anomaly.description}
                                                </p>
                                                <p className="mt-3 text-xs text-slate-500">
                                                    {anomaly.created_at}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}
