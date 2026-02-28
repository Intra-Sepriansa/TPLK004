# 🎨 PROMPT LENGKAP: REKAPAN MAHASISWA 100% MATCHING ADMIN DASHBOARD
## Samakan SEMUA Warna, Animasi, UI/UX, Header, Container, Icons dengan Admin Dashboard

---

## 📋 OVERVIEW - PERUBAHAN TOTAL

### ❌ MASALAH SAAT INI (Rekapan Mahasiswa)
```
❌ Header gradient berbeda dengan admin
❌ Container colors tidak matching (masih pakai bg-white/80)
❌ Border colors tidak konsisten (masih ada border-gray-800)
❌ Stats cards tidak pakai glassmorphism style admin
❌ Animations masih pakai stiffness: 100, damping: 15
❌ Chart containers tidak pakai backdrop-blur-xl
❌ Tooltip styling berbeda dengan admin
❌ Icons tidak pakai PNG assets seperti admin
❌ Hover effects tidak smooth seperti admin
❌ Course summary cards tidak pakai style admin
```

### ✅ SOLUSI (100% Matching Admin Dashboard)
```
✅ Header gradient EXACT MATCH: from-indigo-600 via-purple-600 to-pink-500
✅ Container colors: bg-white/40 dark:bg-neutral-900/40
✅ Border colors: border-white/20 dark:border-white/5
✅ Stats cards: Glassmorphism + animated glow + PNG icons
✅ Animations: stiffness: 300, damping: 20
✅ Chart containers: backdrop-blur-xl + shadow-xl
✅ Tooltip: rounded-xl + backdrop-blur-xl
✅ Icons: PNG assets dari folder admin
✅ Hover effects: scale: 1.04, y: -4
✅ Course summary: Smooth hover + backgroundColor change
```

---

## 🎨 DESIGN SYSTEM — EXACT ADMIN DASHBOARD

### 1. COLOR PALETTE (ADMIN STYLE)

#### Header Gradient (EXACT MATCH)
```tsx
// Animated Gradient Background
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
```

#### Container Colors (GLASSMORPHISM)
```tsx
// Main containers
bg-white/40 dark:bg-neutral-900/40
backdrop-blur-xl
border-white/20 dark:border-white/5
shadow-xl
rounded-3xl

// Stats cards gradient backgrounds
from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10
from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10
from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10
from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10
from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10
```


#### Text Colors (NEUTRAL PALETTE)
```tsx
// Headings
text-neutral-900 dark:text-white

// Subtext
text-neutral-500 dark:text-neutral-400

// Muted text
text-neutral-400 dark:text-neutral-500

// Border dividers
border-white/10 dark:border-white/5
```

### 2. ANIMATION SETTINGS (EXACT ADMIN)

#### Container Variants
```tsx
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,  // ✅ Admin uses 0.04
            delayChildren: 0.1,
        }
    }
} as const;
```

#### Item Variants (SMOOTH & FAST)
```tsx
const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },  // ✅ y: 30 (not 40)
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { 
            type: 'spring', 
            stiffness: 300,  // ✅ 300 (not 100)
            damping: 20      // ✅ 20 (not 15)
        }
    }
} as const;
```

#### Card Hover Variants
```tsx
const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    hover: {
        scale: 1.04,  // ✅ 1.04 (not 1.02)
        y: -4,        // ✅ -4 (not -2)
        transition: { type: 'spring', stiffness: 400, damping: 15 }
    }
} as const;
```


### 3. ICON SYSTEM (PNG ASSETS)

#### Stats Cards Icons (USE PNG FROM ADMIN)
```tsx
// Import PNG icons dari folder admin
import rekapanIcon from '@/assets/admin/dashboard/hadir-icon.png';
import totalIcon from '@/assets/admin/dashboard/total-icon.png';
import hadirIcon from '@/assets/admin/dashboard/hadir-icon.png';
import terlambatIcon from '@/assets/admin/rekap-kehadiran/terlambat.png';
import ditolakIcon from '@/assets/admin/rekap-kehadiran/ditolak.png';

// Usage in stats cards
<motion.div
    whileHover={{ scale: 1.1, rotate: 10 }}
    className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center"
>
    <img 
        src={hadirIcon} 
        alt="Hadir" 
        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" 
    />
</motion.div>
```

---

## 💻 IMPLEMENTATION — STEP BY STEP

### STEP 1: UPDATE HEADER (100% MATCHING ADMIN)

**File**: `resources/js/pages/user/rekapan.tsx`

**BEFORE** (Lines ~350-450):
```tsx
<motion.div
    variants={itemVariants}
    whileHover={{
        scale: 1.01,
        rotateY: 1,
    }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
>
```

**AFTER** (EXACT ADMIN STYLE):
```tsx
<motion.div
    variants={itemVariants}
    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
>
    {/* Animated Gradient Background - EXACT ADMIN */}
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
    
    {/* Overlay & Glow Orbs - EXACT ADMIN */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
```


### STEP 2: UPDATE FLOATING PARTICLES (ADMIN STYLE)

**REMOVE OLD PARTICLES** (25 particles with complex animation)

**ADD ADMIN STYLE FLOATING ICONS**:
```tsx
{/* Floating Icons - ADMIN STYLE */}
<motion.div
    animate={{
        y: [0, -15, 0],
        x: [0, 10, 0],
        rotate: [0, 5, -5, 0],
        opacity: [0.15, 0.3, 0.15],
    }}
    transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
    }}
    className="absolute top-10 right-20 text-white/15"
>
    <FileText className="h-14 w-14" />
</motion.div>

<motion.div
    animate={{
        y: [0, 20, 0],
        x: [0, -15, 0],
        rotate: [0, -10, 10, 0],
        opacity: [0.1, 0.25, 0.1],
    }}
    transition={{
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1,
    }}
    className="absolute bottom-10 left-20 text-white/15"
>
    <Award className="h-16 w-16" />
</motion.div>
```

### STEP 3: UPDATE PULSATING RINGS (ADMIN STYLE)

**REPLACE** old rings with admin style:
```tsx
{/* Pulsating Rings - ADMIN STYLE */}
{[0, 1, 2].map((i) => (
    <motion.div
        key={i}
        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
        animate={{ 
            scale: [1, 3], 
            opacity: [0.3, 0] 
        }}
        transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: 'easeOut', 
            delay: i * 1 
        }}
    />
))}
```


### STEP 4: UPDATE HEADER ICON (PNG ASSET)

**BEFORE**:
```tsx
<motion.div
    whileHover={{
        scale: 1.2,
        rotate: [0, -8, 8, 0],
        boxShadow: "0 0 40px rgba(255,255,255,0.6)"
    }}
    className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/25 backdrop-blur-xl ring-4 ring-white/40"
>
    <img src={rekapanIcon} alt="Rekapan" className="h-12 w-12" />
</motion.div>
```

**AFTER** (ADMIN STYLE):
```tsx
<motion.div
    className="relative flex shrink-0 h-20 w-20 sm:h-24 sm:w-24 items-center justify-center"
    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
    animate={{ opacity: 1, scale: 1, rotate: 0 }}
    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
    whileHover={{ scale: 1.05, rotate: 5 }}
>
    <img 
        src={rekapanIcon} 
        alt="Rekapan" 
        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]" 
    />
</motion.div>
```

### STEP 5: UPDATE HEADER CONTENT (TEXT & LAYOUT)

**AFTER** (ADMIN STYLE):
```tsx
<div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
    {/* Icon here */}
    <div className="flex-1 mt-1 sm:mt-0">
        <motion.p
            className="text-sm text-indigo-100 font-medium tracking-wide"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
        >
            Rekapan Kehadiran
        </motion.p>
        <motion.h1
            className="text-2xl sm:text-3xl font-bold text-white mt-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
        >
            {mahasiswa.nama}
        </motion.h1>
        <motion.p
            className="mt-2 text-indigo-100 max-w-lg text-sm sm:text-base leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
        >
            NIM: {mahasiswa.nim}
        </motion.p>
    </div>
</div>
```


### STEP 6: UPDATE STATS MINI CARDS IN HEADER

**BEFORE**:
```tsx
<motion.div
    className="rounded-xl bg-white/15 p-4 backdrop-blur-xl"
>
```

**AFTER** (ADMIN STYLE):
```tsx
<motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 + (i * 0.1) }}
    whileHover={{
        scale: 1.08,
        y: -4,
        boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.3)",
    }}
    className="rounded-xl bg-white/15 p-4 backdrop-blur-xl cursor-pointer relative overflow-hidden group shadow-lg ring-1 ring-white/20"
>
    {/* Shimmer effect on hover */}
    <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
        animate={{ x: ['-100%', '100%'] }}
        transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
        }}
    />
    <p className="text-xs text-purple-100 font-semibold relative z-10">{item.label}</p>
    <p className="text-2xl font-bold relative z-10">
        <AnimatedCounter value={item.value} suffix={item.suffix || ""} duration={1500} />
        {item.extra || ""}
    </p>
</motion.div>
```

---

## 🎯 STEP 7: UPDATE STATS CARDS (GLASSMORPHISM + PNG ICONS)

**COMPLETE REPLACEMENT** of StatCard component:

```tsx
function StatCard({
    icon,
    label,
    value,
    suffix,
    subtext,
    color,
}: {
    icon: string;  // PNG path
    label: string;
    value: number;
    suffix?: string;
    subtext?: string;
    color: 'emerald' | 'amber' | 'sky' | 'violet' | 'rose';
}) {
    const [isHovered, setIsHovered] = useState(false);
    
    const colorConfig = {
        emerald: {
            gradient: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
            glow: 'bg-emerald-500',
            shadow: 'hover:shadow-emerald-500/10'
        },
        amber: {
            gradient: 'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
            glow: 'bg-amber-500',
            shadow: 'hover:shadow-amber-500/10'
        },
        sky: {
            gradient: 'from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10',
            glow: 'bg-sky-500',
            shadow: 'hover:shadow-sky-500/10'
        },
        violet: {
            gradient: 'from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10',
            glow: 'bg-violet-500',
            shadow: 'hover:shadow-violet-500/10'
        },
        rose: {
            gradient: 'from-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:to-pink-500/10',
            glow: 'bg-rose-500',
            shadow: 'hover:shadow-rose-500/10'
        },
    };

    const config = colorConfig[color];

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ 
                scale: 1.04, 
                y: -4, 
                transition: { type: 'spring', stiffness: 400, damping: 15 } 
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={cn(
                "group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-3 sm:p-6 shadow-xl backdrop-blur-xl transition-all dark:border-white/5",
                config.shadow
            )}
        >
            {/* Gradient Background */}
            <div className={cn("absolute inset-0 bg-gradient-to-br", config.gradient)} />
            
            {/* Animated Glow on Hover */}
            <motion.div
                initial={false}
                animate={{
                    scale: isHovered ? 1.5 : 1,
                    opacity: isHovered ? 0.4 : 0.2,
                }}
                transition={{ duration: 0.5 }}
                className={cn(
                    "absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl transition-all duration-500",
                    config.glow
                )}
            />
            
            {/* Content */}
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
                {/* PNG Icon with hover animation */}
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="relative flex shrink-0 h-10 w-10 sm:h-14 sm:w-14 items-center justify-center"
                >
                    <img 
                        src={icon} 
                        alt={label} 
                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" 
                    />
                </motion.div>
                
                <div>
                    <p className="text-[10px] sm:text-sm font-medium leading-tight text-neutral-500 dark:text-neutral-400">
                        {label}
                    </p>
                    <div className="mt-0.5 sm:mt-1">
                        <span className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white">
                            <AnimatedCounter value={value} suffix={suffix} />
                        </span>
                    </div>
                    <p className="text-[8px] sm:text-xs leading-tight text-neutral-400 mt-0.5">
                        {subtext}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
```


### STEP 8: UPDATE STATS CARDS USAGE

**REPLACE** stats cards section:

```tsx
{/* Quick Stats - ADMIN STYLE */}
<motion.div
    variants={containerVariants}
    className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-4"
>
    <StatCard 
        icon={hadirIcon} 
        label="Hadir" 
        value={stats.presentCount} 
        subtext="tepat waktu" 
        color="emerald" 
    />
    <StatCard 
        icon={terlambatIcon} 
        label="Terlambat" 
        value={stats.lateCount} 
        subtext="sesi" 
        color="amber" 
    />
    <StatCard 
        icon={ditolakIcon} 
        label="Ditolak" 
        value={stats.rejectedCount} 
        subtext="sesi" 
        color="rose" 
    />
    <StatCard 
        icon={totalIcon} 
        label="Target" 
        value={75} 
        suffix="%" 
        subtext="min. kehadiran" 
        color="violet" 
    />
</motion.div>
```

---

## 🎯 STEP 9: UPDATE CHART CONTAINERS (ADMIN STYLE)

### Course Summary Container

**BEFORE**:
```tsx
<motion.div
    variants={itemVariants}
    className="rounded-2xl border bg-white shadow-sm dark:border-gray-800 dark:bg-black/50 overflow-hidden"
>
```

**AFTER** (ADMIN STYLE):
```tsx
<motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.005 }}
    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
>
    <div className="p-6 border-b border-white/20 dark:border-white/5">
        <div className="flex items-center gap-3">
            <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20"
            >
                <BookOpen className="h-5 w-5 text-violet-500" />
            </motion.div>
            <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                Ringkasan per Mata Kuliah
            </h2>
        </div>
    </div>
    
    {/* Content */}
</motion.div>
```


### STEP 10: UPDATE COURSE SUMMARY ITEMS (SMOOTH HOVER)

**BEFORE**:
```tsx
<motion.div
    whileHover={{
        x: 3,
        scale: 1.005,
    }}
    className="p-4 cursor-pointer border-l-2 border-transparent hover:border-violet-500"
>
```

**AFTER** (ADMIN STYLE):
```tsx
<motion.div
    key={course.courseId}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 300,
        damping: 20
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
    <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-neutral-900 dark:text-white truncate max-w-[200px]">
            {course.courseName}
        </h3>
        <span className={cn(
            'px-2 py-1 rounded-full text-xs font-semibold',
            course.rate >= 75 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : course.rate >= 50 
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
        )}>
            {course.rate}%
        </span>
    </div>
    <Progress value={course.rate} className="h-2 mb-2" />
    <div className="flex gap-4 text-xs text-neutral-500">
        <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Hadir: {course.present}
        </span>
        <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Terlambat: {course.late}
        </span>
        <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Ditolak: {course.rejected}
        </span>
    </div>
</motion.div>
```


### STEP 11: UPDATE CHART CONTAINERS (BAR & LINE CHARTS)

**Bar Chart Container**:
```tsx
<motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.005 }}
    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
>
    <div className="p-6 border-b border-white/20 dark:border-white/5">
        <div className="flex items-center gap-3">
            <motion.div
                whileHover={{ scale: 1.2, rotate: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
            >
                <TrendingUp className="h-5 w-5 text-indigo-500" />
            </motion.div>
            <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                Grafik per Mata Kuliah
            </h2>
        </div>
    </div>
    <div className="p-6">
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={courseChartData}>
                <CartesianGrid 
                    strokeDasharray="3 3" 
                    className="stroke-neutral-200 dark:stroke-neutral-800" 
                />
                <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748b', fontSize: 11 }} 
                />
                <YAxis 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Hadir" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Terlambat" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Ditolak" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
</motion.div>
```

**Line Chart Container**:
```tsx
<motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.005 }}
    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
>
    <div className="p-6 border-b border-white/20 dark:border-white/5">
        <div className="flex items-center gap-3">
            <motion.div
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20"
            >
                <Calendar className="h-5 w-5 text-purple-500" />
            </motion.div>
            <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                Tren Kehadiran 6 Bulan Terakhir
            </h2>
        </div>
    </div>
    <div className="p-6">
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendChartData}>
                <CartesianGrid 
                    strokeDasharray="3 3" 
                    className="stroke-neutral-200 dark:stroke-neutral-800" 
                />
                <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <YAxis 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    domain={[0, 100]} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                    type="monotone" 
                    dataKey="Kehadiran" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    dot={{ r: 5 }} 
                />
            </LineChart>
        </ResponsiveContainer>
    </div>
</motion.div>
```


### STEP 12: UPDATE TOOLTIP (ADMIN STYLE)

**BEFORE**:
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

**AFTER** (ADMIN STYLE):
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
                    <div 
                        className="h-2.5 w-2.5 rounded-full" 
                        style={{ backgroundColor: entry.color }} 
                    />
                    <span className="text-neutral-600 dark:text-neutral-400">{entry.name}:</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{entry.value}</span>
                </div>
            ))}
        </motion.div>
    );
};
```

---

## 🎯 STEP 13: UPDATE EVALUATION DASHBOARD SECTION

**Wrap in glassmorphism containers**:

```tsx
<motion.div
    variants={containerVariants}
    className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
>
    {/* AI Insights */}
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
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                    AI Insights & Health
                </h2>
            </div>
            <EvaluationDashboard
                attendanceRate={stats.attendanceRate}
                totalSessions={stats.totalSessions}
                missedSessions={stats.totalSessions - stats.presentCount}
            />
        </motion.div>
    </div>
    
    {/* Simulator */}
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
                <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                    Simulator Kelulusan
                </h2>
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


### STEP 14: UPDATE RECENT ACTIVITY SECTION

**AFTER** (ADMIN STYLE):
```tsx
<motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.005 }}
    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
>
    <div className="p-6 border-b border-white/20 dark:border-white/5">
        <div className="flex items-center gap-3">
            <motion.div
                whileHover={{ scale: 1.2, rotate: -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20"
            >
                <Clock className="h-5 w-5 text-sky-500" />
            </motion.div>
            <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                Aktivitas Terakhir
            </h2>
        </div>
    </div>
    
    <div className="divide-y divide-white/10 dark:divide-white/5">
        {recentLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
                <div className="p-4 rounded-full bg-neutral-50 dark:bg-white/5">
                    <Clock className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
                </div>
                <div className="space-y-1">
                    <p className="font-medium text-neutral-900 dark:text-white">
                        Belum ada aktivitas
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
                        Aktivitas absensi dan perkuliahan kamu akan muncul di sini.
                    </p>
                </div>
            </div>
        ) : (
            recentLogs.map((log, index) => {
                const config = statusConfig[log.status as keyof typeof statusConfig] || statusConfig.rejected;
                const Icon = config.icon;
                return (
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
                        className="p-4 flex items-center gap-4 cursor-pointer"
                    >
                        <div className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-xl shadow-sm',
                            config.color
                        )}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                {log.courseName}
                            </p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                                {log.scannedAtFormatted}
                            </p>
                        </div>
                    </motion.div>
                );
            })
        )}
    </div>
</motion.div>
```


### STEP 15: UPDATE RIGHT SIDEBAR WIDGETS

**Distribution Pie Chart**:
```tsx
<motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.005 }}
    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
>
    <div className="p-6 border-b border-white/20 dark:border-white/5">
        <div className="flex items-center gap-3">
            <motion.div
                whileHover={{ scale: 1.2, y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20"
            >
                <Award className="h-5 w-5 text-amber-500" />
            </motion.div>
            <h2 className="font-bold text-lg text-neutral-900 dark:text-white">
                Distribusi Status
            </h2>
        </div>
    </div>
    <div className="p-6">
        <ResponsiveContainer width="100%" height={200}>
            <PieChart>
                <Pie
                    data={distribution.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    cornerRadius={4}
                >
                    {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
            </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2 flex-wrap">
            {distribution.filter(d => d.value > 0).map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-xs font-medium">
                    <div 
                        className="h-3 w-3 rounded-full shadow-sm" 
                        style={{ backgroundColor: entry.color }} 
                    />
                    <span className="text-neutral-600 dark:text-neutral-400">
                        {entry.name}: {entry.value}
                    </span>
                </div>
            ))}
        </div>
    </div>
</motion.div>
```

**Attendance Rate Card**:
```tsx
<motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.02, y: -3 }}
    transition={{ type: "spring", stiffness: 300, damping: 15 }}
    className="rounded-3xl border border-white/20 bg-gradient-to-br from-neutral-900 to-neutral-800 p-6 text-white shadow-xl dark:from-neutral-900 dark:to-black dark:border-white/5"
>
    <p className="text-sm text-neutral-400">Tingkat Kehadiran</p>
    <div className="flex items-end gap-2 mt-2">
        <span className="text-4xl font-bold tracking-tight">
            <AnimatedCounter value={stats.attendanceRate} suffix="%" />
        </span>
        {stats.attendanceRate >= 75 ? (
            <span className="text-emerald-400 text-sm mb-1 flex items-center gap-1 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full">
                <Zap className="h-3 w-3" /> Bagus!
            </span>
        ) : (
            <span className="text-amber-400 text-sm mb-1 font-medium bg-amber-400/10 px-2 py-0.5 rounded-full">
                Perlu ditingkatkan
            </span>
        )}
    </div>
    <Progress
        value={stats.attendanceRate}
        className="mt-4 h-2 bg-neutral-700/50"
    />
</motion.div>
```


**Weekly Streak Widget**:
```tsx
<motion.div
    variants={itemVariants}
    whileHover={{ scale: 1.02 }}
    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
>
    <div className="p-6">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                    Weekly Streak
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-neutral-900 dark:text-white">
                        {recentLogs.length > 0 ? '3' : '0'}
                    </span>
                    <span className="text-xs font-medium text-neutral-500">hari</span>
                </div>
            </div>
            <div className="p-2.5 bg-orange-100 rounded-xl dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <Zap className="h-5 w-5" />
            </div>
        </div>
        <div className="mt-4 flex gap-1">
            {[...Array(7)].map((_, i) => (
                <div 
                    key={i} 
                    className={cn(
                        "h-1.5 flex-1 rounded-full transition-all",
                        i < 3 
                            ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" 
                            : "bg-neutral-100 dark:bg-white/10"
                    )} 
                />
            ))}
        </div>
        <p className="mt-3 text-[10px] text-neutral-400 text-center">
            Pertahankan performa untuk badge "Rajin"!
        </p>
    </div>
</motion.div>
```

**Quick Links Widget**:
```tsx
<motion.div
    variants={itemVariants}
    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden"
>
    <div className="p-6 border-b border-white/20 dark:border-white/5">
        <h2 className="font-bold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Aksi Cepat
        </h2>
    </div>
    <div className="p-6 space-y-3">
        <Link href="/user/absen">
            <motion.div whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                <Button className="w-full justify-start bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 h-10">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Absen Sekarang
                </Button>
            </motion.div>
        </Link>
        <Link href="/user/history">
            <motion.div whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                <Button className="w-full justify-start bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 h-10">
                    <FileText className="h-4 w-4 mr-2" />
                    Laporan PDF
                </Button>
            </motion.div>
        </Link>
        <Link href="/user/profil">
            <motion.div whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }}>
                <Button className="w-full justify-start bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 h-10">
                    <Users className="h-4 w-4 mr-2" />
                    Profil Saya
                </Button>
            </motion.div>
        </Link>
    </div>
</motion.div>
```

---

## ✅ CHECKLIST IMPLEMENTASI LENGKAP

### Header Section
```
☐ Update gradient background: from-indigo-600 via-purple-600 to-pink-500
☐ Add animated background position
☐ Add overlay & glow orbs
☐ Replace 25 particles with 2 floating icons (FileText, Award)
☐ Update pulsating rings (3 rings, scale [1,3])
☐ Update header icon to PNG with drop-shadow
☐ Update text colors to indigo-100
☐ Update mini stats cards with shimmer effect
```

### Animation Variants
```
☐ Update containerVariants: staggerChildren: 0.04
☐ Update itemVariants: y: 30, stiffness: 300, damping: 20
☐ Update cardVariants: scale: 1.04, y: -4, stiffness: 400
☐ Remove rotateX and mass from all variants
```

### Stats Cards
```
☐ Import PNG icons from admin folders
☐ Add gradient background layer
☐ Add animated glow effect (scale & opacity on hover)
☐ Update hover animation: scale: 1.04, y: -4
☐ Add icon hover: scale: 1.1, rotate: 10
☐ Update text colors to neutral palette
☐ Add drop-shadow to PNG icons
```


### Container Updates
```
☐ Update ALL containers to: bg-white/40 dark:bg-neutral-900/40
☐ Add backdrop-blur-xl to ALL containers
☐ Update borders to: border-white/20 dark:border-white/5
☐ Change rounded-2xl to rounded-3xl
☐ Update shadow-sm to shadow-xl
☐ Add whileHover={{ scale: 1.005 }} to chart containers
```

### Chart Containers
```
☐ Update course summary container
☐ Update bar chart container
☐ Update line chart container
☐ Update pie chart container
☐ Add section headers with animated icons
☐ Update border-b to border-white/20 dark:border-white/5
☐ Update CartesianGrid stroke colors
☐ Update XAxis/YAxis tick colors to #64748b
```

### Tooltip
```
☐ Update to rounded-xl
☐ Add backdrop-blur-xl
☐ Update border to border-white/20
☐ Update bg to bg-white/95 dark:bg-neutral-900/95
☐ Update text colors to neutral palette
☐ Update dot size to h-2.5 w-2.5
```

### Course Summary Items
```
☐ Update hover animation: x: 5, scale: 1.01
☐ Add backgroundColor change on hover
☐ Change border-l-2 to border-l-4
☐ Add rounded-r-xl
☐ Update transition: stiffness: 300, damping: 20
☐ Update text colors to neutral palette
```

### Evaluation Section
```
☐ Wrap EvaluationDashboard in glassmorphism container
☐ Wrap WhatIfSimulator in glassmorphism container
☐ Add section headers with animated icons (Zap, Target)
☐ Add hover effects: scale: 1.005
☐ Update all borders and backgrounds
```

### Recent Activity
```
☐ Update container to glassmorphism style
☐ Add section header with animated Clock icon
☐ Update dividers to divide-white/10 dark:divide-white/5
☐ Add hover effects to log items: x: 5, backgroundColor change
☐ Update empty state styling
☐ Update text colors to neutral palette
```

### Right Sidebar Widgets
```
☐ Update distribution pie chart container
☐ Update attendance rate card (gradient background)
☐ Update weekly streak widget
☐ Update next achievement widget
☐ Update quick links widget
☐ All widgets use glassmorphism style
☐ All widgets have hover effects
```

### Warnings Widget
```
☐ Keep existing warning widget style (already good)
☐ Ensure border colors match: border-amber-200/70
☐ Ensure background matches: bg-gradient-to-br from-amber-50/50
```

### Testing
```
☐ Test all animations are smooth (no lag)
☐ Test hover effects on all cards
☐ Test responsive behavior on mobile (sm:, md:, lg:)
☐ Test dark mode consistency
☐ Test all border colors match admin
☐ Test backdrop-blur-xl works correctly
☐ Test PNG icons load correctly
☐ Test tooltip appears correctly
☐ Test chart interactions
☐ Test modal animations
```

---

## 📱 RESPONSIVE BREAKPOINTS (ADMIN STYLE)

### Mobile (< 640px)
```tsx
- Stats cards: p-3, h-10 w-10 icons, text-[10px], text-lg
- Header: p-6, h-20 w-20 icon
- Rounded: rounded-2xl
- Grid: grid-cols-2
- Gap: gap-3
```

### Tablet (640px - 1024px)
```tsx
- Stats cards: p-4, h-12 w-12 icons, text-xs, text-xl
- Header: p-7, h-22 w-22 icon
- Rounded: rounded-2xl sm:rounded-3xl
- Grid: sm:grid-cols-4
- Gap: sm:gap-4
```

### Desktop (> 1024px)
```tsx
- Stats cards: p-6, h-14 w-14 icons, text-sm, text-2xl
- Header: p-8, h-24 w-24 icon
- Rounded: rounded-3xl
- Grid: lg:grid-cols-3
- Gap: gap-6
```

---

## 🎨 COLOR REFERENCE LENGKAP

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

### Stats Card Gradients
```css
/* Emerald */
background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%);
glow: #10b981;
shadow: rgba(16, 185, 129, 0.1);

/* Sky */
background: linear-gradient(135deg, rgba(56, 189, 248, 0.05) 0%, rgba(79, 70, 229, 0.05) 100%);
glow: #0ea5e9;
shadow: rgba(14, 165, 233, 0.1);

/* Amber */
background: linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(249, 115, 22, 0.05) 100%);
glow: #f59e0b;
shadow: rgba(245, 158, 11, 0.1);

/* Rose */
background: linear-gradient(135deg, rgba(251, 113, 133, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%);
glow: #f43f5e;
shadow: rgba(244, 63, 94, 0.1);

/* Violet */
background: linear-gradient(135deg, rgba(167, 139, 250, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
glow: #a78bfa;
shadow: rgba(167, 139, 250, 0.1);
```

### Text Colors (Neutral Palette)
```css
/* Headings */
color: rgb(23, 23, 23); /* light */
color: rgb(255, 255, 255); /* dark */

/* Subtext */
color: rgb(115, 115, 115); /* light */
color: rgb(163, 163, 163); /* dark */

/* Muted */
color: rgb(163, 163, 163); /* light */
color: rgb(115, 115, 115); /* dark */
```


### Border & Divider Colors
```css
/* Main borders */
border-color: rgba(255, 255, 255, 0.2); /* light */
border-color: rgba(255, 255, 255, 0.05); /* dark */

/* Dividers */
border-color: rgba(255, 255, 255, 0.1); /* light */
border-color: rgba(255, 255, 255, 0.05); /* dark */
```

---

## 🔧 IMPORT STATEMENTS YANG DIPERLUKAN

```tsx
// PNG Icons
import rekapanIcon from '@/assets/admin/dashboard/hadir-icon.png';
import totalIcon from '@/assets/admin/dashboard/total-icon.png';
import hadirIcon from '@/assets/admin/dashboard/hadir-icon.png';
import terlambatIcon from '@/assets/admin/rekap-kehadiran/terlambat.png';
import ditolakIcon from '@/assets/admin/rekap-kehadiran/ditolak.png';

// Lucide Icons (for floating icons & section headers)
import {
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    FileText,
    TrendingUp,
    Users,
    XCircle,
    ChevronRight,
    Award,
    Zap,
    AlertTriangle,
    BellRing,
    Target,
    MessageSquareWarning,
    CheckCheck,
    Minimize2,
    Trophy,
    Sparkles,
    PartyPopper,
} from 'lucide-react';

// Components
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { EvaluationDashboard } from '@/components/student/evaluation-dashboard';
import { WhatIfSimulator } from '@/components/student/what-if-simulator';

// Recharts
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

// Framer Motion
import { motion, AnimatePresence } from 'framer-motion';

// Utils
import { cn } from '@/lib/utils';
```

---

## 📊 BEFORE & AFTER COMPARISON

### BEFORE (Current Rekapan)
```
❌ Header: Custom gradient with 25 particles
❌ Animations: stiffness: 100, damping: 15 (slow)
❌ Containers: bg-white/80 (not transparent enough)
❌ Borders: border-gray-800 (inconsistent)
❌ Stats cards: No gradient, no glow, no PNG icons
❌ Hover effects: Simple scale only
❌ Tooltips: Basic styling
❌ Course summary: Simple hover
❌ Chart containers: No glassmorphism
❌ Text colors: Mixed slate/gray palette
```

### AFTER (100% Matching Admin)
```
✅ Header: EXACT admin gradient with 2 floating icons
✅ Animations: stiffness: 300, damping: 20 (smooth & fast)
✅ Containers: bg-white/40 dark:bg-neutral-900/40 (perfect)
✅ Borders: border-white/20 dark:border-white/5 (consistent)
✅ Stats cards: Gradient + glow + PNG icons + drop-shadow
✅ Hover effects: scale: 1.04, y: -4, backgroundColor change
✅ Tooltips: Glassmorphism with backdrop-blur-xl
✅ Course summary: Smooth hover with backgroundColor
✅ Chart containers: Full glassmorphism style
✅ Text colors: Consistent neutral palette
```

---

## 🎉 SUMMARY

Prompt ini akan mengubah SEMUA aspek menu Rekapan Mahasiswa untuk 100% matching dengan Admin Dashboard:

### 1. HEADER (100% MATCH)
- ✅ Gradient background: from-indigo-600 via-purple-600 to-pink-500
- ✅ Animated background position
- ✅ 2 floating icons (FileText, Award)
- ✅ 3 pulsating rings
- ✅ PNG icon dengan drop-shadow
- ✅ Text colors: indigo-100
- ✅ Mini stats cards dengan shimmer effect

### 2. ANIMATIONS (SMOOTH & FAST)
- ✅ stiffness: 300, damping: 20
- ✅ staggerChildren: 0.04
- ✅ Card hover: scale: 1.04, y: -4
- ✅ Icon hover: scale: 1.1, rotate: 10

### 3. STATS CARDS (GLASSMORPHISM)
- ✅ PNG icons dari folder admin
- ✅ Gradient background layers
- ✅ Animated glow on hover
- ✅ Drop-shadow pada icons
- ✅ Neutral text colors

### 4. CONTAINERS (HITAM THEME)
- ✅ bg-white/40 dark:bg-neutral-900/40
- ✅ backdrop-blur-xl
- ✅ border-white/20 dark:border-white/5
- ✅ rounded-3xl
- ✅ shadow-xl

### 5. CHARTS (ADMIN STYLE)
- ✅ Glassmorphism containers
- ✅ Section headers dengan animated icons
- ✅ Tooltip dengan backdrop-blur-xl
- ✅ Consistent colors

### 6. COURSE SUMMARY (SMOOTH HOVER)
- ✅ x: 5, scale: 1.01
- ✅ backgroundColor change
- ✅ border-l-4
- ✅ rounded-r-xl

### 7. EVALUATION SECTION
- ✅ Wrapped in glassmorphism containers
- ✅ Section headers dengan icons
- ✅ Hover effects

### 8. RECENT ACTIVITY
- ✅ Glassmorphism container
- ✅ Animated section header
- ✅ Smooth hover effects
- ✅ Consistent dividers

### 9. RIGHT SIDEBAR
- ✅ All widgets glassmorphism style
- ✅ Consistent borders & backgrounds
- ✅ Hover effects
- ✅ Animated icons

### 10. RESPONSIVE
- ✅ Mobile: p-3, h-10 w-10, text-[10px]
- ✅ Tablet: p-4, h-12 w-12, text-xs
- ✅ Desktop: p-6, h-14 w-14, text-sm

---

**Created**: February 27, 2026  
**Purpose**: Rekapan Mahasiswa 100% Matching Admin Dashboard  
**Status**: Ready for implementation  
**Estimated Time**: 4-6 hours  
**Priority**: HIGH - Complete UI/UX consistency  
**Target File**: `resources/js/pages/user/rekapan.tsx`

---

## 🚀 NEXT STEPS

1. Backup file `resources/js/pages/user/rekapan.tsx`
2. Import semua PNG icons dari folder admin
3. Update animation variants
4. Update header section (gradient, icons, rings)
5. Update stats cards (glassmorphism + PNG icons)
6. Update all containers (colors, borders, backdrop-blur)
7. Update chart containers
8. Update tooltip
9. Update course summary items
10. Update evaluation section
11. Update recent activity
12. Update right sidebar widgets
13. Test responsive behavior
14. Test dark mode
15. Test all animations & hover effects

Menu Rekapan sekarang akan 100% IDENTIK dengan style Admin Dashboard! 🎨✨

