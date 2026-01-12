import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Calendar, Play, Pause, Plus, Search, Filter, Clock, Users, CheckCircle, XCircle, AlertTriangle, TrendingUp, BarChart3, RefreshCw, Copy, Trash2, Edit, Eye, Download, Zap, Timer, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

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
    const handleDelete = (id: number) => { if (confirm('Hapus sesi ini?')) router.delete(`/admin/sesi-absen/${id}`); };

    return (
        <AppLayout>
            <Head title="Sesi Absen" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"><Calendar className="h-6 w-6" /></div>
                                <div><p className="text-sm text-blue-100">Manajemen Kehadiran</p><h1 className="text-2xl font-bold">Sesi Absen</h1></div>
                            </div>
                            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-medium hover:bg-white/30 transition-colors backdrop-blur">
                                <Plus className="h-4 w-4" />Buat Sesi Baru
                            </button>
                        </div>
                        <p className="mt-4 text-blue-100">Kelola sesi absensi, pantau kehadiran real-time, dan analisis performa</p>
                    </div>
                </div>

                {/* Active Session Banner */}
                {activeSessionDetail && (
                    <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 dark:border-emerald-700 dark:from-emerald-950/30 dark:to-teal-950/30">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50">
                                    <Play className="h-7 w-7" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500 text-white animate-pulse"><span className="h-1.5 w-1.5 rounded-full bg-white" />LIVE</span>
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400">Sesi Aktif</p>
                                    </div>
                                    <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">{activeSessionDetail.course_name}</p>
                                    <p className="text-sm text-emerald-700 dark:text-emerald-300">Pertemuan #{activeSessionDetail.meeting_number} • {activeSessionDetail.dosen_name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-center"><p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{activeSessionDetail.total_attendance}</p><p className="text-xs text-emerald-600">Kehadiran</p></div>
                                <div className="text-center"><p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{activeSessionDetail.pending_selfie}</p><p className="text-xs text-emerald-600">Pending Selfie</p></div>
                                <div className="text-center"><p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{activeSessionDetail.time_remaining}m</p><p className="text-xs text-emerald-600">Sisa Waktu</p></div>
                                <button onClick={() => handleDeactivate(activeSessionDetail.id)} className="flex items-center gap-2 rounded-xl bg-red-100 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors">
                                    <Pause className="h-4 w-4" />Tutup Sesi
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-5">
                    <StatCard icon={Calendar} label="Total Sesi" value={stats.total_sessions} sub="Semua waktu" color="blue" />
                    <StatCard icon={Zap} label="Sesi Aktif" value={stats.active_sessions} sub="Saat ini" color="emerald" />
                    <StatCard icon={Clock} label="Hari Ini" value={stats.today_sessions} sub={`${stats.today_attendance} kehadiran`} color="amber" />
                    <StatCard icon={Users} label="Rata-rata" value={stats.avg_attendance_per_session} sub="Per sesi" color="purple" />
                    <StatCard icon={CheckCircle} label="Completion" value={`${stats.completion_rate}%`} sub="Sesi selesai" color="green" />
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Tren Mingguan</h2></div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={weeklyTrend}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" /><YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" /><Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                    <Area type="monotone" dataKey="sessions" name="Sesi" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                                    <Area type="monotone" dataKey="attendance" name="Kehadiran" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-2 mb-4"><BarChart3 className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Kehadiran Hari Ini</h2></div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyDistribution}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="hour" tick={{ fontSize: 9 }} stroke="#94a3b8" interval={2} /><YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" /><Tooltip /><Bar dataKey="count" name="Kehadiran" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Today Sessions & Course Performance */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800"><div className="flex items-center gap-2"><Timer className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Jadwal Hari Ini</h2></div></div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-72 overflow-y-auto">
                            {todaySessions.length === 0 ? <div className="p-8 text-center text-slate-500">Tidak ada sesi hari ini</div> : todaySessions.map(s => {
                                const cfg = statusConfig[s.status] || statusConfig.scheduled;
                                return (
                                    <div key={s.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{s.is_active ? <Play className="h-4 w-4" /> : <Clock className="h-4 w-4" />}</div>
                                            <div><p className="font-medium text-slate-900 dark:text-white text-sm">{s.course}</p><p className="text-xs text-slate-500">Pertemuan #{s.meeting} • {s.time}</p></div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800"><div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Performa Mata Kuliah</h2></div></div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-72 overflow-y-auto">
                            {coursePerformance.length === 0 ? <div className="p-8 text-center text-slate-500">Belum ada data</div> : coursePerformance.map(c => (
                                <div key={c.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                    <div><p className="font-medium text-slate-900 dark:text-white text-sm">{c.name}</p><p className="text-xs text-slate-500">{c.completed_sessions}/{c.total_sessions} sesi</p></div>
                                    <div className="text-right"><p className="text-sm font-bold text-slate-900 dark:text-white">{c.avg_attendance}</p><p className="text-xs text-slate-500">rata-rata</p></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                    <div className="flex flex-wrap items-center gap-4">
                        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari sesi atau mata kuliah..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
                            </div>
                        </form>
                        <select value={filters.course_id} onChange={e => handleFilter('course_id', e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                            <option value="all">Semua Mata Kuliah</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                        </select>
                        <select value={filters.status} onChange={e => handleFilter('status', e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
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
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
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
                                                    <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-red-600" title="Hapus"><Trash2 className="h-4 w-4" /></button>
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
                </div>

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
            </div>
        </AppLayout>
    );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: number | string; sub: string; color: string }) {
    const colors: Record<string, string> = { blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' };
    return (
        <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
            <div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}><Icon className="h-5 w-5" /></div><div><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p><p className="text-xs text-slate-400">{sub}</p></div></div>
        </div>
    );
}
