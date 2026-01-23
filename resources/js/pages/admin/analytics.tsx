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
    Minus,
    Sparkles,
    Brain,
    Eye,
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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: 'easeOut',
        },
    },
};

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
                return 'text-rose-600 bg-rose-100 dark:bg-rose-900/20';
            case 'high':
                return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
            default:
                return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
        }
    };

    return (
        <AppLayout>
            <Head title="Analytics & Prediksi" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* Header dengan Gradient */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-8 backdrop-blur dark:border-slate-800/70">
                    {/* Animated Background Circles */}
                    <div className="absolute -right-20 -top-20 h-64 w-64 animate-pulse rounded-full bg-blue-500/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 animate-pulse rounded-full bg-purple-500/10 blur-3xl" style={{ animationDelay: '1s' }} />
                    
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{
                                        rotate: [0, 360],
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
                                >
                                    <Brain className="h-7 w-7 text-white" />
                                </motion.div>
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                        Analytics & Prediksi
                                    </h1>
                                    <p className="mt-1 text-slate-600 dark:text-slate-300">
                                        Analisis mendalam dengan AI-powered insights
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {['day', 'week', 'month', 'year'].map((p) => (
                                <Button
                                    key={p}
                                    variant={selectedPeriod === p ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedPeriod(p)}
                                    className="capitalize"
                                >
                                    {p === 'day' ? 'Hari' : p === 'week' ? 'Minggu' : p === 'month' ? 'Bulan' : 'Tahun'}
                                </Button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Key Metrics Cards dengan Animasi */}
                <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur transition-all hover:shadow-xl dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-blue-500/10 blur-2xl transition-all group-hover:scale-150" />
                        <div className="relative">
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 transition-all group-hover:scale-110 group-hover:bg-blue-500/20">
                                    <BarChart3 className="h-6 w-6 text-blue-500" />
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                    {stats.rate_change >= 0 ? (
                                        <>
                                            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                            <span className="font-semibold text-emerald-500">
                                                +{stats.rate_change}%
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <ArrowDownRight className="h-4 w-4 text-rose-500" />
                                            <span className="font-semibold text-rose-500">
                                                {stats.rate_change}%
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Tingkat Kehadiran
                                </p>
                                <motion.p
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                                    className="mt-2 text-3xl font-bold text-slate-900 dark:text-white"
                                >
                                    {stats.attendance_rate}%
                                </motion.p>
                                <p className="mt-1 text-xs text-slate-500">vs periode sebelumnya</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur transition-all hover:shadow-xl dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/10 blur-2xl transition-all group-hover:scale-150" />
                        <div className="relative">
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 transition-all group-hover:scale-110 group-hover:bg-emerald-500/20">
                                    <Users className="h-6 w-6 text-emerald-500" />
                                </div>
                                <Sparkles className="h-5 w-5 text-emerald-500 opacity-50" />
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Mahasiswa Aktif
                                </p>
                                <motion.p
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                                    className="mt-2 text-3xl font-bold text-slate-900 dark:text-white"
                                >
                                    {stats.active_students}
                                </motion.p>
                                <p className="mt-1 text-xs text-slate-500">
                                    dari {stats.total_students} total
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur transition-all hover:shadow-xl dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-orange-500/10 blur-2xl transition-all group-hover:scale-150" />
                        <div className="relative">
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 transition-all group-hover:scale-110 group-hover:bg-orange-500/20">
                                    <Calendar className="h-6 w-6 text-orange-500" />
                                </div>
                                <Activity className="h-5 w-5 text-orange-500 opacity-50" />
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Total Sesi
                                </p>
                                <motion.p
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
                                    className="mt-2 text-3xl font-bold text-slate-900 dark:text-white"
                                >
                                    {stats.total_sessions}
                                </motion.p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {stats.total_attendance} scan kehadiran
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur transition-all hover:shadow-xl dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-rose-500/10 blur-2xl transition-all group-hover:scale-150" />
                        <div className="relative">
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 transition-all group-hover:scale-110 group-hover:bg-rose-500/20">
                                    <AlertTriangle className="h-6 w-6 text-rose-500" />
                                </div>
                                <Eye className="h-5 w-5 text-rose-500 opacity-50" />
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Anomali Terdeteksi
                                </p>
                                <motion.p
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                                    className="mt-2 text-3xl font-bold text-slate-900 dark:text-white"
                                >
                                    {anomalies.length}
                                </motion.p>
                                <p className="mt-1 text-xs text-rose-500">
                                    {anomalies.filter((a) => a.severity === 'critical').length}{' '}
                                    kritis
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Attendance Trend Chart dengan Gradient */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                📈 Tren Kehadiran
                            </h3>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Pola kehadiran dalam periode waktu
                            </p>
                        </div>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                        >
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                        </motion.div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={attendanceTrend}>
                            <defs>
                                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                stroke="#64748b"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                }}
                            />
                            <Legend />
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
                </motion.div>

                {/* Course Comparison & Device Distribution */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.01 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    📚 Performa Mata Kuliah
                                </h3>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                    Perbandingan tingkat kehadiran
                                </p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={courseComparison}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                                <XAxis
                                    dataKey="course_name"
                                    stroke="#64748b"
                                    style={{ fontSize: '11px' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="rate"
                                    fill="url(#barGradient)"
                                    name="Tingkat Kehadiran (%)"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.01 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    📱 Distribusi Perangkat
                                </h3>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                    Perangkat yang digunakan mahasiswa
                                </p>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={deviceDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                    outerRadius={90}
                                    fill="#8884d8"
                                    dataKey="count"
                                    animationBegin={0}
                                    animationDuration={800}
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
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* Hourly Pattern */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                ⏰ Pola Kehadiran Per Jam
                            </h3>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Distribusi kehadiran berdasarkan waktu
                            </p>
                        </div>
                        <Clock className="h-5 w-5 text-purple-500" />
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={hourlyPattern}>
                            <defs>
                                <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                            <XAxis dataKey="hour" stroke="#64748b" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                }}
                            />
                            <Bar
                                dataKey="count"
                                fill="url(#hourlyGradient)"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Top Performers & At-Risk Students */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    🏆 Top Performers
                                </h3>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                    Mahasiswa dengan kehadiran terbaik
                                </p>
                            </div>
                            <Sparkles className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {topPerformers.map((student, index) => (
                                    <motion.div
                                        key={student.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        className="flex items-center gap-3 rounded-xl border border-slate-200/50 bg-gradient-to-r from-emerald-50/50 to-transparent p-3 transition-all dark:border-slate-700/50 dark:from-emerald-900/10"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-bold text-white shadow-lg">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {student.name}
                                            </p>
                                            <p className="text-xs text-slate-500">{student.nim}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-emerald-600 dark:text-emerald-400">
                                                {student.attendance_count}
                                            </p>
                                            <p className="text-xs text-slate-500">scans</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    ⚠️ Mahasiswa Berisiko
                                </h3>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                    Perlu perhatian khusus
                                </p>
                            </div>
                            <AlertTriangle className="h-5 w-5 text-rose-500" />
                        </div>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {atRiskStudents.map((student, index) => (
                                    <motion.div
                                        key={student.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        className="flex items-center gap-3 rounded-xl border border-rose-200/50 bg-gradient-to-r from-rose-50/50 to-transparent p-3 transition-all dark:border-rose-700/50 dark:from-rose-900/10"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg">
                                            <AlertTriangle className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {student.name}
                                            </p>
                                            <p className="text-xs text-slate-500">{student.nim}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-rose-600 dark:text-rose-400">
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
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                {/* Anomalies */}
                {anomalies.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    🚨 Anomali Terbaru
                                </h3>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                    Pola tidak biasa yang terdeteksi sistem
                                </p>
                            </div>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Eye className="h-5 w-5 text-rose-500" />
                            </motion.div>
                        </div>
                        <div className="space-y-3">
                            <AnimatePresence>
                                {anomalies.map((anomaly, index) => (
                                    <motion.div
                                        key={anomaly.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.01, x: 5 }}
                                        className="flex items-start gap-3 rounded-xl border border-slate-200/50 bg-slate-50/50 p-4 transition-all dark:border-slate-700/50 dark:bg-slate-800/50"
                                    >
                                        <div
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getSeverityColor(
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
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-900 dark:text-white">
                                                {anomaly.type
                                                    .replace(/_/g, ' ')
                                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                {anomaly.description}
                                            </p>
                                            <p className="mt-2 text-xs text-slate-500">
                                                {anomaly.created_at}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AppLayout>
    );
}
