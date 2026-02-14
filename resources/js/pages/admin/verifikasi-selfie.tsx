import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ScanFace, CheckCircle, XCircle, Clock, RefreshCw, Eye, AlertTriangle, TrendingUp, Users, Image, Shield, Lock, Calendar, User, FileText, X } from 'lucide-react';
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
    const [showPrivacyWarning, setShowPrivacyWarning] = useState(false);
    const [showPermissionRequest, setShowPermissionRequest] = useState(false);
    const [permissionReason, setPermissionReason] = useState('');
    const [isDetailRevealed, setIsDetailRevealed] = useState(false);

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
                                                if (item.has_approved_request) {
                                                    // If already approved, go directly to detail modal
                                                    setIsDetailRevealed(true);
                                                } else {
                                                    // Otherwise, show privacy warning first
                                                    setShowPrivacyWarning(true);
                                                    setIsDetailRevealed(false);
                                                }
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

                {/* Privacy Warning Modal */}
                <AnimatePresence>
                    {showPrivacyWarning && selectedDetail && (
                        <motion.div 
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4" 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div 
                                className="relative max-w-md w-full bg-gradient-to-br from-slate-900 to-black border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ scale: 0.8, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.8, y: 50 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-red-500/10" />
                                <div className="relative p-6">
                                    <motion.div 
                                        className="flex items-center justify-center mb-4"
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    >
                                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center">
                                            <Shield className="h-8 w-8 text-white" />
                                        </div>
                                    </motion.div>
                                    <motion.h3 
                                        className="text-xl font-bold text-white text-center mb-2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Peringatan Privasi
                                    </motion.h3>
                                    <motion.p 
                                        className="text-sm text-slate-300 text-center mb-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Detail mahasiswa hanya dapat dilihat sekali. Untuk melihat kembali, diperlukan persetujuan dari mahasiswa yang bersangkutan.
                                    </motion.p>
                                    <motion.div 
                                        className="flex gap-3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <button 
                                            onClick={() => {
                                                setShowPrivacyWarning(false);
                                                setSelectedDetail(null);
                                            }}
                                            className="flex-1 py-2.5 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setShowPrivacyWarning(false);
                                                setShowPermissionRequest(true);
                                            }}
                                            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-red-500 text-white font-medium hover:from-amber-600 hover:to-red-600 transition-all shadow-lg shadow-amber-500/20"
                                        >
                                            Saya Mengerti
                                        </button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Permission Request Modal */}
                <AnimatePresence>
                    {showPermissionRequest && selectedDetail && (
                        <motion.div 
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg p-4" 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div 
                                className="relative max-w-lg w-full bg-gradient-to-br from-slate-900 to-black border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ scale: 0.8, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.8, y: 50 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
                                <div className="relative p-6">
                                    <motion.div 
                                        className="flex items-center justify-center mb-4"
                                        initial={{ scale: 0, rotate: 180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    >
                                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                            <FileText className="h-8 w-8 text-white" />
                                        </div>
                                    </motion.div>
                                    <motion.h3 
                                        className="text-xl font-bold text-white text-center mb-2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Permintaan Akses Data
                                    </motion.h3>
                                    <motion.p 
                                        className="text-sm text-slate-300 text-center mb-4"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Jelaskan alasan Anda ingin melihat detail selfie mahasiswa ini
                                    </motion.p>
                                    
                                    <motion.div
                                        className="mb-4"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Alasan Permintaan <span className="text-red-400">*</span>
                                            <span className="text-xs text-slate-500 ml-2">(minimal 10 karakter)</span>
                                        </label>
                                        <textarea
                                            value={permissionReason}
                                            onChange={(e) => setPermissionReason(e.target.value)}
                                            placeholder="Contoh: Verifikasi kehadiran untuk keperluan administrasi..."
                                            className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            rows={4}
                                        />
                                        {permissionReason.trim() && permissionReason.trim().length < 10 && (
                                            <p className="text-xs text-red-400 mt-1">
                                                Alasan harus minimal 10 karakter ({permissionReason.trim().length}/10)
                                            </p>
                                        )}
                                    </motion.div>

                                    <motion.div 
                                        className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 mb-4"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-semibold text-blue-300 mb-1">Informasi Penting</p>
                                                <p className="text-xs text-blue-200/80">Permintaan ini akan dikirim ke mahasiswa. Anda dapat melihat detail setelah mahasiswa menyetujui permintaan Anda.</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div 
                                        className="flex gap-3"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 }}
                                    >
                                        <button 
                                            onClick={() => {
                                                setShowPermissionRequest(false);
                                                setSelectedDetail(null);
                                                setPermissionReason('');
                                            }}
                                            className="flex-1 py-2.5 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (permissionReason.trim() && permissionReason.trim().length >= 10 && selectedDetail) {
                                                    router.post('/selfie-view-requests', {
                                                        selfie_verification_id: selectedDetail.id,
                                                        reason: permissionReason.trim()
                                                    }, {
                                                        preserveScroll: true,
                                                        onSuccess: () => {
                                                            setShowPermissionRequest(false);
                                                            setSelectedDetail(null);
                                                            setPermissionReason('');
                                                        },
                                                        onError: (errors) => {
                                                            console.error('Error submitting request:', errors);
                                                        }
                                                    });
                                                }
                                            }}
                                            disabled={!permissionReason.trim() || permissionReason.trim().length < 10}
                                            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Kirim Permintaan
                                        </button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Detail Modal */}
                <AnimatePresence>
                    {isDetailRevealed && selectedDetail && (
                        <motion.div 
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg p-4" 
                            onClick={() => {
                                setIsDetailRevealed(false);
                                setSelectedDetail(null);
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div 
                                className="relative max-w-4xl w-full bg-black/90 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ scale: 0.9, y: 50, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.9, y: 50, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                            >
                                {/* Animated Background */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-500/20"
                                    animate={{
                                        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                                    }}
                                    transition={{
                                        duration: 10,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    style={{
                                        backgroundSize: '200% 200%',
                                    }}
                                />
                                
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                
                                {/* Close Button */}
                                <button 
                                    onClick={() => {
                                        setIsDetailRevealed(false);
                                        setSelectedDetail(null);
                                    }}
                                    className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="relative p-8">
                                    {/* Header */}
                                    <motion.div 
                                        className="flex items-center gap-4 mb-6"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                            <Eye className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">Detail Verifikasi Selfie</h2>
                                            <p className="text-sm text-slate-400">Informasi lengkap mahasiswa dan absensi</p>
                                        </div>
                                    </motion.div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Left: Image */}
                                        <motion.div
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/50">
                                                {selectedDetail.attendance_log?.selfie_path ? (
                                                    <motion.img 
                                                        src={`/storage/${selectedDetail.attendance_log.selfie_path}`} 
                                                        alt="Selfie" 
                                                        className="w-full h-full object-cover"
                                                        initial={{ scale: 1.2, filter: "blur(20px)" }}
                                                        animate={{ scale: 1, filter: "blur(0px)" }}
                                                        transition={{ duration: 0.6, delay: 0.3 }}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <Image className="h-16 w-16 text-slate-600" />
                                                    </div>
                                                )}
                                                <div className="absolute top-3 right-3">
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl border ${
                                                        selectedDetail.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                                        selectedDetail.status === 'rejected' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                                        'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                                    }`}>
                                                        {statusConfig[selectedDetail.status]?.label || selectedDetail.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Right: Details */}
                                        <motion.div 
                                            className="space-y-4"
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            {/* Student Info */}
                                            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <User className="h-4 w-4 text-indigo-400" />
                                                    <h3 className="text-sm font-semibold text-white">Informasi Mahasiswa</h3>
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-xs text-slate-400">Nama</p>
                                                        <p className="text-sm font-medium text-white">{selectedDetail.attendance_log?.mahasiswa?.nama ?? 'Unknown'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-400">NIM</p>
                                                        <p className="text-sm font-medium text-white">{selectedDetail.attendance_log?.mahasiswa?.nim ?? '-'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Attendance Info */}
                                            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Calendar className="h-4 w-4 text-purple-400" />
                                                    <h3 className="text-sm font-semibold text-white">Informasi Absensi</h3>
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-xs text-slate-400">Mata Kuliah</p>
                                                        <p className="text-sm font-medium text-white">{selectedDetail.attendance_log?.course ?? '-'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-400">Waktu Scan</p>
                                                        <p className="text-sm font-medium text-white">{selectedDetail.attendance_log?.scanned_at ?? '-'}</p>
                                                    </div>
                                                    {selectedDetail.attendance_log?.distance_m !== null && selectedDetail.attendance_log?.distance_m !== undefined && (
                                                        <div>
                                                            <p className="text-xs text-slate-400">Jarak</p>
                                                            <p className="text-sm font-medium text-white">{selectedDetail.attendance_log.distance_m.toFixed(2)} meter</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Verification Info */}
                                            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <FileText className="h-4 w-4 text-pink-400" />
                                                    <h3 className="text-sm font-semibold text-white">Informasi Verifikasi</h3>
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-xs text-slate-400">Dibuat</p>
                                                        <p className="text-sm font-medium text-white">{selectedDetail.created_at ?? '-'}</p>
                                                    </div>
                                                    {selectedDetail.verified_at && (
                                                        <div>
                                                            <p className="text-xs text-slate-400">Diverifikasi</p>
                                                            <p className="text-sm font-medium text-white">{selectedDetail.verified_at}</p>
                                                        </div>
                                                    )}
                                                    {selectedDetail.verified_by_name && (
                                                        <div>
                                                            <p className="text-xs text-slate-400">Oleh</p>
                                                            <p className="text-sm font-medium text-white">{selectedDetail.verified_by_name}</p>
                                                        </div>
                                                    )}
                                                    {selectedDetail.rejection_reason && (
                                                        <div>
                                                            <p className="text-xs text-slate-400">Alasan Penolakan</p>
                                                            <p className="text-sm font-medium text-red-300">{selectedDetail.rejection_reason}</p>
                                                        </div>
                                                    )}
                                                    {selectedDetail.note && (
                                                        <div>
                                                            <p className="text-xs text-slate-400">Catatan</p>
                                                            <p className="text-sm font-medium text-white">{selectedDetail.note}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Privacy Notice */}
                                            <motion.div 
                                                className="p-4 rounded-xl bg-amber-500/10 backdrop-blur-xl border border-amber-500/30"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Lock className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-semibold text-amber-300 mb-1">Perlindungan Privasi</p>
                                                        <p className="text-xs text-amber-200/80">Detail ini telah dilihat. Untuk melihat kembali, diperlukan persetujuan dari mahasiswa.</p>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* Action Buttons */}
                                            {selectedDetail.status === 'pending' && (
                                                <motion.div 
                                                    className="flex gap-3 pt-2"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.6 }}
                                                >
                                                    <button 
                                                        onClick={() => {
                                                            handleApprove(selectedDetail.id);
                                                            setIsDetailRevealed(false);
                                                            setSelectedDetail(null);
                                                        }}
                                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
                                                    >
                                                        Setujui
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            handleReject(selectedDetail.id);
                                                            setIsDetailRevealed(false);
                                                            setSelectedDetail(null);
                                                        }}
                                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/20"
                                                    >
                                                        Tolak
                                                    </button>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AppLayout>
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
