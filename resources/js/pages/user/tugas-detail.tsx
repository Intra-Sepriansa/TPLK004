import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, BookOpen, Calendar, CheckCircle, Clock, CornerDownRight, Download, FileText, MessageSquare, Pin, Reply, Send, Upload, X, Sparkles, Zap, AlertTriangle, Award, Flag } from 'lucide-react';

type Diskusi = {
    id: number; sender_type: string; sender_name: string; sender_avatar: string | null;
    pesan: string; visibility: string; recipient_name: string | null; is_pinned: boolean;
    is_mine: boolean; reply_to_id: number | null; reply_to?: { sender_name: string; pesan: string } | null;
    created_at: string; time_ago: string;
};
type Submission = {
    id: number; content: string | null; file_path: string | null; file_name: string | null;
    status: string; grade: number | null; grade_letter: string | null; feedback: string | null;
    submitted_at: string | null; graded_at: string | null;
};
type Tugas = {
    id: number; judul: string; deskripsi: string; instruksi: string | null; jenis: string;
    deadline: string; deadline_display: string; prioritas: string;
    allow_late_submission: boolean; late_penalty_percent: number; max_grade: number;
    course: { id: number; nama: string; dosen: string | null; dosen_id: number | null };
    created_by: string; is_overdue: boolean; days_until_deadline: number; created_at: string;
};
type Props = {
    mahasiswa: { id: number; nama: string; nim: string };
    tugas: Tugas; diskusi: Diskusi[]; submission: Submission | null;
};

export default function UserTugasDetail({ mahasiswa, tugas, diskusi, submission }: Props) {
    const [message, setMessage] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [replyTo, setReplyTo] = useState<Diskusi | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const submitForm = useForm({
        content: submission?.content || '',
        file: null as File | null,
    });

    useEffect(() => { setIsLoaded(true); chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [diskusi]);

    const handleSubmit = () => {
        const formData = new FormData();
        if (submitForm.data.content) formData.append('content', submitForm.data.content);
        if (submitForm.data.file) formData.append('file', submitForm.data.file);

        router.post(`/user/tugas/${tugas.id}/submit`, formData, {
            forceFormData: true,
            onSuccess: () => setShowSubmitForm(false),
        });
    };

    const sendMessage = () => {
        if (!message.trim()) return;
        router.post(`/user/tugas/${tugas.id}/message`, { 
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

    const getPriorityStyle = (p: string) => ({
        tinggi: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25',
        sedang: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25',
        rendah: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25',
    }[p] || 'bg-gray-100 text-gray-700');

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
        <StudentLayout>
            <Head title={tugas.judul} />
            
            {/* Container with proper padding */}
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
                {/* Ultra Advanced Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 shadow-2xl"
                    style={{ perspective: '1500px' }}
                >
                    {/* Animated Background Orbs */}
                    <motion.div 
                        animate={{
                            scale: [1, 1.5, 1],
                            rotate: [0, 180, 360],
                            opacity: [0.1, 0.2, 0.1],
                            x: [0, 50, 0],
                            y: [0, -30, 0],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 blur-3xl"
                    />
                    <motion.div 
                        animate={{
                            scale: [1, 1.6, 1],
                            rotate: [360, 180, 0],
                            opacity: [0.1, 0.15, 0.1],
                            x: [0, -40, 0],
                            y: [0, 40, 0],
                        }}
                        transition={{
                            duration: 22,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-gradient-to-br from-teal-400/30 to-cyan-500/30 blur-3xl"
                    />
                    
                    {/* 30 Floating Particles */}
                    {[...Array(30)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ 
                                opacity: [0, 0.8, 1, 0.6, 0],
                                scale: [0, 1.8, 1.2, 0.8, 0],
                                y: [0, -50, -100, -150, -200],
                                x: [0, Math.sin(i * 0.5) * 40, Math.cos(i * 0.3) * 30, Math.sin(i) * 20, 0],
                                rotate: [0, 180, 360, 540, 720],
                            }}
                            transition={{
                                duration: 5 + Math.random() * 3,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeOut"
                            }}
                            className="absolute rounded-full"
                            style={{
                                width: `${3 + Math.random() * 8}px`,
                                height: `${3 + Math.random() * 8}px`,
                                left: `${10 + (i * 3) % 80}%`,
                                top: `${20 + (i % 4) * 20}%`,
                                background: i % 3 === 0 
                                    ? 'rgba(255, 255, 255, 0.7)' 
                                    : i % 3 === 1 
                                        ? 'rgba(6, 182, 212, 0.6)' 
                                        : 'rgba(59, 130, 246, 0.6)',
                                boxShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
                            }}
                        />
                    ))}
                    
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <Button 
                            variant="ghost" 
                            onClick={() => router.visit('/user/tugas')} 
                            className="mb-6 text-white hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 font-bold"
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" /> Kembali ke Daftar Tugas
                        </Button>
                        
                        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                            <div className="flex-1 w-full">
                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <Badge className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white px-4 py-2 text-sm font-bold shadow-lg">
                                            {tugas.jenis}
                                        </Badge>
                                    </motion.div>
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: -5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <Badge className={`${getPriorityStyle(tugas.prioritas)} px-4 py-2 text-sm font-bold`}>
                                            <Flag className="h-4 w-4 mr-2" />
                                            Prioritas {tugas.prioritas.charAt(0).toUpperCase() + tugas.prioritas.slice(1)}
                                        </Badge>
                                    </motion.div>
                                    {tugas.is_overdue && (
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                                                <AlertTriangle className="h-4 w-4 mr-2" />
                                                Deadline Terlewat
                                            </Badge>
                                        </motion.div>
                                    )}
                                </div>
                                
                                <motion.h1 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight"
                                >
                                    {tugas.judul}
                                </motion.h1>
                                
                                <div className="flex items-center gap-4 flex-wrap">
                                    <motion.div 
                                        whileHover={{ scale: 1.05 }}
                                        className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30"
                                    >
                                        <BookOpen className="h-5 w-5 text-cyan-100" />
                                        <span className="font-bold text-white text-sm">{tugas.course.nama}</span>
                                    </motion.div>
                                    <motion.div 
                                        whileHover={{ scale: 1.05 }}
                                        className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30"
                                    >
                                        <Calendar className="h-5 w-5 text-cyan-100" />
                                        <span className="font-bold text-white text-sm">{tugas.deadline_display}</span>
                                    </motion.div>
                                    {tugas.course.dosen && (
                                        <motion.div 
                                            whileHover={{ scale: 1.05 }}
                                            className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30"
                                        >
                                            <Award className="h-5 w-5 text-cyan-100" />
                                            <span className="font-bold text-white text-sm">{tugas.course.dosen}</span>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Countdown Timer */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                                className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/30 shadow-2xl"
                            >
                                <div className="text-center">
                                    <p className="text-sm text-cyan-100 font-semibold mb-2">Sisa Waktu</p>
                                    <motion.div
                                        animate={tugas.is_overdue ? { scale: [1, 1.1, 1] } : {}}
                                        transition={tugas.is_overdue ? { duration: 1.5, repeat: Infinity } : {}}
                                        className={`text-5xl font-extrabold ${tugas.is_overdue ? 'text-red-300' : tugas.days_until_deadline <= 3 ? 'text-amber-300' : 'text-white'}`}
                                    >
                                        {tugas.is_overdue ? '❌' : tugas.days_until_deadline}
                                    </motion.div>
                                    <p className="text-sm text-cyan-100 font-semibold mt-2">
                                        {tugas.is_overdue ? 'Sudah Lewat' : 'Hari Lagi'}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content Area with proper container */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Row 1: Description - Full Width */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative rounded-3xl border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-cyan-950/20 p-8 shadow-2xl overflow-hidden mb-8"
                >
                    {/* Animated Background Pattern */}
                    <motion.div
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%'],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }}
                    />
                    
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-gray-900 dark:text-white">
                            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            Deskripsi Tugas
                        </h3>
                        <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
                                {tugas.deskripsi}
                            </p>
                        </div>
                        
                        {/* Footer Info */}
                        <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    <span className="font-medium">Dibuat oleh:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{tugas.created_by}</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                    <Calendar className="h-4 w-4 text-purple-500" />
                                    <span className="font-bold text-gray-900 dark:text-white">{tugas.created_at}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Row 2: Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Instructions */}
                    <div className="space-y-6">
                        {tugas.instruksi && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="relative rounded-3xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 dark:from-gray-900 dark:via-emerald-950/20 dark:to-teal-950/20 p-8 shadow-2xl overflow-hidden"
                            >
                                {/* Animated Background Pattern */}
                                <motion.div
                                    animate={{
                                        backgroundPosition: ['0% 0%', '100% 100%'],
                                    }}
                                    transition={{
                                        duration: 20,
                                        repeat: Infinity,
                                        repeatType: "reverse",
                                    }}
                                    className="absolute inset-0 opacity-5"
                                    style={{
                                        backgroundImage: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 1px, transparent 1px)',
                                        backgroundSize: '20px 20px',
                                    }}
                                />
                                
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-gray-900 dark:text-white">
                                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                                            <Zap className="h-6 w-6 text-white" />
                                        </div>
                                        Instruksi Pengerjaan
                                    </h3>
                                    <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700">
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
                                            {tugas.instruksi}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column - Info & Status in One Row */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Ultra Enhanced Info Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="relative rounded-3xl border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/40 dark:via-cyan-950/40 dark:to-teal-950/40 p-6 shadow-2xl overflow-hidden"
                        >
                            {/* Animated Background Pattern */}
                            <motion.div
                                animate={{
                                    backgroundPosition: ['0% 0%', '100% 100%'],
                                }}
                                transition={{
                                    duration: 20,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                }}
                                className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 1px, transparent 1px)',
                                    backgroundSize: '20px 20px',
                                }}
                            />
                            
                            {/* Floating Orb */}
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" />
                            
                            <div className="relative z-10">
                                <h3 className="font-bold text-xl mb-5 flex items-center gap-3 text-blue-700 dark:text-blue-300">
                                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                                        <Award className="h-6 w-6 text-white" />
                                    </div>
                                    Informasi
                                </h3>
                                <div className="space-y-4">
                                    <motion.div 
                                        whileHover={{ scale: 1.03, x: 5 }}
                                        className="p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl border-2 border-blue-200 dark:border-blue-800 shadow-lg"
                                    >
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-1">Dosen Pengampu</p>
                                        <p className="font-extrabold text-lg text-gray-900 dark:text-white">{tugas.course.dosen || '-'}</p>
                                    </motion.div>
                                    
                                    <motion.div 
                                        whileHover={{ scale: 1.03, x: 5 }}
                                        className={`p-4 backdrop-blur-sm rounded-xl border-2 shadow-lg ${
                                            tugas.is_overdue 
                                                ? 'bg-red-100/70 dark:bg-red-900/40 border-red-300 dark:border-red-700'
                                                : tugas.days_until_deadline <= 3
                                                    ? 'bg-amber-100/70 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700'
                                                    : 'bg-emerald-100/70 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700'
                                        }`}
                                    >
                                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Sisa Waktu Pengerjaan
                                        </p>
                                        <p className={`font-extrabold text-3xl ${
                                            tugas.is_overdue ? 'text-red-700 dark:text-red-400' : 
                                            tugas.days_until_deadline <= 3 ? 'text-amber-700 dark:text-amber-400' : 
                                            'text-emerald-700 dark:text-emerald-400'
                                        }`}>
                                            {tugas.is_overdue ? '❌ Sudah Lewat' : `⏰ ${tugas.days_until_deadline} Hari`}
                                        </p>
                                    </motion.div>
                                    
                                    {tugas.late_penalty_percent > 0 && (
                                        <motion.div 
                                            whileHover={{ scale: 1.03, x: 5 }}
                                            animate={{ scale: [1, 1.02, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 rounded-xl border-2 border-amber-400 dark:border-amber-600 shadow-lg"
                                        >
                                            <p className="text-sm text-amber-800 dark:text-amber-300 font-semibold mb-2 flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4" />
                                                Penalti Keterlambatan
                                            </p>
                                            <p className="font-extrabold text-3xl text-amber-700 dark:text-amber-400">-{tugas.late_penalty_percent}%</p>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Ultra Enhanced Submission Status Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="relative rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/40 dark:to-teal-950/40 p-6 shadow-2xl overflow-hidden">
                            {/* Animated Background */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 1px, transparent 1px)',
                                    backgroundSize: '20px 20px',
                                }} />
                            </div>
                            
                            {/* Floating Orb */}
                            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse" />
                            
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-5 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                                        <FileText className="h-5 w-5 text-white" />
                                    </div>
                                    Status Pengumpulan
                                </h3>
                                {submission ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            {submission.status === 'graded' ? (
                                                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 text-sm font-bold shadow-lg">✓ Dinilai</Badge>
                                            ) : submission.status === 'late' ? (
                                                <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 text-sm font-bold shadow-lg animate-pulse">⚠️ Terlambat</Badge>
                                            ) : (
                                                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 text-sm font-bold shadow-lg">📤 Dikumpulkan</Badge>
                                            )}
                                        </div>
                                        <div className="p-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-emerald-800">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-emerald-500" />
                                                <span className="font-medium">Dikumpulkan:</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{submission.submitted_at}</span>
                                            </p>
                                        </div>
                                        {submission.file_name && (
                                            <a
                                                href={submission.file_path || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                                            >
                                                <div className="p-2 bg-emerald-500 rounded-lg">
                                                    <Download className="h-5 w-5 text-white" />
                                                </div>
                                                <span className="truncate font-bold">{submission.file_name}</span>
                                            </a>
                                        )}
                                        {submission.grade !== null && (
                                            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 shadow-2xl">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-bold text-white/90">Nilai Akhir:</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-4xl font-extrabold text-white">{submission.grade}</span>
                                                        {submission.grade_letter && (
                                                            <span className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-xl font-extrabold shadow-lg">
                                                                {submission.grade_letter}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {submission.feedback && (
                                                    <div className="mt-3 pt-3 border-t border-white/20">
                                                        <p className="text-xs text-white/80 font-semibold mb-1">Feedback Dosen:</p>
                                                        <p className="text-sm text-white leading-relaxed">{submission.feedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {submission.status !== 'graded' && (
                                            <Button
                                                onClick={() => setShowSubmitForm(true)}
                                                variant="outline"
                                                className="w-full border-2 border-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-bold"
                                            >
                                                <Upload className="h-4 w-4 mr-2" /> Update Submission
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="text-center py-6">
                                            <div className="relative mx-auto w-16 h-16 mb-3">
                                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full opacity-20 animate-ping" />
                                                <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full">
                                                    <Upload className="h-8 w-8 text-white" />
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Belum mengumpulkan tugas</p>
                                        </div>
                                        {(!tugas.is_overdue || tugas.allow_late_submission) && (
                                            <Button
                                                onClick={() => setShowSubmitForm(true)}
                                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                            >
                                                <Upload className="h-5 w-5 mr-2" /> Kumpulkan Tugas Sekarang
                                            </Button>
                                        )}
                                        {tugas.is_overdue && !tugas.allow_late_submission && (
                                            <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/40 border-2 border-red-300 dark:border-red-700">
                                                <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2 font-bold">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Deadline sudah lewat, tidak dapat mengumpulkan
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Diskusi Section - Full Width Below */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 rounded-2xl border bg-card shadow-lg"
                >
                    <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-t-2xl">
                        <h2 className="font-semibold flex items-center gap-2 text-lg">
                            <MessageSquare className="h-5 w-5 text-emerald-500" /> Diskusi ({diskusi.length})
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">Tanyakan ke dosen atau admin jika ada pertanyaan</p>
                    </div>
                    <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                        {diskusi.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="relative mx-auto w-20 h-20 mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full opacity-20 animate-ping" />
                                    <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full">
                                        <MessageSquare className="h-10 w-10 text-white" />
                                    </div>
                                </div>
                                <p className="text-muted-foreground">Belum ada diskusi. Mulai bertanya!</p>
                            </div>
                        ) : (
                            diskusi.map((d) => {
                                const replyTarget = getReplyTarget(d.reply_to_id);
                                return (
                                    <div
                                        key={d.id}
                                        className={`relative transition-all duration-300 hover:bg-muted/20 rounded-xl ${d.is_pinned ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800' : ''}`}
                                    >
                                        {/* Reply Thread Line */}
                                        {replyTarget && (
                                            <div className="ml-5 mb-2 pl-4 border-l-2 border-emerald-300 dark:border-emerald-700">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
                                                    <CornerDownRight className="h-3 w-3 text-emerald-500" />
                                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">Membalas {replyTarget.sender_name}:</span>
                                                    <span className="truncate max-w-[300px]">"{replyTarget.pesan}"</span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className={`flex gap-3 p-3 ${d.is_mine ? 'flex-row-reverse' : ''}`}>
                                            <Avatar className="h-10 w-10 ring-2 ring-white shadow-lg flex-shrink-0">
                                                <AvatarFallback className={getSenderStyle(d.sender_type)}>{d.sender_name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className={`flex-1 min-w-0 ${d.is_mine ? 'text-right' : ''}`}>
                                                <div className={`flex items-center gap-2 flex-wrap ${d.is_mine ? 'justify-end' : ''}`}>
                                                    <span className="font-semibold text-sm">{d.sender_name}</span>
                                                    <Badge variant="outline" className="text-xs capitalize">{d.sender_type}</Badge>
                                                    {d.visibility === 'private' && <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs">🔒 Private</Badge>}
                                                    {d.is_pinned && <Pin className="h-3 w-3 text-amber-500" />}
                                                    <span className="text-xs text-muted-foreground">{d.time_ago}</span>
                                                </div>
                                                <div className={`mt-2 p-3 rounded-2xl inline-block max-w-[85%] ${d.is_mine ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white ml-auto' : 'bg-muted'}`}>
                                                    <p className="text-sm leading-relaxed">{d.pesan}</p>
                                                </div>
                                                <div className={`flex gap-1 mt-2 ${d.is_mine ? 'justify-end' : ''}`}>
                                                    <Button variant="ghost" size="sm" onClick={() => handleReply(d)} className="h-7 text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600">
                                                        <Reply className="h-3 w-3 mr-1" /> Balas
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    
                    {/* Reply Indicator */}
                    {replyTo && (
                        <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                                <Reply className="h-4 w-4 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400">Membalas <span className="font-semibold">{replyTo.sender_name}</span>:</span>
                                <span className="text-muted-foreground truncate max-w-[300px]">"{replyTo.pesan}"</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)} className="h-6 w-6 p-0 hover:bg-emerald-200 dark:hover:bg-emerald-800">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    
                    <div className="p-4 border-t bg-muted/20">
                        <div className="flex gap-2 mb-3">
                            <Select value={visibility} onValueChange={setVisibility}>
                                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">🌐 Public</SelectItem>
                                    <SelectItem value="private">🔒 Private</SelectItem>
                                </SelectContent>
                            </Select>
                            <span className="text-xs text-muted-foreground self-center">{visibility === 'public' ? 'Semua orang bisa melihat' : 'Hanya dosen/admin yang bisa melihat'}</span>
                        </div>
                        <div className="flex gap-2">
                            <Textarea 
                                ref={inputRef}
                                placeholder={replyTo ? `Balas ke ${replyTo.sender_name}...` : "Tulis pertanyaan atau komentar..."} 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)} 
                                rows={2} 
                                className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-emerald-500" 
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} 
                            />
                            <Button onClick={sendMessage} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-105">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Submit Form Dialog */}
                {showSubmitForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="bg-card rounded-2xl p-6 w-full max-w-lg shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-emerald-500" />
                                    {submission ? 'Update Submission' : 'Kumpulkan Tugas'}
                                </h3>
                                <Button variant="ghost" size="sm" onClick={() => setShowSubmitForm(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            {tugas.is_overdue && (
                                <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    Deadline sudah lewat. Nilai akan dikurangi {tugas.late_penalty_percent}%.
                                </div>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <Label>Jawaban (Opsional)</Label>
                                    <Textarea
                                        value={submitForm.data.content}
                                        onChange={(e) => submitForm.setData('content', e.target.value)}
                                        placeholder="Tulis jawaban atau catatan..."
                                        rows={5}
                                    />
                                </div>
                                <div>
                                    <Label>Upload File (Opsional)</Label>
                                    <div className="mt-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.doc,.docx,.zip,.rar"
                                            onChange={(e) => submitForm.setData('file', e.target.files?.[0] || null)}
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            {submitForm.data.file ? submitForm.data.file.name : 'Pilih File'}
                                        </Button>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Format: PDF, DOC, DOCX, ZIP, RAR (Max 10MB)
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!submitForm.data.content && !submitForm.data.file}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" /> Kirim
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
                </div>
            </div>
        </StudentLayout>
    );
}
