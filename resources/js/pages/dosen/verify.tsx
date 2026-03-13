import DisetujuiIcon from '@/assets/admin/verifikasi-selfie/disetujui.png';
import DitolakSelfieIcon from '@/assets/admin/verifikasi-selfie/ditolak.png';
import PendingIcon from '@/assets/admin/verifikasi-selfie/pending.png';
import TotalSelfieIcon from '@/assets/admin/verifikasi-selfie/total-selfie.png';
import SelfieIcon from '@/assets/admin/verifikasi-selfie/verifikasi-selfie.png';
import { ExportModal } from '@/components/modals/export-modal';
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
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Bot,
    Brain,
    Camera,
    Check,
    CheckCircle,
    Clock,
    Download,
    Eye,
    Grid3x3,
    Heart,
    List,
    Loader2,
    MapPin,
    RefreshCw,
    Search,
    Shield,
    Smartphone,
    Sparkles,
    Timer,
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
    liveness_score: number;
    quality_score: number;
    risk_level: string;
    risk_score: number;
    ai_decision: string;
    warnings: string[];
    fraud_flags: string[];
    location_verified: boolean;
    device_trusted: boolean;
    total_processing_time_ms: number;
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
    ai_auto_approved: number;
    suspicious: number;
    face_match_rate: number;
    location_valid: number;
    device_trusted: number;
    avg_processing_time: number;
}

interface PageProps {
    dosen: { id: number; nama: string; nidn: string };
    verifications: Verification[];
    stats: Stats;
}

/* ═══════════════════════════ ANIMATION VARIANTS ═══════════════════════════ */
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

/* ═══════════════════════════ HELPERS ═══════════════════════════ */
const scoreColor = (s: number) =>
    s >= 85 ? 'text-emerald-600' : s >= 70 ? 'text-amber-600' : 'text-red-600';
const scoreBg = (s: number) =>
    s >= 85 ? 'bg-emerald-500' : s >= 70 ? 'bg-amber-500' : 'bg-red-500';
const riskColor = (r: string) =>
    r === 'low'
        ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/30'
        : r === 'medium'
          ? 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30'
          : r === 'high'
            ? 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/30'
            : 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/30';

/* ═══════════════════════════ COMPONENT ═══════════════════════════ */
export default function DosenVerify({
    dosen,
    verifications,
    stats,
}: PageProps) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectTarget, setRejectTarget] = useState<Verification | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Advanced Action States
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [isQuickVerifying, setIsQuickVerifying] = useState(false);
    const [isAIVerifying, setIsAIVerifying] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    const filtered = useMemo(() => {
        return verifications.filter((v) => {
            const matchSearch =
                v.mahasiswa.nama
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                v.mahasiswa.nim.includes(searchQuery) ||
                v.course.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus =
                filterStatus === 'all' || v.status === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [verifications, searchQuery, filterStatus]);

    const doApprove = (v: Verification) => {
        setProcessingId(v.id);
        router.patch(
            `/dosen/verify/${v.id}/approve`,
            {},
            {
                preserveScroll: true,
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
            `/dosen/verify/${rejectTarget.id}/reject`,
            { reason: rejectReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowRejectDialog(false);
                    setRejectTarget(null);
                },
                onFinish: () => setProcessingId(null),
            },
        );
    };

    // ⚡ QUICK VERIFY
    const handleQuickVerify = async () => {
        if (selectedItems.length === 0) {
            alert('Pilih minimal 1 selfie untuk verifikasi cepat');
            return;
        }
        try {
            setIsQuickVerifying(true);
            const response = await axios.post('/dosen/verify/quick-verify', {
                verification_ids: selectedItems,
            });
            alert(
                `⚡ Quick Verify Berhasil: ${response.data.approved} disetujui, ${response.data.rejected} ditolak`,
            );
            router.reload({ only: ['verifications', 'stats'] });
            setSelectedItems([]);
        } catch (error) {
            alert('Gagal melakukan quick verify');
        } finally {
            setIsQuickVerifying(false);
        }
    };

    // 🤖 AI AUTO-VERIFY
    const handleAIAutoVerify = async () => {
        try {
            setIsAIVerifying(true);
            const response = await axios.post('/dosen/verify/ai-auto-verify');
            alert(
                `🤖 AI Auto-Verify Selesai: ${response.data.processed} diproses, ${response.data.approved} disetujui otomatis`,
            );
            router.reload({ only: ['verifications', 'stats'] });
        } catch (error) {
            alert('Gagal melakukan AI auto-verify');
        } finally {
            setIsAIVerifying(false);
        }
    };

    // 📥 EXPORT
    const handleExport = async (format: 'pdf' | 'excel') => {
        try {
            setIsExporting(true);
            const response = await axios.post(
                `/dosen/verify/export`,
                { format },
                { responseType: 'blob' },
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
                'download',
                `verifikasi-selfie-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`,
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Gagal export data');
        } finally {
            setIsExporting(false);
            setShowExportModal(false);
        }
    };

    // 🔄 REFRESH
    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            router.reload({
                only: ['verifications', 'stats'],
                onFinish: () => setIsRefreshing(false),
            });
        } catch (error) {
            setIsRefreshing(false);
        }
    };

    const toggleSelection = (id: number) => {
        setSelectedItems((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const statusBadge = (status: string) => {
        if (status === 'approved')
            return (
                <Badge className="gap-1 border-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-[10px] text-white">
                    <CheckCircle className="h-3 w-3" /> Disetujui
                </Badge>
            );
        if (status === 'rejected')
            return (
                <Badge className="gap-1 border-0 bg-gradient-to-r from-red-500 to-rose-500 text-[10px] text-white">
                    <XCircle className="h-3 w-3" /> Ditolak
                </Badge>
            );
        return (
            <Badge className="gap-1 border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] text-white">
                <Clock className="h-3 w-3" /> Pending
            </Badge>
        );
    };

    const aiDecisionBadge = (dec: string) => {
        if (dec === 'approve')
            return (
                <Badge className="gap-1 border-0 bg-emerald-100 text-[9px] text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <Sparkles className="h-2.5 w-2.5" /> AI: Approve
                </Badge>
            );
        if (dec === 'reject')
            return (
                <Badge className="gap-1 border-0 bg-red-100 text-[9px] text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    <AlertTriangle className="h-2.5 w-2.5" /> AI: Reject
                </Badge>
            );
        return (
            <Badge className="gap-1 border-0 bg-amber-100 text-[9px] text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <Eye className="h-2.5 w-2.5" /> AI: Review
            </Badge>
        );
    };

    /* ═══ Summary Cards ═══ */
    /* ═══ Summary Cards ═══ */
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
            <Head title="Verifikasi Selfie — AI Powered" />

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
                                        alt="Selfie"
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
                                        AI-Powered • Face Recognition • Liveness
                                        Detection
                                    </motion.p>
                                </div>
                            </div>

                            <div className="mt-2 flex w-full flex-col items-center gap-3 lg:mt-0 lg:w-auto lg:items-end">
                                <div className="flex flex-wrap justify-center gap-3">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            delay: 0.6,
                                            type: 'spring',
                                        }}
                                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-5 py-3 shadow-lg backdrop-blur-xl"
                                    >
                                        <div className="rounded-lg bg-amber-500/20 p-2">
                                            <Clock className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-indigo-100">
                                                Pending
                                            </p>
                                            <p className="text-xl font-bold text-white">
                                                {stats.pending}
                                            </p>
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                            delay: 0.7,
                                            type: 'spring',
                                        }}
                                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-5 py-3 shadow-lg backdrop-blur-xl"
                                    >
                                        <div className="rounded-lg bg-emerald-500/20 p-2">
                                            <CheckCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-indigo-100">
                                                Hari Ini
                                            </p>
                                            <p className="text-xl font-bold text-white">
                                                {stats.today}
                                            </p>
                                        </div>
                                    </motion.div>
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-2 grid w-full grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-end lg:mt-0 lg:w-auto"
                                >
                                    {/* Quick Verify */}
                                    <motion.button
                                        onClick={handleQuickVerify}
                                        disabled={
                                            isQuickVerifying ||
                                            selectedItems.length === 0
                                        }
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                            'relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/20 px-4 py-3 backdrop-blur-xl transition-all disabled:opacity-50',
                                            'bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg shadow-purple-500/50 hover:from-purple-600 hover:to-purple-700',
                                        )}
                                    >
                                        {isQuickVerifying ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                                        ) : (
                                            <Zap className="h-5 w-5 text-white" />
                                        )}
                                        <span className="text-sm font-semibold whitespace-nowrap text-white">
                                            Quick Verify{' '}
                                        </span>
                                        {selectedItems.length > 0 && (
                                            <Badge className="absolute -top-1 -right-1 scale-75 border-0 bg-white px-1.5 font-bold text-purple-600">
                                                {selectedItems.length}
                                            </Badge>
                                        )}
                                    </motion.button>

                                    {/* AI Auto-Verify */}
                                    <motion.button
                                        onClick={handleAIAutoVerify}
                                        disabled={isAIVerifying}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                            'relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/20 px-4 py-3 backdrop-blur-xl transition-all disabled:opacity-50',
                                            'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-pink-500/50 hover:from-purple-700 hover:to-pink-700',
                                        )}
                                    >
                                        <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-white/20 blur-xl" />
                                        {isAIVerifying ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                                        ) : (
                                            <Bot className="h-5 w-5 text-white" />
                                        )}
                                        <span className="text-sm font-semibold whitespace-nowrap text-white">
                                            AI Auto-Verify
                                        </span>
                                    </motion.button>

                                    {/* Export */}
                                    <motion.button
                                        onClick={() => setShowExportModal(true)}
                                        disabled={isExporting}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                            'flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 backdrop-blur-xl transition-all disabled:opacity-50',
                                            'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg shadow-indigo-500/50 hover:from-purple-600 hover:to-indigo-700',
                                        )}
                                    >
                                        {isExporting ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-white" />
                                        ) : (
                                            <Download className="h-5 w-5 text-white" />
                                        )}
                                        <span className="text-sm font-semibold whitespace-nowrap text-white">
                                            Export
                                        </span>
                                    </motion.button>

                                    {/* Refresh */}
                                    <motion.button
                                        onClick={handleRefresh}
                                        disabled={isRefreshing}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                            'flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 backdrop-blur-xl transition-all disabled:opacity-50',
                                            'bg-gradient-to-r from-pink-500 to-purple-600 shadow-lg shadow-purple-500/50 hover:from-pink-600 hover:to-purple-700',
                                        )}
                                    >
                                        <RefreshCw
                                            className={cn(
                                                'h-5 w-5 text-white',
                                                isRefreshing && 'animate-spin',
                                            )}
                                        />
                                        <span className="text-sm font-semibold whitespace-nowrap text-white">
                                            Refresh
                                        </span>
                                    </motion.button>
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
                                gradientBg:
                                    'from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10',
                                hoverShadow: 'hover:shadow-blue-500/10',
                            },
                            'bg-amber-500': {
                                from: 'from-amber-400',
                                to: 'to-orange-600',
                                gradientBg:
                                    'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
                                hoverShadow: 'hover:shadow-amber-500/10',
                            },
                            'bg-emerald-500': {
                                from: 'from-emerald-400',
                                to: 'to-teal-600',
                                gradientBg:
                                    'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
                                hoverShadow: 'hover:shadow-emerald-500/10',
                            },
                            'bg-red-500': {
                                from: 'from-red-400',
                                to: 'to-rose-600',
                                gradientBg:
                                    'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10',
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

                {/* ═══════════════════ FILTERS ═══════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[200px] flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <Input
                                placeholder="Cari mahasiswa, NIM, atau mata kuliah..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 rounded-xl border-white/20 bg-white/60 pl-10 backdrop-blur dark:bg-neutral-800/60"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {[
                                {
                                    value: 'all',
                                    label: 'Semua',
                                    count: verifications.length,
                                },
                                {
                                    value: 'pending',
                                    label: 'Pending',
                                    count: stats.pending,
                                },
                                {
                                    value: 'approved',
                                    label: 'Disetujui',
                                    count: stats.approved_today,
                                },
                                {
                                    value: 'rejected',
                                    label: 'Ditolak',
                                    count: stats.rejected,
                                },
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
                                        'h-9 gap-1.5 rounded-xl text-xs',
                                        filterStatus === f.value &&
                                            'border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25',
                                    )}
                                >
                                    {f.label}{' '}
                                    <span className="opacity-60">
                                        ({f.count})
                                    </span>
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
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-emerald-300" />
                            </motion.div>
                            <p className="text-lg font-semibold text-neutral-500">
                                Tidak ada data verifikasi
                            </p>
                            <p className="mt-1 text-sm text-neutral-400">
                                Belum ada selfie yang sesuai filter
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
                                    className={cn(
                                        'group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl transition-all dark:bg-neutral-900/40',
                                        selectedItems.includes(v.id) &&
                                            'bg-purple-50/50 ring-2 ring-purple-500 dark:bg-purple-900/10',
                                    )}
                                >
                                    {/* Selection Option */}
                                    {v.status === 'pending' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSelection(v.id);
                                            }}
                                            className="absolute top-4 left-4 z-20"
                                        >
                                            <div
                                                className={cn(
                                                    'flex h-6 w-6 items-center justify-center rounded-lg border-2 shadow-md transition-all',
                                                    selectedItems.includes(v.id)
                                                        ? 'border-purple-600 bg-purple-600 text-white'
                                                        : 'border-neutral-300 bg-white/80 backdrop-blur-sm hover:border-purple-500 dark:border-neutral-600 dark:bg-neutral-800/80',
                                                )}
                                            >
                                                {selectedItems.includes(
                                                    v.id,
                                                ) && (
                                                    <Check className="h-4 w-4" />
                                                )}
                                            </div>
                                        </button>
                                    )}

                                    <div className="space-y-4 p-5">
                                        {/* Student Info Row */}
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-11 w-11 flex-shrink-0 border-2 border-white shadow-md ring-2 ring-neutral-100 dark:border-neutral-800 dark:ring-neutral-800">
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
                                                    `/dosen/verify/${v.id}`,
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
                                            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/50 to-transparent pb-3 opacity-0 transition-opacity group-hover:opacity-100">
                                                <span className="flex items-center gap-1 text-xs font-semibold text-white">
                                                    <Eye className="h-3.5 w-3.5" />{' '}
                                                    Lihat Detail AI Analysis
                                                </span>
                                            </div>
                                            {/* AI Confidence overlay */}
                                            <div className="absolute top-2 right-2">
                                                <div
                                                    className={cn(
                                                        'rounded-lg px-2 py-1 text-[10px] font-bold text-white backdrop-blur-xl',
                                                        v.ai_confidence >= 80
                                                            ? 'bg-emerald-500/80'
                                                            : v.ai_confidence >=
                                                                60
                                                              ? 'bg-amber-500/80'
                                                              : 'bg-red-500/80',
                                                    )}
                                                >
                                                    <Sparkles className="mr-0.5 inline h-2.5 w-2.5" />{' '}
                                                    AI {v.ai_confidence}%
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Analysis Grid */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="rounded-lg bg-neutral-50 p-2 text-center dark:bg-neutral-800/50">
                                                <User className="mx-auto mb-0.5 h-3 w-3 text-purple-500" />
                                                <p className="text-[8px] font-bold text-neutral-400 uppercase">
                                                    Face
                                                </p>
                                                <p
                                                    className={cn(
                                                        'text-xs font-bold',
                                                        scoreColor(
                                                            v.face_match_score,
                                                        ),
                                                    )}
                                                >
                                                    {v.face_match_score}%
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-neutral-50 p-2 text-center dark:bg-neutral-800/50">
                                                <Heart className="mx-auto mb-0.5 h-3 w-3 text-pink-500" />
                                                <p className="text-[8px] font-bold text-neutral-400 uppercase">
                                                    Liveness
                                                </p>
                                                <p
                                                    className={cn(
                                                        'text-xs font-bold',
                                                        scoreColor(
                                                            v.liveness_score,
                                                        ),
                                                    )}
                                                >
                                                    {v.liveness_score}%
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-neutral-50 p-2 text-center dark:bg-neutral-800/50">
                                                <Shield className="mx-auto mb-0.5 h-3 w-3 text-indigo-500" />
                                                <p className="text-[8px] font-bold text-neutral-400 uppercase">
                                                    Risk
                                                </p>
                                                <p
                                                    className={cn(
                                                        'text-xs font-bold',
                                                        v.risk_level === 'low'
                                                            ? 'text-emerald-600'
                                                            : v.risk_level ===
                                                                'medium'
                                                              ? 'text-amber-600'
                                                              : 'text-red-600',
                                                    )}
                                                >
                                                    {v.risk_level.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Course & Location */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800/50">
                                                <p className="text-[8px] font-bold text-neutral-400 uppercase">
                                                    Mata Kuliah
                                                </p>
                                                <p className="truncate text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                                                    {v.course}
                                                </p>
                                            </div>
                                            <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800/50">
                                                <p className="text-[8px] font-bold text-neutral-400 uppercase">
                                                    Jarak
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    <MapPin
                                                        className={cn(
                                                            'h-2.5 w-2.5',
                                                            v.location_verified
                                                                ? 'text-emerald-500'
                                                                : 'text-red-500',
                                                        )}
                                                    />
                                                    <p
                                                        className={cn(
                                                            'text-[11px] font-bold',
                                                            v.distance <= 100
                                                                ? 'text-emerald-600'
                                                                : v.distance <=
                                                                    500
                                                                  ? 'text-amber-600'
                                                                  : 'text-red-600',
                                                        )}
                                                    >
                                                        {v.distance}m
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Decision & Meta */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                {aiDecisionBadge(v.ai_decision)}
                                                {v.device_trusted && (
                                                    <Badge className="gap-1 border-0 bg-cyan-100 text-[9px] text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                                                        <Smartphone className="h-2.5 w-2.5" />{' '}
                                                        Trusted
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="flex items-center gap-1 text-[9px] text-neutral-400">
                                                <Timer className="h-2.5 w-2.5" />{' '}
                                                {v.total_processing_time_ms}ms
                                            </span>
                                        </div>

                                        {/* Time */}
                                        <div className="flex items-center justify-between border-t border-neutral-100 pt-2 text-[10px] text-neutral-400 dark:border-neutral-800">
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

                                        {/* Warnings */}
                                        {v.warnings.length > 0 && (
                                            <div className="rounded-lg border border-red-200/50 bg-red-50 p-2 dark:border-red-800/30 dark:bg-red-900/10">
                                                <p className="mb-1 flex items-center gap-1 text-[9px] font-bold text-red-500">
                                                    <AlertTriangle className="h-2.5 w-2.5" />{' '}
                                                    {v.warnings.length}{' '}
                                                    Warning(s)
                                                </p>
                                                {v.warnings
                                                    .slice(0, 2)
                                                    .map((w, i) => (
                                                        <p
                                                            key={i}
                                                            className="truncate text-[9px] text-red-600/80 dark:text-red-300/80"
                                                        >
                                                            • {w}
                                                        </p>
                                                    ))}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {v.status === 'pending' && (
                                            <div className="flex gap-2 pt-1">
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        doApprove(v);
                                                    }}
                                                    disabled={
                                                        processingId === v.id
                                                    }
                                                    className="h-9 flex-1 border-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-xs text-white shadow-lg shadow-emerald-500/25"
                                                >
                                                    <Check className="mr-1 h-3.5 w-3.5" />{' '}
                                                    Setujui
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openReject(v);
                                                    }}
                                                    disabled={
                                                        processingId === v.id
                                                    }
                                                    className="h-9 border-red-200 text-xs text-red-600 hover:bg-red-50 dark:border-red-800/30 dark:hover:bg-red-900/10"
                                                >
                                                    <X className="mr-1 h-3.5 w-3.5" />{' '}
                                                    Tolak
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.visit(
                                                            `/dosen/verify/${v.id}`,
                                                        )
                                                    }
                                                    className="h-9 w-9 p-0"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                        {v.status !== 'pending' && (
                                            <div className="flex gap-2 pt-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.visit(
                                                            `/dosen/verify/${v.id}`,
                                                        )
                                                    }
                                                    className="h-9 flex-1 gap-1.5 text-xs"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />{' '}
                                                    Lihat Detail AI Analysis
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
                                            <th className="w-10 px-4 py-3 text-center"></th>
                                            <th className="px-4 py-3 text-left text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                                Mahasiswa
                                            </th>
                                            <th className="px-4 py-3 text-left text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                                Mata Kuliah
                                            </th>
                                            <th className="px-3 py-3 text-center text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                                Face
                                            </th>
                                            <th className="px-3 py-3 text-center text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                                Live
                                            </th>
                                            <th className="px-3 py-3 text-center text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                                Risk
                                            </th>
                                            <th className="px-3 py-3 text-center text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                                AI
                                            </th>
                                            <th className="px-3 py-3 text-center text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                                Jarak
                                            </th>
                                            <th className="px-3 py-3 text-center text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                                                Waktu
                                            </th>
                                            <th className="px-4 py-3 text-center text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
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
                                                    selectedItems.includes(
                                                        v.id,
                                                    ) &&
                                                        'bg-purple-50/50 dark:bg-purple-900/10',
                                                )}
                                                onClick={() =>
                                                    router.visit(
                                                        `/dosen/verify/${v.id}`,
                                                    )
                                                }
                                            >
                                                <td
                                                    className="px-4 py-3"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    {v.status === 'pending' && (
                                                        <button
                                                            onClick={() =>
                                                                toggleSelection(
                                                                    v.id,
                                                                )
                                                            }
                                                            className={cn(
                                                                'flex h-5 w-5 items-center justify-center rounded border transition-all',
                                                                selectedItems.includes(
                                                                    v.id,
                                                                )
                                                                    ? 'border-purple-600 bg-purple-600 text-white'
                                                                    : 'border-neutral-300 bg-white hover:border-purple-500 dark:border-neutral-600 dark:bg-neutral-800',
                                                            )}
                                                        >
                                                            {selectedItems.includes(
                                                                v.id,
                                                            ) && (
                                                                <Check className="h-3.5 w-3.5" />
                                                            )}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
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
                                                            <p className="text-xs font-semibold">
                                                                {
                                                                    v.mahasiswa
                                                                        .nama
                                                                }
                                                            </p>
                                                            <p className="text-[10px] text-neutral-500">
                                                                {
                                                                    v.mahasiswa
                                                                        .nim
                                                                }
                                                            </p>
                                                        </div>
                                                        {v.is_suspicious && (
                                                            <AlertTriangle className="h-3 w-3 animate-pulse text-orange-500" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="max-w-[120px] truncate px-4 py-3 text-xs text-neutral-600 dark:text-neutral-400">
                                                    {v.course}
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <span
                                                        className={cn(
                                                            'text-xs font-bold',
                                                            scoreColor(
                                                                v.face_match_score,
                                                            ),
                                                        )}
                                                    >
                                                        {v.face_match_score}%
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <span
                                                        className={cn(
                                                            'text-xs font-bold',
                                                            scoreColor(
                                                                v.liveness_score,
                                                            ),
                                                        )}
                                                    >
                                                        {v.liveness_score}%
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <Badge
                                                        className={cn(
                                                            'border text-[9px]',
                                                            riskColor(
                                                                v.risk_level,
                                                            ),
                                                        )}
                                                    >
                                                        {v.risk_level}
                                                    </Badge>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <span
                                                        className={cn(
                                                            'text-xs font-bold',
                                                            scoreColor(
                                                                v.ai_confidence,
                                                            ),
                                                        )}
                                                    >
                                                        {v.ai_confidence}%
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-center">
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
                                                <td className="px-3 py-3 text-center">
                                                    {statusBadge(v.status)}
                                                </td>
                                                <td className="px-4 py-3 text-[10px] whitespace-nowrap text-neutral-500">
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
                                                                    className="h-7 border-0 bg-gradient-to-r from-emerald-500 to-teal-600 px-2 text-white"
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
                                                                    `/dosen/verify/${v.id}`,
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
                                    <AvatarImage
                                        src={
                                            rejectTarget.mahasiswa.avatar_url ||
                                            undefined
                                        }
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
                                        {rejectTarget.mahasiswa.nama[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-semibold">
                                        {rejectTarget.mahasiswa.nama}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        {rejectTarget.mahasiswa.nim} •{' '}
                                        {rejectTarget.course}
                                    </p>
                                </div>
                            </div>

                            {/* AI Risk Info */}
                            {rejectTarget.warnings.length > 0 && (
                                <div className="rounded-xl border border-amber-200/50 bg-amber-50 p-3 dark:border-amber-800/30 dark:bg-amber-900/10">
                                    <p className="mb-1 flex items-center gap-1 text-[10px] font-bold text-amber-600">
                                        <Brain className="h-3 w-3" /> AI
                                        Warning(s)
                                    </p>
                                    {rejectTarget.warnings.map((w, i) => (
                                        <p
                                            key={i}
                                            className="text-[10px] text-amber-700/80"
                                        >
                                            • {w}
                                        </p>
                                    ))}
                                </div>
                            )}

                            <div>
                                <Label>Alasan Penolakan</Label>
                                <Textarea
                                    value={rejectReason}
                                    onChange={(e) =>
                                        setRejectReason(e.target.value)
                                    }
                                    placeholder="Jelaskan alasan penolakan..."
                                    rows={3}
                                    className="mt-1"
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
                                    className="border-0 bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25"
                                >
                                    <XCircle className="mr-2 h-4 w-4" /> Tolak
                                    Verifikasi
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
                <ExportModal
                    isOpen={showExportModal}
                    onClose={() => setShowExportModal(false)}
                    onExport={handleExport}
                    isExporting={isExporting}
                />
            </Dialog>
        </DosenLayout>
    );
}
