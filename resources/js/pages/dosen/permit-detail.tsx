import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DosenLayout from '@/layouts/dosen-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
    ArrowLeft, Clock, CheckCircle, XCircle, AlertTriangle, Timer, Sparkles,
    Paperclip, Check, X, BookOpen, Calendar, Shield, User, Download,
    ExternalLink, Activity, Heart, FileText, ChevronRight, Mail, Phone,
    TrendingUp, Star, Zap, Eye, Award, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import JadwalIcon from '@/assets/admin/jadwal/jadwal.png';

/* ═══════════════════════════════════════════════════ */
/*                     TYPES                          */
/* ═══════════════════════════════════════════════════ */
type Permit = {
    id: number;
    mahasiswa: { id: number; nama: string; nim: string; avatar?: string; email?: string; phone?: string };
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
    approved_at: string | null;
};

type Props = { permit: Permit };

/* ═══════════════════════════════════════════════════ */
/*              ANIMATION VARIANTS                    */
/* ═══════════════════════════════════════════════════ */
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } } } as const;
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

/* ═══════════════════════════════════════════════════ */
/*                    HELPERS                         */
/* ═══════════════════════════════════════════════════ */
const fmtDateRange = (s: string, e: string) => s === e ? moment(s).format('DD MMM YYYY') : `${moment(s).format('DD MMM')} – ${moment(e).format('DD MMM YYYY')}`;

const statusConfig = {
    pending: { label: 'Menunggu', icon: Clock, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/30' },
    approved: { label: 'Disetujui', icon: CheckCircle, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/30' },
    rejected: { label: 'Ditolak', icon: XCircle, color: 'from-red-500 to-rose-600', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800/30' },
};

const typeConfig = {
    izin: { label: 'Izin', icon: Shield, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    sakit: { label: 'Sakit', icon: Heart, color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
};

/* ═══════════════════════════════════════════════════ */
/*                 MAIN COMPONENT                     */
/* ═══════════════════════════════════════════════════ */
export default function PermitDetail({ permit }: Props) {
    const { flash } = usePage().props as any;
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const sc = statusConfig[permit.status];
    const tc = typeConfig[permit.type];

    const doApprove = () => {
        setProcessingId(permit.id);
        router.patch(`/dosen/permits/${permit.id}/approve`, {}, {
            onSuccess: () => { setShowSuccess(true); setTimeout(() => setShowSuccess(false), 3000); },
            onFinish: () => setProcessingId(null),
        });
    };

    const doReject = () => {
        if (!rejectionReason) return;
        setProcessingId(permit.id);
        router.patch(`/dosen/permits/${permit.id}/reject`, { rejection_reason: rejectionReason } as any, {
            onSuccess: () => { setIsRejectOpen(false); setRejectionReason(''); setShowSuccess(true); setTimeout(() => setShowSuccess(false), 3000); },
            onFinish: () => setProcessingId(null),
        });
    };

    return (
        <DosenLayout>
            <Head title={`Detail Permit — ${permit.mahasiswa.nama}`} />

            {/* Success Toast */}
            <AnimatePresence>
                {(showSuccess || flash?.success) && (
                    <motion.div initial={{ opacity: 0, y: -20, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="fixed right-6 top-6 z-50 flex items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-2xl backdrop-blur dark:border-emerald-800/50 dark:bg-emerald-900/30 dark:text-emerald-200">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                        <div><p className="font-bold">Berhasil!</p><p className="text-xs opacity-80">{flash?.success || 'Aksi berhasil dilakukan!'}</p></div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-4 md:p-6 space-y-6">

                {/* ═══ Back Button ═══ */}
                <motion.div variants={itemVariants}>
                    <Button variant="ghost" className="group gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-3"
                        onClick={() => router.visit('/dosen/permits')}>
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Kembali ke Daftar Permit</span>
                    </Button>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/*         HERO CARD — Student + Status               */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white dark:bg-neutral-950 shadow-2xl">
                    {/* Gradient Banner */}
                    <div className="relative h-40 md:h-52 overflow-hidden">
                        <motion.div className={`absolute inset-0 bg-gradient-to-br ${sc.color}`}
                            style={{ backgroundSize: '200% 200%' }}
                            animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} />
                        {/* Decorative */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 75%, white 1px, transparent 1px), radial-gradient(circle at 75% 25%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
                        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                        {[0, 1, 2, 3].map(i => (
                            <motion.div key={i} className="absolute rounded-full bg-white/15"
                                style={{ width: 8 + i * 6, height: 8 + i * 6, left: `${15 + i * 22}%`, top: `${20 + i * 15}%` }}
                                animate={{ y: [0, -15, 0], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }} />
                        ))}
                        {/* Status badge on banner */}
                        <div className="absolute top-5 right-5 flex items-center gap-2">
                            <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl border border-white/20 bg-white/15 text-white font-bold text-sm")}>
                                <sc.icon className="h-4 w-4" />
                                {sc.label}
                            </div>
                            {permit.is_urgent && (
                                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl backdrop-blur-xl bg-red-500/30 border border-red-400/30 text-white text-xs font-bold">
                                    <AlertTriangle className="h-4 w-4" /> Urgent
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Profile Section */}
                    <div className="relative px-6 md:px-8 pb-6">
                        <div className="flex flex-col md:flex-row md:items-end gap-5 -mt-14 md:-mt-16">
                            {/* Avatar */}
                            <motion.div className="relative group flex-shrink-0" whileHover={{ scale: 1.03 }}>
                                <div className={`absolute -inset-1.5 rounded-full bg-gradient-to-r ${sc.color} opacity-60 blur-sm`} />
                                <div className="relative h-28 w-28 md:h-32 md:w-32 rounded-full overflow-hidden border-4 border-white dark:border-neutral-950 shadow-2xl">
                                    <Avatar className="h-full w-full">
                                        <AvatarImage src={permit.mahasiswa.avatar} className="object-cover" />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">{permit.mahasiswa.nama[0]}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </motion.div>

                            {/* Student Info */}
                            <div className="flex-1 min-w-0 pb-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">{permit.mahasiswa.nama}</h1>
                                    <Badge className={cn("text-xs font-bold border-0", tc.color)}><tc.icon className="h-3 w-3 mr-1" />{tc.label}</Badge>
                                </div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1">{permit.mahasiswa.nim}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                    {permit.mahasiswa.email && (
                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                                            <Mail className="h-3 w-3" />{permit.mahasiswa.email}
                                        </span>
                                    )}
                                    {permit.mahasiswa.phone && (
                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300">
                                            <Phone className="h-3 w-3" />{permit.mahasiswa.phone}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            {permit.status === 'pending' && (
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 px-6"
                                            onClick={doApprove} disabled={processingId === permit.id}>
                                            <Check className="h-4 w-4 mr-2" /> Setujui
                                        </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800/30 dark:hover:bg-red-900/20 px-6"
                                            onClick={() => setIsRejectOpen(true)} disabled={processingId === permit.id}>
                                            <X className="h-4 w-4 mr-2" /> Tolak
                                        </Button>
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/*               INFO GRID (4 columns)                */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: BookOpen, label: 'Mata Kuliah', val: permit.session.mata_kuliah, color: 'from-blue-500 to-indigo-600', glow: 'bg-blue-500' },
                        { icon: Calendar, label: 'Tanggal', val: permit.session.tanggal_display, color: 'from-purple-500 to-violet-600', glow: 'bg-purple-500' },
                        { icon: Timer, label: 'Durasi', val: `${permit.duration} Hari`, color: 'from-amber-500 to-orange-600', glow: 'bg-amber-500' },
                        { icon: Clock, label: 'Diajukan', val: permit.created_at, color: 'from-emerald-500 to-teal-600', glow: 'bg-emerald-500' },
                    ].map((info, i) => (
                        <motion.div key={i} variants={itemVariants} whileHover={{ y: -3 }}
                            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl p-5 shadow-lg hover:shadow-xl transition-all">
                            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.15, 0.08] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                                className={`absolute -top-4 -right-4 h-20 w-20 rounded-full ${info.glow} blur-2xl`} />
                            <div className="relative">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${info.color} text-white shadow-lg mb-3`}>
                                    <info.icon className="h-5 w-5" />
                                </div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">{info.label}</p>
                                <p className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">{info.val}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/*            MAIN CONTENT (2 columns)                */}
                {/* ═══════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* ─── Left Column (2/3) ─── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Reason / Alasan Permohonan */}
                        <motion.div variants={itemVariants} className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
                            <div className="p-5 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600"><FileText className="h-4 w-4 text-white" /></div>
                                <div><h3 className="font-bold text-sm text-neutral-900 dark:text-white">Alasan Permohonan</h3><p className="text-[11px] text-neutral-500">Detail izin yang diajukan</p></div>
                            </div>
                            <div className="p-5">
                                <div className="relative rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50 p-5">
                                    <div className="absolute top-3 left-4 text-neutral-200 dark:text-neutral-700">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z" /></svg>
                                    </div>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed pl-8 whitespace-pre-wrap">{permit.reason}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Rejection Reason (if rejected) */}
                        {permit.rejection_reason && (
                            <motion.div variants={itemVariants} className="rounded-2xl border border-red-200/50 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10 shadow-lg overflow-hidden">
                                <div className="p-5 border-b border-red-200/50 dark:border-red-800/30 flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600"><XCircle className="h-4 w-4 text-white" /></div>
                                    <div><h3 className="font-bold text-sm text-red-700 dark:text-red-300">Alasan Penolakan</h3><p className="text-[11px] text-red-500/70">Dosen telah menolak permohonan ini</p></div>
                                </div>
                                <div className="p-5">
                                    <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{permit.rejection_reason}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* AI Verification Analysis */}
                        <motion.div variants={itemVariants} className="rounded-2xl border border-purple-200/30 dark:border-purple-800/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
                            <div className="p-5 border-b border-purple-200/50 dark:border-purple-800/30 flex items-center gap-3 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/15 dark:to-pink-900/15">
                                <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25"><Sparkles className="h-4 w-4 text-white" /></div>
                                <div>
                                    <h3 className="font-bold text-sm text-purple-900 dark:text-purple-100">AI Verification Analysis</h3>
                                    <p className="text-[11px] text-purple-500">Analisis otomatis berbasis machine learning</p>
                                </div>
                                <div className="ml-auto">
                                    <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                                        <Activity className="h-4 w-4 text-purple-400" />
                                    </motion.div>
                                </div>
                            </div>
                            <div className="p-5 space-y-5">
                                {/* Recommendation */}
                                <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50">
                                    <div>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Rekomendasi AI</p>
                                        <p className={cn("text-xl font-extrabold tracking-tight",
                                            permit.ai_recommendation === 'approve' ? "text-emerald-600" : permit.ai_recommendation === 'reject' ? "text-red-600" : "text-amber-600")}>
                                            {permit.ai_recommendation === 'approve' ? 'SETUJUI' : permit.ai_recommendation === 'reject' ? 'TOLAK' : 'REVIEW MANUAL'}
                                        </p>
                                    </div>
                                    <div className={cn("p-3 rounded-2xl", permit.ai_recommendation === 'approve' ? "bg-emerald-100 dark:bg-emerald-900/20" : permit.ai_recommendation === 'reject' ? "bg-red-100 dark:bg-red-900/20" : "bg-amber-100 dark:bg-amber-900/20")}>
                                        {permit.ai_recommendation === 'approve' ? <CheckCircle className="h-8 w-8 text-emerald-500" /> : permit.ai_recommendation === 'reject' ? <XCircle className="h-8 w-8 text-red-500" /> : <Eye className="h-8 w-8 text-amber-500" />}
                                    </div>
                                </div>

                                {/* Confidence + Document Score */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-purple-500" /><span className="text-xs font-bold text-neutral-500">Confidence Level</span></div>
                                            <span className={cn("text-lg font-extrabold", permit.ai_confidence >= 80 ? "text-emerald-600" : permit.ai_confidence >= 60 ? "text-amber-600" : "text-red-600")}>{permit.ai_confidence}%</span>
                                        </div>
                                        <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${permit.ai_confidence}%` }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                                                className={cn("h-full rounded-full", permit.ai_confidence >= 80 ? "bg-gradient-to-r from-emerald-400 to-teal-500" : permit.ai_confidence >= 60 ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-red-400 to-rose-500")} />
                                        </div>
                                        <p className="text-[10px] text-neutral-400 mt-2">Tingkat kepercayaan AI terhadap permohonan</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" /><span className="text-xs font-bold text-neutral-500">Document Score</span></div>
                                            <span className={cn("text-lg font-extrabold", permit.document_score >= 80 ? "text-emerald-600" : "text-amber-600")}>{permit.document_score}%</span>
                                        </div>
                                        <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${permit.document_score}%` }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                                                className={cn("h-full rounded-full", permit.document_score >= 80 ? "bg-gradient-to-r from-blue-400 to-indigo-500" : "bg-gradient-to-r from-amber-400 to-orange-500")} />
                                        </div>
                                        <p className="text-[10px] text-neutral-400 mt-2">Skor validitas dokumen pendukung</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* ─── Right Column (1/3) ─── */}
                    <div className="space-y-5">

                        {/* Timeline */}
                        <motion.div variants={itemVariants} className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
                            <div className="p-5 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600"><Activity className="h-4 w-4 text-white" /></div>
                                <div><h3 className="font-bold text-sm text-neutral-900 dark:text-white">Timeline</h3><p className="text-[11px] text-neutral-500">Riwayat aktivitas</p></div>
                            </div>
                            <div className="p-5">
                                <div className="relative pl-6 space-y-6">
                                    {/* Vertical line */}
                                    <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-neutral-200 dark:to-neutral-700 rounded-full" />

                                    {/* Submitted */}
                                    <div className="relative">
                                        <div className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-blue-500 border-2 border-white dark:border-neutral-950 shadow flex items-center justify-center">
                                            <FileText className="h-2.5 w-2.5 text-white" />
                                        </div>
                                        <p className="text-xs font-bold text-neutral-900 dark:text-white">Diajukan</p>
                                        <p className="text-[11px] text-neutral-500">{permit.created_at}</p>
                                    </div>

                                    {/* Reviewed */}
                                    {permit.status !== 'pending' && (
                                        <div className="relative">
                                            <div className={cn("absolute -left-6 top-0.5 h-5 w-5 rounded-full border-2 border-white dark:border-neutral-950 shadow flex items-center justify-center",
                                                permit.status === 'approved' ? "bg-emerald-500" : "bg-red-500")}>
                                                {permit.status === 'approved' ? <Check className="h-2.5 w-2.5 text-white" /> : <X className="h-2.5 w-2.5 text-white" />}
                                            </div>
                                            <p className="text-xs font-bold text-neutral-900 dark:text-white">{permit.status === 'approved' ? 'Disetujui' : 'Ditolak'}</p>
                                            <p className="text-[11px] text-neutral-500">{permit.approved_at || '-'}</p>
                                        </div>
                                    )}

                                    {/* Pending */}
                                    {permit.status === 'pending' && (
                                        <div className="relative">
                                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-amber-500 border-2 border-white dark:border-neutral-950 shadow flex items-center justify-center">
                                                <Clock className="h-2.5 w-2.5 text-white" />
                                            </motion.div>
                                            <p className="text-xs font-bold text-amber-600">Menunggu Keputusan</p>
                                            <p className="text-[11px] text-neutral-500">Belum diproses</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Attachments */}
                        <motion.div variants={itemVariants} className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
                            <div className="p-5 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600"><Paperclip className="h-4 w-4 text-white" /></div>
                                <div><h3 className="font-bold text-sm text-neutral-900 dark:text-white">Lampiran</h3><p className="text-[11px] text-neutral-500">Dokumen pendukung</p></div>
                            </div>
                            <div className="p-5">
                                {permit.attachments.length > 0 ? (
                                    <div className="space-y-2">
                                        {permit.attachments.map((att, i) => (
                                            <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                                                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 group-hover:bg-indigo-100 transition-colors">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{att.name}</p>
                                                    <p className="text-[10px] text-neutral-400">Klik untuk preview</p>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-neutral-300 group-hover:text-indigo-500 transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-neutral-400">
                                        <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Tidak ada lampiran</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Quick Info */}
                        <motion.div variants={itemVariants} className="rounded-2xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-lg overflow-hidden">
                            <div className="p-5 border-b border-neutral-200/50 dark:border-neutral-800 flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600"><Info className="h-4 w-4 text-white" /></div>
                                <div><h3 className="font-bold text-sm text-neutral-900 dark:text-white">Info Tambahan</h3><p className="text-[11px] text-neutral-500">Detail permohonan</p></div>
                            </div>
                            <div className="p-5 space-y-3">
                                {[
                                    { label: 'Jenis', val: tc.label, icon: Shield },
                                    { label: 'Periode', val: fmtDateRange(permit.start_date, permit.end_date), icon: Calendar },
                                    { label: 'Sesi', val: permit.session.tanggal_display, icon: Clock },
                                ].map((info, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <info.icon className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{info.label}</p>
                                            <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{info.val}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ═══ Sticky Action Bar for Pending (Mobile) ═══ */}
                {permit.status === 'pending' && (
                    <motion.div variants={itemVariants}
                        className="fixed bottom-0 left-0 right-0 md:hidden p-4 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 z-40">
                        <div className="flex gap-3">
                            <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                                onClick={doApprove} disabled={processingId === permit.id}>
                                <Check className="h-4 w-4 mr-2" /> Setujui
                            </Button>
                            <Button variant="outline" className="flex-1 border-red-200 text-red-600"
                                onClick={() => setIsRejectOpen(true)} disabled={processingId === permit.id}>
                                <X className="h-4 w-4 mr-2" /> Tolak
                            </Button>
                        </div>
                    </motion.div>
                )}

            </motion.div>

            {/* ═══ Rejection Dialog ═══ */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent className="max-w-md bg-white dark:bg-neutral-950 rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20"><XCircle className="h-5 w-5 text-red-500" /></div>
                            Alasan Penolakan
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={permit.mahasiswa.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">{permit.mahasiswa.nama[0]}</AvatarFallback>
                        </Avatar>
                        <div><p className="font-semibold text-sm">{permit.mahasiswa.nama}</p><p className="text-[11px] text-neutral-500">{permit.mahasiswa.nim}</p></div>
                    </div>
                    <Textarea placeholder="Tuliskan alasan penolakan izin..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={4} className="resize-none" />
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => { setIsRejectOpen(false); setRejectionReason(''); }}>Batal</Button>
                        <Button variant="destructive" onClick={doReject} disabled={!rejectionReason || processingId !== null}><X className="h-4 w-4 mr-2" /> Kirim Penolakan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DosenLayout>
    );
}
