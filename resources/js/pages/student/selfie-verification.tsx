import DisetujuiSelfieIcon from '@/assets/admin/verifikasi-selfie/disetujui.png';
import DitolakSelfieIcon from '@/assets/admin/verifikasi-selfie/ditolak.png';
import PendingSelfieIcon from '@/assets/admin/verifikasi-selfie/pending.png';
import VerifikasiSelfieIcon from '@/assets/admin/verifikasi-selfie/verifikasi-selfie.png';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import StudentLayout from '@/layouts/student-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    Shield,
    User,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';

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

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PageProps {
    requests: {
        data: ViewRequest[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
    stats: Stats;
}

const statusConfig: Record<
    string,
    { label: string; color: string; bg: string; icon: LucideIcon }
> = {
    pending: {
        label: 'Menunggu',
        color: 'text-amber-700',
        bg: 'bg-amber-100',
        icon: Clock,
    },
    approved: {
        label: 'Disetujui',
        color: 'text-emerald-700',
        bg: 'bg-emerald-100',
        icon: CheckCircle,
    },
    rejected: {
        label: 'Ditolak',
        color: 'text-red-700',
        bg: 'bg-red-100',
        icon: XCircle,
    },
};

export default function SelfieVerification({ requests, stats }: PageProps) {
    const [selectedRequest, setSelectedRequest] = useState<ViewRequest | null>(
        null,
    );
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [responseNote, setResponseNote] = useState('');
    const [filter, setFilter] = useState('all');

    const handleApprove = () => {
        if (!selectedRequest) return;
        router.patch(
            `/user/selfie-view-requests/${selectedRequest.id}/approve`,
            {
                note: responseNote.trim() || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowApproveModal(false);
                    setSelectedRequest(null);
                    setResponseNote('');
                },
            },
        );
    };

    const handleReject = () => {
        if (!selectedRequest || !responseNote.trim()) return;
        router.patch(
            `/user/selfie-view-requests/${selectedRequest.id}/reject`,
            {
                note: responseNote.trim(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                    setResponseNote('');
                },
            },
        );
    };

    const filteredRequests =
        filter === 'all'
            ? requests.data
            : requests.data.filter((r) => r.status === filter);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04,
                delayChildren: 0.1,
            },
        },
    };

    return (
        <StudentLayout>
            <Head title="Verifikasi Selfie" />
            <motion.div
                className="space-y-6 p-4 md:space-y-8 md:p-6 lg:p-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 100,
                    }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-6">
                            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
                                <motion.div
                                    className="relative shrink-0"
                                    initial={{
                                        opacity: 0,
                                        scale: 0.5,
                                        rotate: -10,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        rotate: 0,
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        delay: 0.2,
                                    }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={VerifikasiSelfieIcon}
                                        alt="Verifikasi Selfie"
                                        className="h-20 w-20 object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)] sm:h-24 sm:w-24"
                                    />
                                </motion.div>

                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Privasi & Keamanan
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Verifikasi Selfie
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 max-w-lg text-sm leading-relaxed text-indigo-100 sm:text-base"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Kelola permintaan akses data selfie Anda
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
                    variants={containerVariants}
                >
                    {[
                        {
                            icon: FileText,
                            imgSrc: VerifikasiSelfieIcon,
                            label: 'Total Permintaan',
                            value: stats.total,
                            from: 'from-sky-400',
                            to: 'to-indigo-600',
                            bg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
                        },
                        {
                            icon: Clock,
                            imgSrc: PendingSelfieIcon,
                            label: 'Menunggu',
                            value: stats.pending,
                            from: 'from-amber-400',
                            to: 'to-orange-600',
                            bg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
                        },
                        {
                            icon: CheckCircle,
                            imgSrc: DisetujuiSelfieIcon,
                            label: 'Disetujui',
                            value: stats.approved,
                            from: 'from-emerald-400',
                            to: 'to-teal-600',
                            bg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
                        },
                        {
                            icon: XCircle,
                            imgSrc: DitolakSelfieIcon,
                            label: 'Ditolak',
                            value: stats.rejected,
                            from: 'from-red-400',
                            to: 'to-rose-600',
                            bg: 'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10',
                        },
                    ].map((card, index) => {
                        return (
                            <motion.div
                                key={card.label}
                                className="group relative cursor-default overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:rounded-3xl sm:p-5 dark:border-white/5 dark:bg-neutral-900/40"
                                variants={{
                                    hidden: { opacity: 0, y: 30, scale: 0.9 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        transition: {
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 20,
                                            delay: 0.05 * index,
                                        },
                                    },
                                }}
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${card.bg}`}
                                />
                                <div
                                    className={`absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${card.from} ${card.to} opacity-10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-20`}
                                />
                                <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                                    <motion.div
                                        whileHover={{ scale: 1.08, rotate: 6 }}
                                        className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-14 sm:w-14"
                                    >
                                        {'imgSrc' in card && card.imgSrc ? (
                                            <img
                                                src={card.imgSrc}
                                                alt={card.label}
                                                className="h-10 w-10 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)] sm:h-14 sm:w-14"
                                            />
                                        ) : (
                                            <>
                                                <div
                                                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${card.from} ${card.to} shadow-lg`}
                                                />
                                                {'icon' in card &&
                                                    card.icon && (
                                                        <card.icon className="relative h-5 w-5 text-white sm:h-7 sm:w-7" />
                                                    )}
                                            </>
                                        )}
                                    </motion.div>
                                    <div>
                                        <p className="text-[10px] leading-tight font-medium text-neutral-500 sm:text-sm dark:text-neutral-400">
                                            {card.label}
                                        </p>
                                        <div className="mt-0.5 sm:mt-1">
                                            <span className="text-lg font-bold text-neutral-900 sm:text-2xl dark:text-white">
                                                <AnimatedCounter
                                                    value={card.value}
                                                />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Requests List */}
                <motion.div
                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="border-b border-white/10 p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                        Permintaan Akses
                                    </h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {filteredRequests.length} permintaan
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                                {['all', 'pending', 'approved', 'rejected'].map(
                                    (s) => (
                                        <motion.button
                                            key={s}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setFilter(s)}
                                            className={cn(
                                                'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                                                filter === s
                                                    ? 'bg-white text-indigo-600 shadow-sm dark:bg-neutral-700 dark:text-indigo-400'
                                                    : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
                                            )}
                                        >
                                            {s === 'all'
                                                ? 'Semua'
                                                : statusConfig[s]?.label || s}
                                        </motion.button>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 p-4">
                        <AnimatePresence mode="popLayout">
                            {filteredRequests.length === 0 ? (
                                <motion.div
                                    className="p-12 text-center"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <Shield className="mx-auto mb-4 h-16 w-16 text-neutral-300 dark:text-neutral-700" />
                                    <p className="text-neutral-500 dark:text-neutral-400">
                                        Tidak ada permintaan
                                    </p>
                                </motion.div>
                            ) : (
                                filteredRequests.map((request) => {
                                    const cfg = statusConfig[request.status];
                                    const StatusIcon = cfg.icon;

                                    return (
                                        <motion.div
                                            key={request.id}
                                            className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            whileHover={{ scale: 1.01, y: -2 }}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <User className="h-4 w-4 text-neutral-400" />
                                                        <span className="font-medium text-neutral-900 dark:text-white">
                                                            {
                                                                request
                                                                    .requested_by
                                                                    .name
                                                            }
                                                        </span>
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color} flex items-center gap-1`}
                                                        >
                                                            <StatusIcon className="h-3 w-3" />
                                                            {cfg.label}
                                                        </span>
                                                    </div>

                                                    <div className="mb-3 rounded-xl border border-white/20 bg-white/60 p-3 backdrop-blur-xl dark:border-white/5 dark:bg-neutral-800/60">
                                                        <p className="mb-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                            Alasan:
                                                        </p>
                                                        <p className="text-sm text-neutral-700 dark:text-neutral-300">
                                                            {request.reason}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>
                                                                Diminta:{' '}
                                                                {request.created_at_formatted ||
                                                                    request.created_at}
                                                            </span>
                                                        </div>
                                                        {request
                                                            .selfie_verification
                                                            ?.attendance_log
                                                            ?.scanned_at && (
                                                            <div className="flex items-center gap-1">
                                                                <Eye className="h-3 w-3" />
                                                                <span>
                                                                    Scan:{' '}
                                                                    {
                                                                        request
                                                                            .selfie_verification
                                                                            .attendance_log
                                                                            .scanned_at
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {request.response_note && (
                                                        <div className="mt-3 rounded-xl border border-indigo-200/70 bg-indigo-50/70 p-3 dark:border-indigo-500/30 dark:bg-indigo-500/10">
                                                            <p className="mb-1 text-xs text-blue-600 dark:text-blue-400">
                                                                Tanggapan Anda:
                                                            </p>
                                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                                {
                                                                    request.response_note
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {request.status === 'pending' && (
                                                <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row dark:border-white/5">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(
                                                                request,
                                                            );
                                                            setShowApproveModal(
                                                                true,
                                                            );
                                                        }}
                                                        className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                                                    >
                                                        Setujui
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRequest(
                                                                request,
                                                            );
                                                            setShowRejectModal(
                                                                true,
                                                            );
                                                        }}
                                                        className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                                                    >
                                                        Tolak
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>

                    {requests.last_page > 1 && (
                        <div className="flex justify-center gap-2 border-t border-white/10 p-4 dark:border-white/5">
                            {requests.links.map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() =>
                                        link.url &&
                                        router.get(
                                            link.url,
                                            {},
                                            { preserveState: true },
                                        )
                                    }
                                    disabled={!link.url}
                                    className={`rounded px-3 py-1 text-sm ${
                                        link.active
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                                            : link.url
                                              ? 'border border-white/20 bg-white/60 text-neutral-700 hover:bg-white/80 dark:border-white/5 dark:bg-neutral-800/60 dark:text-neutral-300'
                                              : 'cursor-not-allowed bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Approve Modal */}
                <AnimatePresence>
                    {showApproveModal && selectedRequest && (
                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowApproveModal(false)}
                        >
                            <motion.div
                                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/95"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ scale: 0.8, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.8, y: 50 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
                                <div className="relative p-6">
                                    <div className="mb-4 flex items-center justify-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-500">
                                            <CheckCircle className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="mb-2 text-center text-xl font-bold text-neutral-900 dark:text-white">
                                        Setujui Permintaan
                                    </h3>
                                    <p className="mb-4 text-center text-sm text-neutral-600 dark:text-neutral-300">
                                        Anda akan mengizinkan{' '}
                                        {selectedRequest.requested_by.name}{' '}
                                        untuk melihat detail selfie Anda
                                    </p>

                                    <div className="mb-4">
                                        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            Catatan (Opsional)
                                        </label>
                                        <textarea
                                            value={responseNote}
                                            onChange={(e) =>
                                                setResponseNote(e.target.value)
                                            }
                                            placeholder="Tambahkan catatan jika diperlukan..."
                                            className="w-full resize-none rounded-xl border border-white/20 bg-white/70 px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-white/5 dark:bg-neutral-800/60 dark:text-white dark:placeholder-neutral-500"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowApproveModal(false);
                                                setResponseNote('');
                                            }}
                                            className="flex-1 rounded-xl border border-white/20 bg-white/70 py-2.5 font-medium text-neutral-900 transition-colors hover:bg-white/90 dark:border-white/5 dark:bg-neutral-800/60 dark:text-white dark:hover:bg-neutral-700"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleApprove}
                                            className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 py-2.5 font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-600 hover:to-green-600"
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
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowRejectModal(false)}
                        >
                            <motion.div
                                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/95"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ scale: 0.8, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.8, y: 50 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10" />
                                <div className="relative p-6">
                                    <div className="mb-4 flex items-center justify-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500">
                                            <XCircle className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="mb-2 text-center text-xl font-bold text-neutral-900 dark:text-white">
                                        Tolak Permintaan
                                    </h3>
                                    <p className="mb-4 text-center text-sm text-neutral-600 dark:text-neutral-300">
                                        Anda akan menolak permintaan dari{' '}
                                        {selectedRequest.requested_by.name}
                                    </p>

                                    <div className="mb-4">
                                        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            Alasan Penolakan{' '}
                                            <span className="text-red-400">
                                                *
                                            </span>
                                        </label>
                                        <textarea
                                            value={responseNote}
                                            onChange={(e) =>
                                                setResponseNote(e.target.value)
                                            }
                                            placeholder="Jelaskan alasan penolakan Anda..."
                                            className="w-full resize-none rounded-xl border border-white/20 bg-white/70 px-4 py-3 text-neutral-900 placeholder-neutral-400 focus:border-transparent focus:ring-2 focus:ring-red-500 focus:outline-none dark:border-white/5 dark:bg-neutral-800/60 dark:text-white dark:placeholder-neutral-500"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                                            <p className="text-xs text-red-300">
                                                Alasan penolakan wajib diisi dan
                                                akan dikirim ke pemohon
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowRejectModal(false);
                                                setResponseNote('');
                                            }}
                                            className="flex-1 rounded-xl border border-white/20 bg-white/70 py-2.5 font-medium text-neutral-900 transition-colors hover:bg-white/90 dark:border-white/5 dark:bg-neutral-800/60 dark:text-white dark:hover:bg-neutral-700"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            disabled={
                                                !responseNote.trim() ||
                                                responseNote.trim().length < 10
                                            }
                                            className="flex-1 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 py-2.5 font-medium text-white shadow-lg shadow-red-500/20 transition-all hover:from-red-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
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
