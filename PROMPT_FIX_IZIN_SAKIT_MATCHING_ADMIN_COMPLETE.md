# 🎯 PROMPT: FIX IZIN/SAKIT MAHASISWA - MATCHING ADMIN DASHBOARD (COMPLETE)

## 📋 OVERVIEW

Prompt ini untuk **merapikan dan memperbaiki** halaman **Izin/Sakit Mahasiswa** dengan sangat serius dan teliti. Menu ini sangat krusial karena berkaitan dengan administrasi kehadiran mahasiswa.

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
// ❌ Container di icon header
<motion.div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-4 ring-white/30">
  <img src={permitIcon} />
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
    src={permitIcon} 
    alt="Izin/Sakit" 
    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" 
  />
</motion.div>

// ✅ NO floating particles animation - Dihilangkan sama sekali
```

### 2️⃣ TOMBOL KEMBALI

**BEFORE (Current - SALAH):**
```typescript
// ❌ Tombol terlalu fancy
<Button variant="ghost" className="mb-6 text-white hover:bg-white/20">
  <ArrowLeft className="mr-2 h-5 w-5" /> Kembali ke Dashboard
</Button>
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
    <img src={permitIcon} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" />
  </motion.div>
  <div className="flex-1 mt-1 sm:mt-0">
    <motion.p className="text-sm text-indigo-100 font-medium tracking-wide">
      Administrasi Kehadiran
    </motion.p>
    <motion.h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
      Pengajuan Izin/Sakit
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
        <motion.div className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14">
          <img src={stat.icon} className="absolute inset-0 h-full w-full object-contain" />
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

### ✅ Stats Cards
- [ ] Glassmorphism effect (bg-white/40 dark:bg-neutral-900/40)
- [ ] Border (border-white/20 dark:border-white/5)
- [ ] Backdrop blur (backdrop-blur-xl)
- [ ] Hover animation (scale: 1.04, y: -4)
- [ ] Animated glow on hover
- [ ] Icon tanpa container, langsung dengan drop-shadow
- [ ] Grid responsive (grid-cols-2 sm:gap-6 lg:grid-cols-4)

### ✅ Permits List Container
- [ ] Glassmorphism container
- [ ] Rounded-3xl dengan shadow-xl
- [ ] Border matching (border-white/20 dark:border-white/5)
- [ ] Hover effect (scale: 1.01, y: -2)

### ✅ Form Modal
- [ ] Glassmorphism background
- [ ] Animated gradient orbs
- [ ] Multi-step form dengan progress indicator
- [ ] Drag & drop file upload
- [ ] Matching color scheme

### ✅ Mobile Responsive
- [ ] Header: flex-col sm:flex-row
- [ ] Icon: h-20 w-20 sm:h-24 sm:w-24
- [ ] Text: text-2xl sm:text-3xl
- [ ] Stats: grid-cols-2 lg:grid-cols-4
- [ ] Padding: p-3 sm:p-6
- [ ] Font size: text-[10px] sm:text-sm

---

## 🚀 FULL CODE STRUCTURE

### File: resources/js/pages/user/permit.tsx

```typescript
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import {
    ArrowLeft, Calendar, Clock, FileText, Upload, X,
    CheckCircle, AlertCircle, Download, Eye, Trash2,
    Plus, Send, Paperclip, BarChart3
} from 'lucide-react';

// Import icon
import permitIcon from '@/assets/admin/dashboard/hadir-icon.png';

type Permit = {
    id: number;
    type: 'izin' | 'sakit';
    reason: string;
    attachment: string | null;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason: string | null;
    session: {
        id: number;
        mata_kuliah: string;
        tanggal: string;
        tanggal_display: string;
    };
    approver: string | null;
    approved_at: string | null;
    created_at: string;
};

type Props = {
    permits: Permit[];
    availableSessions: Array<{
        id: number;
        mata_kuliah: string;
        tanggal: string;
        tanggal_display: string;
        waktu: string;
    }>;
    stats: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
    filters: { status: string };
};
```


---

## 💎 COMPLETE HEADER IMPLEMENTATION

```typescript
export default function Permit({ permits, availableSessions, stats, filters }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(filters.status || 'all');
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
            <Head title="Pengajuan Izin/Sakit" />
            
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8"
            >
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
                                        src={permitIcon} 
                                        alt="Izin/Sakit" 
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
                                        Administrasi Kehadiran
                                    </motion.p>
                                    <motion.h1
                                        className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Pengajuan Izin/Sakit
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 text-indigo-100 max-w-lg text-sm sm:text-base leading-relaxed"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Ajukan izin atau sakit dengan upload surat keterangan resmi
                                    </motion.p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button
                                    onClick={() => setShowForm(true)}
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur border-0 shadow-lg"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajukan Izin
                                </Button>
                            </motion.div>
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
                            title: 'Total Pengajuan', 
                            value: stats.total,
                            icon: BarChart3,
                            colorConfig: { 
                                bg: 'bg-slate-500', 
                                gradientBg: 'from-slate-500/5 to-slate-500/5 dark:from-slate-500/10 dark:to-slate-500/10' 
                            }
                        },
                        { 
                            title: 'Menunggu', 
                            value: stats.pending,
                            icon: Clock,
                            colorConfig: { 
                                bg: 'bg-yellow-500', 
                                gradientBg: 'from-yellow-500/5 to-yellow-500/5 dark:from-yellow-500/10 dark:to-yellow-500/10' 
                            }
                        },
                        { 
                            title: 'Disetujui', 
                            value: stats.approved,
                            icon: CheckCircle,
                            colorConfig: { 
                                bg: 'bg-emerald-500', 
                                gradientBg: 'from-emerald-500/5 to-emerald-500/5 dark:from-emerald-500/10 dark:to-emerald-500/10' 
                            }
                        },
                        { 
                            title: 'Ditolak', 
                            value: stats.rejected,
                            icon: AlertCircle,
                            colorConfig: { 
                                bg: 'bg-red-500', 
                                gradientBg: 'from-red-500/5 to-red-500/5 dark:from-red-500/10 dark:to-red-500/10' 
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
                                        className={`flex shrink-0 h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl ${stat.colorConfig.bg} text-white shadow-lg`}
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

                {/* ═══════ PERMITS LIST CONTAINER ═══════ */}
                <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Riwayat Pengajuan
                                </h2>
                                <p className="text-sm text-neutral-500">
                                    Lihat status pengajuan izin/sakit kamu
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {/* Tabs Filter */}
                        <div className="flex gap-2 mb-6 flex-wrap">
                            {[
                                { value: 'all', label: 'Semua', icon: BarChart3, count: stats.total },
                                { value: 'pending', label: 'Menunggu', icon: Clock, count: stats.pending },
                                { value: 'approved', label: 'Disetujui', icon: CheckCircle, count: stats.approved },
                                { value: 'rejected', label: 'Ditolak', icon: AlertCircle, count: stats.rejected },
                            ].map(tab => {
                                const TabIcon = tab.icon;
                                return (
                                    <motion.button
                                        key={tab.value}
                                        onClick={() => {
                                            setActiveTab(tab.value);
                                            router.get('/user/permit', { status: tab.value }, { preserveState: true });
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            activeTab === tab.value
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                                                : 'bg-white/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:bg-white/80 dark:hover:bg-neutral-800/80'
                                        }`}
                                    >
                                        <TabIcon className="h-4 w-4" />
                                        {tab.label}
                                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                            activeTab === tab.value 
                                                ? 'bg-white/20' 
                                                : 'bg-neutral-200 dark:bg-neutral-700'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Permits Items */}
                        {permits.length > 0 ? (
                            <div className="space-y-4">
                                {permits.map((permit) => (
                                    <PermitCard 
                                        key={permit.id} 
                                        permit={permit}
                                        onPreview={setPreviewImage}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState />
                        )}
                    </div>
                </motion.div>
            </motion.div>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <PermitFormModal 
                        onClose={() => setShowForm(false)}
                        availableSessions={availableSessions}
                    />
                )}
            </AnimatePresence>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewImage && (
                    <ImagePreviewModal 
                        imageUrl={previewImage}
                        onClose={() => setPreviewImage(null)}
                    />
                )}
            </AnimatePresence>
        </StudentLayout>
    );
}
```

---

## 🎨 PERMIT CARD COMPONENT

```typescript
function PermitCard({ permit, onPreview }: { permit: Permit; onPreview: (url: string) => void }) {
    const [deleteDialog, setDeleteDialog] = useState(false);

    const statusConfig = {
        pending: { 
            icon: Clock, 
            label: 'Menunggu', 
            bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
            text: 'text-yellow-700 dark:text-yellow-300',
            border: 'border-yellow-200 dark:border-yellow-800'
        },
        approved: { 
            icon: CheckCircle, 
            label: 'Disetujui', 
            bg: 'bg-emerald-100 dark:bg-emerald-900/30', 
            text: 'text-emerald-700 dark:text-emerald-300',
            border: 'border-emerald-200 dark:border-emerald-800'
        },
        rejected: { 
            icon: AlertCircle, 
            label: 'Ditolak', 
            bg: 'bg-red-100 dark:bg-red-900/30', 
            text: 'text-red-700 dark:text-red-300',
            border: 'border-red-200 dark:border-red-800'
        },
    }[permit.status];

    const StatusIcon = statusConfig.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01, y: -2 }}
            className={`rounded-2xl border-2 p-5 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl hover:shadow-lg transition-all ${statusConfig.border}`}
        >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                    {/* Status & Type Badges */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusConfig.label}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${
                            permit.type === 'sakit'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                            {permit.type === 'sakit' ? '🏥 Sakit' : '📝 Izin'}
                        </span>
                    </div>

                    {/* Course & Date */}
                    <h4 className="font-bold text-lg text-neutral-900 dark:text-white">
                        {permit.session.mata_kuliah}
                    </h4>
                    <p className="text-sm text-neutral-500 flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        {permit.session.tanggal_display}
                    </p>

                    {/* Reason */}
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3 p-3 bg-neutral-50/50 dark:bg-neutral-800/50 rounded-xl">
                        {permit.reason}
                    </p>

                    {/* Rejection Reason */}
                    {permit.status === 'rejected' && permit.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span><strong>Alasan ditolak:</strong> {permit.rejection_reason}</span>
                            </p>
                        </div>
                    )}

                    {/* Approval Info */}
                    {permit.status === 'approved' && permit.approver && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Disetujui oleh {permit.approver} pada {permit.approved_at}
                        </p>
                    )}

                    <p className="text-xs text-neutral-400 mt-2">Diajukan: {permit.created_at}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {permit.attachment && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPreview(permit.attachment!)}
                            className="rounded-xl"
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            Lihat Surat
                        </Button>
                    )}
                    {permit.status === 'pending' && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteDialog(true)}
                            className="rounded-xl"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {deleteDialog && (
                <ConfirmDialog
                    open={deleteDialog}
                    onClose={() => setDeleteDialog(false)}
                    onConfirm={() => {
                        router.delete(`/user/permit/${permit.id}`);
                        setDeleteDialog(false);
                    }}
                    title="Hapus Pengajuan"
                    description="Apakah Anda yakin ingin menghapus pengajuan ini?"
                />
            )}
        </motion.div>
    );
}
```

---

## 📝 NOTES PENTING

### ❌ YANG HARUS DIHILANGKAN:
1. Container background di icon header
2. Floating particles animation
3. Tombol kembali yang terlalu fancy
4. Data dummy

### ✅ YANG HARUS DITAMBAHKAN:
1. Glassmorphism effect di semua container
2. Animated gradient background di header
3. Hover animations matching dashboard
4. Responsive mobile layout
5. Icon dengan drop-shadow yang kuat
6. AnimatedCounter untuk angka stats

### 🎯 PRIORITY:
1. **CRITICAL**: Header icon tanpa container + no floating particles
2. **HIGH**: Glassmorphism containers + gradient background
3. **HIGH**: Tombol kembali simple style
4. **MEDIUM**: Responsive mobile layout
5. **MEDIUM**: Stats cards hover animations

---

## ✨ FINAL RESULT

Setelah implementasi, menu Izin/Sakit akan:
- ✅ 100% matching dengan dashboard admin
- ✅ Glassmorphism effect di semua container
- ✅ Icon header tanpa container background
- ✅ No floating particles animation
- ✅ Responsive mobile perfect
- ✅ Tombol kembali simple dan clean
- ✅ No dummy data
- ✅ Smooth animations matching dashboard
