import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { StatCard } from '@/components/ui/stat-card';
import { Heatmap } from '@/components/ui/heatmap';
import { AttendanceChart } from '@/components/analytics/attendance-chart';
import { CourseComparison } from '@/components/analytics/course-comparison';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Users,
    UserCheck,
    Clock,
    AlertTriangle,
    Download,
    Calendar,
    TrendingUp,
    BarChart3,
} from 'lucide-react';

interface AnalyticsPageProps {
    stats: {
        totalStudents: number;
        totalSessions: number;
        avgAttendance: number;
        riskStudents: number;
    };
    weeklyData: {
        label: string;
        present: number;
        absent: number;
        late: number;
    }[];
    monthlyData: {
        label: string;
        present: number;
        absent: number;
        late: number;
    }[];
    heatmapData: {
        hour: number;
        day: number;
        value: number;
    }[];
    courseStats: {
        id: number;
        name: string;
        present: number;
        absent: number;
        late: number;
        total: number;
        trend?: 'up' | 'down' | 'stable';
        trendValue?: number;
    }[];
    riskStudentsList: {
        id: number;
        name: string;
        nim: string;
        attendanceRate: number;
        missedSessions: number;
    }[];
}

export default function Analytics({
    stats = {
        totalStudents: 0,
        totalSessions: 0,
        avgAttendance: 0,
        riskStudents: 0,
    },
    weeklyData = [],
    monthlyData = [],
    heatmapData = [],
    courseStats = [],
    riskStudentsList = [],
}: AnalyticsPageProps) {
    return (
        <AppLayout>
            <Head title="Analytics" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                            Dashboard
                        </p>
                        <h1 className="font-display text-2xl text-slate-900 dark:text-white">
                            Analytics & Insights
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-2" />
                            Filter Periode
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Mahasiswa"
                        value={stats.totalStudents}
                        icon={Users}
                        tone="sky"
                        note="Terdaftar"
                    />
                    <StatCard
                        title="Total Sesi"
                        value={stats.totalSessions}
                        icon={Calendar}
                        tone="violet"
                        note="Semester ini"
                    />
                    <StatCard
                        title="Rata-rata Kehadiran"
                        value={stats.avgAttendance}
                        suffix="%"
                        icon={UserCheck}
                        tone="emerald"
                        trend="up"
                        change="+2.5%"
                        note="vs bulan lalu"
                    />
                    <StatCard
                        title="Mahasiswa Berisiko"
                        value={stats.riskStudents}
                        icon={AlertTriangle}
                        tone="rose"
                        note="Kehadiran < 75%"
                    />
                </div>

                {/* Charts */}
                <Tabs defaultValue="weekly" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="weekly">Mingguan</TabsTrigger>
                        <TabsTrigger value="monthly">Bulanan</TabsTrigger>
                        <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                    </TabsList>

                    <TabsContent value="weekly">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <AttendanceChart
                                data={weeklyData}
                                type="area"
                                title="Tren Kehadiran Mingguan"
                                height={350}
                            />
                            <AttendanceChart
                                data={weeklyData}
                                type="bar"
                                title="Distribusi Status Mingguan"
                                height={350}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="monthly">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <AttendanceChart
                                data={monthlyData}
                                type="line"
                                title="Tren Kehadiran Bulanan"
                                height={350}
                            />
                            <AttendanceChart
                                data={monthlyData}
                                type="pie"
                                title="Distribusi Status Keseluruhan"
                                height={350}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="heatmap">
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="h-5 w-5 text-slate-600" />
                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    Heatmap Waktu Absensi
                                </h3>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">
                                Menunjukkan kapan mahasiswa paling sering melakukan absensi
                            </p>
                            <Heatmap data={heatmapData} />
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Course Comparison & Risk Students */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <CourseComparison courses={courseStats} />

                    {/* Risk Students */}
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-rose-600" />
                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    Mahasiswa Berisiko
                                </h3>
                            </div>
                            <span className="text-xs text-slate-500">
                                Kehadiran &lt; 75%
                            </span>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {riskStudentsList.length === 0 ? (
                                <div className="text-center py-8">
                                    <UserCheck className="h-12 w-12 mx-auto text-emerald-300" />
                                    <p className="mt-2 text-sm text-slate-500">
                                        Tidak ada mahasiswa berisiko
                                    </p>
                                </div>
                            ) : (
                                riskStudentsList.map((student) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center justify-between p-3 rounded-xl border border-rose-100 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-950/20"
                                    >
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">
                                                {student.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                NIM: {student.nim} • {student.missedSessions} sesi tidak hadir
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-rose-600">
                                                {student.attendanceRate}%
                                            </span>
                                            <p className="text-xs text-slate-500">Kehadiran</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
