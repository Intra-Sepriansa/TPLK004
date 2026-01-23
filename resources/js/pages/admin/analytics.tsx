import { Head, router } from '@inertiajs/react';
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
    Award,
    Minus,
    RefreshCw,
    LineChart as LineChartIcon,
    PieChart as PieChartIcon,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import ScrollFloat from '@/components/ui/scroll-float';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
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
        day: string;
        dayIndex: number;
        hour: string;
        hourIndex: number;
        total: number;
        present: number;
        late: number;
        rate: number;
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
    trendAnalysis: {
        data: Array<{
            date: string;
            fullDate: string;
            total: number;
            present: number;
            late: number;
            rate: number;
            movingAverage: number;
        }>;
        direction: 'up' | 'down' | 'stable';
        avgRate: number;
    };
    riskPrediction: {
        students: Array<{
            id: number;
            nama: string;
            nim: string;
            attendanceRate: number;
            absentCount: number;
            riskScore: number;
            riskLevel: 'warning' | 'danger' | 'critical';
        }>;
        distribution: { safe: number; warning: number; danger: number; critical: number };
        totalAtRisk: number;
    };
    weekdayDistribution: Array<{ day: string; total: number; present: number; late: number; rate: number }>;
    courses: Array<{ id: number; nama: string }>;
    filters: { period: string; course_id: string | null };
    period: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export default function AnalyticsPage({
    stats,
    attendanceTrend,
    heatmapData,
    courseComparison,
    deviceDistribution,
    hourlyPattern,
    predictions,
    anomalies,
    topPerformers,
    atRiskStudents,
    trendAnalysis,
    riskPrediction,
    weekdayDistribution,
    courses,
    filters,
    period,
}: AnalyticsProps) {
    const [selectedPeriod, setSelectedPeriod] = useState(period || filters?.period || '7');

    const handleFilterChange = (key: string, value: string) => {
        router.get('/admin/analytics', { ...filters, [key]: value }, { preserveState: true });
    };

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

    const getTrendIcon = () => {
        if (!trendAnalysis) return <Minus className="h-5 w-5 text-slate-400" />;
        if (trendAnalysis.direction === 'up') return <TrendingUp className="h-5 w-5 text-emerald-500" />;
        if (trendAnalysis.direction === 'down') return <TrendingDown className="h-5 w-5 text-red-500" />;
        return <Minus className="h-5 w-5 text-slate-400" />;
    };

    const getTrendBadge = () => {
        if (!trendAnalysis) return null;
        if (trendAnalysis.direction === 'up') return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <ArrowUpRight className="h-3 w-3" /> Naik
            </span>
        );
        if (trendAnalysis.direction === 'down') return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <ArrowDownRight className="h-3 w-3" /> Turun
            </span>
        );
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Minus className="h-3 w-3" /> Stabil
            </span>
        );
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-gradient-to-r from-red-500 to-red-600';
            case 'danger': return 'bg-gradient-to-r from-orange-500 to-orange-600';
            case 'warning': return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
            default: return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
        }
    };

    const getRiskBadge = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            case 'danger': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
            case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            default: return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800';
        }
    };

    const getHeatmapColor = (rate: number) => {
        if (rate >= 90) return 'bg-emerald-500';
        if (rate >= 75) return 'bg-emerald-400';
        if (rate >= 60) return 'bg-yellow-400';
        if (rate >= 40) return 'bg-orange-400';
        if (rate > 0) return 'bg-red-400';
        return 'bg-slate-200 dark:bg-slate-700';
    };

    return (
        <AppLayout>
            <Head title="Advanced Analytics" />

            <div className="space-y-6">
                {/* Header Section dengan style dashboard dan animasi */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-white shadow-2xl"
                >
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute top-1/2 right-1/3 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
                    
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg"
                                >
                                    <BarChart3 className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-indigo-100 font-medium">Dashboard Analitik</p>
                                    <ScrollFloat
                                        containerClassName="!my-0"
                                        textClassName="!text-3xl font-display font-bold"
                                        animationDuration={0.8}
                                        ease="power2.out"
                                        scrollStart="top bottom-=100"
                                        scrollEnd="top center"
                                        stagger={0.02}
                                    >
                                        Advanced Analytics
                                    </ScrollFloat>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {courses && courses.length > 0 && (
                                    <select
                                        value={filters?.course_id || 'all'}
                                        onChange={(e) => handleFilterChange('course_id', e.target.value === 'all' ? '' : e.target.value)}
                                        className="rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur border-0 cursor-pointer"
                                    >
                                        <option value="all" className="text-slate-900">Semua Mata Kuliah</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={String(c.id)} className="text-slate-900">{c.nama}</option>
                                        ))}
                                    </select>
                                )}
                                {['7', '30', '90'].map((p) => (
                                    <Button
                                        key={p}
                                        variant={selectedPeriod === p ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => {
                                            setSelectedPeriod(p);
                                            handleFilterChange('period', p);
                                        }}
                                        className={selectedPeriod === p ? 'bg-white text-indigo-600 hover:bg-white/90' : 'bg-white/20 text-white border-white/30 hover:bg-white/30'}
                                    >
                                        {p === '7' ? '7 Hari' : p === '30' ? '30 Hari' : '90 Hari'}
                                    </Button>
                                ))}
                                <button
                                    onClick={() => router.reload()}
                                    className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors shadow-lg"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh
                                </button>
                            </div>
                        </div>
                        <p className="mt-4 text-indigo-100">
                            Analisis mendalam dengan prediksi AI, deteksi anomali real-time, dan heatmap kehadiran
                        </p>
                    </div>
                </motion.div>

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

                {/* Heatmap & Risk Prediction dengan style dashboard */}
                {heatmapData && heatmapData.length > 0 && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Heatmap */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg">
                                            <BarChart3 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                                Pola Kehadiran
                                            </p>
                                            <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                                Heatmap Kehadiran
                                            </h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Distribusi berdasarkan hari & jam
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 overflow-x-auto">
                                <TooltipProvider>
                                    <div className="min-w-[500px]">
                                        <div className="grid grid-cols-[60px_repeat(15,1fr)] gap-1 text-xs">
                                            <div></div>
                                            {Array.from({ length: 15 }, (_, i) => (
                                                <div key={i} className="text-center text-slate-500 font-medium">
                                                    {String(7 + i).padStart(2, '0')}
                                                </div>
                                            ))}
                                            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, dayIdx) => (
                                                <>
                                                    <div key={`day-${dayIdx}`} className="text-right pr-2 text-slate-500 font-medium flex items-center justify-end">
                                                        {day}
                                                    </div>
                                                    {Array.from({ length: 15 }, (_, hourIdx) => {
                                                        const cell = heatmapData.find(
                                                            h => h.dayIndex === (dayIdx + 1) % 7 && h.hourIndex === 7 + hourIdx
                                                        );
                                                        return (
                                                            <Tooltip key={`${dayIdx}-${hourIdx}`}>
                                                                <TooltipTrigger asChild>
                                                                    <div
                                                                        className={`h-7 rounded-md ${getHeatmapColor(cell?.rate || 0)} cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-slate-400 transition-all`}
                                                                    />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="font-medium">{day}, {String(7 + hourIdx).padStart(2, '0')}:00</p>
                                                                    {cell ? (
                                                                        <>
                                                                            <p>Rate: {cell.rate}%</p>
                                                                            <p className="text-slate-400">{cell.total} scan</p>
                                                                        </>
                                                                    ) : (
                                                                        <p className="text-slate-400">Tidak ada data</p>
                                                                    )}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        );
                                                    })}
                                                </>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-end gap-2 mt-4 text-xs">
                                            <span className="text-slate-500">Rendah</span>
                                            <div className="flex gap-1">
                                                <div className="w-5 h-5 bg-red-400 rounded-md" />
                                                <div className="w-5 h-5 bg-orange-400 rounded-md" />
                                                <div className="w-5 h-5 bg-yellow-400 rounded-md" />
                                                <div className="w-5 h-5 bg-emerald-400 rounded-md" />
                                                <div className="w-5 h-5 bg-emerald-500 rounded-md" />
                                            </div>
                                            <span className="text-slate-500">Tinggi</span>
                                        </div>
                                    </div>
                                </TooltipProvider>
                            </div>
                        </motion.div>

                        {/* Risk Prediction */}
                        {riskPrediction && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                                className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg">
                                                <AlertTriangle className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                                    Deteksi AI
                                                </p>
                                                <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                                    Prediksi Risiko Drop-out
                                                </h2>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Mahasiswa dengan pola absensi berisiko
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    {/* Risk Distribution */}
                                    <div className="grid grid-cols-4 gap-3 mb-4">
                                        {[
                                            { level: 'safe', label: 'Aman', count: riskPrediction.distribution.safe, color: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/30' },
                                            { level: 'warning', label: 'Waspada', count: riskPrediction.distribution.warning, color: 'from-yellow-400 to-yellow-600', shadow: 'shadow-yellow-500/30' },
                                            { level: 'danger', label: 'Bahaya', count: riskPrediction.distribution.danger, color: 'from-orange-400 to-orange-600', shadow: 'shadow-orange-500/30' },
                                            { level: 'critical', label: 'Kritis', count: riskPrediction.distribution.critical, color: 'from-red-400 to-red-600', shadow: 'shadow-red-500/30' },
                                        ].map(item => (
                                            <motion.div
                                                key={item.level}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 200, delay: 0.7 }}
                                                className="text-center p-3 rounded-xl bg-slate-50 dark:bg-black/50 hover:shadow-md transition-all"
                                            >
                                                <div className={`w-4 h-4 rounded-full mx-auto mb-2 bg-gradient-to-r ${item.color} shadow-lg ${item.shadow}`} />
                                                <p className="text-xl font-bold text-slate-900 dark:text-white">{item.count}</p>
                                                <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Risk Students List */}
                                    <div className="space-y-2 max-h-[280px] overflow-y-auto">
                                        {riskPrediction.students.slice(0, 10).map((student, idx) => (
                                            <motion.div
                                                key={student.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.8 + idx * 0.05 }}
                                                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getRiskColor(student.riskLevel)}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm text-slate-900 dark:text-white">{student.nama}</p>
                                                        <p className="text-xs text-slate-500">{student.nim}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getRiskBadge(student.riskLevel)}`}>
                                                        {student.absentCount}x Absen
                                                    </span>
                                                    <p className="text-xs text-slate-500 mt-1">{student.attendanceRate}% hadir</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                        {riskPrediction.students.length === 0 && (
                                            <div className="text-center py-8">
                                                <Award className="h-12 w-12 mx-auto mb-2 text-emerald-400" />
                                                <p className="text-slate-500 font-medium">Semua mahasiswa aman!</p>
                                                <p className="text-xs text-slate-400">Tidak ada mahasiswa berisiko saat ini</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}

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
                            <RechartsTooltip
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
                                <RechartsTooltip
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
                                    label={({ name, percent }: any) =>
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
                                <RechartsTooltip
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
                            <RechartsTooltip
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

                {/* Weekday Distribution dengan style dashboard */}
                {weekdayDistribution && weekdayDistribution.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 text-white shadow-lg">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                                        Pola Mingguan
                                    </p>
                                    <h2 className="font-display text-xl text-slate-900 dark:text-white">
                                        Distribusi per Hari
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Perbandingan kehadiran setiap hari dalam seminggu
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-7 gap-3">
                                {weekdayDistribution.map((d, idx) => {
                                    const isHighest = d.rate === Math.max(...weekdayDistribution.map(w => w.rate));
                                    const isLowest = d.rate === Math.min(...weekdayDistribution.filter(w => w.total > 0).map(w => w.rate));
                                    
                                    return (
                                        <motion.div
                                            key={d.day}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1.2 + idx * 0.1, type: "spring" }}
                                            className={`text-center p-4 rounded-2xl transition-all hover:shadow-lg cursor-pointer ${
                                                isHighest ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 ring-2 ring-emerald-500/30' :
                                                isLowest && d.total > 0 ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 ring-2 ring-red-500/30' :
                                                'bg-slate-50 dark:bg-black/50'
                                            }`}
                                        >
                                            <p className="font-semibold text-slate-700 dark:text-slate-300">{d.day}</p>
                                            <p className={`text-3xl font-bold mt-2 ${
                                                d.rate >= 80 ? 'text-emerald-600' :
                                                d.rate >= 60 ? 'text-yellow-600' :
                                                d.rate > 0 ? 'text-red-600' :
                                                'text-slate-400'
                                            }`}>{d.rate}%</p>
                                            <p className="text-xs text-slate-500 mt-1">{d.total} scan</p>
                                            {isHighest && d.total > 0 && (
                                                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                                                    <Sparkles className="h-3 w-3" /> Terbaik
                                                </span>
                                            )}
                                            {isLowest && d.total > 0 && (
                                                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400">
                                                    <AlertTriangle className="h-3 w-3" /> Terendah
                                                </span>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

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
