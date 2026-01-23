import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
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

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                                <BarChart3 className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Manajemen</p>
                                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                                    Analytics & Prediksi
                                </h1>
                            </div>
                        </div>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                            Analisis mendalam dan prediksi kehadiran mahasiswa
                        </p>
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

                {/* Metric Cards - Style seperti Total Tugas, Published, Draft, Overdue */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl bg-slate-900/50 p-6 backdrop-blur dark:bg-slate-900/50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                                <BarChart3 className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Tingkat Kehadiran</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-semibold text-white">
                                        {stats.attendance_rate}%
                                    </p>
                                    {stats.rate_change >= 0 ? (
                                        <span className="flex items-center text-xs text-emerald-400">
                                            <TrendingUp className="mr-1 h-3 w-3" />
                                            +{stats.rate_change}%
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-xs text-rose-400">
                                            <TrendingDown className="mr-1 h-3 w-3" />
                                            {stats.rate_change}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-xl bg-slate-900/50 p-6 backdrop-blur dark:bg-slate-900/50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                                <Users className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Mahasiswa Aktif</p>
                                <p className="text-2xl font-semibold text-white">
                                    {stats.active_students}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-xl bg-slate-900/50 p-6 backdrop-blur dark:bg-slate-900/50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-500/10">
                                <Calendar className="h-6 w-6 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Total Sesi</p>
                                <p className="text-2xl font-semibold text-white">
                                    {stats.total_sessions}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-xl bg-slate-900/50 p-6 backdrop-blur dark:bg-slate-900/50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/10">
                                <AlertTriangle className="h-6 w-6 text-rose-500" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Anomali</p>
                                <p className="text-2xl font-semibold text-white">
                                    {anomalies.length}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Attendance Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-xl bg-slate-900/50 p-6 backdrop-blur dark:bg-slate-900/50"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                Tren Kehadiran
                            </h3>
                            <p className="mt-1 text-sm text-slate-400">
                                Pola kehadiran dalam periode waktu
                            </p>
                        </div>
                        <TrendingUp className="h-5 w-5 text-blue-500" />
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
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                stroke="#94a3b8"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                    color: '#fff',
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="rounded-xl bg-slate-900/50 p-6 backdrop-blur dark:bg-slate-900/50"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    Performa Mata Kuliah
                                </h3>
                                <p className="mt-1 text-sm text-slate-400">
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
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
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
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                        color: '#fff',
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="rounded-xl bg-slate-900/50 p-6 backdrop-blur dark:bg-slate-900/50"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    Distribusi Perangkat
                                </h3>
                                <p className="mt-1 text-sm text-slate-400">
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
                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                        color: '#fff',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* Hourly Pattern */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="rounded-xl bg-slate-900/50 p-6 backdrop-blur dark:bg-slate-900/50"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                Pola Kehadiran Per Jam
                            </h3>
                            <p className="mt-1 text-sm text-slate-400">
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
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="hour" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                    color: '#fff',
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="rounded-xl bg-slate-900/50 p-6 backdrop-blur dark:bg-slate-900/50"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    Top Performers
                                </h3>
                                <p className="mt-1 text-sm text-slate-400">
                                    Mahasiswa dengan kehadiran terbaik
                                </p>
                            </div>
                            <Sparkles className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="space-y-3">
                            {topPerformers.map((student, index) => (
                                <motion.div
                                    key={student.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + index * 0.05 }}
                                    className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3 transition-all hover:bg-slate-800"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-white">
                                            {student.name}
                                        </p>
                                        <p className="text-xs text-slate-400">{student.nim}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-400">
                                            {student.attendance_count}
                                        </p>
                                        <p className="text-xs text-slate-500">scans</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="rounded-xl bg-slate-900/50 p-6 backdrop-blur dark:bg-slate-900/50"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    Mahasiswa Berisiko
                                </h3>
                                <p className="mt-1 text-sm text-slate-400">
                                    Perlu perhatian khusus
                                </p>
                            </div>
                            <AlertTriangle className="h-5 w-5 text-rose-500" />
                        </div>
                        <div className="space-y-3">
                            {atRiskStudents.map((student, index) => (
                                <motion.div
                                    key={student.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.9 + index * 0.05 }}
                                    className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3 transition-all hover:bg-slate-800"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-white">
                                            {student.name}
                                        </p>
                                        <p className="text-xs text-slate-400">{student.nim}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-rose-400">
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
                    </motion.div>
                </div>

                {/* Anomalies */}
                {anomalies.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 }}
                        className="rounded-xl bg-slate-900/50 p-6 backdrop-blur dark:bg-slate-900/50"
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    Anomali Terbaru
                                </h3>
                                <p className="mt-1 text-sm text-slate-400">
                                    Pola tidak biasa yang terdeteksi sistem
                                </p>
                            </div>
                            <Eye className="h-5 w-5 text-rose-500" />
                        </div>
                        <div className="space-y-3">
                            {anomalies.map((anomaly, index) => (
                                <motion.div
                                    key={anomaly.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1.0 + index * 0.05 }}
                                    className="flex items-start gap-3 rounded-lg bg-slate-800/50 p-4 transition-all hover:bg-slate-800"
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
                                        <p className="font-semibold text-white">
                                            {anomaly.type
                                                .replace(/_/g, ' ')
                                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-400">
                                            {anomaly.description}
                                        </p>
                                        <p className="mt-2 text-xs text-slate-500">
                                            {anomaly.created_at}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}
