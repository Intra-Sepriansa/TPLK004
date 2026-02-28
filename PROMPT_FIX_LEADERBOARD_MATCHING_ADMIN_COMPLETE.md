# 🎯 PROMPT: FIX LEADERBOARD (PENCAPAIAN) - MATCHING ADMIN DASHBOARD (COMPLETE)

## 📋 OVERVIEW

Prompt ini untuk **merapikan dan memperbaiki** halaman **Leaderboard (Pencapaian) Mahasiswa** dengan sangat serius dan teliti. Menu ini sangat krusial karena menampilkan kompetisi dan peringkat mahasiswa.

### Fokus Utama:
1. **100% Matching Admin Dashboard** - Warna, UI/UX, container, animasi, header
2. **Hilangkan Container di Icon Header** - Icon sudah benar (tanpa container)
3. **Hilangkan Animasi Floating Particles** - Icon Trophy, Award, Medal, Crown, Star yang bergerak ke atas
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
// ✅ Icon header sudah benar (tanpa container)
<motion.div className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24">
  <img src={LeaderboardIcon} />
</motion.div>

// ❌ Floating trophy/award/medal/crown/star icons yang bergerak ke atas
{[Trophy, Award, Medal, Crown, Star].map((Icon, i) => (
  <motion.div animate={{ y: [0, -40, -80] }}>
    <Icon className="h-6 w-6 text-white" />
  </motion.div>
))}

// ❌ Tidak ada tombol kembali
```

**AFTER (Fixed - BENAR):**
```typescript
// ✅ Icon header sudah benar - PERTAHANKAN
<motion.div
  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
  animate={{ opacity: 1, scale: 1, rotate: 0 }}
  transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
  whileHover={{ scale: 1.05, rotate: 5 }}
  className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
>
  <img 
    src={leaderboardIcon} 
    alt="Leaderboard" 
    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" 
  />
</motion.div>

// ✅ NO floating particles animation - Dihilangkan sama sekali

// ✅ Tambahkan tombol kembali
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

### 2️⃣ HEADER GRADIENT BACKGROUND

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

### 3️⃣ STATS CARDS - GLASSMORPHISM

**WAJIB - Matching Dashboard:**
```typescript
<motion.div
  className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
  whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
>
  {/* Gradient background effect */}
  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10" />
  
  {/* Animated glow on hover */}
  <motion.div
    animate={{
      scale: hoveredCard === cardKey ? 1.5 : 1,
      opacity: hoveredCard === cardKey ? 0.4 : 0.2,
    }}
    className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-500 blur-3xl"
  />
</motion.div>
```

---

## 📱 RESPONSIVE MOBILE - MATCHING DASHBOARD

### Header Mobile Layout
```typescript
<div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
  <motion.div className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24">
    <img src={leaderboardIcon} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
  </motion.div>
  <div className="flex-1 mt-1 sm:mt-0">
    <motion.p className="text-sm text-indigo-100 font-medium tracking-wide">
      Kompetisi Kelas
    </motion.p>
    <motion.h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
      Leaderboard
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
        <motion.div className="flex shrink-0 h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white shadow-lg">
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
- [ ] Icon header sudah benar (PERTAHANKAN)
- [ ] Icon dengan drop-shadow yang kuat
- [ ] Gradient background animated (indigo-purple-pink)
- [ ] Blur orbs di background
- [ ] Tombol kembali simple (ArrowLeft + "Kembali") - TAMBAHKAN
- [ ] Responsive mobile (flex-col sm:flex-row)
- [ ] NO floating trophy/award/medal/crown/star icons particles

### ✅ Stats Cards (Header)
- [ ] Glassmorphism effect di header stats
- [ ] Border (border-white/20)
- [ ] Backdrop blur (backdrop-blur-xl)
- [ ] Hover animation (scale: 1.04, y: -4)
- [ ] Animated glow on hover
- [ ] Icon dengan background gradient matching warna
- [ ] Grid responsive (grid-cols-2 sm:gap-6 lg:grid-cols-4)

### ✅ My Rank Card
- [ ] Glassmorphism container
- [ ] Rounded-3xl dengan shadow-xl
- [ ] Border matching (border-white/20 dark:border-white/5)
- [ ] NO floating particles di my rank card

### ✅ Podium Section
- [ ] Glassmorphism container
- [ ] NO floating particles di podium section

### ✅ Leaderboard List
- [ ] Glassmorphism containers
- [ ] Hover effects matching dashboard

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
// File: resources/js/pages/user/leaderboard.tsx

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentLayout from '@/layouts/student-layout';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { 
    Trophy, Medal, Crown, Star, Flame, TrendingUp, 
    Users, Award, Target, Zap, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import icons
import leaderboardIcon from '@/assets/admin/leaderboard/icon-leaderboard.png';
import totalMahasiswaIcon from '@/assets/admin/leaderboard/total-mahasiswa.png';
import kehadiranIcon from '@/assets/admin/leaderboard/kehadiran.png';

type LeaderboardEntry = {
    id: number;
    nama: string;
    nim: string;
    kelas: string;
    avatar_url: string | null;
    total_sessions: number;
    total_attendance: number;
    present_count: number;
    late_count: number;
    attendance_rate: number;
    on_time_rate: number;
    streak: number;
    points: number;
    level: number;
};

type Props = {
    mahasiswa: { id: number; nama: string; nim: string };
    leaderboard: LeaderboardEntry[];
    podium: LeaderboardEntry[];
    myRank: number | null;
    myStats: LeaderboardEntry | null;
    stats: {
        total_students: number;
        avg_attendance_rate: number;
    };
    period: string;
};

export default function Leaderboard({ 
    mahasiswa, 
    leaderboard, 
    podium, 
    myRank, 
    myStats, 
    stats, 
    period 
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

    const handlePeriodChange = (newPeriod: string) => {
        router.get('/user/leaderboard', { period: newPeriod }, { preserveState: true });
    };

    return (
        <StudentLayout>
            <Head title="Leaderboard" />
            
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
                                {/* Icon Header - SUDAH BENAR, PERTAHANKAN */}
                                <motion.div
                                    className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img 
                                        src={leaderboardIcon} 
                                        alt="Leaderboard" 
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" 
                                    />
                                </motion.div>
                                
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm text-indigo-100 font-medium tracking-wide flex items-center justify-center sm:justify-start gap-2"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <Zap className="h-4 w-4" />
                                        Kompetisi Kelas
                                    </motion.p>
                                    <motion.h1
                                        className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Leaderboard
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 text-indigo-100 max-w-lg text-sm sm:text-base leading-relaxed"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Bersaing dan raih peringkat tertinggi!
                                    </motion.p>
                                </div>
                            </div>

                            {/* Period Filter */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl p-1"
                            >
                                {[
                                    { value: 'all', label: 'Semua' },
                                    { value: 'month', label: 'Bulan Ini' },
                                    { value: 'week', label: 'Minggu Ini' },
                                ].map((p) => (
                                    <motion.button
                                        key={p.value}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handlePeriodChange(p.value)}
                                        className={cn(
                                            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                            period === p.value
                                                ? 'bg-white text-neutral-900 shadow-lg'
                                                : 'text-white/80 hover:bg-white/10'
                                        )}
                                    >
                                        {p.label}
                                    </motion.button>
                                ))}
                            </motion.div>
                        </div>

                        {/* Stats Cards in Header */}
                        <motion.div
                            className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.2 } },
                            }}
                        >
                            {[
                                { 
                                    title: 'Total Peserta', 
                                    value: stats.total_students,
                                    icon: totalMahasiswaIcon,
                                    isCustomIcon: true,
                                    colorConfig: { 
                                        bg: 'bg-sky-500', 
                                        gradientBg: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
                                        gradient: 'from-sky-400 to-indigo-600'
                                    }
                                },
                                { 
                                    title: 'Rata-rata', 
                                    value: stats.avg_attendance_rate,
                                    suffix: '%',
                                    icon: kehadiranIcon,
                                    isCustomIcon: true,
                                    colorConfig: { 
                                        bg: 'bg-emerald-500', 
                                        gradientBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
                                        gradient: 'from-emerald-400 to-teal-600'
                                    }
                                },
                                { 
                                    title: 'Peringkat Kamu', 
                                    value: myRank || 0,
                                    prefix: '#',
                                    icon: Target,
                                    isCustomIcon: false,
                                    colorConfig: { 
                                        bg: 'bg-purple-500', 
                                        gradientBg: 'from-purple-500/5 to-violet-500/5 dark:from-purple-500/10 dark:to-violet-500/10',
                                        gradient: 'from-purple-400 to-violet-600'
                                    }
                                },
                                { 
                                    title: 'Poin Kamu', 
                                    value: myStats?.points || 0,
                                    icon: Star,
                                    isCustomIcon: false,
                                    colorConfig: { 
                                        bg: 'bg-amber-500', 
                                        gradientBg: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
                                        gradient: 'from-amber-400 to-orange-600'
                                    }
                                },
                            ].map((stat, index) => {
                                const cardKey = `stat-${index}`;
                                const StatIcon = stat.isCustomIcon ? null : stat.icon;
                                
                                return (
                                    <motion.div
                                        key={stat.title}
                                        className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/20 bg-white/10 p-2 sm:p-4 shadow-xl backdrop-blur-xl transition-all cursor-pointer"
                                        variants={{
                                            hidden: { opacity: 0, y: 20, scale: 0.9 },
                                            visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200 } },
                                        }}
                                        whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                                        onHoverStart={() => setHoveredCard(cardKey)}
                                        onHoverEnd={() => setHoveredCard(null)}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.colorConfig.gradientBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                                        <motion.div
                                            className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${stat.colorConfig.bg} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
                                        />
                                        <div className="relative flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 10 }}
                                                className="relative flex shrink-0 h-6 w-6 sm:h-10 sm:w-10 items-center justify-center"
                                            >
                                                {stat.isCustomIcon ? (
                                                    <img 
                                                        src={stat.icon as string} 
                                                        alt={stat.title} 
                                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" 
                                                    />
                                                ) : (
                                                    StatIcon && <StatIcon className="h-full w-full text-white drop-shadow-md" />
                                                )}
                                            </motion.div>
                                            <div>
                                                <p className="text-[9px] sm:text-xs font-medium leading-tight text-white/80 line-clamp-1">
                                                    {stat.title}
                                                </p>
                                                <div className="mt-0.5 sm:mt-1">
                                                    <span className="text-xs sm:text-lg font-bold text-white">
                                                        <AnimatedCounter
                                                            value={stat.value}
                                                            prefix={stat.prefix || ''}
                                                            suffix={stat.suffix || ''}
                                                        />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══════ MY RANK CARD — GLASSMORPHISM ═══════ */}
                {myRank && myStats && (
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                    >
                        <div className="p-6 sm:p-8">
                            <div className="flex flex-wrap items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    {/* Rank Badge */}
                                    <motion.div
                                        initial={{ scale: 0, rotateY: -180 }}
                                        animate={{ scale: 1, rotateY: 0 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                                        whileHover={{ scale: 1.1, rotateY: 360, transition: { duration: 0.6 } }}
                                        className="relative"
                                    >
                                        <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 shadow-2xl ring-4 ring-white/30">
                                            <span className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">
                                                #{myRank}
                                            </span>
                                        </div>
                                    </motion.div>

                                    {/* User Info */}
                                    <div>
                                        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm inline-block mb-2">
                                            <p className="text-neutral-700 dark:text-neutral-300 text-xs font-bold uppercase tracking-wider">
                                                Peringkat Kamu
                                            </p>
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white mb-2">
                                            {mahasiswa.nama}
                                        </h2>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30">
                                                <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                <span className="text-neutral-900 dark:text-white font-bold text-sm">
                                                    <AnimatedCounter value={myStats.points} /> poin
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30">
                                                <Zap className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                                <span className="text-neutral-900 dark:text-white font-bold text-sm">
                                                    Level {myStats.level}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Mini Cards */}
                                <div className="flex items-center gap-4 flex-wrap">
                                    {[
                                        { label: 'Kehadiran', value: myStats.attendance_rate, suffix: '%', icon: Trophy, gradient: 'from-emerald-400 to-green-500' },
                                        { label: 'Streak', value: myStats.streak, icon: Flame, gradient: 'from-amber-400 to-orange-500' },
                                        { label: 'Tepat Waktu', value: myStats.on_time_rate, suffix: '%', icon: Target, gradient: 'from-blue-400 to-cyan-500' },
                                    ].map((stat) => {
                                        const StatIcon = stat.icon;
                                        return (
                                            <motion.div
                                                key={stat.label}
                                                whileHover={{ scale: 1.05, y: -4 }}
                                                className="relative rounded-2xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 backdrop-blur-xl p-4 min-w-[100px] sm:min-w-[120px]"
                                            >
                                                <div className="flex items-center justify-center gap-2 mb-2">
                                                    <StatIcon className={`h-5 w-5 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`} />
                                                    <p className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                                                        <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                                    </p>
                                                </div>
                                                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium text-center uppercase tracking-wide">
                                                    {stat.label}
                                                </p>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══════ PODIUM SECTION — GLASSMORPHISM ═══════ */}
                {podium.length >= 3 && (
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg">
                                    <Trophy className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                        Top 3 Peringkat
                                    </h2>
                                    <p className="text-sm text-neutral-500">
                                        Mahasiswa terbaik periode ini
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            {/* Podium content here */}
                        </div>
                    </motion.div>
                )}

                {/* ═══════ LEADERBOARD LIST — GLASSMORPHISM ═══════ */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                >
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Daftar Peringkat
                                </h2>
                                <p className="text-sm text-neutral-500">
                                    Semua mahasiswa yang terdaftar
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        {/* Leaderboard list content here */}
                    </div>
                </motion.div>
            </motion.div>
        </StudentLayout>
    );
}
```

---

## 📝 NOTES PENTING

### ❌ YANG HARUS DIHILANGKAN:
1. Floating trophy/award/medal/crown/star icons particles yang bergerak ke atas
2. Floating particles di my rank card
3. Floating particles di podium section

### ✅ YANG HARUS DITAMBAHKAN:
1. Tombol kembali simple style (saat ini belum ada)
2. Glassmorphism effect di semua container
3. Animated gradient background di header
4. Hover animations matching dashboard
5. Responsive mobile layout
6. Section headers dengan icon gradient

### ✅ YANG SUDAH BENAR (PERTAHANKAN):
1. Icon header sudah tanpa container - PERTAHANKAN
2. Icon dengan drop-shadow yang kuat - PERTAHANKAN

### 🎯 PRIORITY:
1. **CRITICAL**: Hilangkan ALL floating icons animations (Trophy, Award, Medal, Crown, Star)
2. **CRITICAL**: Tambahkan tombol kembali simple style
3. **HIGH**: Glassmorphism containers
4. **HIGH**: Section headers dengan icon gradient
5. **MEDIUM**: Responsive mobile layout
6. **MEDIUM**: Hover animations matching dashboard

---

## ✨ FINAL RESULT

Setelah implementasi, menu Leaderboard akan:
- ✅ 100% matching dengan dashboard admin
- ✅ Glassmorphism effect di semua container
- ✅ Icon header sudah benar (PERTAHANKAN)
- ✅ No floating trophy/award/medal/crown/star icons particles
- ✅ No floating particles di my rank card
- ✅ No floating particles di podium section
- ✅ Responsive mobile perfect
- ✅ Tombol kembali simple dan clean (TAMBAHKAN)
- ✅ No dummy data
- ✅ Smooth animations matching dashboard
- ✅ Stats cards dengan icon gradient matching warna
- ✅ Section headers dengan icon gradient yang konsisten


---

## ⚠️ CRITICAL WARNING - JANGAN PANGKAS KODE!

### 🚨 PENTING SEKALI - BACA INI DULU!

File `resources/js/pages/user/leaderboard.tsx` memiliki **1300+ baris kode** yang sudah lengkap dengan fitur-fitur advanced seperti:
- Podium section dengan animasi 3D
- Leaderboard list dengan expand/collapse
- Student detail modal
- Rank badges dengan animasi
- Progress bars
- Achievement badges
- Dan banyak komponen lainnya

### ❌ YANG TIDAK BOLEH DILAKUKAN:
1. **JANGAN HAPUS** kode yang sudah ada
2. **JANGAN PANGKAS** komponen yang sudah berfungsi
3. **JANGAN REPLACE** seluruh file
4. **JANGAN HILANGKAN** fitur-fitur yang sudah ada

### ✅ YANG HARUS DILAKUKAN:
1. **HANYA EDIT** bagian yang disebutkan dalam prompt ini
2. **PERTAHANKAN** semua kode yang tidak disebutkan
3. **TAMBAHKAN** tombol kembali di bagian header
4. **HILANGKAN** hanya floating particles animation
5. **UPDATE** styling container menjadi glassmorphism

---

## 📍 LOKASI PERUBAHAN SPESIFIK

### 1. Header Section (Baris ~40-200)

**YANG DIUBAH:**
```typescript
// HAPUS bagian ini (floating icons):
{[Trophy, Award, Medal, Crown, Star].map((Icon, i) => (
  <motion.div
    key={i}
    className="absolute"
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.4, 0],
      scale: [0, 1, 0],
      y: [0, -40, -80]
    }}
    // ... rest of animation
  >
    <Icon className="h-6 w-6 text-white" />
  </motion.div>
))}

// TAMBAHKAN tombol kembali SEBELUM div header content:
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

**YANG DIPERTAHANKAN:**
- Semua struktur header lainnya
- Period filter buttons
- Stats cards di header
- Gradient background animations
- Icon header (sudah benar)

### 2. My Rank Card Section (Baris ~200-400)

**YANG DIUBAH:**
```typescript
// HAPUS bagian floating particles di my rank card (jika ada):
// Cari dan hapus kode seperti ini:
{[...Array(20)].map((_, i) => (
  <motion.div
    animate={{ y: [0, -30], opacity: [0, 1, 0] }}
    // ...
  />
))}

// UPDATE container menjadi glassmorphism:
// GANTI dari:
<div className="relative group">
  <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl" />
  // ...
</div>

// MENJADI:
<motion.div
  variants={itemVariants}
  whileHover={{ scale: 1.01, y: -2 }}
  className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
>
  <div className="p-6 sm:p-8">
    {/* Konten my rank card - PERTAHANKAN SEMUA */}
  </div>
</motion.div>
```

**YANG DIPERTAHANKAN:**
- Rank badge dengan animasi 3D
- User info
- Stats mini cards
- Semua animasi hover dan transition

### 3. Podium Section (Baris ~400-700)

**YANG DIUBAH:**
```typescript
// HAPUS floating particles di podium (jika ada)

// UPDATE container menjadi glassmorphism:
<motion.div
  variants={itemVariants}
  whileHover={{ scale: 1.01, y: -2 }}
  className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
>
  <div className="p-6 border-b border-white/10">
    {/* Header section */}
  </div>
  <div className="p-6">
    {/* Podium content - PERTAHANKAN SEMUA */}
  </div>
</motion.div>
```

**YANG DIPERTAHANKAN:**
- Podium 3D animations
- Rank badges (gold, silver, bronze)
- Student cards
- Semua interaksi dan hover effects

### 4. Leaderboard List Section (Baris ~700-1300)

**YANG DIUBAH:**
```typescript
// UPDATE container menjadi glassmorphism:
<motion.div
  variants={itemVariants}
  whileHover={{ scale: 1.01, y: -2 }}
  className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
>
  <div className="p-6 border-b border-white/10">
    {/* Header section */}
  </div>
  <div className="p-6">
    {/* Leaderboard list - PERTAHANKAN SEMUA */}
  </div>
</motion.div>
```

**YANG DIPERTAHANKAN:**
- Semua student cards
- Expand/collapse functionality
- Progress bars
- Achievement badges
- Rank indicators
- Hover effects
- Click handlers
- Modal components

---

## 🔍 CHECKLIST SEBELUM COMMIT

Sebelum menyimpan perubahan, pastikan:

- [ ] File masih memiliki ~1300 baris (tidak berkurang signifikan)
- [ ] Semua komponen masih ada (Podium, List, Modal, dll)
- [ ] Tombol kembali sudah ditambahkan
- [ ] Floating particles sudah dihilangkan
- [ ] Glassmorphism sudah diterapkan di container
- [ ] Semua fungsi masih berfungsi (expand, modal, filter)
- [ ] Tidak ada error TypeScript
- [ ] Tidak ada komponen yang hilang

---

## 📋 SUMMARY PERUBAHAN

### Yang Dihapus (HANYA INI):
1. Floating Trophy/Award/Medal/Crown/Star icons animation (~20 baris)
2. Floating particles di my rank card (jika ada, ~10 baris)
3. Floating particles di podium (jika ada, ~10 baris)

### Yang Ditambahkan (HANYA INI):
1. Tombol kembali di header (~10 baris)
2. Import ArrowLeft icon (~1 baris)

### Yang Diupdate (HANYA STYLING):
1. Container my rank card → glassmorphism
2. Container podium → glassmorphism
3. Container leaderboard list → glassmorphism

### Total Perubahan:
- Hapus: ~40 baris
- Tambah: ~11 baris
- Update: ~10 baris (hanya className)
- **Net change: File tetap ~1300 baris**

---

## 🎯 FINAL VERIFICATION

Setelah implementasi, verifikasi bahwa:

1. ✅ File size masih ~1300 baris
2. ✅ Semua fitur masih berfungsi
3. ✅ UI matching dashboard admin
4. ✅ No floating particles
5. ✅ Tombol kembali ada
6. ✅ Glassmorphism applied
7. ✅ Responsive mobile works
8. ✅ No TypeScript errors
9. ✅ No missing components
10. ✅ All animations still smooth

---

## 💡 TIPS IMPLEMENTASI

1. **Backup dulu** file original sebelum edit
2. **Edit satu section** per waktu
3. **Test setiap perubahan** sebelum lanjut
4. **Jangan copy-paste** seluruh file dari prompt
5. **Hanya edit** bagian yang disebutkan spesifik
6. **Gunakan Find & Replace** untuk perubahan styling
7. **Commit per section** untuk mudah rollback jika error

---

## 🚀 READY TO IMPLEMENT

Prompt ini sudah lengkap dan aman untuk diimplementasikan tanpa menghilangkan fitur yang sudah ada. Fokus hanya pada perubahan yang disebutkan di atas.
