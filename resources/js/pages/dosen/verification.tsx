import DisetujuiIcon from '@/assets/admin/verifikasi-selfie/disetujui.png';
import DitolakSelfieIcon from '@/assets/admin/verifikasi-selfie/ditolak.png';
import PendingIcon from '@/assets/admin/verifikasi-selfie/pending.png';
import TotalSelfieIcon from '@/assets/admin/verifikasi-selfie/total-selfie.png';
import SelfieIcon from '@/assets/admin/verifikasi-selfie/verifikasi-selfie.png';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DosenLayout from '@/layouts/dosen-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Bot,
    Camera,
    Check,
    CheckCircle,
    Clock,
    Download,
    Eye,
    Grid3x3,
    List,
    RefreshCw,
    Search,
    Smartphone,
    Sparkles,
    User,
    X,
    XCircle,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

/* ═══════════════════════════ TYPES ═══════════════════════════ */
interface Mahasiswa {
    id: number;
    nama: string;
    nim: string;
    avatar_url: string | null;
    email: string;
    phone: string;
}

interface Verification {
    id: number;
    mahasiswa: Mahasiswa;
    selfie_url: string | null;
    course: string;
    meeting_number: number;
    status: 'pending' | 'approved' | 'rejected';
    submitted_at: string;
    date_display: string;
    time_display: string;
    distance: number;
    device_type: string;
    ai_confidence: number;
    is_suspicious: boolean;
    face_match_score: number;
    rejection_reason: string | null;
    verified_by: string | null;
    verified_at: string | null;
}

interface Stats {
    total: number;
    pending: number;
    approved_today: number;
    rejected: number;
    today: number;
    ai_verified: number;
    suspicious: number;
    face_match_rate: number;
    location_valid: number;
    device_trusted: number;
    avg_response_time: number;
}

interface PageProps {
    verifications: Verification[];
    stats: Stats;
}

/* ═══════════════════════════ VARIANTS ═══════════════════════════ */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
} as const;

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
    },
    hover: {
        scale: 1.03,
        y: -8,
        transition: { type: 'spring' as const, stiffness: 400, damping: 10 },
    },
} as const;

/* ═══════════════════════════ COMPONENT ═══════════════════════════ */
export default function VerificationPage({ verifications, stats }: PageProps) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectTarget, setRejectTarget] = useState<Verification | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);

    const filtered = useMemo(() => {
        return verifications.filter((v) => {
            const matchSearch =
                v.mahasiswa.nama
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                v.mahasiswa.nim.includes(searchQuery);
            const matchStatus =
                filterStatus === 'all' || v.status === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [verifications, searchQuery, filterStatus]);

    const doApprove = (v: Verification) => {
        setProcessingId(v.id);
        router.patch(
            `/dosen/verification/${v.id}/approve`,
            {},
            {
                onFinish: () => setProcessingId(null),
            },
        );
    };

    const openReject = (v: Verification) => {
        setRejectTarget(v);
        setRejectReason('');
        setShowRejectDialog(true);
    };
    const doReject = () => {
        if (!rejectTarget) return;
        setProcessingId(rejectTarget.id);
        router.patch(
            `/dosen/verification/${rejectTarget.id}/reject`,
            { reason: rejectReason },
            {
                onSuccess: () => {
                    setShowRejectDialog(false);
                    setRejectTarget(null);
                },
                onFinish: () => setProcessingId(null),
            },
        );
    };

    const statusBadge = (status: string) => {
        if (status === 'approved')
            return (
                <Badge className="gap-1 border-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                    <CheckCircle className="h-3 w-3" /> Disetujui
                </Badge>
            );
        if (status === 'rejected')
            return (
                <Badge className="gap-1 border-0 bg-gradient-to-r from-red-500 to-rose-500 text-white">
                    <XCircle className="h-3 w-3" /> Ditolak
                </Badge>
            );
        return (
            <Badge className="gap-1 border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Clock className="h-3 w-3" /> Pending
            </Badge>
        );
    };

    const confidenceColor = (c: number) =>
        c >= 85
            ? 'text-emerald-600'
            : c >= 70
              ? 'text-amber-600'
              : 'text-red-600';
    const confidenceBg = (c: number) =>
        c >= 85 ? 'bg-emerald-500' : c >= 70 ? 'bg-amber-500' : 'bg-red-500';

    /* ═══ Card data for summary row ═══ */
    /* ═══ Card data for summary row ═══ */
    const summaryCards = [
        {
            key: 'total',
            label: 'Total Verifikasi',
            value: stats.total,
            sub: 'Total data masuk',
            imgSrc: TotalSelfieIcon,
            gradient: 'from-blue-400 to-indigo-600',
            glow: 'bg-blue-500',
            shadow: 'hover:shadow-blue-500/10',
        },
        {
            key: 'pending',
            label: 'Pending Review',
            value: stats.pending,
            sub: 'Perlu tinjauan',
            imgSrc: PendingIcon,
            gradient: 'from-amber-400 to-orange-600',
            glow: 'bg-amber-500',
            shadow: 'hover:shadow-amber-500/10',
        },
        {
            key: 'approved',
            label: 'Disetujui',
            value: stats.approved_today,
            sub: 'Hari ini',
            imgSrc: DisetujuiIcon,
            gradient: 'from-emerald-400 to-teal-600',
            glow: 'bg-emerald-500',
            shadow: 'hover:shadow-emerald-500/10',
        },
        {
            key: 'rejected',
            label: 'Ditolak',
            value: stats.rejected,
            sub: 'Ditolak sistem/dosen',
            imgSrc: DitolakSelfieIcon,
            gradient: 'from-red-400 to-rose-600',
            glow: 'bg-red-500',
            shadow: 'hover:shadow-red-500/10',
        },
    ];

    return (
        <DosenLayout>
            <Head title="Verifikasi Selfie" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-4 md:p-6"
            >
                {/* ═══════════════════ HERO HEADER ═══════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:items-start">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left lg:w-auto">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
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
                                >
                                    <img
                                        src={SelfieIcon}
                                        alt="Verifikasi"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Verifikasi Kehadiran
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Selfie Mahasiswa
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 max-w-lg text-sm leading-relaxed text-indigo-100/80"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        AI-Powered Face Recognition & Fraud
                                        Detection System
                                    </motion.p>
                                </div>
                            </div>

                            <div className="mt-2 flex w-full flex-col items-center gap-3 lg:mt-0 lg:w-auto lg:items-end">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-wrap justify-center gap-2"
                                >
                                    {[
                                        { icon: Zap, label: 'Quick Verify' },
                                        { icon: Bot, label: 'Auto Verify' },
                                        { icon: Download, label: 'Export' },
                                        {
                                            icon: RefreshCw,
                                            label: 'Refresh',
                                            onClick: () => router.reload(),
                                        },
                                    ].map((btn, i) => (
                                        <motion.button
                                            key={i}
                                            whileHover={{
                                                scale: 1.02,
                                                backgroundColor:
                                                    'rgba(255,255,255,0.25)',
                                            }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={btn.onClick}
                                            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30"
                                        >
                                            <btn.icon className="h-4 w-4" />{' '}
                                            {btn.label}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════════════════ SUMMARY CARDS ═══════════════════ */}
                <motion.div
                    className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.04,
                                delayChildren: 0.2,
                            },
                        },
                    }}
                >
                    {summaryCards.map((card, i) => {
                        const colorMap: Record<string, any> = {
                            'bg-blue-500': {
                                from: 'from-blue-400',
                                to: 'to-indigo-600',
                                gradientBg: 'from-blue-500/5 to-indigo-500/5',
                                hoverShadow: 'hover:shadow-blue-500/10',
                            },
                            'bg-amber-500': {
                                from: 'from-amber-400',
                                to: 'to-orange-600',
                                gradientBg: 'from-amber-500/5 to-orange-500/5',
                                hoverShadow: 'hover:shadow-amber-500/10',
                            },
                            'bg-emerald-500': {
                                from: 'from-emerald-400',
                                to: 'to-teal-600',
                                gradientBg: 'from-emerald-500/5 to-teal-500/5',
                                hoverShadow: 'hover:shadow-emerald-500/10',
                            },
                            'bg-red-500': {
                                from: 'from-red-400',
                                to: 'to-rose-600',
                                gradientBg: 'from-red-500/5 to-rose-500/5',
                                hoverShadow: 'hover:shadow-red-500/10',
                            },
                        };
                        const cc =
                            colorMap[card.glow] || colorMap['bg-blue-500'];
                        return (
                            <motion.div
                                key={card.key}
                                variants={{
                                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        transition: {
                                            type: 'spring',
                                            stiffness: 100,
                                            damping: 15,
                                        },
                                    },
                                }}
                                whileHover={{
                                    y: -5,
                                    scale: 1.02,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 25,
                                    },
                                }}
                                onHoverStart={() => setHoveredCard(card.key)}
                                onHoverEnd={() => setHoveredCard(null)}
                                className={cn(
                                    `group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-5 dark:border-white/5 dark:bg-neutral-900/40`,
                                    cc.hoverShadow,
                                )}
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${cc.gradientBg} opacity-50 dark:opacity-100`}
                                />
                                <motion.div
                                    className={cn(
                                        `absolute -top-8 -right-8 h-28 w-28 rounded-full blur-3xl transition-all`,
                                        card.glow,
                                    )}
                                    animate={{
                                        opacity:
                                            hoveredCard === card.key
                                                ? 0.4
                                                : 0.15,
                                    }}
                                />
                                <div className="relative z-10 flex h-full flex-col items-center justify-between gap-3 sm:items-start">
                                    <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-3 sm:text-left">
                                        <motion.div
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 10,
                                            }}
                                            className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-12 sm:w-12"
                                        >
                                            <img
                                                src={card.imgSrc}
                                                alt={card.label}
                                                className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                            />
                                        </motion.div>
                                        <div>
                                            <p className="text-[10px] font-medium text-neutral-500 sm:text-xs dark:text-neutral-400">
                                                {card.label}
                                            </p>
                                            <span className="text-xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
                                                {card.value}
                                            </span>
                                            <p className="mt-0.5 hidden text-[10px] text-neutral-400 sm:block">
                                                {card.sub}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══════════════════ FILTERS & SEARCH ═══════════════════ */}
                {/* ═══════════════════ FILTERS & SEARCH ═══════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[200px] flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <Input
                                placeholder="Cari mahasiswa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 rounded-xl border-white/20 bg-white/60 pl-10 dark:bg-neutral-800/60"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            {[
                                { value: 'all', label: 'Semua' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'approved', label: 'Disetujui' },
                                { value: 'rejected', label: 'Ditolak' },
                            ].map((f) => (
                                <Button
                                    key={f.value}
                                    size="sm"
                                    variant={
                                        filterStatus === f.value
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() => setFilterStatus(f.value)}
                                    className={cn(
                                        'h-9 rounded-xl text-xs',
                                        filterStatus === f.value &&
                                            'border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white',
                                    )}
                                >
                                    {f.label}
                                </Button>
                            ))}
                        </div>

                        <div className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/30 p-1 dark:bg-neutral-800/30">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    'h-8 w-8 rounded-lg p-0',
                                    viewMode === 'grid' &&
                                        'bg-white shadow dark:bg-neutral-700',
                                )}
                            >
                                <Grid3x3 className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    'h-8 w-8 rounded-lg p-0',
                                    viewMode === 'list' &&
                                        'bg-white shadow dark:bg-neutral-700',
                                )}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════════════════ VERIFICATION LIST ═══════════════════ */}
                <motion.div variants={containerVariants}>
                    {filtered.length === 0 ? (
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 py-16 text-center backdrop-blur-xl dark:bg-neutral-900/40"
                        >
                            <Camera className="mx-auto mb-4 h-16 w-16 text-neutral-300" />
                            <p className="text-lg font-semibold text-neutral-500">
                                Tidak ada data verifikasi
                            </p>
                            <p className="mt-1 text-sm text-neutral-400">
                                Belum ada selfie yang perlu diverifikasi
                            </p>
                        </motion.div>
                    ) : viewMode === 'grid' ? (
                        /* ─── GRID VIEW ─── */
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filtered.map((v, idx) => (
                                <motion.div
                                    key={v.id}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover="hover"
                                    transition={{ delay: idx * 0.05 }}
                                    className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40"
                                >
                                    <div className="space-y-4 p-5">
                                        {/* Student Info */}
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12 flex-shrink-0 border-2 border-white shadow-md ring-2 ring-neutral-100 dark:border-neutral-800 dark:ring-neutral-800">
                                                <AvatarImage
                                                    src={
                                                        v.mahasiswa
                                                            .avatar_url ||
                                                        undefined
                                                    }
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-sm font-bold text-white">
                                                    {v.mahasiswa.nama[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                                                    {v.mahasiswa.nama}
                                                </p>
                                                <p className="text-[11px] text-neutral-500">
                                                    {v.mahasiswa.nim}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                {statusBadge(v.status)}
                                                {v.is_suspicious && (
                                                    <Badge className="gap-1 border-0 bg-orange-100 text-[9px] text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                                        <AlertTriangle className="h-2.5 w-2.5" />{' '}
                                                        Suspicious
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Selfie Preview */}
                                        <div
                                            className="relative h-40 cursor-pointer overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800"
                                            onClick={() =>
                                                router.visit(
                                                    `/dosen/verification/${v.id}`,
                                                )
                                            }
                                        >
                                            {v.selfie_url ? (
                                                <img
                                                    src={v.selfie_url}
                                                    alt="Selfie"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <Camera className="h-10 w-10 text-neutral-300" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/40 to-transparent pb-3 opacity-0 transition-opacity group-hover:opacity-100">
                                                <span className="flex items-center gap-1 text-xs font-semibold text-white">
                                                    <Eye className="h-3.5 w-3.5" />{' '}
                                                    Lihat Detail
                                                </span>
                                            </div>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800/50">
                                                <p className="text-[9px] font-bold text-neutral-400 uppercase">
                                                    Mata Kuliah
                                                </p>
                                                <p className="truncate text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                                    {v.course}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800/50">
                                                <p className="text-[9px] font-bold text-neutral-400 uppercase">
                                                    Jarak
                                                </p>
                                                <p
                                                    className={cn(
                                                        'text-xs font-semibold',
                                                        v.distance <= 100
                                                            ? 'text-emerald-600'
                                                            : v.distance <= 500
                                                              ? 'text-amber-600'
                                                              : 'text-red-600',
                                                    )}
                                                >
                                                    {v.distance}m
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800/50">
                                                <p className="text-[9px] font-bold text-neutral-400 uppercase">
                                                    AI Confidence
                                                </p>
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles className="h-3 w-3 text-purple-500" />
                                                    <span
                                                        className={cn(
                                                            'text-xs font-bold',
                                                            confidenceColor(
                                                                v.ai_confidence,
                                                            ),
                                                        )}
                                                    >
                                                        {v.ai_confidence}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800/50">
                                                <p className="text-[9px] font-bold text-neutral-400 uppercase">
                                                    Face Match
                                                </p>
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3 w-3 text-indigo-500" />
                                                    <span
                                                        className={cn(
                                                            'text-xs font-bold',
                                                            confidenceColor(
                                                                v.face_match_score,
                                                            ),
                                                        )}
                                                    >
                                                        {v.face_match_score}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Time & Device */}
                                        <div className="flex items-center justify-between text-[10px] text-neutral-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />{' '}
                                                {v.date_display}{' '}
                                                {v.time_display}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Smartphone className="h-3 w-3" />{' '}
                                                {v.device_type}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        {v.status === 'pending' && (
                                            <div className="flex gap-2 border-t border-neutral-100 pt-2 dark:border-neutral-800">
                                                <Button
                                                    size="sm"
                                                    onClick={() => doApprove(v)}
                                                    disabled={
                                                        processingId === v.id
                                                    }
                                                    className="h-9 flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-xs text-white shadow-lg"
                                                >
                                                    <Check className="mr-1 h-3.5 w-3.5" />{' '}
                                                    Setujui
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        openReject(v)
                                                    }
                                                    disabled={
                                                        processingId === v.id
                                                    }
                                                    className="h-9 border-red-200 text-xs text-red-600 hover:bg-red-50 dark:border-red-800/30"
                                                >
                                                    <X className="mr-1 h-3.5 w-3.5" />{' '}
                                                    Tolak
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.visit(
                                                            `/dosen/verification/${v.id}`,
                                                        )
                                                    }
                                                    className="h-9 text-xs"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                        {v.status !== 'pending' && (
                                            <div className="flex gap-2 border-t border-neutral-100 pt-2 dark:border-neutral-800">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.visit(
                                                            `/dosen/verification/${v.id}`,
                                                        )
                                                    }
                                                    className="h-9 flex-1 text-xs"
                                                >
                                                    <Eye className="mr-1 h-3.5 w-3.5" />{' '}
                                                    Detail
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        /* ─── LIST VIEW ─── */
                        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-950/50">
                                            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                                Mahasiswa
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                                Mata Kuliah
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                                Jarak
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                                AI
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                                Face
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                                Waktu
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {filtered.map((v, i) => (
                                            <motion.tr
                                                key={v.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.02 }}
                                                className={cn(
                                                    'cursor-pointer transition-colors hover:bg-white/60 dark:hover:bg-neutral-800/40',
                                                    v.is_suspicious &&
                                                        'bg-orange-50/30 dark:bg-orange-900/5',
                                                )}
                                                onClick={() =>
                                                    router.visit(
                                                        `/dosen/verification/${v.id}`,
                                                    )
                                                }
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage
                                                                src={
                                                                    v.mahasiswa
                                                                        .avatar_url ||
                                                                    undefined
                                                                }
                                                            />
                                                            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-[10px] text-white">
                                                                {
                                                                    v.mahasiswa
                                                                        .nama[0]
                                                                }
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-semibold">
                                                                {
                                                                    v.mahasiswa
                                                                        .nama
                                                                }
                                                            </p>
                                                            <p className="text-[11px] text-neutral-500">
                                                                {
                                                                    v.mahasiswa
                                                                        .nim
                                                                }
                                                            </p>
                                                        </div>
                                                        {v.is_suspicious && (
                                                            <AlertTriangle className="h-3.5 w-3.5 animate-pulse text-orange-500" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-neutral-600 dark:text-neutral-400">
                                                    {v.course}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={cn(
                                                            'text-xs font-bold',
                                                            v.distance <= 100
                                                                ? 'text-emerald-600'
                                                                : v.distance <=
                                                                    500
                                                                  ? 'text-amber-600'
                                                                  : 'text-red-600',
                                                        )}
                                                    >
                                                        {v.distance}m
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={cn(
                                                            'text-xs font-bold',
                                                            confidenceColor(
                                                                v.ai_confidence,
                                                            ),
                                                        )}
                                                    >
                                                        {v.ai_confidence}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span
                                                        className={cn(
                                                            'text-xs font-bold',
                                                            confidenceColor(
                                                                v.face_match_score,
                                                            ),
                                                        )}
                                                    >
                                                        {v.face_match_score}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {statusBadge(v.status)}
                                                </td>
                                                <td className="px-4 py-3 text-xs whitespace-nowrap text-neutral-500">
                                                    {v.date_display}{' '}
                                                    {v.time_display}
                                                </td>
                                                <td
                                                    className="px-4 py-3"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <div className="flex items-center justify-center gap-1">
                                                        {v.status ===
                                                            'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    className="h-7 bg-gradient-to-r from-emerald-500 to-teal-600 px-2 text-white"
                                                                    onClick={() =>
                                                                        doApprove(
                                                                            v,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processingId ===
                                                                        v.id
                                                                    }
                                                                >
                                                                    <Check className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    className="h-7 px-2"
                                                                    onClick={() =>
                                                                        openReject(
                                                                            v,
                                                                        )
                                                                    }
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 px-2"
                                                            onClick={() =>
                                                                router.visit(
                                                                    `/dosen/verification/${v.id}`,
                                                                )
                                                            }
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* ═══════════════════ REJECT DIALOG ═══════════════════ */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-neutral-950">
                    <DialogHeader>
                        <div className="relative -m-6 mb-4 overflow-hidden rounded-t-xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 p-6">
                            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                            <div className="relative">
                                <DialogTitle className="flex items-center gap-3 text-xl text-white">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                        <XCircle className="h-5 w-5" />
                                    </div>
                                    Tolak Verifikasi
                                </DialogTitle>
                            </div>
                        </div>
                    </DialogHeader>
                    {rejectTarget && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
                                        {rejectTarget.mahasiswa.nama[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-semibold">
                                        {rejectTarget.mahasiswa.nama}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        {rejectTarget.mahasiswa.nim}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <Label>Alasan Penolakan</Label>
                                <Textarea
                                    value={rejectReason}
                                    onChange={(e) =>
                                        setRejectReason(e.target.value)
                                    }
                                    placeholder="Jelaskan alasan penolakan..."
                                    rows={3}
                                />
                            </div>
                            <DialogFooter className="gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowRejectDialog(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={doReject}
                                    disabled={
                                        !rejectReason ||
                                        processingId === rejectTarget.id
                                    }
                                    className="bg-gradient-to-r from-red-500 to-rose-600 text-white"
                                >
                                    <XCircle className="mr-2 h-4 w-4" /> Tolak
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DosenLayout>
    );
}
