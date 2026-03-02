import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import DosenLayout from '@/layouts/dosen-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ArrowLeft, Award, Calendar, CornerDownRight, MessageSquare, Pin, Reply, Send, Trash2, X, Sparkles, Zap, Clock, User, Edit3, CheckCircle, AlertTriangle, FileText, Users } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import TugasIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';

type Diskusi = {
    id: number; sender_type: string; sender_name: string; sender_avatar: string | null;
    pesan: string; visibility: string; recipient_name: string | null; is_pinned: boolean;
    reply_to_id: number | null; reply_to?: { sender_name: string; pesan: string } | null;
    is_me: boolean;
    created_at: string; time_ago: string;
};
type Tugas = {
    id: number; judul: string; deskripsi: string; instruksi: string | null; jenis: string;
    deadline: string; deadline_display: string; prioritas: string; status: string;
    course: { id: number; nama: string }; created_by: string; created_by_type: string;
    edited_by: string | null; edited_at: string | null; is_overdue: boolean;
    days_until_deadline: number; created_at: string;
};
type Props = { tugas: Tugas; diskusi: Diskusi[] };

const containerVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } } };

const formatChatTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
};

const getChatDayKey = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'invalid';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getChatDayLabel = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';

    const messageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((today.getTime() - messageDay.getTime()) / 86400000);

    if (diffDays <= 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) {
        const weekday = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date);
        return weekday.charAt(0).toUpperCase() + weekday.slice(1);
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export default function DosenTugasDetail({ tugas, diskusi }: Props) {
    const [message, setMessage] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [replyTo, setReplyTo] = useState<Diskusi | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [diskusi]);

    const sendMessage = () => {
        if (!message.trim()) return;
        router.post(`/dosen/tugas/${tugas.id}/message`, { pesan: message, visibility, reply_to_id: replyTo?.id || null }, {
            onSuccess: () => { setMessage(''); setReplyTo(null); },
            preserveScroll: true,
        });
    };

    const handleReply = (d: Diskusi) => { setReplyTo(d); inputRef.current?.focus(); };
    const togglePin = (id: number) => router.patch(`/dosen/tugas/diskusi/${id}/pin`, {}, { preserveScroll: true });
    const openDeleteDialog = (id: number) => setDeleteDialog({ open: true, id });
    const deleteMessage = () => { if (deleteDialog.id) { router.delete(`/dosen/tugas/diskusi/${deleteDialog.id}`, { preserveScroll: true }); setDeleteDialog({ open: false, id: null }); } };

    const getPriorityStyle = (p: string) => ({
        tinggi: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25',
        sedang: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25',
        rendah: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25',
    }[p] || 'bg-gray-100 text-gray-700');

    const getStatusStyle = (s: string) => ({
        published: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
        draft: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
        closed: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
    }[s] || 'bg-gray-100 text-gray-700');

    const getSenderStyle = (type: string) => ({
        admin: 'bg-gradient-to-br from-purple-500 to-violet-600 text-white',
        dosen: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
        mahasiswa: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
    }[type] || 'bg-gray-100 text-gray-700');

    return (
        <DosenLayout>
            <Head title={tugas.judul} />
            <div className="space-y-6 p-4 md:p-6">

                {/* ═══ BACK BUTTON ═══ */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                    <Button variant="ghost" onClick={() => router.visit('/dosen/tugas')} className="group hover:bg-white/60 dark:hover:bg-neutral-800/60 transition-all duration-300">
                        <motion.div whileHover={{ x: -4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                        </motion.div>
                        Kembali ke Daftar Tugas
                    </Button>
                </motion.div>

                {/* ═══ GRADIENT HEADER (kas-matching) ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative overflow-hidden rounded-3xl p-5 shadow-2xl sm:p-6 md:p-8"
                >
                    {/* Animated gradient bg */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Pulse rings */}
                    <div className="relative">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                                <motion.div className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24 items-center justify-center">
                                    <img src={TugasIcon} alt="Header Icon" className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl" />
                                </motion.div>
                                <div>
                                    <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">{tugas.judul}</h1>
                                    <p className="mt-1 text-sm text-white/70">{tugas.course.nama}</p>
                                </div>
                            </div>
                        </div>

                        {/* Badges row */}
                        <div className="mt-5 flex flex-wrap items-center gap-2">
                            <Badge className={`${getPriorityStyle(tugas.prioritas)} px-4 py-1.5 text-sm font-semibold capitalize flex items-center gap-1.5`}><Zap className="h-3.5 w-3.5" />{tugas.prioritas}</Badge>
                            <Badge className={`${getStatusStyle(tugas.status)} px-4 py-1.5 text-sm font-semibold capitalize flex items-center gap-1.5`}><CheckCircle className="h-3.5 w-3.5" />{tugas.status}</Badge>
                            <Badge className="bg-white/20 text-white px-4 py-1.5 text-sm font-semibold capitalize flex items-center gap-1.5 border border-white/30 backdrop-blur-md"><FileText className="h-3.5 w-3.5" />{tugas.jenis}</Badge>
                            {tugas.is_overdue && <div><Badge className="bg-red-500/80 text-white px-4 py-1.5 text-sm font-semibold flex items-center gap-1.5 border border-red-400/30 backdrop-blur-md"><AlertTriangle className="h-3.5 w-3.5" />Overdue</Badge></div>}
                        </div>

                        {/* Summary stats in header */}
                        <motion.div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            {[
                                { label: 'Sisa Waktu', value: tugas.is_overdue ? 'Lewat' : `${tugas.days_until_deadline} Hari`, sub: tugas.is_overdue ? 'Deadline terlewati' : 'Hingga deadline', icon: Clock },
                                { label: 'Total Diskusi', value: diskusi.length.toString(), sub: 'Pesan diskusi', icon: MessageSquare },
                                { label: 'Jenis Tugas', value: tugas.jenis, sub: 'Tipe assignment', icon: FileText },
                                { label: 'Deadline', value: tugas.deadline_display?.split(',')[0] || '-', sub: tugas.deadline_display?.split(',')[1] || '', icon: Calendar },
                            ].map((s, i) => (
                                <motion.div key={i} className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl p-4" whileHover={{ scale: 1.03, y: -2 }}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-white/70">{s.label}</span>
                                        <div className="p-1.5 rounded-lg bg-white/20"><s.icon className="h-3.5 w-3.5 text-white" /></div>
                                    </div>
                                    <p className="text-lg font-bold capitalize text-white sm:text-xl">{s.value}</p>
                                    <p className="text-xs text-white/50 mt-0.5">{s.sub}</p>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Action buttons */}
                        <motion.div className="mt-6 grid grid-cols-1 gap-2 border-t border-white/10 pt-5 sm:flex sm:flex-wrap sm:gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }} onClick={() => router.visit(`/dosen/tugas/${tugas.id}/grading`)} className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/30 border border-white/20 shadow-lg">
                                <Award className="h-4 w-4" /> Penilaian Submission
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══ DETAIL CARDS (kas-matching containers) ═══ */}
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Deskripsi Card */}
                    <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Deskripsi Tugas</h3>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">{tugas.deskripsi}</p>
                    </motion.div>

                    {/* Instruksi Card */}
                    <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30">
                                <Zap className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Instruksi Pengerjaan</h3>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">{tugas.instruksi || 'Belum ada instruksi khusus.'}</p>
                    </motion.div>

                    {/* Creator Info Card */}
                    <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30">
                                <User className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Dibuat oleh</h3>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white text-base">{tugas.created_by}</p>
                        <p className="text-xs text-slate-500 mt-1"><span className="capitalize">{tugas.created_by_type}</span> • {tugas.created_at}</p>
                    </motion.div>

                    {/* Editor Info Card */}
                    <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30">
                                <Edit3 className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Terakhir diedit</h3>
                        </div>
                        {tugas.edited_by ? (
                            <>
                                <p className="font-semibold text-slate-900 dark:text-white text-base">{tugas.edited_by}</p>
                                <p className="text-xs text-slate-500 mt-1">{tugas.edited_at}</p>
                            </>
                        ) : (
                            <p className="text-sm text-slate-500">Belum pernah diedit</p>
                        )}
                    </motion.div>
                </motion.div>

                {/* ═══ DISKUSI SECTION (kas-matching container) ═══ */}
                <motion.div
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-2xl backdrop-blur-xl overflow-hidden dark:border-white/5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* Diskusi Header (gradient like kas.tsx section headers) */}
                    <div className="relative overflow-hidden border-b border-white/10 p-4 sm:p-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10" />
                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                                <motion.div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30" whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6 }}>
                                    <MessageSquare className="h-5 w-5" />
                                </motion.div>
                                <div>
                                    <h2 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                                        Diskusi Tugas
                                        <motion.span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-semibold shadow-lg" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring' }}>
                                            {diskusi.length}
                                        </motion.span>
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Diskusi terkait tugas ini
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages Area */}
                    <div className="relative max-h-[600px] space-y-3 overflow-y-auto p-4 sm:space-y-4 sm:p-6">
                        {diskusi.length === 0 ? (
                            <motion.div className="py-14 text-center sm:py-20" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                                <div className="relative mx-auto mb-6 h-24 w-24 sm:mb-8 sm:h-32 sm:w-32">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl" />
                                    <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 rounded-full shadow-2xl shadow-purple-500/30">
                                        <MessageSquare className="h-12 w-12 text-white sm:h-16 sm:w-16" />
                                    </div>
                                </div>
                                <motion.p className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                    Belum ada diskusi
                                </motion.p>
                                <motion.p className="text-sm text-slate-500" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                    Mulai diskusi dengan mengirim pesan pertama
                                </motion.p>
                            </motion.div>
                        ) : (
                            <AnimatePresence>
                                {diskusi.map((d, index) => {
                                    const replyTarget = d.reply_to_id ? diskusi.find(x => x.id === d.reply_to_id) : null;
                                    const isMe = d.is_me;
                                    const chatTime = formatChatTime(d.created_at);
                                    const currentDayKey = getChatDayKey(d.created_at);
                                    const previousDayKey = index > 0 ? getChatDayKey(diskusi[index - 1].created_at) : null;
                                    const showDaySeparator = index === 0 || currentDayKey !== previousDayKey;
                                    return (
                                        <motion.div
                                            key={d.id}
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05, duration: 0.3 }}
                                            className={cn("relative flex w-full flex-col gap-2", isMe ? "items-end" : "items-start", d.is_pinned ? "order-first" : "")}
                                        >
                                            {showDaySeparator && (
                                                <div className="flex w-full justify-center py-1">
                                                    <span className="rounded-full border border-white/20 bg-white/60 px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-slate-300">
                                                        {getChatDayLabel(d.created_at)}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Reply indicator */}
                                            {replyTarget && (
                                                <motion.div className={cn("w-full max-w-[96%] rounded-xl border border-white/30 bg-white/50 p-2 text-xs backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-800/50 sm:max-w-[85%] md:max-w-[70%]", isMe ? "text-right" : "text-left")} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                                    <div className={cn("flex items-center gap-2", isMe ? "justify-end" : "justify-start")}>
                                                        <CornerDownRight className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                                                        <span className="font-semibold text-purple-600 dark:text-purple-400">Balas {replyTarget.sender_name}:</span>
                                                        <span className="truncate max-w-[150px] text-slate-600 dark:text-slate-400">"{replyTarget.pesan}"</span>
                                                    </div>
                                                </motion.div>
                                            )}

                                            <div className={cn("flex w-fit max-w-[94%] items-center gap-2 px-1 text-xs sm:max-w-[82%] md:max-w-[68%]", isMe ? "justify-end" : "justify-start")}>
                                                <span className="font-semibold text-slate-700 dark:text-slate-200">{d.sender_name}</span>
                                                {!isMe && <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize font-medium border-slate-200/50 dark:border-neutral-700/50">{d.sender_type}</Badge>}
                                                {d.visibility === 'private' && <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] px-1.5 py-0 font-semibold shadow-lg">🔒 Private</Badge>}
                                            </div>

                                            {/* Message Card */}
                                            <motion.div
                                                className={cn(
                                                    "relative w-fit max-w-[94%] overflow-hidden rounded-2xl border backdrop-blur-md transition-all duration-300 sm:max-w-[82%] md:max-w-[68%]",
                                                    d.is_pinned ? "bg-amber-50/80 dark:bg-amber-900/30 border-amber-300/30 dark:border-amber-700/30 shadow-lg shadow-amber-500/10" :
                                                        isMe ? "bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-500/30 shadow-lg shadow-indigo-500/20" :
                                                            "bg-white/60 dark:bg-neutral-800/60 border-white/30 dark:border-neutral-700/30 hover:shadow-lg"
                                                )}
                                                whileHover={{ scale: 1.01, y: -2 }}
                                            >
                                                {d.is_pinned && (
                                                    <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-bl-xl flex items-center gap-1 z-10">
                                                        <Pin className="h-3 w-3" /> Pinned
                                                    </div>
                                                )}

                                                <div className={cn("flex gap-3 p-3 sm:gap-4 sm:p-5", isMe ? "flex-row-reverse" : "")}>
                                                    <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                                                        <Avatar className="h-8 w-8 flex-shrink-0 shadow-lg ring-2 ring-white/20 dark:ring-neutral-700/50 sm:h-10 sm:w-10">
                                                            <AvatarFallback className={cn("text-sm font-bold", isMe ? "bg-white/20 text-white" : getSenderStyle(d.sender_type))}>
                                                                {d.sender_name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </motion.div>

                                                    <div className={cn("min-w-0", isMe ? "text-right" : "text-left")}>
                                                        <p className={cn("mb-2 text-sm leading-relaxed whitespace-pre-wrap break-words", isMe ? "text-white/95" : "text-slate-700 dark:text-slate-300")}>{d.pesan}</p>

                                                        <div className={cn("mt-2 flex items-center justify-end border-t border-white/20 pt-2 text-[10px]", isMe ? "text-indigo-100/90" : "text-slate-500 dark:border-neutral-700/50 dark:text-slate-400")}>
                                                            <span>{chatTime}</span>
                                                        </div>

                                                    </div>
                                                </div>
                                            </motion.div>

                                            <div className={cn("flex w-full max-w-[96%] flex-wrap gap-1 sm:max-w-[85%] md:max-w-[70%]", isMe ? "justify-end" : "justify-start")}>
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Button variant="ghost" size="sm" onClick={() => handleReply(d)} className="h-7 px-2 text-xs font-medium text-purple-600 hover:bg-purple-100/50 dark:text-purple-400 dark:hover:bg-purple-900/30">
                                                        <Reply className="mr-1 h-3 w-3" /> Balas
                                                    </Button>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Button variant="ghost" size="sm" onClick={() => togglePin(d.id)} className="h-7 px-2 text-xs font-medium text-amber-600 hover:bg-amber-100/50 dark:text-amber-400 dark:hover:bg-amber-900/30">
                                                        <Pin className="mr-1 h-3 w-3" /> {d.is_pinned ? 'Unpin' : 'Pin'}
                                                    </Button>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(d.id)} className="h-7 px-2 text-xs font-medium text-red-600 hover:bg-red-100/50 dark:text-red-400 dark:hover:bg-red-900/30">
                                                        <Trash2 className="mr-1 h-3 w-3" /> Hapus
                                                    </Button>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Reply indicator */}
                    <AnimatePresence>
                        {replyTo && (
                            <motion.div className="border-t border-purple-200/30 bg-purple-50/50 px-4 py-4 backdrop-blur-sm dark:border-purple-800/30 dark:bg-purple-900/20 sm:px-6" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white"><Reply className="h-4 w-4" /></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">Membalas {replyTo.sender_name}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">"{replyTo.pesan}"</p>
                                        </div>
                                    </div>
                                    <motion.div whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                                        <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)} className="h-8 w-8 p-0 hover:bg-purple-200/50 dark:hover:bg-purple-800/30 rounded-lg"><X className="h-4 w-4" /></Button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Input Area */}
                    <div className="relative border-t border-white/10 p-4 sm:p-6">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                            <Select value={visibility} onValueChange={setVisibility}>
                                <SelectTrigger className="w-full rounded-xl border border-white/30 bg-white/60 backdrop-blur-sm transition-all duration-300 hover:border-purple-400 dark:border-neutral-700/50 dark:bg-neutral-800/60 sm:w-40">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public"><span className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Public</span></SelectItem>
                                    <SelectItem value="private"><span className="flex items-center gap-2">🔒 Private</span></SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="self-start text-xs text-slate-500 sm:self-center">{visibility === 'public' ? '🌐 Semua orang bisa melihat' : '🔒 Hanya penerima yang bisa melihat'}</span>
                        </div>
                        <div className="flex gap-3">
                            <Textarea
                                ref={inputRef}
                                placeholder={replyTo ? `Balas ke ${replyTo.sender_name}...` : "Tulis pesan diskusi..."}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                                className="flex-1 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-sm border border-white/30 dark:border-neutral-700/50 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-300 resize-none"
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                            />
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="shrink-0">
                                <Button onClick={sendMessage} disabled={!message.trim()} className="h-full px-4 sm:px-6 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Send className="h-5 w-5" />
                                </Button>
                            </motion.div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 flex items-center gap-2"><Sparkles className="h-3 w-3" /> Tekan Enter untuk kirim, Shift+Enter untuk baris baru</p>
                    </div>
                </motion.div>

                {/* Delete Dialog */}
                <ConfirmDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })} onConfirm={deleteMessage} title="Hapus Pesan" message="Yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan." variant="danger" confirmText="Ya, Hapus" cancelText="Batal" />
            </div>
        </DosenLayout>
    );
}
