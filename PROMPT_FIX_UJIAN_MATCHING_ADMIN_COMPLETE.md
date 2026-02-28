# 🎯 PROMPT: FIX UJIAN MAHASISWA - MATCHING ADMIN DASHBOARD (COMPLETE)

## 📋 OVERVIEW

Prompt ini untuk **merapikan dan memperbaiki** halaman **Kalender Ujian Mahasiswa** dengan sangat serius dan teliti. Menu ini sangat krusial karena berkaitan dengan persiapan UTS dan UAS mahasiswa.

### Fokus Utama:
1. **100% Matching Admin Dashboard** - Warna, UI/UX, container, animasi, header
2. **Hilangkan Container di Icon Header** - Icon langsung tanpa background container
3. **Hilangkan Animasi Floating Particles** - Icon tidak bergerak-gerak ke atas (graduation cap)
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
<motion.div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-4 ring-white/30">
  <GraduationCap className="h-8 w-8" />
</motion.div>

// ❌ Floating graduation cap particles yang bergerak ke atas
{[...Array(20)].map((_, i) => (
  <motion.div animate={{ y: [0, -40, -80] }}>
    <GraduationCap className="h-4 w-4 text-white/40" />
  </motion.div>
))}

// ❌ Gradient background salah (red-rose-pink)
className="bg-gradient-to-br from-red-500 via-rose-500 to-pink-600"
```

**AFTER (Fixed - BENAR):**
```typescript
// ✅ Icon langsung tanpa container - MATCHING DASHBOARD
<motion.div
  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
  animate={{ opacity: 1, scale: 1, rotate: 0 }}
  transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
  whileHover={{ scale: 1.05, rotate: 5 }}
  className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
>
  <img 
    src={examIcon} 
    alt="Kalender Ujian" 
    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" 
  />
</motion.div>

// ✅ NO floating particles animation - Dihilangkan sama sekali

// ✅ Gradient background MATCHING DASHBOARD
className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
```

### 2️⃣ TOMBOL KEMBALI

**BEFORE (Current - SALAH):**
```typescript
// ❌ Tombol dengan hover effect terlalu fancy
<Link href="/user/akademik">
  <motion.div
    whileHover={{ scale: 1.1, x: -5 }}
    className="p-2 hover:bg-white/20 rounded-lg"
  >
    <ArrowLeft className="h-5 w-5" />
  </motion.div>
</Link>
```

**AFTER (Fixed - BENAR):**
```typescript
// ✅ Simple button matching menu lain
<motion.button
  whileHover={{ scale: 1.02, x: -2 }}
  whileTap={{ scale: 0.98 }}
  onClick={() => router.visit('/user/akademik')}
  className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium mb-4"
>
  <ArrowLeft className="h-4 w-4" />
  Kembali
</motion.button>
```

### 3️⃣ HEADER GRADIENT BACKGROUND

**WAJIB - Matching Dashboard:**
```typescript
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
  className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
>
  {/* Animated Gradient Background */}
  <motion.div
    className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
    animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
    style={{ backgroundSize: '200% 200%' }}
  />

  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
  <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
</motion.div>
```

### 4️⃣ STATS CARDS - GLASSMORPHISM

**WAJIB - Matching Dashboard:**
```typescript
<motion.div
  className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
  whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
>
  {/* Gradient background effect */}
  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10" />
  
  {/* Animated glow on hover */}
  <motion.div
    animate={{
      scale: hoveredCard === cardKey ? 1.5 : 1,
      opacity: hoveredCard === cardKey ? 0.4 : 0.2,
    }}
    className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500 blur-3xl"
  />
</motion.div>
```

---

## 📱 RESPONSIVE MOBILE - MATCHING DASHBOARD

### Header Mobile Layout
```typescript
<div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
  <motion.div className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24">
    <img src={examIcon} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
  </motion.div>
  <div className="flex-1 mt-1 sm:mt-0">
    <motion.p className="text-sm text-indigo-100 font-medium tracking-wide">
      Manajemen Ujian
    </motion.p>
    <motion.h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
      Kalender Ujian
    </motion.h1>
  </div>
</div>
```

### Stats Cards Mobile
```typescript
<motion.div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-5">
  {statCards.map((stat) => (
    <motion.div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6">
      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
        <motion.div className="flex shrink-0 h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg">
          <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </motion.div>
        <div>
          <p className="text-[10px] sm:text-sm font-medium text-neutral-500">{stat.title}</p>
          <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
            <AnimatedCounter value={stat.value} />
          </span>
        </div>
      </div>
    </motion.div>
  ))}
</motion.div>
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### ✅ Header Section
- [ ] Icon header tanpa container background
- [ ] Icon dengan drop-shadow yang kuat
- [ ] Gradient background animated (indigo-purple-pink) BUKAN red-rose-pink
- [ ] Blur orbs di background
- [ ] Tombol kembali simple (ArrowLeft + "Kembali")
- [ ] Responsive mobile (flex-col sm:flex-row)
- [ ] NO floating graduation cap particles

### ✅ Stats Cards
- [ ] Glassmorphism effect (bg-white/40 dark:bg-neutral-900/40)
- [ ] Border (border-white/20 dark:border-white/5)
- [ ] Backdrop blur (backdrop-blur-xl)
- [ ] Hover animation (scale: 1.04, y: -4)
- [ ] Animated glow on hover
- [ ] Icon dengan background gradient matching warna
- [ ] Grid responsive (grid-cols-2 sm:gap-6 lg:grid-cols-5)

### ✅ Exam Cards Container
- [ ] Glassmorphism container
- [ ] Rounded-3xl dengan shadow-xl
- [ ] Border matching (border-white/20 dark:border-white/5)
- [ ] Hover effect (scale: 1.01, y: -2)

### ✅ Mobile Responsive
- [ ] Header: flex-col sm:flex-row
- [ ] Icon: h-20 w-20 sm:h-24 sm:w-24
- [ ] Text: text-2xl sm:text-3xl
- [ ] Stats: grid-cols-2 lg:grid-cols-5
- [ ] Padding: p-3 sm:p-6
- [ ] Font size: text-[10px] sm:text-sm

---

## 💎 COMPLETE HEADER IMPLEMENTATION

```typescript
// File: resources/js/pages/user/akademik/ujian.tsx

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentLayout from '@/layouts/student-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { 
    GraduationCap, ArrowLeft, Calendar, Clock, AlertTriangle, 
    CheckCircle2, BookOpen, Target, CheckCheck
} from 'lucide-react';

// Import icon - GUNAKAN ICON YANG SESUAI
import examIcon from '@/assets/admin/dashboard/exam-icon.png'; // Sesuaikan path

type Exam = {
    id: number;
    course_id: number;
    course_name: string;
    type: 'UTS' | 'UAS';
    date: string;
    date_formatted: string;
    time?: string;
    location?: string;
    duration?: number;
    notes?: string;
    days_remaining: number;
    meeting_number: number;
    is_warning: boolean;
    is_critical: boolean;
};

type Props = {
    upcomingExams: Exam[];
    examsByMonth: Array<{
        month: string;
        exams: Exam[];
    }>;
    stats: {
        total: number;
        critical: number;
        warning: number;
        uts: number;
        uas: number;
        completed: number;
    };
};

export default function AcademicExams({ upcomingExams, examsByMonth, stats }: Props) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [completedExams, setCompletedExams] = useState<Record<number, boolean>>({});

    // Animation variants - MATCHING DASHBOARD
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 20 },
        },
    };

    return (
        <StudentLayout>
            <Head title="Kalender Ujian" />
            
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8"
            >
```

                {/* ═══════ HERO HEADER — 100% MATCHING DASHBOARD ═══════ */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    {/* Animated Gradient Background */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        style={{ backgroundSize: '200% 200%' }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        {/* Tombol Kembali - Simple Style */}
                        <motion.button
                            whileHover={{ scale: 1.02, x: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.visit('/user/akademik')}
                            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-medium mb-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </motion.button>

                        <div className="flex flex-wrap items-start justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
                                {/* Icon Header - NO CONTAINER */}
                                <motion.div
                                    className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img 
                                        src={examIcon} 
                                        alt="Kalender Ujian" 
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" 
                                    />
                                </motion.div>
                                
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm text-indigo-100 font-medium tracking-wide"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Manajemen Ujian
                                    </motion.p>
                                    <motion.h1
                                        className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Kalender Ujian
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 text-indigo-100 max-w-lg text-sm sm:text-base leading-relaxed"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Countdown UTS & UAS dengan persiapan lengkap
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ STATS CARDS — GLASSMORPHISM MATCHING DASHBOARD ═══════ */}
                <motion.div
                    className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-5"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.2 } },
                    }}
                >
                    {[
                        { 
                            title: 'Total Ujian', 
                            value: stats.total,
                            icon: Calendar,
                            colorConfig: { 
                                bg: 'bg-slate-500', 
                                gradientBg: 'from-slate-500/5 to-slate-500/5 dark:from-slate-500/10 dark:to-slate-500/10',
                                gradient: 'from-slate-400 to-slate-600'
                            }
                        },
                        { 
                            title: 'Selesai', 
                            value: stats.completed,
                            icon: CheckCheck,
                            colorConfig: { 
                                bg: 'bg-emerald-500', 
                                gradientBg: 'from-emerald-500/5 to-emerald-500/5 dark:from-emerald-500/10 dark:to-emerald-500/10',
                                gradient: 'from-emerald-400 to-teal-600'
                            }
                        },
                        { 
                            title: 'Segera', 
                            value: stats.critical,
                            icon: AlertTriangle,
                            colorConfig: { 
                                bg: 'bg-red-500', 
                                gradientBg: 'from-red-500/5 to-red-500/5 dark:from-red-500/10 dark:to-red-500/10',
                                gradient: 'from-red-400 to-rose-600'
                            }
                        },
                        { 
                            title: 'UTS', 
                            value: stats.uts,
                            icon: Target,
                            colorConfig: { 
                                bg: 'bg-amber-500', 
                                gradientBg: 'from-amber-500/5 to-amber-500/5 dark:from-amber-500/10 dark:to-amber-500/10',
                                gradient: 'from-amber-400 to-orange-600'
                            }
                        },
                        { 
                            title: 'UAS', 
                            value: stats.uas,
                            icon: GraduationCap,
                            colorConfig: { 
                                bg: 'bg-purple-500', 
                                gradientBg: 'from-purple-500/5 to-purple-500/5 dark:from-purple-500/10 dark:to-purple-500/10',
                                gradient: 'from-purple-400 to-pink-600'
                            }
                        },
                    ].map((stat, index) => {
                        const cardKey = `stat-${index}`;
                        const StatIcon = stat.icon;
                        
                        return (
                            <motion.div
                                key={stat.title}
                                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                                variants={{
                                    hidden: { opacity: 0, y: 30, scale: 0.9 },
                                    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
                                }}
                                whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                                onHoverStart={() => setHoveredCard(cardKey)}
                                onHoverEnd={() => setHoveredCard(null)}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.colorConfig.gradientBg}`} />
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: hoveredCard === cardKey ? 1.5 : 1,
                                        opacity: hoveredCard === cardKey ? 0.4 : 0.2,
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${stat.colorConfig.bg} blur-3xl`}
                                />
                                <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className={`flex shrink-0 h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.colorConfig.gradient} text-white shadow-lg`}
                                    >
                                        <StatIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </motion.div>
                                    <div>
                                        <p className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-neutral-400">
                                            {stat.title}
                                        </p>
                                        <div className="mt-0.5 sm:mt-1">
                                            <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                                                <AnimatedCounter value={stat.value} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══════ EXAM CARDS CONTAINER ═══════ */}
                {upcomingExams.length > 0 ? (
                    <>
                        {/* Critical/Warning Exams */}
                        {upcomingExams.filter(e => e.is_critical || e.is_warning).length > 0 && (
                            <motion.div 
                                variants={itemVariants}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                            Perlu Perhatian
                                        </h2>
                                        <p className="text-sm text-neutral-500">
                                            Ujian yang akan segera dilaksanakan
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {upcomingExams
                                        .filter(e => e.is_critical || e.is_warning)
                                        .map((exam) => (
                                            <ExamCard 
                                                key={exam.id}
                                                exam={exam}
                                                isCompleted={completedExams[exam.id] || false}
                                                onToggleComplete={() => {
                                                    setCompletedExams(prev => ({
                                                        ...prev,
                                                        [exam.id]: !prev[exam.id]
                                                    }));
                                                }}
                                            />
                                        ))
                                    }
                                </div>
                            </motion.div>
                        )}

                        {/* All Exams by Month */}
                        <motion.div variants={itemVariants} className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                        Jadwal Ujian
                                    </h2>
                                    <p className="text-sm text-neutral-500">
                                        Semua jadwal UTS dan UAS
                                    </p>
                                </div>
                            </div>

                            {examsByMonth.map((monthData) => (
                                <motion.div
                                    key={monthData.month}
                                    whileHover={{ scale: 1.01, y: -2 }}
                                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                                >
                                    {/* Month Header */}
                                    <div className="p-6 border-b border-white/10">
                                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                            {monthData.month}
                                        </h3>
                                    </div>

                                    {/* Exams List */}
                                    <div className="p-6 space-y-3">
                                        {monthData.exams.map((exam) => (
                                            <ExamCard 
                                                key={exam.id}
                                                exam={exam}
                                                isCompleted={completedExams[exam.id] || false}
                                                onToggleComplete={() => {
                                                    setCompletedExams(prev => ({
                                                        ...prev,
                                                        [exam.id]: !prev[exam.id]
                                                    }));
                                                }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </>
                ) : (
                    <EmptyState />
                )}
            </motion.div>
        </StudentLayout>
    );
}
```

---

## 🎨 EXAM CARD COMPONENT

```typescript
function ExamCard({ 
    exam, 
    isCompleted, 
    onToggleComplete 
}: { 
    exam: Exam; 
    isCompleted: boolean; 
    onToggleComplete: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`relative rounded-2xl border-2 p-5 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl hover:shadow-lg transition-all ${
                isCompleted
                    ? 'border-emerald-200 dark:border-emerald-800'
                    : exam.is_critical 
                        ? 'border-red-200 dark:border-red-800' 
                        : exam.is_warning 
                            ? 'border-amber-200 dark:border-amber-800'
                            : 'border-neutral-200 dark:border-neutral-700'
            }`}
        >
            {/* Completion Overlay */}
            {isCompleted && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-emerald-500/5 rounded-2xl"
                />
            )}

            <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                    {/* Icon */}
                    <motion.div 
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className={`flex shrink-0 h-12 w-12 items-center justify-center rounded-xl ${
                            isCompleted
                                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                : exam.type === 'UTS' 
                                    ? 'bg-blue-100 dark:bg-blue-900/30' 
                                    : 'bg-purple-100 dark:bg-purple-900/30'
                        }`}
                    >
                        {isCompleted ? (
                            <CheckCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <Target className={`h-6 w-6 ${
                                exam.type === 'UTS' 
                                    ? 'text-blue-600 dark:text-blue-400' 
                                    : 'text-purple-600 dark:text-purple-400'
                            }`} />
                        )}
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge 
                                variant={exam.type === 'UTS' ? 'secondary' : 'default'} 
                                className="text-xs"
                            >
                                {exam.type}
                            </Badge>
                            {isCompleted && (
                                <Badge className="text-xs bg-emerald-500 hover:bg-emerald-600">
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Selesai
                                </Badge>
                            )}
                            {exam.is_critical && !isCompleted && (
                                <Badge className="text-xs bg-red-500 hover:bg-red-600">
                                    <AlertTriangle className="h-3 w-3 mr-1" /> Segera
                                </Badge>
                            )}
                        </div>

                        <h4 className={`font-bold text-lg text-neutral-900 dark:text-white ${
                            isCompleted ? 'line-through opacity-60' : ''
                        }`}>
                            {exam.course_name}
                        </h4>

                        <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {exam.date_formatted}
                            </span>
                            {exam.time && (
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {exam.time}
                                </span>
                            )}
                        </div>

                        {exam.location && (
                            <p className="text-sm text-neutral-500 mt-2">
                                📍 {exam.location}
                            </p>
                        )}

                        {exam.notes && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 p-3 bg-neutral-50/50 dark:bg-neutral-800/50 rounded-xl">
                                {exam.notes}
                            </p>
                        )}
                    </div>
                </div>

                {/* Days Remaining */}
                <div className="text-right">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`inline-flex flex-col items-center justify-center rounded-xl p-3 ${
                            isCompleted
                                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                : exam.is_critical
                                    ? 'bg-red-100 dark:bg-red-900/30'
                                    : exam.is_warning
                                        ? 'bg-amber-100 dark:bg-amber-900/30'
                                        : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}
                    >
                        <span className={`text-2xl font-bold ${
                            isCompleted
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : exam.is_critical
                                    ? 'text-red-600 dark:text-red-400'
                                    : exam.is_warning
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-blue-600 dark:text-blue-400'
                        }`}>
                            {isCompleted ? '✓' : exam.days_remaining}
                        </span>
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">
                            {isCompleted ? 'Selesai' : 'hari lagi'}
                        </span>
                    </motion.div>

                    {/* Toggle Complete Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onToggleComplete}
                        className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                        {isCompleted ? 'Batalkan' : 'Tandai Selesai'}
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
```

---

## 🎨 EMPTY STATE COMPONENT

```typescript
function EmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 p-12 text-center"
        >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <GraduationCap className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
            </div>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Belum Ada Jadwal Ujian
            </p>
            <p className="text-sm text-neutral-500">
                Jadwal UTS dan UAS akan muncul di sini
            </p>
        </motion.div>
    );
}
```

---

## 📝 NOTES PENTING

### ❌ YANG HARUS DIHILANGKAN:
1. Container background di icon header
2. Floating graduation cap particles animation
3. Gradient red-rose-pink (SALAH)
4. Tombol kembali yang terlalu fancy
5. Data dummy

### ✅ YANG HARUS DITAMBAHKAN:
1. Glassmorphism effect di semua container
2. Animated gradient background (indigo-purple-pink)
3. Hover animations matching dashboard
4. Responsive mobile layout
5. Icon dengan drop-shadow yang kuat
6. AnimatedCounter untuk angka stats
7. Simple back button

### 🎯 PRIORITY:
1. **CRITICAL**: Header icon tanpa container + no floating particles
2. **CRITICAL**: Gradient background HARUS indigo-purple-pink (BUKAN red-rose-pink)
3. **HIGH**: Glassmorphism containers + gradient background
4. **HIGH**: Tombol kembali simple style
5. **MEDIUM**: Responsive mobile layout
6. **MEDIUM**: Stats cards hover animations

---

## ✨ FINAL RESULT

Setelah implementasi, menu Kalender Ujian akan:
- ✅ 100% matching dengan dashboard admin
- ✅ Glassmorphism effect di semua container
- ✅ Icon header tanpa container background
- ✅ No floating graduation cap particles
- ✅ Gradient background BENAR (indigo-purple-pink)
- ✅ Responsive mobile perfect
- ✅ Tombol kembali simple dan clean
- ✅ No dummy data
- ✅ Smooth animations matching dashboard
- ✅ Stats cards dengan icon gradient matching warna
