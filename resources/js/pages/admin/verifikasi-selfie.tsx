import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ScanFace, CheckCircle, XCircle, Clock, Filter, RefreshCw, Eye, AlertTriangle, TrendingUp, Users, Image } from 'lucide-react';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Mahasiswa {
    id: number;
    nama: string;
    nim: string;
}

interface AttendanceLog {
    id: number;
    selfie_path: string | null;
    scanned_at: string | null;
    status: string;
    distance_m: number | null;
    mahasiswa: Mahasiswa | null;
    course: string;
}

interface SelfieItem {
    id: number;
    status: string;
    created_at: string | null;
    verified_at: string | null;
    verified_by_name: string | null;
    rejection_reason: string | null;
    note: string | null;
    attendance_log: AttendanceLog | null;
}

interface Stats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    today_pending: number;
    today_processed: number;
}

interface TrendData {
    date: string;
    pending: number;
    approved: number;
    rejected: number;
}

interface RecentVerification {
    id: number;
    status: string;
    verified_at: string;
    verified_by_name: string;
}

interface PageProps {
    selfieQueue: {
        data: SelfieItem[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    stats: Stats;
    trendData: TrendData[];
    recentVerifications: RecentVerification[];
    currentFilter: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-100' },
    approved: { label: 'Disetujui', color: 'text-emerald-700', bg: 'bg-emerald-100' },
    rejected: { label: 'Ditolak', color: 'text-red-700', bg: 'bg-red-100' },
};


export default function VerifikasiSelfie({ selfieQueue, stats, trendData, recentVerifications, currentFilter }: PageProps) {
    const [filter, setFilter] = useState(currentFilter);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleFilter = (status: string) => {
        setFilter(status);
        router.get('/admin/verifikasi-selfie', { status }, { preserveState: true });
    };

    const handleApprove = (id: number) => router.patch(`/selfie-verifications/${id}/approve`, {}, { preserveScroll: true });
    const handleReject = (id: number) => router.patch(`/selfie-verifications/${id}/reject`, {}, { preserveScroll: true });

    const handleBulkApprove = () => {
        if (selectedIds.length === 0) return;
        router.post('/admin/verifikasi-selfie/bulk-approve', { ids: selectedIds }, { preserveScroll: true, onSuccess: () => setSelectedIds([]) });
    };

    const handleBulkReject = () => {
        if (selectedIds.length === 0) return;
        router.post('/admin/verifikasi-selfie/bulk-reject', { ids: selectedIds }, { preserveScroll: true, onSuccess: () => setSelectedIds([]) });
    };

    const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    const toggleSelectAll = () => {
        const pendingIds = selfieQueue.data.filter(s => s.status === 'pending').map(s => s.id);
        setSelectedIds(selectedIds.length === pendingIds.length ? [] : pendingIds);
    };

    return (
        <AppLayout>
            <Head title="Verifikasi Selfie" />
            <div className="p-6 space-y-6">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-lg">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur"><ScanFace className="h-6 w-6" /></div>
                            <div><p className="text-sm text-blue-100">Validasi Manual</p><h1 className="text-2xl font-bold">Verifikasi Selfie</h1></div>
                        </div>
                        <p className="mt-4 text-blue-100">Review dan validasi selfie mahasiswa yang masuk untuk absensi</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-6">
                    <StatCard icon={Image} label="Total Selfie" value={stats.total} color="blue" />
                    <StatCard icon={Clock} label="Pending" value={stats.pending} color="amber" />
                    <StatCard icon={CheckCircle} label="Disetujui" value={stats.approved} color="emerald" />
                    <StatCard icon={XCircle} label="Ditolak" value={stats.rejected} color="red" />
                    <StatCard icon={AlertTriangle} label="Pending Hari Ini" value={stats.today_pending} color="orange" />
                    <StatCard icon={Users} label="Diproses Hari Ini" value={stats.today_processed} color="purple" />
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
                        <div className="flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Tren 7 Hari Terakhir</h2></div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" /><YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" /><Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                    <Area type="monotone" dataKey="approved" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                                    <Area type="monotone" dataKey="rejected" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                                    <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800"><div className="flex items-center gap-2"><Eye className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Verifikasi Terbaru</h2></div></div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-64 overflow-y-auto">
                            {recentVerifications.length === 0 ? <div className="p-6 text-center text-slate-500">Belum ada verifikasi</div> : recentVerifications.map(v => (
                                <div key={v.id} className="p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${v.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">{v.verified_by_name}</span>
                                    </div>
                                    <span className="text-xs text-slate-500">{v.verified_at}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2"><ScanFace className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Antrian Selfie</h2></div>
                            <div className="flex items-center gap-2">
                                <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    {['all', 'pending', 'approved', 'rejected'].map(s => (
                                        <button key={s} onClick={() => handleFilter(s)} className={`px-3 py-1.5 text-xs font-medium transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400'}`}>
                                            {s === 'all' ? 'Semua' : statusConfig[s]?.label || s}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => router.reload()} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 text-xs font-medium"><RefreshCw className="h-3 w-3" />Refresh</button>
                            </div>
                        </div>
                        {selectedIds.length > 0 && (
                            <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                <span className="text-sm text-blue-700 dark:text-blue-300">{selectedIds.length} dipilih</span>
                                <button onClick={handleBulkApprove} className="px-3 py-1 rounded bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700">Setujui Semua</button>
                                <button onClick={handleBulkReject} className="px-3 py-1 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700">Tolak Semua</button>
                                <button onClick={() => setSelectedIds([])} className="px-3 py-1 rounded bg-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300">Batal</button>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {selfieQueue.data.length === 0 ? (
                            <div className="col-span-full p-12 text-center"><ScanFace className="h-16 w-16 mx-auto text-slate-300 mb-4" /><p className="text-slate-500">Tidak ada selfie dalam antrian</p></div>
                        ) : selfieQueue.data.map(item => {
                            const cfg = statusConfig[item.status] || { label: item.status, color: 'text-slate-700', bg: 'bg-slate-100' };
                            return (
                                <div key={item.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
                                    <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
                                        {item.attendance_log?.selfie_path ? (
                                            <img src={`/storage/${item.attendance_log.selfie_path}`} alt="Selfie" className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewImage(`/storage/${item.attendance_log?.selfie_path}`)} />
                                        ) : (
                                            <div className="flex items-center justify-center h-full"><Image className="h-12 w-12 text-slate-400" /></div>
                                        )}
                                        {item.status === 'pending' && (
                                            <div className="absolute top-2 left-2">
                                                <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} className="h-4 w-4 rounded border-slate-300" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2"><span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span></div>
                                    </div>
                                    <div className="p-3">
                                        <p className="font-medium text-slate-900 dark:text-white truncate">{item.attendance_log?.mahasiswa?.nama ?? 'Unknown'}</p>
                                        <p className="text-xs text-slate-500">{item.attendance_log?.mahasiswa?.nim ?? '-'}</p>
                                        <p className="text-xs text-slate-400 mt-1">{item.created_at}</p>
                                        {item.status === 'pending' && (
                                            <div className="flex gap-2 mt-3">
                                                <button onClick={() => handleApprove(item.id)} className="flex-1 py-1.5 rounded bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700">Setujui</button>
                                                <button onClick={() => handleReject(item.id)} className="flex-1 py-1.5 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700">Tolak</button>
                                            </div>
                                        )}
                                        {item.status === 'rejected' && item.rejection_reason && <p className="text-xs text-red-600 mt-2">Alasan: {item.rejection_reason}</p>}
                                        {item.verified_by_name && <p className="text-xs text-slate-400 mt-1">Oleh: {item.verified_by_name}</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {selfieQueue.last_page > 1 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-2">
                            {selfieQueue.links.map((link, i) => (
                                <button key={i} onClick={() => link.url && router.get(link.url, {}, { preserveState: true })} disabled={!link.url} className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-blue-600 text-white' : link.url ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300' : 'bg-slate-50 text-slate-400 cursor-not-allowed dark:bg-slate-900'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </div>

                {previewImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setPreviewImage(null)}>
                        <img src={previewImage} alt="Preview" className="max-w-[90vw] max-h-[90vh] rounded-lg" />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
    const colors: Record<string, string> = { blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' };
    return (
        <div className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70">
            <div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}><Icon className="h-5 w-5" /></div><div><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p></div></div>
        </div>
    );
}
