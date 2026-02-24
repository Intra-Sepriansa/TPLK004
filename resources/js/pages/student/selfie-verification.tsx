import { Head, router } from '@inertiajs/react';
import StudentLayout from '@/layouts/student-layout';
import { Shield, CheckCircle, XCircle, Clock, Eye, User, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RequestedBy {
    id: number;
    name: string;
}

interface AttendanceLog {
    id: number;
    scanned_at: string | null;
}

interface SelfieVerification {
    id: number;
    attendance_log: AttendanceLog | null;
}

interface ViewRequest {
    id: number;
    reason: string;
    status: string;
    created_at: string;
    created_at_formatted?: string;
    responded_at: string | null;
    response_note: string | null;
    requested_by: RequestedBy;
    selfie_verification: SelfieVerification | null;
}

interface Stats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

interface PageProps {
    requests: {
        data: ViewRequest[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    stats: Stats;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    pending: { label: 'Menunggu', color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
    approved: { label: 'Disetujui', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle },
    rejected: { label: 'Ditolak', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle },
};

export default function SelfieVerification({ requests, stats }: PageProps) {
    const [selectedRequest, setSelectedRequest] = useState<ViewRequest | null>(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [responseNote, setResponseNote] = useState('');
    const [filter, setFilter] = useState('all');

    const handleApprove = () => {
        if (!selectedRequest) return;
        router.patch(`/user/selfie-view-requests/${selectedRequest.id}/approve`, {
            note: responseNote.trim() || null
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowApproveModal(false);
                setSelectedRequest(null);
                setResponseNote('');
            }
        });
    };

    const handleReject = () => {
        if (!selectedRequest || !responseNote.trim()) return;
        router.patch(`/user/selfie-view-requests/${selectedRequest.id}/reject`, {
            note: responseNote.trim()
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowRejectModal(false);
                setSelectedRequest(null);
                setResponseNote('');
            }
        });
    };

    const filteredRequests = filter === 'all' 
        ? requests.data 
        : requests.data.filter(r => r.status === filter);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04,
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

    return (
        <StudentLayout>
            <Head title="Verifikasi Selfie" />
            <motion.div 
                className="p-6 space-y-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Header */}
                <motion.div 
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                    variants={itemVariants}
                >
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
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-indigo-100 font-medium">Privasi & Keamanan</p>
                                <h1 className="text-3xl font-bold">Verifikasi Selfie</h1>
                            </div>
                        </div>
                        <p className="mt-4 text-indigo-100">Kelola permintaan akses data selfie Anda</p>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div 
                    className="grid gap-4 md:grid-cols-4"
                    variants={containerVariants}
                >
                    <StatCard icon={FileText} label="Total Permintaan" value={stats.total} color="blue" />
                    <StatCard icon={Clock} label="Menunggu" value={stats.pending} color="amber" />
                    <StatCard icon={CheckCircle} label="Disetujui" value={stats.approved} color="emerald" />
                    <StatCard icon={XCircle} label="Ditolak" value={stats.rejected} color="red" />
                </motion.div>

                {/* Requests List */}
                <motion.div 
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 overflow-hidden"
                    variants={itemVariants}
                >
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-600" />
                                <h2 className="font-semibold text-slate-900 dark:text-white">Permintaan Akses</h2>
                            </div>
                            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                {['all', 'pending', 'approved', 'rejected'].map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => setFilter(s)} 
                                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                                            filter === s 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-black dark:text-slate-400'
                                        }`}
                                    >
                                        {s === 'all' ? 'Semua' : statusConfig[s]?.label || s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 space-y-3">
                        <AnimatePresence mode="popLayout">
                            {filteredRequests.length === 0 ? (
                                <motion.div 
                                    className="p-12 text-center"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <Shield className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-500">Tidak ada permintaan</p>
                                </motion.div>
                            ) : filteredRequests.map((request) => {
                                const cfg = statusConfig[request.status];
                                const StatusIcon = cfg.icon;
                                
                                return (
                                    <motion.div 
                                        key={request.id}
                                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-black"
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        whileHover={{ scale: 1.02, y: -4 }}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <User className="h-4 w-4 text-slate-400" />
                                                    <span className="font-medium text-slate-900 dark:text-white">
                                                        {request.requested_by.name}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color} flex items-center gap-1`}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                                
                                                <div className="mb-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                                                    <p className="text-xs text-slate-500 mb-1">Alasan:</p>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">{request.reason}</p>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>Diminta: {request.created_at_formatted || request.created_at}</span>
                                                    </div>
                                                    {request.selfie_verification?.attendance_log?.scanned_at && (
                                                        <div className="flex items-center gap-1">
                                                            <Eye className="h-3 w-3" />
                                                            <span>Scan: {request.selfie_verification.attendance_log.scanned_at}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {request.response_note && (
                                                    <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Tanggapan Anda:</p>
                                                        <p className="text-sm text-blue-700 dark:text-blue-300">{request.response_note}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {request.status === 'pending' && (
                                            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowApproveModal(true);
                                                    }}
                                                    className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
                                                >
                                                    Setujui
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowRejectModal(true);
                                                    }}
                                                    className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                                                >
                                                    Tolak
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {requests.last_page > 1 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-2">
                            {requests.links.map((link, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })} 
                                    disabled={!link.url} 
                                    className={`px-3 py-1 rounded text-sm ${
                                        link.active 
                                            ? 'bg-blue-600 text-white' 
                                            : link.url 
                                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300' 
                                                : 'bg-slate-50 text-slate-400 cursor-not-allowed dark:bg-black'
                                    }`} 
                                    dangerouslySetInnerHTML={{ __html: link.label }} 
                                />
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Approve Modal */}
                <AnimatePresence>
                    {showApproveModal && selectedRequest && (
                        <motion.div 
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4" 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowApproveModal(false)}
                        >
                            <motion.div 
                                className="relative max-w-md w-full bg-gradient-to-br from-slate-900 to-black border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ scale: 0.8, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.8, y: 50 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-green-500/10" />
                                <div className="relative p-6">
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                                            <CheckCircle className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white text-center mb-2">Setujui Permintaan</h3>
                                    <p className="text-sm text-slate-300 text-center mb-4">
                                        Anda akan mengizinkan {selectedRequest.requested_by.name} untuk melihat detail selfie Anda
                                    </p>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Catatan (Opsional)
                                        </label>
                                        <textarea
                                            value={responseNote}
                                            onChange={(e) => setResponseNote(e.target.value)}
                                            placeholder="Tambahkan catatan jika diperlukan..."
                                            className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => {
                                                setShowApproveModal(false);
                                                setResponseNote('');
                                            }}
                                            className="flex-1 py-2.5 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button 
                                            onClick={handleApprove}
                                            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg shadow-emerald-500/20"
                                        >
                                            Setujui
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Reject Modal */}
                <AnimatePresence>
                    {showRejectModal && selectedRequest && (
                        <motion.div 
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4" 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowRejectModal(false)}
                        >
                            <motion.div 
                                className="relative max-w-md w-full bg-gradient-to-br from-slate-900 to-black border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ scale: 0.8, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.8, y: 50 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10" />
                                <div className="relative p-6">
                                    <div className="flex items-center justify-center mb-4">
                                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                                            <XCircle className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white text-center mb-2">Tolak Permintaan</h3>
                                    <p className="text-sm text-slate-300 text-center mb-4">
                                        Anda akan menolak permintaan dari {selectedRequest.requested_by.name}
                                    </p>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Alasan Penolakan <span className="text-red-400">*</span>
                                        </label>
                                        <textarea
                                            value={responseNote}
                                            onChange={(e) => setResponseNote(e.target.value)}
                                            placeholder="Jelaskan alasan penolakan Anda..."
                                            className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-4">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-red-300">Alasan penolakan wajib diisi dan akan dikirim ke pemohon</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => {
                                                setShowRejectModal(false);
                                                setResponseNote('');
                                            }}
                                            className="flex-1 py-2.5 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-600 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button 
                                            onClick={handleReject}
                                            disabled={!responseNote.trim() || responseNote.trim().length < 10}
                                            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium hover:from-red-600 hover:to-orange-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Tolak
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </StudentLayout>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
    const colors: Record<string, string> = { 
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', 
        amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', 
        emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', 
        red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
    };
    
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
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
                </div>
            </div>
        </motion.div>
    );
}
