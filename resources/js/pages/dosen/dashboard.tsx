import { Head, Link } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {
    BookOpen,
    Users,
    Calendar,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Play,
    Image,
    QrCode,
    FileText,
    BarChart3,
    Settings,
    Eye,
    ClipboardList,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface DosenInfo {
    id: number;
    nama: string;
    nidn: string;
    email: string;
    avatar_url?: string;
    initials: string;
}

interface TodaySchedule {
    id: number;
    course_name: string;
    meeting_number: number;
    time: string;
    room: string;
    student_count: number;
}

interface Stats {
    totalCourses: number;
    totalStudents: number;
    totalSessions: number;
    thisMonthSessions: number;
    attendanceRate: number;
    pendingCount: number;
    todaySessionsCount: number;
    averageAttendanceRate: number;
}

interface PendingVerification {
    id: number;
    mahasiswa: string;
    nim: string;
    course: string;
    selfie_url: string | null;
    scanned_at: string;
}

interface ActiveSession {
    id: number;
    title: string;
    meeting_number: number;
    course: string;
    start_at: string;
    end_at: string;
    attendance_count: number;
}

interface MonthlyTrend {
    month: string;
    total: number;
    present: number;
    rate: number;
}

interface CourseStat {
    id: number;
    name: string;
    sessions: number;
    present: number;
    late: number;
    absent: number;
}

interface RecentActivity {
    id: number;
    mahasiswa: string;
    nim: string;
    course: string;
    status: string;
    time: string;
}

interface PageProps {
    dosen: DosenInfo;
    stats: Stats;
    pendingVerifications: PendingVerification[];
    activeSessions: ActiveSession[];
    monthlyTrend: MonthlyTrend[];
    courseStats: CourseStat[];
    recentActivity: RecentActivity[];
    todaySchedule?: TodaySchedule[];
}

const statusConfig: Record<string, { label: string; color: string }> = {
    present: { label: 'Hadir', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    late: { label: 'Terlambat', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    rejected: { label: 'Ditolak', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
    pending: { label: 'Pending', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15,
        },
    },
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-black">
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

export default function DosenDashboard({ dosen, stats, pendingVerifications, activeSessions, monthlyTrend, courseStats, recentActivity, todaySchedule = [] }: PageProps) {
    const quickActions = [
        { icon: QrCode, label: 'Buat Sesi Baru', href: '/dosen/sessions/create', color: 'from-emerald-500 to-emerald-600', description: 'Mulai sesi absensi' },
        { icon: Eye, label: 'Verifikasi Selfie', href: '/dosen/verify', color: 'from-amber-500 to-amber-600', description: `${stats.pendingCount} pending`, badge: stats.pendingCount },
        { icon: FileText, label: 'Lihat Laporan', href: '/dosen/reports', color: 'from-sky-500 to-sky-600', description: 'Export & analisis' },
        { icon: ClipboardList, label: 'Kelola Tugas', href: '/dosen/tugas', color: 'from-violet-500 to-violet-600', description: 'Buat & nilai tugas' },
        { icon: BarChart3, label: 'Statistik Kelas', href: '/dosen/class-insights', color: 'from-indigo-500 to-indigo-600', description: 'Analisis mendalam' },
        { icon: Settings, label: 'Pengaturan', href: '/dosen/settings', color: 'from-slate-500 to-slate-600', description: 'Konfigurasi sistem' },
    ];

    return (
        <DosenLayout>
            <Head title="Dashboard Dosen" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-6"
            >
                {/* Header - Clean & Simple */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl bg-black p-6 text-white shadow-lg border border-gray-800"
                >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 text-2xl font-bold">
                                {dosen.initials}
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Selamat Datang,</p>
                                <h1 className="text-2xl font-bold">{dosen.nama}</h1>
                                <p className="text-sm text-gray-400">NIDN: {dosen.nidn}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {stats.pendingCount > 0 && (
                                <Link href="/dosen/verify">
                                    <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                                        <AlertCircle className="h-4 w-4 mr-2" />
                                        {stats.pendingCount} Verifikasi Pending
                                    </Button>
                                </Link>
                            )}
                            
                            {todaySchedule.length > 0 && (
                                <div className="hidden sm:flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2">
                                    <Calendar className="h-4 w-4 text-emerald-400" />
                                    <span className="text-sm font-medium">{todaySchedule.length} kelas hari ini</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                            { icon: BookOpen, label: 'Mata Kuliah', value: stats.totalCourses },
                            { icon: Users, label: 'Mahasiswa', value: stats.totalStudents },
                            { icon: Calendar, label: 'Total Sesi', value: stats.totalSessions },
                            { icon: TrendingUp, label: 'Kehadiran', value: stats.attendanceRate, suffix: '%' },
                        ].map((stat, i) => (
                            <div key={i} className="rounded-xl bg-white/5 p-3 border border-white/10">
                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                    <stat.icon className="h-4 w-4" />
                                    <span className="text-xs font-medium">{stat.label}</span>
                                </div>
                                <p className="text-2xl font-bold">
                                    <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={1500} />
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-black"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="h-5 w-5 text-amber-600" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">Aksi Cepat</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {quickActions.map((action) => (
                            <Link key={action.href} href={action.href}>
                                <div className={cn("relative rounded-xl bg-gradient-to-br p-4 text-white cursor-pointer hover:scale-105 transition-transform", action.color)}>
                                    {action.badge && action.badge > 0 && (
                                        <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/30 text-xs font-bold">
                                            {action.badge}
                                        </div>
                                    )}
                                    <action.icon className="h-6 w-6 mb-3" />
                                    <p className="text-sm font-semibold mb-1">{action.label}</p>
                                    <p className="text-xs opacity-90">{action.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.div>

                {/* Today's Schedule */}
                {todaySchedule.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm dark:border-indigo-800 dark:bg-black"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="h-5 w-5 text-indigo-600" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Jadwal Hari Ini</h2>
                            <span className="ml-auto px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                                {todaySchedule.length} kelas
                            </span>
                        </div>
                        
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {todaySchedule.map((schedule) => (
                                <div key={schedule.id} className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white text-xs font-bold">
                                                {schedule.meeting_number}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{schedule.course_name}</p>
                                                <p className="text-xs text-slate-500">{schedule.time}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {schedule.student_count} mhs
                                        </span>
                                        <span>{schedule.room}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Active Sessions & Pending Verifications */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Active Sessions */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-black"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Play className="h-5 w-5 text-emerald-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Sesi Aktif</h2>
                            </div>
                            <Link href="/dosen/courses" className="text-sm text-indigo-600 hover:underline">
                                Lihat Semua
                            </Link>
                        </div>
                        {activeSessions.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <Calendar className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                                <p>Tidak ada sesi aktif</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activeSessions.map((session) => (
                                    <Link key={session.id} href={`/dosen/sessions/${session.id}`}>
                                        <div className="flex items-center gap-4 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold">
                                                {session.meeting_number}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-900 dark:text-white truncate">{session.title}</p>
                                                <p className="text-sm text-slate-500">{session.course}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-emerald-600">{session.attendance_count} hadir</p>
                                                <p className="text-xs text-slate-500">{session.start_at} - {session.end_at}</p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Pending Verifications */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-black"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Image className="h-5 w-5 text-amber-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Verifikasi Pending</h2>
                            </div>
                            <Link href="/dosen/verify" className="text-sm text-indigo-600 hover:underline">
                                Lihat Semua
                            </Link>
                        </div>
                        {pendingVerifications.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-emerald-400" />
                                <p>Semua selfie sudah diverifikasi</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingVerifications.map((v) => (
                                    <Link key={v.id} href="/dosen/verify">
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors dark:bg-amber-900/20 dark:hover:bg-amber-900/30">
                                            {v.selfie_url ? (
                                                <img src={v.selfie_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                                            ) : (
                                                <div className="h-12 w-12 rounded-lg bg-slate-200 flex items-center justify-center">
                                                    <Image className="h-5 w-5 text-slate-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-900 dark:text-white truncate">{v.mahasiswa}</p>
                                                <p className="text-sm text-slate-500">{v.nim} • {v.course}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">{v.scanned_at}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Charts */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Monthly Trend */}
                    {monthlyTrend.length > 0 && (
                        <motion.div
                            variants={itemVariants}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-black"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="h-5 w-5 text-indigo-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Tren Kehadiran 6 Bulan</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={monthlyTrend}>
                                    <defs>
                                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="present" name="Hadir" stroke="#6366f1" fillOpacity={1} fill="url(#colorPresent)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}

                    {/* Course Stats */}
                    {courseStats.length > 0 && (
                        <motion.div
                            variants={itemVariants}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-black"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <BookOpen className="h-5 w-5 text-purple-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Statistik per Mata Kuliah</h2>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={courseStats.map(c => ({ name: c.name.length > 12 ? c.name.substring(0, 12) + '...' : c.name, Hadir: c.present, Terlambat: c.late, Absen: c.absent }))}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="Hadir" fill="#10b981" />
                                    <Bar dataKey="Terlambat" fill="#f59e0b" />
                                    <Bar dataKey="Absen" fill="#f43f5e" />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}
                </div>

                {/* Recent Activity */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-black"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-5 w-5 text-slate-600" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">Aktivitas Terbaru</h2>
                    </div>
                    {recentActivity.length === 0 ? (
                        <p className="text-center py-8 text-slate-500">Belum ada aktivitas</p>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-gray-800">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-4 py-3">
                                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium', statusConfig[activity.status]?.color || 'bg-slate-100 text-slate-600')}>
                                        {activity.mahasiswa.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{activity.mahasiswa}</p>
                                        <p className="text-xs text-slate-500">{activity.nim} • {activity.course}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusConfig[activity.status]?.color || 'bg-slate-100 text-slate-600')}>
                                            {statusConfig[activity.status]?.label || activity.status}
                                        </span>
                                        <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </DosenLayout>
    );
}
