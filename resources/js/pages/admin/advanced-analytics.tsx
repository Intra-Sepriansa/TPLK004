import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
    BarChart3, TrendingUp, TrendingDown, AlertTriangle, Users, Calendar,
    ArrowUpRight, ArrowDownRight, Minus, RefreshCw, Activity, Clock
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
        if (trendAnalysis.direction === 'up') return <TrendingUp className="h-5 w-5 text-emerald-600" />;
        if (trendAnalysis.direction === 'down') return <TrendingDown className="h-5 w-5 text-red-600" />;
        return <Minus className="h-5 w-5 text-slate-500" />;
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-red-500';
            case 'danger': return 'bg-orange-500';
            case 'warning': return 'bg-yellow-500';
            default: return 'bg-emerald-500';
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
            
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                    <BarChart3 className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-100">Dashboard</p>
                                    <h1 className="text-2xl font-bold">Advanced Analytics</h1>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    value={filters.period}
                                    onChange={(e) => handleFilterChange('period', e.target.value)}
                                    className="rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur border-0"
                                >
                                    <option value="7" className="text-slate-900">7 Hari</option>
                                    <option value="30" className="text-slate-900">30 Hari</option>
                                    <option value="90" className="text-slate-900">90 Hari</option>
                                </select>
                                <select
                                    value={filters.course_id || 'all'}
                                    onChange={(e) => handleFilterChange('course_id', e.target.value === 'all' ? '' : e.target.value)}
                                    className="rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur border-0"
                                >
                                    <option value="all" className="text-slate-900">Semua Mata Kuliah</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={String(c.id)} className="text-slate-900">{c.nama}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => router.reload()}
                                    className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh
                                </button>
                            </div>
                        </div>
                        <p className="mt-4 text-blue-100">
                            Analisis mendalam data kehadiran dengan heatmap, trend, dan prediksi risiko
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Total Scan</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">{summary.totalScans}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Rate Kehadiran</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-bold text-emerald-600">{summary.overallRate}%</p>
                                    {getTrendIcon()}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Mahasiswa Berisiko</p>
                                <p className="text-xl font-bold text-red-600">{riskPrediction.totalAtRisk}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Sesi Aktif</p>
                                <p className="text-xl font-bold text-purple-600">{summary.activeSessions}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Heatmap */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Heatmap Kehadiran</h2>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Distribusi kehadiran berdasarkan hari dan jam</p>
                        </div>
                        <div className="p-4 overflow-x-auto">
                            <div className="min-w-[500px]">
                                <div className="grid grid-cols-[60px_repeat(15,1fr)] gap-1 text-xs">
                                    <div></div>
                                    {Array.from({ length: 15 }, (_, i) => (
                                        <div key={i} className="text-center text-slate-500">
                                            {String(7 + i).padStart(2, '0')}
                                        </div>
                                    ))}
                                    {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, dayIdx) => (
                                        <>
                                            <div key={`day-${dayIdx}`} className="text-right pr-2 text-slate-500">
                                                {day}
                                            </div>
                                            {Array.from({ length: 15 }, (_, hourIdx) => {
                                                const cell = heatmapData.find(
                                                    h => h.dayIndex === (dayIdx + 1) % 7 && h.hourIndex === 7 + hourIdx
                                                );
                                                return (
                                                    <div
                                                        key={`${dayIdx}-${hourIdx}`}
                                                        className={`h-6 rounded ${getHeatmapColor(cell?.rate || 0)}`}
                                                        title={cell ? `${cell.rate}% (${cell.total} scan)` : 'Tidak ada data'}
                                                    />
                                                );
                                            })}
                                        </>
                                    ))}
                                </div>
                                <div className="flex items-center justify-end gap-2 mt-4 text-xs">
                                    <span className="text-slate-500">Rendah</span>
                                    <div className="flex gap-1">
                                        <div className="w-4 h-4 bg-red-400 rounded" />
                                        <div className="w-4 h-4 bg-orange-400 rounded" />
                                        <div className="w-4 h-4 bg-yellow-400 rounded" />
                                        <div className="w-4 h-4 bg-emerald-400 rounded" />
                                        <div className="w-4 h-4 bg-emerald-500 rounded" />
                                    </div>
                                    <span className="text-slate-500">Tinggi</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Risk Prediction */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Prediksi Risiko Drop-out</h2>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Mahasiswa dengan pola absensi berisiko</p>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {Object.entries(riskPrediction.distribution).map(([level, count]) => (
                                    <div key={level} className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                        <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${getRiskColor(level)}`} />
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{count}</p>
                                        <p className="text-xs text-slate-500 capitalize">{level}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2 max-h-[280px] overflow-y-auto">
                                {riskPrediction.students.slice(0, 10).map(student => (
                                    <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                        <div>
                                            <p className="font-medium text-sm text-slate-900 dark:text-white">{student.nama}</p>
                                            <p className="text-xs text-slate-500">{student.nim}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                student.riskLevel === 'critical' ? 'bg-red-100 text-red-700' : 
                                                student.riskLevel === 'danger' ? 'bg-orange-100 text-orange-700' : 
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {student.absentCount}x Absen
                                            </span>
                                            <p className="text-xs text-slate-500 mt-1">{student.attendanceRate}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Trend Analysis */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Trend Kehadiran</h2>
                                {getTrendIcon()}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Rata-rata: {trendAnalysis.avgRate}%</p>
                        </div>
                        <div className="p-4">
                            <div className="h-[200px] flex items-end gap-1">
                                {trendAnalysis.data.slice(-14).map((d, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-blue-500 rounded-t transition-all"
                                            style={{ height: `${d.rate * 1.8}px` }}
                                            title={`${d.date}: ${d.rate}%`}
                                        />
                                        <span className="text-[10px] text-slate-500 mt-1 rotate-45 origin-left">
                                            {d.date}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Course Comparison */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-purple-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Perbandingan Mata Kuliah</h2>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Ranking berdasarkan tingkat kehadiran</p>
                        </div>
                        <div className="p-4 space-y-3">
                            {courseComparison.slice(0, 8).map((course, idx) => (
                                <div key={course.id} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                            {course.nama}
                                        </span>
                                        <span className="font-medium text-slate-900 dark:text-white">{course.overallRate}%</span>
                                    </div>
                                    <Progress value={course.overallRate} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Weekday Distribution */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Distribusi per Hari</h2>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-7 gap-4">
                            {weekdayDistribution.map(d => (
                                <div key={d.day} className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                    <p className="font-medium text-slate-700 dark:text-slate-300">{d.day}</p>
                                    <p className="text-2xl font-bold text-blue-600 mt-2">{d.rate}%</p>
                                    <p className="text-xs text-slate-500">{d.total} scan</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
