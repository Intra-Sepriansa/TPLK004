import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import DosenLayout from '@/layouts/dosen-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ArrowLeft, Award, BookOpen, Calendar, CornerDownRight, MessageSquare, Pin, Reply, Send, Trash2, X, Sparkles, Zap, Clock, User, Edit3, CheckCircle, AlertTriangle, FileText, Users, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Diskusi = {
    id: number; sender_type: string; sender_name: string; sender_avatar: string | null;
    pesan: string; visibility: string; recipient_name: string | null; is_pinned: boolean;
    reply_to_id: number | null; reply_to?: { sender_name: string; pesan: string } | null;
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

export default function DosenTugasDetail({ tugas, diskusi }: Props) {
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
        router.post(`/dosen/tugas/${tugas.id}/message`, { 
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

    const togglePin = (id: number) => router.patch(`/dosen/tugas/diskusi/${id}/pin`, {}, { preserveScroll: true });
    
    const openDeleteDialog = (id: number) => setDeleteDialog({ open: true, id });
    const deleteMessage = () => {
        if (deleteDialog.id) {
            router.delete(`/dosen/tugas/diskusi/${deleteDialog.id}`, { preserveScroll: true });
            setDeleteDialog({ open: false, id: null });
        }
    };

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
        admin: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white',
        dosen: 'bg-gradient-to-br from-gray-800 to-black text-white',
        mahasiswa: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    }[type] || 'bg-gray-100 text-gray-700');

    const getReplyTarget = (replyId: number | null) => {
        if (!replyId) return null;
        return diskusi.find(d => d.id === replyId);
    };

    return (
        <DosenLayout>
            <Head title={tugas.judul} />
            <div className="p-6 space-y-6">
                {/* Enhanced Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Button 
                        variant="ghost" 
                        onClick={() => router.visit('/dosen/tugas')} 
                        className="group hover:bg-slate-100 dark:hover:bg-gray-800 transition-all duration-300"
                    >
                        <motion.div
                            whileHover={{ x: -4 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                        </motion.div>
                        Kembali ke Daftar Tugas
                    </Button>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Enhanced with Glassmorphism */}
                    <motion.div 
                        className="lg:col-span-2 space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {/* Enhanced Header Card with Gradient Background */}
                        <div className="relative overflow-hidden rounded-3xl border border-slate-200/50 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-gray-800/50 dark:bg-black/90">
                            {/* Animated Background Gradients */}
                            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl" />
                            <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl" />
                            
                            <div className="relative p-8">
                                {/* Badges Row with Enhanced Styling */}
                                <motion.div 
                                    className="flex items-center gap-2 mb-6 flex-wrap"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                                        <Badge className={`${getPriorityStyle(tugas.prioritas)} px-4 py-1.5 text-sm font-semibold capitalize flex items-center gap-1.5`}>
                                            <Zap className="h-3.5 w-3.5" />
                                            {tugas.prioritas}
                                        </Badge>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                                        <Badge className={`${getStatusStyle(tugas.status)} px-4 py-1.5 text-sm font-semibold capitalize flex items-center gap-1.5`}>
                                            <CheckCircle className="h-3.5 w-3.5" />
                                            {tugas.status}
                                        </Badge>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                                        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1.5 text-sm font-semibold capitalize flex items-center gap-1.5 shadow-lg shadow-blue-500/50">
                                            <FileText className="h-3.5 w-3.5" />
                                            {tugas.jenis}
                                        </Badge>
                                    </motion.div>
                                    {tugas.is_overdue && (
                                        <motion.div 
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-1.5 text-sm font-semibold flex items-center gap-1.5 shadow-lg shadow-red-500/50">
                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                Overdue
                                            </Badge>
                                        </motion.div>
                                    )}
                                </motion.div>
                                
                                {/* Enhanced Title with Gradient Text */}
                                <motion.h1 
                                    className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {tugas.judul}
                                </motion.h1>
                                
                                {/* Enhanced Meta Info with Better Design */}
                                <motion.div 
                                    className="flex items-center gap-3 flex-wrap"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <motion.div 
                                        className="flex items-center gap-2 bg-blue-50/80 dark:bg-blue-900/30 px-4 py-2.5 rounded-xl border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm"
                                        whileHover={{ scale: 1.05, y: -2 }}
                                    >
                                        <div className="p-1.5 rounded-lg bg-blue-500 text-white">
                                            <BookOpen className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{tugas.course.nama}</span>
                                    </motion.div>
                                    <motion.div 
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border backdrop-blur-sm ${
                                            tugas.is_overdue 
                                                ? 'bg-red-50/80 dark:bg-red-900/30 border-red-200/50 dark:border-red-800/50' 
                                                : 'bg-purple-50/80 dark:bg-purple-900/30 border-purple-200/50 dark:border-purple-800/50'
                                        }`}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                    >
                                        <div className={`p-1.5 rounded-lg ${tugas.is_overdue ? 'bg-red-500' : 'bg-purple-500'} text-white`}>
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <span className={`text-sm font-semibold ${
                                            tugas.is_overdue 
                                                ? 'text-red-700 dark:text-red-300' 
                                                : 'text-purple-700 dark:text-purple-300'
                                        }`}>
                                            {tugas.deadline_display}
                                        </span>
                                    </motion.div>
                                    {!tugas.is_overdue && tugas.days_until_deadline <= 7 && (
                                        <motion.div 
                                            className="flex items-center gap-2 bg-amber-50/80 dark:bg-amber-900/30 px-4 py-2.5 rounded-xl border border-amber-200/50 dark:border-amber-800/50 backdrop-blur-sm"
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <div className="p-1.5 rounded-lg bg-amber-500 text-white">
                                                <Clock className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                                                {tugas.days_until_deadline} hari lagi
                                            </span>
                                        </motion.div>
                                    )}
                                </motion.div>
                                
                                {/* Enhanced Description Section */}
                                <motion.div 
                                    className="mt-8 p-6 bg-slate-50/80 dark:bg-gray-900/50 rounded-2xl border border-slate-200/50 dark:border-gray-800/50 backdrop-blur-sm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                                        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
                                            <Sparkles className="h-4 w-4" />
                                        </div>
                                        Deskripsi Tugas
                                    </h3>
                                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-base">
                                        {tugas.deskripsi}
                                    </p>
                                </motion.div>
                                
                                {/* Enhanced Instruksi Section */}
                                {tugas.instruksi && (
                                    <motion.div 
                                        className="mt-6 p-6 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200/50 dark:border-indigo-800/50 backdrop-blur-sm"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                                            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                                                <Zap className="h-4 w-4" />
                                            </div>
                                            Instruksi Pengerjaan
                                        </h3>
                                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-base">
                                            {tugas.instruksi}
                                        </p>
                                    </motion.div>
                                )}
                                
                                {/* Enhanced Creator Info */}
                                <motion.div 
                                    className="mt-8 pt-6 border-t border-slate-200 dark:border-gray-800"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-start gap-3 p-4 bg-emerald-50/80 dark:bg-emerald-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                                            <div className="p-2 rounded-lg bg-emerald-500 text-white">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Dibuat oleh</p>
                                                <p className="font-semibold text-slate-900 dark:text-white">{tugas.created_by}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    <span className="capitalize">{tugas.created_by_type}</span> • {tugas.created_at}
                                                </p>
                                            </div>
                                        </div>
                                        {tugas.edited_by && (
                                            <div className="flex items-start gap-3 p-4 bg-amber-50/80 dark:bg-amber-900/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                                                <div className="p-2 rounded-lg bg-amber-500 text-white">
                                                    <Edit3 className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Terakhir diedit</p>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{tugas.edited_by}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{tugas.edited_at}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Enhanced Sidebar */}
                    <motion.div 
                        className="space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {/* Enhanced Info Card */}
                        <div className="relative overflow-hidden rounded-3xl border border-slate-200/50 bg-white/90 shadow-xl backdrop-blur-xl dark:border-gray-800/50 dark:bg-black/90">
                            {/* Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
                            
                            <div className="relative p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/50">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Informasi</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    {/* Sisa Waktu Card */}
                                    <motion.div 
                                        className={`p-5 rounded-2xl border backdrop-blur-sm ${
                                            tugas.is_overdue 
                                                ? 'bg-gradient-to-br from-red-50/90 to-rose-50/90 dark:from-red-900/30 dark:to-rose-900/30 border-red-200/50 dark:border-red-800/50' 
                                                : tugas.days_until_deadline <= 3
                                                ? 'bg-gradient-to-br from-amber-50/90 to-orange-50/90 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-200/50 dark:border-amber-800/50'
                                                : 'bg-gradient-to-br from-emerald-50/90 to-green-50/90 dark:from-emerald-900/30 dark:to-green-900/30 border-emerald-200/50 dark:border-emerald-800/50'
                                        }`}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Sisa Waktu</span>
                                            <div className={`p-2 rounded-lg ${
                                                tugas.is_overdue ? 'bg-red-500' : tugas.days_until_deadline <= 3 ? 'bg-amber-500' : 'bg-emerald-500'
                                            } text-white`}>
                                                <Clock className="h-4 w-4" />
                                            </div>
                                        </div>
                                        <p className={`text-2xl font-bold ${
                                            tugas.is_overdue 
                                                ? 'text-red-600 dark:text-red-400' 
                                                : tugas.days_until_deadline <= 3 
                                                ? 'text-amber-600 dark:text-amber-400' 
                                                : 'text-emerald-600 dark:text-emerald-400'
                                        }`}>
                                            {tugas.is_overdue ? 'Sudah Lewat' : `${tugas.days_until_deadline} Hari`}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-2">
                                            {tugas.is_overdue ? 'Deadline telah terlewati' : 'Hingga deadline'}
                                        </p>
                                    </motion.div>
                                    
                                    {/* Diskusi Count Card */}
                                    <motion.div 
                                        className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/90 to-cyan-50/90 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm"
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Diskusi</span>
                                            <div className="p-2 rounded-lg bg-blue-500 text-white">
                                                <MessageSquare className="h-4 w-4" />
                                            </div>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{diskusi.length}</p>
                                        <p className="text-xs text-slate-500 mt-2">Pesan dalam diskusi</p>
                                    </motion.div>
                                </div>
                                
                                {/* Enhanced Action Button */}
                                <motion.div
                                    className="mt-6"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        onClick={() => router.visit(`/dosen/tugas/${tugas.id}/grading`)}
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/50 py-6 text-base font-semibold"
                                    >
                                        <Award className="h-5 w-5 mr-2" /> Penilaian Submission
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Enhanced Diskusi Section with Advanced Chat UI */}
                <motion.div 
                    className="relative overflow-hidden rounded-3xl border border-slate-200/50 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-gray-800/50 dark:bg-black/90"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
                    
                    {/* Enhanced Header */}
                    <div className="relative p-6 border-b border-slate-200/50 dark:border-gray-800/50 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-gray-900/50 dark:to-black/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <motion.div 
                                    className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/50"
                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <MessageSquare className="h-5 w-5" />
                                </motion.div>
                                <div>
                                    <h2 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                                        Diskusi Tugas
                                        <motion.span 
                                            className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-semibold shadow-lg"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.4, type: "spring" }}
                                        >
                                            {diskusi.length}
                                        </motion.span>
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Diskusi dengan mahasiswa tentang tugas ini
                                    </p>
                                </div>
                            </div>
                            <motion.div 
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/50"
                                whileHover={{ scale: 1.05 }}
                            >
                                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                                    {diskusi.filter(d => d.sender_type === 'mahasiswa').length} Mahasiswa
                                </span>
                            </motion.div>
                        </div>
                    </div>
                    
                    {/* Enhanced Chat Messages Area */}
                    <div className="relative p-6 space-y-4 max-h-[600px] overflow-y-auto">
                        {diskusi.length === 0 ? (
                            <motion.div 
                                className="text-center py-20"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <motion.div 
                                    className="relative mx-auto w-32 h-32 mb-8"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl" />
                                    <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full shadow-2xl shadow-blue-500/50">
                                        <MessageSquare className="h-16 w-16 text-white" />
                                    </div>
                                </motion.div>
                                <motion.p 
                                    className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-3"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Belum ada diskusi
                                </motion.p>
                                <motion.p 
                                    className="text-sm text-slate-500"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Mulai diskusi dengan mengirim pesan pertama
                                </motion.p>
                            </motion.div>
                        ) : (
                            <AnimatePresence>
                                {diskusi.map((d, index) => {
                                    const replyTarget = getReplyTarget(d.reply_to_id);
                                    return (
                                        <motion.div
                                            key={d.id}
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05, duration: 0.3 }}
                                            className={`relative group ${d.is_pinned ? 'order-first' : ''}`}
                                        >
                                            {/* Reply Thread Indicator */}
                                            {replyTarget && (
                                                <motion.div 
                                                    className="ml-6 mb-3 pl-4 border-l-2 border-blue-400 dark:border-blue-600"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                >
                                                    <div className="flex items-center gap-2 text-xs p-3 bg-blue-50/80 dark:bg-blue-900/30 rounded-xl border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
                                                        <CornerDownRight className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                                        <span className="font-semibold text-blue-600 dark:text-blue-400">Membalas {replyTarget.sender_name}:</span>
                                                        <span className="truncate text-slate-600 dark:text-slate-400">"{replyTarget.pesan}"</span>
                                                    </div>
                                                </motion.div>
                                            )}
                                            
                                            {/* Enhanced Message Card */}
                                            <motion.div 
                                                className={`relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                                                    d.is_pinned 
                                                        ? 'bg-gradient-to-br from-amber-50/90 to-yellow-50/90 dark:from-amber-900/30 dark:to-yellow-900/30 border-amber-300/50 dark:border-amber-700/50 shadow-lg shadow-amber-500/20' 
                                                        : 'bg-white/80 dark:bg-gray-900/80 border-slate-200/50 dark:border-gray-800/50 hover:shadow-lg'
                                                }`}
                                                whileHover={{ scale: 1.01, y: -2 }}
                                            >
                                                {/* Pinned Indicator */}
                                                {d.is_pinned && (
                                                    <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-bl-xl flex items-center gap-1">
                                                        <Pin className="h-3 w-3" />
                                                        Pinned
                                                    </div>
                                                )}
                                                
                                                <div className="flex gap-4 p-5">
                                                    {/* Enhanced Avatar */}
                                                    <motion.div
                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                    >
                                                        <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-800 shadow-lg flex-shrink-0">
                                                            <AvatarFallback className={`${getSenderStyle(d.sender_type)} text-lg font-bold`}>
                                                                {d.sender_name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </motion.div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        {/* Message Header */}
                                                        <div className="flex items-center gap-2 flex-wrap mb-3">
                                                            <span className="font-bold text-base text-slate-900 dark:text-white">{d.sender_name}</span>
                                                            <Badge variant="outline" className="text-xs capitalize font-medium">
                                                                {d.sender_type}
                                                            </Badge>
                                                            {d.visibility === 'private' && (
                                                                <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold shadow-lg">
                                                                    🔒 Private
                                                                </Badge>
                                                            )}
                                                            <span className="text-xs text-slate-500 ml-auto">{d.time_ago}</span>
                                                        </div>
                                                        
                                                        {/* Message Content */}
                                                        <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4 whitespace-pre-wrap">
                                                            {d.pesan}
                                                        </p>
                                                        
                                                        {/* Enhanced Action Buttons */}
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    onClick={() => handleReply(d)} 
                                                                    className="h-8 text-xs hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                                                                >
                                                                    <Reply className="h-3.5 w-3.5 mr-1.5" /> Balas
                                                                </Button>
                                                            </motion.div>
                                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    onClick={() => togglePin(d.id)} 
                                                                    className="h-8 text-xs hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-medium"
                                                                >
                                                                    <Pin className="h-3.5 w-3.5 mr-1.5" /> {d.is_pinned ? 'Unpin' : 'Pin'}
                                                                </Button>
                                                            </motion.div>
                                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm" 
                                                                    onClick={() => openDeleteDialog(d.id)} 
                                                                    className="h-8 text-xs text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Hapus
                                                                </Button>
                                                            </motion.div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    
                    {/* Enhanced Reply Indicator */}
                    <AnimatePresence>
                        {replyTo && (
                            <motion.div 
                                className="px-6 py-4 bg-gradient-to-r from-blue-50/90 to-cyan-50/90 dark:from-blue-900/30 dark:to-cyan-900/30 border-t border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="p-2 rounded-lg bg-blue-500 text-white">
                                            <Reply className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                Membalas {replyTo.sender_name}
                                            </p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                                "{replyTo.pesan}"
                                            </p>
                                        </div>
                                    </div>
                                    <motion.div whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => setReplyTo(null)} 
                                            className="h-8 w-8 p-0 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {/* Enhanced Input Area */}
                    <div className="relative p-6 border-t border-slate-200/50 dark:border-gray-800/50 bg-slate-50/50 dark:bg-gray-900/50">
                        <div className="flex gap-3 mb-4">
                            <Select value={visibility} onValueChange={setVisibility}>
                                <SelectTrigger className="w-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl hover:border-indigo-500 transition-all duration-300">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">
                                        <span className="flex items-center gap-2">
                                            <Users className="h-3.5 w-3.5" />
                                            Public
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="private">
                                        <span className="flex items-center gap-2">
                                            🔒 Private
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-xs text-slate-500 self-center">
                                {visibility === 'public' ? '🌐 Semua orang bisa melihat' : '🔒 Hanya penerima yang bisa melihat'}
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <Textarea 
                                ref={inputRef}
                                placeholder={replyTo ? `Balas ke ${replyTo.sender_name}...` : "Tulis pesan diskusi..."} 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)} 
                                rows={3} 
                                className="flex-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 resize-none" 
                                onKeyDown={(e) => { 
                                    if (e.key === 'Enter' && !e.shiftKey) { 
                                        e.preventDefault(); 
                                        sendMessage(); 
                                    } 
                                }} 
                            />
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button 
                                    onClick={sendMessage} 
                                    disabled={!message.trim()}
                                    className="h-full px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </motion.div>
                        </div>
                        <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                            <Sparkles className="h-3 w-3" />
                            Tekan Enter untuk kirim, Shift+Enter untuk baris baru
                        </p>
                    </div>
                </motion.div>

                {/* Delete Message Confirmation Dialog */}
                <ConfirmDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })}
                    onConfirm={deleteMessage}
                    title="Hapus Pesan"
                    message="Yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan."
                    variant="danger"
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                />
            </div>
        </DosenLayout>
    );
}
