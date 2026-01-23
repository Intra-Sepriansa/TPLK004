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

            <div className="space-y-6">
                {/* Header Section dengan style dashboard */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                            Sistem Analitik
                        </p>
                        <ScrollFloat
                            containerClassName="!my-0"
                            textClassName="!text-2xl font-display text-slate-900 dark:text-white"
                            animationDuration={0.8}
                            ease="power2.out"
                            scrollStart="top bottom-=100"
                            scrollEnd="top center"
                            stagger={0.02}
                        >
                            Advanced Analytics
                        </ScrollFloat>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            Analisis mendalam dengan prediksi AI dan deteksi anomali real-time
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {['day', 'week', 'month', 'year'].map((p) => (
                            <Button
                                key={p}
                                variant={selectedPeriod === p ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedPeriod(p)}
                            >
                                {p === 'day' ? 'Hari' : p === 'week' ? 'Minggu' : p === 'month' ? 'Bulan' : 'Tahun'}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Metric Cards dengan style dashboard */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                    Kehadiran
                                </p>
                                <p className="mt-2 font-display text-3xl text-slate-900 dark:text-white">
                                    {stats.attendance_rate}%
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                        </div>
                        {stats.rate_change !== undefined && (
                            <div className="mt-3 flex items-center gap-1 text-xs">
                                {stats.rate_change >= 0 ? (
                                    <>
                                        <TrendingUp className="h-3 w-3 text-emerald-600" />
                                        <span className="text-emerald-600">+{stats.rate_change}%</span>
                                    </>
                                ) : (
                                    <>
                                        <TrendingDown className="h-3 w-3 text-rose-600" />
                                        <span className="text-rose-600">{stats.rate_change}%</span>
                                    </>
                                )}
                                <span className="text-slate-500">dari periode sebelumnya</span>
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                    Mahasiswa Aktif
                                </p>
                                <p className="mt-2 font-display text-3xl text-slate-900 dark:text-white">
                                    {stats.active_students}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                <Users className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-slate-500">
                            dari {stats.total_students} total mahasiswa
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                    Total Sesi
                                </p>
                                <p className="mt-2 font-display text-3xl text-slate-900 dark:text-white">
                                    {stats.total_sessions}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                                <Calendar className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-slate-500">sesi aktif</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                    Anomali
                                </p>
                                <p className="mt-2 font-display text-3xl text-slate-900 dark:text-white">
                                    {anomalies.length}
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-slate-500">perlu perhatian</p>
                    </motion.div>
                </div>

                {/* Attendance Trend Chart dengan style dashboard */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                >
                    <div className="mb-6">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                            Tren
                        </p>
                        <h2 className="font-display text-xl text-slate-900 dark:text-white">
                            Tren Kehadiran
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Pola kehadiran dalam periode waktu
                        </p>
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
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                }}
                                labelStyle={{ color: '#0f172a' }}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="rate"
                                stroke="#3b82f6"
                                strokeWidth={2}
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

                {/* Course Comparison & Device Distribution dengan style dashboard */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="mb-6">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                Performa
                            </p>
                            <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                Performa Mata Kuliah
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Perbandingan tingkat kehadiran
                            </p>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={courseComparison}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                                <XAxis
                                    dataKey="course_name"
                                    stroke="#94a3b8"
                                    style={{ fontSize: '11px' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                    }}
                                    labelStyle={{ color: '#0f172a' }}
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="mb-6">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                Distribusi
                            </p>
                            <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                Distribusi Perangkat
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Perangkat yang digunakan mahasiswa
                            </p>
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
                                    }}
                                    labelStyle={{ color: '#0f172a' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* Hourly Pattern dengan style dashboard */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                >
                    <div className="mb-6">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                            Pola Waktu
                        </p>
                        <h2 className="font-display text-xl text-slate-900 dark:text-white">
                            Pola Kehadiran Per Jam
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Distribusi kehadiran berdasarkan waktu
                        </p>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={hourlyPattern}>
                            <defs>
                                <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                            <XAxis dataKey="hour" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                }}
                                labelStyle={{ color: '#0f172a' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="url(#hourlyGradient)"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Top Performers & At-Risk Students dengan style dashboard */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                    Prestasi
                                </p>
                                <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                    Top Performers
                                </h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Mahasiswa dengan kehadiran terbaik
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                <Sparkles className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            {topPerformers.map((student, index) => (
                                <div
                                    key={student.id}
                                    className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-slate-50 p-3 dark:border-slate-800 dark:bg-black"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {student.name}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {student.nim}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                                            {student.attendance_count}
                                        </p>
                                        <p className="text-xs text-slate-500">kehadiran</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                    Perhatian
                                </p>
                                <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                    Mahasiswa Berisiko
                                </h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Perlu perhatian khusus
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            {atRiskStudents.map((student) => (
                                <div
                                    key={student.id}
                                    className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-slate-50 p-3 dark:border-slate-800 dark:bg-black"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {student.name}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {student.nim}
                                        </p>
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
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Anomalies dengan style dashboard */}
                {anomalies.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                    Deteksi AI
                                </p>
                                <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                    Anomali Terdeteksi
                                </h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Pola tidak biasa yang terdeteksi sistem
                                </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                                <Eye className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            {anomalies.map((anomaly) => (
                                <div
                                    key={anomaly.id}
                                    className={`rounded-xl border-2 p-4 ${getSeverityColor(
                                        anomaly.severity
                                    )}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <AlertTriangle
                                                    className={`h-4 w-4 ${getSeverityTextColor(
                                                        anomaly.severity
                                                    )}`}
                                                />
                                                <p
                                                    className={`text-xs font-bold uppercase ${getSeverityTextColor(
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
                                            <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                                                {anomaly.type
                                                    .replace(/_/g, ' ')
                                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                                {anomaly.description}
                                            </p>
                                            <p className="mt-2 text-xs text-slate-500">
                                                {anomaly.created_at}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}
