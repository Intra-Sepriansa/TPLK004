import { Head, Link, usePage } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    FileText,
    TrendingUp,
    Users,
    XCircle,
    ChevronRight,
    Award,
    Target,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MahasiswaInfo {
    id: number;
    nama: string;
    nim: string;
}

interface Stats {
    totalSessions: number;
    presentCount: number;
    lateCount: number;
    rejectedCount: number;
    totalAttendance: number;
    attendanceRate: number;
    onTimeRate: number;
    thisMonthTotal: number;
    thisMonthPresent: number;
}

interface CourseSummary {
    courseId: number;
    courseName: string;
    total: number;
    present: number;
    late: number;
    rejected: number;
    attended: number;
    rate: number;
}

interface MonthlyTrend {
    month: string;
    total: number;
    attended: number;
    rate: number;
}

interface Distribution {
    name: string;
    value: number;
    color: string;
}

interface RecentLog {
    id: number;
    status: string;
    courseName: string;
    meetingNumber: number;
    scannedAt: string;
    scannedAtFormatted: string;
}

interface PageProps {
    mahasiswa: MahasiswaInfo;
    stats: Stats;
    courseSummary: CourseSummary[];
    monthlyTrend: MonthlyTrend[];
    distribution: Distribution[];
    recentLogs: RecentLog[];
}

const statusConfig = {
    present: { label: 'Hadir', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle },
    late: { label: 'Terlambat', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
    rejected: { label: 'Ditolak', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: XCircle },
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <p className="font-medium text-slate-900 dark:text-white mb-2">{label}</p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

function StatCard({
    icon: Icon,
    label,
    value,
    suffix,
    subtext,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    suffix?: string;
    subtext?: string;
    color: 'emerald' | 'amber' | 'sky' | 'violet' | 'rose';
}) {
    const colors = {
        emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
        violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    };

    return (
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
            <div className="flex items-center gap-3">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', colors[color])}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        <AnimatedCounter value={value} suffix={suffix} />
                    </p>
                    {subtext && <p className="text-[10px] text-slate-400">{subtext}</p>}
                </div>
            </div>
        </div>
    );
}

export default function UserRekapan() {
    const { props } = usePage<{ props: PageProps }>();
    const {
        mahasiswa = { id: 0, nama: '', nim: '' },
        stats = {
            totalSessions: 0, presentCount: 0, lateCount: 0, rejectedCount: 0,
            totalAttendance: 0, attendanceRate: 0, onTimeRate: 0,
            thisMonthTotal: 0, thisMonthPresent: 0,
        },
        courseSummary = [],
        monthlyTrend = [],
        distribution = [],
        recentLogs = [],
    } = props as unknown as PageProps;

    // Transform data for charts
    const courseChartData = courseSummary.map(c => ({
        name: c.courseName.length > 12 ? c.courseName.substring(0, 12) + '...' : c.courseName,
        Hadir: c.present,
        Terlambat: c.late,
        Ditolak: c.rejected,
    }));

    const trendChartData = monthlyTrend.map(m => ({
        name: m.month.split(' ')[0],
        Kehadiran: m.rate,
        Total: m.total,
    }));

    return (
        <StudentLayout>
            <Head title="Rekapan Kehadiran" />

            <div className="space-y-6 p-6">
                {/* Header Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    
                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-violet-200">Rekapan Kehadiran</p>
                                <h1 className="text-2xl font-bold">{mahasiswa.nama}</h1>
                                <p className="text-sm text-violet-200">NIM: {mahasiswa.nim}</p>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                                <FileText className="h-7 w-7" />
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <p className="text-xs text-violet-200">Total Sesi</p>
                                <p className="text-2xl font-bold">{stats.totalSessions}</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <p className="text-xs text-violet-200">Kehadiran</p>
                                <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <p className="text-xs text-violet-200">Tepat Waktu</p>
                                <p className="text-2xl font-bold">{stats.onTimeRate}%</p>
                            </div>
                            <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
                                <p className="text-xs text-violet-200">Bulan Ini</p>
                                <p className="text-2xl font-bold">{stats.thisMonthPresent}/{stats.thisMonthTotal}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatCard icon={CheckCircle} label="Hadir" value={stats.presentCount} subtext="tepat waktu" color="emerald" />
                    <StatCard icon={Clock} label="Terlambat" value={stats.lateCount} subtext="sesi" color="amber" />
                    <StatCard icon={XCircle} label="Ditolak" value={stats.rejectedCount} subtext="sesi" color="rose" />
                    <StatCard icon={Target} label="Target" value={75} suffix="%" subtext="min. kehadiran" color="violet" />
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Course Summary Table */}
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-violet-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Ringkasan per Mata Kuliah
                                    </h2>
                                </div>
                                <span className="text-sm text-slate-500">{courseSummary.length} mata kuliah</span>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {courseSummary.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <BookOpen className="h-12 w-12 mx-auto text-slate-300" />
                                        <p className="mt-3 text-slate-500">Belum ada data mata kuliah</p>
                                    </div>
                                ) : (
                                    courseSummary.map((course) => (
                                        <div key={course.courseId} className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                                                    {course.courseName}
                                                </h3>
                                                <span className={cn(
                                                    'px-2 py-1 rounded-full text-xs font-semibold',
                                                    course.rate >= 75 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                    course.rate >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                )}>
                                                    {course.rate}%
                                                </span>
                                            </div>
                                            <Progress value={course.rate} className="h-2 mb-2" />
                                            <div className="flex gap-4 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                    Hadir: {course.present}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                                                    Terlambat: {course.late}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                                                    Ditolak: {course.rejected}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Course Bar Chart */}
                        {courseChartData.length > 0 && (
                            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Grafik per Mata Kuliah
                                    </h2>
                                </div>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={courseChartData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="Hadir" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Terlambat" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Ditolak" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Monthly Trend */}
                        {trendChartData.length > 0 && (
                            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="h-5 w-5 text-sky-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Tren Kehadiran 6 Bulan Terakhir
                                    </h2>
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={trendChartData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Line type="monotone" dataKey="Kehadiran" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Distribution Pie Chart */}
                        {distribution.some(d => d.value > 0) && (
                            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                                <div className="flex items-center gap-2 mb-4">
                                    <Award className="h-5 w-5 text-amber-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Distribusi Status
                                    </h2>
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={distribution.filter(d => d.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex justify-center gap-4 mt-2">
                                    {distribution.filter(d => d.value > 0).map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2 text-xs">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <span className="text-slate-600 dark:text-slate-400">
                                                {entry.name}: {entry.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Attendance Rate Card */}
                        <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm dark:from-slate-800 dark:to-slate-900">
                            <p className="text-sm text-slate-400">Tingkat Kehadiran</p>
                            <div className="flex items-end gap-2 mt-2">
                                <span className="text-4xl font-bold">
                                    <AnimatedCounter value={stats.attendanceRate} suffix="%" />
                                </span>
                                {stats.attendanceRate >= 75 ? (
                                    <span className="text-emerald-400 text-sm mb-1 flex items-center gap-1">
                                        <Zap className="h-4 w-4" /> Bagus!
                                    </span>
                                ) : (
                                    <span className="text-amber-400 text-sm mb-1">Perlu ditingkatkan</span>
                                )}
                            </div>
                            <Progress
                                value={stats.attendanceRate}
                                className="mt-4 h-2 bg-slate-700"
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                Minimal 75% untuk memenuhi syarat kehadiran
                            </p>
                        </div>

                        {/* Recent Activity */}
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-sky-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Aktivitas Terakhir
                                    </h2>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {recentLogs.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-slate-500">
                                        Belum ada aktivitas
                                    </div>
                                ) : (
                                    recentLogs.map((log) => {
                                        const config = statusConfig[log.status as keyof typeof statusConfig] || statusConfig.rejected;
                                        const Icon = config.icon;
                                        return (
                                            <div key={log.id} className="p-3 flex items-center gap-3">
                                                <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', config.color)}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                        {log.courseName}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {log.scannedAtFormatted}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                                <Link href="/user/history">
                                    <Button variant="ghost" className="w-full text-sm">
                                        Lihat Riwayat Lengkap
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <h2 className="font-semibold text-slate-900 dark:text-white mb-3">
                                Aksi Cepat
                            </h2>
                            <div className="space-y-2">
                                <Link href="/user/absen">
                                    <Button variant="outline" className="w-full justify-start">
                                        <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" />
                                        Absen Sekarang
                                    </Button>
                                </Link>
                                <Link href="/user/history">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Calendar className="h-4 w-4 mr-2 text-sky-600" />
                                        Lihat Riwayat
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
