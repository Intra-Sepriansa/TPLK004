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
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import ScrollFloat from '@/components/ui/scroll-float';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

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
            <Head title="Advanced Analytics" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <ScrollFloat
                            containerClassName="!my-0"
                            textClassName="!text-3xl font-bold text-slate-900 dark:text-white"
                            animationDuration={0.8}
                            ease="power2.out"
                            scrollStart="top bottom-=100"
                            scrollEnd="top center"
                            stagger={0.02}
                        >
                            📊 Advanced Analytics
                        </ScrollFloat>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">
                            Deep insights into attendance patterns and student behavior
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={selectedPeriod === 'day' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedPeriod('day')}
                        >
                            Day
                        </Button>
                        <Button
                            variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedPeriod('week')}
                        >
                            Week
                        </Button>
                        <Button
                            variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedPeriod('month')}
                        >
                            Month
                        </Button>
                        <Button
                            variant={selectedPeriod === 'year' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedPeriod('year')}
                        >
                            Year
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 backdrop-blur dark:border-slate-800/70"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Attendance Rate
                                </p>
                                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                                    {stats.attendance_rate}%
                                </p>
                                <div className="mt-2 flex items-center gap-1 text-sm">
                                    {stats.rate_change >= 0 ? (
                                        <>
                                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                                            <span className="font-semibold text-emerald-500">
                                                +{stats.rate_change}%
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <TrendingDown className="h-4 w-4 text-rose-500" />
                                            <span className="font-semibold text-rose-500">
                                                {stats.rate_change}%
                                            </span>
                                        </>
                                    )}
                                    <span className="text-slate-500">vs last period</span>
                                </div>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                                <BarChart3 className="h-6 w-6 text-blue-500" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 backdrop-blur dark:border-slate-800/70"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Active Students
                                </p>
                                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                                    {stats.active_students}
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    of {stats.total_students} total
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
                                <Users className="h-6 w-6 text-emerald-500" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-orange-500/10 to-red-500/10 p-6 backdrop-blur dark:border-slate-800/70"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Total Sessions
                                </p>
                                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                                    {stats.total_sessions}
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    {stats.total_attendance} scans
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
                                <Calendar className="h-6 w-6 text-orange-500" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-rose-500/10 to-pink-500/10 p-6 backdrop-blur dark:border-slate-800/70"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Anomalies Detected
                                </p>
                                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                                    {anomalies.length}
                                </p>
                                <p className="mt-2 text-sm text-rose-500">
                                    {anomalies.filter((a) => a.severity === 'critical').length}{' '}
                                    critical
                                </p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/20">
                                <AlertTriangle className="h-6 w-6 text-rose-500" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Attendance Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                >
                    <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                        Attendance Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={attendanceTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="rate"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                name="Attendance Rate (%)"
                            />
                            <Line
                                type="monotone"
                                dataKey="attendance"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                name="Total Attendance"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Course Comparison & Device Distribution */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                            Course Performance
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={courseComparison}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="course_name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="rate" fill="#3b82f6" name="Attendance Rate (%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                            Device Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={deviceDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => entry.device}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {deviceDistribution.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* Hourly Pattern */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                >
                    <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                        Hourly Attendance Pattern
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={hourlyPattern}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="hour" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                }}
                            />
                            <Bar dataKey="count" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Top Performers & At-Risk Students */}
                <div className="grid gap-4 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                            🏆 Top Performers
                        </h3>
                        <div className="space-y-3">
                            {topPerformers.map((student, index) => (
                                <div
                                    key={student.id}
                                    className="flex items-center gap-3 rounded-lg border border-slate-200/50 bg-slate-50/50 p-3 dark:border-slate-700/50 dark:bg-slate-800/50"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {student.name}
                                        </p>
                                        <p className="text-xs text-slate-500">{student.nim}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600">
                                            {student.attendance_count}
                                        </p>
                                        <p className="text-xs text-slate-500">scans</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                            ⚠️ At-Risk Students
                        </h3>
                        <div className="space-y-3">
                            {atRiskStudents.map((student) => (
                                <div
                                    key={student.id}
                                    className="flex items-center gap-3 rounded-lg border border-rose-200/50 bg-rose-50/50 p-3 dark:border-rose-700/50 dark:bg-rose-900/20"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white">
                                        <AlertTriangle className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {student.name}
                                        </p>
                                        <p className="text-xs text-slate-500">{student.nim}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-rose-600">
                                            {student.attendance_rate}%
                                        </p>
                                        <p className="text-xs capitalize text-slate-500">
                                            {student.risk_level} risk
                                        </p>
                                    </div>
                                </div>
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
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                    >
                        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                            🚨 Recent Anomalies
                        </h3>
                        <div className="space-y-3">
                            {anomalies.map((anomaly) => (
                                <div
                                    key={anomaly.id}
                                    className="flex items-start gap-3 rounded-lg border border-slate-200/50 bg-slate-50/50 p-4 dark:border-slate-700/50 dark:bg-slate-800/50"
                                >
                                    <div
                                        className={`rounded-full px-2 py-1 text-xs font-semibold ${getSeverityColor(
                                            anomaly.severity
                                        )}`}
                                    >
                                        {anomaly.severity}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {anomaly.type.replace(/_/g, ' ').toUpperCase()}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            {anomaly.description}
                                        </p>
                                        <p className="mt-2 text-xs text-slate-500">
                                            {anomaly.created_at}
                                        </p>
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
