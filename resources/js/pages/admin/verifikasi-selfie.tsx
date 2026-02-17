import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ScanFace, CheckCircle, XCircle, Clock, RefreshCw, Eye, AlertTriangle, TrendingUp, Users, Image, Shield, Lock, Calendar, User, FileText, X, Send } from 'lucide-react';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

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
    has_approved_request: boolean;
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
    const [selectedDetail, setSelectedDetail] = useState<SelfieItem | null>(null);

    const [permissionReason, setPermissionReason] = useState('');

    const [showDetailPanel, setShowDetailPanel] = useState(false);

    const handleCloseDetail = () => {
        if (selectedDetail?.has_approved_request) {
            router.patch(`/admin/verifikasi-selfie/${selectedDetail.id}/consume-view`, {}, { preserveScroll: true });
        }
        setShowDetailPanel(false);
        setSelectedDetail(null);
        setPermissionReason('');
    };

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

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 15
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.8, rotateY: -15 },
        visible: {
            opacity: 1,
            scale: 1,
            rotateY: 0,
            transition: {
                type: "spring" as const,
                stiffness: 120,
                damping: 12
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            rotateY: 15,
            transition: { duration: 0.3 }
        }
    };

    return (
        <AppLayout>
            <Head title="Verifikasi Selfie" />
            <motion.div
                className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950 p-6 space-y-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                    variants={itemVariants}
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Pulsating Rings */}
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
                    />

                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <motion.div
                                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <ScanFace className="h-10 w-10 text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">
                                    Verifikasi Selfie
                                </h1>
                                <p className="mt-1 text-indigo-100 max-w-xl text-lg">
                                    Validasi foto selfie mahasiswa untuk kehadiran. Pastikan wajah terlihat jelas dan sesuai dengan data mahasiswa.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => router.visit('/admin/verifikasi-selfie')}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium backdrop-blur-md transition-all shrink-0"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>Refresh Data</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="grid gap-6 grid-cols-2 md:grid-cols-4"
                    variants={containerVariants}
                >
                    <StatCard icon={Image} label="Total Selfie" value={stats.total} color="blue" delay={0.1} />
                    <StatCard icon={Clock} label="Pending" value={stats.pending} color="amber" delay={0.2} />
                    <StatCard icon={CheckCircle} label="Disetujui" value={stats.approved} color="emerald" delay={0.3} />
                    <StatCard icon={XCircle} label="Ditolak" value={stats.rejected} color="red" delay={0.4} />
                </motion.div>

                <motion.div
                    className="grid gap-6 lg:grid-cols-3"
                    variants={containerVariants}
                >
                    <motion.div
                        className="lg:col-span-2 rounded-3xl border border-white/20 bg-white/40 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        variants={itemVariants}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Tren Validasi</h2>
                                <p className="text-xs text-neutral-500">Statistik 7 hari terakhir</p>
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} dx={-10} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255,255,255,0.8)',
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                                    />
                                    <Area type="monotone" dataKey="approved" stackId="1" stroke="#10b981" strokeWidth={2} fill="url(#colorApproved)" />
                                    <Area type="monotone" dataKey="rejected" stackId="1" stroke="#ef4444" strokeWidth={2} fill="url(#colorRejected)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div
                        className="rounded-3xl border border-white/20 bg-white/40 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 overflow-hidden flex flex-col"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="p-6 border-b border-white/10 dark:border-white/5 bg-white/30 dark:bg-black/20">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20">
                                    <Eye className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Verifikasi Terbaru</h2>
                                    <p className="text-xs text-neutral-500">Aktivitas admin terakhir</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px] custom-scrollbar">
                            {recentVerifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                                    <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                                        <Clock className="h-6 w-6 text-neutral-400" />
                                    </div>
                                    <p className="text-sm text-neutral-500 font-medium">Belum ada aktivitas</p>
                                </div>
                            ) : recentVerifications.map(v => (
                                <div key={v.id} className="group p-3 rounded-xl bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-neutral-800/40 border border-transparent hover:border-white/20 transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full shadow-sm ${v.status === 'approved' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50'}`} />
                                        <div>
                                            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 group-hover:text-neutral-900 transition-colors">{v.verified_by_name}</p>
                                            <p className="text-[10px] text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md w-fit mt-1">{v.status === 'approved' ? 'Menyetujui' : 'Menolak'} pengajuan</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-medium text-neutral-400 font-mono tracking-tight">{v.verified_at}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="rounded-3xl border border-white/20 bg-white/40 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 overflow-hidden min-h-[500px]"
                    variants={itemVariants}
                >
                    <div className="p-6 border-b border-white/10 dark:border-white/5 bg-white/30 dark:bg-black/20">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/20">
                                    <ScanFace className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Antrian Selfie</h2>
                                    <p className="text-sm text-neutral-500">Manajemen antrian validasi</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                                    {['all', 'pending', 'approved', 'rejected'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => handleFilter(s)}
                                            className={`
                                                relative px-4 py-2 rounded-lg text-xs font-semibold transition-all
                                                ${filter === s
                                                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5 dark:bg-neutral-700 dark:text-indigo-400'
                                                    : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                                                }
                                            `}
                                        >
                                            {s === 'all' ? 'Semua' : statusConfig[s]?.label || s}
                                        </button>
                                    ))}
                                </div>
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

                    <motion.div
                        className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        variants={containerVariants}
                    >
                        <AnimatePresence mode="popLayout">
                            {selfieQueue.data.length === 0 ? (
                                <motion.div
                                    className="col-span-full p-12 text-center"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <ScanFace className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500">Tidak ada selfie dalam antrian</p>
                                </motion.div>
                            ) : selfieQueue.data.map((item) => {
                                const cfg = statusConfig[item.status] || { label: item.status, color: 'text-slate-700', bg: 'bg-slate-100' };
                                return (
                                    <motion.div
                                        key={item.id}
                                        className="group relative rounded-2xl border border-white/20 bg-white/40 shadow-sm overflow-hidden backdrop-blur-md dark:border-white/5 dark:bg-neutral-900/40"
                                        variants={cardVariants}
                                        layout
                                        whileHover={{
                                            scale: 1.02,
                                            y: -4,
                                            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                                            transition: { duration: 0.2 }
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="relative aspect-square bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                            {item.attendance_log?.selfie_path ? (
                                                <div className="relative w-full h-full">
                                                    <img
                                                        src={`/storage/${item.attendance_log.selfie_path}`}
                                                        alt="Selfie"
                                                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${item.has_approved_request ? '' : 'blur-xl scale-110'}`}
                                                    />

                                                    {/* Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                                    {!item.has_approved_request && (
                                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                                                            <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-2">
                                                                <Lock className="h-5 w-5 text-white" />
                                                            </div>
                                                            <p className="text-xs text-white/90 font-medium">Privasi Terlindungi</p>
                                                        </div>
                                                    )}
                                                    {item.has_approved_request && (
                                                        <div className="absolute bottom-3 left-3">
                                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-md flex items-center gap-1 shadow-lg shadow-emerald-500/20">
                                                                <CheckCircle className="h-3 w-3" />
                                                                Disetujui
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-full"><Image className="h-12 w-12 text-neutral-300 dark:text-neutral-700" /></div>
                                            )}

                                            {/* Top Badges */}
                                            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                                                {item.status === 'pending' ? (
                                                    <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/40 transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}>
                                                        <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => { }} className="h-4 w-4 rounded border-white/50 bg-transparent checked:bg-indigo-500 focus:ring-0 cursor-pointer" />
                                                    </div>
                                                ) : <div />}
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md shadow-lg ${cfg.bg} ${cfg.color} bg-opacity-90`}>{cfg.label}</span>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-bold text-neutral-900 dark:text-white truncate max-w-[120px]" title={item.attendance_log?.mahasiswa?.nama}>
                                                        {item.attendance_log?.mahasiswa?.nama ?? 'Unknown'}
                                                    </h3>
                                                    <p className="text-xs font-mono text-neutral-500">{item.attendance_log?.mahasiswa?.nim ?? '-'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-medium text-neutral-400">{item.created_at}</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setSelectedDetail(item);
                                                    setShowDetailPanel(true);
                                                }}
                                                className="w-full mt-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                Lihat Detail
                                            </button>

                                            {item.status === 'pending' && (
                                                <div className="flex gap-2 mt-2">
                                                    <button onClick={() => handleApprove(item.id)} className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors border border-emerald-500/20">Setujui</button>
                                                    <button onClick={() => handleReject(item.id)} className="flex-1 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold transition-colors border border-red-500/20">Tolak</button>
                                                </div>
                                            )}

                                            {item.status === 'rejected' && item.rejection_reason && (
                                                <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                                                    <p className="text-[10px] text-red-600 dark:text-red-400 line-clamp-2">"{item.rejection_reason}"</p>
                                                </div>
                                            )}
                                            {item.verified_by_name && <p className="text-[10px] text-neutral-400 mt-2 text-center">Diverifikasi oleh {item.verified_by_name}</p>}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>

                    {selfieQueue.last_page > 1 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-2">
                            {selfieQueue.links.map((link, i) => (
                                <button key={i} onClick={() => link.url && router.get(link.url, {}, { preserveState: true })} disabled={!link.url} className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-blue-600 text-white' : link.url ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300' : 'bg-slate-50 text-slate-400 cursor-not-allowed dark:bg-black'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Detail Panel - Centered Modal */}
                <AnimatePresence>
                    {showDetailPanel && selectedDetail && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={handleCloseDetail}
                            />

                            {/* Center Wrapper */}
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                                <motion.div
                                    className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden rounded-3xl border border-white/20 pointer-events-auto flex flex-col"
                                    initial={{ scale: 0.9, y: 30, opacity: 0 }}
                                    animate={{ scale: 1, y: 0, opacity: 1 }}
                                    exit={{ scale: 0.9, y: 30, opacity: 0 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                >
                                    {/* Header */}
                                    <div className="relative z-10 p-6 pb-8 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-5">
                                                <motion.div
                                                    className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white"
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                >
                                                    {selectedDetail.has_approved_request ? <Eye className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
                                                </motion.div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                                        {selectedDetail.has_approved_request ? 'Detail Verifikasi' : 'Akses Terbatas'}
                                                    </h2>
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                                        {selectedDetail.has_approved_request ? 'Informasi lengkap selfie mahasiswa' : 'Diperlukan izin untuk melihat detail'}
                                                    </p>
                                                </div>
                                            </div>
                                            <motion.button
                                                onClick={handleCloseDetail}
                                                className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center justify-center transition-colors text-neutral-500"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <X className="h-5 w-5" />
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Content - Scrollable Body */}
                                    <div className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-black/50 p-6 space-y-6">
                                        {selectedDetail.has_approved_request ? (
                                            /* ═══════ APPROVED: Full Detail View ═══════ */
                                            <>
                                                {/* Full Selfie Image */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                    className="relative rounded-2xl overflow-hidden bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 shadow-sm"
                                                >
                                                    {selectedDetail.attendance_log?.selfie_path ? (
                                                        <motion.img
                                                            src={`/storage/${selectedDetail.attendance_log.selfie_path}`}
                                                            alt="Selfie"
                                                            className="w-full aspect-square object-cover"
                                                            initial={{ scale: 1.1, filter: 'blur(10px)' }}
                                                            animate={{ scale: 1, filter: 'blur(0px)' }}
                                                            transition={{ duration: 0.6, delay: 0.2 }}
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-64 bg-neutral-100 dark:bg-neutral-800">
                                                            <Image className="h-20 w-20 text-neutral-300 dark:text-neutral-600" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-4 right-4">
                                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-xl shadow-lg border ${selectedDetail.status === 'approved' ? 'bg-emerald-500/90 text-white border-emerald-400/50' :
                                                            selectedDetail.status === 'rejected' ? 'bg-red-500/90 text-white border-red-400/50' :
                                                                'bg-amber-500/90 text-white border-amber-400/50'
                                                            }`}>
                                                            {statusConfig[selectedDetail.status]?.label || selectedDetail.status}
                                                        </span>
                                                    </div>
                                                </motion.div>

                                                {/* Student Info Card */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm"
                                                >
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center">
                                                            <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        <h3 className="font-bold text-neutral-900 dark:text-white">Informasi Mahasiswa</h3>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/20 flex-shrink-0">
                                                            {(selectedDetail.attendance_log?.mahasiswa?.nama ?? 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <p className="text-lg font-bold text-neutral-900 dark:text-white">{selectedDetail.attendance_log?.mahasiswa?.nama ?? 'Unknown'}</p>
                                                            <p className="text-sm font-mono text-neutral-500">{selectedDetail.attendance_log?.mahasiswa?.nim ?? '-'}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>

                                                {/* Attendance + Verification Info Grid */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="grid grid-cols-2 gap-3"
                                                >
                                                    <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                                        <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1">Mata Kuliah</p>
                                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{selectedDetail.attendance_log?.course ?? '-'}</p>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                                        <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1">Waktu Scan</p>
                                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{selectedDetail.attendance_log?.scanned_at ?? '-'}</p>
                                                    </div>
                                                    {selectedDetail.attendance_log?.distance_m != null && (
                                                        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                                            <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1">Jarak</p>
                                                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{Number(selectedDetail.attendance_log.distance_m).toFixed(2)}m</p>
                                                        </div>
                                                    )}
                                                    <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                                                        <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1">Dibuat</p>
                                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{selectedDetail.created_at ?? '-'}</p>
                                                    </div>
                                                </motion.div>

                                                {/* Verification Details */}
                                                {(selectedDetail.verified_by_name || selectedDetail.rejection_reason || selectedDetail.note) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.4 }}
                                                        className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="h-5 w-5 text-emerald-500" />
                                                            <h3 className="font-bold text-neutral-900 dark:text-white">Detail Verifikasi</h3>
                                                        </div>
                                                        {selectedDetail.verified_at && <div><p className="text-xs text-neutral-400 mb-0.5">Diverifikasi</p><p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{selectedDetail.verified_at}</p></div>}
                                                        {selectedDetail.verified_by_name && <div><p className="text-xs text-neutral-400 mb-0.5">Oleh</p><p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{selectedDetail.verified_by_name}</p></div>}
                                                        {selectedDetail.rejection_reason && <div><p className="text-xs text-neutral-400 mb-0.5">Alasan Penolakan</p><p className="text-sm font-medium text-red-500">{selectedDetail.rejection_reason}</p></div>}
                                                        {selectedDetail.note && <div><p className="text-xs text-neutral-400 mb-0.5">Catatan</p><p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{selectedDetail.note}</p></div>}
                                                    </motion.div>
                                                )}

                                                {/* Privacy Notice - Removed in unified modal to reduce noise, unless critical */}

                                                {/* Action Buttons */}
                                                {selectedDetail.status === 'pending' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.5 }}
                                                        className="flex gap-3 pt-2"
                                                    >
                                                        <motion.button
                                                            onClick={() => { handleApprove(selectedDetail.id); handleCloseDetail(); }}
                                                            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                                            whileHover={{ scale: 1.02, y: -2 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <CheckCircle className="h-5 w-5" /> Setujui
                                                        </motion.button>
                                                        <motion.button
                                                            onClick={() => { handleReject(selectedDetail.id); handleCloseDetail(); }}
                                                            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                                                            whileHover={{ scale: 1.02, y: -2 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <XCircle className="h-5 w-5" /> Tolak
                                                        </motion.button>
                                                    </motion.div>
                                                )}
                                            </>
                                        ) : (
                                            /* ═══════ LOCKED: Permission Request View ═══════ */
                                            <>
                                                {/* Blurred/Locked Selfie Preview */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                    className="relative rounded-2xl overflow-hidden bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 shadow-sm"
                                                >
                                                    {selectedDetail.attendance_log?.selfie_path ? (
                                                        <div className="relative">
                                                            <img
                                                                src={`/storage/${selectedDetail.attendance_log.selfie_path}`}
                                                                alt="Blurred"
                                                                className="w-full aspect-square object-cover blur-2xl scale-110"
                                                            />
                                                            <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm flex flex-col items-center justify-center">
                                                                <motion.div
                                                                    animate={{ scale: [1, 1.1, 1] }}
                                                                    transition={{ duration: 2, repeat: Infinity }}
                                                                    className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center mb-4 text-white"
                                                                >
                                                                    <Lock className="h-10 w-10" />
                                                                </motion.div>
                                                                <p className="text-white font-bold text-lg">Privasi Terlindungi</p>
                                                                <p className="text-white/80 text-sm mt-1">Ajukan izin untuk melihat detail</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-48 bg-neutral-100 dark:bg-neutral-800">
                                                            <Image className="h-16 w-16 text-neutral-300 dark:text-neutral-600" />
                                                        </div>
                                                    )}
                                                </motion.div>

                                                {/* Student Basic Info */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.15 }}
                                                    className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-lg font-bold text-neutral-700 dark:text-neutral-300">
                                                            {(selectedDetail.attendance_log?.mahasiswa?.nama ?? 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-neutral-900 dark:text-white">{selectedDetail.attendance_log?.mahasiswa?.nama ?? 'Unknown'}</p>
                                                            <p className="text-sm font-mono text-neutral-500">{selectedDetail.attendance_log?.mahasiswa?.nim ?? '-'}</p>
                                                            <p className="text-xs text-neutral-400 mt-0.5">{selectedDetail.attendance_log?.course ?? '-'} • {selectedDetail.created_at}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>

                                                {/* Privacy Shield Notice */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                                            <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-indigo-900 dark:text-indigo-300 text-sm mb-1">Perlindungan Privasi Aktif</p>
                                                            <p className="text-xs text-indigo-700/80 dark:text-indigo-300/60 leading-relaxed">
                                                                Data selfie dilindungi. Untuk melihat detail, kirim permintaan akses ke mahasiswa yang bersangkutan. Permintaan akan masuk ke menu Verifikasi Selfie mahasiswa.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>

                                                {/* Quick Reason Chips */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.25 }}
                                                >
                                                    <label className="block text-sm font-bold text-slate-300 mb-3">
                                                        Pilih Alasan Cepat
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {[
                                                            '🔍 Verifikasi kehadiran untuk administrasi akademik',
                                                            '📋 Investigasi pelanggaran absensi mahasiswa',
                                                            '📊 Audit data kehadiran perkuliahan',
                                                            '🛡️ Pengecekan keamanan dan validitas selfie',
                                                        ].map((reason) => (
                                                            <motion.button
                                                                key={reason}
                                                                type="button"
                                                                onClick={() => setPermissionReason(reason)}
                                                                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${permissionReason === reason
                                                                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-600 shadow-md shadow-indigo-500/10'
                                                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700 hover:border-indigo-300'
                                                                    }`}
                                                                whileHover={{ scale: 1.03 }}
                                                                whileTap={{ scale: 0.97 }}
                                                            >
                                                                {reason}
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </motion.div>

                                                {/* Custom Reason Textarea */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    <label className="block text-sm font-bold text-slate-300 mb-2">
                                                        Alasan Permintaan <span className="text-red-500">*</span>
                                                    </label>
                                                    <textarea
                                                        value={permissionReason}
                                                        onChange={(e) => setPermissionReason(e.target.value)}
                                                        placeholder="Tuliskan alasan atau pilih alasan cepat di atas..."
                                                        className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all text-sm"
                                                        rows={3}
                                                    />
                                                    <div className="flex items-center justify-between mt-2">
                                                        <p className={`text-xs font-medium ${permissionReason.trim().length >= 10 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                            {permissionReason.trim().length >= 10 ? '✓ Alasan valid' : `Minimal 10 karakter (${permissionReason.trim().length}/10)`}
                                                        </p>
                                                    </div>
                                                </motion.div>

                                                {/* Send Request Button */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.35 }}
                                                    className="flex gap-3"
                                                >
                                                    <motion.button
                                                        onClick={handleCloseDetail}
                                                        className="flex-1 py-3.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors text-sm"
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        Batal
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => {
                                                            if (permissionReason.trim() && permissionReason.trim().length >= 10 && selectedDetail) {
                                                                router.post('/selfie-view-requests', {
                                                                    selfie_verification_id: selectedDetail.id,
                                                                    reason: permissionReason.trim()
                                                                }, {
                                                                    preserveScroll: true,
                                                                    onSuccess: () => {
                                                                        handleCloseDetail();
                                                                    },
                                                                    onError: (errors) => {
                                                                        console.error('Error submitting request:', errors);
                                                                    }
                                                                });
                                                            }
                                                        }}
                                                        disabled={!permissionReason.trim() || permissionReason.trim().length < 10}
                                                        className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold hover:shadow-xl hover:shadow-indigo-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 text-sm"
                                                        whileHover={{ scale: 1.02, y: -2 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <Send className="h-4 w-4" />
                                                        Kirim Permintaan Akses
                                                    </motion.button>
                                                </motion.div>

                                                {/* Info: What happens next */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.4 }}
                                                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800/70"
                                                >
                                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Apa yang terjadi selanjutnya?</p>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">1</div>
                                                            <p className="text-xs text-slate-400">Permintaan dikirim ke mahasiswa</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">2</div>
                                                            <p className="text-xs text-slate-400">Mahasiswa menyetujui atau menolak</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">3</div>
                                                            <p className="text-xs text-slate-400">Jika disetujui, detail selfie dapat diakses</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </>
                    )}
                </AnimatePresence>
            </motion.div >
        </AppLayout >
    );
}

function StatCard({ icon: Icon, label, value, color, delay = 0 }: { icon: any; label: string; value: number; color: string; delay?: number }) {
    const gradients: Record<string, { from: string; to: string; shadow: string; bg: string }> = {
        blue: { from: 'from-sky-400', to: 'to-indigo-600', shadow: 'shadow-sky-500/30', bg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10' },
        emerald: { from: 'from-emerald-400', to: 'to-teal-600', shadow: 'shadow-emerald-500/30', bg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10' },
        amber: { from: 'from-amber-400', to: 'to-orange-600', shadow: 'shadow-amber-500/30', bg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10' },
        red: { from: 'from-red-400', to: 'to-rose-600', shadow: 'shadow-red-500/30', bg: 'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10' },
        purple: { from: 'from-purple-400', to: 'to-fuchsia-600', shadow: 'shadow-purple-500/30', bg: 'from-purple-500/5 to-fuchsia-500/5 dark:from-purple-500/10 dark:to-fuchsia-500/10' },
        orange: { from: 'from-orange-400', to: 'to-red-600', shadow: 'shadow-orange-500/30', bg: 'from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10' },
    };
    const g = gradients[color] ?? gradients.blue;

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { delay, duration: 0.5 } }
            }}
            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 cursor-default transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${g.bg}`} />
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${g.from} ${g.to} opacity-10 blur-2xl transition-all duration-500 group-hover:opacity-20 group-hover:scale-150`} />

            <div className="relative flex items-center gap-4">
                <motion.div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${g.from} ${g.to} text-white shadow-lg ${g.shadow}`}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                    <Icon className="h-7 w-7" />
                </motion.div>
                <div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <motion.p
                            className="text-2xl font-bold text-neutral-900 dark:text-white"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, delay: 0.2 + delay }}
                        >
                            {value}
                        </motion.p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
