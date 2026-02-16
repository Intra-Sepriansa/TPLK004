import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Calendar, Play, Pause, Plus, Search, Clock, Users, CheckCircle, TrendingUp, BarChart3, RefreshCw, Copy, Trash2, Edit, Download, Zap, Timer, BookOpen, Sparkles, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [showCreateModal, setShowCreateModal] = useState(false);
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

    const createForm = useForm({
        course_id: '',
        meeting_number: 1,
        title: '',
        start_at: '',
        end_at: '',
        auto_activate: false,
    });

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

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/sesi-absen', { onSuccess: () => { setShowCreateModal(false); createForm.reset(); } });
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

                    {/* Pulsating Rings */}
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="absolute right-12 top-1/2 -translate-y-1/2 h-24 w-24 rounded-full border-2 border-white/10"
                            animate={{ scale: [1, 3], opacity: [0.3, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: i * 1 }}
                        />
                    ))}

                    <div className="relative flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-5">
                            <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl"
                            >
                                <Calendar className="h-8 w-8" />
                            </motion.div>
                            <div>
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
                                    className="text-2xl font-bold"
                                >
                                    Sesi Absen
                                </motion.h1>
                            </div>
                        </div>
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-3 text-sm font-semibold hover:bg-white/30 transition-colors backdrop-blur-xl border border-white/20 shadow-lg"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Plus className="h-4 w-4" />
                            Buat Sesi Baru
                        </motion.button>
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
                    className="grid gap-4 md:grid-cols-5"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
                    }}
                >
                    {[
                        { icon: Calendar, label: 'Total Sesi', value: stats.total_sessions, sub: 'Semua waktu', color: 'blue' },
                        { icon: Zap, label: 'Sesi Aktif', value: stats.active_sessions, sub: 'Saat ini', color: 'emerald' },
                        { icon: Clock, label: 'Hari Ini', value: stats.today_sessions, sub: `${stats.today_attendance} kehadiran`, color: 'amber' },
                        { icon: Users, label: 'Rata-rata', value: stats.avg_attendance_per_session, sub: 'Per sesi', color: 'purple' },
                        { icon: CheckCircle, label: 'Completion', value: `${stats.completion_rate}%`, sub: 'Sesi selesai', color: 'green' },
                    ].map((card, i) => (
                        <motion.div
                            key={i}
                            variants={{
                                hidden: { opacity: 0, y: 30, scale: 0.9 },
                                visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }
                            }}
                            whileHover={{ scale: 1.06, y: -6, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                        >
                            <StatCard icon={card.icon} label={card.label} value={card.value} sub={card.sub} color={card.color} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <motion.div
                        className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Tren Mingguan</h2></div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyTrend}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" /><YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" /><Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                    <Area type="monotone" dataKey="sessions" name="Sesi" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                                    <Area type="monotone" dataKey="attendance" name="Kehadiran" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                    <motion.div
                        className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center gap-2 mb-4"><BarChart3 className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Kehadiran Hari Ini</h2></div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyDistribution}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="hour" tick={{ fontSize: 9 }} stroke="#94a3b8" interval={2} /><YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" /><Tooltip /><Bar dataKey="count" name="Kehadiran" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Today Sessions & Course Performance */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <motion.div
                        className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800"><div className="flex items-center gap-2"><Timer className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Jadwal Hari Ini</h2></div></div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-72 overflow-y-auto">
                            {todaySessions.length === 0 ? <div className="p-8 text-center text-slate-500">Tidak ada sesi hari ini</div> : todaySessions.map((s, idx) => {
                                const cfg = statusConfig[s.status] || statusConfig.scheduled;
                                return (
                                    <motion.div
                                        key={s.id}
                                        className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-black/30"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{s.is_active ? <Play className="h-4 w-4" /> : <Clock className="h-4 w-4" />}</div>
                                            <div><p className="font-medium text-slate-900 dark:text-white text-sm">{s.course}</p><p className="text-xs text-slate-500">Pertemuan #{s.meeting} • {s.time}</p></div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                    <motion.div
                        className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800"><div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Performa Mata Kuliah</h2></div></div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-72 overflow-y-auto">
                            {coursePerformance.length === 0 ? <div className="p-8 text-center text-slate-500">Belum ada data</div> : coursePerformance.map((c, idx) => (
                                <motion.div
                                    key={c.id}
                                    className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-black/30"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.02, x: -4 }}
                                >
                                    <div><p className="font-medium text-slate-900 dark:text-white text-sm">{c.name}</p><p className="text-xs text-slate-500">{c.completed_sessions}/{c.total_sessions} sesi</p></div>
                                    <div className="text-right"><p className="text-sm font-bold text-slate-900 dark:text-white">{c.avg_attendance}</p><p className="text-xs text-slate-500">rata-rata</p></div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Filters & Search */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex flex-wrap items-center gap-4">
                        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari sesi atau mata kuliah..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-black dark:text-white" />
                            </div>
                        </form>
                        <select value={filters.course_id} onChange={e => handleFilter('course_id', e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 dark:border-slate-700 dark:bg-black dark:text-white">
                            <option value="all">Semua Mata Kuliah</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                        </select>
                        <select value={filters.status} onChange={e => handleFilter('status', e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 dark:border-slate-700 dark:bg-black dark:text-white">
                            <option value="all">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="scheduled">Terjadwal</option>
                            <option value="ongoing">Berlangsung</option>
                            <option value="completed">Selesai</option>
                        </select>
                        <button onClick={() => router.reload()} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 text-sm"><RefreshCw className="h-4 w-4" />Refresh</button>
                        <button onClick={() => router.get('/admin/sesi-absen/pdf')} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 text-sm"><Download className="h-4 w-4" />Export</button>
                    </div>
                </div>

                {/* Sessions Table */}
                <motion.div
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="bg-slate-50 dark:bg-black/50">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Mata Kuliah</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Pertemuan</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Waktu</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Kehadiran</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Aksi</th>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {sessions.data.length === 0 ? (
                                    <tr><td colSpan={6} className="px-4 py-12 text-center"><Calendar className="h-12 w-12 mx-auto text-slate-300 mb-3" /><p className="text-slate-500">Belum ada sesi absen</p></td></tr>
                                ) : sessions.data.map((s, idx) => {
                                    const cfg = statusConfig[s.status] || statusConfig.scheduled;
                                    return (
                                        <motion.tr
                                            key={s.id}
                                            className="hover:bg-slate-50 dark:hover:bg-black/30 transition-colors"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            whileHover={{ scale: 1.005 }}
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-900 dark:text-white">{s.course_name}</p>
                                                <p className="text-xs text-slate-500">{s.dosen_name}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm">#{s.meeting_number}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-slate-900 dark:text-white">{s.start_at?.split(' ')[0]}</p>
                                                <p className="text-xs text-slate-500">{s.start_at?.split(' ')[1]} - {s.end_at?.split(' ')[1]}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{s.logs_count}</span>
                                                    <div className="flex gap-1">
                                                        {s.present_count > 0 && <span className="px-1.5 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700">{s.present_count}</span>}
                                                        {s.late_count > 0 && <span className="px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-700">{s.late_count}</span>}
                                                        {s.rejected_count > 0 && <span className="px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-700">{s.rejected_count}</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span></td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    {!s.is_active && s.status !== 'completed' && <button onClick={() => handleActivate(s.id)} className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600" title="Aktifkan"><Play className="h-4 w-4" /></button>}
                                                    {s.is_active && <button onClick={() => handleDeactivate(s.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-600" title="Nonaktifkan"><Pause className="h-4 w-4" /></button>}
                                                    <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Edit"><Edit className="h-4 w-4" /></button>
                                                    <button onClick={() => handleDuplicate(s.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600" title="Duplikat"><Copy className="h-4 w-4" /></button>
                                                    <button onClick={() => openDeleteDialog(s.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-600" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {sessions.last_page > 1 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-2">
                            {sessions.links.map((link, i) => (
                                <button key={i} onClick={() => link.url && router.get(link.url, {}, { preserveState: true })} disabled={!link.url} className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-blue-600 text-white' : link.url ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300' : 'bg-slate-50 text-slate-400 cursor-not-allowed'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Create Modal - Ultra Advanced Black Design */}
                <AnimatePresence>
                    {showCreateModal && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
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
                                {/* Glass Morphism Container */}
                                <div className="relative overflow-hidden rounded-3xl bg-black/90 backdrop-blur-2xl border border-white/10 shadow-2xl">
                                    {/* Animated Background Gradient */}
                                    <motion.div
                                        className="absolute inset-0 opacity-30"
                                        animate={{
                                            background: [
                                                'radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
                                                'radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
                                                'radial-gradient(circle at 0% 100%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
                                                'radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
                                                'radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
                                            ]
                                        }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    />

                                    {/* Modal Header */}
                                    <div className="relative border-b border-white/10 p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <motion.div
                                                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/50"
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                >
                                                    <Plus className="h-7 w-7 text-white" />
                                                </motion.div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white">Buat Sesi Absen Baru</h3>
                                                    <p className="text-sm text-gray-400 mt-1">Isi form di bawah untuk membuat sesi baru</p>
                                                </div>
                                            </div>
                                            <motion.button
                                                onClick={() => setShowCreateModal(false)}
                                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                                                whileHover={{ scale: 1.1, rotate: 90 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <X className="h-5 w-5 text-gray-400" />
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Modal Body */}
                                    <form onSubmit={handleCreate} className="relative p-6 space-y-6">
                                        {/* Mata Kuliah */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <label className="block text-sm font-semibold text-gray-300 mb-2">Mata Kuliah</label>
                                            <motion.select
                                                value={createForm.data.course_id}
                                                onChange={e => createForm.setData('course_id', e.target.value)}
                                                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-white placeholder-gray-500 focus:bg-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                                                required
                                                whileFocus={{ scale: 1.01 }}
                                            >
                                                <option value="" className="bg-black">Pilih Mata Kuliah</option>
                                                {courses.map(c => <option key={c.id} value={c.id} className="bg-black">{c.nama}</option>)}
                                            </motion.select>
                                        </motion.div>

                                        {/* Pertemuan & Judul */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">Pertemuan Ke</label>
                                                <motion.input
                                                    type="number"
                                                    min="1"
                                                    max="21"
                                                    value={createForm.data.meeting_number}
                                                    onChange={e => createForm.setData('meeting_number', parseInt(e.target.value))}
                                                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-white placeholder-gray-500 focus:bg-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                                                    required
                                                    whileFocus={{ scale: 1.01 }}
                                                />
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">Judul (Opsional)</label>
                                                <motion.input
                                                    type="text"
                                                    value={createForm.data.title}
                                                    onChange={e => createForm.setData('title', e.target.value)}
                                                    placeholder="Materi pertemuan"
                                                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-white placeholder-gray-500 focus:bg-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                                                    whileFocus={{ scale: 1.01 }}
                                                />
                                            </motion.div>
                                        </div>

                                        {/* Waktu */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">Mulai</label>
                                                <motion.input
                                                    type="datetime-local"
                                                    value={createForm.data.start_at}
                                                    onChange={e => createForm.setData('start_at', e.target.value)}
                                                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-white placeholder-gray-500 focus:bg-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 [color-scheme:dark]"
                                                    required
                                                    whileFocus={{ scale: 1.01 }}
                                                />
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">Selesai</label>
                                                <motion.input
                                                    type="datetime-local"
                                                    value={createForm.data.end_at}
                                                    onChange={e => createForm.setData('end_at', e.target.value)}
                                                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-white placeholder-gray-500 focus:bg-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 [color-scheme:dark]"
                                                    required
                                                    whileFocus={{ scale: 1.01 }}
                                                />
                                            </motion.div>
                                        </div>

                                        {/* Auto Activate */}
                                        <motion.div
                                            className="rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 border border-indigo-500/20"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            whileHover={{ scale: 1.01 }}
                                        >
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <motion.input
                                                    type="checkbox"
                                                    checked={createForm.data.auto_activate}
                                                    onChange={e => createForm.setData('auto_activate', e.target.checked)}
                                                    className="h-5 w-5 rounded border-indigo-500/50 bg-white/5 text-indigo-600 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                                    whileTap={{ scale: 0.9 }}
                                                />
                                                <div>
                                                    <span className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">Aktifkan langsung setelah dibuat</span>
                                                    <p className="text-xs text-gray-400">Sesi akan langsung aktif dan mahasiswa bisa absen</p>
                                                </div>
                                            </label>
                                        </motion.div>

                                        {/* Action Buttons */}
                                        <motion.div
                                            className="flex justify-end gap-3 pt-4 border-t border-white/10"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <motion.button
                                                type="button"
                                                onClick={() => setShowCreateModal(false)}
                                                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-semibold transition-all"
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Batal
                                            </motion.button>
                                            <motion.button
                                                type="submit"
                                                disabled={createForm.processing}
                                                className="relative px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold disabled:opacity-50 shadow-lg shadow-indigo-500/50 transition-all overflow-hidden group"
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                                                    animate={{ x: ['-100%', '100%'] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                />
                                                <span className="relative">{createForm.processing ? 'Menyimpan...' : 'Buat Sesi'}</span>
                                            </motion.button>
                                        </motion.div>
                                    </form>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

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
                                {/* Glass Morphism Container */}
                                <div className="relative overflow-hidden rounded-3xl bg-black/90 backdrop-blur-2xl border border-white/10 shadow-2xl">
                                    {/* Animated Background Gradient */}
                                    <motion.div
                                        className="absolute inset-0 opacity-30"
                                        animate={{
                                            background: [
                                                'radial-gradient(circle at 0% 0%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
                                                'radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
                                                'radial-gradient(circle at 0% 100%, rgba(168, 85, 247, 0.3) 0%, transparent 50%)',
                                                'radial-gradient(circle at 100% 0%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
                                                'radial-gradient(circle at 0% 0%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
                                            ]
                                        }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    />

                                    {/* Modal Header */}
                                    <div className="relative border-b border-white/10 p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <motion.div
                                                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-pink-500/50"
                                                    whileHover={{ scale: 1.1, rotate: -5 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                >
                                                    <Edit className="h-7 w-7 text-white" />
                                                </motion.div>
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white">Edit Sesi Absen</h3>
                                                    <p className="text-sm text-gray-400 mt-1">Perbarui informasi sesi absensi</p>
                                                </div>
                                            </div>
                                            <motion.button
                                                onClick={() => { setShowEditModal(false); setEditSession(null); }}
                                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                                                whileHover={{ scale: 1.1, rotate: 90 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <X className="h-5 w-5 text-gray-400" />
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Modal Body */}
                                    <form onSubmit={handleUpdate} className="relative p-6 space-y-6">
                                        {/* Mata Kuliah */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <label className="block text-sm font-semibold text-gray-300 mb-2">Mata Kuliah</label>
                                            <motion.select
                                                value={editForm.data.course_id}
                                                onChange={e => editForm.setData('course_id', e.target.value)}
                                                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-white placeholder-gray-500 focus:bg-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
                                                required
                                                whileFocus={{ scale: 1.01 }}
                                            >
                                                {courses.map(c => <option key={c.id} value={c.id} className="bg-black">{c.nama}</option>)}
                                            </motion.select>
                                        </motion.div>

                                        {/* Pertemuan & Judul */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">Pertemuan Ke</label>
                                                <motion.input
                                                    type="number"
                                                    min="1"
                                                    max="21"
                                                    value={editForm.data.meeting_number}
                                                    onChange={e => editForm.setData('meeting_number', parseInt(e.target.value))}
                                                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-white placeholder-gray-500 focus:bg-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
                                                    required
                                                    whileFocus={{ scale: 1.01 }}
                                                />
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">Judul</label>
                                                <motion.input
                                                    type="text"
                                                    value={editForm.data.title}
                                                    onChange={e => editForm.setData('title', e.target.value)}
                                                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-white placeholder-gray-500 focus:bg-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
                                                    whileFocus={{ scale: 1.01 }}
                                                />
                                            </motion.div>
                                        </div>

                                        {/* Waktu */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">Mulai</label>
                                                <motion.input
                                                    type="datetime-local"
                                                    value={editForm.data.start_at}
                                                    onChange={e => editForm.setData('start_at', e.target.value)}
                                                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-white placeholder-gray-500 focus:bg-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 [color-scheme:dark]"
                                                    required
                                                    whileFocus={{ scale: 1.01 }}
                                                />
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <label className="block text-sm font-semibold text-gray-300 mb-2">Selesai</label>
                                                <motion.input
                                                    type="datetime-local"
                                                    value={editForm.data.end_at}
                                                    onChange={e => editForm.setData('end_at', e.target.value)}
                                                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-white placeholder-gray-500 focus:bg-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300 [color-scheme:dark]"
                                                    required
                                                    whileFocus={{ scale: 1.01 }}
                                                />
                                            </motion.div>
                                        </div>

                                        {/* Action Buttons */}
                                        <motion.div
                                            className="flex justify-end gap-3 pt-4 border-t border-white/10"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            <motion.button
                                                type="button"
                                                onClick={() => { setShowEditModal(false); setEditSession(null); }}
                                                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-sm font-semibold transition-all"
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Batal
                                            </motion.button>
                                            <motion.button
                                                type="submit"
                                                disabled={editForm.processing}
                                                className="relative px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-sm font-semibold disabled:opacity-50 shadow-lg shadow-pink-500/50 transition-all overflow-hidden group"
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                                                    animate={{ x: ['-100%', '100%'] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                />
                                                <span className="relative">{editForm.processing ? 'Menyimpan...' : 'Simpan'}</span>
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

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: number | string; sub: string; color: string }) {
    const colors: Record<string, string> = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
    };
    return (
        <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 transition-all duration-300">
            <div className="flex items-center gap-3">
                <motion.div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}
                    whileHover={{ scale: 1.2, y: -2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                    <Icon className="h-5 w-5" />
                </motion.div>
                <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
                    <p className="text-xs text-slate-400">{sub}</p>
                </div>
            </div>
        </div>
    );
}
