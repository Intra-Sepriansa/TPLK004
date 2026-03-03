import { Head, router } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, CheckCircle, XCircle, Clock, AlertTriangle, Sparkles,
    User, MapPin, Smartphone, Timer, Eye, Zap, Bot, Download,
    Filter, Search, List, Calendar, Shield,
    TrendingUp, Users, Target, Award, RefreshCw,
    ChevronRight, Check, X, Info, BarChart3, Grid3x3,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import moment from 'moment';
import SelfieIcon from '@/assets/admin/verifikasi-selfie/verifikasi-selfie.png';
import TotalSelfieIcon from '@/assets/admin/verifikasi-selfie/total-selfie.png';
import PendingIcon from '@/assets/admin/verifikasi-selfie/pending.png';
import DisetujuiIcon from '@/assets/admin/verifikasi-selfie/disetujui.png';
import DitolakSelfieIcon from '@/assets/admin/verifikasi-selfie/ditolak.png';

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
    visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
} as const;

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
    hover: { scale: 1.03, y: -8, transition: { type: 'spring' as const, stiffness: 400, damping: 10 } },
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
        return verifications.filter(v => {
            const matchSearch = v.mahasiswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) || v.mahasiswa.nim.includes(searchQuery);
            const matchStatus = filterStatus === 'all' || v.status === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [verifications, searchQuery, filterStatus]);

    const doApprove = (v: Verification) => {
        setProcessingId(v.id);
        router.patch(`/dosen/verification/${v.id}/approve`, {}, {
            onFinish: () => setProcessingId(null),
        });
    };

    const openReject = (v: Verification) => { setRejectTarget(v); setRejectReason(''); setShowRejectDialog(true); };
    const doReject = () => {
        if (!rejectTarget) return;
        setProcessingId(rejectTarget.id);
        router.patch(`/dosen/verification/${rejectTarget.id}/reject`, { reason: rejectReason }, {
            onSuccess: () => { setShowRejectDialog(false); setRejectTarget(null); },
            onFinish: () => setProcessingId(null),
        });
    };

    const statusBadge = (status: string) => {
        if (status === 'approved') return <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 gap-1"><CheckCircle className="h-3 w-3" /> Disetujui</Badge>;
        if (status === 'rejected') return <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 gap-1"><XCircle className="h-3 w-3" /> Ditolak</Badge>;
        return <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
    };

    const confidenceColor = (c: number) => c >= 85 ? 'text-emerald-600' : c >= 70 ? 'text-amber-600' : 'text-red-600';
    const confidenceBg = (c: number) => c >= 85 ? 'bg-emerald-500' : c >= 70 ? 'bg-amber-500' : 'bg-red-500';

    /* ═══ Card data for summary row ═══ */
    /* ═══ Card data for summary row ═══ */
    const summaryCards = [
        { key: 'total', label: 'Total Verifikasi', value: stats.total, sub: 'Total data masuk', imgSrc: TotalSelfieIcon, gradient: 'from-blue-400 to-indigo-600', glow: 'bg-blue-500', shadow: 'hover:shadow-blue-500/10' },
        { key: 'pending', label: 'Pending Review', value: stats.pending, sub: 'Perlu tinjauan', imgSrc: PendingIcon, gradient: 'from-amber-400 to-orange-600', glow: 'bg-amber-500', shadow: 'hover:shadow-amber-500/10' },
        { key: 'approved', label: 'Disetujui', value: stats.approved_today, sub: 'Hari ini', imgSrc: DisetujuiIcon, gradient: 'from-emerald-400 to-teal-600', glow: 'bg-emerald-500', shadow: 'hover:shadow-emerald-500/10' },
        { key: 'rejected', label: 'Ditolak', value: stats.rejected, sub: 'Ditolak sistem/dosen', imgSrc: DitolakSelfieIcon, gradient: 'from-red-400 to-rose-600', glow: 'bg-red-500', shadow: 'hover:shadow-red-500/10' },
    ];

    return (
        <DosenLayout>
            <Head title="Verifikasi Selfie" />

            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-4 md:p-6 space-y-6">

                {/* ═══════════════════ HERO HEADER ═══════════════════ */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left w-full lg:w-auto">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                >
                                    <img src={SelfieIcon} alt="Verifikasi" className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
                                </motion.div>
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <motion.p className="text-sm text-indigo-100 font-medium tracking-wide"
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>Verifikasi Kehadiran</motion.p>
                                    <motion.h1 className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>Selfie Mahasiswa</motion.h1>
                                    <motion.p className="mt-2 text-indigo-100/80 text-sm leading-relaxed max-w-lg"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>AI-Powered Face Recognition & Fraud Detection System</motion.p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center lg:items-end gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                                <div className="flex flex-wrap justify-center gap-3">
                                    <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}
                                        className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-5 py-3 shadow-lg border border-white/10">
                                        <div className="p-2 bg-amber-500/20 rounded-lg"><Clock className="h-5 w-5 text-white" /></div>
                                        <div><p className="text-xs text-indigo-100">Pending</p><p className="text-xl font-bold text-white">{stats.pending}</p></div>
                                    </motion.div>
                                    <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7, type: 'spring' }}
                                        className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-5 py-3 shadow-lg border border-white/10">
                                        <div className="p-2 bg-emerald-500/20 rounded-lg"><CheckCircle className="h-5 w-5 text-white" /></div>
                                        <div><p className="text-xs text-indigo-100">Hari Ini</p><p className="text-xl font-bold text-white">{stats.today}</p></div>
                                    </motion.div>
                                </div>
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                    className="flex flex-wrap justify-center gap-2">
                                    {[
                                        { icon: Zap, label: 'Quick Verify' },
                                        { icon: Bot, label: 'Auto Verify' },
                                        { icon: Download, label: 'Export' },
                                        { icon: RefreshCw, label: 'Refresh', onClick: () => router.reload() },
                                    ].map((btn, i) => (
                                        <motion.button key={i} whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }}
                                            onClick={btn.onClick}
                                            className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/30 border border-white/20 shadow-lg">
                                            <btn.icon className="h-4 w-4" /> {btn.label}
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
                    initial="hidden" animate="visible"
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.2 } } }}
                >
                    {summaryCards.map((card, i) => {
                        const colorMap: Record<string, any> = {
                            'bg-blue-500': { from: 'from-blue-400', to: 'to-indigo-600', gradientBg: 'from-blue-500/5 to-indigo-500/5', hoverShadow: 'hover:shadow-blue-500/10' },
                            'bg-amber-500': { from: 'from-amber-400', to: 'to-orange-600', gradientBg: 'from-amber-500/5 to-orange-500/5', hoverShadow: 'hover:shadow-amber-500/10' },
                            'bg-emerald-500': { from: 'from-emerald-400', to: 'to-teal-600', gradientBg: 'from-emerald-500/5 to-teal-500/5', hoverShadow: 'hover:shadow-emerald-500/10' },
                            'bg-red-500': { from: 'from-red-400', to: 'to-rose-600', gradientBg: 'from-red-500/5 to-rose-500/5', hoverShadow: 'hover:shadow-red-500/10' },
                        };
                        const cc = colorMap[card.glow] || colorMap['bg-blue-500'];
                        return (
                            <motion.div key={card.key}
                                variants={{ hidden: { opacity: 0, y: 30, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } } }}
                                whileHover={{ y: -5, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                                onHoverStart={() => setHoveredCard(card.key)} onHoverEnd={() => setHoveredCard(null)}
                                className={cn(`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 sm:p-5 shadow-xl backdrop-blur-xl transition-all dark:border-white/5`, cc.hoverShadow)}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${cc.gradientBg} opacity-50 dark:opacity-100`} />
                                <motion.div className={cn(`absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl transition-all`, card.glow)} animate={{ opacity: hoveredCard === card.key ? 0.4 : 0.15 }} />
                                <div className="relative z-10 flex flex-col items-center sm:items-start gap-3 h-full justify-between">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
                                        <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="relative flex shrink-0 h-10 w-10 sm:h-12 sm:w-12 items-center justify-center">
                                            <img src={card.imgSrc} alt={card.label} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" />
                                        </motion.div>
                                        <div>
                                            <p className="text-[10px] sm:text-xs font-medium text-neutral-500 dark:text-neutral-400">{card.label}</p>
                                            <span className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{card.value}</span>
                                            <p className="hidden sm:block text-[10px] text-neutral-400 mt-0.5">{card.sub}</p>
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══════════════════ FILTERS & SEARCH ═══════════════════ */}
                {/* ═══════════════════ FILTERS & SEARCH ═══════════════════ */}
                <motion.div variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl p-5 dark:border-white/5">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input placeholder="Cari mahasiswa..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 rounded-xl border-white/20 bg-white/60 dark:bg-neutral-800/60" />
                        </div>

                        <div className="flex items-center gap-2">
                            {[
                                { value: 'all', label: 'Semua' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'approved', label: 'Disetujui' },
                                { value: 'rejected', label: 'Ditolak' },
                            ].map(f => (
                                <Button key={f.value} size="sm" variant={filterStatus === f.value ? 'default' : 'outline'}
                                    onClick={() => setFilterStatus(f.value)}
                                    className={cn("h-9 rounded-xl text-xs", filterStatus === f.value && "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0")}>
                                    {f.label}
                                </Button>
                            ))}
                        </div>

                        <div className="flex items-center gap-1 border border-white/20 rounded-xl p-1 bg-white/30 dark:bg-neutral-800/30">
                            <Button size="sm" variant="ghost" onClick={() => setViewMode('grid')} className={cn("h-8 w-8 p-0 rounded-lg", viewMode === 'grid' && "bg-white dark:bg-neutral-700 shadow")}>
                                <Grid3x3 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setViewMode('list')} className={cn("h-8 w-8 p-0 rounded-lg", viewMode === 'list' && "bg-white dark:bg-neutral-700 shadow")}>
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════════════════ VERIFICATION LIST ═══════════════════ */}
                <motion.div variants={containerVariants}>
                    {filtered.length === 0 ? (
                        <motion.div variants={itemVariants} className="text-center py-16 rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl">
                            <Camera className="h-16 w-16 mx-auto mb-4 text-neutral-300" />
                            <p className="text-lg font-semibold text-neutral-500">Tidak ada data verifikasi</p>
                            <p className="text-sm text-neutral-400 mt-1">Belum ada selfie yang perlu diverifikasi</p>
                        </motion.div>
                    ) : viewMode === 'grid' ? (
                        /* ─── GRID VIEW ─── */
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {filtered.map((v, idx) => (
                                <motion.div key={v.id} variants={cardVariants}
                                    initial="hidden" animate="visible" whileHover="hover"
                                    transition={{ delay: idx * 0.05 }}
                                    className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl">



                                    <div className="p-5 space-y-4">
                                        {/* Student Info */}
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-12 w-12 flex-shrink-0 border-2 border-white dark:border-neutral-800 shadow-md ring-2 ring-neutral-100 dark:ring-neutral-800">
                                                <AvatarImage src={v.mahasiswa.avatar_url || undefined} />
                                                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-sm font-bold">{v.mahasiswa.nama[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-neutral-900 dark:text-white truncate">{v.mahasiswa.nama}</p>
                                                <p className="text-[11px] text-neutral-500">{v.mahasiswa.nim}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                {statusBadge(v.status)}
                                                {v.is_suspicious && <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-0 text-[9px] gap-1"><AlertTriangle className="h-2.5 w-2.5" /> Suspicious</Badge>}
                                            </div>
                                        </div>

                                        {/* Selfie Preview */}
                                        <div className="relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 h-40 cursor-pointer"
                                            onClick={() => router.visit(`/dosen/verification/${v.id}`)}>
                                            {v.selfie_url ? (
                                                <img src={v.selfie_url} alt="Selfie" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full"><Camera className="h-10 w-10 text-neutral-300" /></div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                                                <span className="text-white text-xs font-semibold flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> Lihat Detail</span>
                                            </div>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                                                <p className="text-[9px] font-bold text-neutral-400 uppercase">Mata Kuliah</p>
                                                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 truncate">{v.course}</p>
                                            </div>
                                            <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                                                <p className="text-[9px] font-bold text-neutral-400 uppercase">Jarak</p>
                                                <p className={cn("text-xs font-semibold", v.distance <= 100 ? "text-emerald-600" : v.distance <= 500 ? "text-amber-600" : "text-red-600")}>{v.distance}m</p>
                                            </div>
                                            <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                                                <p className="text-[9px] font-bold text-neutral-400 uppercase">AI Confidence</p>
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles className="h-3 w-3 text-purple-500" />
                                                    <span className={cn("text-xs font-bold", confidenceColor(v.ai_confidence))}>{v.ai_confidence}%</span>
                                                </div>
                                            </div>
                                            <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                                                <p className="text-[9px] font-bold text-neutral-400 uppercase">Face Match</p>
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3 w-3 text-indigo-500" />
                                                    <span className={cn("text-xs font-bold", confidenceColor(v.face_match_score))}>{v.face_match_score}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Time & Device */}
                                        <div className="flex items-center justify-between text-[10px] text-neutral-400">
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {v.date_display} {v.time_display}</span>
                                            <span className="flex items-center gap-1"><Smartphone className="h-3 w-3" /> {v.device_type}</span>
                                        </div>

                                        {/* Actions */}
                                        {v.status === 'pending' && (
                                            <div className="flex gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                                <Button size="sm" onClick={() => doApprove(v)} disabled={processingId === v.id}
                                                    className="flex-1 h-9 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs shadow-lg">
                                                    <Check className="h-3.5 w-3.5 mr-1" /> Setujui
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => openReject(v)} disabled={processingId === v.id}
                                                    className="h-9 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800/30">
                                                    <X className="h-3.5 w-3.5 mr-1" /> Tolak
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => router.visit(`/dosen/verification/${v.id}`)}
                                                    className="h-9 text-xs">
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                        {v.status !== 'pending' && (
                                            <div className="flex gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                                <Button size="sm" variant="outline" onClick={() => router.visit(`/dosen/verification/${v.id}`)}
                                                    className="flex-1 h-9 text-xs">
                                                    <Eye className="h-3.5 w-3.5 mr-1" /> Detail
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        /* ─── LIST VIEW ─── */
                        <div className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/50">
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Mahasiswa</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Mata Kuliah</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">Jarak</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">AI</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">Face</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Waktu</th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {filtered.map((v, i) => (
                                            <motion.tr key={v.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                                                className={cn("hover:bg-white/60 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer", v.is_suspicious && "bg-orange-50/30 dark:bg-orange-900/5")}
                                                onClick={() => router.visit(`/dosen/verification/${v.id}`)}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9"><AvatarImage src={v.mahasiswa.avatar_url || undefined} /><AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-[10px]">{v.mahasiswa.nama[0]}</AvatarFallback></Avatar>
                                                        <div><p className="font-semibold text-sm">{v.mahasiswa.nama}</p><p className="text-[11px] text-neutral-500">{v.mahasiswa.nim}</p></div>
                                                        {v.is_suspicious && <AlertTriangle className="h-3.5 w-3.5 text-orange-500 animate-pulse" />}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 text-xs">{v.course}</td>
                                                <td className="px-4 py-3 text-center"><span className={cn("text-xs font-bold", v.distance <= 100 ? "text-emerald-600" : v.distance <= 500 ? "text-amber-600" : "text-red-600")}>{v.distance}m</span></td>
                                                <td className="px-4 py-3 text-center"><span className={cn("text-xs font-bold", confidenceColor(v.ai_confidence))}>{v.ai_confidence}%</span></td>
                                                <td className="px-4 py-3 text-center"><span className={cn("text-xs font-bold", confidenceColor(v.face_match_score))}>{v.face_match_score}%</span></td>
                                                <td className="px-4 py-3 text-center">{statusBadge(v.status)}</td>
                                                <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">{v.date_display} {v.time_display}</td>
                                                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-1">
                                                        {v.status === 'pending' && <>
                                                            <Button size="sm" className="h-7 px-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white" onClick={() => doApprove(v)} disabled={processingId === v.id}><Check className="h-3 w-3" /></Button>
                                                            <Button size="sm" variant="destructive" className="h-7 px-2" onClick={() => openReject(v)}><X className="h-3 w-3" /></Button>
                                                        </>}
                                                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => router.visit(`/dosen/verification/${v.id}`)}><Eye className="h-3 w-3" /></Button>
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
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 rounded-2xl">
                    <DialogHeader>
                        <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 p-6 -m-6 mb-4">
                            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                            <div className="relative"><DialogTitle className="text-xl text-white flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur"><XCircle className="h-5 w-5" /></div>Tolak Verifikasi</DialogTitle></div>
                        </div>
                    </DialogHeader>
                    {rejectTarget && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                                <Avatar className="h-10 w-10"><AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white">{rejectTarget.mahasiswa.nama[0]}</AvatarFallback></Avatar>
                                <div><p className="font-semibold text-sm">{rejectTarget.mahasiswa.nama}</p><p className="text-xs text-neutral-500">{rejectTarget.mahasiswa.nim}</p></div>
                            </div>
                            <div><Label>Alasan Penolakan</Label><Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Jelaskan alasan penolakan..." rows={3} /></div>
                            <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Batal</Button>
                                <Button onClick={doReject} disabled={!rejectReason || processingId === rejectTarget.id}
                                    className="bg-gradient-to-r from-red-500 to-rose-600 text-white"><XCircle className="h-4 w-4 mr-2" /> Tolak</Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DosenLayout>
    );
}
