# PROMPT: SISTEM VERIFIKASI SELFIE KEHADIRAN DOSEN - ULTRA ADVANCED

## 🎯 TUJUAN
Membangun sistem verifikasi selfie kehadiran yang SANGAT SANGAT CANGGIH untuk dosen dengan:
- **Main Page:** `resources/js/pages/dosen/verification.tsx` (route: `/dosen/verification`)
- **Detail Page:** `resources/js/pages/dosen/verification-detail.tsx` (route: `/dosen/verification/{id}`)
- **Controller:** `app/Http/Controllers/Dosen/VerificationController.php`
- **AI Service:** `app/Services/SelfieVerificationAIService.php`

Sistem ini menggunakan AI face recognition, location verification, device fingerprinting, dan fraud detection.

---

## 🎨 UI/UX SPECIFICATION - WAJIB 100% SAMA DENGAN UANG KAS ADMIN

### ⚠️ CRITICAL: EXACT COLORS & STYLES FROM KAS ADMIN

**SEMUA warna, gradient, animasi, dan style HARUS PERSIS mengikuti `resources/js/pages/admin/kas.tsx`**

### Warna & Gradient (EXACT COPY)
```tsx
// ═══════ HEADER BACKGROUND ═══════
bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500

// ═══════ ANIMATED BACKGROUND ═══════
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

// ═══════ OVERLAY & ORBS ═══════
<div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
<div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
<div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

// ═══════ 3 PULSE RINGS ═══════
<motion.div
    className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
    animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
/>
<motion.div
    className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
    animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
/>
<motion.div
    className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
    animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 2 }}
/>

// ═══════ ICON CONTAINER ═══════
rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30

// ═══════ ACTION BUTTONS ═══════
rounded-xl bg-white/20 px-5 py-2.5 backdrop-blur-md border border-white/20 shadow-lg
hover:bg-white/30

// ═══════ CONTAINER CARDS ═══════
rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl shadow-xl

// ═══════ SUMMARY CARDS ═══════
rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl
transition-all hover:shadow-[color]-500/10 dark:border-white/5

// ═══════ GLOW ORB (per card) ═══════
<motion.div
    animate={{
        scale: hoveredCard === 'cardName' ? 1.5 : 1,
        opacity: hoveredCard === 'cardName' ? 0.4 : 0.2,
    }}
    className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[color]-500 blur-3xl transition-all duration-500"
/>

// ═══════ GRADIENT ICON CONTAINER ═══════
rounded-2xl bg-gradient-to-br from-[color]-400 to-[color]-600 text-white shadow-lg shadow-[color]-500/30
```

### Animation Variants (EXACT COPY)
```tsx
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
        },
    },
} as const;

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 20,
        },
    },
    hover: {
        scale: 1.03,
        y: -8,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10,
        },
    },
} as const;
```

---

## 📄 MAIN PAGE: resources/js/pages/dosen/verification.tsx

### Imports
```tsx
import { Head, router, useForm } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, CheckCircle, XCircle, Clock, AlertTriangle, Sparkles,
    User, MapPin, Smartphone, Timer, Eye, Zap, Bot, Download,
    Filter, Search, Grid3x3, List, Calendar, BarChart3, Shield,
    TrendingUp, Users, Target, Award, Send, RefreshCw, Settings,
    ChevronRight, Plus, MoreHorizontal, Check, X, Info
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
```

### Types
```tsx
interface Mahasiswa {
    id: number;
    nama: string;
    nim: string;
    avatar_url: string;
    email: string;
    phone: string;
}

interface Verification {
    id: number;
    mahasiswa: Mahasiswa;
    selfie_url: string;
    status: 'pending' | 'approved' | 'rejected';
    submitted_at: string;
    date_display: string;
    time_display: string;
    distance: number;
    device_type: string;
    ai_confidence: number | null;
    is_suspicious: boolean;
    face_match_score: number | null;
    created_at: string;
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
    filters: {
        search: string;
        status: string;
        date: string;
    };
}
```

### Header Section (EXACT STYLE)
```tsx
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

    {/* Floating Animations (Pulses) */}
    <motion.div
        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
    />
    <motion.div
        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
    />
    <motion.div
        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 2 }}
    />

    <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-5">
                <motion.div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <Camera className="h-8 w-8 text-white" />
                </motion.div>
                <div>
                    <p className="text-sm text-indigo-100 font-medium tracking-wide">Verifikasi Kehadiran</p>
                    <h1 className="text-3xl font-bold text-white">Selfie Mahasiswa</h1>
                    <p className="mt-1 text-indigo-100 max-w-lg">
                        AI-Powered Face Recognition & Fraud Detection System
                    </p>
                </div>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex items-center gap-3">
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg border border-white/10"
                >
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                        <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-indigo-100">Pending</p>
                        <p className="text-2xl font-bold text-white">{stats.pending}</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, type: 'spring' }}
                    className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg border border-white/10"
                >
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-indigo-100">Hari Ini</p>
                        <p className="text-2xl font-bold text-white">{stats.today}</p>
                    </div>
                </motion.div>
            </div>
        </div>

        {/* Action Buttons */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/10"
        >
            <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/30 border border-white/20 shadow-lg"
            >
                <Zap className="h-4 w-4" />
                Quick Verify Mode
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/30 border border-white/20 shadow-lg"
            >
                <Bot className="h-4 w-4" />
                Auto Verify All
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/30 border border-white/20 shadow-lg"
            >
                <Download className="h-4 w-4" />
                Export Report
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.reload()}
                className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/30 border border-white/20 shadow-lg"
            >
                <RefreshCw className="h-4 w-4" />
                Refresh
            </motion.button>
        </motion.div>
    </div>
</motion.div>
```


### 10 Summary Cards (EXACT STYLE dari Kas Admin)
```tsx
<motion.div
    variants={containerVariants}
    className="grid gap-6 md:grid-cols-5"
>
    {/* Card 1: Total Verifikasi */}
    <motion.div
        variants={cardVariants}
        whileHover="hover"
        onHoverStart={() => setHoveredCard('total')}
        onHoverEnd={() => setHoveredCard(null)}
        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-blue-500/10 dark:border-white/5"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10" />
        <motion.div
            animate={{
                scale: hoveredCard === 'total' ? 1.5 : 1,
                opacity: hoveredCard === 'total' ? 0.4 : 0.2,
            }}
            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500 blur-3xl transition-all duration-500"
        />
        <div className="relative flex items-center gap-4">
            <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
            >
                <Camera className="h-7 w-7" />
            </motion.div>
            <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Verifikasi</p>
                <div className="mt-1">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {stats.total}
                    </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">semua waktu</p>
            </div>
        </div>
    </motion.div>

    {/* Card 2: Pending Review */}
    <motion.div
        variants={cardVariants}
        whileHover="hover"
        onHoverStart={() => setHoveredCard('pending')}
        onHoverEnd={() => setHoveredCard(null)}
        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-amber-500/10 dark:border-white/5"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10" />
        <motion.div
            animate={{
                scale: hoveredCard === 'pending' ? 1.5 : 1,
                opacity: hoveredCard === 'pending' ? 0.4 : 0.2,
            }}
            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500 blur-3xl transition-all duration-500"
        />
        <div className="relative flex items-center gap-4">
            <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/30"
            >
                <Clock className="h-7 w-7" />
            </motion.div>
            <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Pending Review</p>
                <div className="mt-1">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {stats.pending}
                    </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">perlu verifikasi</p>
            </div>
        </div>
    </motion.div>

    {/* Card 3: Disetujui Hari Ini */}
    <motion.div
        variants={cardVariants}
        whileHover="hover"
        onHoverStart={() => setHoveredCard('approved')}
        onHoverEnd={() => setHoveredCard(null)}
        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-emerald-500/10 dark:border-white/5"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10" />
        <motion.div
            animate={{
                scale: hoveredCard === 'approved' ? 1.5 : 1,
                opacity: hoveredCard === 'approved' ? 0.4 : 0.2,
            }}
            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500 blur-3xl transition-all duration-500"
        />
        <div className="relative flex items-center gap-4">
            <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
            >
                <CheckCircle className="h-7 w-7" />
            </motion.div>
            <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Disetujui</p>
                <div className="mt-1">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {stats.approved_today}
                    </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">hari ini</p>
            </div>
        </div>
    </motion.div>

    {/* Card 4: Ditolak */}
    <motion.div
        variants={cardVariants}
        whileHover="hover"
        onHoverStart={() => setHoveredCard('rejected')}
        onHoverEnd={() => setHoveredCard(null)}
        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-red-500/10 dark:border-white/5"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10" />
        <motion.div
            animate={{
                scale: hoveredCard === 'rejected' ? 1.5 : 1,
                opacity: hoveredCard === 'rejected' ? 0.4 : 0.2,
            }}
            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500 blur-3xl transition-all duration-500"
        />
        <div className="relative flex items-center gap-4">
            <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-400 to-rose-600 text-white shadow-lg shadow-red-500/30"
            >
                <XCircle className="h-7 w-7" />
            </motion.div>
            <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Ditolak</p>
                <div className="mt-1">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {stats.rejected}
                    </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">tidak valid</p>
            </div>
        </div>
    </motion.div>

    {/* Card 5: AI Auto-Verified */}
    <motion.div
        variants={cardVariants}
        whileHover="hover"
        onHoverStart={() => setHoveredCard('ai')}
        onHoverEnd={() => setHoveredCard(null)}
        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-purple-500/10 dark:border-white/5"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10" />
        <motion.div
            animate={{
                scale: hoveredCard === 'ai' ? 1.5 : 1,
                opacity: hoveredCard === 'ai' ? 0.4 : 0.2,
            }}
            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500 blur-3xl transition-all duration-500"
        />
        <div className="relative flex items-center gap-4">
            <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-violet-600 text-white shadow-lg shadow-purple-500/30"
            >
                <Sparkles className="h-7 w-7" />
            </motion.div>
            <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">AI Verified</p>
                <div className="mt-1">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {stats.ai_verified}
                    </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">by AI system</p>
            </div>
        </div>
    </motion.div>

    {/* Card 6: Suspicious Activity */}
    <motion.div
        variants={cardVariants}
        whileHover="hover"
        onHoverStart={() => setHoveredCard('suspicious')}
        onHoverEnd={() => setHoveredCard(null)}
        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-orange-500/10 dark:border-white/5"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 dark:from-orange-500/10 dark:to-red-500/10" />
        <motion.div
            animate={{
                scale: hoveredCard === 'suspicious' ? 1.5 : 1,
                opacity: hoveredCard === 'suspicious' ? 0.4 : 0.2,
            }}
            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-500 blur-3xl transition-all duration-500"
        />
        <div className="relative flex items-center gap-4">
            <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 text-white shadow-lg shadow-orange-500/30"
            >
                <AlertTriangle className="h-7 w-7" />
            </motion.div>
            <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Suspicious</p>
                <div className="mt-1">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {stats.suspicious}
                    </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">perlu review</p>
            </div>
        </div>
    </motion.div>

    {/* Card 7: Face Match Rate */}
    <motion.div
        variants={cardVariants}
        whileHover="hover"
        onHoverStart={() => setHoveredCard('face')}
        onHoverEnd={() => setHoveredCard(null)}
        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-indigo-500/10 dark:border-white/5"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10" />
        <motion.div
            animate={{
                scale: hoveredCard === 'face' ? 1.5 : 1,
                opacity: hoveredCard === 'face' ? 0.4 : 0.2,
            }}
            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500 blur-3xl transition-all duration-500"
        />
        <div className="relative flex items-center gap-4">
            <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
            >
                <User className="h-7 w-7" />
            </motion.div>
            <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Face Match</p>
                <div className="mt-1">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {stats.face_match_rate}%
                    </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">rata-rata</p>
            </div>
        </div>
    </motion.div>

    {/* Card 8: Location Valid */}
    <motion.div
        variants={cardVariants}
        whileHover="hover"
        onHoverStart={() => setHoveredCard('location')}
        onHoverEnd={() => setHoveredCard(null)}
        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-green-500/10 dark:border-white/5"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10" />
        <motion.div
            animate={{
                scale: hoveredCard === 'location' ? 1.5 : 1,
                opacity: hoveredCard === 'location' ? 0.4 : 0.2,
            }}
            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-green-500 blur-3xl transition-all duration-500"
        />
        <div className="relative flex items-center gap-4">
            <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-lg shadow-green-500/30"
            >
                <MapPin className="h-7 w-7" />
            </motion.div>
            <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Location Valid</p>
                <div className="mt-1">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {stats.location_valid}
                    </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">dalam radius</p>
            </div>
        </div>
    </motion.div>

    {/* Card 9: Trusted Devices */}
    <motion.div
        variants={cardVariants}
        whileHover="hover"
        onHoverStart={() => setHoveredCard('device')}
        onHoverEnd={() => setHoveredCard(null)}
        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-cyan-500/10 dark:border-white/5"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 dark:from-cyan-500/10 dark:to-blue-500/10" />
        <motion.div
            animate={{
                scale: hoveredCard === 'device' ? 1.5 : 1,
                opacity: hoveredCard === 'device' ? 0.4 : 0.2,
            }}
            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500 blur-3xl transition-all duration-500"
        />
        <div className="relative flex items-center gap-4">
            <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
            >
                <Smartphone className="h-7 w-7" />
            </motion.div>
            <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Trusted Devices</p>
                <div className="mt-1">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {stats.device_trusted}
                    </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">perangkat</p>
            </div>
        </div>
    </motion.div>

    {/* Card 10: Avg Response Time */}
    <motion.div
        variants={cardVariants}
        whileHover="hover"
        onHoverStart={() => setHoveredCard('time')}
        onHoverEnd={() => setHoveredCard(null)}
        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-pink-500/10 dark:border-white/5"
    >
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 dark:from-pink-500/10 dark:to-rose-500/10" />
        <motion.div
            animate={{
                scale: hoveredCard === 'time' ? 1.5 : 1,
                opacity: hoveredCard === 'time' ? 0.4 : 0.2,
            }}
            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-pink-500 blur-3xl transition-all duration-500"
        />
        <div className="relative flex items-center gap-4">
            <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-600 text-white shadow-lg shadow-pink-500/30"
            >
                <Timer className="h-7 w-7" />
            </motion.div>
            <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Avg Time</p>
                <div className="mt-1">
                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {stats.avg_response_time}m
                    </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">response</p>
            </div>
        </div>
    </motion.div>
</motion.div>
```

