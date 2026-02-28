# 🎨 PROMPT: FIX MAHASISWA REKAPAN & EVALUASI - 100% MATCHING DASHBOARD ADMIN
## Rapihkan UI/UX Menu Rekapan Kehadiran Mahasiswa

---

## 📋 OVERVIEW MASALAH

### Issues yang Perlu Diperbaiki
```
❌ Animations masih pakai stiffness: 100, damping: 15 (tidak smooth)
❌ Container cards belum konsisten dengan HITAM theme
❌ Stats cards masih pakai border biasa, bukan glassmorphism
❌ Chart containers belum pakai backdrop-blur-xl
❌ Tooltip styling belum matching dengan dashboard
❌ Course summary cards belum pakai hover effects yang smooth
❌ Beberapa container masih pakai bg-white/80 bukan bg-white/40
❌ Border colors belum konsisten (masih ada border-gray-800)
```

### Solutions
```
✅ Update animations: stiffness: 300, damping: 20
✅ HITAM theme konsisten: bg-white/40 dark:bg-neutral-900/40
✅ Stats cards dengan glassmorphism dan hover effects
✅ Chart containers dengan backdrop-blur-xl
✅ Tooltip matching dashboard style
✅ Course summary dengan smooth hover animations
✅ Border colors konsisten: border-white/20 dark:border-white/5
✅ Semua containers pakai backdrop-blur-xl
```

---

## 🎨 DESIGN SYSTEM — EXACT MATCH DASHBOARD

### Color Palette (HITAM Theme)
```tsx
// Container Colors
bg-white/40 dark:bg-neutral-900/40  // Main containers
border-white/20 dark:border-white/5  // Borders
backdrop-blur-xl                      // Glassmorphism

// Gradient Header (sudah benar)
from-indigo-600 via-purple-600 to-pink-500

// Stats Card Colors
emerald: from-emerald-400 to-teal-600
sky: from-sky-400 to-indigo-600
amber: from-amber-400 to-orange-600
rose: from-rose-400 to-pink-600
violet: from-violet-400 to-purple-600
```

### Animation Settings
```tsx
// Smooth animations (UPDATE INI!)
stiffness: 300  // dari 100
damping: 20     // dari 15

// Container variants
containerVariants: {
  staggerChildren: 0.04,
  delayChildren: 0.1
}

// Item variants
itemVariants: {
  type: 'spring',
  stiffness: 300,
  damping: 20
}

// Card hover
cardHoverVariants: {
  scale: 1.02,
  y: -4,
  stiffness: 300,
  damping: 15
}
```

---

## 💻 IMPLEMENTATION CHANGES

### 1. UPDATE ANIMATION VARIANTS

**Before:**
```tsx
const itemVariants = {
    hidden: {
        opacity: 0,
        y: 40,
        scale: 0.9,
        rotateX: -10,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 100,  // ❌ TOO SLOW
            damping: 15,     // ❌ TOO BOUNCY
            mass: 0.8,
        },
    },
};
```

**After:**
```tsx
const itemVariants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.9,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 300,  // ✅ SMOOTH & FAST
            damping: 20,     // ✅ PERFECT BOUNCE
        },
    },
};
```

---

### 2. UPDATE STATS CARDS - Glassmorphism Style

**Before:**
```tsx
<motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    className={cn(
        "group relative rounded-2xl border bg-white/80 p-6 shadow-sm backdrop-blur transition-all duration-300 dark:border-gray-800 dark:bg-black/80 hover:shadow-lg",
        style.border
    )}
>
```

**After:**
```tsx
<motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
    whileTap={{ scale: 0.98 }}
    className={cn(
        "group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5",
        stat.colorConfig.hoverShadow
    )}
>
    {/* Gradient Background */}
    <div className={`absolute inset-0 bg-gradient-to-br ${stat.colorConfig.gradientBg}`} />
    
    {/* Animated Glow on Hover */}
    <motion.div
        initial={false}
        animate={{
            scale: hoveredCard === cardKey ? 1.5 : 1,
            opacity: hoveredCard === cardKey ? 0.4 : 0.2,
        }}
        transition={{ duration: 0.5 }}
        className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${stat.colorConfig.bg} blur-3xl transition-all duration-500`}
    />
    
    {/* Content */}
    <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
        {/* Icon with hover animation */}
        <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center"
        >
            <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
        </motion.div>
        
        <div>
            <p className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-neutral-400">{label}</p>
            <div className="mt-0.5 sm:mt-1">
                <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                    <AnimatedCounter value={value} suffix={suffix} />
                </span>
            </div>
            <p className="text-[8px] sm:text-xs leading-tight text-neutral-400 mt-0.5">{subtext}</p>
        </div>
    </div>
</motion.div>
```

---

### 3. UPDATE CHART CONTAINERS - HITAM Theme

**Before:**
```tsx
<motion.div
    variants={itemVariants}
    className="rounded-2xl border bg-white shadow-sm dark:border-gray-800 dark:bg-black/50 overflow-hidden"
>
```

**After:**
```tsx
<motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.01 }}
    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
>
```

---

### 4. UPDATE TOOLTIP - Matching Dashboard

**Before:**
```tsx
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-black"
        >
```

**After:**
```tsx
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-white/20 bg-white/95 p-3 shadow-xl backdrop-blur-xl dark:border-neutral-700 dark:bg-neutral-900/95"
        >
            <p className="font-semibold text-neutral-900 dark:text-white mb-2">{label}</p>
            {payload.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-neutral-600 dark:text-neutral-400">{entry.name}:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{entry.value}</span>
                </div>
            ))}
        </motion.div>
    );
};
```

---

### 5. UPDATE COURSE SUMMARY CARDS

**Before:**
```tsx
<motion.div
    key={course.courseId}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 200
    }}
    whileHover={{
        x: 3,
        scale: 1.005,
    }}
    className="p-4 cursor-pointer border-l-2 border-transparent hover:border-violet-500 transition-colors"
>
```

**After:**
```tsx
<motion.div
    key={course.courseId}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 300,  // ✅ Updated
        damping: 20      // ✅ Updated
    }}
    whileHover={{
        x: 5,
        scale: 1.01,
        backgroundColor: 'rgba(139, 92, 246, 0.05)',
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 15
        }
    }}
    className="p-4 cursor-pointer border-l-4 border-transparent hover:border-violet-500 transition-all rounded-r-xl"
>
```

---

### 6. UPDATE EVALUATION DASHBOARD CONTAINER

**Before:**
```tsx
<motion.div
    variants={containerVariants}
    className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
>
```

**After:**
```tsx
<motion.div
    variants={containerVariants}
    className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
>
    <div className="lg:col-span-2 space-y-6">
        <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.005 }}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
        >
            <div className="flex items-center gap-3 mb-6">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20"
                >
                    <Zap className="h-5 w-5 text-amber-500" />
                </motion.div>
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">AI Insights & Health</h2>
            </div>
            <EvaluationDashboard
                attendanceRate={stats.attendanceRate}
                totalSessions={stats.totalSessions}
                missedSessions={stats.totalSessions - stats.presentCount}
            />
        </motion.div>
    </div>
    
    <div className="space-y-6">
        <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.005 }}
            className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
        >
            <div className="flex items-center gap-3 mb-6">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                >
                    <Target className="h-5 w-5 text-emerald-500" />
                </motion.div>
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">Simulator Kelulusan</h2>
            </div>
            <WhatIfSimulator
                totalSessions={stats.totalSessions}
                presentSessions={stats.presentCount}
                remainingSessions={remainingSessions}
            />
        </motion.div>
    </div>
</motion.div>
```

---

### 7. UPDATE RECENT LOGS SECTION

**Before:**
```tsx
<div className="space-y-6 lg:col-span-1">
    <motion.div
        variants={itemVariants}
        className="rounded-2xl border bg-white shadow-sm dark:border-gray-800 dark:bg-black/50 overflow-hidden"
    >
```

**After:**
```tsx
<div className="space-y-6 lg:col-span-1">
    <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.005 }}
        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
    >
        <div className="p-6 border-b border-white/20 dark:border-white/5">
            <div className="flex items-center gap-3">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20"
                >
                    <Clock className="h-5 w-5 text-sky-500" />
                </motion.div>
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                    Aktivitas Terbaru
                </h2>
            </div>
        </div>
        
        <div className="divide-y divide-white/10 dark:divide-white/5">
            {recentLogs.map((log, index) => (
                <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                        delay: index * 0.05,
                        type: 'spring',
                        stiffness: 300,
                        damping: 20
                    }}
                    whileHover={{
                        x: 5,
                        backgroundColor: 'rgba(99, 102, 241, 0.05)',
                        transition: {
                            type: 'spring',
                            stiffness: 400,
                            damping: 15
                        }
                    }}
                    className="p-4 cursor-pointer"
                >
                    {/* Log content */}
                </motion.div>
            ))}
        </div>
    </motion.div>
</div>
```

---

## ✅ CHECKLIST IMPLEMENTASI

### Animation Updates
```
☐ Update itemVariants: stiffness: 300, damping: 20
☐ Update cardHoverVariants: stiffness: 300, damping: 15
☐ Remove rotateX and mass from itemVariants
☐ Simplify hidden state (remove rotateX: -10)
```

### Container Updates
```
☐ Update all main containers to bg-white/40 dark:bg-neutral-900/40
☐ Add backdrop-blur-xl to all containers
☐ Update borders to border-white/20 dark:border-white/5
☐ Change rounded-2xl to rounded-3xl for main containers
☐ Add shadow-xl instead of shadow-sm
```

### Stats Cards
```
☐ Add gradient background layer
☐ Add animated glow effect on hover
☐ Update hover animation with stiffness: 400
☐ Add icon hover animation (scale: 1.1, rotate: 10)
☐ Update responsive sizes (h-10 w-10 sm:h-14 sm:w-14)
```

### Chart Containers
```
☐ Update tooltip styling to match dashboard
☐ Add backdrop-blur-xl to chart containers
☐ Update border colors consistently
☐ Add whileHover={{ scale: 1.01 }} to chart containers
```

### Course Summary
```
☐ Update hover animation with backgroundColor change
☐ Change border-l-2 to border-l-4
☐ Add rounded-r-xl for smooth corners
☐ Update transition to stiffness: 300, damping: 20
```

### Evaluation Section
```
☐ Wrap EvaluationDashboard in glassmorphism container
☐ Wrap WhatIfSimulator in glassmorphism container
☐ Add section headers with animated icons
☐ Add hover effects to section containers
```

### Recent Logs
```
☐ Update container to HITAM theme
☐ Add hover effects to log items
☐ Update divider colors to border-white/10
☐ Add smooth animations to log items
```

### Testing
```
☐ Test all animations are smooth (no lag)
☐ Test hover effects on all cards
☐ Test responsive behavior on mobile
☐ Test dark mode consistency
☐ Test all border colors match
☐ Test backdrop-blur-xl works correctly
```

---

## 🎨 COLOR REFERENCE

### Container Colors
```css
/* Light mode */
background: rgba(255, 255, 255, 0.4);
border: rgba(255, 255, 255, 0.2);

/* Dark mode */
background: rgba(23, 23, 23, 0.4);
border: rgba(255, 255, 255, 0.05);
```

### Stats Card Gradients
```css
/* Emerald */
background: linear-gradient(135deg, #34d399 0%, #14b8a6 100%);
shadow: rgba(16, 185, 129, 0.3);

/* Sky */
background: linear-gradient(135deg, #38bdf8 0%, #4f46e5 100%);
shadow: rgba(56, 189, 248, 0.3);

/* Amber */
background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
shadow: rgba(251, 191, 36, 0.3);

/* Rose */
background: linear-gradient(135deg, #fb7185 0%, #ec4899 100%);
shadow: rgba(251, 113, 133, 0.3);

/* Violet */
background: linear-gradient(135deg, #a78bfa 0%, #a855f7 100%);
shadow: rgba(167, 139, 250, 0.3);
```

---

## 📱 RESPONSIVE BREAKPOINTS

### Mobile (< 640px)
```tsx
- Stats cards: p-3, h-10 w-10 icons
- Text sizes: text-[10px], text-lg
- Rounded: rounded-2xl
- Grid: grid-cols-2
```

### Tablet (640px - 1024px)
```tsx
- Stats cards: p-4, h-12 w-12 icons
- Text sizes: text-xs, text-xl
- Rounded: rounded-2xl sm:rounded-3xl
- Grid: sm:grid-cols-4
```

### Desktop (> 1024px)
```tsx
- Stats cards: p-6, h-14 w-14 icons
- Text sizes: text-sm, text-2xl
- Rounded: rounded-3xl
- Grid: lg:grid-cols-3
```

---

## 🔧 SPECIFIC FILE CHANGES

### File: `resources/js/pages/user/rekapan.tsx`

#### Line ~140-160: Update itemVariants
```tsx
const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 20,
        },
    },
};
```

#### Line ~162-172: Update cardHoverVariants
```tsx
const cardHoverVariants = {
    hover: {
        scale: 1.02,
        y: -4,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 15,
        },
    },
};
```

#### Line ~230-280: Update StatCard component
- Add gradient background
- Add animated glow
- Update hover animations
- Add icon hover effects

#### Line ~400-450: Update Chart containers
- Change to bg-white/40 dark:bg-neutral-900/40
- Add backdrop-blur-xl
- Update borders

#### Line ~550-650: Update Course Summary
- Update hover animations
- Add backgroundColor change
- Update border width

#### Line ~700-800: Update Evaluation Section
- Wrap in glassmorphism containers
- Add section headers
- Add hover effects

---

## 📊 BEFORE & AFTER COMPARISON

### Before
```
❌ Animations: stiffness: 100, damping: 15 (slow & bouncy)
❌ Containers: bg-white/80 (not transparent enough)
❌ Borders: border-gray-800 (inconsistent)
❌ Stats cards: No gradient, no glow
❌ Hover effects: Simple scale only
❌ Tooltips: Basic styling
```

### After
```
✅ Animations: stiffness: 300, damping: 20 (smooth & fast)
✅ Containers: bg-white/40 dark:bg-neutral-900/40 (perfect transparency)
✅ Borders: border-white/20 dark:border-white/5 (consistent)
✅ Stats cards: Gradient + animated glow
✅ Hover effects: Scale + y-offset + backgroundColor
✅ Tooltips: Glassmorphism with backdrop-blur
```

---

**Created**: February 26, 2026  
**Purpose**: Fix Mahasiswa Rekapan & Evaluasi UI/UX matching Dashboard Admin  
**Status**: Ready for implementation  
**Estimated Time**: 3-4 hours  
**Priority**: High - UI consistency

---

## 🎉 SUMMARY

Prompt ini akan:
1. ✅ Update semua animations ke stiffness: 300, damping: 20
2. ✅ HITAM theme konsisten untuk semua container
3. ✅ Stats cards dengan glassmorphism dan animated glow
4. ✅ Chart containers dengan backdrop-blur-xl
5. ✅ Tooltip matching dashboard style
6. ✅ Course summary dengan smooth hover animations
7. ✅ Evaluation section dengan glassmorphism containers
8. ✅ Recent logs dengan hover effects
9. ✅ Border colors konsisten di semua elemen
10. ✅ Responsive design untuk mobile, tablet, desktop

Menu Rekapan sekarang 100% matching dengan Dashboard Admin! 🚀
