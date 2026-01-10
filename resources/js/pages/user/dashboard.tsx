import { Head, Link, usePage } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { AchievementBadge } from '@/components/ui/achievement-badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useCountdown } from '@/hooks/use-countdown';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {
    Calendar,
    CheckCircle,
    Clock,
    Flame,
    MapPin,
    QrCode,
    TrendingUp,
    User,
    Bell,
    ChevronRight,
    Camera,
    FileText,
    Award,
    Zap,
    BarChart3,
    PieChart as PieChartIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MahasiswaInfo {
    id: number;
    nama: string;
    nim: string;
    avatar_url?: string;
}

interface UpcomingSession {
    id: number;
    title: string;
    course_name: string;
    meeting_number: number;
    start_at: string;
    end_at: string;
}

interface RecentActivity {
    id: number;
    type: 'attendance' | 'selfie_approved' | 'selfie_rejected' | 'achievement';
    message: string;
    time: string;
    status?: 'success' | 'warning' | 'error';
}

interface Achievement {
    type: 'streak' | 'perfect' | 'early' | 'consistent' | 'champion' | 'legend';
    value?: number;
    unlocked: boolean;
}

interface ChartDataItem {
    label: string;
    present?: number;
    late?: number;
    absent?: number;
    total?: number;
    value?: number;
}

interface ChartData {
    weekly: ChartDataItem[];
    monthly: ChartDataItem[];
    daily: ChartDataItem[];
    distribution: ChartDataItem[];
}

interface DashboardStats {
    totalAttendance: number;
    totalSessions: number;
    attendanceRate: number;
    currentStreak: number;
    longestStreak: number;
    onTimeRate: number;
    thisWeekAttendance: number;
    thisWeekTotal: number;
}

interface PageProps {
    mahasiswa: MahasiswaInfo;
    stats: DashboardStats;
    upcomingSessions: UpcomingSession[];
    recentActivity: RecentActivity[];
    achievements: Achievement[];
    notifications: { unread: number };
    chartData: ChartData;
}

const CHART_COLORS = {
    present: '#10b981',
    late: '#f59e0b',
    absent: '#f43f5e',
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <p className="font-medium text-slate-900 dark:text-white mb-2">{label}</p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

function CountdownTimer({ targetDate }: { targetDate: Date }) {
    const { hours, minutes, seconds, isComplete } = useCountdown({
        targetDate,
        autoStart: true,
    });

    if (isComplete) {
        return (
            <span className="text-emerald-600 font-semibold animate-pulse">
                Sedang berlangsung!
            </span>
        );
    }

    return (
        <div className="flex items-center gap-1 font-mono">
            <span className="bg-slate-900 text-white px-2 py-1 rounded text-sm dark:bg-white dark:text-slate-900">
                {String(hours).padStart(2, '0')}
            </span>
            <span className="text-slate-400">:</span>
            <span className="bg-slate-900 text-white px-2 py-1 rounded text-sm dark:bg-white dark:text-slate-900">
                {String(minutes).padStart(2, '0')}
            </span>
            <span className="text-slate-400">:</span>
            <span className="bg-slate-900 text-white px-2 py-1 rounded text-sm dark:bg-white dark:text-slate-900">
                {String(seconds).padStart(2, '0')}
            </span>
        </div>
    );
}

function QuickStatCard({
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
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colors[color])}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                        <AnimatedCounter value={value} suffix={suffix} />
                    </p>
                    {subtext && (
                        <p className="text-[10px] text-slate-400">{subtext}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function UserDashboard() {
    const { props } = usePage<{ props: PageProps }>();
    const {
        mahasiswa = { id: 0, nama: 'Mahasiswa', nim: '000000000000' },
        stats = {
            totalAttendance: 0,
            totalSessions: 0,
            attendanceRate: 0,
            currentStreak: 0,
            longestStreak: 0,
            onTimeRate: 0,
            thisWeekAttendance: 0,
            thisWeekTotal: 0,
        },
        upcomingSessions = [],
        recentActivity = [],
        achievements = [],
        notifications = { unread: 0 },
        chartData = { weekly: [], monthly: [], daily: [], distribution: [] },
    } = props as unknown as PageProps;

    const nextSession = upcomingSessions[0];

    // Transform chart data for Recharts
    const weeklyData = chartData.weekly.map(item => ({
        name: item.label,
        Hadir: item.present || 0,
        Terlambat: item.late || 0,
        'Tidak Hadir': item.absent || 0,
    }));

    const monthlyData = chartData.monthly.map(item => ({
        name: item.label,
        Hadir: item.present || 0,
        Terlambat: item.late || 0,
        'Tidak Hadir': item.absent || 0,
        Total: item.total || 0,
    }));

    const pieData = [
        { name: 'Hadir', value: chartData.distribution.find(d => d.label === 'Hadir')?.value || 0, color: CHART_COLORS.present },
        { name: 'Terlambat', value: chartData.distribution.find(d => d.label === 'Terlambat')?.value || 0, color: CHART_COLORS.late },
        { name: 'Tidak Hadir', value: chartData.distribution.find(d => d.label === 'Tidak Hadir')?.value || 0, color: CHART_COLORS.absent },
    ].filter(d => d.value > 0);

    const activityIcons = {
        attendance: CheckCircle,
        selfie_approved: Camera,
        selfie_rejected: Camera,
        achievement: Award,
    };

    const activityColors = {
        success: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
        warning: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
        error: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30',
    };

    return (
        <StudentLayout>
            <Head title="Dashboard" />

            <div className="space-y-6 p-6">
                {/* Welcome Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                                {mahasiswa.avatar_url ? (
                                    <img
                                        src={mahasiswa.avatar_url}
                                        alt={mahasiswa.nama}
                                        className="h-14 w-14 rounded-xl object-cover"
                                    />
                                ) : (
                                    <User className="h-8 w-8" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-emerald-100">Selamat datang,</p>
                                <h1 className="text-2xl font-bold">{mahasiswa.nama}</h1>
                                <p className="text-sm text-emerald-100">NIM: {mahasiswa.nim}</p>
                            </div>
                        </div>
                        
                        <div className="hidden sm:flex items-center gap-3">
                            {stats.currentStreak > 0 && (
                                <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur">
                                    <Flame className="h-5 w-5 text-orange-300" />
                                    <span className="font-bold">{stats.currentStreak}</span>
                                    <span className="text-sm text-emerald-100">hari streak</span>
                                </div>
                            )}
                            <Link href="/user/absen">
                                <Button className="bg-white text-emerald-600 hover:bg-emerald-50">
                                    <QrCode className="h-4 w-4 mr-2" />
                                    Absen Sekarang
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile CTA */}
                    <div className="mt-4 flex gap-2 sm:hidden">
                        <Link href="/user/absen" className="flex-1">
                            <Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50">
                                <QrCode className="h-4 w-4 mr-2" />
                                Absen Sekarang
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <QuickStatCard
                        icon={CheckCircle}
                        label="Total Kehadiran"
                        value={stats.totalAttendance}
                        subtext={`dari ${stats.totalSessions} sesi`}
                        color="emerald"
                    />
                    <QuickStatCard
                        icon={TrendingUp}
                        label="Persentase"
                        value={stats.attendanceRate}
                        suffix="%"
                        subtext="kehadiran"
                        color="sky"
                    />
                    <QuickStatCard
                        icon={Flame}
                        label="Streak Saat Ini"
                        value={stats.currentStreak}
                        suffix=" hari"
                        subtext={`terbaik: ${stats.longestStreak}`}
                        color="amber"
                    />
                    <QuickStatCard
                        icon={Zap}
                        label="Tepat Waktu"
                        value={stats.onTimeRate}
                        suffix="%"
                        subtext="minggu ini"
                        color="violet"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Upcoming & Activity */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Upcoming Session */}
                        {nextSession && (
                            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-amber-600" />
                                        <h2 className="font-semibold text-slate-900 dark:text-white">
                                            Sesi Berikutnya
                                        </h2>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium dark:bg-amber-900/30 dark:text-amber-400">
                                        Segera
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {nextSession.course_name}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            {nextSession.title || `Pertemuan ${nextSession.meeting_number}`}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(nextSession.start_at).toLocaleString('id-ID', {
                                                weekday: 'long',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-slate-500 mb-2">Dimulai dalam</p>
                                        <CountdownTimer targetDate={new Date(nextSession.start_at)} />
                                    </div>
                                </div>

                                <Link href="/user/absen" className="block mt-4">
                                    <Button className="w-full" variant="outline">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Persiapkan Absensi
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* This Week Progress */}
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-sky-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Progress Minggu Ini
                                    </h2>
                                </div>
                                <span className="text-sm text-slate-500">
                                    {stats.thisWeekAttendance}/{stats.thisWeekTotal} sesi
                                </span>
                            </div>

                            <Progress
                                value={stats.thisWeekTotal > 0 ? (stats.thisWeekAttendance / stats.thisWeekTotal) * 100 : 0}
                                className="h-3"
                                indicatorClassName="bg-gradient-to-r from-sky-500 to-emerald-500"
                            />

                            <div className="mt-4 grid grid-cols-7 gap-1">
                                {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, i) => (
                                    <div key={day} className="text-center">
                                        <p className="text-[10px] text-slate-400 mb-1">{day}</p>
                                        <div className={cn(
                                            'h-8 w-8 mx-auto rounded-lg flex items-center justify-center text-xs font-medium',
                                            i < stats.thisWeekAttendance
                                                ? 'bg-emerald-500 text-white'
                                                : i < stats.thisWeekTotal
                                                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                                                    : 'bg-slate-50 text-slate-300 dark:bg-slate-900'
                                        )}>
                                            {i < stats.thisWeekAttendance ? '✓' : '-'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Weekly Attendance Chart */}
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Tren Kehadiran Mingguan
                                    </h2>
                                </div>
                            </div>

                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="Hadir" fill={CHART_COLORS.present} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Terlambat" fill={CHART_COLORS.late} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Tidak Hadir" fill={CHART_COLORS.absent} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Monthly Trend Chart */}
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Tren Kehadiran 6 Bulan Terakhir
                                    </h2>
                                </div>
                            </div>

                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_COLORS.present} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={CHART_COLORS.present} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorTerlambat" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_COLORS.late} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={CHART_COLORS.late} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="Hadir"
                                        stroke={CHART_COLORS.present}
                                        fillOpacity={1}
                                        fill="url(#colorHadir)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="Terlambat"
                                        stroke={CHART_COLORS.late}
                                        fillOpacity={1}
                                        fill="url(#colorTerlambat)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Recent Activity */}
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-violet-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Aktivitas Terbaru
                                    </h2>
                                </div>
                                <Link href="/user/rekapan" className="text-sm text-emerald-600 hover:underline">
                                    Lihat semua
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {recentActivity.length === 0 ? (
                                    <p className="text-sm text-slate-500 text-center py-4">
                                        Belum ada aktivitas
                                    </p>
                                ) : (
                                    recentActivity.slice(0, 5).map((activity) => {
                                        const Icon = activityIcons[activity.type] || CheckCircle;
                                        const colorClass = activityColors[activity.status || 'success'];
                                        return (
                                            <div
                                                key={activity.id}
                                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                                            >
                                                <div className={cn('flex h-9 w-9 items-center justify-center rounded-full', colorClass)}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-slate-900 dark:text-white truncate">
                                                        {activity.message}
                                                    </p>
                                                    <p className="text-xs text-slate-400">{activity.time}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Achievements & Quick Links */}
                    <div className="space-y-6">
                        {/* Attendance Distribution Pie Chart */}
                        {pieData.length > 0 && (
                            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                                <div className="flex items-center gap-2 mb-4">
                                    <PieChartIcon className="h-5 w-5 text-violet-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Distribusi Kehadiran
                                    </h2>
                                </div>

                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>

                                <div className="flex justify-center gap-4 mt-2">
                                    {pieData.map((entry, index) => (
                                        <div key={index} className="flex items-center gap-2 text-xs">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: entry.color }}
                                            />
                                            <span className="text-slate-600 dark:text-slate-400">
                                                {entry.name}: {entry.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Achievements */}
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-amber-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Pencapaian
                                    </h2>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {(achievements.length > 0 ? achievements : [
                                    { type: 'streak' as const, value: stats.currentStreak, unlocked: stats.currentStreak >= 3 },
                                    { type: 'perfect' as const, unlocked: stats.attendanceRate === 100 },
                                    { type: 'early' as const, unlocked: stats.onTimeRate >= 90 },
                                    { type: 'consistent' as const, unlocked: stats.attendanceRate >= 80 },
                                    { type: 'champion' as const, unlocked: false },
                                    { type: 'legend' as const, unlocked: false },
                                ]).slice(0, 6).map((achievement, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            'flex flex-col items-center p-2 rounded-xl transition-all',
                                            achievement.unlocked
                                                ? 'bg-white dark:bg-slate-900'
                                                : 'opacity-40 grayscale'
                                        )}
                                    >
                                        <AchievementBadge
                                            type={achievement.type}
                                            value={achievement.unlocked ? achievement.value : undefined}
                                            size="sm"
                                        />
                                    </div>
                                ))}
                            </div>

                            <Link href="/user/achievements" className="block mt-4">
                                <Button variant="ghost" className="w-full text-sm">
                                    Lihat Semua Pencapaian
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        </div>

                        {/* Quick Links */}
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
                                Menu Cepat
                            </h2>

                            <div className="space-y-2">
                                <Link href="/user/absen">
                                    <Button variant="ghost" className="w-full justify-start">
                                        <QrCode className="h-4 w-4 mr-3 text-emerald-600" />
                                        Absensi
                                        <ChevronRight className="h-4 w-4 ml-auto" />
                                    </Button>
                                </Link>
                                <Link href="/user/rekapan">
                                    <Button variant="ghost" className="w-full justify-start">
                                        <FileText className="h-4 w-4 mr-3 text-sky-600" />
                                        Rekapan
                                        <ChevronRight className="h-4 w-4 ml-auto" />
                                    </Button>
                                </Link>
                                <Link href="/user/bukti-masuk">
                                    <Button variant="ghost" className="w-full justify-start">
                                        <Camera className="h-4 w-4 mr-3 text-violet-600" />
                                        Bukti Masuk
                                        <ChevronRight className="h-4 w-4 ml-auto" />
                                    </Button>
                                </Link>
                                <Link href="/user/profile">
                                    <Button variant="ghost" className="w-full justify-start">
                                        <User className="h-4 w-4 mr-3 text-amber-600" />
                                        Profil
                                        <ChevronRight className="h-4 w-4 ml-auto" />
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Attendance Rate Card */}
                        <div className="rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm dark:from-slate-800 dark:to-slate-900">
                            <p className="text-sm text-slate-400">Tingkat Kehadiran</p>
                            <div className="flex items-end gap-2 mt-2">
                                <span className="text-4xl font-bold">
                                    <AnimatedCounter value={stats.attendanceRate} suffix="%" />
                                </span>
                                {stats.attendanceRate >= 75 ? (
                                    <span className="text-emerald-400 text-sm mb-1">Bagus!</span>
                                ) : (
                                    <span className="text-amber-400 text-sm mb-1">Perlu ditingkatkan</span>
                                )}
                            </div>
                            <Progress
                                value={stats.attendanceRate}
                                className="mt-4 h-2 bg-slate-700"
                                indicatorClassName={cn(
                                    stats.attendanceRate >= 75 ? 'bg-emerald-500' : 'bg-amber-500'
                                )}
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                Minimal 75% untuk memenuhi syarat kehadiran
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
