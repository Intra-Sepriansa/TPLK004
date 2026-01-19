import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Calendar, Play, Pause, Plus, Search, Filter, Clock, Users, CheckCircle, XCircle, AlertTriangle, TrendingUp, BarChart3, RefreshCw, Copy, Trash2, Edit, Eye, Download, Zap, Timer, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
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
            <div className="min-h-screen bg-slate-50 dark:bg-black p-6 space-y-6">
                {/* Animated Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl"
                >
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -90, 0],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
                    />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"
                                >
                                    <Calendar className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <motion.p
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-blue-100 font-medium"
                                    >
                                        Manajemen Kehadiran
                                    </motion.p>
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold"
                                    >
                                        Sesi Absen
                                    </motion.h1>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 rounded-xl bg-white/20 px-6 py-3 text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur-xl border border-white/30"
                            >
                                <Plus className="h-5 w-5" />
                                Buat Sesi Baru
                            </motion.button>
                        </div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-4 text-blue-100"
                        >
                            Kelola sesi absensi, pantau kehadiran real-time, dan analisis performa
                        </motion.p>
                    </div>
                </motion.div>

                {/* Active Session Banner */}
                <AnimatePresence>
                    {activeSessionDetail && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-6 dark:bg-gradient-to-r dark:from-emerald-500/20 dark:via-teal-500/20 dark:to-cyan-500/20 backdrop-blur-xl"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.1, 1],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                        }}
                                        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    >
                                        <Play className="h-8 w-8" />
                                    </motion.div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <motion.span
                                                animate={{
                                                    opacity: [1, 0.5, 1],
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white"
                                            >
                                                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                                LIVE
                                            </motion.span>
                                            <p className="text-sm text-emerald-400 font-medium">Sesi Aktif</p>
                                        </div>
                                        <p className="text-xl font-bold text-white">{activeSessionDetail.course_name}</p>
                                        <p className="text-sm text-emerald-300">Pertemuan #{activeSessionDetail.meeting_number} • {activeSessionDetail.dosen_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="text-center"
                                    >
                                        <p className="text-3xl font-bold text-white">{activeSessionDetail.total_attendance}</p>
                                        <p className="text-xs text-emerald-300">Kehadiran</p>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="text-center"
                                    >
                                        <p className="text-3xl font-bold text-white">{activeSessionDetail.pending_selfie}</p>
                                        <p className="text-xs text-emerald-300">Pending Selfie</p>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className="text-center"
                                    >
                                        <p className="text-3xl font-bold text-white">{activeSessionDetail.time_remaining}m</p>
                                        <p className="text-xs text-emerald-300">Sisa Waktu</p>
                                    </motion.div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleDeactivate(activeSessionDetail.id)}
                                        className="flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/30 transition-colors border border-red-500/30"
                                    >
                                        <Pause className="h-5 w-5" />
                                        Tutup Sesi
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid gap-4 md:grid-cols-5"
                >
                    <StatCard icon={Calendar} label="Total Sesi" value={stats.total_sessions} sub="Semua waktu" color="blue" />
                    <StatCard icon={Zap} label="Sesi Aktif" value={stats.active_sessions} sub="Saat ini" color="emerald" />
                    <StatCard icon={Clock} label="Hari Ini" value={stats.today_sessions} sub={`${stats.today_attendance} kehadiran`} color="amber" />
                    <StatCard icon={Users} label="Rata-rata" value={stats.avg_attendance_per_session} sub="Per sesi" color="purple" />
                    <StatCard icon={CheckCircle} label="Completion" value={`${stats.completion_rate}%`} sub="Sesi selesai" color="green" />
                </motion.div>

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2 rounded-2xl border border-slate-200/50 bg-white/50 dark:border-slate-800/50 dark:bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Tren Mingguan</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyTrend}>
                                    <defs>
                                        <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#475569" />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} stroke="#475569" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            border: '1px solid rgba(148, 163, 184, 0.2)',
                                            borderRadius: '12px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Area type="monotone" dataKey="sessions" name="Sesi" stroke="#6366f1" fill="url(#colorSessions)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="attendance" name="Kehadiran" stroke="#10b981" fill="url(#colorAttendance)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-2xl border border-slate-200/50 bg-white/50 dark:border-slate-800/50 dark:bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                            <h2 className="font-semibold text-slate-900 dark:text-white">Kehadiran Hari Ini</h2>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                                    <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#94a3b8' }} stroke="#475569" interval={2} />
                                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} stroke="#475569" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            border: '1px solid rgba(148, 163, 184, 0.2)',
                                            borderRadius: '12px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Bar dataKey="count" name="Kehadiran" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Today Sessions & Course Performance */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="rounded-2xl border border-slate-200/50 bg-white/50 dark:border-slate-800/50 dark:bg-slate-900/50 shadow-xl backdrop-blur-xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50">
                            <div className="flex items-center gap-2">
                                <Timer className="h-5 w-5 text-blue-500" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Jadwal Hari Ini</h2>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50 max-h-72 overflow-y-auto">
                            {todaySessions.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 dark:text-slate-400">Tidak ada sesi hari ini</div>
                            ) : todaySessions.map((s, index) => {
                                const cfg = statusConfig[s.status] || statusConfig.scheduled;
                                return (
                                    <motion.div
                                        key={s.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.05 }}
                                        className="p-4 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'}`}
                                            >
                                                {s.is_active ? <Play className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                            </motion.div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white text-sm">{s.course}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Pertemuan #{s.meeting} • {s.time}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} border ${cfg.bg.replace('bg-', 'border-')}`}>
                                            {cfg.label}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="rounded-2xl border border-slate-200/50 bg-white/50 dark:border-slate-800/50 dark:bg-slate-900/50 shadow-xl backdrop-blur-xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-blue-500" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Performa Mata Kuliah</h2>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50 max-h-72 overflow-y-auto">
                            {coursePerformance.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 dark:text-slate-400">Belum ada data</div>
                            ) : coursePerformance.map((c, index) => (
                                <motion.div
                                    key={c.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + index * 0.05 }}
                                    className="p-4 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white text-sm">{c.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{c.completed_sessions}/{c.total_sessions} sesi</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{c.avg_attendance}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">rata-rata</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Filters & Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="rounded-2xl border border-slate-200/50 bg-white/50 dark:border-slate-800/50 dark:bg-slate-900/50 p-4 shadow-xl backdrop-blur-xl"
                >
                    <div className="flex flex-wrap items-center gap-4">
                        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Cari sesi atau mata kuliah..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300/50 bg-white/50 dark:bg-slate-800/50 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/50 dark:text-white transition-all"
                                />
                            </div>
                        </form>
                        <select
                            value={filters.course_id}
                            onChange={e => handleFilter('course_id', e.target.value)}
                            className="rounded-xl border border-slate-300/50 bg-white/50 dark:bg-slate-800/50 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/50 dark:text-white transition-all"
                        >
                            <option value="all">Semua Mata Kuliah</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                        </select>
                        <select
                            value={filters.status}
                            onChange={e => handleFilter('status', e.target.value)}
                            className="rounded-xl border border-slate-300/50 bg-white/50 dark:bg-slate-800/50 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700/50 dark:text-white transition-all"
                        >
                            <option value="all">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="scheduled">Terjadwal</option>
                            <option value="ongoing">Berlangsung</option>
                            <option value="completed">Selesai</option>
                        </select>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.reload()}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-500/20 text-slate-600 dark:text-slate-300 hover:bg-slate-500/30 text-sm font-medium border border-slate-500/30 transition-all"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.get('/admin/sesi-absen/pdf')}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 text-sm font-medium border border-blue-500/30 transition-all"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </motion.button>
                    </div>
                </motion.div>

                {/* Sessions Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="rounded-2xl border border-slate-200/50 bg-white/50 dark:border-slate-800/50 dark:bg-slate-900/50 shadow-xl backdrop-blur-xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="bg-slate-50 dark:bg-slate-900/50">
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
                                ) : sessions.data.map(s => {
                                    const cfg = statusConfig[s.status] || statusConfig.scheduled;
                                    return (
                                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
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
                                        </tr>
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

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Buat Sesi Absen Baru</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mata Kuliah</label>
                                    <select value={createForm.data.course_id} onChange={e => createForm.setData('course_id', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required>
                                        <option value="">Pilih Mata Kuliah</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pertemuan Ke</label>
                                        <input type="number" min="1" max="21" value={createForm.data.meeting_number} onChange={e => createForm.setData('meeting_number', parseInt(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Judul (Opsional)</label>
                                        <input type="text" value={createForm.data.title} onChange={e => createForm.setData('title', e.target.value)} placeholder="Materi pertemuan" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mulai</label>
                                        <input type="datetime-local" value={createForm.data.start_at} onChange={e => createForm.setData('start_at', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selesai</label>
                                        <input type="datetime-local" value={createForm.data.end_at} onChange={e => createForm.setData('end_at', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
                                    </div>
                                </div>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={createForm.data.auto_activate} onChange={e => createForm.setData('auto_activate', e.target.checked)} className="rounded border-slate-300" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Aktifkan langsung setelah dibuat</span>
                                </label>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium">Batal</button>
                                    <button type="submit" disabled={createForm.processing} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 text-sm font-medium disabled:opacity-50">{createForm.processing ? 'Menyimpan...' : 'Buat Sesi'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {showEditModal && editSession && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Edit Sesi Absen</h3>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mata Kuliah</label>
                                    <select value={editForm.data.course_id} onChange={e => editForm.setData('course_id', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pertemuan Ke</label>
                                        <input type="number" min="1" max="21" value={editForm.data.meeting_number} onChange={e => editForm.setData('meeting_number', parseInt(e.target.value))} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Judul</label>
                                        <input type="text" value={editForm.data.title} onChange={e => editForm.setData('title', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mulai</label>
                                        <input type="datetime-local" value={editForm.data.start_at} onChange={e => editForm.setData('start_at', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selesai</label>
                                        <input type="datetime-local" value={editForm.data.end_at} onChange={e => editForm.setData('end_at', e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => { setShowEditModal(false); setEditSession(null); }} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium">Batal</button>
                                    <button type="submit" disabled={editForm.processing} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 text-sm font-medium disabled:opacity-50">{editForm.processing ? 'Menyimpan...' : 'Simpan'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

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
            </div>
        </AppLayout>
    );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: number | string; sub: string; color: string }) {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
        blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
        emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
        amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
        purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
        green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    };

    const cfg = colors[color] || colors.blue;

    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className={`rounded-2xl border ${cfg.border} bg-white/50 dark:bg-slate-900/50 p-6 shadow-xl backdrop-blur-xl`}
        >
            <div className="flex items-start gap-4">
                <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${cfg.bg} ${cfg.text} border ${cfg.border}`}
                >
                    <Icon className="h-6 w-6" />
                </motion.div>
                <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                    <motion.p
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="text-2xl font-bold text-slate-900 dark:text-white mb-1"
                    >
                        {value}
                    </motion.p>
                    <p className="text-xs text-slate-400">{sub}</p>
                </div>
            </div>
        </motion.div>
    );
}
