import { router } from '@inertiajs/react';
import {
    Award,
    BarChart3,
    BookOpen,
    CalendarCheck,
    Camera,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileBarChart,
    Flame,
    MapPin,
    QrCode,
    RefreshCw,
    Settings,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Timer,
    TrendingUp,
    Users,
    UserCheck,
    XCircle,
    Zap,
    Activity,
    Target,
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart as RechartsPie,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface OverviewProps {
    stats: any[];
    activity: any[];
    weekly: { labels: string[]; values: number[] };
    weeklyDetailed?: { day: string; hadir: number; terlambat: number; tidakHadir: number }[];
    hourlyData?: { hour: string; count: number }[];
    topStudents?: { id: number; name: string; nim: string; attendance: number; streak: number }[];
    courseStats?: { name: string; hadir: number; terlambat: number; tidakHadir: number }[];
    attendanceRate?: number;
    upcomingSessions: any[];
    deviceDistribution: { label: string; total: number }[];
    activeSession?: any;
    settings?: any;
    activeStats?: any;
    securitySummary?: any;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
            <p className="font-semibold text-slate-900 dark:text-white mb-2">{label}</p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{entry.value}</span>
                </div>
            ))}
        </div>
    );
};

export default function DashboardOverview({
    stats,
    activity,
    weekly,
    weeklyDetailed,
    hourlyData,
    topStudents,
    courseStats,
    attendanceRate,
    upcomingSessions,
    deviceDistribution,
    activeSession,
    settings,
    activeStats,
    securitySummary,
}: OverviewProps) {
    const [currentTime, setCurrentTime] = useState(new Date());
    
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
        present: { label: 'Hadir', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: CheckCircle2 },
        late: { label: 'Terlambat', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Clock },
        rejected: { label: 'Ditolak', color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30', icon: XCircle },
    };

    const weeklyChartData = weeklyDetailed ?? weekly.labels.map((label, i) => ({
        day: label,
        hadir: weekly.values[i] ?? 0,
        terlambat: 0,
        tidakHadir: 0,
    }));

    const deviceChartData = deviceDistribution.map((d, i) => ({
        name: d.label,
        value: d.total,
        color: COLORS[i % COLORS.length],
    }));

    return (
        <div className="space-y-6">
            {/* Hero Header with Gradient */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                
                <div className="relative">
                    <div className="flex flex-wrap items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-indigo-200">Selamat datang di</p>
                                    <h1 className="text-3xl font-bold">Dashboard Admin</h1>
                                </div>
                            </div>
                            <p className="text-indigo-100 max-w-xl mt-4">
                                Pantau kehadiran mahasiswa secara real-time dengan sistem absensi berbasis AI, QR code dinamis, dan verifikasi selfie.
                            </p>
                            
                            {/* Quick Action Buttons */}
                            <div className="flex flex-wrap gap-3 mt-6">
                                <a href="/admin/sesi-absen" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-600 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
                                    <CalendarCheck className="h-4 w-4" />
                                    Buat Sesi
                                </a>
                                <a href="/admin/qr-builder" className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/30">
                                    <QrCode className="h-4 w-4" />
                                    Generate QR
                                </a>
                                <a href="/admin/rekap-kehadiran" className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/30">
                                    <FileBarChart className="h-4 w-4" />
                                    Export Laporan
                                </a>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                                <p className="text-4xl font-bold tabular-nums">
                                    {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-indigo-200">
                                    {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button onClick={() => router.reload()} className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/30 transition-colors">
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh
                                </button>
                                <a href="/admin/pengaturan" className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-white/30 transition-colors">
                                    <Settings className="h-4 w-4" />
                                    Pengaturan
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const icons = [UserCheck, Clock, Camera, Users];
                    const Icon = icons[index] ?? Users;
                    const colors = {
                        emerald: { bg: 'bg-emerald-500', light: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600' },
                        amber: { bg: 'bg-amber-500', light: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600' },
                        rose: { bg: 'bg-rose-500', light: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600' },
                        sky: { bg: 'bg-sky-500', light: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-600' },
                    };
                    const color = colors[stat.tone as keyof typeof colors] ?? colors.sky;

                    return (
                        <div key={stat.title} className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur transition-all hover:shadow-lg hover:scale-[1.02] dark:border-slate-800/70 dark:bg-slate-950/70">
                            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${color.light} opacity-50 transition-transform group-hover:scale-150`} />
                            <div className="relative">
                                <div className="flex items-start justify-between">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color.light}`}>
                                        <Icon className={`h-6 w-6 ${color.text}`} />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value.toLocaleString()}</p>
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">{stat.title}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{stat.note}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>


            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Weekly Attendance Chart */}
                <div className="lg:col-span-2 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Kehadiran Mingguan</h2>
                            <p className="text-sm text-slate-500">Statistik 7 hari terakhir</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Hadir</span>
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Terlambat</span>
                            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" />Tidak Hadir</span>
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyChartData}>
                                <defs>
                                    <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorTerlambat" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="hadir" name="Hadir" stroke="#10b981" strokeWidth={2} fill="url(#colorHadir)" />
                                <Area type="monotone" dataKey="terlambat" name="Terlambat" stroke="#f59e0b" strokeWidth={2} fill="url(#colorTerlambat)" />
                                <Area type="monotone" dataKey="tidakHadir" name="Tidak Hadir" stroke="#ef4444" strokeWidth={2} fillOpacity={0.1} fill="#ef4444" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Attendance Rate Gauge */}
                <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Tingkat Kehadiran</h2>
                    <p className="text-sm text-slate-500 mb-4">Persentase kehadiran keseluruhan</p>
                    <div className="h-52 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={[{ value: attendanceRate ?? 0, fill: '#10b981' }]} startAngle={180} endAngle={0}>
                                <RadialBar background dataKey="value" cornerRadius={10} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-center -mt-8">
                        <p className="text-4xl font-bold text-slate-900 dark:text-white">{attendanceRate ?? 0}%</p>
                        <p className="text-sm text-slate-500">Rata-rata kehadiran</p>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-xl bg-emerald-50 p-2 dark:bg-emerald-900/20">
                            <p className="font-semibold text-emerald-600">{stats[0]?.value ?? 0}</p>
                            <p className="text-emerald-600/70">Hadir</p>
                        </div>
                        <div className="rounded-xl bg-amber-50 p-2 dark:bg-amber-900/20">
                            <p className="font-semibold text-amber-600">{stats[1]?.value ?? 0}</p>
                            <p className="text-amber-600/70">Terlambat</p>
                        </div>
                        <div className="rounded-xl bg-rose-50 p-2 dark:bg-rose-900/20">
                            <p className="font-semibold text-rose-600">{stats[2]?.value ?? 0}</p>
                            <p className="text-rose-600/70">Ditolak</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Second Row */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent Activity */}
                <div className="lg:col-span-2 rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Aktivitas Terbaru</h2>
                            <p className="text-sm text-slate-500">Real-time absensi mahasiswa</p>
                        </div>
                        <a href="/admin/live-monitor" className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700">
                            Lihat semua <ChevronRight className="h-4 w-4" />
                        </a>
                    </div>
                    <div className="space-y-3">
                        {activity.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                                Belum ada aktivitas hari ini.
                            </div>
                        ) : (
                            activity.slice(0, 5).map((item) => {
                                const config = statusConfig[item.status] ?? statusConfig.present;
                                const Icon = config.icon;
                                return (
                                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg}`}>
                                            <Icon className={`h-5 w-5 ${config.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-white truncate">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.distance_m ? `Radius ${item.distance_m}m` : 'Data jarak belum ada'}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                                                {config.label}
                                            </span>
                                            <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Top Students */}
                <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top Mahasiswa</h2>
                            <p className="text-sm text-slate-500">Kehadiran terbaik</p>
                        </div>
                        <Award className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="space-y-3">
                        {(topStudents ?? []).length === 0 ? (
                            <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                                Belum ada data.
                            </div>
                        ) : (
                            (topStudents ?? []).map((student, index) => (
                                <div key={student.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                                        index === 0 ? 'bg-amber-100 text-amber-700' :
                                        index === 1 ? 'bg-slate-200 text-slate-700' :
                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{student.name}</p>
                                        <p className="text-xs text-slate-500">{student.nim}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-emerald-600 text-sm">{student.attendance}%</p>
                                        <div className="flex items-center gap-1 text-xs text-amber-600">
                                            <Flame className="h-3 w-3" />
                                            {student.streak}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>


            {/* Third Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Course Stats */}
                <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Kehadiran per Mata Kuliah</h2>
                            <p className="text-sm text-slate-500">Perbandingan antar mata kuliah</p>
                        </div>
                        <BookOpen className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="h-64">
                        {(courseStats ?? []).length === 0 ? (
                            <div className="flex items-center justify-center h-full rounded-2xl border border-slate-200/60 bg-slate-50 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                                Belum ada data mata kuliah.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={courseStats} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 11 }} width={100} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="hadir" name="Hadir" fill="#10b981" stackId="a" />
                                    <Bar dataKey="terlambat" name="Terlambat" fill="#f59e0b" stackId="a" />
                                    <Bar dataKey="tidakHadir" name="Tidak Hadir" fill="#ef4444" stackId="a" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Device & Hourly Stats */}
                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Device Distribution */}
                    <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-900 dark:text-white">Perangkat</h2>
                            <Smartphone className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="h-40">
                            {deviceChartData.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-sm text-slate-500">
                                    Belum ada data.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPie>
                                        <Pie data={deviceChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                            {deviceChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RechartsPie>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                            {deviceChartData.map((device, index) => (
                                <div key={index} className="flex items-center gap-1.5 text-xs">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: device.color }} />
                                    <span className="text-slate-600 dark:text-slate-400">{device.name}</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{device.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hourly Distribution */}
                    <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-slate-900 dark:text-white">Jam Absen</h2>
                            <Clock className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="h-40">
                            {(hourlyData ?? []).length === 0 ? (
                                <div className="flex items-center justify-center h-full text-sm text-slate-500">
                                    Belum ada data hari ini.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={hourlyData}>
                                        <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <YAxis hide />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="count" name="Absen" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Security & Session Info */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Active Session */}
                <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Sesi Aktif</h2>
                            <p className="text-sm text-slate-500">Status sesi saat ini</p>
                        </div>
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${activeSession ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            <span className={`h-2 w-2 rounded-full ${activeSession ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            {activeSession ? 'Live' : 'Idle'}
                        </span>
                    </div>
                    {activeSession ? (
                        <div className="space-y-3">
                            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 dark:from-indigo-900/20 dark:to-purple-900/20">
                                <p className="font-semibold text-slate-900 dark:text-white">{activeSession.course?.nama ?? activeSession.title}</p>
                                <p className="text-sm text-slate-500">Pertemuan {activeSession.meeting_number}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                    <p className="text-xs text-slate-500">Scan masuk</p>
                                    <p className="font-semibold text-slate-900 dark:text-white">{activeStats?.total ?? 0}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                    <p className="text-xs text-slate-500">Ditolak</p>
                                    <p className="font-semibold text-rose-600">{activeStats?.rejected ?? 0}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900">
                            <Zap className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">Belum ada sesi aktif</p>
                            <a href="/admin/sesi-absen" className="inline-flex items-center gap-2 mt-3 text-sm text-indigo-600 hover:text-indigo-700">
                                Buat sesi baru <ChevronRight className="h-4 w-4" />
                            </a>
                        </div>
                    )}
                </div>

                {/* Security Summary */}
                <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Keamanan</h2>
                            <p className="text-sm text-slate-500">Audit & kepatuhan</p>
                        </div>
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/50">
                            <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <Target className="h-4 w-4 text-emerald-500" />
                                Token ganda
                            </span>
                            <span className="font-semibold text-emerald-600">{securitySummary?.duplicate_tokens ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/50">
                            <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <Camera className="h-4 w-4 text-sky-500" />
                                Selfie lolos
                            </span>
                            <span className="font-semibold text-sky-600">{securitySummary?.selfie_rate ?? 0}%</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/50">
                            <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <Timer className="h-4 w-4 text-amber-500" />
                                Token kadaluarsa
                            </span>
                            <span className="font-semibold text-amber-600">{securitySummary?.expired_tokens ?? 0}</span>
                        </div>
                    </div>
                </div>

                {/* Upcoming Sessions */}
                <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Sesi Berikutnya</h2>
                            <p className="text-sm text-slate-500">Jadwal mendatang</p>
                        </div>
                        <CalendarCheck className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="space-y-3">
                        {upcomingSessions.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                                Belum ada jadwal.
                            </div>
                        ) : (
                            upcomingSessions.slice(0, 3).map((session) => (
                                <div key={session.id} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/50">
                                    <p className="font-medium text-slate-900 dark:text-white text-sm">{session.course?.nama}</p>
                                    <p className="text-xs text-slate-500">Pertemuan {session.meeting_number}</p>
                                    <p className="text-xs text-slate-400 mt-1">{session.start_at}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Aksi Cepat</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <a href="/admin/qr-builder" className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 transition-all hover:bg-white hover:shadow-md dark:border-slate-800/70 dark:bg-slate-900/50 dark:hover:bg-slate-900">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 transition-transform group-hover:scale-110">
                            <QrCode className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-slate-900 dark:text-white">QR Builder</p>
                            <p className="text-sm text-slate-500">Buat QR code absensi</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </a>
                    <a href="/admin/mahasiswa" className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 transition-all hover:bg-white hover:shadow-md dark:border-slate-800/70 dark:bg-slate-900/50 dark:hover:bg-slate-900">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 transition-transform group-hover:scale-110">
                            <Users className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-slate-900 dark:text-white">Mahasiswa</p>
                            <p className="text-sm text-slate-500">Kelola data mahasiswa</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </a>
                    <a href="/admin/sesi-absen" className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 transition-all hover:bg-white hover:shadow-md dark:border-slate-800/70 dark:bg-slate-900/50 dark:hover:bg-slate-900">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 transition-transform group-hover:scale-110">
                            <CalendarCheck className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-slate-900 dark:text-white">Sesi Absen</p>
                            <p className="text-sm text-slate-500">Kelola sesi absensi</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </a>
                    <a href="/admin/rekap-kehadiran" className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 transition-all hover:bg-white hover:shadow-md dark:border-slate-800/70 dark:bg-slate-900/50 dark:hover:bg-slate-900">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 transition-transform group-hover:scale-110">
                            <FileBarChart className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-slate-900 dark:text-white">Rekap</p>
                            <p className="text-sm text-slate-500">Lihat rekap kehadiran</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                    </a>
                </div>
            </div>
        </div>
    );
}
