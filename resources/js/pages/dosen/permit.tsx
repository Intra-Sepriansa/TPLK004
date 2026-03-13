import TotalTugasIcon from '@/assets/admin/informasi-tugas/total-tugas.png';
import DisetujuiIcon from '@/assets/admin/verifikasi-selfie/disetujui.png';
import PendingIcon from '@/assets/admin/verifikasi-selfie/pending.png';
import DitolakIcon from '@/assets/admin/voting-kas/ditolak.png';
import PersetujuanIzinIcon from '@/assets/dosen/izin-sakit/persetujuan-izin.png';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DosenLayout from '@/layouts/dosen-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    BookOpen,
    Calendar,
    Check,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    FileText,
    Heart,
    LayoutGrid,
    List,
    Search,
    Sparkles,
    X,
    XCircle,
} from 'lucide-react';
import moment from 'moment';
import { useCallback, useMemo, useState } from 'react';

/* ═══════════════════════════════════════════════════ */
/*                     TYPES                          */
/* ═══════════════════════════════════════════════════ */
type Permit = {
    id: number;
    mahasiswa: { id: number; nama: string; nim: string; avatar?: string };
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
};
type Session = {
    id: number;
    mata_kuliah: string;
    tanggal: string;
    tanggal_display: string;
};
type Stats = {
    total: number;
    pending: number;
    approved_today: number;
    rejected: number;
    auto_approved: number;
    sick_leave: number;
    family_emergency: number;
    official_event: number;
    suspicious: number;
    avg_response_time: number;
};
type Props = {
    permits: Permit[];
    sessions: Session[];
    stats: Stats;
    filters: any;
};

/* ═══════════════════════════════════════════════════ */
/*              ANIMATION VARIANTS                    */
/* ═══════════════════════════════════════════════════ */
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
};
const cardHover = {
    scale: 1.03,
    y: -6,
    transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
};
const viewTransition = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.25 },
};

/* ═══════════════════════════════════════════════════ */
/*                   HELPERS                          */
/* ═══════════════════════════════════════════════════ */
const fmtDateRange = (s: string, e: string) =>
    s === e
        ? moment(s).format('DD MMM YYYY')
        : `${moment(s).format('DD MMM')} – ${moment(e).format('DD MMM YYYY')}`;
const fmtRelative = (d: string) => moment(d, 'DD MMM YYYY HH:mm').fromNow();

/* ═══════════════════════════════════════════════════ */
/*                 MAIN COMPONENT                     */
/* ═══════════════════════════════════════════════════ */
export default function PermitPage({
    permits: initialPermits,
    sessions,
    stats,
    filters,
}: Props) {
    const [permits, setPermits] = useState(initialPermits);
    const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'calendar'>(
        'kanban',
    );
    const [search, setSearch] = useState('');
    const [selectedSession, setSelectedSession] = useState(
        filters?.session_id?.toString() || 'all',
    );
    const [selectedType, setSelectedType] = useState('all');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [detailPermit, setDetailPermit] = useState<Permit | null>(null);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [currentMonth, setCurrentMonth] = useState(moment());
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    /* ── Filtered Data ── */
    const filtered = useMemo(
        () =>
            permits.filter((p) => {
                const s = search.toLowerCase();
                return (
                    (p.mahasiswa.nama.toLowerCase().includes(s) ||
                        p.mahasiswa.nim.includes(s)) &&
                    (selectedSession === 'all' ||
                        p.session.id.toString() === selectedSession) &&
                    (selectedType === 'all' || p.type === selectedType)
                );
            }),
        [permits, search, selectedSession, selectedType],
    );

    const pending = useMemo(
        () => filtered.filter((p) => p.status === 'pending'),
        [filtered],
    );
    const approved = useMemo(
        () => filtered.filter((p) => p.status === 'approved'),
        [filtered],
    );
    const rejected = useMemo(
        () => filtered.filter((p) => p.status === 'rejected'),
        [filtered],
    );

    /* ── Actions ── */
    const doApprove = useCallback((permit: Permit) => {
        setProcessingId(permit.id);
        router.patch(
            `/dosen/permits/${permit.id}/approve`,
            {},
            {
                onSuccess: () => {
                    setPermits((prev) =>
                        prev.map((p) =>
                            p.id === permit.id
                                ? { ...p, status: 'approved' as const }
                                : p,
                        ),
                    );
                    setProcessingId(null);
                    setDetailPermit(null);
                },
                onError: () => setProcessingId(null),
            },
        );
    }, []);

    const openReject = useCallback((permit: Permit) => {
        setDetailPermit(permit);
        setIsRejectOpen(true);
    }, []);

    const doReject = useCallback(() => {
        if (!detailPermit || !rejectionReason) return;
        setProcessingId(detailPermit.id);
        router.patch(
            `/dosen/permits/${detailPermit.id}/reject`,
            { rejection_reason: rejectionReason },
            {
                onSuccess: () => {
                    setPermits((prev) =>
                        prev.map((p) =>
                            p.id === detailPermit.id
                                ? {
                                      ...p,
                                      status: 'rejected' as const,
                                      rejection_reason: rejectionReason,
                                  }
                                : p,
                        ),
                    );
                    setProcessingId(null);
                    setDetailPermit(null);
                    setIsRejectOpen(false);
                    setRejectionReason('');
                },
                onError: () => setProcessingId(null),
            },
        );
    }, [detailPermit, rejectionReason]);

    const doBulkApprove = useCallback(() => {
        if (!selectedIds.length) return;
        router.post(
            '/dosen/permits/bulk-approve',
            { permit_ids: selectedIds },
            {
                onSuccess: () => {
                    setPermits((prev) =>
                        prev.map((p) =>
                            selectedIds.includes(p.id)
                                ? { ...p, status: 'approved' as const }
                                : p,
                        ),
                    );
                    setSelectedIds([]);
                },
            },
        );
    }, [selectedIds]);

    const toggleId = (id: number) =>
        setSelectedIds((p) =>
            p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
        );

    /* ── Badges ── */
    const typeBadge = (t: string) =>
        t === 'sakit' ? (
            <Badge className="border-pink-500/20 bg-pink-500/10 text-pink-600 dark:text-pink-400">
                <Heart className="mr-1 h-3 w-3" /> Sakit
            </Badge>
        ) : (
            <Badge className="border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <FileText className="mr-1 h-3 w-3" /> Izin
            </Badge>
        );

    const statusBadge = (s: string) => {
        if (s === 'approved')
            return (
                <Badge className="bg-emerald-500 text-white">
                    <CheckCircle className="mr-1 h-3 w-3" /> Disetujui
                </Badge>
            );
        if (s === 'rejected')
            return (
                <Badge className="bg-red-500 text-white">
                    <XCircle className="mr-1 h-3 w-3" /> Ditolak
                </Badge>
            );
        return (
            <Badge className="bg-amber-500 text-white">
                <Clock className="mr-1 h-3 w-3" /> Menunggu
            </Badge>
        );
    };

    /* ── Summary Cards (4 Essential) ── */
    const cards = [
        {
            key: 'total',
            label: 'Total Perizinan',
            val: stats.total,
            sub: `${stats.total} bulan ini`,
            imgSrc: TotalTugasIcon,
            grad: 'from-blue-500 to-indigo-600',
            glow: 'bg-blue-500',
            overlay:
                'from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10',
        },
        {
            key: 'pending',
            label: 'Menunggu Review',
            val: stats.pending,
            sub: 'perlu review segera',
            imgSrc: PendingIcon,
            grad: 'from-amber-500 to-orange-600',
            glow: 'bg-amber-500',
            overlay:
                'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
            pulse: stats.pending > 0,
        },
        {
            key: 'approved',
            label: 'Disetujui Hari Ini',
            val: stats.approved_today,
            sub: `dari ${stats.total} request`,
            imgSrc: DisetujuiIcon,
            grad: 'from-emerald-500 to-teal-600',
            glow: 'bg-emerald-500',
            overlay:
                'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
        },
        {
            key: 'rejected',
            label: 'Ditolak',
            val: stats.rejected,
            sub: 'dengan alasan',
            imgSrc: DitolakIcon,
            grad: 'from-red-500 to-rose-600',
            glow: 'bg-red-500',
            overlay:
                'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10',
        },
    ];

    /* ── Calendar ── */
    const calDays = useMemo(() => {
        const s = moment(currentMonth).startOf('month').startOf('week');
        return Array.from({ length: 42 }, (_, i) => moment(s).add(i, 'days'));
    }, [currentMonth]);
    const permitsOnDay = (d: moment.Moment) =>
        filtered.filter((p) => p.start_date === d.format('YYYY-MM-DD'));

    /* ═══════════════════════════════════════════════════ */
    /*                    RENDER                          */
    /* ═══════════════════════════════════════════════════ */
    return (
        <DosenLayout>
            <Head title="Persetujuan Izin" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-5 p-4 md:p-6"
            >
                {/* ════════════════ HEADER ════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative min-h-[170px] overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:min-h-[190px] sm:p-8 md:min-h-[200px] md:p-10 lg:p-12"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    {/* Decorative orbs */}
                    <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl sm:h-72 sm:w-72" />
                    <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-pink-400/10 blur-3xl sm:h-72 sm:w-72" />
                    <div className="absolute top-1/2 left-1/3 hidden h-48 w-48 rounded-full bg-indigo-300/10 blur-3xl sm:block" />
                    {/* Animated pulse rings */}
                    {/* Grid pattern overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                        }}
                    />
                    <div className="relative z-10 flex flex-col gap-5 sm:gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex w-full items-start gap-4 sm:items-center sm:gap-5">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="relative flex h-16 w-16 shrink-0 items-center justify-center sm:h-20 sm:w-20 md:h-24 md:w-24"
                            >
                                <img
                                    src={PersetujuanIzinIcon}
                                    alt="Izin"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
                                />
                            </motion.div>
                            <div className="space-y-1 sm:space-y-1.5">
                                <p className="text-[10px] font-semibold tracking-[0.2em] text-indigo-200 uppercase sm:text-xs md:text-sm md:tracking-widest">
                                    Manajemen Perizinan
                                </p>
                                <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl md:text-3xl lg:text-4xl">
                                    Persetujuan Izin
                                </h1>
                                <p className="max-w-xl text-xs leading-relaxed text-indigo-100/80 sm:text-sm md:text-base">
                                    Kelola permohonan izin mahasiswa dengan
                                    sistem verifikasi AI terintegrasi
                                </p>
                            </div>
                        </div>
                        <div className="flex w-full flex-nowrap items-center gap-2 sm:gap-3 md:w-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, type: 'spring' }}
                                className="flex h-11 flex-1 items-center justify-between gap-2 rounded-xl border border-white/20 bg-white/15 px-3 shadow-lg backdrop-blur-xl sm:h-12 sm:px-4 md:flex-none md:justify-start"
                            >
                                <div className="rounded-lg bg-white/15 p-1.5 backdrop-blur-sm">
                                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </div>
                                <p className="text-[10px] font-semibold tracking-wide text-indigo-200">
                                    AI Accuracy
                                </p>
                                <p className="text-sm font-extrabold tracking-tight sm:text-base">
                                    94
                                    <span className="text-[10px] font-bold text-indigo-200 sm:text-xs">
                                        %
                                    </span>
                                </p>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7, type: 'spring' }}
                                className="flex h-11 flex-1 items-center justify-between gap-2 rounded-xl border border-white/20 bg-white/15 px-3 shadow-lg backdrop-blur-xl sm:h-12 sm:px-4 md:flex-none md:justify-start"
                            >
                                <div className="rounded-lg bg-white/15 p-1.5 backdrop-blur-sm">
                                    <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </div>
                                <p className="text-[10px] font-semibold tracking-wide text-indigo-200">
                                    Response
                                </p>
                                <p className="text-sm font-extrabold tracking-tight sm:text-base">
                                    {stats.avg_response_time}
                                    <span className="text-[10px] font-bold text-indigo-200 sm:text-xs">
                                        h
                                    </span>
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* ════════════════ SUMMARY CARDS ════════════════ */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 gap-4 lg:grid-cols-4"
                >
                    {cards.map((c) => (
                        <motion.div
                            key={c.key}
                            variants={itemVariants}
                            whileHover={cardHover}
                            onHoverStart={() => setHoveredCard(c.key)}
                            onHoverEnd={() => setHoveredCard(null)}
                            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-5 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${c.overlay}`}
                            />
                            <motion.div
                                animate={{
                                    scale: hoveredCard === c.key ? 1.5 : 1,
                                    opacity: hoveredCard === c.key ? 0.4 : 0.15,
                                }}
                                className={`absolute -top-8 -right-8 h-28 w-28 rounded-full ${c.glow} blur-3xl transition-all duration-500`}
                            />
                            <div className="relative flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    className="relative flex h-12 w-12 shrink-0 items-center justify-center"
                                >
                                    <img
                                        src={c.imgSrc}
                                        alt={c.label}
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-xl"
                                    />
                                </motion.div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                        {c.label}
                                    </p>
                                    <div className="mt-0.5 flex items-center gap-2">
                                        <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                            {c.val}
                                        </span>
                                        {c.pulse && (
                                            <span className="relative flex h-2 w-2">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-neutral-500 dark:text-neutral-500">
                                        {c.sub}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ════════════════ TOOLBAR ════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-white/20 bg-white/40 p-3 shadow-lg backdrop-blur-xl md:p-4 dark:bg-neutral-900/40"
                >
                    <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative min-w-[200px] flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    placeholder="Cari mahasiswa..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-9 border-white/30 bg-white/60 pl-9 text-sm dark:bg-neutral-800/60"
                                />
                            </div>
                            <Select
                                value={selectedSession}
                                onValueChange={setSelectedSession}
                            >
                                <SelectTrigger className="h-9 w-44 border-white/30 bg-white/60 text-sm dark:bg-neutral-800/60">
                                    <SelectValue placeholder="Sesi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Semua Sesi
                                    </SelectItem>
                                    {sessions.map((s) => (
                                        <SelectItem
                                            key={s.id}
                                            value={s.id.toString()}
                                        >
                                            {s.mata_kuliah}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={selectedType}
                                onValueChange={setSelectedType}
                            >
                                <SelectTrigger className="h-9 w-32 border-white/30 bg-white/60 text-sm dark:bg-neutral-800/60">
                                    <SelectValue placeholder="Tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="izin">Izin</SelectItem>
                                    <SelectItem value="sakit">Sakit</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2 self-end md:self-auto">
                            {selectedIds.length > 0 && (
                                <Button
                                    size="sm"
                                    className="h-9 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                                    onClick={doBulkApprove}
                                >
                                    <Check className="mr-1 h-4 w-4" /> Approve (
                                    {selectedIds.length})
                                </Button>
                            )}
                            <div className="flex rounded-xl border border-white/30 bg-white/60 p-1 dark:bg-neutral-800/60">
                                {[
                                    {
                                        mode: 'kanban' as const,
                                        icon: LayoutGrid,
                                        tip: 'Kanban',
                                    },
                                    {
                                        mode: 'table' as const,
                                        icon: List,
                                        tip: 'Table',
                                    },
                                    {
                                        mode: 'calendar' as const,
                                        icon: Calendar,
                                        tip: 'Calendar',
                                    },
                                ].map((v) => (
                                    <button
                                        key={v.mode}
                                        onClick={() => setViewMode(v.mode)}
                                        title={v.tip}
                                        className={cn(
                                            'rounded-lg p-2 transition-all',
                                            viewMode === v.mode
                                                ? 'bg-white text-indigo-600 shadow-md dark:bg-neutral-700 dark:text-indigo-400'
                                                : 'text-neutral-400 hover:text-neutral-600',
                                        )}
                                    >
                                        <v.icon className="h-4 w-4" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ════════════════ VIEW CONTENT ════════════════ */}
                <AnimatePresence mode="wait">
                    {/* ──── KANBAN ──── */}
                    {viewMode === 'kanban' && (
                        <motion.div
                            key="kanban"
                            {...viewTransition}
                            className="grid grid-cols-1 gap-4 md:grid-cols-3"
                        >
                            {[
                                {
                                    key: 'pending',
                                    items: pending,
                                    label: 'Menunggu',
                                    Icon: Clock,
                                    borderCls:
                                        'border-amber-300/40 dark:border-amber-700/30',
                                    bgCls: 'bg-amber-50/30 dark:bg-amber-950/10',
                                    badgeCls:
                                        'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
                                    iconCls: 'text-amber-500',
                                },
                                {
                                    key: 'approved',
                                    items: approved,
                                    label: 'Disetujui',
                                    Icon: CheckCircle,
                                    borderCls:
                                        'border-emerald-300/40 dark:border-emerald-700/30',
                                    bgCls: 'bg-emerald-50/30 dark:bg-emerald-950/10',
                                    badgeCls:
                                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
                                    iconCls: 'text-emerald-500',
                                },
                                {
                                    key: 'rejected',
                                    items: rejected,
                                    label: 'Ditolak',
                                    Icon: XCircle,
                                    borderCls:
                                        'border-red-300/40 dark:border-red-700/30',
                                    bgCls: 'bg-red-50/30 dark:bg-red-950/10',
                                    badgeCls:
                                        'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
                                    iconCls: 'text-red-500',
                                },
                            ].map((col) => (
                                <div
                                    key={col.key}
                                    className={cn(
                                        'rounded-2xl border-2 p-4',
                                        col.borderCls,
                                        col.bgCls,
                                    )}
                                >
                                    <div className="mb-4 flex items-center justify-between border-b border-neutral-200/50 pb-3 dark:border-neutral-700/50">
                                        <div className="flex items-center gap-2">
                                            <col.Icon
                                                className={cn(
                                                    'h-5 w-5',
                                                    col.iconCls,
                                                )}
                                            />
                                            <h3 className="text-sm font-bold">
                                                {col.label}
                                            </h3>
                                        </div>
                                        <span
                                            className={cn(
                                                'rounded-full px-2.5 py-0.5 text-xs font-bold',
                                                col.badgeCls,
                                            )}
                                        >
                                            {col.items.length}
                                        </span>
                                    </div>
                                    <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
                                        {col.items.length === 0 && (
                                            <div className="py-10 text-center text-neutral-400">
                                                <FileText className="mx-auto mb-2 h-10 w-10 opacity-30" />
                                                <p className="text-sm">
                                                    Tidak ada data
                                                </p>
                                            </div>
                                        )}
                                        {col.items.map((p) => (
                                            <motion.div
                                                key={p.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileHover={{
                                                    scale: 1.01,
                                                    y: -2,
                                                }}
                                                className="cursor-pointer overflow-hidden rounded-xl border border-white/60 bg-white p-0 shadow-sm transition-all hover:shadow-xl dark:border-neutral-700/60 dark:bg-neutral-900"
                                                onClick={() =>
                                                    router.visit(
                                                        `/dosen/permits/${p.id}`,
                                                    )
                                                }
                                            >
                                                <div className="p-4">
                                                    {/* Student Info */}
                                                    <div className="mb-3 flex items-center gap-3">
                                                        <Avatar className="h-12 w-12 flex-shrink-0 border-2 border-white shadow-sm ring-2 ring-neutral-100 dark:border-neutral-800 dark:ring-neutral-800">
                                                            <AvatarImage
                                                                src={
                                                                    p.mahasiswa
                                                                        .avatar
                                                                }
                                                            />
                                                            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-bold text-white">
                                                                {
                                                                    p.mahasiswa
                                                                        .nama[0]
                                                                }
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
                                                                {
                                                                    p.mahasiswa
                                                                        .nama
                                                                }
                                                            </p>
                                                            <p className="text-[11px] font-medium text-neutral-500">
                                                                {
                                                                    p.mahasiswa
                                                                        .nim
                                                                }
                                                            </p>
                                                        </div>
                                                        {p.is_urgent && (
                                                            <div className="rounded-lg bg-red-50 p-1.5 dark:bg-red-900/20">
                                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Meta Info Row */}
                                                    <div className="mb-3 flex flex-wrap items-center gap-1.5">
                                                        {typeBadge(p.type)}
                                                        <Badge
                                                            variant="outline"
                                                            className="h-5 px-2 py-0 text-[10px] font-medium"
                                                        >
                                                            <BookOpen className="mr-1 h-2.5 w-2.5" />
                                                            {
                                                                p.session
                                                                    .mata_kuliah
                                                            }
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className="h-5 px-2 py-0 text-[10px] font-medium"
                                                        >
                                                            <Calendar className="mr-1 h-2.5 w-2.5" />
                                                            {fmtDateRange(
                                                                p.start_date,
                                                                p.end_date,
                                                            )}
                                                        </Badge>
                                                    </div>

                                                    {/* Reason - Styled Container */}
                                                    <div className="relative mb-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3 dark:border-neutral-700/50 dark:bg-neutral-800/50">
                                                        <div className="absolute top-2 left-2.5 text-neutral-300 dark:text-neutral-600">
                                                            <svg
                                                                width="12"
                                                                height="12"
                                                                viewBox="0 0 24 24"
                                                                fill="currentColor"
                                                            >
                                                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z" />
                                                            </svg>
                                                        </div>
                                                        <p className="line-clamp-3 pl-5 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                                                            {p.reason}
                                                        </p>
                                                    </div>

                                                    {/* AI Recommendation */}
                                                    <div
                                                        className={cn(
                                                            'flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs',
                                                            p.ai_recommendation ===
                                                                'approve'
                                                                ? 'border border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-900/20 dark:text-emerald-300'
                                                                : p.ai_recommendation ===
                                                                    'reject'
                                                                  ? 'border border-red-100 bg-red-50 text-red-700 dark:border-red-800/30 dark:bg-red-900/20 dark:text-red-300'
                                                                  : 'border border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-amber-300',
                                                        )}
                                                    >
                                                        <Sparkles className="h-3.5 w-3.5" />
                                                        <span className="font-semibold">
                                                            AI:{' '}
                                                            {p.ai_recommendation ===
                                                            'approve'
                                                                ? 'Setujui'
                                                                : p.ai_recommendation ===
                                                                    'reject'
                                                                  ? 'Tolak'
                                                                  : 'Review'}
                                                        </span>
                                                        <div className="ml-auto flex items-center gap-1.5">
                                                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                                                                <div
                                                                    className={cn(
                                                                        'h-full rounded-full',
                                                                        p.ai_confidence >=
                                                                            80
                                                                            ? 'bg-emerald-500'
                                                                            : p.ai_confidence >=
                                                                                60
                                                                              ? 'bg-amber-500'
                                                                              : 'bg-red-500',
                                                                    )}
                                                                    style={{
                                                                        width: `${p.ai_confidence}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="font-bold">
                                                                {
                                                                    p.ai_confidence
                                                                }
                                                                %
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Actions for Pending */}
                                                    {col.key === 'pending' && (
                                                        <div className="mt-3 flex gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                                                            <Button
                                                                size="sm"
                                                                className="h-8 flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-xs text-white shadow-md hover:shadow-lg"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    doApprove(
                                                                        p,
                                                                    );
                                                                }}
                                                                disabled={
                                                                    processingId ===
                                                                    p.id
                                                                }
                                                            >
                                                                <Check className="mr-1 h-3.5 w-3.5" />{' '}
                                                                Setujui
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    router.visit(
                                                                        `/dosen/permits/${p.id}`,
                                                                    );
                                                                }}
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 border-red-200 text-xs text-red-600 hover:bg-red-50 dark:border-red-800/30 dark:hover:bg-red-900/20"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    openReject(
                                                                        p,
                                                                    );
                                                                }}
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {/* Timestamp */}
                                                    <div className="mt-2.5 flex items-center justify-center gap-1.5 border-t border-dashed border-neutral-100 pt-2 dark:border-neutral-800">
                                                        <Clock className="h-3 w-3 text-neutral-300" />
                                                        <p className="text-[10px] font-medium text-neutral-400">
                                                            {fmtRelative(
                                                                p.created_at,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* ──── TABLE ──── */}
                    {viewMode === 'table' && (
                        <motion.div
                            key="table"
                            {...viewTransition}
                            className="overflow-hidden rounded-2xl border border-white/20 bg-white/40 shadow-lg backdrop-blur-xl dark:bg-neutral-900/40"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-950/50">
                                            <th className="w-10 px-4 py-3">
                                                <Checkbox
                                                    checked={
                                                        selectedIds.length ===
                                                            pending.length &&
                                                        pending.length > 0
                                                    }
                                                    onCheckedChange={() => {
                                                        const ids = pending.map(
                                                            (p) => p.id,
                                                        );
                                                        setSelectedIds(
                                                            (prev) =>
                                                                prev.length ===
                                                                ids.length
                                                                    ? []
                                                                    : ids,
                                                        );
                                                    }}
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                                Mahasiswa
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                                Tipe
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                                Mata Kuliah
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                                Tanggal
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                                AI
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {filtered.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="py-12 text-center text-neutral-400"
                                                >
                                                    <FileText className="mx-auto mb-2 h-10 w-10 opacity-30" />
                                                    <p>Tidak ada data</p>
                                                </td>
                                            </tr>
                                        )}
                                        {filtered.map((p, i) => (
                                            <motion.tr
                                                key={p.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.02 }}
                                                className={cn(
                                                    'cursor-pointer transition-colors hover:bg-white/60 dark:hover:bg-neutral-800/40',
                                                    p.is_urgent &&
                                                        'bg-red-50/30 dark:bg-red-900/5',
                                                )}
                                                onClick={() =>
                                                    router.visit(
                                                        `/dosen/permits/${p.id}`,
                                                    )
                                                }
                                            >
                                                <td
                                                    className="px-4 py-3"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <Checkbox
                                                        checked={selectedIds.includes(
                                                            p.id,
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleId(p.id)
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage
                                                                src={
                                                                    p.mahasiswa
                                                                        .avatar
                                                                }
                                                            />
                                                            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-[10px] text-white">
                                                                {
                                                                    p.mahasiswa
                                                                        .nama[0]
                                                                }
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-semibold">
                                                                {
                                                                    p.mahasiswa
                                                                        .nama
                                                                }
                                                            </p>
                                                            <p className="text-[11px] text-neutral-500">
                                                                {
                                                                    p.mahasiswa
                                                                        .nim
                                                                }
                                                            </p>
                                                        </div>
                                                        {p.is_urgent && (
                                                            <AlertTriangle className="h-3.5 w-3.5 animate-pulse text-red-500" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {typeBadge(p.type)}
                                                </td>
                                                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400">
                                                    {p.session.mata_kuliah}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                                                    {fmtDateRange(
                                                        p.start_date,
                                                        p.end_date,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {statusBadge(p.status)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Sparkles className="h-3 w-3 text-purple-500" />
                                                        <span
                                                            className={cn(
                                                                'font-semibold',
                                                                p.ai_confidence >=
                                                                    80
                                                                    ? 'text-emerald-600'
                                                                    : p.ai_confidence >=
                                                                        60
                                                                      ? 'text-amber-600'
                                                                      : 'text-red-600',
                                                            )}
                                                        >
                                                            {p.ai_confidence}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td
                                                    className="px-4 py-3"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <div className="flex items-center justify-center gap-1">
                                                        {p.status ===
                                                            'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    className="h-7 bg-gradient-to-r from-emerald-500 to-teal-600 px-2 text-white"
                                                                    onClick={() =>
                                                                        doApprove(
                                                                            p,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        processingId ===
                                                                        p.id
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
                                                                            p,
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
                                                                    `/dosen/permits/${p.id}`,
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
                        </motion.div>
                    )}

                    {/* ──── CALENDAR ──── */}
                    {viewMode === 'calendar' && (
                        <motion.div
                            key="calendar"
                            {...viewTransition}
                            className="rounded-2xl border border-white/20 bg-white/40 p-4 shadow-lg backdrop-blur-xl md:p-6 dark:bg-neutral-900/40"
                        >
                            <div className="mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() =>
                                            setCurrentMonth((m) =>
                                                moment(m).subtract(1, 'month'),
                                            )
                                        }
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <h3 className="min-w-[160px] text-center text-lg font-bold">
                                        {currentMonth.format('MMMM YYYY')}
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() =>
                                            setCurrentMonth((m) =>
                                                moment(m).add(1, 'month'),
                                            )
                                        }
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs"
                                    onClick={() => setCurrentMonth(moment())}
                                >
                                    Hari Ini
                                </Button>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {[
                                    'Min',
                                    'Sen',
                                    'Sel',
                                    'Rab',
                                    'Kam',
                                    'Jum',
                                    'Sab',
                                ].map((d) => (
                                    <div
                                        key={d}
                                        className="py-2 text-center text-[11px] font-semibold text-neutral-500"
                                    >
                                        {d}
                                    </div>
                                ))}
                                {calDays.map((day, i) => {
                                    const dp = permitsOnDay(day);
                                    const isToday = day.isSame(moment(), 'day');
                                    const isCur =
                                        day.month() === currentMonth.month();
                                    return (
                                        <div
                                            key={i}
                                            className={cn(
                                                'min-h-[80px] rounded-lg border p-1.5 transition-colors md:min-h-[100px]',
                                                isToday
                                                    ? 'border-indigo-400 bg-indigo-50/50 ring-1 ring-indigo-400/30 dark:bg-indigo-900/15'
                                                    : isCur
                                                      ? 'border-neutral-200/60 hover:bg-neutral-50 dark:border-neutral-700/40 dark:hover:bg-neutral-800/30'
                                                      : 'border-transparent opacity-40',
                                            )}
                                        >
                                            <div className="mb-1 flex items-center justify-between">
                                                <span
                                                    className={cn(
                                                        'text-xs font-semibold',
                                                        isToday
                                                            ? 'rounded-md bg-indigo-500 px-1.5 py-0.5 text-white'
                                                            : isCur
                                                              ? 'text-neutral-900 dark:text-white'
                                                              : 'text-neutral-400',
                                                    )}
                                                >
                                                    {day.format('D')}
                                                </span>
                                                {dp.length > 0 && (
                                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                        {dp.length}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-0.5">
                                                {dp.slice(0, 2).map((p) => (
                                                    <div
                                                        key={p.id}
                                                        onClick={() =>
                                                            router.visit(
                                                                `/dosen/permits/${p.id}`,
                                                            )
                                                        }
                                                        className={cn(
                                                            'cursor-pointer truncate rounded px-1.5 py-0.5 text-[10px] font-medium',
                                                            p.status ===
                                                                'pending'
                                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                                                : p.status ===
                                                                    'approved'
                                                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
                                                        )}
                                                    >
                                                        {
                                                            p.mahasiswa.nama.split(
                                                                ' ',
                                                            )[0]
                                                        }
                                                    </div>
                                                ))}
                                                {dp.length > 2 && (
                                                    <p className="text-center text-[9px] text-neutral-400">
                                                        +{dp.length - 2}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ════════════════ REJECTION MODAL ════════════════ */}
                <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                    <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-neutral-950">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
                                    <XCircle className="h-5 w-5 text-red-500" />
                                </div>{' '}
                                Alasan Penolakan
                            </DialogTitle>
                        </DialogHeader>
                        {detailPermit && (
                            <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-900">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={detailPermit.mahasiswa.avatar}
                                    />
                                    <AvatarFallback>
                                        {detailPermit.mahasiswa.nama[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-semibold">
                                        {detailPermit.mahasiswa.nama}
                                    </p>
                                    <p className="text-[11px] text-neutral-500">
                                        {detailPermit.mahasiswa.nim}
                                    </p>
                                </div>
                            </div>
                        )}
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
                                disabled={
                                    !rejectionReason || processingId !== null
                                }
                            >
                                <X className="mr-2 h-4 w-4" /> Kirim Penolakan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </DosenLayout>
    );
}
