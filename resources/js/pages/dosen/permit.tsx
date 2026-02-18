import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import DosenLayout from '@/layouts/dosen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock, CheckCircle, XCircle, Zap, Heart, Users, Calendar, AlertTriangle, Timer,
    Sparkles, ArrowUpDown, RefreshCw, Paperclip, Eye, Check, X, Archive, ChevronLeft, ChevronRight,
    Search, LayoutGrid, List, FileText, Shield, Trophy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

// ═══ Types ═══
type Permit = {
    id: number;
    mahasiswa: { id: number; nama: string; nim: string; avatar?: string };
    type: 'izin' | 'sakit';
    reason: string;
    attachment: string | null;
    attachments: { id: number; url: string; name: string }[];
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason: string | null;
    session: { id: number; mata_kuliah: string; tanggal: string; tanggal_display: string };
    created_at: string;
    start_date: string;
    end_date: string;
    duration: number;
    is_urgent: boolean;
    ai_confidence: number;
    ai_recommendation: 'approve' | 'reject' | 'review';
    document_score: number;
};
type Session = { id: number; mata_kuliah: string; tanggal: string; tanggal_display: string };
type Stats = { total: number; pending: number; approved_today: number; rejected: number; auto_approved: number; sick_leave: number; family_emergency: number; official_event: number; suspicious: number; avg_response_time: number };
type Props = { permits: Permit[]; sessions: Session[]; stats: Stats; filters: any };

// ═══ Animation Variants (EXACT from Kas Admin) ═══
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } } as const;
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } } as const;
const cardVariants = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }, hover: { scale: 1.03, y: -8, transition: { type: 'spring', stiffness: 400, damping: 10 } } } as const;

// ═══ Helpers ═══
const formatDateRange = (start: string, end: string) => start === end ? moment(start).format('DD MMM YYYY') : `${moment(start).format('DD MMM')} – ${moment(end).format('DD MMM YYYY')}`;
const formatRelativeTime = (date: string) => moment(date, 'DD MMM YYYY HH:mm').fromNow();

export default function PermitPage({ permits: initialPermits, sessions, stats, filters }: Props) {
    const [permits, setPermits] = useState(initialPermits);
    const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'calendar'>('kanban');
    const [search, setSearch] = useState('');
    const [selectedSession, setSelectedSession] = useState(filters.session_id || 'all');
    const [selectedType, setSelectedType] = useState('all');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // Modal State
    const [detailPermit, setDetailPermit] = useState<Permit | null>(null);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(moment());

    // Table Selection
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const filteredPermits = useMemo(() => {
        return permits.filter(p => {
            const matchSearch = p.mahasiswa.nama.toLowerCase().includes(search.toLowerCase()) || p.mahasiswa.nim.includes(search);
            const matchSession = selectedSession === 'all' || p.session.id.toString() === selectedSession;
            const matchType = selectedType === 'all' || p.type === selectedType;
            return matchSearch && matchSession && matchType;
        });
    }, [permits, search, selectedSession, selectedType]);

    const pendingPermits = filteredPermits.filter(p => p.status === 'pending');
    const approvedPermits = filteredPermits.filter(p => p.status === 'approved');
    const rejectedPermits = filteredPermits.filter(p => p.status === 'rejected');

    // ═══ Actions ═══
    const quickApprove = (permit: Permit) => {
        setProcessingId(permit.id);
        router.patch(route('dosen.permits.approve', permit.id), {}, {
            onSuccess: () => { setPermits(prev => prev.map(p => p.id === permit.id ? { ...p, status: 'approved' } : p)); setProcessingId(null); setDetailPermit(null); },
            onError: () => setProcessingId(null),
        });
    };

    const quickReject = (permit: Permit) => { setDetailPermit(permit); setIsRejectionModalOpen(true); };

    const handleReject = () => {
        if (!detailPermit || !rejectionReason) return;
        setProcessingId(detailPermit.id);
        router.patch(route('dosen.permits.reject', detailPermit.id), { rejection_reason: rejectionReason }, {
            onSuccess: () => { setPermits(prev => prev.map(p => p.id === detailPermit.id ? { ...p, status: 'rejected', rejection_reason: rejectionReason } : p)); setProcessingId(null); setDetailPermit(null); setIsRejectionModalOpen(false); setRejectionReason(''); },
            onError: () => setProcessingId(null),
        });
    };

    const handleBulkApprove = () => {
        if (selectedIds.length === 0) return;
        router.post(route('dosen.permits.bulk-approve'), { permit_ids: selectedIds }, {
            onSuccess: () => { setPermits(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, status: 'approved' } : p)); setSelectedIds([]); },
        });
    };

    const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const selectAll = () => { const pendingIds = pendingPermits.map(p => p.id); setSelectedIds(prev => prev.length === pendingIds.length ? [] : pendingIds); };

    // ═══ Badge Helpers ═══
    const getPermitTypeBadge = (type: string) => type === 'sakit'
        ? <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:text-pink-300"><Heart className="h-3 w-3 mr-1" /> Sakit</Badge>
        : <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300"><FileText className="h-3 w-3 mr-1" /> Izin</Badge>;

    const getStatusBadge = (status: string) => {
        if (status === 'approved') return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white"><CheckCircle className="h-3 w-3 mr-1" /> Disetujui</Badge>;
        if (status === 'rejected') return <Badge className="bg-red-500 hover:bg-red-600 text-white"><XCircle className="h-3 w-3 mr-1" /> Ditolak</Badge>;
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white"><Clock className="h-3 w-3 mr-1" /> Menunggu</Badge>;
    };

    // ═══ Summary Card Data ═══
    const summaryCards = [
        { key: 'total', title: 'Total Requests', value: stats.total, subtitle: `${stats.total} bulan ini`, Icon: FileText, gradient: 'from-blue-400 to-indigo-600', shadowColor: 'shadow-blue-500/30', glowBg: 'bg-blue-500', overlayGradient: 'from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10', hoverShadow: 'hover:shadow-blue-500/10', trend: 'up' as const },
        { key: 'pending', title: 'Pending Approval', value: stats.pending, subtitle: 'perlu review segera', Icon: Clock, gradient: 'from-amber-400 to-orange-600', shadowColor: 'shadow-amber-500/30', glowBg: 'bg-amber-500', overlayGradient: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10', hoverShadow: 'hover:shadow-amber-500/10', pulse: stats.pending > 5 },
        { key: 'approved', title: 'Approved Today', value: stats.approved_today, subtitle: `${stats.approved_today} dari ${stats.total} request`, Icon: CheckCircle, gradient: 'from-emerald-400 to-teal-600', shadowColor: 'shadow-emerald-500/30', glowBg: 'bg-emerald-500', overlayGradient: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10', hoverShadow: 'hover:shadow-emerald-500/10' },
        { key: 'rejected', title: 'Rejected', value: stats.rejected, subtitle: 'dengan alasan', Icon: XCircle, gradient: 'from-red-400 to-rose-600', shadowColor: 'shadow-red-500/30', glowBg: 'bg-red-500', overlayGradient: 'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10', hoverShadow: 'hover:shadow-red-500/10' },
        { key: 'auto', title: 'Auto-Approved', value: stats.auto_approved, subtitle: 'by AI system', Icon: Zap, gradient: 'from-purple-400 to-violet-600', shadowColor: 'shadow-purple-500/30', glowBg: 'bg-purple-500', overlayGradient: 'from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10', hoverShadow: 'hover:shadow-purple-500/10', ai: true },
        { key: 'sick', title: 'Sick Leave', value: stats.sick_leave, subtitle: 'dengan surat dokter', Icon: Heart, gradient: 'from-pink-400 to-rose-600', shadowColor: 'shadow-pink-500/30', glowBg: 'bg-pink-500', overlayGradient: 'from-pink-500/5 to-rose-500/5 dark:from-pink-500/10 dark:to-rose-500/10', hoverShadow: 'hover:shadow-pink-500/10' },
        { key: 'family', title: 'Family Emergency', value: stats.family_emergency, subtitle: 'urgent cases', Icon: Users, gradient: 'from-orange-400 to-red-600', shadowColor: 'shadow-orange-500/30', glowBg: 'bg-orange-500', overlayGradient: 'from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10', hoverShadow: 'hover:shadow-orange-500/10' },
        { key: 'event', title: 'Official Event', value: stats.official_event, subtitle: 'lomba, seminar, dll', Icon: Trophy, gradient: 'from-indigo-400 to-purple-600', shadowColor: 'shadow-indigo-500/30', glowBg: 'bg-indigo-500', overlayGradient: 'from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10', hoverShadow: 'hover:shadow-indigo-500/10' },
        { key: 'suspicious', title: 'Suspicious Patterns', value: stats.suspicious, subtitle: 'perlu verifikasi', Icon: AlertTriangle, gradient: 'from-red-500 to-orange-600', shadowColor: 'shadow-red-500/30', glowBg: 'bg-red-600', overlayGradient: 'from-red-500/5 to-orange-500/5 dark:from-red-500/10 dark:to-orange-500/10', hoverShadow: 'hover:shadow-red-500/10', alert: true },
        { key: 'response', title: 'Avg Response Time', value: `${stats.avg_response_time}h`, subtitle: 'dalam jam', Icon: Timer, gradient: 'from-green-400 to-emerald-600', shadowColor: 'shadow-green-500/30', glowBg: 'bg-green-500', overlayGradient: 'from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10', hoverShadow: 'hover:shadow-green-500/10' },
    ];

    // ═══ Calendar Helpers ═══
    const calendarDays = useMemo(() => {
        const start = moment(currentMonth).startOf('month').startOf('week');
        return Array.from({ length: 42 }, (_, i) => moment(start).add(i, 'days'));
    }, [currentMonth]);

    const getPermitsForDay = (day: moment.Moment) => filteredPermits.filter(p => p.start_date === day.format('YYYY-MM-DD'));

    return (
        <DosenLayout title="Persetujuan Izin">
            <Head title="Persetujuan Izin" />
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-6 space-y-6">

                {/* ═══ HEADER — Exact Kas Admin Style ═══ */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl">
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} style={{ backgroundSize: '200% 200%' }} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    {/* 3 Pulse Rings */}
                    {[0, 1, 2].map(delay => (
                        <motion.div key={delay} className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10" animate={{ scale: [1, 2.5], opacity: [0.4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay }} />
                    ))}

                    <div className="relative">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <motion.div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30" whileHover={{ scale: 1.1, rotate: 10 }} transition={{ type: 'spring', stiffness: 300 }}>
                                    <Shield className="h-8 w-8 text-white" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-indigo-100 font-medium tracking-wide">Manajemen Perizinan</p>
                                    <h1 className="text-3xl font-bold text-white">Persetujuan Izin</h1>
                                    <p className="mt-1 text-indigo-100 max-w-lg">Kelola permohonan izin mahasiswa dengan AI verification system</p>
                                </div>
                            </div>
                            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }} className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg border border-white/10">
                                <div className="p-2 bg-indigo-500/20 rounded-lg"><Sparkles className="h-6 w-6 text-white" /></div>
                                <div>
                                    <p className="text-xs text-indigo-100">AI Accuracy</p>
                                    <p className="text-2xl font-bold text-white">94%</p>
                                </div>
                            </motion.div>
                        </div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/10">
                            <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }} onClick={() => setViewMode('kanban')} className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg">
                                <LayoutGrid className="h-4 w-4" /> Kanban Board
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }} onClick={() => setViewMode('table')} className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg">
                                <List className="h-4 w-4" /> Table View
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }} onClick={() => setViewMode('calendar')} className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg">
                                <Calendar className="h-4 w-4" /> Calendar
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══ 10 SUMMARY CARDS — Exact Kas Admin Glassmorphism ═══ */}
                <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {summaryCards.map(card => (
                        <motion.div key={card.key} variants={cardVariants} whileHover="hover" onHoverStart={() => setHoveredCard(card.key)} onHoverEnd={() => setHoveredCard(null)}
                            className={cn("group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5", card.hoverShadow)}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.overlayGradient}`} />
                            <motion.div animate={{ scale: hoveredCard === card.key ? 1.5 : 1, opacity: hoveredCard === card.key ? 0.4 : 0.2 }} className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${card.glowBg} blur-3xl transition-all duration-500`} />
                            <div className="relative flex items-center gap-4">
                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-white shadow-lg ${card.shadowColor}`}>
                                    <card.Icon className="h-7 w-7" />
                                </motion.div>
                                <div>
                                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{card.title}</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="text-2xl font-bold text-neutral-900 dark:text-white">{card.value}</span>
                                        {card.ai && <Sparkles className="h-4 w-4 text-purple-500" />}
                                        {card.alert && stats.suspicious > 0 && <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }}><AlertTriangle className="h-4 w-4 text-red-500" /></motion.div>}
                                        {card.pulse && stats.pending > 5 && <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" /></span>}
                                        {card.trend && <Badge variant="outline" className="border-0 bg-emerald-500/10 text-emerald-600 text-xs">↑</Badge>}
                                    </div>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">{card.subtitle}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══ TOOLBAR ═══ */}
                <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 backdrop-blur-xl shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" /><Input placeholder="Cari mahasiswa..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64 bg-white/60 dark:bg-neutral-800/60 border-white/20" /></div>
                            <Select value={selectedSession} onValueChange={setSelectedSession}>
                                <SelectTrigger className="w-48 bg-white/60 dark:bg-neutral-800/60 border-white/20"><SelectValue placeholder="Filter Sesi" /></SelectTrigger>
                                <SelectContent><SelectItem value="all">Semua Sesi</SelectItem>{sessions.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.mata_kuliah} - {s.tanggal}</SelectItem>)}</SelectContent>
                            </Select>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="w-36 bg-white/60 dark:bg-neutral-800/60 border-white/20"><SelectValue placeholder="Tipe" /></SelectTrigger>
                                <SelectContent><SelectItem value="all">Semua Tipe</SelectItem><SelectItem value="izin">Izin</SelectItem><SelectItem value="sakit">Sakit</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedIds.length > 0 && <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white" onClick={handleBulkApprove}><Check className="h-4 w-4 mr-1" /> Approve {selectedIds.length}</Button>}
                            <div className="flex bg-white/60 dark:bg-neutral-800/60 rounded-xl p-1 border border-white/20">
                                {(['kanban', 'table', 'calendar'] as const).map(mode => (
                                    <button key={mode} onClick={() => setViewMode(mode)} className={cn("p-2 rounded-lg transition-all", viewMode === mode ? "bg-white dark:bg-neutral-700 shadow-md text-indigo-600 dark:text-indigo-400" : "text-neutral-500 hover:text-neutral-700")}>
                                        {mode === 'kanban' ? <LayoutGrid className="h-4 w-4" /> : mode === 'table' ? <List className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ KANBAN VIEW ═══ */}
                {viewMode === 'kanban' && (
                    <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {([
                            { status: 'pending', items: pendingPermits, label: 'Pending', Icon: Clock, color: 'amber', borderColor: 'border-amber-200 dark:border-amber-800', bgColor: 'bg-amber-50/50 dark:bg-amber-900/10' },
                            { status: 'approved', items: approvedPermits, label: 'Approved', Icon: CheckCircle, color: 'emerald', borderColor: 'border-emerald-200 dark:border-emerald-800', bgColor: 'bg-emerald-50/50 dark:bg-emerald-900/10' },
                            { status: 'rejected', items: rejectedPermits, label: 'Rejected', Icon: XCircle, color: 'red', borderColor: 'border-red-200 dark:border-red-800', bgColor: 'bg-red-50/50 dark:bg-red-900/10' },
                            { status: 'archived', items: [] as Permit[], label: 'Archived', Icon: Archive, color: 'slate', borderColor: 'border-slate-200 dark:border-slate-800', bgColor: 'bg-slate-50/50 dark:bg-slate-900/10' },
                        ]).map(col => (
                            <motion.div key={col.status} variants={itemVariants} className={cn("rounded-2xl border p-4", col.borderColor, col.bgColor)}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <col.Icon className={`h-5 w-5 text-${col.color}-600`} />
                                        <h3 className={`font-bold text-${col.color}-900 dark:text-${col.color}-100`}>{col.label}</h3>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full bg-${col.color}-200 dark:bg-${col.color}-800 text-${col.color}-900 dark:text-${col.color}-100 text-xs font-bold`}>{col.items.length}</span>
                                </div>
                                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                                    <AnimatePresence>
                                        {col.items.map(permit => (
                                            <motion.div key={permit.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} whileHover={{ scale: 1.02 }}
                                                className="rounded-xl border-2 border-white/60 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                                                {/* Student Info */}
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm"><AvatarImage src={permit.mahasiswa.avatar} /><AvatarFallback>{permit.mahasiswa.nama[0]}</AvatarFallback></Avatar>
                                                    <div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{permit.mahasiswa.nama}</p><p className="text-xs text-neutral-500">{permit.mahasiswa.nim}</p></div>
                                                    {permit.is_urgent && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}><AlertTriangle className="h-4 w-4 text-red-500" /></motion.div>}
                                                </div>
                                                {/* Type Badge */}
                                                <div className="mb-2">{getPermitTypeBadge(permit.type)}</div>
                                                {/* Date & Duration */}
                                                <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 mb-1"><Calendar className="h-3 w-3" /><span>{formatDateRange(permit.start_date, permit.end_date)}</span></div>
                                                <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 mb-2"><Timer className="h-3 w-3" /><span>{permit.duration} hari</span></div>
                                                {/* Reason */}
                                                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">{permit.reason}</p>
                                                {/* AI Recommendation */}
                                                <div className={cn("flex items-center gap-2 p-2 rounded-lg text-xs mb-3", permit.ai_recommendation === 'approve' ? "bg-green-50 text-green-700 dark:bg-green-900/20" : permit.ai_recommendation === 'reject' ? "bg-red-50 text-red-700 dark:bg-red-900/20" : "bg-amber-50 text-amber-700 dark:bg-amber-900/20")}>
                                                    <Sparkles className="h-3 w-3" />
                                                    <span className="font-semibold">AI: {permit.ai_recommendation === 'approve' ? 'Recommend Approve' : permit.ai_recommendation === 'reject' ? 'Recommend Reject' : 'Need Review'}</span>
                                                    <span className="ml-auto">{permit.ai_confidence}%</span>
                                                </div>
                                                {/* Attachments */}
                                                {permit.attachments.length > 0 && <div className="flex items-center gap-1 text-xs text-neutral-500 mb-3"><Paperclip className="h-3 w-3" /><span>{permit.attachments.length} file(s)</span></div>}
                                                {/* Quick Actions */}
                                                {col.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <Button size="sm" className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white" onClick={() => quickApprove(permit)} disabled={processingId === permit.id}><Check className="h-3 w-3 mr-1" /> Approve</Button>
                                                        <Button size="sm" variant="outline" onClick={() => setDetailPermit(permit)}><Eye className="h-3 w-3" /></Button>
                                                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => quickReject(permit)}><X className="h-3 w-3" /></Button>
                                                    </div>
                                                )}
                                                {col.status !== 'pending' && <Button size="sm" variant="ghost" className="w-full" onClick={() => setDetailPermit(permit)}><Eye className="h-3 w-3 mr-1" /> Detail</Button>}
                                                {/* Time */}
                                                <div className="mt-2 text-xs text-neutral-400 text-center">{formatRelativeTime(permit.created_at)}</div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {col.items.length === 0 && <div className="text-center py-8 text-neutral-400 text-sm">Tidak ada data</div>}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* ═══ TABLE VIEW ═══ */}
                {viewMode === 'table' && (
                    <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl overflow-hidden shadow-xl">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-black">
                                <tr>
                                    <th className="px-4 py-3"><Checkbox checked={selectedIds.length === pendingPermits.length && pendingPermits.length > 0} onCheckedChange={selectAll} /></th>
                                    <th className="px-4 py-3 text-left"><Button variant="ghost" size="sm">Mahasiswa <ArrowUpDown className="ml-2 h-4 w-4" /></Button></th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Tipe</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Date Range</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Duration</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">AI Score</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Priority</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {filteredPermits.map((permit, index) => (
                                    <motion.tr key={permit.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}
                                        className={cn("hover:bg-white/50 dark:hover:bg-neutral-800/50 transition-colors", permit.is_urgent && "bg-red-50/50 dark:bg-red-900/10")}>
                                        <td className="px-4 py-3"><Checkbox checked={selectedIds.includes(permit.id)} onCheckedChange={() => toggleSelect(permit.id)} /></td>
                                        <td className="px-4 py-3"><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarImage src={permit.mahasiswa.avatar} /><AvatarFallback>{permit.mahasiswa.nama[0]}</AvatarFallback></Avatar><div><p className="font-semibold text-sm">{permit.mahasiswa.nama}</p><p className="text-xs text-neutral-500">{permit.mahasiswa.nim}</p></div></div></td>
                                        <td className="px-4 py-3">{getPermitTypeBadge(permit.type)}</td>
                                        <td className="px-4 py-3 text-sm">{formatDateRange(permit.start_date, permit.end_date)}</td>
                                        <td className="px-4 py-3 text-center"><span className="px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold">{permit.duration} hari</span></td>
                                        <td className="px-4 py-3 text-center">{getStatusBadge(permit.status)}</td>
                                        <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1"><Sparkles className="h-3 w-3 text-purple-500" /><span className={cn("text-sm font-semibold", permit.ai_confidence >= 80 ? "text-green-600" : permit.ai_confidence >= 60 ? "text-amber-600" : "text-red-600")}>{permit.ai_confidence}%</span></div></td>
                                        <td className="px-4 py-3 text-center">{permit.is_urgent ? <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold"><AlertTriangle className="h-3 w-3" /> Urgent</motion.div> : <span className="text-xs text-neutral-500">Normal</span>}</td>
                                        <td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1">
                                            {permit.status === 'pending' && <><Button size="sm" className="h-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white" onClick={() => quickApprove(permit)}><Check className="h-3 w-3" /></Button><Button size="sm" variant="destructive" className="h-8" onClick={() => quickReject(permit)}><X className="h-3 w-3" /></Button></>}
                                            <Button size="sm" variant="outline" className="h-8" onClick={() => setDetailPermit(permit)}><Eye className="h-3 w-3" /></Button>
                                        </div></td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}

                {/* ═══ CALENDAR VIEW ═══ */}
                {viewMode === 'calendar' && (
                    <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(m => moment(m).subtract(1, 'month'))}><ChevronLeft className="h-4 w-4" /></Button>
                                <h3 className="text-2xl font-bold">{currentMonth.format('MMMM YYYY')}</h3>
                                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(m => moment(m).add(1, 'month'))}><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => setCurrentMonth(moment())}>Today</Button>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center text-sm font-semibold text-neutral-600 dark:text-neutral-400 py-2">{d}</div>)}
                            {calendarDays.map((day, i) => {
                                const dayPermits = getPermitsForDay(day);
                                const isToday = day.isSame(moment(), 'day');
                                const isCurrent = day.month() === currentMonth.month();
                                return (
                                    <motion.div key={i} whileHover={{ scale: 1.02 }} className={cn("min-h-[120px] rounded-xl border-2 p-2 cursor-pointer transition-colors",
                                        isToday && "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20",
                                        !isToday && isCurrent && "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
                                        !isCurrent && "border-neutral-100 dark:border-neutral-800 opacity-50")}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={cn("text-sm font-semibold", isToday && "text-indigo-600 dark:text-indigo-400", !isToday && isCurrent && "text-neutral-900 dark:text-white", !isCurrent && "text-neutral-400")}>{day.format('D')}</span>
                                            {dayPermits.length > 0 && <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold">{dayPermits.length}</span>}
                                        </div>
                                        <div className="space-y-1">
                                            {dayPermits.slice(0, 3).map(p => (
                                                <div key={p.id} onClick={() => setDetailPermit(p)} className={cn("text-xs p-1 rounded truncate",
                                                    p.status === 'pending' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30",
                                                    p.status === 'approved' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30",
                                                    p.status === 'rejected' && "bg-red-100 text-red-700 dark:bg-red-900/30"
                                                )}>{p.mahasiswa.nama.split(' ')[0]}</div>
                                            ))}
                                            {dayPermits.length > 3 && <div className="text-xs text-neutral-500 text-center">+{dayPermits.length - 3} more</div>}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ═══ DETAIL MODAL ═══ */}
                <Dialog open={!!detailPermit} onOpenChange={open => !open && setDetailPermit(null)}>
                    <DialogContent className="max-w-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-white/20">
                        <DialogHeader><DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-indigo-600" /> Detail Permohonan Izin</DialogTitle></DialogHeader>
                        {detailPermit && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                                        <Avatar className="h-12 w-12 border-2 border-white shadow"><AvatarImage src={detailPermit.mahasiswa.avatar} /><AvatarFallback>{detailPermit.mahasiswa.nama[0]}</AvatarFallback></Avatar>
                                        <div><h3 className="font-bold">{detailPermit.mahasiswa.nama}</h3><p className="text-sm text-neutral-500">{detailPermit.mahasiswa.nim}</p></div>
                                    </div>
                                    <div><Label className="text-xs font-bold text-neutral-500 uppercase">Status & Tipe</Label><div className="flex gap-2 mt-1">{getPermitTypeBadge(detailPermit.type)}{getStatusBadge(detailPermit.status)}{detailPermit.is_urgent && <Badge variant="destructive" className="animate-pulse">Urgent</Badge>}</div></div>
                                    <div><Label className="text-xs font-bold text-neutral-500 uppercase">Mata Kuliah</Label><p className="font-medium mt-1">{detailPermit.session.mata_kuliah}</p></div>
                                    <div><Label className="text-xs font-bold text-neutral-500 uppercase">Tanggal</Label><p className="font-medium mt-1">{detailPermit.session.tanggal_display}</p></div>
                                    <div><Label className="text-xs font-bold text-neutral-500 uppercase">Alasan</Label><p className="mt-1 text-sm bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg border">{detailPermit.reason}</p></div>
                                    {detailPermit.rejection_reason && <div><Label className="text-xs font-bold text-red-500 uppercase">Alasan Penolakan</Label><p className="mt-1 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200">{detailPermit.rejection_reason}</p></div>}
                                </div>
                                <div className="space-y-4">
                                    {/* AI Analysis Panel */}
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800">
                                        <div className="flex items-center gap-2 mb-3"><div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white"><Sparkles className="h-4 w-4" /></div><h4 className="font-bold text-purple-900 dark:text-purple-100">AI Verification</h4></div>
                                        <div className="space-y-3">
                                            <div className="p-3 rounded-lg bg-white dark:bg-neutral-900">
                                                <div className="flex justify-between mb-2"><div><p className="text-xs text-neutral-500">AI Recommendation</p><span className={cn("text-xl font-bold", detailPermit.ai_recommendation === 'approve' ? "text-green-600" : detailPermit.ai_recommendation === 'reject' ? "text-red-600" : "text-amber-600")}>{detailPermit.ai_recommendation === 'approve' ? 'APPROVE' : detailPermit.ai_recommendation === 'reject' ? 'REJECT' : 'REVIEW NEEDED'}</span></div><div className="text-right"><p className="text-xs text-neutral-500">Confidence</p><span className="text-xl font-bold text-purple-600">{detailPermit.ai_confidence}%</span></div></div>
                                                <div className="h-2 rounded-full bg-neutral-200 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${detailPermit.ai_confidence}%` }} className="h-full bg-gradient-to-r from-purple-500 to-pink-500" /></div>
                                            </div>
                                            <div className="p-3 rounded-lg bg-white dark:bg-neutral-900">
                                                <div className="flex justify-between mb-1"><span className="text-sm font-semibold">Document Authenticity</span><span className={cn("text-sm font-bold", detailPermit.document_score >= 80 ? "text-green-600" : "text-amber-600")}>{detailPermit.document_score}%</span></div>
                                                <div className="h-1.5 rounded-full bg-neutral-200 overflow-hidden"><div className={cn("h-full", detailPermit.document_score >= 80 ? "bg-green-500" : "bg-amber-500")} style={{ width: `${detailPermit.document_score}%` }} /></div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Attachment */}
                                    {detailPermit.attachment && (
                                        <div><Label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Lampiran</Label>
                                            <a href={detailPermit.attachment} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group">
                                                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 dark:bg-indigo-900/20"><Paperclip className="h-5 w-5" /></div>
                                                <div className="flex-1 overflow-hidden"><p className="font-medium text-sm truncate">Dokumen Pendukung</p><p className="text-xs text-neutral-400">Klik untuk melihat</p></div>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <DialogFooter className="gap-2 mt-4">
                            {detailPermit?.status === 'pending' && (<>
                                <Button variant="destructive" onClick={() => setIsRejectionModalOpen(true)} disabled={processingId === detailPermit?.id}><X className="h-4 w-4 mr-2" /> Tolak</Button>
                                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white" onClick={() => detailPermit && quickApprove(detailPermit)} disabled={processingId === detailPermit?.id}><Check className="h-4 w-4 mr-2" /> Setujui</Button>
                            </>)}
                            <Button variant="outline" onClick={() => setDetailPermit(null)}>Tutup</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* ═══ REJECTION MODAL ═══ */}
                <Dialog open={isRejectionModalOpen} onOpenChange={setIsRejectionModalOpen}>
                    <DialogContent className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl">
                        <DialogHeader><DialogTitle className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-500" /> Alasan Penolakan</DialogTitle></DialogHeader>
                        <Textarea placeholder="Tuliskan alasan penolakan izin..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={4} />
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => { setIsRejectionModalOpen(false); setRejectionReason(''); }}>Batal</Button>
                            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason || processingId !== null}>Kirim Penolakan</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </motion.div>
        </DosenLayout>
    );
}
