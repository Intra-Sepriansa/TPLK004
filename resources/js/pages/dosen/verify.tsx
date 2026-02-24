import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Camera, CheckCircle, XCircle, Clock, AlertTriangle, Sparkles,
    User, MapPin, Smartphone, Timer, Eye, Zap, Bot, Download,
    Search, List, Shield, TrendingUp, Target, Award,
    RefreshCw, ChevronRight, Check, X, Grid3x3, Brain,
    Activity, Fingerprint, Signal, Cpu, Heart, Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

/* ═══════════════════════════ HELPERS ═══════════════════════════ */
const scoreColor = (s: number) => s >= 85 ? 'text-emerald-600' : s >= 70 ? 'text-amber-600' : 'text-red-600';
const scoreBg = (s: number) => s >= 85 ? 'bg-emerald-500' : s >= 70 ? 'bg-amber-500' : 'bg-red-500';
const riskColor = (r: string) =>
    r === 'low' ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800/30' :
        r === 'medium' ? 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/30' :
            r === 'high' ? 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800/30' :
                'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800/30';

/* ═══════════════════════════ COMPONENT ═══════════════════════════ */
export default function DosenVerify({ dosen, verifications, stats }: PageProps) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectTarget, setRejectTarget] = useState<Verification | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);

    const filtered = useMemo(() => {
        return verifications.filter(v => {
            const matchSearch = v.mahasiswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) || v.mahasiswa.nim.includes(searchQuery) || v.course.toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = filterStatus === 'all' || v.status === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [verifications, searchQuery, filterStatus]);

    const doApprove = (v: Verification) => {
        setProcessingId(v.id);
        router.patch(`/dosen/verify/${v.id}/approve`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessingId(null),
        });
    };

    const openReject = (v: Verification) => { setRejectTarget(v); setRejectReason(''); setShowRejectDialog(true); };
    const doReject = () => {
        if (!rejectTarget) return;
        setProcessingId(rejectTarget.id);
        router.patch(`/dosen/verify/${rejectTarget.id}/reject`, { reason: rejectReason }, {
            preserveScroll: true,
            onSuccess: () => { setShowRejectDialog(false); setRejectTarget(null); },
            onFinish: () => setProcessingId(null),
        });
    };

    const statusBadge = (status: string) => {
        if (status === 'approved') return <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 gap-1 text-[10px]"><CheckCircle className="h-3 w-3" /> Disetujui</Badge>;
        if (status === 'rejected') return <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 gap-1 text-[10px]"><XCircle className="h-3 w-3" /> Ditolak</Badge>;
        return <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1 text-[10px]"><Clock className="h-3 w-3" /> Pending</Badge>;
    };

    const aiDecisionBadge = (dec: string) => {
        if (dec === 'approve') return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0 gap-1 text-[9px]"><Sparkles className="h-2.5 w-2.5" /> AI: Approve</Badge>;
        if (dec === 'reject') return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0 gap-1 text-[9px]"><AlertTriangle className="h-2.5 w-2.5" /> AI: Reject</Badge>;
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0 gap-1 text-[9px]"><Eye className="h-2.5 w-2.5" /> AI: Review</Badge>;
    };

    /* ═══ Summary Cards ═══ */
    /* ═══ Summary Cards ═══ */
    const summaryCards = [
        { key: 'total', label: 'Total Verifikasi', value: stats.total, sub: 'Total data masuk', icon: Camera, gradient: 'from-blue-400 to-indigo-600', glow: 'bg-blue-500', shadow: 'hover:shadow-blue-500/10' },
        { key: 'pending', label: 'Pending Review', value: stats.pending, sub: 'Perlu tinjauan', icon: Clock, gradient: 'from-amber-400 to-orange-600', glow: 'bg-amber-500', shadow: 'hover:shadow-amber-500/10' },
        { key: 'approved', label: 'Disetujui', value: stats.approved_today, sub: 'Hari ini', icon: CheckCircle, gradient: 'from-emerald-400 to-teal-600', glow: 'bg-emerald-500', shadow: 'hover:shadow-emerald-500/10' },
        { key: 'rejected', label: 'Ditolak', value: stats.rejected, sub: 'Ditolak sistem/dosen', icon: XCircle, gradient: 'from-red-400 to-rose-600', glow: 'bg-red-500', shadow: 'hover:shadow-red-500/10' },
    ];

    return (
        <DosenLayout>
            <Head title="Verifikasi Selfie — AI Powered" />

            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-4 md:p-6 space-y-6">

                {/* ═══════════════════ HERO HEADER ═══════════════════ */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }} transition={{ type: 'spring', stiffness: 300 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30">
                                    <Camera className="h-8 w-8 text-white" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-indigo-100 font-medium tracking-wide">Verifikasi Kehadiran</p>
                                    <h1 className="text-3xl font-bold text-white">Selfie Mahasiswa</h1>
                                    <p className="mt-1 text-indigo-100/80 text-sm max-w-lg">AI-Powered Multi-Layer Verification • Face Recognition • Liveness Detection • Fraud Analysis</p>
                                </div>
                            </div>

                            {/* AI Engine Status Badges (Simplified) */}
                            <div className="flex items-center gap-3">
                                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}
                                    className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg border border-white/10">
                                    <div className="p-2 bg-amber-500/20 rounded-lg"><Clock className="h-6 w-6 text-white" /></div>
                                    <div><p className="text-xs text-indigo-100">Pending</p><p className="text-2xl font-bold text-white">{stats.pending}</p></div>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7, type: 'spring' }}
                                    className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg border border-white/10">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg"><CheckCircle className="h-6 w-6 text-white" /></div>
                                    <div><p className="text-xs text-indigo-100">Hari Ini</p><p className="text-2xl font-bold text-white">{stats.today}</p></div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                            className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/10">
                            {[
                                { icon: Zap, label: 'Quick Verify' },
                                { icon: Bot, label: 'AI Auto-Verify All' },
                                { icon: Download, label: 'Export Report' },
                                { icon: RefreshCw, label: 'Refresh', onClick: () => router.reload() },
                            ].map((btn, i) => (
                                <motion.button key={i} whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }}
                                    onClick={btn.onClick}
                                    className="flex items-center gap-2 rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/25 border border-white/20 shadow-lg">
                                    <btn.icon className="h-4 w-4" /> {btn.label}
                                </motion.button>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══════════════════ SUMMARY CARDS ═══════════════════ */}
                {/* ═══════════════════ SUMMARY CARDS ═══════════════════ */}
                <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {summaryCards.map((card) => (
                        <motion.div key={card.key} variants={cardVariants} whileHover="hover" onHoverStart={() => setHoveredCard(card.key)} onHoverEnd={() => setHoveredCard(null)}
                            className={cn("group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl transition-all dark:border-white/5", card.shadow)}>
                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 dark:opacity-10", card.gradient)} />
                            <motion.div animate={{ scale: hoveredCard === card.key ? 1.5 : 1, opacity: hoveredCard === card.key ? 0.4 : 0.2 }}
                                className={cn("absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl transition-all duration-500", card.glow)} />
                            <div className="relative flex items-center gap-3">
                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }}
                                    className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", card.gradient)}>
                                    <card.icon className="h-6 w-6" />
                                </motion.div>
                                <div>
                                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{card.label}</p>
                                    <span className="text-xl font-bold text-neutral-900 dark:text-white">{card.value}</span>
                                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">{card.sub}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══════════════════ FILTERS ═══════════════════ */}
                <motion.div variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl p-5 dark:border-white/5">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input placeholder="Cari mahasiswa, NIM, atau mata kuliah..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 rounded-xl border-white/20 bg-white/60 dark:bg-neutral-800/60 backdrop-blur" />
                        </div>
                        <div className="flex items-center gap-2">
                            {[
                                { value: 'all', label: 'Semua', count: verifications.length },
                                { value: 'pending', label: 'Pending', count: stats.pending },
                                { value: 'approved', label: 'Disetujui', count: stats.approved_today },
                                { value: 'rejected', label: 'Ditolak', count: stats.rejected },
                            ].map(f => (
                                <Button key={f.value} size="sm" variant={filterStatus === f.value ? 'default' : 'outline'}
                                    onClick={() => setFilterStatus(f.value)}
                                    className={cn("h-9 rounded-xl text-xs gap-1.5", filterStatus === f.value && "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-lg shadow-indigo-500/25")}>
                                    {f.label} <span className="opacity-60">({f.count})</span>
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
                            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-emerald-300" />
                            </motion.div>
                            <p className="text-lg font-semibold text-neutral-500">Tidak ada data verifikasi</p>
                            <p className="text-sm text-neutral-400 mt-1">Belum ada selfie yang sesuai filter</p>
                        </motion.div>
                    ) : viewMode === 'grid' ? (
                        /* ─── GRID VIEW ─── */
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {filtered.map((v, idx) => (
                                <motion.div key={v.id} variants={cardVariants}
                                    initial="hidden" animate="visible" whileHover="hover"
                                    transition={{ delay: idx * 0.03 }}
                                    className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl">

                                    {/* Status / Risk accent bar */}
                                    <div className={cn("h-1.5",
                                        v.status === 'pending' && v.risk_level === 'low' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                                            v.status === 'pending' && (v.risk_level === 'high' || v.risk_level === 'critical') ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                                                v.status === 'approved' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' :
                                                    v.status === 'rejected' ? 'bg-gradient-to-r from-red-400 to-rose-500' :
                                                        'bg-gradient-to-r from-amber-400 to-orange-500')} />

                                    <div className="p-5 space-y-4">
                                        {/* Student Info Row */}
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-11 w-11 flex-shrink-0 border-2 border-white dark:border-neutral-800 shadow-md ring-2 ring-neutral-100 dark:ring-neutral-800">
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
                                            onClick={() => router.visit(`/dosen/verify/${v.id}`)}>
                                            {v.selfie_url ? (
                                                <img src={v.selfie_url} alt="Selfie" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full"><Camera className="h-10 w-10 text-neutral-300" /></div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                                                <span className="text-white text-xs font-semibold flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> Lihat Detail AI Analysis</span>
                                            </div>
                                            {/* AI Confidence overlay */}
                                            <div className="absolute top-2 right-2">
                                                <div className={cn("px-2 py-1 rounded-lg text-[10px] font-bold text-white backdrop-blur-xl",
                                                    v.ai_confidence >= 80 ? "bg-emerald-500/80" : v.ai_confidence >= 60 ? "bg-amber-500/80" : "bg-red-500/80")}>
                                                    <Sparkles className="h-2.5 w-2.5 inline mr-0.5" /> AI {v.ai_confidence}%
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Analysis Grid */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 text-center">
                                                <User className="h-3 w-3 mx-auto text-purple-500 mb-0.5" />
                                                <p className="text-[8px] font-bold text-neutral-400 uppercase">Face</p>
                                                <p className={cn("text-xs font-bold", scoreColor(v.face_match_score))}>{v.face_match_score}%</p>
                                            </div>
                                            <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 text-center">
                                                <Heart className="h-3 w-3 mx-auto text-pink-500 mb-0.5" />
                                                <p className="text-[8px] font-bold text-neutral-400 uppercase">Liveness</p>
                                                <p className={cn("text-xs font-bold", scoreColor(v.liveness_score))}>{v.liveness_score}%</p>
                                            </div>
                                            <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 text-center">
                                                <Shield className="h-3 w-3 mx-auto text-indigo-500 mb-0.5" />
                                                <p className="text-[8px] font-bold text-neutral-400 uppercase">Risk</p>
                                                <p className={cn("text-xs font-bold",
                                                    v.risk_level === 'low' ? 'text-emerald-600' : v.risk_level === 'medium' ? 'text-amber-600' : 'text-red-600')}>{v.risk_level.toUpperCase()}</p>
                                            </div>
                                        </div>

                                        {/* Course & Location */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                                                <p className="text-[8px] font-bold text-neutral-400 uppercase">Mata Kuliah</p>
                                                <p className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 truncate">{v.course}</p>
                                            </div>
                                            <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                                                <p className="text-[8px] font-bold text-neutral-400 uppercase">Jarak</p>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className={cn("h-2.5 w-2.5", v.location_verified ? "text-emerald-500" : "text-red-500")} />
                                                    <p className={cn("text-[11px] font-bold", v.distance <= 100 ? "text-emerald-600" : v.distance <= 500 ? "text-amber-600" : "text-red-600")}>{v.distance}m</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Decision & Meta */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                {aiDecisionBadge(v.ai_decision)}
                                                {v.device_trusted && <Badge className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-0 text-[9px] gap-1"><Smartphone className="h-2.5 w-2.5" /> Trusted</Badge>}
                                            </div>
                                            <span className="text-[9px] text-neutral-400 flex items-center gap-1"><Timer className="h-2.5 w-2.5" /> {v.total_processing_time_ms}ms</span>
                                        </div>

                                        {/* Time */}
                                        <div className="flex items-center justify-between text-[10px] text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 pt-2">
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {v.date_display} {v.time_display}</span>
                                            <span className="flex items-center gap-1"><Smartphone className="h-3 w-3" /> {v.device_type}</span>
                                        </div>

                                        {/* Warnings */}
                                        {v.warnings.length > 0 && (
                                            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/30">
                                                <p className="text-[9px] font-bold text-red-500 mb-1 flex items-center gap-1"><AlertTriangle className="h-2.5 w-2.5" /> {v.warnings.length} Warning(s)</p>
                                                {v.warnings.slice(0, 2).map((w, i) => (
                                                    <p key={i} className="text-[9px] text-red-600/80 dark:text-red-300/80 truncate">• {w}</p>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {v.status === 'pending' && (
                                            <div className="flex gap-2 pt-1">
                                                <Button size="sm" onClick={(e) => { e.stopPropagation(); doApprove(v); }} disabled={processingId === v.id}
                                                    className="flex-1 h-9 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs shadow-lg shadow-emerald-500/25 border-0">
                                                    <Check className="h-3.5 w-3.5 mr-1" /> Setujui
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openReject(v); }} disabled={processingId === v.id}
                                                    className="h-9 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800/30 dark:hover:bg-red-900/10">
                                                    <X className="h-3.5 w-3.5 mr-1" /> Tolak
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => router.visit(`/dosen/verify/${v.id}`)} className="h-9 w-9 p-0">
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                        {v.status !== 'pending' && (
                                            <div className="flex gap-2 pt-1">
                                                <Button size="sm" variant="outline" onClick={() => router.visit(`/dosen/verify/${v.id}`)}
                                                    className="flex-1 h-9 text-xs gap-1.5">
                                                    <Eye className="h-3.5 w-3.5" /> Lihat Detail AI Analysis
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
                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Mahasiswa</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Mata Kuliah</th>
                                            <th className="px-3 py-3 text-center text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Face</th>
                                            <th className="px-3 py-3 text-center text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Live</th>
                                            <th className="px-3 py-3 text-center text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Risk</th>
                                            <th className="px-3 py-3 text-center text-[10px] font-bold text-neutral-500 uppercase tracking-wider">AI</th>
                                            <th className="px-3 py-3 text-center text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Jarak</th>
                                            <th className="px-3 py-3 text-center text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Waktu</th>
                                            <th className="px-4 py-3 text-center text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {filtered.map((v, i) => (
                                            <motion.tr key={v.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                                                className={cn("hover:bg-white/60 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer",
                                                    v.is_suspicious && "bg-orange-50/30 dark:bg-orange-900/5")}
                                                onClick={() => router.visit(`/dosen/verify/${v.id}`)}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8"><AvatarImage src={v.mahasiswa.avatar_url || undefined} /><AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-[10px]">{v.mahasiswa.nama[0]}</AvatarFallback></Avatar>
                                                        <div><p className="font-semibold text-xs">{v.mahasiswa.nama}</p><p className="text-[10px] text-neutral-500">{v.mahasiswa.nim}</p></div>
                                                        {v.is_suspicious && <AlertTriangle className="h-3 w-3 text-orange-500 animate-pulse" />}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-neutral-600 dark:text-neutral-400 text-xs max-w-[120px] truncate">{v.course}</td>
                                                <td className="px-3 py-3 text-center"><span className={cn("text-xs font-bold", scoreColor(v.face_match_score))}>{v.face_match_score}%</span></td>
                                                <td className="px-3 py-3 text-center"><span className={cn("text-xs font-bold", scoreColor(v.liveness_score))}>{v.liveness_score}%</span></td>
                                                <td className="px-3 py-3 text-center"><Badge className={cn("text-[9px] border", riskColor(v.risk_level))}>{v.risk_level}</Badge></td>
                                                <td className="px-3 py-3 text-center"><span className={cn("text-xs font-bold", scoreColor(v.ai_confidence))}>{v.ai_confidence}%</span></td>
                                                <td className="px-3 py-3 text-center"><span className={cn("text-xs font-bold", v.distance <= 100 ? "text-emerald-600" : v.distance <= 500 ? "text-amber-600" : "text-red-600")}>{v.distance}m</span></td>
                                                <td className="px-3 py-3 text-center">{statusBadge(v.status)}</td>
                                                <td className="px-4 py-3 text-[10px] text-neutral-500 whitespace-nowrap">{v.date_display} {v.time_display}</td>
                                                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-1">
                                                        {v.status === 'pending' && <>
                                                            <Button size="sm" className="h-7 px-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0" onClick={() => doApprove(v)} disabled={processingId === v.id}><Check className="h-3 w-3" /></Button>
                                                            <Button size="sm" variant="destructive" className="h-7 px-2" onClick={() => openReject(v)}><X className="h-3 w-3" /></Button>
                                                        </>}
                                                        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => router.visit(`/dosen/verify/${v.id}`)}><Eye className="h-3 w-3" /></Button>
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
                            <div className="relative">
                                <DialogTitle className="text-xl text-white flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur"><XCircle className="h-5 w-5" /></div>
                                    Tolak Verifikasi
                                </DialogTitle>
                            </div>
                        </div>
                    </DialogHeader>
                    {rejectTarget && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={rejectTarget.mahasiswa.avatar_url || undefined} />
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white">{rejectTarget.mahasiswa.nama[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-sm">{rejectTarget.mahasiswa.nama}</p>
                                    <p className="text-xs text-neutral-500">{rejectTarget.mahasiswa.nim} • {rejectTarget.course}</p>
                                </div>
                            </div>

                            {/* AI Risk Info */}
                            {rejectTarget.warnings.length > 0 && (
                                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30">
                                    <p className="text-[10px] font-bold text-amber-600 mb-1 flex items-center gap-1"><Brain className="h-3 w-3" /> AI Warning(s)</p>
                                    {rejectTarget.warnings.map((w, i) => (
                                        <p key={i} className="text-[10px] text-amber-700/80">• {w}</p>
                                    ))}
                                </div>
                            )}

                            <div>
                                <Label>Alasan Penolakan</Label>
                                <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Jelaskan alasan penolakan..." rows={3} className="mt-1" />
                            </div>
                            <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Batal</Button>
                                <Button onClick={doReject} disabled={!rejectReason || processingId === rejectTarget.id}
                                    className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 shadow-lg shadow-red-500/25">
                                    <XCircle className="h-4 w-4 mr-2" /> Tolak Verifikasi
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DosenLayout>
    );
}
