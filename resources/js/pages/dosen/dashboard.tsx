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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface DosenInfo {
    id: number;
    nama: string;
    nidn: string;
    email: string;
    avatar_url?: string;
    initials: string;
}

interface Stats {
    totalCourses: number;
    totalStudents: number;
    totalSessions: number;
    thisMonthSessions: number;
    attendanceRate: number;
    pendingCount: number;
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
}

const statusConfig: Record<string, { label: string; color: string }> = {
    present: { label: 'Hadir', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    late: { label: 'Terlambat', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    rejected: { label: 'Ditolak', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
    pending: { label: 'Pending', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
};

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 17,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 20,
        },
    },
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-black"
        >
            <p className="font-medium text-slate-900 dark:text-white mb-2">{label}</p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{entry.value}</span>
                </div>
            ))}
        </motion.div>
    );
};

export default function DosenDashboard({ dosen, stats, pendingVerifications, activeSessions, monthlyTrend, courseStats, recentActivity }: PageProps) {
    return (
        <DosenLayout>
            <Head title="Dashboard Dosen" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-6 space-y-6"
            >
                {/* Header */}
                <motion.div
                    variants={cardVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                    />

                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur text-2xl font-bold"
                                >
                                    {dosen.initials}
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-indigo-100"
                                    >
                                        Selamat Datang,
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-2xl font-bold"
                                    >
                                        {dosen.nama}
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-sm text-indigo-100"
                                    >
                                        NIDN: {dosen.nidn}
                                    </motion.p>
                                </div>
                            </div>
                            {stats.pendingCount > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link href="/dosen/verify">
                                        <Button className="bg-white/20 hover:bg-white/30 text-white backdrop-blur">
                                            <AlertCircle className="h-4 w-4 mr-2" />
                                            {stats.pendingCount} Verifikasi Pending
                                        </Button>
                                    </Link>
                                </motion.div>
                            )}
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="rounded-xl bg-white/10 p-3 backdrop-blur cursor-pointer"
                            >
                                <div className="flex items-center gap-2 text-indigo-100 mb-1">
                                    <motion.div whileHover={{ rotate: 10 }}>
                                        <BookOpen className="h-4 w-4" />
                                    </motion.div>
                                    <span className="text-xs">Mata Kuliah</span>
                                </div>
                                <p className="text-2xl font-bold">
                                    <AnimatedCounter value={stats.totalCourses} duration={1500} />
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="rounded-xl bg-white/10 p-3 backdrop-blur cursor-pointer"
                            >
                                <div className="flex items-center gap-2 text-indigo-100 mb-1">
                                    <motion.div whileHover={{ rotate: 10 }}>
                                        <Users className="h-4 w-4" />
                                    </motion.div>
                                    <span className="text-xs">Mahasiswa</span>
                                </div>
                                <p className="text-2xl font-bold">
                                    <AnimatedCounter value={stats.totalStudents} duration={1500} />
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="rounded-xl bg-white/10 p-3 backdrop-blur cursor-pointer"
                            >
                                <div className="flex items-center gap-2 text-indigo-100 mb-1">
                                    <motion.div whileHover={{ rotate: 10 }}>
                                        <Calendar className="h-4 w-4" />
                                    </motion.div>
                                    <span className="text-xs">Total Sesi</span>
                                </div>
                                <p className="text-2xl font-bold">
                                    <AnimatedCounter value={stats.totalSessions} duration={1500} />
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="rounded-xl bg-white/10 p-3 backdrop-blur cursor-pointer"
                            >
                                <div className="flex items-center gap-2 text-indigo-100 mb-1">
                                    <motion.div whileHover={{ rotate: 10 }}>
                                        <TrendingUp className="h-4 w-4" />
                                    </motion.div>
                                    <span className="text-xs">Kehadiran</span>
                                </div>
                                <p className="text-2xl font-bold">
                                    <AnimatedCounter value={stats.attendanceRate} suffix="%" duration={1500} />
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Active Sessions & Pending Verifications */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Active Sessions */}
                    <motion.div
                        variants={cardVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <motion.div whileHover={{ rotate: 10 }}>
                                    <Play className="h-5 w-5 text-emerald-600" />
                                </motion.div>
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
                                {activeSessions.map((session, index) => (
                                    <Link key={session.id} href={`/dosen/sessions/${session.id}`}>
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ x: 5, scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-center gap-4 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30"
                                        >
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
                                            <motion.div whileHover={{ x: 5 }}>
                                                <ChevronRight className="h-4 w-4 text-slate-400" />
                                            </motion.div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Pending Verifications */}
                    <motion.div
                        variants={cardVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <motion.div whileHover={{ rotate: 10 }}>
                                    <Image className="h-5 w-5 text-amber-600" />
                                </motion.div>
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
                                {pendingVerifications.map((v, index) => (
                                    <Link key={v.id} href="/dosen/verify">
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ x: 5, scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors dark:bg-amber-900/20 dark:hover:bg-amber-900/30"
                                        >
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
                                        </motion.div>
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
                            variants={cardVariants}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <motion.div whileHover={{ rotate: 10 }}>
                                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                                </motion.div>
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
                            variants={cardVariants}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <motion.div whileHover={{ rotate: 10 }}>
                                    <BookOpen className="h-5 w-5 text-purple-600" />
                                </motion.div>
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
                    variants={cardVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/80"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <motion.div whileHover={{ rotate: 10 }}>
                            <Clock className="h-5 w-5 text-slate-600" />
                        </motion.div>
                        <h2 className="font-semibold text-slate-900 dark:text-white">Aktivitas Terbaru</h2>
                    </div>
                    {recentActivity.length === 0 ? (
                        <p className="text-center py-8 text-slate-500">Belum ada aktivitas</p>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-gray-800">
                            {recentActivity.map((activity, index) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ x: 5, backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
                                    className="flex items-center gap-4 py-3"
                                >
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
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </DosenLayout>
    );
}
