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
                className="p-6 space-y-6"
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

                    <div className="relative">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30">
                                <ScanFace className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-100 font-medium">Validasi Manual</p>
                                <h1 className="text-3xl font-bold">Verifikasi Selfie</h1>
                            </div>
                        </div>
                        <p className="mt-4 text-indigo-100">Review dan validasi selfie mahasiswa yang masuk untuk absensi</p>
                    </div>
                </motion.div>

                <motion.div
                    className="grid gap-4 md:grid-cols-6"
                    variants={containerVariants}
                >
                    <StatCard icon={Image} label="Total Selfie" value={stats.total} color="blue" />
                    <StatCard icon={Clock} label="Pending" value={stats.pending} color="amber" />
                    <StatCard icon={CheckCircle} label="Disetujui" value={stats.approved} color="emerald" />
                    <StatCard icon={XCircle} label="Ditolak" value={stats.rejected} color="red" />
                    <StatCard icon={AlertTriangle} label="Pending Hari Ini" value={stats.today_pending} color="orange" />
                    <StatCard icon={Users} label="Diproses Hari Ini" value={stats.today_processed} color="purple" />
                </motion.div>

                <motion.div
                    className="grid gap-6 lg:grid-cols-3"
                    variants={containerVariants}
                >
                    <motion.div
                        className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                        variants={itemVariants}
                        whileHover={{ scale: 1.01 }}
                    >
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
                    </motion.div>
                    <motion.div
                        className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                    >
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
                    </motion.div>
                </motion.div>

                <motion.div
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                    variants={itemVariants}
                >
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2"><ScanFace className="h-5 w-5 text-blue-600" /><h2 className="font-semibold text-slate-900 dark:text-white">Antrian Selfie</h2></div>
                            <div className="flex items-center gap-2">
                                <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    {['all', 'pending', 'approved', 'rejected'].map(s => (
                                        <button key={s} onClick={() => handleFilter(s)} className={`px-3 py-1.5 text-xs font-medium transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-black dark:text-slate-400'}`}>
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
                                        className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-black"
                                        variants={cardVariants}
                                        layout
                                        whileHover={{
                                            scale: 1.05,
                                            y: -8,
                                            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                                            transition: { duration: 0.2 }
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="relative aspect-square bg-slate-100 dark:bg-slate-800">
                                            {item.attendance_log?.selfie_path ? (
                                                <div className="relative w-full h-full">
                                                    <img
                                                        src={`/storage/${item.attendance_log.selfie_path}`}
                                                        alt="Selfie"
                                                        className={`w-full h-full object-cover ${item.has_approved_request ? '' : 'blur-xl'}`}
                                                    />
                                                    {!item.has_approved_request && (
                                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                                            <div className="text-center">
                                                                <Lock className="h-8 w-8 text-white mx-auto mb-2" />
                                                                <p className="text-xs text-white font-medium">Privasi Terlindungi</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {item.has_approved_request && (
                                                        <div className="absolute bottom-2 left-2">
                                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/90 text-white backdrop-blur-sm flex items-center gap-1">
                                                                <CheckCircle className="h-3 w-3" />
                                                                Disetujui
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
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
                                            <button
                                                onClick={() => {
                                                    setSelectedDetail(item);
                                                    setShowDetailPanel(true);
                                                }}
                                                className="w-full mt-2 py-1.5 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 flex items-center justify-center gap-1"
                                            >
                                                <Eye className="h-3 w-3" />
                                                Lihat Detail
                                            </button>
                                            {item.status === 'pending' && (
                                                <div className="flex gap-2 mt-2">
                                                    <button onClick={() => handleApprove(item.id)} className="flex-1 py-1.5 rounded bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700">Setujui</button>
                                                    <button onClick={() => handleReject(item.id)} className="flex-1 py-1.5 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700">Tolak</button>
                                                </div>
                                            )}
                                            {item.status === 'rejected' && item.rejection_reason && <p className="text-xs text-red-600 mt-2">Alasan: {item.rejection_reason}</p>}
                                            {item.verified_by_name && <p className="text-xs text-slate-400 mt-1">Oleh: {item.verified_by_name}</p>}
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
                                    className="w-full max-w-2xl max-h-[90vh] bg-black shadow-2xl overflow-y-auto rounded-2xl border border-slate-700/50 pointer-events-auto"
                                    initial={{ scale: 0.9, y: 30, opacity: 0 }}
                                    animate={{ scale: 1, y: 0, opacity: 1 }}
                                    exit={{ scale: 0.9, y: 30, opacity: 0 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                >
                                    {/* Header */}
                                    <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 text-white rounded-t-2xl">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                        <div className="relative flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center"
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                >
                                                    {selectedDetail.has_approved_request ? <Eye className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                                                </motion.div>
                                                <div>
                                                    <h2 className="text-xl font-bold">
                                                        {selectedDetail.has_approved_request ? 'Detail Verifikasi' : 'Akses Terbatas'}
                                                    </h2>
                                                    <p className="text-sm text-indigo-100">
                                                        {selectedDetail.has_approved_request ? 'Informasi lengkap selfie mahasiswa' : 'Diperlukan izin untuk melihat detail'}
                                                    </p>
                                                </div>
                                            </div>
                                            <motion.button
                                                onClick={handleCloseDetail}
                                                className="h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <X className="h-5 w-5" />
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-6">
                                        {selectedDetail.has_approved_request ? (
                                            /* ═══════ APPROVED: Full Detail View ═══════ */
                                            <>
                                                {/* Full Selfie Image */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                    className="relative rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 group"
                                                >
                                                    {selectedDetail.attendance_log?.selfie_path ? (
                                                        <motion.img
                                                            src={`/storage/${selectedDetail.attendance_log.selfie_path}`}
                                                            alt="Selfie"
                                                            className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
                                                            initial={{ scale: 1.1, filter: 'blur(10px)' }}
                                                            animate={{ scale: 1, filter: 'blur(0px)' }}
                                                            transition={{ duration: 0.6, delay: 0.2 }}
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-64">
                                                            <Image className="h-20 w-20 text-slate-400" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-4 right-4">
                                                        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-xl border ${selectedDetail.status === 'approved' ? 'bg-emerald-500/90 text-white border-emerald-600' :
                                                            selectedDetail.status === 'rejected' ? 'bg-red-500/90 text-white border-red-600' :
                                                                'bg-amber-500/90 text-white border-amber-600'
                                                            }`}>
                                                            {statusConfig[selectedDetail.status]?.label || selectedDetail.status}
                                                        </span>
                                                    </div>
                                                    <div className="absolute bottom-3 left-3">
                                                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-sm flex items-center gap-1.5">
                                                            <CheckCircle className="h-3 w-3" /> Akses Disetujui
                                                        </span>
                                                    </div>
                                                </motion.div>

                                                {/* Student Info Card */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-800/70"
                                                >
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                                            <User className="h-4 w-4 text-white" />
                                                        </div>
                                                        <h3 className="font-bold text-white">Informasi Mahasiswa</h3>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-800/50 to-blue-800/50 flex items-center justify-center text-xl font-bold text-indigo-300 flex-shrink-0">
                                                            {(selectedDetail.attendance_log?.mahasiswa?.nama ?? 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <p className="text-lg font-bold text-white">{selectedDetail.attendance_log?.mahasiswa?.nama ?? 'Unknown'}</p>
                                                            <p className="text-sm font-mono text-slate-400">{selectedDetail.attendance_log?.mahasiswa?.nim ?? '-'}</p>
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
                                                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-800/70">
                                                        <p className="text-[10px] uppercase tracking-wider text-purple-400 font-bold mb-1">Mata Kuliah</p>
                                                        <p className="text-sm font-semibold text-white">{selectedDetail.attendance_log?.course ?? '-'}</p>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-800/70">
                                                        <p className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-1">Waktu Scan</p>
                                                        <p className="text-sm font-semibold text-white">{selectedDetail.attendance_log?.scanned_at ?? '-'}</p>
                                                    </div>
                                                    {selectedDetail.attendance_log?.distance_m != null && (
                                                        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-900/20 to-sky-900/20 border border-cyan-800/70">
                                                            <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold mb-1">Jarak</p>
                                                            <p className="text-sm font-semibold text-white">{Number(selectedDetail.attendance_log.distance_m).toFixed(2)}m</p>
                                                        </div>
                                                    )}
                                                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-800/70">
                                                        <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold mb-1">Dibuat</p>
                                                        <p className="text-sm font-semibold text-white">{selectedDetail.created_at ?? '-'}</p>
                                                    </div>
                                                </motion.div>

                                                {/* Verification Details */}
                                                {(selectedDetail.verified_by_name || selectedDetail.rejection_reason || selectedDetail.note) && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.4 }}
                                                        className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-800/70 space-y-3"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="h-5 w-5 text-emerald-400" />
                                                            <h3 className="font-bold text-white">Detail Verifikasi</h3>
                                                        </div>
                                                        {selectedDetail.verified_at && <div><p className="text-xs text-slate-400 mb-0.5">Diverifikasi</p><p className="text-sm font-medium text-slate-300">{selectedDetail.verified_at}</p></div>}
                                                        {selectedDetail.verified_by_name && <div><p className="text-xs text-slate-400 mb-0.5">Oleh</p><p className="text-sm font-medium text-slate-300">{selectedDetail.verified_by_name}</p></div>}
                                                        {selectedDetail.rejection_reason && <div><p className="text-xs text-slate-400 mb-0.5">Alasan Penolakan</p><p className="text-sm font-medium text-red-400">{selectedDetail.rejection_reason}</p></div>}
                                                        {selectedDetail.note && <div><p className="text-xs text-slate-400 mb-0.5">Catatan</p><p className="text-sm font-medium text-slate-300">{selectedDetail.note}</p></div>}
                                                    </motion.div>
                                                )}

                                                {/* Privacy Notice */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.45 }}
                                                    className="p-4 rounded-xl bg-amber-900/20 border border-amber-700/50"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <Lock className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                        <p className="text-xs text-amber-300 leading-relaxed">
                                                            Setelah menutup panel ini, Anda perlu mengajukan izin kembali untuk melihat detail selfie mahasiswa. Ini untuk melindungi privasi data.
                                                        </p>
                                                    </div>
                                                </motion.div>

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
                                                            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                                                            whileHover={{ scale: 1.02, y: -2 }}
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <CheckCircle className="h-5 w-5" /> Setujui
                                                        </motion.button>
                                                        <motion.button
                                                            onClick={() => { handleReject(selectedDetail.id); handleCloseDetail(); }}
                                                            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
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
                                                    className="relative rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700"
                                                >
                                                    {selectedDetail.attendance_log?.selfie_path ? (
                                                        <div className="relative">
                                                            <img
                                                                src={`/storage/${selectedDetail.attendance_log.selfie_path}`}
                                                                alt="Blurred"
                                                                className="w-full aspect-square object-cover blur-2xl scale-110"
                                                            />
                                                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center">
                                                                <motion.div
                                                                    animate={{ scale: [1, 1.1, 1] }}
                                                                    transition={{ duration: 2, repeat: Infinity }}
                                                                    className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-xl border-2 border-white/20 flex items-center justify-center mb-4"
                                                                >
                                                                    <Lock className="h-10 w-10 text-white" />
                                                                </motion.div>
                                                                <p className="text-white font-bold text-lg">Privasi Terlindungi</p>
                                                                <p className="text-white/70 text-sm mt-1">Ajukan izin untuk melihat detail</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-48">
                                                            <Image className="h-16 w-16 text-slate-400" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-4 right-4">
                                                        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-xl border ${selectedDetail.status === 'approved' ? 'bg-emerald-500/90 text-white border-emerald-600' :
                                                            selectedDetail.status === 'rejected' ? 'bg-red-500/90 text-white border-red-600' :
                                                                'bg-amber-500/90 text-white border-amber-600'
                                                            }`}>
                                                            {statusConfig[selectedDetail.status]?.label || selectedDetail.status}
                                                        </span>
                                                    </div>
                                                </motion.div>

                                                {/* Student Basic Info */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.15 }}
                                                    className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/70"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-lg font-bold text-slate-300">
                                                            {(selectedDetail.attendance_log?.mahasiswa?.nama ?? 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white">{selectedDetail.attendance_log?.mahasiswa?.nama ?? 'Unknown'}</p>
                                                            <p className="text-sm font-mono text-slate-500">{selectedDetail.attendance_log?.mahasiswa?.nim ?? '-'}</p>
                                                            <p className="text-xs text-slate-400 mt-0.5">{selectedDetail.attendance_log?.course ?? '-'} • {selectedDetail.created_at}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>

                                                {/* Privacy Shield Notice */}
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-700/50"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                                            <Shield className="h-5 w-5 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white text-sm mb-1">Perlindungan Privasi Aktif</p>
                                                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
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

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
    const colors: Record<string, string> = { blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400', purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' };
    return (
        <motion.div
            className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
            variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { type: "spring", stiffness: 100, damping: 12 }
                }
            }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex items-center gap-3">
                <motion.div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}
                >
                    <Icon className="h-5 w-5" />
                </motion.div>
                <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <motion.p
                        className="text-xl font-bold text-slate-900 dark:text-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                        {value}
                    </motion.p>
                </div>
            </div>
        </motion.div>
    );
}
