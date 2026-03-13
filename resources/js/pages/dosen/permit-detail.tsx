import CourseInfoIcon from '@/assets/admin/sesi-absen/course-icon.png';
import DateInfoIcon from '@/assets/admin/sesi-absen/hari-icon.png';
import DurationInfoIcon from '@/assets/admin/sesi-absen/rata-rata-icon.png';
import SubmittedInfoIcon from '@/assets/admin/sesi-absen/sesi-icon.png';
import PersetujuanIzinIcon from '@/assets/dosen/izin-sakit/persetujuan-izin.png';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import DosenLayout from '@/layouts/dosen-layout';
import { cn } from '@/lib/utils';
import { Head, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    Calendar,
    Check,
    CheckCircle,
    Clock,
    ExternalLink,
    Eye,
    FileText,
    Heart,
    Info,
    Mail,
    MessageSquare,
    Paperclip,
    Phone,
    Send,
    Shield,
    Sparkles,
    TrendingUp,
    X,
    XCircle,
} from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';

/* ═══════════════════════════════════════════════════ */
/*                     TYPES                          */
/* ═══════════════════════════════════════════════════ */
type Permit = {
    id: number;
    mahasiswa: {
        id: number;
        nama: string;
        nim: string;
        avatar?: string;
        email?: string;
        phone?: string;
    };
    type: 'izin' | 'sakit';
    reason: string;
    attachment: string | null;
    attachments: { id: number; url: string; name: string }[];
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason: string | null;
    session: {
        id: number;
        mata_kuliah: string;
        tanggal: string;
        tanggal_display: string;
    };
    created_at: string;
    start_date: string;
    end_date: string;
    duration: number;
    is_urgent: boolean;
    ai_confidence: number;
    ai_recommendation: 'approve' | 'reject' | 'review';
    document_score: number;
    approved_at: string | null;
    reviewed_at: string | null;
    comments: Array<{
        id: number;
        sender_type: 'mahasiswa' | 'dosen';
        sender_name: string;
        message: string;
        created_at: string;
        is_mine: boolean;
    }>;
};

type Props = { permit: Permit };

/* ═══════════════════════════════════════════════════ */
/*              ANIMATION VARIANTS                    */
/* ═══════════════════════════════════════════════════ */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.07, delayChildren: 0.1 },
    },
} as const;
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
};

/* ═══════════════════════════════════════════════════ */
/*                    HELPERS                         */
/* ═══════════════════════════════════════════════════ */
const fmtDateRange = (s: string, e: string) =>
    s === e
        ? moment(s).format('DD MMM YYYY')
        : `${moment(s).format('DD MMM')} – ${moment(e).format('DD MMM YYYY')}`;

const statusConfig = {
    pending: {
        label: 'Menunggu',
        icon: Clock,
        color: 'from-amber-500 to-orange-600',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800/30',
    },
    approved: {
        label: 'Disetujui',
        icon: CheckCircle,
        color: 'from-emerald-500 to-teal-600',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800/30',
    },
    rejected: {
        label: 'Ditolak',
        icon: XCircle,
        color: 'from-red-500 to-rose-600',
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-700 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800/30',
    },
};

const typeConfig = {
    izin: {
        label: 'Izin',
        icon: Shield,
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    },
    sakit: {
        label: 'Sakit',
        icon: Heart,
        color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    },
};

/* ═══════════════════════════════════════════════════ */
/*                 MAIN COMPONENT                     */
/* ═══════════════════════════════════════════════════ */
export default function PermitDetail({ permit }: Props) {
    const { flash } = usePage<{ flash?: { success?: string } }>().props;
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [commentMessage, setCommentMessage] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const sc = statusConfig[permit.status];
    const tc = typeConfig[permit.type];

    const doApprove = () => {
        setProcessingId(permit.id);
        router.patch(
            `/dosen/permits/${permit.id}/approve`,
            {},
            {
                onSuccess: () => {
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                },
                onFinish: () => setProcessingId(null),
            },
        );
    };

    const doReject = () => {
        if (!rejectionReason) return;
        setProcessingId(permit.id);
        router.patch(
            `/dosen/permits/${permit.id}/reject`,
            { rejection_reason: rejectionReason },
            {
                onSuccess: () => {
                    setIsRejectOpen(false);
                    setRejectionReason('');
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                },
                onFinish: () => setProcessingId(null),
            },
        );
    };

    const sendComment = () => {
        if (!commentMessage.trim()) return;

        router.post(
            `/dosen/permits/${permit.id}/comment`,
            {
                message: commentMessage,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCommentMessage('');
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                },
            },
        );
    };

    return (
        <DosenLayout>
            <Head title={`Detail Permit — ${permit.mahasiswa.nama}`} />

            {/* Success Toast */}
            <AnimatePresence>
                {(showSuccess || flash?.success) && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-6 right-6 z-50 flex items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-2xl backdrop-blur dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-200"
                    >
                        <CheckCircle className="mt-0.5 h-5 w-5 text-emerald-500" />
                        <div>
                            <p className="font-bold">Berhasil!</p>
                            <p className="text-xs opacity-80">
                                {flash?.success || 'Aksi berhasil dilakukan!'}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-4 md:p-6"
            >
                {/* ═══ Back Button ═══ */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-2"
                >
                    <Button
                        variant="ghost"
                        onClick={() => router.visit('/dosen/permits')}
                        className="group transition-all duration-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60"
                    >
                        <motion.div
                            whileHover={{ x: -4 }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 25,
                            }}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                        </motion.div>
                        Kembali ke Daftar Permit
                    </Button>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/*         HERO CARD — Student + Status               */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl border border-white/20 p-5 text-white shadow-2xl sm:p-6 md:p-8"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10 space-y-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-4 sm:items-center sm:gap-5">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 4 }}
                                    className="relative flex h-16 w-16 shrink-0 items-center justify-center sm:h-20 sm:w-20"
                                >
                                    <img
                                        src={PersetujuanIzinIcon}
                                        alt="Permit Detail"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.45)]"
                                    />
                                </motion.div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold tracking-[0.2em] text-indigo-100 uppercase">
                                        Permit Detail
                                    </p>
                                    <h1 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl md:text-3xl">
                                        {permit.mahasiswa.nama}
                                    </h1>
                                    <p className="mt-1 text-sm font-medium text-indigo-100/90">
                                        {permit.mahasiswa.nim}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-bold backdrop-blur-xl sm:text-sm">
                                    <sc.icon className="h-4 w-4" />
                                    {sc.label}
                                </span>
                                <Badge className="border border-white/20 bg-white/15 text-xs font-bold text-white backdrop-blur-xl sm:text-sm">
                                    <tc.icon className="mr-1 h-3 w-3" />
                                    {tc.label}
                                </Badge>
                                {permit.is_urgent && (
                                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-red-300/40 bg-red-500/30 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xl sm:text-sm">
                                        <AlertTriangle className="h-4 w-4" />
                                        Urgent
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-xl sm:p-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                                    <motion.div
                                        className="relative shrink-0"
                                        whileHover={{ scale: 1.03 }}
                                    >
                                        <div className="absolute -inset-1 rounded-full bg-white/30 blur-sm" />
                                        <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white/70 shadow-xl sm:h-16 sm:w-16">
                                            <Avatar className="h-full w-full">
                                                <AvatarImage
                                                    src={
                                                        permit.mahasiswa.avatar
                                                    }
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white">
                                                    {permit.mahasiswa.nama[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </motion.div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white sm:text-base">
                                            Kontak Mahasiswa
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            {permit.mahasiswa.email && (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-medium text-indigo-50 sm:text-xs">
                                                    <Mail className="h-3 w-3" />
                                                    <span className="truncate">
                                                        {permit.mahasiswa.email}
                                                    </span>
                                                </span>
                                            )}
                                            {permit.mahasiswa.phone && (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-medium text-indigo-50 sm:text-xs">
                                                    <Phone className="h-3 w-3" />
                                                    <span className="truncate">
                                                        {permit.mahasiswa.phone}
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {permit.status === 'pending' && (
                                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <Button
                                                className="w-full border border-white/20 bg-white/15 px-6 text-white backdrop-blur-xl hover:bg-white/25 sm:w-auto"
                                                onClick={doApprove}
                                                disabled={
                                                    processingId === permit.id
                                                }
                                            >
                                                <Check className="mr-2 h-4 w-4" />{' '}
                                                Setujui
                                            </Button>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full border-red-300/40 bg-red-500/20 px-6 text-white hover:bg-red-500/30 sm:w-auto"
                                                onClick={() =>
                                                    setIsRejectOpen(true)
                                                }
                                                disabled={
                                                    processingId === permit.id
                                                }
                                            >
                                                <X className="mr-2 h-4 w-4" />{' '}
                                                Tolak
                                            </Button>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/*               INFO GRID (4 columns)                */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 gap-4 md:grid-cols-4"
                >
                    {[
                        {
                            iconSrc: CourseInfoIcon,
                            label: 'Mata Kuliah',
                            val: permit.session.mata_kuliah,
                            cardClass:
                                'border-white/20 bg-white/40 dark:border-white/5 dark:bg-neutral-900/40',
                            overlayClass: 'from-blue-500/12 to-transparent',
                            valueClass: 'text-blue-700 dark:text-blue-300',
                            glow: 'bg-blue-500',
                        },
                        {
                            iconSrc: DateInfoIcon,
                            label: 'Tanggal',
                            val: permit.session.tanggal_display,
                            cardClass:
                                'border-white/20 bg-white/40 dark:border-white/5 dark:bg-neutral-900/40',
                            overlayClass: 'from-violet-500/12 to-transparent',
                            valueClass: 'text-violet-700 dark:text-violet-300',
                            glow: 'bg-purple-500',
                        },
                        {
                            iconSrc: DurationInfoIcon,
                            label: 'Durasi',
                            val: `${permit.duration} Hari`,
                            cardClass:
                                'border-white/20 bg-white/40 dark:border-white/5 dark:bg-neutral-900/40',
                            overlayClass: 'from-amber-500/12 to-transparent',
                            valueClass: 'text-amber-700 dark:text-amber-300',
                            glow: 'bg-amber-500',
                        },
                        {
                            iconSrc: SubmittedInfoIcon,
                            label: 'Diajukan',
                            val: permit.created_at,
                            cardClass:
                                'border-white/20 bg-white/40 dark:border-white/5 dark:bg-neutral-900/40',
                            overlayClass: 'from-cyan-500/12 to-transparent',
                            valueClass: 'text-cyan-700 dark:text-cyan-300',
                            glow: 'bg-cyan-500',
                        },
                    ].map((info, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            whileHover={{ y: -3 }}
                            className={cn(
                                'group relative overflow-hidden rounded-2xl border p-5 shadow-lg backdrop-blur-xl transition-all hover:shadow-xl',
                                info.cardClass,
                            )}
                        >
                            <div
                                className={cn(
                                    'absolute inset-0 bg-gradient-to-br opacity-70',
                                    info.overlayClass,
                                )}
                            />
                            <div
                                className={`absolute -top-4 -right-4 h-20 w-20 rounded-full ${info.glow} opacity-10 blur-2xl`}
                            />
                            <div className="relative">
                                <img
                                    src={info.iconSrc}
                                    alt={info.label}
                                    className="mb-3 h-11 w-11 object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
                                />
                                <p className="mb-1 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                    {info.label}
                                </p>
                                <p
                                    className={cn(
                                        'text-sm leading-tight font-bold',
                                        info.valueClass,
                                    )}
                                >
                                    {info.val}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/*            MAIN CONTENT (2 columns)                */}
                {/* ═══════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    {/* ─── Left Column (2/3) ─── */}
                    <div className="space-y-5 lg:col-span-2">
                        {/* Reason / Alasan Permohonan */}
                        <motion.div
                            variants={itemVariants}
                            className="overflow-hidden rounded-2xl border border-white/20 bg-white/40 shadow-lg backdrop-blur-xl dark:bg-neutral-900/40"
                        >
                            <div className="flex items-center gap-3 border-b border-neutral-200/50 p-5 dark:border-neutral-800">
                                <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-2">
                                    <FileText className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                        Alasan Permohonan
                                    </h3>
                                    <p className="text-[11px] text-neutral-500">
                                        Detail izin yang diajukan
                                    </p>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="relative rounded-xl border border-neutral-100 bg-neutral-50 p-5 dark:border-neutral-700/50 dark:bg-neutral-800/50">
                                    <div className="absolute top-3 left-4 text-neutral-200 dark:text-neutral-700">
                                        <svg
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                        >
                                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z" />
                                        </svg>
                                    </div>
                                    <p className="pl-8 text-sm leading-relaxed whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                                        {permit.reason}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Rejection Reason (if rejected) */}
                        {permit.rejection_reason && (
                            <motion.div
                                variants={itemVariants}
                                className="overflow-hidden rounded-2xl border border-red-200/50 bg-red-50/50 shadow-lg dark:border-red-800/30 dark:bg-red-900/10"
                            >
                                <div className="flex items-center gap-3 border-b border-red-200/50 p-5 dark:border-red-800/30">
                                    <div className="rounded-xl bg-gradient-to-r from-red-500 to-rose-600 p-2">
                                        <XCircle className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-red-700 dark:text-red-300">
                                            Alasan Penolakan
                                        </h3>
                                        <p className="text-[11px] text-red-500/70">
                                            Dosen telah menolak permohonan ini
                                        </p>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <p className="text-sm leading-relaxed text-red-700 dark:text-red-300">
                                        {permit.rejection_reason}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* AI Verification Analysis */}
                        <motion.div
                            variants={itemVariants}
                            className="overflow-hidden rounded-2xl border border-purple-200/30 bg-white/40 shadow-lg backdrop-blur-xl dark:border-purple-800/20 dark:bg-neutral-900/40"
                        >
                            <div className="flex items-center gap-3 border-b border-purple-200/50 bg-gradient-to-r from-purple-50/80 to-pink-50/80 p-5 dark:border-purple-800/30 dark:from-purple-900/15 dark:to-pink-900/15">
                                <div className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-2 shadow-lg shadow-purple-500/25">
                                    <Sparkles className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-purple-900 dark:text-purple-100">
                                        AI Verification Analysis
                                    </h3>
                                    <p className="text-[11px] text-purple-500">
                                        Analisis otomatis berbasis machine
                                        learning
                                    </p>
                                </div>
                                <div className="ml-auto">
                                    <div>
                                        <Activity className="h-4 w-4 text-purple-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-5 p-5">
                                {/* Recommendation */}
                                <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-700/50 dark:bg-neutral-800/50">
                                    <div>
                                        <p className="mb-1 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                            Rekomendasi AI
                                        </p>
                                        <p
                                            className={cn(
                                                'text-xl font-extrabold tracking-tight',
                                                permit.ai_recommendation ===
                                                    'approve'
                                                    ? 'text-emerald-600'
                                                    : permit.ai_recommendation ===
                                                        'reject'
                                                      ? 'text-red-600'
                                                      : 'text-amber-600',
                                            )}
                                        >
                                            {permit.ai_recommendation ===
                                            'approve'
                                                ? 'SETUJUI'
                                                : permit.ai_recommendation ===
                                                    'reject'
                                                  ? 'TOLAK'
                                                  : 'REVIEW MANUAL'}
                                        </p>
                                    </div>
                                    <div
                                        className={cn(
                                            'rounded-2xl p-3',
                                            permit.ai_recommendation ===
                                                'approve'
                                                ? 'bg-emerald-100 dark:bg-emerald-900/20'
                                                : permit.ai_recommendation ===
                                                    'reject'
                                                  ? 'bg-red-100 dark:bg-red-900/20'
                                                  : 'bg-amber-100 dark:bg-amber-900/20',
                                        )}
                                    >
                                        {permit.ai_recommendation ===
                                        'approve' ? (
                                            <CheckCircle className="h-8 w-8 text-emerald-500" />
                                        ) : permit.ai_recommendation ===
                                          'reject' ? (
                                            <XCircle className="h-8 w-8 text-red-500" />
                                        ) : (
                                            <Eye className="h-8 w-8 text-amber-500" />
                                        )}
                                    </div>
                                </div>

                                {/* Confidence + Document Score */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-700/50 dark:bg-neutral-800/50">
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-purple-500" />
                                                <span className="text-xs font-bold text-neutral-500">
                                                    Confidence Level
                                                </span>
                                            </div>
                                            <span
                                                className={cn(
                                                    'text-lg font-extrabold',
                                                    permit.ai_confidence >= 80
                                                        ? 'text-emerald-600'
                                                        : permit.ai_confidence >=
                                                            60
                                                          ? 'text-amber-600'
                                                          : 'text-red-600',
                                                )}
                                            >
                                                {permit.ai_confidence}%
                                            </span>
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${permit.ai_confidence}%`,
                                                }}
                                                transition={{
                                                    duration: 1.2,
                                                    ease: 'easeOut',
                                                    delay: 0.3,
                                                }}
                                                className={cn(
                                                    'h-full rounded-full',
                                                    permit.ai_confidence >= 80
                                                        ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                                                        : permit.ai_confidence >=
                                                            60
                                                          ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                                                          : 'bg-gradient-to-r from-red-400 to-rose-500',
                                                )}
                                            />
                                        </div>
                                        <p className="mt-2 text-[10px] text-neutral-400">
                                            Tingkat kepercayaan AI terhadap
                                            permohonan
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-700/50 dark:bg-neutral-800/50">
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-blue-500" />
                                                <span className="text-xs font-bold text-neutral-500">
                                                    Document Score
                                                </span>
                                            </div>
                                            <span
                                                className={cn(
                                                    'text-lg font-extrabold',
                                                    permit.document_score >= 80
                                                        ? 'text-emerald-600'
                                                        : 'text-amber-600',
                                                )}
                                            >
                                                {permit.document_score}%
                                            </span>
                                        </div>
                                        <div className="h-3 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${permit.document_score}%`,
                                                }}
                                                transition={{
                                                    duration: 1.2,
                                                    ease: 'easeOut',
                                                    delay: 0.5,
                                                }}
                                                className={cn(
                                                    'h-full rounded-full',
                                                    permit.document_score >= 80
                                                        ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                                                        : 'bg-gradient-to-r from-amber-400 to-orange-500',
                                                )}
                                            />
                                        </div>
                                        <p className="mt-2 text-[10px] text-neutral-400">
                                            Skor validitas dokumen pendukung
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* ─── Right Column (1/3) ─── */}
                    <div className="space-y-5">
                        {/* Timeline */}
                        <motion.div
                            variants={itemVariants}
                            className="overflow-hidden rounded-2xl border border-white/20 bg-white/40 shadow-lg backdrop-blur-xl dark:bg-neutral-900/40"
                        >
                            <div className="flex items-center gap-3 border-b border-neutral-200/50 p-5 dark:border-neutral-800">
                                <div className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 p-2">
                                    <Activity className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                        Timeline
                                    </h3>
                                    <p className="text-[11px] text-neutral-500">
                                        Riwayat aktivitas
                                    </p>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="relative space-y-6 pl-6">
                                    {/* Vertical line */}
                                    <div className="absolute top-2 bottom-2 left-[9px] w-0.5 rounded-full bg-gradient-to-b from-blue-500 via-purple-500 to-neutral-200 dark:to-neutral-700" />

                                    {/* Submitted */}
                                    <div className="relative">
                                        <div className="absolute top-0.5 -left-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow dark:border-neutral-950">
                                            <FileText className="h-2.5 w-2.5 text-white" />
                                        </div>
                                        <p className="text-xs font-bold text-neutral-900 dark:text-white">
                                            Diajukan
                                        </p>
                                        <p className="text-[11px] text-neutral-500">
                                            {permit.created_at}
                                        </p>
                                    </div>

                                    <div className="relative">
                                        <div
                                            className={cn(
                                                'absolute top-0.5 -left-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow dark:border-neutral-950',
                                                permit.reviewed_at
                                                    ? 'bg-indigo-500'
                                                    : 'bg-slate-400',
                                            )}
                                        >
                                            <Eye className="h-2.5 w-2.5 text-white" />
                                        </div>
                                        <p className="text-xs font-bold text-neutral-900 dark:text-white">
                                            Dibaca Dosen
                                        </p>
                                        <p className="text-[11px] text-neutral-500">
                                            {permit.reviewed_at ||
                                                'Belum dibaca'}
                                        </p>
                                    </div>

                                    {/* Reviewed Decision */}
                                    {permit.status !== 'pending' && (
                                        <div className="relative">
                                            <div
                                                className={cn(
                                                    'absolute top-0.5 -left-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow dark:border-neutral-950',
                                                    permit.status === 'approved'
                                                        ? 'bg-emerald-500'
                                                        : 'bg-red-500',
                                                )}
                                            >
                                                {permit.status ===
                                                'approved' ? (
                                                    <Check className="h-2.5 w-2.5 text-white" />
                                                ) : (
                                                    <X className="h-2.5 w-2.5 text-white" />
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-neutral-900 dark:text-white">
                                                {permit.status === 'approved'
                                                    ? 'Disetujui'
                                                    : 'Ditolak'}
                                            </p>
                                            <p className="text-[11px] text-neutral-500">
                                                {permit.approved_at || '-'}
                                            </p>
                                        </div>
                                    )}

                                    {/* Pending */}
                                    {permit.status === 'pending' && (
                                        <div className="relative">
                                            <div className="absolute top-0.5 -left-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-amber-500 shadow dark:border-neutral-950">
                                                <Clock className="h-2.5 w-2.5 text-white" />
                                            </div>
                                            <p className="text-xs font-bold text-amber-600">
                                                Menunggu Keputusan
                                            </p>
                                            <p className="text-[11px] text-neutral-500">
                                                Belum diproses
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Discussion */}
                        <motion.div
                            variants={itemVariants}
                            className="overflow-hidden rounded-2xl border border-white/20 bg-white/40 shadow-lg backdrop-blur-xl dark:bg-neutral-900/40"
                        >
                            <div className="flex items-center gap-3 border-b border-neutral-200/50 p-5 dark:border-neutral-800">
                                <div className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 p-2">
                                    <MessageSquare className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                        Diskusi Dengan Mahasiswa
                                    </h3>
                                    <p className="text-[11px] text-neutral-500">
                                        {permit.comments.length} pesan
                                    </p>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                                    {permit.comments.length > 0 ? (
                                        permit.comments.map((comment) => (
                                            <div
                                                key={comment.id}
                                                className={`rounded-xl p-3 text-sm ${
                                                    comment.is_mine
                                                        ? 'ml-5 bg-indigo-600 text-white'
                                                        : 'mr-5 border border-neutral-200 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200'
                                                }`}
                                            >
                                                <div className="mb-1 flex items-center justify-between gap-2">
                                                    <p
                                                        className={`text-xs font-semibold ${comment.is_mine ? 'text-indigo-100' : 'text-neutral-500'}`}
                                                    >
                                                        {comment.sender_name}
                                                    </p>
                                                    <p
                                                        className={`text-[10px] ${comment.is_mine ? 'text-indigo-200' : 'text-neutral-400'}`}
                                                    >
                                                        {comment.created_at}
                                                    </p>
                                                </div>
                                                <p className="whitespace-pre-wrap">
                                                    {comment.message}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-neutral-500">
                                            Belum ada diskusi. Kirim komentar
                                            untuk memberi klarifikasi ke
                                            mahasiswa.
                                        </p>
                                    )}
                                </div>

                                <div className="mt-3 flex items-end gap-2">
                                    <Textarea
                                        rows={2}
                                        value={commentMessage}
                                        onChange={(e) =>
                                            setCommentMessage(e.target.value)
                                        }
                                        placeholder="Ketik komentar untuk mahasiswa..."
                                        className="bg-white dark:bg-neutral-950"
                                    />
                                    <Button
                                        size="sm"
                                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
                                        disabled={!commentMessage.trim()}
                                        onClick={sendComment}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Attachments */}
                        <motion.div
                            variants={itemVariants}
                            className="overflow-hidden rounded-2xl border border-white/20 bg-white/40 shadow-lg backdrop-blur-xl dark:bg-neutral-900/40"
                        >
                            <div className="flex items-center gap-3 border-b border-neutral-200/50 p-5 dark:border-neutral-800">
                                <div className="rounded-xl bg-gradient-to-r from-orange-500 to-red-600 p-2">
                                    <Paperclip className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                        Lampiran
                                    </h3>
                                    <p className="text-[11px] text-neutral-500">
                                        Dokumen pendukung
                                    </p>
                                </div>
                            </div>
                            <div className="p-5">
                                {permit.attachments.length > 0 ? (
                                    <div className="space-y-2">
                                        {permit.attachments.map((att, i) => (
                                            <a
                                                key={i}
                                                href={att.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-center gap-3 rounded-xl border border-neutral-200/50 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-700/50 dark:hover:bg-neutral-800/50"
                                            >
                                                <div className="rounded-lg bg-indigo-50 p-2 text-indigo-500 transition-colors group-hover:bg-indigo-100 dark:bg-indigo-900/20">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                                                        {att.name}
                                                    </p>
                                                    <p className="text-[10px] text-neutral-400">
                                                        Klik untuk preview
                                                    </p>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-neutral-300 transition-colors group-hover:text-indigo-500" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-6 text-center text-neutral-400">
                                        <Paperclip className="mx-auto mb-2 h-8 w-8 opacity-30" />
                                        <p className="text-sm">
                                            Tidak ada lampiran
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Quick Info */}
                        <motion.div
                            variants={itemVariants}
                            className="overflow-hidden rounded-2xl border border-white/20 bg-white/40 shadow-lg backdrop-blur-xl dark:bg-neutral-900/40"
                        >
                            <div className="flex items-center gap-3 border-b border-neutral-200/50 p-5 dark:border-neutral-800">
                                <div className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 p-2">
                                    <Info className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                        Info Tambahan
                                    </h3>
                                    <p className="text-[11px] text-neutral-500">
                                        Detail permohonan
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3 p-5">
                                {[
                                    {
                                        label: 'Jenis',
                                        val: tc.label,
                                        icon: Shield,
                                    },
                                    {
                                        label: 'Periode',
                                        val: fmtDateRange(
                                            permit.start_date,
                                            permit.end_date,
                                        ),
                                        icon: Calendar,
                                    },
                                    {
                                        label: 'Sesi',
                                        val: permit.session.tanggal_display,
                                        icon: Clock,
                                    },
                                ].map((info, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                    >
                                        <info.icon className="h-4 w-4 flex-shrink-0 text-neutral-400" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                                {info.label}
                                            </p>
                                            <p className="truncate text-xs font-semibold text-neutral-900 dark:text-white">
                                                {info.val}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ═══ Sticky Action Bar for Pending (Mobile) ═══ */}
                {permit.status === 'pending' && (
                    <motion.div
                        variants={itemVariants}
                        className="fixed right-0 bottom-0 left-0 z-40 border-t border-neutral-200 bg-white/80 p-4 backdrop-blur-xl md:hidden dark:border-neutral-800 dark:bg-neutral-950/80"
                    >
                        <div className="flex gap-3">
                            <Button
                                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                                onClick={doApprove}
                                disabled={processingId === permit.id}
                            >
                                <Check className="mr-2 h-4 w-4" /> Setujui
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 border-red-200 text-red-600"
                                onClick={() => setIsRejectOpen(true)}
                                disabled={processingId === permit.id}
                            >
                                <X className="mr-2 h-4 w-4" /> Tolak
                            </Button>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* ═══ Rejection Dialog ═══ */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-neutral-950">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
                                <XCircle className="h-5 w-5 text-red-500" />
                            </div>
                            Alasan Penolakan
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={permit.mahasiswa.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white">
                                {permit.mahasiswa.nama[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-semibold">
                                {permit.mahasiswa.nama}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                                {permit.mahasiswa.nim}
                            </p>
                        </div>
                    </div>
                    <Textarea
                        placeholder="Tuliskan alasan penolakan izin..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                        className="resize-none"
                    />
                    <DialogFooter className="gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setIsRejectOpen(false);
                                setRejectionReason('');
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={doReject}
                            disabled={!rejectionReason || processingId !== null}
                        >
                            <X className="mr-2 h-4 w-4" /> Kirim Penolakan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DosenLayout>
    );
}
