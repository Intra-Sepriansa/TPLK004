# 🎯 PROMPT: RAPIKAN DETAIL INFORMASI TUGAS MAHASISWA - 100% MATCHING ADMIN DASHBOARD

## 📋 OVERVIEW - MENU KRUSIAL & PENTING

Menu **Detail Informasi Tugas** adalah salah satu menu paling krusial dan penting dalam sistem. Menu ini harus dirapikan dengan sangat serius dan teliti untuk memberikan pengalaman terbaik kepada mahasiswa.

---

## ❌ MASALAH YANG HARUS DIPERBAIKI

### 1. Header Issues
```
❌ Ada container di icon header (harus dihilangkan)
❌ Ada animasi floating particles yang bergerak ke atas (harus dihilangkan)
❌ Header tidak responsive di mobile seperti admin dashboard
❌ Tombol kembali tidak matching dengan menu lain
❌ Breadcrumb tidak rapi
```

### 2. Container & Color Issues
```
❌ Warna container belum 100% matching admin dashboard
❌ Border colors tidak konsisten
❌ Icon cards tidak disesuaikan dengan warna container
❌ Glassmorphism effect kurang optimal
```

### 3. Mobile Responsiveness Issues
```
❌ Header tidak rapi di mode mobile
❌ Layout tidak menyesuaikan dengan baik di mobile
❌ Icon size tidak responsive
❌ Text size tidak optimal di mobile
```

### 4. Data Issues
```
❌ Masih ada kemungkinan data dummy
❌ Data tidak real-time
```

---

## ✅ SOLUSI YANG HARUS DIIMPLEMENTASIKAN

### 1. Header - Clean & Professional
```
✅ Hapus container di icon header
✅ Hapus semua animasi floating particles
✅ Header gradient matching admin dashboard
✅ Tombol kembali matching dengan menu lain
✅ Breadcrumb rapi dan konsisten
✅ Responsive perfect di mobile
```

### 2. Container & Colors - 100% Admin Matching
```
✅ bg-white/40 dark:bg-neutral-900/40 untuk semua container
✅ border-white/20 dark:border-white/5 untuk semua border
✅ Icon cards disesuaikan dengan warna container
✅ Gradient header: from-indigo-600 via-purple-600 to-pink-500
✅ backdrop-blur-xl untuk glassmorphism
```

### 3. Mobile Responsiveness - Perfect
```
✅ Header responsive seperti admin dashboard
✅ Icon size: mobile (h-16 w-16), desktop (h-20 w-20)
✅ Text size: mobile (text-xl), desktop (text-3xl)
✅ Padding: mobile (p-6), desktop (p-8)
✅ Layout grid responsive
```

### 4. Data - Real & No Dummy
```
✅ Semua data dari backend real
✅ No hardcoded dummy data
✅ Real-time updates
```

---

## 🎨 DESIGN SYSTEM - HITAM THEME (100% ADMIN MATCHING)

### Color Palette (WAJIB)
```typescript
// CONTAINER COLORS
bg-white/40 dark:bg-neutral-900/40  // Main containers
backdrop-blur-xl                     // Glassmorphism effect

// BORDER COLORS
border-white/20 dark:border-white/5  // Container borders (NOT border-gray-800)

// GRADIENT HEADER (WAJIB - ADMIN STYLE)
from-indigo-600 via-purple-600 to-pink-500

// TEXT COLORS
text-neutral-900 dark:text-white     // Primary text
text-neutral-500 dark:text-neutral-400  // Secondary text

// ROUNDED CORNERS
rounded-3xl  // Main containers (NOT rounded-2xl)

// SHADOWS
shadow-xl    // Main containers (NOT shadow-sm)
```

### Animation Standards (WAJIB)
```typescript
// Consistent dengan admin dashboard
stiffness: 300
damping: 20

// TIDAK BOLEH menggunakan:
stiffness: 100, damping: 15  // Terlalu lambat
stiffness: 200, damping: 25  // Terlalu bouncy
```

### Icon Standards
```typescript
// PNG Icons dengan drop-shadow
drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]

// Icon size responsive
mobile: h-16 w-16
desktop: h-20 w-20

// Icon cards - warna disesuaikan dengan container
// Contoh: Container emerald -> Icon emerald
```

---

## 💻 IMPLEMENTASI LENGKAP

### File: resources/js/pages/user/tugas-detail.tsx

```typescript
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft, BookOpen, Calendar, CheckCircle, Clock, CornerDownRight, Download,
    FileText, MessageSquare, Pin, Reply, Send, Upload, X, Sparkles, Zap, AlertTriangle,
    Award, Flag, ChevronRight, Search, Bell, Share2, Paperclip, Smile
} from 'lucide-react';

// Import icons (NO DUMMY DATA)
import tugasHeaderIcon from '@/assets/admin/informasi-tugas/tugas-header.png';

type Diskusi = {
    id: number;
    sender_type: string;
    sender_name: string;
    sender_avatar: string | null;
    pesan: string;
    visibility: string;
    recipient_name: string | null;
    is_pinned: boolean;
    is_mine: boolean;
    reply_to_id: number | null;
    reply_to?: { sender_name: string; pesan: string } | null;
    created_at: string;
    time_ago: string;
};

type Submission = {
    id: number;
    content: string | null;
    file_path: string | null;
    file_name: string | null;
    status: string;
    grade: number | null;
    grade_letter: string | null;
    feedback: string | null;
    submitted_at: string | null;
    graded_at: string | null;
};

type Tugas = {
    id: number;
    judul: string;
    deskripsi: string;
    instruksi: string | null;
    jenis: string;
    deadline: string;
    deadline_display: string;
    prioritas: string;
    allow_late_submission: boolean;
    late_penalty_percent: number;
    max_grade: number;
    course: {
        id: number;
        nama: string;
        dosen: string | null;
        dosen_id: number | null;
    };
    created_by: string;
    is_overdue: boolean;
    days_until_deadline: number;
    created_at: string;
};

type Props = {
    mahasiswa: { id: number; nama: string; nim: string };
    tugas: Tugas;
    diskusi: Diskusi[];
    submission: Submission | null;
};

export default function UserTugasDetail({ tugas, diskusi, submission }: Props) {
    const [message, setMessage] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [replyTo, setReplyTo] = useState<Diskusi | null>(null);
    const [showSubmitForm, setShowSubmitForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const submitForm = useForm({
        content: submission?.content || '',
        file: null as File | null,
    });

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.04, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 20 }
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [diskusi]);

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
            onSuccess: () => {
                setMessage('');
                setReplyTo(null);
            },
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
        admin: 'bg-gradient-to-br from-red-500 to-pink-600 text-white',
        dosen: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white',
        mahasiswa: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    }[type] || 'bg-gray-100 text-gray-700');

    const filteredDiskusi = useMemo(() =>
        searchQuery
            ? diskusi.filter(d =>
                d.pesan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.sender_name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            : diskusi
        , [diskusi, searchQuery]);

    const pinnedMessages = useMemo(() => diskusi.filter(d => d.is_pinned), [diskusi]);

    return (
        <StudentLayout>
            <Head title={tugas.judul} />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
            >
                {/* ═══════════════════════════════════════════════════ */}
                {/* HEADER - CLEAN & PROFESSIONAL (NO CONTAINER, NO PARTICLES) */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        {/* Breadcrumb - Rapi */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-2 mb-4 text-sm text-white/80"
                        >
                            <button
                                onClick={() => router.visit('/user/tugas')}
                                className="hover:text-white transition-colors"
                            >
                                Tugas
                            </button>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-white font-medium truncate max-w-[200px] sm:max-w-[300px]">
                                {tugas.judul}
                            </span>
                        </motion.div>

                        {/* Back Button - Matching dengan menu lain */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Button
                                variant="ghost"
                                onClick={() => router.visit('/user/tugas')}
                                className="mb-6 text-white hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 font-bold rounded-xl"
                            >
                                <ArrowLeft className="mr-2 h-5 w-5" />
                                Kembali
                            </Button>
                        </motion.div>

                        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                            {/* Left: Content */}
                            <div className="flex-1 w-full">
                                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                                    {/* Icon - NO CONTAINER, JUST IMAGE */}
                                    <motion.div
                                        className="relative flex shrink-0 h-16 w-16 sm:h-20 sm:w-20 mx-auto sm:mx-0"
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <img
                                            src={tugasHeaderIcon}
                                            alt="Tugas"
                                            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]"
                                        />
                                    </motion.div>

                                    {/* Text Content */}
                                    <div className="flex-1 text-center sm:text-left">
                                        {/* Badges */}
                                        <div className="flex items-center justify-center sm:justify-start gap-3 mb-4 flex-wrap">
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                                                whileHover={{ scale: 1.1 }}
                                            >
                                                <Badge className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white px-4 py-2 text-sm font-bold shadow-lg">
                                                    {tugas.jenis}
                                                </Badge>
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                                                whileHover={{ scale: 1.1 }}
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

                                        {/* Title */}
                                        <motion.h1
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 }}
                                            className="text-xl sm:text-3xl font-extrabold text-white mb-4 tracking-tight"
                                        >
                                            {tugas.judul}
                                        </motion.h1>

                                        {/* Meta Info Pills */}
                                        <div className="flex items-center justify-center sm:justify-start gap-4 flex-wrap">
                                            {[
                                                { icon: BookOpen, text: tugas.course.nama, delay: 0.7 },
                                                { icon: Calendar, text: tugas.deadline_display, delay: 0.8 },
                                                ...(tugas.course.dosen ? [{ icon: Award, text: tugas.course.dosen, delay: 0.9 }] : []),
                                            ].map((item, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: item.delay }}
                                                    whileHover={{ scale: 1.05 }}
                                                    className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30"
                                                >
                                                    <item.icon className="h-5 w-5 text-white" />
                                                    <span className="font-bold text-white text-sm">{item.text}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Countdown Timer */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 1 }}
                                className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/30 shadow-2xl min-w-[180px]"
                            >
                                <div className="text-center">
                                    <p className="text-sm text-white/90 font-semibold mb-2">Sisa Waktu</p>
                                    <motion.div
                                        animate={tugas.is_overdue ? { scale: [1, 1.1, 1] } : {}}
                                        transition={tugas.is_overdue ? { duration: 1.5, repeat: Infinity } : {}}
                                        className={`text-5xl font-extrabold ${
                                            tugas.is_overdue
                                                ? 'text-red-300'
                                                : tugas.days_until_deadline <= 3
                                                    ? 'text-amber-300'
                                                    : 'text-white'
                                        }`}
                                    >
                                        {tugas.is_overdue ? '❌' : tugas.days_until_deadline}
                                    </motion.div>
                                    <p className="text-sm text-white/90 font-semibold mt-2">
                                        {tugas.is_overdue ? 'Sudah Lewat' : 'Hari Lagi'}
                                    </p>
                                    {!tugas.is_overdue && (
                                        <div className="mt-4 relative w-20 h-20 mx-auto">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle
                                                    cx="40"
                                                    cy="40"
                                                    r="35"
                                                    stroke="rgba(255,255,255,0.2)"
                                                    strokeWidth="6"
                                                    fill="none"
                                                />
                                                <motion.circle
                                                    cx="40"
                                                    cy="40"
                                                    r="35"
                                                    stroke="white"
                                                    strokeWidth="6"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    initial={{ strokeDasharray: '0 220' }}
                                                    animate={{
                                                        strokeDasharray: `${Math.min((tugas.days_until_deadline / 30) * 220, 220)} 220`
                                                    }}
                                                    transition={{ duration: 1.5, ease: 'easeOut' }}
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1 }}
                            className="mt-6 flex gap-3 flex-wrap justify-center sm:justify-start"
                        >
                            {[
                                { icon: Download, label: 'Download Materi' },
                                { icon: Share2, label: 'Share' },
                                { icon: Bell, label: 'Set Reminder' },
                            ].map((action) => (
                                <motion.button
                                    key={action.label}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold hover:bg-white/30 transition-all"
                                >
                                    <action.icon className="h-4 w-4" />
                                    {action.label}
                                </motion.button>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
```

Saya akan melanjutkan dengan section berikutnya...

                {/* ═══════════════════════════════════════════════════ */}
                {/* DESCRIPTION SECTION - HITAM THEME                   */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 sm:p-8 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                >
                    <div className="relative z-10">
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-3 text-neutral-900 dark:text-white">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg"
                            >
                                <Sparkles className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                            </motion.div>
                            Deskripsi Tugas
                        </h3>
                        <div className="p-4 sm:p-6 bg-white/60 dark:bg-neutral-800/60 rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/5">
                            <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                                {tugas.deskripsi}
                            </p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/20 dark:border-white/5">
                            <div className="flex items-center gap-3 text-sm flex-wrap">
                                <motion.div
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 transition-all"
                                >
                                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="font-medium text-neutral-600 dark:text-neutral-400">Dibuat oleh:</span>
                                    <span className="font-bold text-neutral-900 dark:text-white">{tugas.created_by}</span>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 transition-all"
                                >
                                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    <span className="font-bold text-neutral-900 dark:text-white">{tugas.created_at}</span>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* INSTRUCTIONS SECTION (if exists)                    */}
                {/* ═══════════════════════════════════════════════════ */}
                {tugas.instruksi && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 sm:p-8 shadow-xl backdrop-blur-xl dark:border-white/5"
                    >
                        <h3 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-3 text-neutral-900 dark:text-white">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: -5 }}
                                className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg"
                            >
                                <Zap className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                            </motion.div>
                            Instruksi Pengerjaan
                        </h3>
                        <div className="p-4 sm:p-6 bg-white/60 dark:bg-neutral-800/60 rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/5">
                            <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                                {tugas.instruksi}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* ═══════════════════════════════════════════════════ */}
                {/* INFO & SUBMISSION STATUS (Side by Side)             */}
                {/* ═══════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Info Card - Icon disesuaikan dengan warna container */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                    >
                        <h3 className="font-bold text-xl mb-5 flex items-center gap-3 text-neutral-900 dark:text-white">
                            <motion.div
                                whileHover={{ scale: 1.15, rotate: 10 }}
                                className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg"
                            >
                                <Award className="h-6 w-6 text-white" />
                            </motion.div>
                            Informasi
                        </h3>
                        <div className="space-y-4">
                            <motion.div
                                whileHover={{ scale: 1.03, x: 5 }}
                                className="p-4 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/5 cursor-pointer transition-all"
                            >
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-semibold mb-1">Dosen Pengampu</p>
                                <p className="font-extrabold text-lg text-neutral-900 dark:text-white">
                                    {tugas.course.dosen || '-'}
                                </p>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.03, x: 5 }}
                                className={`p-4 backdrop-blur-xl rounded-2xl border cursor-pointer transition-all ${
                                    tugas.is_overdue
                                        ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
                                        : tugas.days_until_deadline <= 3
                                            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                                            : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                }`}
                            >
                                <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-neutral-800 dark:text-neutral-300">
                                    <Clock className="h-4 w-4" />
                                    Sisa Waktu Pengerjaan
                                </p>
                                <motion.p
                                    animate={tugas.is_overdue || tugas.days_until_deadline <= 3 ? { scale: [1, 1.05, 1] } : {}}
                                    transition={tugas.is_overdue || tugas.days_until_deadline <= 3 ? { duration: 2, repeat: Infinity } : {}}
                                    className={`font-extrabold text-3xl ${
                                        tugas.is_overdue
                                            ? 'text-rose-700 dark:text-rose-400'
                                            : tugas.days_until_deadline <= 3
                                                ? 'text-amber-700 dark:text-amber-400'
                                                : 'text-emerald-700 dark:text-emerald-400'
                                    }`}
                                >
                                    {tugas.is_overdue ? '❌ Sudah Lewat' : `⏰ ${tugas.days_until_deadline} Hari`}
                                </motion.p>
                            </motion.div>
                            {tugas.late_penalty_percent > 0 && (
                                <motion.div
                                    whileHover={{ scale: 1.03, x: 5 }}
                                    className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 cursor-pointer transition-all"
                                >
                                    <p className="text-sm text-amber-800 dark:text-amber-300 font-semibold mb-2 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Penalti Keterlambatan
                                    </p>
                                    <p className="font-extrabold text-3xl text-amber-700 dark:text-amber-400">
                                        -{tugas.late_penalty_percent}%
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Submission Status Card - Icon disesuaikan dengan warna container */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                    >
                        <h3 className="font-bold text-xl mb-5 flex items-center gap-3 text-neutral-900 dark:text-white">
                            <motion.div
                                whileHover={{ scale: 1.15, rotate: -10 }}
                                className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg"
                            >
                                <FileText className="h-6 w-6 text-white" />
                            </motion.div>
                            Status Pengumpulan
                        </h3>
                        {submission ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    {submission.status === 'graded' ? (
                                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                                            ✓ Dinilai
                                        </Badge>
                                    ) : submission.status === 'late' ? (
                                        <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 py-2 text-sm font-bold shadow-lg animate-pulse">
                                            ⚠️ Terlambat
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                                            📤 Dikumpulkan
                                        </Badge>
                                    )}
                                </div>
                                <div className="p-3 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl rounded-xl border border-white/20 dark:border-white/5">
                                    <p className="text-sm text-neutral-700 dark:text-neutral-400 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                                        <span className="font-medium">Dikumpulkan:</span>
                                        <span className="font-bold text-neutral-900 dark:text-white">{submission.submitted_at}</span>
                                    </p>
                                </div>
                                {submission.file_name && (
                                    <motion.a
                                        href={submission.file_path || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:shadow-lg transition-all"
                                    >
                                        <div className="p-2 bg-emerald-500 rounded-lg">
                                            <Download className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="truncate font-bold">{submission.file_name}</span>
                                    </motion.a>
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
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 p-6 inline-block">
                                    <FileText className="h-12 w-12 text-neutral-400" />
                                </div>
                                <p className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Belum Dikumpulkan</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                                    Anda belum mengumpulkan tugas ini
                                </p>
                                <Button
                                    onClick={() => setShowSubmitForm(true)}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Kumpulkan Tugas
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </div>
```

Saya akan melanjutkan dengan section Diskusi dan penutup...

                {/* ═══════════════════════════════════════════════════ */}
                {/* DISKUSI SECTION - ULTRA ADVANCED                    */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 sm:p-6 border-b border-white/20 dark:border-white/5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900 dark:text-white">Diskusi & Kolaborasi</h3>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {diskusi.length} pesan • Real-time
                                    </p>
                                </div>
                            </div>
                            {/* Search */}
                            <div className="relative hidden sm:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari pesan..."
                                    className="pl-10 pr-4 py-2 rounded-xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl text-sm focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pinned Messages */}
                    {pinnedMessages.length > 0 && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
                            <div className="flex items-center gap-2 mb-3">
                                <Pin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <span className="text-sm font-bold text-amber-800 dark:text-amber-300">Pesan Penting</span>
                            </div>
                            <div className="space-y-2">
                                {pinnedMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className="p-3 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl border border-white/20 dark:border-white/5"
                                    >
                                        <p className=s animation
3. ✅ Header responsive perfect di mobile
4. ✅ Tombol kembali matching menu lain
5. ✅ Container 100% matching admin (HITAM theme)
6. ✅ Icon cards disesuaikan warna
7. ✅ No dummy data - all real
8. ✅ Glassmorphism optimal
9. ✅ Animations smooth (300/20)
10. ✅ Mobile-first responsive

Menu Detail Tugas sekarang KRUSIAL, PENTING, dan 100% MATCHING ADMIN DASHBOARD! 🚀
ackend
7. **GLASSMORPHISM**: backdrop-blur-xl wajib untuk semua container
8. **ANIMATIONS**: stiffness: 300, damping: 20 (konsisten)

---

**Created**: February 27, 2026  
**Purpose**: Rapikan Detail Informasi Tugas Mahasiswa - 100% Matching Admin  
**Status**: Ready for implementation  
**Priority**: CRITICAL - Menu Krusial & Penting  

---

## 🎉 SUMMARY

Prompt ini akan merapikan menu **Detail Informasi Tugas Mahasiswa** dengan sangat serius:

1. ✅ Hapus container di icon header
2. ✅ Hapus floating particle
filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.35));
```

---

## 📝 NOTES PENTING

1. **NO CONTAINER DI ICON HEADER**: Icon langsung tanpa wrapper container
2. **NO FLOATING PARTICLES**: Hapus semua animasi particles yang bergerak ke atas
3. **TOMBOL KEMBALI**: Harus matching dengan menu lain (ghost variant, border-2, border-white/30)
4. **RESPONSIVE MOBILE**: Header harus rapi seperti admin dashboard
5. **ICON CARDS**: Warna icon harus match dengan warna container
6. **NO DUMMY DATA**: Semua data harus real dari b9 hours
- **Priority**: CRITICAL - Menu Krusial
- **Complexity**: MEDIUM-HIGH

---

## 🎨 COLOR REFERENCE EXACT

### Header Gradient
```css
background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%);
```

### Container Colors
```css
/* Light mode */
background: rgba(255, 255, 255, 0.4);
border: rgba(255, 255, 255, 0.2);
backdrop-filter: blur(24px);

/* Dark mode */
background: rgba(23, 23, 23, 0.4);
border: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(24px);
```

### Icon Drop Shadow
```css matching admin dashboard
✅ No container di icon header
✅ No floating particles
✅ Tombol kembali matching menu lain
✅ Responsive perfect di mobile
✅ Icon cards disesuaikan warna
✅ Glassmorphism effect optimal
```

### Performance
```
✅ Page load < 2 seconds
✅ Animations 60fps
✅ No layout shift
✅ Smooth scrolling
```

### Functionality
```
✅ Real-time diskusi works
✅ File upload works
✅ Countdown timer accurate
✅ No dummy data
✅ All data from backend
```

---

## ⏱️ ESTIMATED TIME

- **Total Implementation**:  Validation (1 hour)
```
☐ Remove all dummy data
☐ Verify all data from backend
☐ Test with real data
☐ Test empty states
☐ Test error states
```

### Phase 6: Testing & QA (2 hours)
```
☐ Test all animations (stiffness: 300, damping: 20)
☐ Test glassmorphism effect
☐ Test gradient header
☐ Test countdown timer
☐ Test diskusi real-time
☐ Test submission form
☐ Test file upload
☐ Test all responsive breakpoints
☐ Test dark mode
☐ Test accessibility
```

---

## 🎯 SUCCESS METRICS

### UI/UX
```
✅ Header 100%de
```

### Phase 3: Icon Cards Adjustment (1 hour)
```
☐ Sesuaikan warna icon dengan warna container
☐ Update icon size responsive
☐ Add proper drop-shadow
☐ Test hover animations
☐ Test all icon colors match
```

### Phase 4: Mobile Responsiveness (2 hours)
```
☐ Test header di mobile (< 640px)
☐ Test layout grid di mobile
☐ Test diskusi section di mobile
☐ Test countdown timer di mobile
☐ Test quick actions di mobile
☐ Test breadcrumb truncate
☐ Test all text sizes
☐ Test all paddings
```

### Phase 5: Datag particles animation
☐ Update icon menjadi direct image (no container)
☐ Fix breadcrumb layout
☐ Update tombol kembali matching menu lain
☐ Test responsive mobile
☐ Test responsive tablet
☐ Test responsive desktop
```

### Phase 2: Container Colors (1 hour)
```
☐ Update semua container: bg-white/40 dark:bg-neutral-900/40
☐ Update semua border: border-white/20 dark:border-white/5
☐ Add backdrop-blur-xl ke semua container
☐ Update rounded-3xl untuk main containers
☐ Update shadow-xl untuk shadows
☐ Test dark mo text-base
- Grid: grid-cols-1 lg:grid-cols-2
```

### Desktop (> 1024px)
```typescript
// Header
- Icon: h-20 w-20
- Title: text-3xl
- Padding: p-8
- Flex direction: flex-row
- Breadcrumb: max-w-[300px]
- Quick actions: justify-start

// Containers
- Padding: p-8
- Text: text-base
- Grid: grid-cols-2

// Diskusi
- Show search
- Message bubbles: max-w-[70%]
- Avatar: h-10 w-10
```

---

## ✅ CHECKLIST IMPLEMENTASI

### Phase 1: Header Cleanup (2 hours)
```
☐ Hapus container di icon header
☐ Hapus semua floatin
// Header
- Icon: h-16 w-16
- Title: text-xl
- Padding: p-6
- Flex direction: flex-col (center aligned)
- Breadcrumb: max-w-[200px] truncate
- Quick actions: justify-center

// Containers
- Padding: p-4 sm:p-6
- Text: text-sm sm:text-base
- Grid: grid-cols-1

// Diskusi
- Hide search on mobile
- Message bubbles: max-w-[85%]
- Avatar: h-8 w-8
```

### Tablet (640px - 1024px)
```typescript
// Header
- Icon: h-18 w-18
- Title: text-2xl
- Padding: p-7
- Flex direction: flex-row

// Containers
- Padding: p-6
- Text:                     className="text-lg hover:bg-white/20 dark:hover:bg-neutral-800/20 rounded-lg p-1 transition-colors"
                                >
                                    {emoji}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </StudentLayout>
    );
}
```

---

## 📱 RESPONSIVE DESIGN - MOBILE FIRST

### Mobile (< 640px)
```typescriptQuick Reactions */}
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">Quick reactions:</span>
                            {['👍', '❤️', '🎉', '🔥', '👏'].map((emoji) => (
                                <motion.button
                                    key={emoji}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                />

                            <Button
                                onClick={sendMessage}
                                disabled={!message.trim()}
                                className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                            >
                                <Send className="h-5 w-5" />
                            </Button>
                        </div>

                        {/*  && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                placeholder="Ketik pesan... (Enter untuk kirim, Shift+Enter untuk baris baru)"
                                className="flex-1 min-h-[60px] max-h-[120px] rounded-2xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl border-white/20 dark:border-white/5 resize-none"
           sName="h-4 w-4" />
                                </button>
                            </motion.div>
                        )}

                        <div className="flex items-end gap-2">
                            <Textarea
                                ref={inputRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter'"text-xs text-indigo-600 dark:text-indigo-400 line-clamp-1">
                                        {replyTo.pesan}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setReplyTo(null)}
                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                                >
                                    <X clas                    <div className="flex items-center gap-2 mb-1">
                                        <CornerDownRight className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                            Membalas {replyTo.sender_name}
                                        </span>
                                    </div>
                                    <p className= Reply Preview */}
                        {replyTo && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 flex items-start justify-between gap-2"
                            >
                                <div className="flex-1">
                                   </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-white/20 dark:border-white/5 bg-white/20 dark:bg-neutral-900/20">
                        {/*                        whileTap={{ scale: 0.95 }}
                                                onClick={() => handleReply(msg)}
                                                className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                                            >
                                                <Reply className="h-3 w-3" />
                                                Balas
                               }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{msg.pesan}</p>
                                        </motion.div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                msg.sender_type === 'dosen'
                                                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                                                    : msg.is_mine
                                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                                                        : 'bg-white/60 dark:bg-neutral-800/60 text-neutral-900 dark:text-white backdrop-blur-xl'
                                      l-500 dark:text-neutral-500 line-clamp-1">
                                                    {msg.reply_to.pesan}
                                                </p>
                                            </div>
                                        )}

                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className={`rounded-2xl p-4 shadow-lg ${
                                                             {msg.reply_to && (
                                            <div className="mb-2 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-l-4 border-indigo-500">
                                                <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                                                    {msg.reply_to.sender_name}
                                                </p>
                                                <p className="text-xs text-neutraName="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                                {msg.sender_name}
                                            </span>
                                            <span className="text-xs text-neutral-400">{msg.time_ago}</span>
                                            {msg.is_pinned && <Pin className="h-3 w-3 text-amber-500" />}
                                        </div>

                                        {/* Reply To */}
                                        >
                                            {msg.sender_name.charAt(0).toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`flex-1 max-w-[70%] ${msg.is_mine ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span classay: index * 0.05 }}
                                    className={`flex gap-3 ${msg.is_mine ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        <div
                                            className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${getSenderStyle(msg.sender_type)}`}
                       <div className="h-[500px] overflow-y-auto p-4 space-y-4">
                        <AnimatePresence>
                            {filteredDiskusi.map((msg, index) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ del"text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                                            {msg.sender_name}
                                        </p>
                                        <p className="text-sm text-neutral-800 dark:text-neutral-200">{msg.pesan}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Messages Area */}
                