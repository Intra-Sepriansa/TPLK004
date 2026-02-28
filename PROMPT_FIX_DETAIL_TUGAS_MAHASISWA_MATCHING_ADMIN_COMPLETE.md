# 🎯 PROMPT: FIX DETAIL TUGAS MAHASISWA - MATCHING ADMIN DASHBOARD (COMPLETE)

## 📋 OVERVIEW

Prompt ini untuk **merapikan dan memperbaiki** halaman **Detail Informasi Tugas Mahasiswa** dengan sangat serius dan teliti. Fokus utama adalah:

1. **100% Matching Admin Dashboard** - Warna, UI/UX, container, animasi, header
2. **Hilangkan Container di Icon Header** - Icon langsung tanpa background container
3. **Hilangkan Animasi Floating Particles** - Icon tidak bergerak-gerak ke atas
4. **Responsive Mobile** - UI/UX mobile matching admin dashboard
5. **Tombol Kembali** - Matching dengan menu lain (simple button)
6. **No Dummy Data** - Semua data real dari backend
7. **Icon Colors** - Sesuaikan warna icon dengan warna container

---

## 🎨 DESIGN SYSTEM - HITAM THEME (100% ADMIN MATCHING)

### Color Palette (WAJIB)
```typescript
// CONTAINER COLORS
bg-white/40 dark:bg-neutral-900/40  // Main containers
backdrop-blur-xl                     // Glassmorphism effect

// BORDER COLORS
border-white/20 dark:border-white/5  // Container borders

// GRADIENT HEADER (ADMIN STYLE)
from-indigo-600 via-purple-600 to-pink-500

// TEXT COLORS
text-neutral-900 dark:text-white     // Primary text
text-neutral-500 dark:text-neutral-400  // Secondary text

// ROUNDED & SHADOWS
rounded-3xl  // Main containers
shadow-xl    // Main shadows
```

### Animation Standards (WAJIB)
```typescript
stiffness: 300
damping: 20

// Hover animations
scale: 1.04
y: -4
transition: { type: 'spring', stiffness: 400, damping: 15 }
```

---

## 🔧 PERBAIKAN KRUSIAL

### 1️⃣ HEADER SECTION

**BEFORE (Current - SALAH):**
```typescript
// ❌ Container di icon header
<motion.div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-4 ring-white/30">
  <img src={tugasHeaderIcon} />
</motion.div>

// ❌ Floating particles yang bergerak ke atas
{[...Array(15)].map((_, i) => (
  <motion.div animate={{ y: [0, -80] }}>
    <Sparkles />
  </motion.div>
))}
```

**AFTER (Fixed - BENAR):**
```typescript
// ✅ Icon langsung tanpa container
<motion.div
  initial={{ opacity: 0, scale: 0.5 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
  whileHover={{ scale: 1.05 }}
  className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center"
>
  <img 
    src={tugasHeaderIcon} 
    alt="Tugas" 
    className="h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]" 
  />
</motion.div>

// ✅ NO floating particles animation
// Particles dihilangkan sama sekali
```

### 2️⃣ TOMBOL KEMBALI

**BEFORE (Current - SALAH):**
```typescript
// ❌ Tombol terlalu fancy
<Button variant="ghost" className="mb-6 text-white hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 font-bold rounded-xl">
  <ArrowLeft className="mr-2 h-5 w-5" /> Kembali ke Daftar Tugas
</Button>
```

**AFTER (Fixed - BENAR):**
```typescript
// ✅ Simple button matching menu lain
<motion.button
  whileHover={{ scale: 1.02, x: -2 }}
  whileTap={{ scale: 0.98 }}
  onClick={() => router.visit('/user/tugas')}
  className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium mb-4"
>
  <ArrowLeft className="h-4 w-4" />
  Kembali
</motion.button>
```

### 3️⃣ RESPONSIVE MOBILE

**Mobile Header Layout (Matching Admin):**
```typescript
<div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left w-full sm:w-auto">
  {/* Icon - Center on mobile, left on desktop */}
  <motion.div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center mx-auto sm:mx-0">
    <img src={tugasHeaderIcon} alt="Tugas" className="h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]" />
  </motion.div>
  
  {/* Text - Center on mobile, left on desktop */}
  <div className="flex-1 mt-1 sm:mt-0">
    <motion.p className="text-sm text-white/90 font-medium">
      Detail Tugas
    </motion.p>
    <motion.h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
      {tugas.judul}
    </motion.h1>
  </div>
</div>
```

### 4️⃣ ICON COLORS MATCHING CONTAINER

**Principle:** Warna icon harus match dengan warna container/gradient

```typescript
// Container dengan gradient blue -> Icon blue
<div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
  <FileText className="h-6 w-6 text-white" />
</div>

// Container dengan gradient emerald -> Icon emerald
<div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
  <CheckCircle className="h-6 w-6 text-white" />
</div>

// Container dengan gradient amber -> Icon amber
<div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
  <Clock className="h-6 w-6 text-white" />
</div>
```

---

## 📦 FULL IMPLEMENTATION - COMPLETE CODE

```typescript
// File: resources/js/pages/user/tugas-detail.tsx

import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    ArrowLeft, BookOpen, Calendar, CheckCircle, Clock, Download,
    FileText, MessageSquare, Pin, Reply, Send, Upload, X,
    Award, Flag, ChevronRight, Paperclip, Smile, MoreVertical
} from 'lucide-react';

// Import icon
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
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

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
        tinggi: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg',
        sedang: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg',
        rendah: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg',
    }[p] || 'bg-gray-100 text-gray-700');

    const getSenderStyle = (type: string) => ({
        admin: 'bg-gradient-to-br from-red-500 to-pink-600 text-white',
        dosen: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white',
        mahasiswa: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    }[type] || 'bg-gray-100 text-gray-700');

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
                {/* HEADER - ADMIN MATCHING (FIXED)                    */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
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

                    {/* NO FLOATING PARTICLES - Dihilangkan */}

                    <div className="relative z-10">
                        {/* Tombol Kembali - Simple */}
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/user/tugas')}
                            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium mb-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </motion.button>

                        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                            {/* Left: Title & Info */}
                            <div className="flex-1 w-full">
                                <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left w-full sm:w-auto mb-6">
                                    {/* Icon - NO CONTAINER */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
                                        whileHover={{ scale: 1.05 }}
                                        className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center mx-auto sm:mx-0"
                                    >
                                        <img 
                                            src={tugasHeaderIcon} 
                                            alt="Tugas" 
                                            className="h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]" 
                                        />
                                    </motion.div>

                                    {/* Text */}
                                    <div className="flex-1 mt-1 sm:mt-0">
                                        <motion.p
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="text-sm text-white/90 font-medium"
                                        >
                                            Detail Tugas
                                        </motion.p>
                                        <motion.h1
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 }}
                                            className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                        >
                                            {tugas.judul}
                                        </motion.h1>
                                    </div>
                                </div>

                                {/* Badges */}
                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <Badge className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white px-4 py-2 text-sm font-bold shadow-lg">
                                            {tugas.jenis}
                                        </Badge>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        <Badge className={`${getPriorityStyle(tugas.prioritas)} px-4 py-2 text-sm font-bold`}>
                                            <Flag className="h-4 w-4 mr-2" />
                                            Prioritas {tugas.prioritas.charAt(0).toUpperCase() + tugas.prioritas.slice(1)}
                                        </Badge>
                                    </motion.div>
                                </div>

                                {/* Meta Info */}
                                <div className="flex items-center gap-4 flex-wrap">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 }}
                                        whileHover={{ scale: 1.05 }}
                                        className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30"
                                    >
                                        <BookOpen className="h-5 w-5 text-white" />
                                        <span className="font-bold text-white text-sm">{tugas.course.nama}</span>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.9 }}
                                        whileHover={{ scale: 1.05 }}
                                        className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30"
                                    >
                                        <Calendar className="h-5 w-5 text-white" />
                                        <span className="font-bold text-white text-sm">{tugas.deadline_display}</span>
                                    </motion.div>

                                    {tugas.course.dosen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1.0 }}
                                            whileHover={{ scale: 1.05 }}
                                            className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30"
                                        >
                                            <Award className="h-5 w-5 text-white" />
                                            <span className="font-bold text-white text-sm">{tugas.course.dosen}</span>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Countdown Timer */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 1.1 }}
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
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* DESCRIPTION SECTION                                 */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-8 shadow-xl backdrop-blur-xl dark:border-white/5"
                >
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-neutral-900 dark:text-white">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg"
                        >
                            <FileText className="h-6 w-6 text-white" />
                        </motion.div>
                        Deskripsi Tugas
                    </h3>
                    <div className="p-6 bg-white/60 dark:bg-neutral-800/60 rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/5">
                        <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed text-base">
                            {tugas.deskripsi}
                        </p>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* INSTRUCTIONS (if exists)                            */}
                {/* ═══════════════════════════════════════════════════ */}
                {tugas.instruksi && (
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-8 shadow-xl backdrop-blur-xl dark:border-white/5"
                    >
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-3 text-neutral-900 dark:text-white">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: -5 }}
                                className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg"
                            >
                                <CheckCircle className="h-6 w-6 text-white" />
                            </motion.div>
                            Instruksi Pengerjaan
                        </h3>
                        <div className="p-6 bg-white/60 dark:bg-neutral-800/60 rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/5">
                            <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed text-base">
                                {tugas.instruksi}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* ═══════════════════════════════════════════════════ */}
                {/* SUBMISSION STATUS & INFO                            */}
                {/* ═══════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Info Card */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                    >
                        <h3 className="font-bold text-xl mb-5 flex items-center gap-3 text-neutral-900 dark:text-white">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg"
                            >
                                <Award className="h-6 w-6 text-white" />
                            </motion.div>
                            Informasi
                        </h3>
                        <div className="space-y-4">
                            <motion.div
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="p-4 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/5"
                            >
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-semibold mb-1">
                                    Dosen Pengampu
                                </p>
                                <p className="font-extrabold text-lg text-neutral-900 dark:text-white">
                                    {tugas.course.dosen || '-'}
                                </p>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="p-4 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/5"
                            >
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-semibold mb-1">
                                    Deadline
                                </p>
                                <p className="font-extrabold text-lg text-neutral-900 dark:text-white">
                                    {tugas.deadline_display}
                                </p>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="p-4 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/5"
                            >
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 font-semibold mb-1">
                                    Nilai Maksimal
                                </p>
                                <p className="font-extrabold text-lg text-neutral-900 dark:text-white">
                                    {tugas.max_grade}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Submission Status Card */}
                    <motion.div
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                    >
                        <h3 className="font-bold text-xl mb-5 flex items-center gap-3 text-neutral-900 dark:text-white">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: -10 }}
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
                                    ) : (
                                        <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                                            📤 Dikumpulkan
                                        </Badge>
                                    )}
                                </div>

                                {submission.grade !== null && (
                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-600 shadow-2xl">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-white/90">Nilai Akhir:</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-4xl font-extrabold text-white">
                                                    {submission.grade}
                                                </span>
                                                {submission.grade_letter && (
                                                    <span className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-xl font-extrabold shadow-lg">
                                                        {submission.grade_letter}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!showSubmitForm && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowSubmitForm(true)}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
                                    >
                                        Update Submission
                                    </motion.button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                    Belum ada submission
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowSubmitForm(true)}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
                                >
                                    Submit Sekarang
                                    </motion.button>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* SUBMISSION FORM (Conditional)                       */}
                {/* ═══════════════════════════════════════════════════ */}
                <AnimatePresence>
                    {showSubmitForm && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/20 dark:border-white/5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                                                Submit Tugas
                                            </h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                Upload jawaban tugas Anda
                                            </p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowSubmitForm(false)}
                                        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    >
                                        <X className="h-5 w-5" />
                                    </motion.button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2 block">
                                        Jawaban Tugas
                                    </label>
                                    <Textarea
                                        value={submitForm.data.content}
                                        onChange={(e) => submitForm.setData('content', e.target.value)}
                                        placeholder="Tulis jawaban Anda di sini..."
                                        className="min-h-[200px] rounded-2xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl border-white/20 dark:border-white/5 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2 block">
                                        Upload File (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                submitForm.setData('file', e.target.files[0]);
                                            }
                                        }}
                                        className="w-full rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl border border-white/20 dark:border-white/5 p-3"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSubmit}
                                        disabled={!submitForm.data.content.trim()}
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Send className="h-5 w-5" />
                                            Submit Tugas
                                        </div>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowSubmitForm(false)}
                                        className="px-6 py-3 rounded-xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl text-neutral-900 dark:text-white font-bold hover:bg-white/80 dark:hover:bg-neutral-700/60 transition-all"
                                    >
                                        Cancel
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════════════════════════════════════════════════ */}
                {/* DISKUSI SECTION                                     */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/20 dark:border-white/5 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                                    Diskusi & Tanya Jawab
                                </h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {diskusi.length} pesan
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                        <AnimatePresence>
                            {diskusi.map((msg, index) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex gap-3 ${msg.is_mine ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${getSenderStyle(msg.sender_type)}`}>
                                            {msg.sender_name.charAt(0).toUpperCase()}
                                        </div>
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`flex-1 max-w-[70%] ${msg.is_mine ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                                {msg.sender_name}
                                            </span>
                                            <span className="text-xs text-neutral-400">
                                                {msg.time_ago}
                                            </span>
                                            {msg.is_pinned && (
                                                <Pin className="h-3 w-3 text-amber-500" />
                                            )}
                                        </div>

                                        {/* Reply To */}
                                        {msg.reply_to && (
                                            <div className="mb-2 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-l-4 border-indigo-500">
                                                <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                                                    {msg.reply_to.sender_name}
                                                </p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-500 line-clamp-1">
                                                    {msg.reply_to.pesan}
                                                </p>
                                            </div>
                                        )}

                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className={`rounded-2xl p-4 shadow-lg ${
                                                msg.is_mine
                                                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                                    : 'bg-white/60 dark:bg-neutral-800/60 text-neutral-900 dark:text-white backdrop-blur-xl'
                                            }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{msg.pesan}</p>
                                        </motion.div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleReply(msg)}
                                                className="text-xs text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                                            >
                                                <Reply className="h-3 w-3" />
                                                Reply
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
                        {/* Reply Preview */}
                        {replyTo && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-3 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 flex items-start justify-between"
                            >
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                        Membalas {replyTo.sender_name}
                                    </p>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1">
                                        {replyTo.pesan}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setReplyTo(null)}
                                    className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </motion.div>
                        )}

                        <div className="flex items-end gap-2">
                            <Textarea
                                ref={inputRef}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                placeholder="Ketik pesan... (Enter untuk kirim, Shift+Enter untuk baris baru)"
                                className="flex-1 min-h-[60px] max-h-[120px] rounded-2xl bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl border-white/20 dark:border-white/5 resize-none"
                            />

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={sendMessage}
                                disabled={!message.trim()}
                                className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Send className="h-5 w-5" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </StudentLayout>
    );
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Header Fixes (2 hours) - CRITICAL
- [ ] Ganti gradient header ke `from-indigo-600 via-purple-600 to-pink-500`
- [ ] Hilangkan container di icon header (NO bg-white/20, NO ring-4)
- [ ] Hilangkan semua floating particles animation
- [ ] Ubah tombol kembali jadi simple (text-white/90 hover:text-white)
- [ ] Test responsive mobile (icon center, text center)
- [ ] Verify icon drop-shadow: `drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]`

### Phase 2: Container Colors (1 hour)
- [ ] Replace semua `bg-white/80` jadi `bg-white/40`
- [ ] Replace semua `bg-white/60` jadi `bg-white/60` (sudah benar)
- [ ] Replace semua `border-slate-200` jadi `border-white/20`
- [ ] Replace semua `border-gray-800` jadi `border-white/5`
- [ ] Verify backdrop-blur-xl di semua container

### Phase 3: Animations (1 hour)
- [ ] Replace semua `stiffness: 100` jadi `stiffness: 300`
- [ ] Replace semua `damping: 15` jadi `damping: 20`
- [ ] Verify hover animations: scale: 1.04, y: -4
- [ ] Test smooth transitions

### Phase 4: Icon Colors (1 hour)
- [ ] Deskripsi section: amber icon + amber gradient container
- [ ] Instruksi section: emerald icon + emerald gradient container
- [ ] Info section: blue icon + blue gradient container
- [ ] Status section: emerald icon + emerald gradient container
- [ ] Diskusi section: purple icon + purple gradient container

### Phase 5: Mobile Responsive (2 hours)
- [ ] Header: flex-col sm:flex-row
- [ ] Icon: mx-auto sm:mx-0
- [ ] Text: text-center sm:text-left
- [ ] Badges: flex-wrap
- [ ] Meta info: flex-wrap
- [ ] Countdown timer: min-w-[180px]
- [ ] Test on 320px, 375px, 768px, 1024px

### Phase 6: Remove Dummy Data (1 hour)
- [ ] Verify all data from backend Props
- [ ] No hardcoded values
- [ ] Handle null/undefined gracefully
- [ ] Test with real data

### Phase 7: Diskusi Section (2 hours)
- [ ] Message bubbles dengan proper colors
- [ ] Reply functionality
- [ ] Pin messages display
- [ ] Sender type badges (admin, dosen, mahasiswa)
- [ ] Smooth scroll to bottom
- [ ] Input area dengan Textarea

### Phase 8: Testing & QA (2 hours)
- [ ] Test all animations smooth (60fps)
- [ ] Test responsive on all devices
- [ ] Test dark mode
- [ ] Test submission form
- [ ] Test diskusi send message
- [ ] Test reply functionality
- [ ] Verify no console errors
- [ ] Check accessibility

---

## 🎯 SUCCESS METRICS

### Visual
- [ ] Header gradient 100% matching admin (`from-indigo-600 via-purple-600 to-pink-500`)
- [ ] Icon header NO container, NO ring
- [ ] NO floating particles animation
- [ ] All containers `bg-white/40 dark:bg-neutral-900/40`
- [ ] All borders `border-white/20 dark:border-white/5`
- [ ] Icon colors match container colors

### Responsive
- [ ] Mobile: Icon center, text center
- [ ] Desktop: Icon left, text left
- [ ] All elements responsive
- [ ] No horizontal scroll
- [ ] Touch-friendly buttons

### Functionality
- [ ] Tombol kembali works
- [ ] Submission form works
- [ ] Diskusi send message works
- [ ] Reply functionality works
- [ ] File upload works
- [ ] All data from backend (no dummy)

### Performance
- [ ] Page load < 2 seconds
- [ ] Animations 60fps
- [ ] No layout shift
- [ ] Smooth scrolling

---

## ⏱️ ESTIMATED TIME

- **Total Implementation**: 12 hours
- **Priority**: CRITICAL (Sangat Penting)
- **Complexity**: MEDIUM

---

## 📝 CRITICAL NOTES

1. **ICON HEADER**: Paling penting! Hilangkan container dan floating particles
2. **GRADIENT**: Harus `from-indigo-600 via-purple-600 to-pink-500`
3. **TOMBOL KEMBALI**: Simple text button, bukan fancy button
4. **RESPONSIVE**: Test di mobile, harus center
5. **NO DUMMY DATA**: Semua dari backend
6. **ICON COLORS**: Harus match dengan container

---

## 🔗 RELATED FILES

- `resources/js/pages/user/tugas-detail.tsx` - File yang perlu diperbaiki
- `resources/js/pages/admin/rekap-kehadiran.tsx` - Reference admin styling
- `resources/js/pages/user/dashboard.tsx` - Reference responsive mobile
- `resources/js/pages/user/tugas.tsx` - Reference list page

---

**END OF PROMPT - IMPLEMENT WITH EXTREME CARE AND ATTENTION TO DETAIL**
