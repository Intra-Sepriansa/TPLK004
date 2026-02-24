import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Calendar, Play, Pause, Plus, Search, Clock, Users, CheckCircle, TrendingUp, BarChart3, RefreshCw, Copy, Trash2, Edit, Download, Zap, Timer, BookOpen, Sparkles, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { cn } from '@/lib/utils';
import DashboardOverview from '@/components/admin/dashboard-overview';
import EditSesiIcon from '@/assets/admin/sesi-absen/edit-sesi-icon.png';
import courseIcon from '@/assets/admin/sesi-absen/course-icon.png';
import sesiIcon from '@/assets/admin/sesi-absen/sesi-icon.png';
import hariIcon from '@/assets/admin/sesi-absen/hari-icon.png';
import rataRataIcon from '@/assets/admin/sesi-absen/rata-rata-icon.png';
interface Session {
    id: number;
    course_id: number;
    course_name: string;
    dosen_name: string;
    meeting_number: number;
    title: string | null;
    start_at: string;
    end_at: string;
    is_active: boolean;
    logs_count: number;
    tokens_count: number;
    present_count: number;
    late_count: number;
    rejected_count: number;
    status: string;
    duration_minutes: number;
}

interface Course {
    id: number;
    nama: string;
    sks: number;
    dosen: string;
}

interface Stats {
    total_sessions: number;
    active_sessions: number;
    today_sessions: number;
    today_attendance: number;
    week_sessions: number;
    week_attendance: number;
    month_sessions: number;
    month_attendance: number;
    avg_attendance_per_session: number;
    completion_rate: number;
}

interface ActiveSessionDetail {
    id: number;
    course_name: string;
    dosen_name: string;
    meeting_number: number;
    title: string | null;
    start_at: string;
    end_at: string;
    is_active: boolean;
    status: string;
    total_attendance: number;
    present_count: number;
    late_count: number;
    rejected_count: number;
    pending_selfie: number;
    total_tokens: number;
    active_tokens: number;
    duration_minutes: number;
    time_remaining: number;
}

interface TodaySession {
    id: number;
    course: string;
    meeting: number;
    time: string;
    is_active: boolean;
    status: string;
}

interface HourlyData { hour: string; count: number; }
interface WeeklyData { date: string; day: string; sessions: number; attendance: number; }
interface CoursePerf { id: number; name: string; total_sessions: number; completed_sessions: number; avg_attendance: number; }

interface PageProps {
    sessions: { data: Session[]; links: any[]; current_page: number; last_page: number; };
    courses: Course[];
    stats: Stats;
    activeSessionDetail: ActiveSessionDetail | null;
    todaySessions: TodaySession[];
    hourlyDistribution: HourlyData[];
    weeklyTrend: WeeklyData[];
    coursePerformance: CoursePerf[];
    filters: { course_id: string; status: string; search: string; per_page: number; };
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: 'Aktif', color: 'text-emerald-700', bg: 'bg-emerald-100' },
    scheduled: { label: 'Terjadwal', color: 'text-blue-700', bg: 'bg-blue-100' },
    ongoing: { label: 'Berlangsung', color: 'text-amber-700', bg: 'bg-amber-100' },
    completed: { label: 'Selesai', color: 'text-slate-700', bg: 'bg-slate-100' },
};

export default function SesiAbsen({ sessions, courses, stats, activeSessionDetail, todaySessions, hourlyDistribution, weeklyTrend, coursePerformance, filters }: PageProps) {

    const [showEditModal, setShowEditModal] = useState(false);
    const [editSession, setEditSession] = useState<Session | null>(null);
    const [search, setSearch] = useState(filters.search);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // Countdown Timer Effect
    useEffect(() => {
        if (!activeSessionDetail) return;

        const calculateCountdown = () => {
            const endTime = new Date(activeSessionDetail.end_at).getTime();
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setCountdown({ days, hours, minutes, seconds });
        };

        calculateCountdown();
        const interval = setInterval(calculateCountdown, 1000);

        return () => clearInterval(interval);
    }, [activeSessionDetail]);



    const editForm = useForm({
        course_id: '',
        meeting_number: 1,
        title: '',
        start_at: '',
        end_at: '',
    });

    const handleFilter = (key: string, value: string) => {
        router.get('/admin/sesi-absen', { ...filters, [key]: value }, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilter('search', search);
    };



    const handleEdit = (session: Session) => {
        setEditSession(session);
        editForm.setData({
            course_id: String(session.course_id),
            meeting_number: session.meeting_number,
            title: session.title || '',
            start_at: session.start_at,
            end_at: session.end_at,
        });
        setShowEditModal(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editSession) return;
        editForm.patch(`/admin/sesi-absen/${editSession.id}`, { onSuccess: () => { setShowEditModal(false); setEditSession(null); } });
    };

    const handleActivate = (id: number) => router.patch(`/admin/sesi-absen/${id}/activate`);
    const handleDeactivate = (id: number) => router.patch(`/admin/sesi-absen/${id}/deactivate`);
    const handleDuplicate = (id: number) => router.post(`/admin/sesi-absen/${id}/duplicate`);

    const openDeleteDialog = (id: number) => setDeleteDialog({ open: true, id });
    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/admin/sesi-absen/${deleteDialog.id}`);
            setDeleteDialog({ open: false, id: null });
        }
    };

    return (
        <AppLayout>
            <Head title="Sesi Absen" />
            <div className="p-6 space-y-6">
                {/* Header - Advanced Animated Gradient */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        style={{ backgroundSize: '200% 200%' }}
                    />

                    {/* Overlay & Glow Orbs */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                    <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left w-full">
                            <motion.div
                                className="relative flex shrink-0 h-24 w-24 sm:h-20 sm:w-20"
                                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                whileHover={{ scale: 1.05, rotate: 5 }}
                            >
                                <img src={courseIcon} alt="Sesi Absen" className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl" />
                            </motion.div>
                            <div className="flex-1 mt-1 sm:mt-0">
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-sm text-blue-100 font-medium"
                                >
                                    Manajemen Kehadiran
                                </motion.p>
                                <motion.h1
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-2xl sm:text-3xl font-bold"
                                >
                                    Sesi Absen
                                </motion.h1>
                            </div>
                        </div>
                        <motion.div
                            className="w-full md:w-auto flex justify-center md:justify-end shrink-0"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                        >
                            <motion.button
                                onClick={() => router.get('/admin/sesi-absen/create')}
                                className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl bg-white/20 px-6 py-3.5 text-sm font-semibold hover:bg-white/30 transition-colors backdrop-blur-xl border border-white/20 shadow-lg"
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <Plus className="h-4 w-4" />
                                Buat Sesi Baru
                            </motion.button>
                        </motion.div>
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="relative mt-4 text-blue-100/80"
                    >
                        Kelola sesi absensi, pantau kehadiran real-time, dan analisis performa
                    </motion.p>
                </motion.div>

                {/* Active Session Banner - Advanced */}
                <AnimatePresence>
                    {activeSessionDetail && (
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                            className="relative overflow-hidden rounded-2xl p-6 shadow-xl"
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"
                                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                style={{ backgroundSize: '200% 200%' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                            <motion.div
                                className="absolute left-6 top-1/2 -translate-y-1/2 h-16 w-16 rounded-full border-2 border-white/20"
                                animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />

                            <div className="relative flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-white shadow-xl"
                                    >
                                        <Play className="h-7 w-7" />
                                    </motion.div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <motion.span
                                                animate={{ opacity: [1, 0.5, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/25 text-white backdrop-blur-sm border border-white/20 shadow-lg"
                                            >
                                                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                                LIVE
                                            </motion.span>
                                            <p className="text-sm text-white/80 font-medium">Sesi Aktif</p>
                                        </div>
                                        <p className="text-lg font-bold text-white mt-1">{activeSessionDetail.course_name}</p>
                                        <p className="text-sm text-white/70">Pertemuan #{activeSessionDetail.meeting_number} • {activeSessionDetail.dosen_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-5">
                                    <motion.div className="text-center px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20" whileHover={{ scale: 1.08 }}>
                                        <p className="text-2xl font-bold text-white">{activeSessionDetail.total_attendance}</p>
                                        <p className="text-xs text-white/70">Kehadiran</p>
                                    </motion.div>
                                    <motion.div className="text-center px-4 py-2 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20" whileHover={{ scale: 1.08 }}>
                                        <p className="text-2xl font-bold text-white">{activeSessionDetail.pending_selfie}</p>
                                        <p className="text-xs text-white/70">Pending Selfie</p>
                                    </motion.div>
                                    <div className="text-center">
                                        <div className="flex items-center gap-1.5">
                                            {countdown.days > 0 && (
                                                <>
                                                    <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20">
                                                        <span className="text-xl font-bold text-white tabular-nums">{countdown.days}</span>
                                                        <span className="text-[10px] text-white/60">hari</span>
                                                    </div>
                                                    <span className="text-lg font-bold text-white/60">:</span>
                                                </>
                                            )}
                                            <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20">
                                                <span className="text-xl font-bold text-white tabular-nums">{String(countdown.hours).padStart(2, '0')}</span>
                                            </div>
                                            <span className="text-lg font-bold text-white/60">:</span>
                                            <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20">
                                                <span className="text-xl font-bold text-white tabular-nums">{String(countdown.minutes).padStart(2, '0')}</span>
                                            </div>
                                            <span className="text-lg font-bold text-white/60">:</span>
                                            <motion.div
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                                className="flex flex-col items-center px-2 py-1 rounded-lg bg-white/15 backdrop-blur-sm border border-white/20"
                                            >
                                                <span className="text-xl font-bold text-white tabular-nums">{String(countdown.seconds).padStart(2, '0')}</span>
                                            </motion.div>
                                        </div>
                                        <p className="text-xs text-white/60 mt-1.5">Sisa Waktu</p>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleDeactivate(activeSessionDetail.id)}
                                        className="flex items-center gap-2 rounded-xl bg-red-500/80 hover:bg-red-500 px-5 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-red-500/30 backdrop-blur-sm border border-red-400/30"
                                    >
                                        <Pause className="h-4 w-4" />
                                        Tutup Sesi
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Grid - Staggered Spring Animations */}
                <motion.div
                    className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
                    }}
                >
                    {[
                        { imageIcon: courseIcon, label: 'Total Sesi', value: stats.total_sessions, sub: 'Semua waktu', color: 'purple' },
                        { imageIcon: sesiIcon, label: 'Sesi Aktif', value: stats.active_sessions, sub: 'Saat ini', color: 'emerald' },
                        { imageIcon: hariIcon, label: 'Hari Ini', value: stats.today_sessions, sub: `${stats.today_attendance} kehadiran`, color: 'orange' },
                        { imageIcon: rataRataIcon, label: 'Rata-rata', value: stats.avg_attendance_per_session, sub: 'Per sesi', color: 'blue' },
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            variants={{
                                hidden: { opacity: 0, y: 30, scale: 0.9 },
                                visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }
                            }}
                            whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                        >
                            <StatCard imageIcon={card.imageIcon} label={card.label} value={card.value} sub={card.sub} color={card.color} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Charts Row — Glassmorphism */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <motion.div
                        className="lg:col-span-2 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <h2 className="font-semibold text-neutral-900 dark:text-white">Tren Mingguan</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyTrend}><CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" /><XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} /><YAxis tick={{ fontSize: 11, fill: '#64748b' }} /><Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', backdropFilter: 'blur(12px)' }} />
                                    <Area type="monotone" dataKey="sessions" name="Sesi" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                                    <Area type="monotone" dataKey="attendance" name="Kehadiran" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                    <motion.div
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <h2 className="font-semibold text-neutral-900 dark:text-white">Kehadiran Hari Ini</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyDistribution}><CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" /><XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#64748b' }} interval={2} /><YAxis tick={{ fontSize: 10, fill: '#64748b' }} /><Tooltip /><Bar dataKey="count" name="Kehadiran" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Today Sessions & Course Performance — Glassmorphism */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <motion.div
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="p-4 border-b border-white/10 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                                    <Timer className="h-5 w-5" />
                                </div>
                                <h2 className="font-semibold text-neutral-900 dark:text-white">Jadwal Hari Ini</h2>
                            </div>
                        </div>
                        <div className="divide-y divide-neutral-200/50 dark:divide-neutral-800/50 max-h-72 overflow-y-auto">
                            {todaySessions.length === 0 ? <div className="p-8 text-center text-neutral-500">Tidak ada sesi hari ini</div> : todaySessions.map((s, idx) => {
                                const cfg = statusConfig[s.status] || statusConfig.scheduled;
                                return (
                                    <motion.div
                                        key={s.id}
                                        className="p-3 flex items-center justify-between hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors backdrop-blur"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.is_active ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'}`}>{s.is_active ? <Play className="h-4 w-4" /> : <Clock className="h-4 w-4" />}</div>
                                            <div><p className="font-medium text-neutral-900 dark:text-white text-sm">{s.course}</p><p className="text-xs text-neutral-500">Pertemuan #{s.meeting} • {s.time}</p></div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                    <motion.div
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="p-4 border-b border-white/10 dark:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 text-white shadow-lg shadow-violet-500/30">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <h2 className="font-semibold text-neutral-900 dark:text-white">Performa Mata Kuliah</h2>
                            </div>
                        </div>
                        <div className="divide-y divide-neutral-200/50 dark:divide-neutral-800/50 max-h-72 overflow-y-auto">
                            {coursePerformance.length === 0 ? <div className="p-8 text-center text-neutral-500">Belum ada data</div> : coursePerformance.map((c, idx) => (
                                <motion.div
                                    key={c.id}
                                    className="p-3 flex items-center justify-between hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors backdrop-blur"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.02, x: -4 }}
                                >
                                    <div><p className="font-medium text-neutral-900 dark:text-white text-sm">{c.name}</p><p className="text-xs text-neutral-500">{c.completed_sessions}/{c.total_sessions} sesi</p></div>
                                    <div className="text-right"><p className="text-sm font-bold text-neutral-900 dark:text-white">{c.avg_attendance}</p><p className="text-xs text-neutral-500">rata-rata</p></div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Filters & Search — Glassmorphism */}
                <div className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/5">
                    <div className="flex flex-wrap items-center gap-4">
                        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari sesi atau mata kuliah..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/20 bg-white/60 text-sm focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-neutral-800/60 dark:text-white backdrop-blur transition-all" />
                            </div>
                        </form>
                        <select value={filters.course_id} onChange={e => handleFilter('course_id', e.target.value)} className="rounded-xl border border-white/20 bg-white/60 px-3 py-2.5 text-sm focus:border-indigo-500 dark:border-white/10 dark:bg-neutral-800/60 dark:text-white backdrop-blur transition-all">
                            <option value="all">Semua Mata Kuliah</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                        </select>
                        <select value={filters.status} onChange={e => handleFilter('status', e.target.value)} className="rounded-xl border border-white/20 bg-white/60 px-3 py-2.5 text-sm focus:border-indigo-500 dark:border-white/10 dark:bg-neutral-800/60 dark:text-white backdrop-blur transition-all">
                            <option value="all">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="scheduled">Terjadwal</option>
                            <option value="ongoing">Berlangsung</option>
                            <option value="completed">Selesai</option>
                        </select>
                        <button onClick={() => router.reload()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100/60 text-neutral-600 hover:bg-neutral-200/60 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:bg-neutral-700/60 text-sm backdrop-blur transition-all"><RefreshCw className="h-4 w-4" />Refresh</button>
                        <button onClick={() => router.get('/admin/sesi-absen/pdf')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100/60 text-neutral-600 hover:bg-neutral-200/60 dark:bg-neutral-800/60 dark:text-neutral-400 dark:hover:bg-neutral-700/60 text-sm backdrop-blur transition-all"><Download className="h-4 w-4" />Export</button>
                    </div>
                </div>

                {/* Sessions Table — Glassmorphism */}
                <motion.div
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="bg-neutral-50/60 dark:bg-neutral-800/60 backdrop-blur">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Mata Kuliah</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Pertemuan</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Waktu</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Kehadiran</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase">Aksi</th>
                            </tr></thead>
                            <tbody className="divide-y divide-neutral-200/50 dark:divide-neutral-800/50">
                                {sessions.data.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-12 text-center"><Calendar className="h-12 w-12 mx-auto text-neutral-300 mb-3" /><p className="text-neutral-500">Belum ada sesi absen</p></td></tr>
                                ) : sessions.data.map((s, idx) => {
                                    const cfg = statusConfig[s.status] || statusConfig.scheduled;
                                    return (
                                        <motion.tr
                                            key={s.id}
                                            className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            whileHover={{ scale: 1.005 }}
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-neutral-900 dark:text-white">{s.course_name}</p>
                                                <p className="text-xs text-neutral-500">{s.dosen_name}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-blue-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/20">#{s.meeting_number}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-neutral-900 dark:text-white">{s.start_at?.split(' ')[0]}</p>
                                                <p className="text-xs text-neutral-500">{s.start_at?.split(' ')[1]} - {s.end_at?.split(' ')[1]}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-neutral-900 dark:text-white">{s.logs_count}</span>
                                                    <div className="flex gap-1">
                                                        {s.present_count > 0 && <span className="px-1.5 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">{s.present_count}</span>}
                                                        {s.late_count > 0 && <span className="px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{s.late_count}</span>}
                                                        {s.rejected_count > 0 && <span className="px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">{s.rejected_count}</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span></td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    {!s.is_active && s.status !== 'completed' && <button onClick={() => handleActivate(s.id)} className="p-1.5 rounded-lg hover:bg-emerald-100/60 text-emerald-600 dark:hover:bg-emerald-900/30 transition-colors" title="Aktifkan"><Play className="h-4 w-4" /></button>}
                                                    {s.is_active && <button onClick={() => handleDeactivate(s.id)} className="p-1.5 rounded-lg hover:bg-red-100/60 text-red-600 dark:hover:bg-red-900/30 transition-colors" title="Nonaktifkan"><Pause className="h-4 w-4" /></button>}
                                                    <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg hover:bg-neutral-100/60 text-neutral-600 dark:hover:bg-neutral-800/60 transition-colors" title="Edit"><Edit className="h-4 w-4" /></button>
                                                    <button onClick={() => handleDuplicate(s.id)} className="p-1.5 rounded-lg hover:bg-neutral-100/60 text-neutral-600 dark:hover:bg-neutral-800/60 transition-colors" title="Duplikat"><Copy className="h-4 w-4" /></button>
                                                    <button onClick={() => openDeleteDialog(s.id)} className="p-1.5 rounded-lg hover:bg-red-100/60 text-red-600 dark:hover:bg-red-900/30 transition-colors" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {sessions.last_page > 1 && (
                        <div className="p-4 border-t border-white/10 dark:border-white/5 flex justify-center gap-2">
                            {sessions.links.map((link, i) => (
                                <button key={i} onClick={() => link.url && router.get(link.url, {}, { preserveState: true })} disabled={!link.url} className={`px-3 py-1.5 rounded-lg text-sm transition-all ${link.active ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : link.url ? 'bg-neutral-100/60 text-neutral-700 hover:bg-neutral-200/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-700/60 backdrop-blur' : 'bg-neutral-50/40 text-neutral-400 cursor-not-allowed'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </motion.div>


                {/* Edit Modal - Ultra Advanced Black Design */}
                <AnimatePresence>
                    {showEditModal && editSession && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowEditModal(false); setEditSession(null); }}
                        >
                            {/* Advanced Backdrop */}
                            <motion.div
                                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />

                            <motion.div
                                className="relative w-full max-w-2xl"
                                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Premium Glass Morphism Container */}
                                <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0A0A0B] border border-white/10 shadow-2xl flex flex-col">

                                    {/* Ultra Advanced Header block */}
                                    <div className="relative overflow-hidden p-8 sm:p-10">
                                        {/* Animated Background Gradient matching create.tsx */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                                            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                            style={{ backgroundSize: '200% 200%' }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black/60" />
                                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl pointer-events-none" />
                                        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl pointer-events-none" />

                                        {/* Floating Animations (Pulses) */}
                                        <motion.div
                                            className="absolute right-10 top-1/2 -translate-y-1/2 h-24 w-24 rounded-full border border-white/20 pointer-events-none"
                                            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                                        />

                                        <div className="relative flex items-start justify-between z-10">
                                            <div className="flex items-center gap-6">
                                                <motion.div
                                                    className="relative shrink-0"
                                                    whileHover={{ scale: 1.05, rotate: -5 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                >
                                                    <img src={EditSesiIcon} alt="Edit Sesi" className="h-20 w-20 object-contain drop-shadow-2xl pointer-events-none" />
                                                </motion.div>
                                                <div>
                                                    <h3 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">Edit Sesi Absen</h3>
                                                    <p className="text-white/80 mt-1.5 font-medium text-base drop-shadow">Perbarui informasi sesi absensi</p>
                                                </div>
                                            </div>
                                            <motion.button
                                                type="button"
                                                onClick={() => { setShowEditModal(false); setEditSession(null); }}
                                                className="flex h-11 w-11 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 transition-colors shadow-lg"
                                                whileHover={{ scale: 1.1, rotate: 90 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <X className="h-5 w-5 text-white" />
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Modal Body / Form */}
                                    <form onSubmit={handleUpdate} className="relative p-8 sm:p-10 space-y-8 bg-black/40 backdrop-blur-2xl">
                                        {/* Mata Kuliah */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="space-y-2"
                                        >
                                            <label className="block text-sm font-bold text-gray-300 tracking-wide uppercase">Mata Kuliah</label>
                                            <div className="relative">
                                                <motion.select
                                                    value={editForm.data.course_id}
                                                    onChange={() => { }} // Locked
                                                    disabled
                                                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white/60 appearance-none cursor-not-allowed shadow-inner"
                                                    required
                                                >
                                                    {courses.map(c => <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.nama}</option>)}
                                                </motion.select>
                                                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                                                    <div className="w-5 h-5 flex items-center justify-center opacity-30">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Pertemuan & Judul */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="space-y-2"
                                            >
                                                <label className="block text-sm font-bold text-gray-300 tracking-wide uppercase">Pertemuan Ke</label>
                                                <motion.input
                                                    type="number"
                                                    min="1"
                                                    max="21"
                                                    value={editForm.data.meeting_number}
                                                    onChange={e => editForm.setData('meeting_number', parseInt(e.target.value))}
                                                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white placeholder-gray-500 focus:bg-white/10 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 transition-all duration-300 shadow-inner"
                                                    required
                                                    whileFocus={{ scale: 1.01 }}
                                                />
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="space-y-2"
                                            >
                                                <label className="block text-sm font-bold text-gray-300 tracking-wide uppercase">Judul Sesi (Opsional)</label>
                                                <motion.input
                                                    type="text"
                                                    value={editForm.data.title || ''}
                                                    onChange={e => editForm.setData('title', e.target.value)}
                                                    placeholder="Contoh: UTS, Kuis 1"
                                                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white placeholder-gray-600 focus:bg-white/10 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 transition-all duration-300 shadow-inner"
                                                    whileFocus={{ scale: 1.01 }}
                                                />
                                            </motion.div>
                                        </div>

                                        {/* Waktu */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="space-y-2"
                                            >
                                                <label className="block text-sm font-bold text-gray-300 tracking-wide uppercase">Waktu Mulai</label>
                                                <motion.input
                                                    type="datetime-local"
                                                    value={editForm.data.start_at}
                                                    onChange={e => editForm.setData('start_at', e.target.value)}
                                                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white focus:bg-white/10 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 transition-all duration-300 shadow-inner [color-scheme:dark]"
                                                    required
                                                    whileFocus={{ scale: 1.01 }}
                                                />
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="space-y-2"
                                            >
                                                <label className="block text-sm font-bold text-gray-300 tracking-wide uppercase">Waktu Selesai</label>
                                                <motion.input
                                                    type="datetime-local"
                                                    value={editForm.data.end_at}
                                                    onChange={e => editForm.setData('end_at', e.target.value)}
                                                    className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 text-white focus:bg-white/10 focus:border-pink-500/50 focus:ring-4 focus:ring-pink-500/20 transition-all duration-300 shadow-inner [color-scheme:dark]"
                                                    required
                                                    whileFocus={{ scale: 1.01 }}
                                                />
                                            </motion.div>
                                        </div>

                                        {/* Action Buttons */}
                                        <motion.div
                                            className="flex justify-end gap-4 pt-6 border-t border-white/10 mt-8"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            <motion.button
                                                type="button"
                                                onClick={() => { setShowEditModal(false); setEditSession(null); }}
                                                className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-base font-bold transition-all"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                Batal
                                            </motion.button>
                                            <motion.button
                                                type="submit"
                                                disabled={editForm.processing}
                                                className="relative px-10 py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-base font-bold disabled:opacity-50 shadow-xl shadow-pink-500/30 transition-all overflow-hidden group"
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                                                    animate={{ x: ['-200%', '200%'] }}
                                                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                                                />
                                                <span className="relative flex items-center gap-2">
                                                    {editForm.processing ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Menyimpan...
                                                        </>
                                                    ) : (
                                                        <>Simpan Perubahan</>
                                                    )}
                                                </span>
                                            </motion.button>
                                        </motion.div>
                                    </form>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })}
                    onConfirm={handleDelete}
                    title="Hapus Sesi Absen"
                    message="Yakin ingin menghapus sesi absen ini? Semua data kehadiran terkait juga akan dihapus."
                    variant="danger"
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                />
            </div >
        </AppLayout >
    );
}

function StatCard({ icon: Icon, imageIcon, label, value, sub, color }: { icon?: any; imageIcon?: string; label: string; value: number | string; sub: string; color: string }) {
    const [isHovered, setIsHovered] = useState(false);

    // Map colors to matching dashboard configurations
    const colorConfigs: Record<string, any> = {
        emerald: { bg: 'bg-emerald-500', hoverShadow: 'group-hover:shadow-emerald-500/10', gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10', iconBg: 'from-emerald-400 to-teal-600 shadow-emerald-500/30' },
        orange: { bg: 'bg-amber-500', hoverShadow: 'group-hover:shadow-amber-500/10', gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10', iconBg: 'from-orange-400 to-orange-600 shadow-orange-500/30' },
        amber: { bg: 'bg-amber-500', hoverShadow: 'group-hover:shadow-amber-500/10', gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10', iconBg: 'from-amber-400 to-orange-600 shadow-amber-500/30' },
        purple: { bg: 'bg-violet-500', hoverShadow: 'group-hover:shadow-violet-500/10', gradientBg: 'from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10', iconBg: 'from-violet-400 to-purple-600 shadow-violet-500/30' },
        blue: { bg: 'bg-sky-500', hoverShadow: 'group-hover:shadow-sky-500/10', gradientBg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10', iconBg: 'from-sky-400 to-indigo-600 shadow-sky-500/30' },
    };
    const c = colorConfigs[color] ?? colorConfigs.blue;

    return (
        <div
            className={`group h-full relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl transition-all ${c.hoverShadow} dark:border-white/5 cursor-pointer`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${c.gradientBg}`} />

            <motion.div
                initial={false}
                animate={{
                    scale: isHovered ? 1.5 : 1,
                    opacity: isHovered ? 0.4 : 0.2,
                }}
                transition={{ duration: 0.5 }}
                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${c.bg} blur-3xl transition-all duration-500`}
            />

            <div className="relative flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-4">
                {imageIcon ? (
                    <motion.div
                        className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <img src={imageIcon} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" alt={label} />
                    </motion.div>
                ) : (
                    <motion.div
                        className={`relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br ${c.iconBg} text-white shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        {Icon && <Icon className="h-4 w-4 sm:h-6 sm:w-6" />}
                    </motion.div>
                )}
                <div>
                    <p className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-neutral-400">{label}</p>
                    <div className="mt-0.5 sm:mt-1">
                        <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                            {value}
                        </span>
                    </div>
                    <p className="text-[8px] sm:text-xs leading-tight text-neutral-400 mt-0.5">{sub}</p>
                </div>
            </div>
        </div>
    );
}
