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

// Animation variants removed - using inline animations for better TypeScript compatibility

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

            <div className="space-y-6 p-6">
                {/* Header - Black Background with Same Style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6 text-white shadow-xl"
                >
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 animate-pulse" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-white/5 animate-bounce" style={{ animationDuration: '3s' }} />
                    
                    {/* Floating Icons */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[BookOpen, Users, Calendar].map((Icon, i) => (
                            <Icon 
                                key={i}
                                className="absolute text-white/20 animate-pulse"
                                style={{
                                    left: `${15 + i * 25}%`,
                                    top: `${20 + (i % 2) * 40}%`,
                                    animationDelay: `${i * 0.5}s`,
                                    animationDuration: '2s'
                                }}
                                size={24}
                            />
                        ))}
                    </div>
                    
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg animate-bounce" style={{ animationDuration: '2s' }}>
                                    {dosen.initials}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-300 font-medium">Selamat Datang,</p>
                                    <h1 className="text-2xl font-bold">{dosen.nama}</h1>
                                    <p className="text-sm text-gray-400">NIDN: {dosen.nidn}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {stats.pendingCount > 0 && (
                                    <Link href="/dosen/verify">
                                        <Button className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg">
                                            <AlertCircle className="h-4 w-4 mr-2" />
                                            {stats.pendingCount} Verifikasi Pending
                                        </Button>
                                    </Link>
                                )}
                                
                                {todaySchedule.length > 0 && (
                                    <div className="hidden sm:flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur">
                                        <Calendar className="h-4 w-4 text-emerald-400" />
                                        <span className="text-sm font-medium">{todaySchedule.length} kelas hari ini</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Quick Stats in Header */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: BookOpen, label: 'Mata Kuliah', value: stats.totalCourses, color: 'text-white' },
                                { icon: Users, label: 'Mahasiswa', value: stats.totalStudents, color: 'text-blue-200' },
                                { icon: Calendar, label: 'Total Sesi', value: stats.totalSessions, color: 'text-purple-200' },
                                { icon: TrendingUp, label: 'Kehadiran', value: stats.attendanceRate, suffix: '%', color: 'text-emerald-200' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                                    <div className="flex items-center gap-2 mb-1">
                                        <stat.icon className={cn("h-4 w-4", stat.color)} />
                                        <p className="text-gray-300 text-xs font-medium">{stat.label}</p>
                                    </div>
                                    <p className="text-2xl font-bold">
                                        <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={1500} />
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    {[
                        { icon: BookOpen, label: 'Mata Kuliah', value: stats.totalCourses, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/25' },
                        { icon: Users, label: 'Mahasiswa', value: stats.totalStudents, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
                        { icon: Calendar, label: 'Total Sesi', value: stats.totalSessions, color: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/25' },
                        { icon: TrendingUp, label: 'Kehadiran', value: stats.attendanceRate, suffix: '%', color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25' },
                    ].map((stat, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 transition-all duration-500 hover:scale-105 hover:shadow-xl group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110',
                                    stat.color, stat.shadow
                                )}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                        <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={1500} />
                                    </p>
                                    <p className="text-sm text-slate-500">{stat.label}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                            <Zap className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-slate-900 dark:text-white">Aksi Cepat</h2>
                            <p className="text-xs text-slate-500">Akses cepat ke fitur utama</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {quickActions.map((action, index) => (
                            <Link key={action.href} href={action.href}>
                                <div className={cn(
                                    "relative rounded-xl bg-gradient-to-br p-4 text-white cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group",
                                    action.color
                                )}>
                                    {action.badge && action.badge > 0 && (
                                        <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/30 backdrop-blur text-xs font-bold animate-pulse">
                                            {action.badge}
                                        </div>
                                    )}
                                    
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 mb-3 group-hover:scale-110 transition-transform">
                                        <action.icon className="h-5 w-5" />
                                    </div>
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="rounded-2xl border border-indigo-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-indigo-800/70 dark:bg-black/70"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <h2 className="font-semibold text-slate-900 dark:text-white">Jadwal Hari Ini</h2>
                                <p className="text-xs text-slate-500">{todaySchedule.length} kelas terjadwal</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                                {todaySchedule.length} kelas
                            </span>
                        </div>
                        
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {todaySchedule.map((schedule, index) => (
                                <div 
                                    key={schedule.id} 
                                    className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800 hover:scale-105 transition-all duration-300 cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white text-xs font-bold group-hover:scale-110 transition-transform">
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white">
                                    <Play className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Sesi Aktif</h2>
                                    <p className="text-xs text-slate-500">{activeSessions.length} sesi berlangsung</p>
                                </div>
                            </div>
                            <Link href="/dosen/courses" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                                Lihat Semua <ChevronRight className="h-3 w-3" />
                            </Link>
                        </div>
                        {activeSessions.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="relative mx-auto w-16 h-16 mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full opacity-20 animate-ping" />
                                    <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full">
                                        <Calendar className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Tidak ada sesi aktif</p>
                                <p className="text-xs text-slate-500 mt-1">Buat sesi baru untuk memulai</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activeSessions.map((session, index) => (
                                    <Link key={session.id} href={`/dosen/sessions/${session.id}`}>
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-200 dark:border-emerald-800 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                                                {session.meeting_number}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 dark:text-white truncate">{session.title}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">{session.course}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{session.attendance_count} hadir</p>
                                                <p className="text-xs text-slate-500">{session.start_at} - {session.end_at}</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Pending Verifications */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                                    <Image className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Verifikasi Pending</h2>
                                    <p className="text-xs text-slate-500">{pendingVerifications.length} menunggu verifikasi</p>
                                </div>
                            </div>
                            <Link href="/dosen/verify" className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
                                Lihat Semua <ChevronRight className="h-3 w-3" />
                            </Link>
                        </div>
                        {pendingVerifications.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="relative mx-auto w-16 h-16 mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full opacity-20 animate-ping" />
                                    <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full">
                                        <CheckCircle2 className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Semua selfie sudah diverifikasi</p>
                                <p className="text-xs text-slate-500 mt-1">Kerja bagus! 🎉</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingVerifications.map((v, index) => (
                                    <Link key={v.id} href="/dosen/verify">
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                                            {v.selfie_url ? (
                                                <img src={v.selfie_url} alt="" className="h-14 w-14 rounded-xl object-cover ring-2 ring-amber-300 shadow-lg group-hover:scale-110 transition-transform" />
                                            ) : (
                                                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center shadow-lg">
                                                    <Image className="h-6 w-6 text-amber-600" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 dark:text-white truncate">{v.mahasiswa}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">{v.nim}</p>
                                                <p className="text-xs text-slate-500">{v.course}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-medium">
                                                    <Clock className="h-3 w-3" /> Pending
                                                </span>
                                                <p className="text-xs text-slate-500 mt-1">{v.scanned_at}</p>
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
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.9 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Tren Kehadiran</h2>
                                    <p className="text-xs text-slate-500">6 bulan terakhir</p>
                                </div>
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
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 1.0 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                                    <BookOpen className="h-4 w-4" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-slate-900 dark:text-white">Statistik Mata Kuliah</h2>
                                    <p className="text-xs text-slate-500">{courseStats.length} mata kuliah</p>
                                </div>
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.1 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-slate-500 to-gray-600 text-white">
                            <Clock className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-slate-900 dark:text-white">Aktivitas Terbaru</h2>
                            <p className="text-xs text-slate-500">Real-time updates</p>
                        </div>
                    </div>
                    {recentActivity.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="relative mx-auto w-16 h-16 mb-4">
                                <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-gray-500 rounded-full opacity-20 animate-ping" />
                                <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-slate-500 to-gray-500 rounded-full">
                                    <Clock className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Belum ada aktivitas</p>
                            <p className="text-xs text-slate-500 mt-1">Aktivitas akan muncul di sini</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-gray-800">
                            {recentActivity.map((activity, index) => (
                                <div key={activity.id} className="flex items-center gap-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
                                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold shadow-lg', statusConfig[activity.status]?.color || 'bg-slate-100 text-slate-600')}>
                                        {activity.mahasiswa.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{activity.mahasiswa}</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">{activity.nim} • {activity.course}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', statusConfig[activity.status]?.color || 'bg-slate-100 text-slate-600')}>
                                            {statusConfig[activity.status]?.label || activity.status}
                                        </span>
                                        <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </DosenLayout>
    );
}
