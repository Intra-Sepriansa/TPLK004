import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    ArrowLeft, BookOpen, Calendar, CornerDownRight, MessageSquare, Pin, Reply, Send, Trash2, X, Sparkles, Zap,
    Clock, User, Shield, Info
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';


type Diskusi = {
    id: number; sender_type: string; sender_name: string; sender_avatar: string | null;
    pesan: string; visibility: string; recipient_name: string | null; is_pinned: boolean;
    reply_to_id: number | null; reply_to?: { sender_name: string; pesan: string } | null;
    created_at: string; time_ago: string;
};
type Tugas = {
    id: number; judul: string; deskripsi: string; instruksi: string | null; jenis: string;
    deadline: string; deadline_display: string; prioritas: string; status: string;
    course: { id: number; nama: string; dosen: string | null; dosen_id: number | null };
    created_by: string; created_by_type: string; edited_by: string | null; edited_at: string | null;
    is_overdue: boolean; days_until_deadline: number; created_at: string;
};
type Props = { tugas: Tugas; diskusi: Diskusi[] };

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 12
        }
    }
};

export default function AdminTugasDetail({ tugas, diskusi }: Props) {
    const [message, setMessage] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [replyTo, setReplyTo] = useState<Diskusi | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => { setIsLoaded(true); chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [diskusi]);

    const sendMessage = () => {
        if (!message.trim()) return;
        router.post(`/admin/tugas/${tugas.id}/message`, {
            pesan: message,
            visibility,
            reply_to_id: replyTo?.id || null,
        }, {
            onSuccess: () => { setMessage(''); setReplyTo(null); },
            preserveScroll: true,
        });
    };

    const handleReply = (d: Diskusi) => {
        setReplyTo(d);
        inputRef.current?.focus();
    };

    const togglePin = (id: number) => router.patch(`/admin/tugas/diskusi/${id}/pin`, {}, { preserveScroll: true });

    const openDeleteDialog = (id: number) => setDeleteDialog({ open: true, id });
    const deleteMessage = () => {
        if (deleteDialog.id) {
            router.delete(`/admin/tugas/diskusi/${deleteDialog.id}`, { preserveScroll: true });
            setDeleteDialog({ open: false, id: null });
        }
    };

    const getPriorityStyle = (p: string) => ({
        tinggi: 'bg-red-500/10 text-red-500 border-red-500/20',
        sedang: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        rendah: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    }[p] || 'bg-slate-500/10 text-slate-500 border-slate-500/20');

    const getStatusStyle = (s: string) => ({
        published: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        draft: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        closed: 'bg-red-500/10 text-red-500 border-red-500/20',
    }[s] || 'bg-slate-500/10 text-slate-500 border-slate-500/20');

    const getSenderStyle = (type: string) => ({
        admin: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white',
        dosen: 'bg-gradient-to-br from-slate-700 to-slate-900 text-white',
        mahasiswa: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    }[type] || 'bg-slate-100 text-slate-700');

    const getReplyTarget = (replyId: number | null) => {
        if (!replyId) return null;
        return diskusi.find(d => d.id === replyId);
    };

    return (
        <AppLayout>
            <Head title={tugas.judul} />
            <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-8 font-sans selection:bg-indigo-500/30">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative mb-8 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 opacity-90" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />

                    {/* Floating Orbs */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 animate-pulse delay-1000" />

                    <div className="relative p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10">
                        <div className="space-y-4 max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Button
                                    variant="ghost"
                                    onClick={() => router.visit('/admin/tugas')}
                                    className="text-white/60 hover:text-white hover:bg-white/10 -ml-2 mb-2 group transition-all"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Kembali ke Daftar
                                </Button>
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${getPriorityStyle(tugas.prioritas)}`}>
                                        {tugas.prioritas.toUpperCase()}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${getStatusStyle(tugas.status)}`}>
                                        {tugas.status.toUpperCase()}
                                    </span>
                                    {tugas.is_overdue && (
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold border border-red-500/30 bg-red-500/10 text-red-500 animate-pulse flex items-center gap-1 backdrop-blur-md">
                                            <Clock className="w-3 h-3" /> OVERDUE
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                                    {tugas.judul}
                                </h1>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-wrap gap-4 text-sm text-indigo-200/80"
                            >
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
                                    <BookOpen className="h-4 w-4 text-indigo-400" />
                                    <span>{tugas.course.nama}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
                                    <User className="h-4 w-4 text-purple-400" />
                                    <span>{tugas.course.dosen || 'Belum ada dosen'}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
                                    <Calendar className="h-4 w-4 text-pink-400" />
                                    <span>Deadline: {tugas.deadline_display}</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-[100px] -mr-8 -mt-8 transition-all group-hover:bg-indigo-500/20" />

                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                    <Sparkles className="h-6 w-6 text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Deskripsi Tugas</h2>
                            </div>

                            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                                <p className="whitespace-pre-wrap">{tugas.deskripsi}</p>
                            </div>

                            {tugas.instruksi && (
                                <div className="mt-8 relative rounded-2xl bg-indigo-900/20 border border-indigo-500/20 p-6 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5" />
                                    <div className="relative">
                                        <h3 className="text-lg font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                                            <Zap className="h-5 w-5" /> Instruksi Pengerjaan
                                        </h3>
                                        <p className="text-gray-300 whitespace-pre-wrap">{tugas.instruksi}</p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" /> Dibuat {tugas.created_at} oleh {tugas.created_by}
                                </span>
                                {tugas.edited_at && (
                                    <span className="flex items-center gap-1.5">
                                        <Shield className="h-3 w-3" /> Diedit {tugas.edited_at} oleh {tugas.edited_by}
                                    </span>
                                )}
                            </div>
                        </motion.div>

                        {/* Discussion Section */}
                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden flex flex-col h-[600px] relative transition-all duration-300 hover:border-white/20">
                            <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md flex justify-between items-center sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                        <MessageSquare className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg">Diskusi Kelas</h2>
                                        <p className="text-xs text-gray-400">{diskusi.length} Pesan</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                                <AnimatePresence>
                                    {diskusi.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50"
                                        >
                                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                                                <MessageSquare className="h-10 w-10 text-white/20" />
                                            </div>
                                            <p className="text-gray-400 font-medium">Belum ada diskusi</p>
                                            <p className="text-sm text-gray-600">Jadilah yang pertama memulai percakapan ini.</p>
                                        </motion.div>
                                    ) : (
                                        diskusi.map((d) => {
                                            const replyTarget = getReplyTarget(d.reply_to_id);
                                            const isMe = d.sender_type === 'admin'; // Assuming admin for this view
                                            return (
                                                <motion.div
                                                    key={d.id}
                                                    layout
                                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className={`group flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}
                                                >
                                                    <Avatar className="h-10 w-10 border-2 border-white/10 shadow-lg mt-1">
                                                        <AvatarFallback className={getSenderStyle(d.sender_type)}>{d.sender_name.charAt(0)}</AvatarFallback>
                                                    </Avatar>

                                                    <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                        <div className="flex items-center gap-2 mb-1 px-1">
                                                            <span className="text-sm font-semibold text-white">{d.sender_name}</span>
                                                            <Badge variant="outline" className="text-[10px] h-5 border-white/10 text-gray-400 bg-white/5">{d.sender_type}</Badge>
                                                            <span className="text-[10px] text-gray-500">{d.time_ago}</span>
                                                        </div>

                                                        <div
                                                            className={`relative p-4 rounded-2xl shadow-sm border ${d.is_pinned ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5 border-white/10'} backdrop-blur-sm transition-all duration-200 group-hover:bg-white/10`}
                                                        >
                                                            {replyTarget && (
                                                                <div className="mb-3 pl-3 border-l-2 border-indigo-500/50">
                                                                    <div className="text-xs text-indigo-300 bg-indigo-500/10 p-2 rounded-md truncate max-w-[200px]">
                                                                        <span className="font-bold mr-1 block text-[10px] uppercase opacity-70">Replying to {replyTarget.sender_name}</span>
                                                                        "{replyTarget.pesan}"
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {d.is_pinned && (
                                                                <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full shadow-lg border border-amber-400">
                                                                    <Pin className="h-3 w-3" />
                                                                </div>
                                                            )}
                                                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-200">{d.pesan}</p>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className={`flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                            <Button variant="ghost" size="icon" onClick={() => handleReply(d)} className="h-7 w-7 rounded-lg hover:bg-white/10 text-gray-400 hover:text-indigo-400 transition-colors" title="Balas">
                                                                <Reply className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => togglePin(d.id)} className={`h-7 w-7 rounded-lg hover:bg-white/10 transition-colors ${d.is_pinned ? 'text-amber-500' : 'text-gray-400 hover:text-amber-400'}`} title={d.is_pinned ? 'Unpin' : 'Pin'}>
                                                                <Pin className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(d.id)} className="h-7 w-7 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                    <div ref={chatEndRef} />
                                </AnimatePresence>
                            </div>

                            {/* Reply Indicator */}
                            {replyTo && (
                                <div className="px-6 py-3 bg-indigo-900/30 border-t border-indigo-500/20 backdrop-blur-md flex items-center justify-between animate-in slide-in-from-bottom-2 fade-in duration-200">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                                            <Reply className="h-4 w-4 text-indigo-400" />
                                        </div>
                                        <div className="flex flex-col text-xs overflow-hidden">
                                            <span className="text-indigo-300 font-medium">Membalas {replyTo.sender_name}</span>
                                            <span className="text-white/50 truncate max-w-[200px] md:max-w-md">"{replyTo.pesan}"</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)} className="h-6 w-6 p-0 rounded-full hover:bg-white/10 text-white/50 hover:text-white">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Input Area */}
                            <div className="p-4 md:p-6 border-t border-white/10 bg-black/20 backdrop-blur-md">
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between px-1">
                                        <Select value={visibility} onValueChange={setVisibility}>
                                            <SelectTrigger className="w-32 h-8 border-none bg-white/5 text-xs rounded-lg hover:bg-white/10 focus:ring-0">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="dark border-white/10 bg-[#1a1a1a]">
                                                <SelectItem value="public">🌐 Public</SelectItem>
                                                <SelectItem value="private">🔒 Private</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span className="text-[10px] text-gray-500">Enter untuk mengirim</span>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur transition-all opacity-0 group-focus-within:opacity-100" />
                                        <div className="relative flex gap-2">
                                            <Textarea
                                                ref={inputRef}
                                                placeholder={replyTo ? `Balas pesan...` : "Tulis pesan diskusi..."}
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                rows={1}
                                                className="min-h-[48px] max-h-[120px] rounded-xl bg-white/5 border-white/10 focus:border-indigo-500/50 focus:ring-0 text-white placeholder:text-gray-500 resize-none py-3 scrollbar-hide"
                                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                                            />
                                            <Button
                                                onClick={sendMessage}
                                                disabled={!message.trim()}
                                                className={`h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/10 shadow-lg shadow-indigo-500/20 transition-all duration-300 ${message.trim() ? 'hover:scale-105 hover:shadow-indigo-500/40' : 'opacity-50 cursor-not-allowed grayscale'}`}
                                            >
                                                <Send className="h-5 w-5 text-white" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Sidebar Info */}
                    <div className="space-y-6">
                        <motion.div variants={itemVariants} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-300">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
                                <Info className="h-5 w-5 text-indigo-400" /> Informasi Detail
                            </h3>

                            <div className="space-y-4">
                                <div className="group/item flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <span className="text-sm text-gray-400">Jenis Tugas</span>
                                    <span className="capitalize font-semibold text-white bg-indigo-500/20 px-3 py-1 rounded-lg border border-indigo-500/20 text-xs text-indigo-300">
                                        {tugas.jenis}
                                    </span>
                                </div>

                                <div className="group/item flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Dosen Pengampu</span>
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold ring-2 ring-white/10">
                                            {tugas.course.dosen ? tugas.course.dosen.charAt(0) : 'D'}
                                        </div>
                                        <span className="text-sm font-medium text-white truncate">
                                            {tugas.course.dosen || 'Belum ditentukan'}
                                        </span>
                                    </div>
                                </div>

                                <div className="group/item p-4 rounded-xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl -mr-8 -mt-8" />
                                    <span className="text-sm text-indigo-200 block mb-1">Sisa Waktu</span>
                                    <div className="flex items-center gap-2">
                                        <Clock className={`h-5 w-5 ${tugas.is_overdue ? 'text-red-400' : 'text-emerald-400'}`} />
                                        <span className={`text-xl font-bold ${tugas.is_overdue ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {tugas.is_overdue ? 'Sudah Lewat' : `${tugas.days_until_deadline} Hari Lagi`}
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-black/20 rounded-full mt-3 overflow-hidden">
                                        <div className={`h-full rounded-full ${tugas.is_overdue ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: tugas.is_overdue ? '100%' : `${Math.max(0, 100 - (tugas.days_until_deadline * 10))}px` }} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Confirm Dialog - Enhanced */}
                <ConfirmDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })}
                    onConfirm={deleteMessage}
                    title="Hapus Pesan?"
                    message="Pesan yang dihapus tidak dapat dikembalikan. Lanjutkan?"
                    variant="danger"
                    confirmText="Hapus Sekarang"
                    cancelText="Batal"
                />
            </div>
        </AppLayout>
    );
}
