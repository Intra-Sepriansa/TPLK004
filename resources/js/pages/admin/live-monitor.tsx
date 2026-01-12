import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Radar, RefreshCw, Users, Clock, CheckCircle, XCircle, Timer, Camera, Activity, Play, AlertTriangle, TrendingUp } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Log {
    id: number;
    name: string;
    nim: string;
    time: string;
    status: string;
    distance_m: number | null;
    selfie_status: string | null;
    device_info: string | null;
    course: string;
}

interface TodayStats {
    total_scans: number;
    present: number;
    late: number;
    rejected: number;
}

interface SessionStats {
    total: number;
    present: number;
    late: number;
    rejected: number;
    pending_selfie: number;
}

interface HourlyData {
    hour: string;
    scans: number;
}

interface StatusDist {
    status: string;
    total: number;
}

interface RecentSession {
    id: number;
    course_name: string;
    meeting_number: number;
    is_active: boolean;
    total_attendance: number;
}

interface ActiveSession {
    id: number;
    title: string | null;
    meeting_number: number;
    course: { nama: string } | null;
    start_at: string | null;
    end_at: string | null;
}

interface PageProps {
    activeSession: ActiveSession | null;
    recentLogs: Log[];
    todayStats: TodayStats;
    sessionStats: SessionStats | null;
    hourlyData: HourlyData[];
    statusDistribution: StatusDist[];
    recentSessions: RecentSession[];
}

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#6366f1'];
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    present: { label: 'Hadir', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    late: { label: 'Terlambat', color: 'bg-amber-100 text-amber-700', icon: Clock },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700', icon: XCircle },
};


export default function LiveMonitor({ activeSession, recentLogs: initialLogs, todayStats, sessionStats, hourlyData, statusDistribution, recentSessions }: PageProps) {
    const [logs, setLogs] = useState<Log[]>(initialLogs);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const fetchLogs = useCallback(async () => {
        const query = activeSession?.id ? `?session_id=${activeSession.id}` : '';
        try {
            const res = await fetch(`/admin/live-monitor/logs${query}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs || []);
                setLastUpdate(new Date());
            }
        } catch {}
    }, [activeSession?.id]);

    useEffect(() => {
        const interval = window.setInterval(fetchLogs, 5000);
        return () => window.clearInterval(interval);
    }, [fetchLogs]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchLogs();
        setIsRefreshing(false);
    };

    const pieData = statusDistribution.map(s => ({ name: statusConfig[s.status]?.label || s.status, value: s.total }));

    return (
        <AppLayout>
            <Head title="Live Monitor" />
            <div className="p-6 space-y-6">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"><Radar className="h-6 w-6" /></div>
                                <div><p className="text-sm text-blue-100">Real-time Monitoring</p><h1 className="text-2xl font-bold">Live Monitor</h1></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right text-sm"><p className="text-blue-100">Update terakhir</p><p className="font-medium">{lastUpdate.toLocaleTimeString('id-ID')}</p></div>
                                <button onClick={handleRefresh} disabled={isRefreshing} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
                                    <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>
                        <p className="mt-4 text-blue-100">Pantau scan absensi secara real-time dengan auto-refresh setiap 5 detik</p>
                    </div>
                </div>

                {activeSession && (
                    <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600"><Play className="h-5 w-5" /></div>
                                <div><p className="text-sm text-emerald-600 dark:text-emerald-400">Sesi Aktif</p><p className="font-semibold text-emerald-900 dark:text-emerald-100">{activeSession.course?.nama ?? 'Tanpa Mata Kuliah'} - Pertemuan #{activeSession.meeting_number}</p></div>
                            </div>
                            <div className="text-right text-sm"><p className="text-emerald-600">{activeSession.start_at} - {activeSession.end_at}</p></div>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-4">
                    <StatCard icon={Users} label="Total Scan Hari Ini" value={todayStats.total_scans} color="blue" />
                    <StatCard icon={CheckCircle} label="Hadir" value={todayStats.present} color="emerald" />
                    <StatCard icon={Clock} label="Terlambat" value={todayStats.late} color="amber" />
                    <StatCard icon={XCircle} label="Ditolak" value={todayStats.rejected} color="red" />
                </div>

                {sessionStats && (
                    <div className="grid gap-4 md:grid-cols-5">
                        <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <p className="text-sm text-slate-500">Sesi: Total</p><p className="text-2xl font-bold text-slate-900 dark:text-white">{sessionStats.total}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <p className="text-sm text-slate-500">Sesi: Hadir</p><p className="text-2xl font-bold text-emerald-600">{sessionStats.present}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <p className="text-sm text-slate-500">Sesi: Terlambat</p><p className="text-2xl font-bold text-amber-600">{sessionStats.late}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <p className="text-sm text-slate-500">Sesi: Ditolak</p><p className="text-2xl font-bold text-red-600">{sessionStats.rejected}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                            <p className="text-sm text-slate-500">Selfie Pending</p><p className="text-2xl font-bold text-purple-600">{sessionStats.pending_selfie}</p>
                        </div>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Scan per Jam</h2></div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourlyData}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#94a3b8" /><YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" /><Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '8px' }} /><Bar dataKey="scans" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-2 mb-4"><Activity className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Distribusi Status</h2></div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>{pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2"><Radar className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Aktivitas Terbaru</h2></div>
                            <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-xs text-slate-500">Live</span></div>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-96 overflow-y-auto">
                        {logs.length === 0 ? (
                            <div className="p-12 text-center"><Radar className="h-12 w-12 mx-auto text-slate-300 mb-4" /><p className="text-slate-500">Belum ada scan masuk</p></div>
                        ) : logs.map(log => {
                            const cfg = statusConfig[log.status] || { label: log.status, color: 'bg-slate-100 text-slate-700', icon: AlertTriangle };
                            const Icon = cfg.icon;
                            return (
                                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cfg.color}`}><Icon className="h-5 w-5" /></div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{log.name}</p>
                                            <p className="text-xs text-slate-500">{log.nim} • {log.course}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{log.time}</p>
                                        <div className="flex items-center gap-2 justify-end mt-1">
                                            {log.distance_m !== null && <span className="text-xs text-slate-500">{log.distance_m}m</span>}
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800"><div className="flex items-center gap-2"><Timer className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Sesi Terbaru</h2></div></div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {recentSessions.map(s => (
                            <div key={s.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{s.is_active ? <Play className="h-4 w-4" /> : <Clock className="h-4 w-4" />}</div>
                                    <div><p className="font-medium text-slate-900 dark:text-white">{s.course_name}</p><p className="text-xs text-slate-500">Pertemuan #{s.meeting_number}</p></div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{s.total_attendance}</p>
                                    <p className="text-xs text-slate-500">kehadiran</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
    const colors: Record<string, string> = { blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' };
    return (
        <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
            <div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}><Icon className="h-5 w-5" /></div><div><p className="text-sm text-slate-500">{label}</p><p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p></div></div>
        </div>
    );
}
