import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
    BarChart3, TrendingUp, TrendingDown, AlertTriangle, Users, Calendar,
    Minus, RefreshCw, Activity, Clock, Target, Zap, Award, Eye,
    ChevronRight, Sparkles, PieChart, LineChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface Props {
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
    hourlyDistribution: Array<{ hour: string; total: number; present: number; late: number }>;
    weekdayDistribution: Array<{ day: string; total: number; present: number; late: number; rate: number }>;
    courseComparison: Array<{
        id: number;
        nama: string;
        totalSessions: number;
        overallRate: number;
    }>;
    courses: Array<{ id: number; nama: string }>;
    filters: { period: string; course_id: string | null };
    summary: {
        totalScans: number;
        presentCount: number;
        lateCount: number;
        rejectedCount: number;
        overallRate: number;
        activeSessions: number;
        totalStudents: number;
    };
}

export default function AdvancedAnalytics({
    heatmapData, trendAnalysis, riskPrediction, hourlyDistribution,
    weekdayDistribution, courseComparison, courses, filters, summary
}: Props) {
    const handleFilterChange = (key: string, value: string) => {
        router.get('/admin/advanced-analytics', { ...filters, [key]: value }, { preserveState: true });
    };

    const getTrendIcon = () => {
        if (trendAnalysis.direction === 'up') return <TrendingUp className="h-5 w-5 text-emerald-500" />;
        if (trendAnalysis.direction === 'down') return <TrendingDown className="h-5 w-5 text-red-500" />;
        return <Minus className="h-5 w-5 text-slate-400" />;
    };

    const getTrendBadge = () => {
        if (trendAnalysis.direction === 'up') return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                <ArrowUpRight className="h-3 w-3" /> Naik
            </span>
        );
        if (trendAnalysis.direction === 'down') return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                <ArrowDownRight className="h-3 w-3" /> Turun
            </span>
        );
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
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
            case 'critical': return 'bg-red-100 text-red-700 border-red-200';
            case 'danger': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
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

    const totalRiskStudents = riskPrediction.distribution.warning + riskPrediction.distribution.danger + riskPrediction.distribution.critical;
    const safePercentage = summary.totalStudents > 0 ? Math.round((riskPrediction.distribution.safe / summary.totalStudents) * 100) : 0;

    return (
        <AppLayout>
            <Head title="Advanced Analytics" />
            
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-xl">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute top-1/2 right-1/3 h-24 w-24 rounded-full bg-white/5" />
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg">
                                    <BarChart3 className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-indigo-100 font-medium">Dashboard Analitik</p>
                                    <h1 className="text-2xl font-bold">Advanced Analytics</h1>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={filters.period}
                                    onChange={(e) => handleFilterChange('period', e.target.value)}
                                    className="rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur border-0 cursor-pointer"
                                >
                                    <option value="7" className="text-slate-900">7 Hari Terakhir</option>
                                    <option value="30" className="text-slate-900">30 Hari Terakhir</option>
                                    <option value="90" className="text-slate-900">90 Hari Terakhir</option>
                                </select>
                                <select
                                    value={filters.course_id || 'all'}
                                    onChange={(e) => handleFilterChange('course_id', e.target.value === 'all' ? '' : e.target.value)}
                                    className="rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur border-0 cursor-pointer"
                                >
                                    <option value="all" className="text-slate-900">Semua Mata Kuliah</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={String(c.id)} className="text-slate-900">{c.nama}</option>
                                    ))}
                                </select>
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
                            Analisis mendalam data kehadiran dengan heatmap, trend, dan prediksi risiko mahasiswa
                        </p>

                        {/* Quick Stats in Header */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Activity className="h-4 w-4 text-indigo-200" />
                                    <p className="text-indigo-100 text-xs font-medium">Rate Kehadiran</p>
                                </div>
                                <p className="text-3xl font-bold">{summary.overallRate}%</p>
                                {getTrendBadge()}
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users className="h-4 w-4 text-indigo-200" />
                                    <p className="text-indigo-100 text-xs font-medium">Total Scan</p>
                                </div>
                                <p className="text-3xl font-bold">{summary.totalScans.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle className="h-4 w-4 text-indigo-200" />
                                    <p className="text-indigo-100 text-xs font-medium">Mahasiswa Berisiko</p>
                                </div>
                                <p className="text-3xl font-bold">{riskPrediction.totalAtRisk}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="h-4 w-4 text-indigo-200" />
                                    <p className="text-indigo-100 text-xs font-medium">Sesi Aktif</p>
                                </div>
                                <p className="text-3xl font-bold">{summary.activeSessions}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30">
                                <Users className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Total Mahasiswa</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary.totalStudents}</p>
                                <p className="text-xs text-slate-400">{safePercentage}% aman</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                                <Activity className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Rate Kehadiran</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-emerald-600">{summary.overallRate}%</p>
                                    {getTrendIcon()}
                                </div>
                                <p className="text-xs text-slate-400">Rata-rata: {trendAnalysis.avgRate}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg shadow-red-500/30">
                                <AlertTriangle className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Mahasiswa Berisiko</p>
                                <p className="text-2xl font-bold text-red-600">{riskPrediction.totalAtRisk}</p>
                                <p className="text-xs text-slate-400">{riskPrediction.distribution.critical} kritis</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/30">
                                <Zap className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Sesi Aktif</p>
                                <p className="text-2xl font-bold text-purple-600">{summary.activeSessions}</p>
                                <p className="text-xs text-slate-400">Hari ini</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Heatmap */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                                        <BarChart3 className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Heatmap Kehadiran</h2>
                                        <p className="text-xs text-slate-500">Distribusi berdasarkan hari & jam</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 overflow-x-auto">
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
                    </div>

                    {/* Risk Prediction */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-red-400 to-red-600 text-white">
                                        <AlertTriangle className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Prediksi Risiko Drop-out</h2>
                                        <p className="text-xs text-slate-500">Mahasiswa dengan pola absensi berisiko</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            {/* Risk Distribution */}
                            <div className="grid grid-cols-4 gap-3 mb-4">
                                {[
                                    { level: 'safe', label: 'Aman', count: riskPrediction.distribution.safe, color: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-500/30' },
                                    { level: 'warning', label: 'Waspada', count: riskPrediction.distribution.warning, color: 'from-yellow-400 to-yellow-600', shadow: 'shadow-yellow-500/30' },
                                    { level: 'danger', label: 'Bahaya', count: riskPrediction.distribution.danger, color: 'from-orange-400 to-orange-600', shadow: 'shadow-orange-500/30' },
                                    { level: 'critical', label: 'Kritis', count: riskPrediction.distribution.critical, color: 'from-red-400 to-red-600', shadow: 'shadow-red-500/30' },
                                ].map(item => (
                                    <div key={item.level} className="text-center p-3 rounded-xl bg-slate-50 dark:bg-black/50 hover:shadow-md transition-all">
                                        <div className={`w-4 h-4 rounded-full mx-auto mb-2 bg-gradient-to-r ${item.color} shadow-lg ${item.shadow}`} />
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">{item.count}</p>
                                        <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Risk Students List */}
                            <div className="space-y-2 max-h-[280px] overflow-y-auto">
                                {riskPrediction.students.slice(0, 10).map((student, idx) => (
                                    <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
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
                                    </div>
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
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Trend Analysis */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 text-white">
                                        <LineChart className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Trend Kehadiran</h2>
                                        <p className="text-xs text-slate-500">Rata-rata: {trendAnalysis.avgRate}%</p>
                                    </div>
                                </div>
                                {getTrendBadge()}
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="h-[220px] flex items-end gap-1">
                                <TooltipProvider>
                                    {trendAnalysis.data.slice(-14).map((d, i) => (
                                        <Tooltip key={i}>
                                            <TooltipTrigger asChild>
                                                <div className="flex-1 flex flex-col items-center cursor-pointer group">
                                                    <div
                                                        className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-md transition-all group-hover:from-gray-800 group-hover:to-indigo-500"
                                                        style={{ height: `${Math.max(d.rate * 1.8, 4)}px` }}
                                                    />
                                                    <span className="text-[9px] text-slate-500 mt-2 -rotate-45 origin-left whitespace-nowrap">
                                                        {d.date}
                                                    </span>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="font-medium">{d.fullDate}</p>
                                                <p>Rate: {d.rate}%</p>
                                                <p className="text-slate-400">{d.total} scan</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </TooltipProvider>
                            </div>
                            {/* Moving Average Line Indicator */}
                            <div className="mt-4 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                    <span className="text-slate-500">Rate Harian</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">Target: 80%</span>
                                    <div className="w-8 h-0.5 bg-emerald-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Course Comparison */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                                        <Award className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold text-slate-900 dark:text-white">Ranking Mata Kuliah</h2>
                                        <p className="text-xs text-slate-500">Berdasarkan tingkat kehadiran</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 space-y-3 max-h-[340px] overflow-y-auto">
                            {courseComparison.slice(0, 8).map((course, idx) => (
                                <div key={course.id} className="group">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                                idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                idx === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                                                idx === 2 ? 'bg-gradient-to-r from-amber-500 to-amber-700' :
                                                'bg-gradient-to-r from-indigo-400 to-indigo-600'
                                            }`}>
                                                {idx + 1}
                                            </span>
                                            <span className="font-medium truncate max-w-[180px]">{course.nama}</span>
                                        </span>
                                        <span className={`font-bold ${
                                            course.overallRate >= 80 ? 'text-emerald-600' :
                                            course.overallRate >= 60 ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`}>{course.overallRate}%</span>
                                    </div>
                                    <div className="relative">
                                        <Progress value={course.overallRate} className="h-2.5 group-hover:h-3 transition-all" />
                                        {course.overallRate >= 80 && (
                                            <Sparkles className="absolute right-0 -top-1 h-3 w-3 text-yellow-500" />
                                        )}
                                    </div>
                                </div>
                            ))}
                            {courseComparison.length === 0 && (
                                <div className="text-center py-8">
                                    <PieChart className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                    <p className="text-slate-500">Belum ada data mata kuliah</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Weekday Distribution */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 text-white">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Distribusi per Hari</h2>
                                <p className="text-xs text-slate-500">Perbandingan kehadiran setiap hari dalam seminggu</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-7 gap-3">
                            {weekdayDistribution.map((d, idx) => {
                                const isHighest = d.rate === Math.max(...weekdayDistribution.map(w => w.rate));
                                const isLowest = d.rate === Math.min(...weekdayDistribution.filter(w => w.total > 0).map(w => w.rate));
                                
                                return (
                                    <div 
                                        key={d.day} 
                                        className={`text-center p-4 rounded-2xl transition-all hover:shadow-lg ${
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
                                            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                <Sparkles className="h-3 w-3" /> Terbaik
                                            </span>
                                        )}
                                        {isLowest && d.total > 0 && (
                                            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                <AlertTriangle className="h-3 w-3" /> Terendah
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
