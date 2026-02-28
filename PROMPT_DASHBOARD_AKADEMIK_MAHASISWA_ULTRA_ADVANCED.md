# 🎓 PROMPT: DASHBOARD AKADEMIK MAHASISWA - ULTRA ADVANCED

## 📋 OVERVIEW

Prompt ini untuk membuat **Dashboard Akademik Mahasiswa** yang ultra advanced dengan UI/UX yang sangat polished dan 100% matching dengan **Dashboard Admin**. Dashboard ini adalah halaman utama akademik yang menampilkan overview lengkap: Jadwal Hari Ini, Tugas Mendatang, Nilai Terbaru, Kehadiran, dan Quick Actions.

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

## 🚀 DASHBOARD SECTIONS (8 MAJOR COMPONENTS)

### 1️⃣ HERO HEADER - Ultra Polished
### 2️⃣ QUICK STATS - 4 Cards dengan Animated Counter
### 3️⃣ JADWAL HARI INI - Timeline View
### 4️⃣ TUGAS MENDATANG - Priority List
### 5️⃣ NILAI TERBARU - Grade Cards
### 6️⃣ KEHADIRAN OVERVIEW - Attendance Chart
### 7️⃣ QUICK ACTIONS - Action Buttons
### 8️⃣ ACADEMIC CALENDAR - Mini Calendar

---

## 📦 FULL IMPLEMENTATION

```typescript
// File: resources/js/pages/user/akademik-dashboard.tsx

import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import StudentLayout from '@/layouts/student-layout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Calendar, Clock, TrendingUp, Award, CheckCircle,
    AlertTriangle, FileText, Users, Target, Zap, ArrowRight,
    Bell, Download, Share2, Plus, BarChart3, PieChart, Activity
} from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart as RePieChart, Pie, Cell
} from 'recharts';

// Icons
import akademikIcon from '@/assets/admin/akademik/akademik.png';
import jadwalIcon from '@/assets/admin/akademik/jadwal.png';
import tugasIcon from '@/assets/admin/informasi-tugas/total-tugas.png';
import nilaiIcon from '@/assets/admin/akademik/nilai.png';
import kehadiranIcon from '@/assets/admin/rekap-kehadiran/hadir.png';

interface JadwalToday {
    id: number;
    mata_kuliah: string;
    dosen: string;
    ruangan: string;
    waktu_mulai: string;
    waktu_selesai: string;
    status: 'upcoming' | 'ongoing' | 'completed';
}

interface TugasMendatang {
    id: number;
    judul: string;
    mata_kuliah: string;
    deadline: string;
    deadline_display: string;
    prioritas: 'tinggi' | 'sedang' | 'rendah';
    is_overdue: boolean;
    days_until_deadline: number;
}

interface NilaiTerbaru {
    id: number;
    mata_kuliah: string;
    jenis: string;
    nilai: number;
    grade: string;
    tanggal: string;
}

interface Stats {
    total_mata_kuliah: number;
    tugas_pending: number;
    rata_rata_nilai: number;
    persentase_kehadiran: number;
    jadwal_hari_ini: number;
    tugas_overdue: number;
}

interface Props {
    mahasiswa: { id: number; nama: string; nim: string; semester: number };
    stats: Stats;
    jadwal_today: JadwalToday[];
    tugas_mendatang: TugasMendatang[];
    nilai_terbaru: NilaiTerbaru[];
    kehadiran_chart: { labels: string[]; data: number[] };
}

export default function AkademikDashboard({
    mahasiswa,
    stats,
    jadwal_today,
    tugas_mendatang,
    nilai_terbaru,
    kehadiran_chart
}: Props) {
    const [selectedView, setSelectedView] = useState<'overview' | 'calendar' | 'analytics'>('overview');

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

    return (
        <StudentLayout>
            <Head title="Dashboard Akademik" />
            
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
            >
                {/* ═══════════════════════════════════════════════════ */}
                {/* 1️⃣ HERO HEADER - Ultra Polished                    */}
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

                    {/* Floating Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 0.6, 0],
                                    scale: [0, 1, 0],
                                    y: [0, -100],
                                    x: [0, Math.random() * 40 - 20],
                                }}
                                transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeOut"
                                }}
                                className="absolute"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${80 + Math.random() * 20}%`,
                                }}
                            >
                                <BookOpen className="h-3 w-3 text-white/40" />
                            </motion.div>
                        ))}
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                            {/* Left: Welcome Message */}
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                                        whileHover={{ scale: 1.15, rotate: 5 }}
                                        className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-4 ring-white/30"
                                    >
                                        <img src={akademikIcon} alt="Akademik" className="h-10 w-10 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]" />
                                    </motion.div>
                                    <div>
                                        <motion.p
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-sm text-white/90 font-medium"
                                        >
                                            Selamat Datang Kembali
                                        </motion.p>
                                        <motion.h1
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="text-3xl font-bold"
                                        >
                                            {mahasiswa.nama}
                                        </motion.h1>
                                    </div>
                                </div>
                                
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex items-center gap-4 flex-wrap"
                                >
                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30">
                                        <Users className="h-5 w-5" />
                                        <span className="font-bold text-sm">NIM: {mahasiswa.nim}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30">
                                        <BookOpen className="h-5 w-5" />
                                        <span className="font-bold text-sm">Semester {mahasiswa.semester}</span>
                                    </div>
                                </motion.div>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    className="mt-4 text-white/90 text-lg"
                                >
                                    Pantau progress akademik Anda dengan mudah dan terorganisir
                                </motion.p>
                            </div>

                            {/* Right: Quick Stats Mini */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7, type: 'spring' }}
                                className="grid grid-cols-2 gap-3"
                            >
                                {[
                                    { label: 'Jadwal Hari Ini', value: stats.jadwal_hari_ini, icon: Calendar },
                                    { label: 'Tugas Pending', value: stats.tugas_pending, icon: FileText },
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        className="bg-white/20 backdrop-blur-xl rounded-xl p-4 border border-white/30 min-w-[140px]"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <stat.icon className="h-5 w-5 text-white" />
                                            <p className="text-xs text-white/80 font-medium">{stat.label}</p>
                                        </div>
                                        <p className="text-3xl font-bold text-white">
                                            <AnimatedCounter value={stat.value} duration={1500} />
                                        </p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>

                        {/* View Toggle */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="mt-6 flex gap-2"
                        >
                            {[
                                { id: 'overview', label: 'Overview', icon: BarChart3 },
                                { id: 'calendar', label: 'Calendar', icon: Calendar },
                                { id: 'analytics', label: 'Analytics', icon: PieChart },
                            ].map((view) => (
                                <motion.button
                                    key={view.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedView(view.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                                        selectedView === view.id
                                            ? 'bg-white text-indigo-600'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                                >
                                    <view.icon className="h-4 w-4" />
                                    {view.label}
                                </motion.button>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* 2️⃣ QUICK STATS - 4 Cards                           */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    {[
                        { 
                            iconSrc: jadwalIcon, 
                            label: 'Mata Kuliah', 
                            value: stats.total_mata_kuliah, 
                            gradient: 'from-blue-400 to-indigo-600',
                            glow: 'bg-blue-500'
                        },
                        { 
                            iconSrc: tugasIcon, 
                            label: 'Tugas Pending', 
                            value: stats.tugas_pending, 
                            gradient: 'from-amber-400 to-orange-600',
                            glow: 'bg-amber-500',
                            alert: stats.tugas_overdue > 0
                        },
                        { 
                            iconSrc: nilaiIcon, 
                            label: 'Rata-rata Nilai', 
                            value: stats.rata_rata_nilai, 
                            suffix: '',
                            gradient: 'from-emerald-400 to-teal-600',
                            glow: 'bg-emerald-500'
                        },
                        { 
                            iconSrc: kehadiranIcon, 
                            label: 'Kehadiran', 
                            value: stats.persentase_kehadiran, 
                            suffix: '%',
                            gradient: 'from-purple-400 to-violet-600',
                            glow: 'bg-purple-500'
                        },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            variants={itemVariants}
                            whileHover={{ scale: 1.04, y: -4 }}
                            className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 cursor-pointer"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br from-slate-500/5 to-slate-500/10`} />
                            <motion.div
                                className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${stat.glow} blur-3xl transition-all duration-500 opacity-20 group-hover:opacity-40 group-hover:scale-150`}
                            />
                            
                            <div className="relative flex items-center gap-3">
                                <motion.div
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    className="relative flex h-14 w-14 items-center justify-center"
                                >
                                    <img src={stat.iconSrc} alt={stat.label} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]" />
                                </motion.div>
                                <div>
                                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">{stat.label}</p>
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        <AnimatedCounter value={stat.value} duration={1500} suffix={stat.suffix} />
                                    </p>
                                    {stat.alert && (
                                        <p className="text-xs text-red-600 dark:text-red-400 font-bold mt-1">
                                            {stats.tugas_overdue} overdue!
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* 3️⃣ JADWAL HARI INI - Timeline View                 */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Jadwal Hari Ini</h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {jadwal_today.length} kelas hari ini
                                </p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05, x: 2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.visit('/user/akademik/jadwal')}
                            className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                        >
                            Lihat Semua
                            <ArrowRight className="h-4 w-4" />
                        </motion.button>
                    </div>

                    <div className="space-y-4">
                        {jadwal_today.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 p-6">
                                    <Calendar className="h-12 w-12 text-neutral-400" />
                                </div>
                                <p className="text-lg font-bold text-neutral-900 dark:text-white">Tidak Ada Jadwal</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Tidak ada kelas yang dijadwalkan hari ini
                                </p>
                            </div>
                        ) : (
                            jadwal_today.map((jadwal, index) => {
                                const statusConfig = {
                                    upcoming: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', icon: Clock },
                                    ongoing: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', icon: Activity },
                                    completed: { bg: 'bg-neutral-50 dark:bg-neutral-800/20', text: 'text-neutral-600 dark:text-neutral-400', icon: CheckCircle },
                                };
                                const config = statusConfig[jadwal.status];
                                const StatusIcon = config.icon;

                                return (
                                    <motion.div
                                        key={jadwal.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        className={`relative flex items-start gap-4 rounded-2xl border border-white/20 p-4 ${config.bg} backdrop-blur-xl dark:border-white/5 cursor-pointer`}
                                        onClick={() => router.visit(`/user/akademik/jadwal/${jadwal.id}`)}
                                    >
                                        {/* Timeline Dot */}
                                        <div className="relative flex flex-col items-center">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${config.text} bg-white dark:bg-neutral-800 shadow-lg`}>
                                                <StatusIcon className="h-5 w-5" />
                                            </div>
                                            {index < jadwal_today.length - 1 && (
                                                <div className="mt-2 h-full w-0.5 bg-gradient-to-b from-neutral-300 to-transparent dark:from-neutral-700" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h3 className="font-bold text-neutral-900 dark:text-white">
                                                    {jadwal.mata_kuliah}
                                                </h3>
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${config.bg} ${config.text} border border-current/20`}>
                                                    {jadwal.status === 'upcoming' && 'Akan Datang'}
                                                    {jadwal.status === 'ongoing' && 'Sedang Berlangsung'}
                                                    {jadwal.status === 'completed' && 'Selesai'}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{jadwal.waktu_mulai} - {jadwal.waktu_selesai}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4" />
                                                    <span>{jadwal.dosen}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Target className="h-4 w-4" />
                                                    <span>{jadwal.ruangan}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* 4️⃣ TUGAS MENDATANG - Priority List                  */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Tugas Mendatang</h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {tugas_mendatang.length} tugas perlu diselesaikan
                                </p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05, x: 2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.visit('/user/tugas')}
                            className="flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700"
                        >
                            Lihat Semua
                            <ArrowRight className="h-4 w-4" />
                        </motion.button>
                    </div>

                    <div className="space-y-3">
                        {tugas_mendatang.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 p-6">
                                    <CheckCircle className="h-12 w-12 text-emerald-500" />
                                </div>
                                <p className="text-lg font-bold text-neutral-900 dark:text-white">Semua Tugas Selesai!</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Tidak ada tugas yang perlu dikerjakan saat ini
                                </p>
                            </div>
                        ) : (
                            tugas_mendatang.slice(0, 5).map((tugas, index) => {
                                const priorityConfig = {
                                    tinggi: { bg: 'from-red-500 to-rose-600', text: 'text-red-600', icon: AlertTriangle },
                                    sedang: { bg: 'from-amber-500 to-orange-600', text: 'text-amber-600', icon: Clock },
                                    rendah: { bg: 'from-blue-500 to-indigo-600', text: 'text-blue-600', icon: FileText },
                                };
                                const config = priorityConfig[tugas.prioritas];
                                const PriorityIcon = config.icon;

                                return (
                                    <motion.div
                                        key={tugas.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.08 }}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 p-4 shadow-lg backdrop-blur-xl dark:border-white/5 cursor-pointer"
                                        onClick={() => router.visit(`/user/tugas/${tugas.id}`)}
                                    >
                                        {/* Priority Indicator */}
                                        <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${config.bg}`} />
                                        
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${config.bg} text-white`}>
                                                        <PriorityIcon className="h-3 w-3" />
                                                        {tugas.prioritas.toUpperCase()}
                                                    </span>
                                                    {tugas.is_overdue && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            OVERDUE
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <h3 className="font-bold text-neutral-900 dark:text-white mb-1 line-clamp-2">
                                                    {tugas.judul}
                                                </h3>
                                                
                                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                                                    {tugas.mata_kuliah}
                                                </p>

                                                <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{tugas.deadline_display}</span>
                                                    </div>
                                                    <div className={`flex items-center gap-1 font-bold ${tugas.days_until_deadline <= 2 ? 'text-red-600 dark:text-red-400' : ''}`}>
                                                        <Clock className="h-3 w-3" />
                                                        <span>{tugas.days_until_deadline} hari lagi</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                className="flex-shrink-0"
                                            >
                                                <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* 5️⃣ NILAI TERBARU - Grade Cards                      */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
                                <Award className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Nilai Terbaru</h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {nilai_terbaru.length} nilai baru
                                </p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05, x: 2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.visit('/user/akademik/nilai')}
                            className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                        >
                            Lihat Semua
                            <ArrowRight className="h-4 w-4" />
                        </motion.button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {nilai_terbaru.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                                <div className="mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 p-6">
                                    <Award className="h-12 w-12 text-neutral-400" />
                                </div>
                                <p className="text-lg font-bold text-neutral-900 dark:text-white">Belum Ada Nilai</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Nilai akan muncul setelah dosen melakukan penilaian
                                </p>
                            </div>
                        ) : (
                            nilai_terbaru.slice(0, 6).map((nilai, index) => {
                                const gradeConfig = {
                                    'A': { bg: 'from-emerald-500 to-teal-600', text: 'text-emerald-600' },
                                    'B': { bg: 'from-blue-500 to-indigo-600', text: 'text-blue-600' },
                                    'C': { bg: 'from-amber-500 to-orange-600', text: 'text-amber-600' },
                                    'D': { bg: 'from-orange-500 to-red-600', text: 'text-orange-600' },
                                    'E': { bg: 'from-red-500 to-rose-600', text: 'text-red-600' },
                                };
                                const config = gradeConfig[nilai.grade as keyof typeof gradeConfig] || gradeConfig['C'];

                                return (
                                    <motion.div
                                        key={nilai.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.08 }}
                                        whileHover={{ scale: 1.04, y: -4 }}
                                        className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 p-5 shadow-lg backdrop-blur-xl dark:border-white/5"
                                    >
                                        {/* Grade Badge */}
                                        <div className="absolute top-4 right-4">
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${config.bg} text-white shadow-xl`}
                                            >
                                                <span className="text-3xl font-bold">{nilai.grade}</span>
                                            </motion.div>
                                        </div>

                                        <div className="pr-20">
                                            <h3 className="font-bold text-neutral-900 dark:text-white mb-1 line-clamp-2">
                                                {nilai.mata_kuliah}
                                            </h3>
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                                                {nilai.jenis}
                                            </p>

                                            <div className="flex items-center gap-3">
                                                <div className={`text-3xl font-bold ${config.text}`}>
                                                    {nilai.nilai}
                                                </div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    <Calendar className="h-3 w-3 inline mr-1" />
                                                    {nilai.tanggal}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* 6️⃣ KEHADIRAN OVERVIEW - Attendance Chart            */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Kehadiran Overview</h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Statistik kehadiran 7 hari terakhir
                                </p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05, x: 2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.visit('/user/rekapan')}
                            className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700"
                        >
                            Lihat Detail
                            <ArrowRight className="h-4 w-4" />
                        </motion.button>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={kehadiran_chart.labels.map((label, i) => ({
                                name: label,
                                kehadiran: kehadiran_chart.data[i]
                            }))}>
                                <defs>
                                    <linearGradient id="colorKehadiran" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-800" />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickLine={{ stroke: '#64748b' }}
                                />
                                <YAxis 
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickLine={{ stroke: '#64748b' }}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: '12px',
                                        padding: '12px'
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="kehadiran" 
                                    stroke="#8b5cf6" 
                                    strokeWidth={3}
                                    fill="url(#colorKehadiran)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4 text-center">
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">Hadir</p>
                            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                {Math.round(stats.persentase_kehadiran)}%
                            </p>
                        </div>
                        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-4 text-center">
                            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-1">Target</p>
                            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">85%</p>
                        </div>
                        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 text-center">
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">Minggu Ini</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                {stats.jadwal_hari_ini}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* 7️⃣ QUICK ACTIONS - Action Buttons                   */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Quick Actions</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Akses cepat ke fitur penting
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { 
                                icon: Calendar, 
                                label: 'Jadwal Kuliah', 
                                href: '/user/akademik/jadwal',
                                gradient: 'from-blue-500 to-indigo-600',
                                description: 'Lihat jadwal lengkap'
                            },
                            { 
                                icon: FileText, 
                                label: 'Tugas', 
                                href: '/user/tugas',
                                gradient: 'from-amber-500 to-orange-600',
                                description: 'Kelola tugas kuliah'
                            },
                            { 
                                icon: Award, 
                                label: 'Nilai', 
                                href: '/user/akademik/nilai',
                                gradient: 'from-emerald-500 to-teal-600',
                                description: 'Cek nilai & IPK'
                            },
                            { 
                                icon: BookOpen, 
                                label: 'Catatan', 
                                href: '/user/akademik/catatan',
                                gradient: 'from-purple-500 to-violet-600',
                                description: 'Buat catatan kuliah'
                            },
                        ].map((action, index) => (
                            <motion.button
                                key={action.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.08 }}
                                whileHover={{ scale: 1.05, y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => router.visit(action.href)}
                                className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 p-5 shadow-lg backdrop-blur-xl dark:border-white/5 text-left"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                                
                                <div className="relative">
                                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-lg`}>
                                        <action.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-bold text-neutral-900 dark:text-white mb-1">
                                        {action.label}
                                    </h3>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {action.description}
                                    </p>
                                </div>

                                <motion.div
                                    className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                    whileHover={{ x: 2 }}
                                >
                                    <ArrowRight className="h-5 w-5 text-neutral-400" />
                                </motion.div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* ═══════════════════════════════════════════════════ */}
                {/* 8️⃣ ACADEMIC CALENDAR - Mini Calendar                */}
                {/* ═══════════════════════════════════════════════════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Kalender Akademik</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Event & deadline penting bulan ini
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {[
                            { date: '15 Mar', title: 'UTS Matematika', type: 'exam', color: 'red' },
                            { date: '18 Mar', title: 'Deadline Tugas Pemrograman', type: 'assignment', color: 'amber' },
                            { date: '22 Mar', title: 'Presentasi Kelompok', type: 'presentation', color: 'blue' },
                            { date: '25 Mar', title: 'Libur Nasional', type: 'holiday', color: 'emerald' },
                        ].map((event, index) => {
                            const colorConfig = {
                                red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
                                amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
                                blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
                                emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
                            };
                            const config = colorConfig[event.color as keyof typeof colorConfig];

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.08 }}
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    className={`flex items-center gap-4 rounded-2xl border ${config.border} ${config.bg} p-4 backdrop-blur-xl cursor-pointer`}
                                >
                                    <div className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl ${config.text} bg-white dark:bg-neutral-800 shadow-lg`}>
                                        <span className="text-xs font-medium">{event.date.split(' ')[1]}</span>
                                        <span className="text-2xl font-bold">{event.date.split(' ')[0]}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-neutral-900 dark:text-white">
                                            {event.title}
                                        </h3>
                                        <p className={`text-xs ${config.text} font-medium mt-1`}>
                                            {event.type === 'exam' && '📝 Ujian'}
                                            {event.type === 'assignment' && '📋 Tugas'}
                                            {event.type === 'presentation' && '🎤 Presentasi'}
                                            {event.type === 'holiday' && '🎉 Libur'}
                                        </p>
                                    </div>
                                    <Bell className={`h-5 w-5 ${config.text}`} />
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-4 w-full rounded-xl border border-white/20 bg-white/60 dark:bg-neutral-800/60 py-3 text-sm font-bold text-neutral-700 dark:text-neutral-300 backdrop-blur-xl hover:bg-white/80 dark:hover:bg-neutral-800/80 transition-colors"
                    >
                        Lihat Kalender Lengkap
                    </motion.button>
                </motion.div>
            </motion.div>
        </StudentLayout>
    );
}
```

---

## 🔧 BACKEND IMPLEMENTATION

### Controller: `app/Http/Controllers/User/AkademikDashboardController.php`

```php
<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AkademikDashboardController extends Controller
{
    public function index()
    {
        $mahasiswa = auth()->user();
        
        // Stats
        $stats = [
            'total_mata_kuliah' => $mahasiswa->courses()->count(),
            'tugas_pending' => $mahasiswa->assignments()
                ->where('status', '!=', 'completed')
                ->count(),
            'rata_rata_nilai' => $mahasiswa->grades()->avg('nilai') ?? 0,
            'persentase_kehadiran' => $this->calculateAttendanceRate($mahasiswa),
            'jadwal_hari_ini' => $this->getTodayScheduleCount($mahasiswa),
            'tugas_overdue' => $mahasiswa->assignments()
                ->where('deadline', '<', now())
                ->where('status', '!=', 'completed')
                ->count(),
        ];

        // Jadwal Hari Ini
        $jadwal_today = $this->getTodaySchedule($mahasiswa);

        // Tugas Mendatang
        $tugas_mendatang = $this->getUpcomingAssignments($mahasiswa);

        // Nilai Terbaru
        $nilai_terbaru = $this->getRecentGrades($mahasiswa);

        // Kehadiran Chart
        $kehadiran_chart = $this->getAttendanceChart($mahasiswa);

        return Inertia::render('user/akademik-dashboard', [
            'mahasiswa' => [
                'id' => $mahasiswa->id,
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
                'semester' => $mahasiswa->semester ?? 1,
            ],
            'stats' => $stats,
            'jadwal_today' => $jadwal_today,
            'tugas_mendatang' => $tugas_mendatang,
            'nilai_terbaru' => $nilai_terbaru,
            'kehadiran_chart' => $kehadiran_chart,
        ]);
    }

    private function calculateAttendanceRate($mahasiswa)
    {
        $totalSessions = $mahasiswa->attendanceLogs()->count();
        if ($totalSessions === 0) return 0;

        $presentCount = $mahasiswa->attendanceLogs()
            ->whereIn('status', ['present', 'late'])
            ->count();

        return round(($presentCount / $totalSessions) * 100, 1);
    }

    private function getTodayScheduleCount($mahasiswa)
    {
        $today = Carbon::now()->format('l'); // Monday, Tuesday, etc.
        
        return $mahasiswa->schedules()
            ->where('day', strtolower($today))
            ->count();
    }

    private function getTodaySchedule($mahasiswa)
    {
        $today = Carbon::now()->format('l');
        $now = Carbon::now();

        return $mahasiswa->schedules()
            ->where('day', strtolower($today))
            ->with(['course', 'dosen'])
            ->get()
            ->map(function ($schedule) use ($now) {
                $startTime = Carbon::parse($schedule->time);
                $endTime = Carbon::parse($schedule->schedule_time_end);

                $status = 'upcoming';
                if ($now->between($startTime, $endTime)) {
                    $status = 'ongoing';
                } elseif ($now->greaterThan($endTime)) {
                    $status = 'completed';
                }

                return [
                    'id' => $schedule->id,
                    'mata_kuliah' => $schedule->course->nama,
                    'dosen' => $schedule->dosen->nama ?? 'TBA',
                    'ruangan' => $schedule->ruangan ?? 'Online',
                    'waktu_mulai' => $startTime->format('H:i'),
                    'waktu_selesai' => $endTime->format('H:i'),
                    'status' => $status,
                ];
            });
    }

    private function getUpcomingAssignments($mahasiswa)
    {
        return $mahasiswa->assignments()
            ->where('deadline', '>=', now())
            ->where('status', '!=', 'completed')
            ->with('course')
            ->orderBy('deadline', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($assignment) {
                $deadline = Carbon::parse($assignment->deadline);
                $daysUntil = now()->diffInDays($deadline, false);

                return [
                    'id' => $assignment->id,
                    'judul' => $assignment->judul,
                    'mata_kuliah' => $assignment->course->nama,
                    'deadline' => $assignment->deadline,
                    'deadline_display' => $deadline->format('d M Y'),
                    'prioritas' => $assignment->prioritas ?? 'sedang',
                    'is_overdue' => $deadline->isPast(),
                    'days_until_deadline' => max(0, $daysUntil),
                ];
            });
    }

    private function getRecentGrades($mahasiswa)
    {
        return $mahasiswa->grades()
            ->with('course')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($grade) {
                return [
                    'id' => $grade->id,
                    'mata_kuliah' => $grade->course->nama,
                    'jenis' => $grade->jenis ?? 'UTS',
                    'nilai' => $grade->nilai,
                    'grade' => $this->calculateGrade($grade->nilai),
                    'tanggal' => Carbon::parse($grade->created_at)->format('d M Y'),
                ];
            });
    }

    private function calculateGrade($nilai)
    {
        if ($nilai >= 85) return 'A';
        if ($nilai >= 70) return 'B';
        if ($nilai >= 60) return 'C';
        if ($nilai >= 50) return 'D';
        return 'E';
    }

    private function getAttendanceChart($mahasiswa)
    {
        $last7Days = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $count = $mahasiswa->attendanceLogs()
                ->whereDate('created_at', $date)
                ->whereIn('status', ['present', 'late'])
                ->count();

            $last7Days->push([
                'label' => $date->format('D'),
                'data' => $count,
            ]);
        }

        return [
            'labels' => $last7Days->pluck('label')->toArray(),
            'data' => $last7Days->pluck('data')->toArray(),
        ];
    }
}
```

---

## 📝 ROUTES

Tambahkan di `routes/web.php`:

```php
// Akademik Dashboard
Route::middleware(['auth', 'role:mahasiswa'])->group(function () {
    Route::get('/user/akademik', [AkademikDashboardController::class, 'index'])
        ->name('user.akademik.dashboard');
});
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Setup & Hero Header (2 hours)
- [ ] Create controller `AkademikDashboardController.php`
- [ ] Create page `akademik-dashboard.tsx`
- [ ] Implement Hero Header dengan animated gradient
- [ ] Add floating particles animation
- [ ] Setup routing

### Phase 2: Quick Stats Cards (2 hours)
- [ ] Implement 4 stats cards dengan PNG icons
- [ ] Add AnimatedCounter component
- [ ] Add hover animations (scale 1.04, y: -4)
- [ ] Add glow effects

### Phase 3: Jadwal Hari Ini (3 hours)
- [ ] Implement timeline view dengan status indicators
- [ ] Add status logic (upcoming, ongoing, completed)
- [ ] Add empty state
- [ ] Backend: getTodaySchedule method

### Phase 4: Tugas Mendatang (3 hours)
- [ ] Implement priority list dengan color coding
- [ ] Add overdue indicators
- [ ] Add days until deadline counter
- [ ] Backend: getUpcomingAssignments method

### Phase 5: Nilai Terbaru (2 hours)
- [ ] Implement grade cards dengan letter grades
- [ ] Add grade color coding (A-E)
- [ ] Add empty state
- [ ] Backend: getRecentGrades method

### Phase 6: Kehadiran Overview (3 hours)
- [ ] Implement Recharts AreaChart
- [ ] Add 7-day attendance data
- [ ] Add summary stats cards
- [ ] Backend: getAttendanceChart method

### Phase 7: Quick Actions (2 hours)
- [ ] Implement 4 action buttons
- [ ] Add gradient backgrounds
- [ ] Add hover effects
- [ ] Link to respective pages

### Phase 8: Academic Calendar (2 hours)
- [ ] Implement mini calendar dengan events
- [ ] Add event type indicators
- [ ] Add color coding per event type
- [ ] Add "Lihat Kalender Lengkap" button

### Phase 9: Backend Integration (3 hours)
- [ ] Complete all controller methods
- [ ] Add database queries optimization
- [ ] Add caching for stats
- [ ] Test all data flows

### Phase 10: Testing & Polish (2 hours)
- [ ] Test all animations
- [ ] Test responsive design
- [ ] Test dark mode
- [ ] Performance optimization
- [ ] Cross-browser testing

---

## 🎯 SUCCESS METRICS

1. **Performance**: Page load < 2 seconds
2. **Animations**: Smooth 60fps animations
3. **Responsive**: Perfect di mobile, tablet, desktop
4. **Dark Mode**: 100% support
5. **Admin Matching**: 100% color & animation matching

---

## ⏱️ ESTIMATED TIME

**Total: 24 hours** (3 hari kerja)

- Phase 1-2: 4 hours (Day 1 morning)
- Phase 3-4: 6 hours (Day 1 afternoon + evening)
- Phase 5-6: 5 hours (Day 2 morning)
- Phase 7-8: 4 hours (Day 2 afternoon)
- Phase 9-10: 5 hours (Day 3)

---

## 🚀 PRIORITY LEVEL

**HIGH PRIORITY** - Dashboard akademik adalah halaman utama untuk mahasiswa melihat overview lengkap akademik mereka.

---

## 📌 NOTES

1. Semua warna, animasi, dan UI HARUS 100% matching dengan admin dashboard
2. Gunakan PNG icons yang sudah ada di assets
3. Semua container WAJIB: `bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl`
4. Semua animasi WAJIB: `stiffness: 300, damping: 20`
5. Gradient header WAJIB: `from-indigo-600 via-purple-600 to-pink-500`
6. Test di dark mode dan light mode
7. Pastikan responsive di semua device
8. Optimize query untuk performance
