# 🎯 PROMPT: FIX PERSONAL ANALYTICS - MATCHING ADMIN DASHBOARD (COMPLETE)

## 📋 OVERVIEW

Prompt ini untuk **merapikan dan memperbaiki** halaman **Personal Analytics Mahasiswa** dengan sangat serius dan teliti. Menu ini sangat krusial karena menampilkan analisis akademik dan perkembangan mahasiswa secara real-time.

### Fokus Utama:
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
// ❌ Icon dengan container (tidak ada container tapi ada floating icons)
<motion.div className="relative flex h-16 w-16 items-center justify-center">
  <img src={AnalyticsIcon} />
</motion.div>

// ❌ Floating academic icons yang bergerak ke atas
{[BarChart3, TrendingUp, Target, Award, Calendar].map((Icon, i) => (
  <motion.div animate={{ y: [0, -40, -80] }}>
    <Icon className="h-6 w-6 text-white" />
  </motion.div>
))}

// ❌ Large floating icons
<motion.div animate={{ y: [0, -20, 0] }}>
  <BarChart3 className="h-32 w-32" />
</motion.div>
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
    src={analyticsIcon} 
    alt="Personal Analytics" 
    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" 
  />
</motion.div>

// ✅ NO floating particles animation - Dihilangkan sama sekali
// ✅ NO large floating icons - Dihilangkan sama sekali
```

### 2️⃣ TOMBOL KEMBALI

**BEFORE (Current - TIDAK ADA):**
```typescript
// ❌ Tidak ada tombol kembali
```

**AFTER (Fixed - BENAR):**
```typescript
// ✅ Simple button matching menu lain
<motion.button
  whileHover={{ scale: 1.02, x: -2 }}
  whileTap={{ scale: 0.98 }}
  onClick={() => router.visit('/user/dashboard')}
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
  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10" />
  
  {/* Animated glow on hover */}
  <motion.div
    animate={{
      scale: hoveredCard === cardKey ? 1.5 : 1,
      opacity: hoveredCard === cardKey ? 0.4 : 0.2,
    }}
    className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500 blur-3xl"
  />
</motion.div>
```

---

## 📱 RESPONSIVE MOBILE - MATCHING DASHBOARD

### Header Mobile Layout
```typescript
<div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
  <motion.div className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24">
    <img src={analyticsIcon} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
  </motion.div>
  <div className="flex-1 mt-1 sm:mt-0">
    <motion.p className="text-sm text-indigo-100 font-medium tracking-wide">
      Analisis Akademik
    </motion.p>
    <motion.h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
      Personal Analytics
    </motion.h1>
  </div>
</div>
```

### Stats Cards Mobile
```typescript
<motion.div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
  {statCards.map((stat) => (
    <motion.div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6">
      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
        <motion.div className="flex shrink-0 h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-lg">
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
- [ ] Gradient background animated (indigo-purple-pink)
- [ ] Blur orbs di background
- [ ] Tombol kembali simple (ArrowLeft + "Kembali")
- [ ] Responsive mobile (flex-col sm:flex-row)
- [ ] NO floating academic icons particles
- [ ] NO large floating BarChart3/TrendingUp icons

### ✅ Stats Cards
- [ ] Glassmorphism effect (bg-white/40 dark:bg-neutral-900/40)
- [ ] Border (border-white/20 dark:border-white/5)
- [ ] Backdrop blur (backdrop-blur-xl)
- [ ] Hover animation (scale: 1.04, y: -4)
- [ ] Animated glow on hover
- [ ] Icon dengan background gradient matching warna
- [ ] Grid responsive (grid-cols-2 sm:gap-6 lg:grid-cols-4)
- [ ] NO fire particles animation di streak card

### ✅ Content Containers
- [ ] Glassmorphism container
- [ ] Rounded-3xl dengan shadow-xl
- [ ] Border matching (border-white/20 dark:border-white/5)
- [ ] Hover effect (scale: 1.01, y: -2)

### ✅ Mobile Responsive
- [ ] Header: flex-col sm:flex-row
- [ ] Icon: h-20 w-20 sm:h-24 sm:w-24
- [ ] Text: text-2xl sm:text-3xl
- [ ] Stats: grid-cols-2 lg:grid-cols-4
- [ ] Padding: p-3 sm:p-6
- [ ] Font size: text-[10px] sm:text-sm

---

## 💎 COMPLETE HEADER IMPLEMENTATION

```typescript
// File: resources/js/pages/user/personal-analytics.tsx

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentLayout from '@/layouts/student-layout';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { 
    BarChart3, TrendingUp, TrendingDown, Flame, Award, 
    Calendar, CheckCircle, Clock, XCircle, AlertTriangle, 
    ArrowLeft, Target, Star
} from 'lucide-react';

// Import icon
import analyticsIcon from '@/assets/admin/dashboard/dashboard-icon.png';

type Props = {
    mahasiswa: { id: number; nama: string; nim: string };
    overview: {
        total_sessions: number;
        present: number;
        late: number;
        absent: number;
        overall_rate: number;
        on_time_rate: number;
        this_month_rate: number;
        trend: number;
        trend_direction: 'up' | 'down' | 'stable';
    };
    streakData: {
        current_streak: number;
        longest_streak: number;
        last_attendance: string | null;
    };
    activityGraph: {
        totalActivities: number;
        activeDays: number;
        longestStreak: number;
        currentStreak: number;
    };
    comparison: {
        my_rate: number;
        class_average: number;
        rank: number;
        total_students: number;
    };
    badges: Array<{
        id: number;
        name: string;
        description: string;
        icon: string;
        color: string;
    }>;
};

export default function PersonalAnalytics({ 
    mahasiswa, 
    overview, 
    streakData, 
    activityGraph, 
    comparison, 
    badges 
}: Props) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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
            <Head title="Personal Analytics" />
            
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
                            onClick={() => router.visit('/user/dashboard')}
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
                                        src={analyticsIcon} 
                                        alt="Personal Analytics" 
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
                                        Analisis Akademik
                                    </motion.p>
                                    <motion.h1
                                        className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Personal Analytics
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 text-indigo-100 max-w-lg text-sm sm:text-base leading-relaxed"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Pantau perkembangan dan aktivitas akademik kamu secara real-time
                                    </motion.p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ STATS CARDS — GLASSMORPHISM MATCHING DASHBOARD ═══════ */}
                <motion.div
                    className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.2 } },
                    }}
                >
                    {[
                        { 
                            title: 'Rate Kehadiran', 
                            value: overview.overall_rate,
                            suffix: '%',
                            note: `${overview.trend > 0 ? '+' : ''}${overview.trend}% bulan lalu`,
                            icon: overview.trend_direction === 'up' ? TrendingUp : TrendingDown,
                            colorConfig: { 
                                bg: 'bg-blue-500', 
                                gradientBg: 'from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10',
                                gradient: 'from-blue-400 to-indigo-600'
                            }
                        },
                        { 
                            title: 'Streak Aktivitas', 
                            value: activityGraph.currentStreak,
                            suffix: ' hari',
                            note: `Terpanjang: ${activityGraph.longestStreak} hari`,
                            icon: Flame,
                            colorConfig: { 
                                bg: 'bg-orange-500', 
                                gradientBg: 'from-orange-500/5 to-orange-500/5 dark:from-orange-500/10 dark:to-orange-500/10',
                                gradient: 'from-orange-400 to-orange-600'
                            }
                        },
                        { 
                            title: 'Total Aktivitas', 
                            value: activityGraph.totalActivities,
                            note: `${activityGraph.activeDays} hari aktif`,
                            icon: BarChart3,
                            colorConfig: { 
                                bg: 'bg-emerald-500', 
                                gradientBg: 'from-emerald-500/5 to-emerald-500/5 dark:from-emerald-500/10 dark:to-emerald-500/10',
                                gradient: 'from-emerald-400 to-teal-600'
                            }
                        },
                        { 
                            title: 'Peringkat Kelas', 
                            value: comparison.rank,
                            note: `dari ${comparison.total_students} mahasiswa`,
                            icon: Award,
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
                                                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                            </span>
                                        </div>
                                        <p className="text-[8px] sm:text-xs leading-tight text-neutral-400 mt-0.5">
                                            {stat.note}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══════ CONTENT SECTIONS ═══════ */}
                
                {/* Activity Graph Section */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                >
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Grafik Aktivitas
                                </h2>
                                <p className="text-sm text-neutral-500">
                                    Pola aktivitas akademik kamu
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        {/* Activity graph content here */}
                    </div>
                </motion.div>

                {/* Course Breakdown Section */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                >
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Breakdown Per Mata Kuliah
                                </h2>
                                <p className="text-sm text-neutral-500">
                                    Analisis kehadiran per mata kuliah
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        {/* Course breakdown content here */}
                    </div>
                </motion.div>

                {/* Comparison Section */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                >
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg">
                                <Target className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Perbandingan dengan Kelas
                                </h2>
                                <p className="text-sm text-neutral-500">
                                    Posisi kamu di kelas
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        {/* Comparison content here */}
                    </div>
                </motion.div>

                {/* Badges Section */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                >
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg">
                                <Award className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Badge & Pencapaian
                                </h2>
                                <p className="text-sm text-neutral-500">
                                    Koleksi badge yang kamu raih
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        {badges.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {badges.map((badge) => (
                                    <BadgeCard key={badge.id} badge={badge} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState />
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </StudentLayout>
    );
}
```

---

## 🎨 BADGE CARD COMPONENT

```typescript
function BadgeCard({ badge }: { badge: any }) {
    const getBadgeGradient = (color: string) => {
        const gradients: Record<string, string> = {
            orange: 'from-orange-400 to-orange-600',
            yellow: 'from-yellow-400 to-yellow-600',
            green: 'from-green-400 to-green-600',
            blue: 'from-blue-400 to-blue-600',
            purple: 'from-purple-400 to-purple-600',
            red: 'from-red-400 to-red-600',
            emerald: 'from-emerald-400 to-emerald-600',
            pink: 'from-pink-400 to-pink-600',
        };
        return gradients[color] || 'from-gray-400 to-gray-600';
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, y: -4 }}
            className="relative rounded-2xl border border-white/20 bg-white/60 dark:bg-neutral-900/60 p-4 backdrop-blur-xl dark:border-white/5 text-center"
        >
            <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${getBadgeGradient(badge.color)} text-white shadow-lg text-2xl`}
            >
                {badge.icon}
            </motion.div>
            <h3 className="font-semibold text-sm text-neutral-900 dark:text-white mb-1">
                {badge.name}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {badge.description}
            </p>
            <Badge className="mt-2 text-xs">
                {badge.points} poin
            </Badge>
        </motion.div>
    );
}
```

---

## 🎨 EMPTY STATE COMPONENT

```typescript
function EmptyState() {
    return (
        <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                <Award className="h-10 w-10 text-amber-500 dark:text-amber-400" />
            </div>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Belum Ada Badge
            </p>
            <p className="text-sm text-neutral-500">
                Raih badge dengan aktif mengikuti perkuliahan
            </p>
        </div>
    );
}
```

---

## 📝 NOTES PENTING

### ❌ YANG HARUS DIHILANGKAN:
1. Container background di icon header (sudah tidak ada, tapi ada floating icons)
2. Floating academic icons particles (BarChart3, TrendingUp, Target, Award, Calendar)
3. Large floating icons (BarChart3 h-32 w-32, TrendingUp h-28 w-28)
4. Fire particles animation di streak card
5. Tombol kembali (belum ada, harus ditambahkan)

### ✅ YANG HARUS DITAMBAHKAN:
1. Glassmorphism effect di semua container
2. Animated gradient background di header
3. Hover animations matching dashboard
4. Responsive mobile layout
5. Icon dengan drop-shadow yang kuat
6. AnimatedCounter untuk angka stats
7. Simple back button
8. Section headers dengan icon gradient

### 🎯 PRIORITY:
1. **CRITICAL**: Header icon tanpa container + no floating particles
2. **CRITICAL**: Hilangkan ALL floating icons animations
3. **HIGH**: Glassmorphism containers + gradient background
4. **HIGH**: Tambahkan tombol kembali simple style
5. **MEDIUM**: Responsive mobile layout
6. **MEDIUM**: Stats cards hover animations
7. **MEDIUM**: Section headers dengan icon gradient

---

## ✨ FINAL RESULT

Setelah implementasi, menu Personal Analytics akan:
- ✅ 100% matching dengan dashboard admin
- ✅ Glassmorphism effect di semua container
- ✅ Icon header tanpa container background
- ✅ No floating academic icons particles
- ✅ No large floating icons
- ✅ No fire particles animation
- ✅ Responsive mobile perfect
- ✅ Tombol kembali simple dan clean
- ✅ No dummy data
- ✅ Smooth animations matching dashboard
- ✅ Stats cards dengan icon gradient matching warna
- ✅ Section headers dengan icon gradient yang konsisten
