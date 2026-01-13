import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
    BarChart3, TrendingUp, TrendingDown, AlertTriangle, Users, Calendar,
    ArrowUpRight, ArrowDownRight, Minus, RefreshCw
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
        if (trendAnalysis.direction === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
        if (trendAnalysis.direction === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
        return <Minus className="h-4 w-4 text-gray-500" />;
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-red-500';
            case 'danger': return 'bg-orange-500';
            case 'warning': return 'bg-yellow-500';
            default: return 'bg-green-500';
        }
    };

    const getHeatmapColor = (rate: number) => {
        if (rate >= 90) return 'bg-green-500';
        if (rate >= 75) return 'bg-green-400';
        if (rate >= 60) return 'bg-yellow-400';
        if (rate >= 40) return 'bg-orange-400';
        if (rate > 0) return 'bg-red-400';
        return 'bg-gray-200 dark:bg-gray-700';
    };

    return (
        <AppLayout>
            <Head title="Advanced Analytics" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <BarChart3 className="h-6 w-6" />
                            Advanced Analytics
                        </h1>
                        <p className="text-muted-foreground">Analisis mendalam data kehadiran</p>
                    </div>
                    <div className="flex gap-2">
                        <Select value={filters.period} onValueChange={(v) => handleFilterChange('period', v)}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Periode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">7 Hari</SelectItem>
                                <SelectItem value="30">30 Hari</SelectItem>
                                <SelectItem value="90">90 Hari</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filters.course_id || 'all'} onValueChange={(v) => handleFilterChange('course_id', v === 'all' ? '' : v)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Mata Kuliah" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                                {courses.map(c => (
                                    <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" onClick={() => router.reload()}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Scan</p>
                                    <p className="text-2xl font-bold">{summary.totalScans}</p>
                                </div>
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-muted-foreground">Rate Kehadiran</p>
                                    <p className="text-2xl font-bold">{summary.overallRate}%</p>
                                </div>
                                {getTrendIcon()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-muted-foreground">Mahasiswa Berisiko</p>
                                    <p className="text-2xl font-bold text-red-600">{riskPrediction.totalAtRisk}</p>
                                </div>
                                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-muted-foreground">Sesi Aktif</p>
                                    <p className="text-2xl font-bold">{summary.activeSessions}</p>
                                </div>
                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                    <Calendar className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Heatmap */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Heatmap Kehadiran</CardTitle>
                            <CardDescription>Distribusi kehadiran berdasarkan hari dan jam</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <div className="min-w-[500px]">
                                    <div className="grid grid-cols-[60px_repeat(15,1fr)] gap-1 text-xs">
                                        <div></div>
                                        {Array.from({ length: 15 }, (_, i) => (
                                            <div key={i} className="text-center text-muted-foreground">
                                                {String(7 + i).padStart(2, '0')}
                                            </div>
                                        ))}
                                        {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, dayIdx) => (
                                            <>
                                                <div key={`day-${dayIdx}`} className="text-right pr-2 text-muted-foreground">
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
                                        <span className="text-muted-foreground">Rendah</span>
                                        <div className="flex gap-1">
                                            <div className="w-4 h-4 bg-red-400 rounded" />
                                            <div className="w-4 h-4 bg-orange-400 rounded" />
                                            <div className="w-4 h-4 bg-yellow-400 rounded" />
                                            <div className="w-4 h-4 bg-green-400 rounded" />
                                            <div className="w-4 h-4 bg-green-500 rounded" />
                                        </div>
                                        <span className="text-muted-foreground">Tinggi</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Risk Prediction */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Prediksi Risiko Drop-out
                            </CardTitle>
                            <CardDescription>Mahasiswa dengan pola absensi berisiko</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {Object.entries(riskPrediction.distribution).map(([level, count]) => (
                                    <div key={level} className="text-center p-2 rounded-lg bg-muted">
                                        <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${getRiskColor(level)}`} />
                                        <p className="text-lg font-bold">{count}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{level}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                {riskPrediction.students.slice(0, 10).map(student => (
                                    <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                        <div>
                                            <p className="font-medium text-sm">{student.nama}</p>
                                            <p className="text-xs text-muted-foreground">{student.nim}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={student.riskLevel === 'critical' ? 'destructive' : 'secondary'}>
                                                {student.absentCount}x Absen
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-1">{student.attendanceRate}%</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Trend Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                Trend Kehadiran
                                {getTrendIcon()}
                            </CardTitle>
                            <CardDescription>Rata-rata: {trendAnalysis.avgRate}%</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] flex items-end gap-1">
                                {trendAnalysis.data.slice(-14).map((d, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-primary rounded-t transition-all"
                                            style={{ height: `${d.rate * 1.8}px` }}
                                            title={`${d.date}: ${d.rate}%`}
                                        />
                                        <span className="text-[10px] text-muted-foreground mt-1 rotate-45 origin-left">
                                            {d.date}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Course Comparison */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Perbandingan Mata Kuliah</CardTitle>
                            <CardDescription>Ranking berdasarkan tingkat kehadiran</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {courseComparison.slice(0, 8).map((course, idx) => (
                                    <div key={course.id} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                                    {idx + 1}
                                                </span>
                                                {course.nama}
                                            </span>
                                            <span className="font-medium">{course.overallRate}%</span>
                                        </div>
                                        <Progress value={course.overallRate} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Weekday Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribusi per Hari</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-4">
                            {weekdayDistribution.map(d => (
                                <div key={d.day} className="text-center p-3 rounded-lg bg-muted">
                                    <p className="font-medium">{d.day}</p>
                                    <p className="text-2xl font-bold mt-2">{d.rate}%</p>
                                    <p className="text-xs text-muted-foreground">{d.total} scan</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
