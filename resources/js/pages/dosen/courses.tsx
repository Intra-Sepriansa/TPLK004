import { Head, Link, router } from '@inertiajs/react';
import DosenLayout from '@/layouts/dosen-layout';
import { BookOpen, Users, Calendar, TrendingUp, ChevronRight, Search, BarChart3, Clock, Target, Plus, Download, Settings, Eye, Play, Pause, X, Sparkles, AlertTriangle, Grid, List, CheckCircle, XCircle, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import CourseImg from '@/assets/dosen/matakuliah/mata-kuliah.png';
import StatTotalStudents from '@/assets/dosen/dashboard/stat-total-students.png';
import StatTotalSessions from '@/assets/dosen/dashboard/stat-total-sessions.png';
import StatAttendanceRate from '@/assets/dosen/dashboard/stat-attendance-rate.png';
import TotalHadirIcon from '@/assets/admin/live-monitor/hadir-icon.png';

interface Course {
    id: number;
    nama: string;
    kode: string;
    sks: number;
    totalSessions: number;
    activeSessions: number;
    totalStudents: number;
    attendanceRate: number;
    lateCount: number;
    lowAttendanceStudents: number;
    latestSession: string | null;
}

interface Stats {
    totalCourses: number;
    totalHadir: number;
    totalStudents: number;
    totalSessions: number;
    activeSessions: number;
    avgAttendanceRate: number;
    lowAttendanceStudents: number;
}

interface PageProps {
    dosen: { id: number; nama: string; nidn: string };
    courses: Course[];
    stats: Stats;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
} as const;

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
    hover: { scale: 1.03, y: -8, transition: { type: 'spring' as const, stiffness: 400, damping: 10 } },
} as const;

export default function DosenCourses({ dosen, courses, stats }: PageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'students' | 'attendance' | 'sessions'>('name');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState<'all' | 'high'>('all');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [detailTab, setDetailTab] = useState<'overview' | 'students' | 'sessions'>('overview');

    const filteredCourses = useMemo(() => {
        return courses
            .filter(c => {
                const matchSearch = c.nama.toLowerCase().includes(searchQuery.toLowerCase()) || c.kode.toLowerCase().includes(searchQuery.toLowerCase());
                const matchTab = activeTab === 'all' ||
                    (activeTab === 'high' && c.attendanceRate >= 80);
                return matchSearch && matchTab;
            })
            .sort((a, b) => {
                if (sortBy === 'name') return a.nama.localeCompare(b.nama);
                if (sortBy === 'students') return b.totalStudents - a.totalStudents;
                if (sortBy === 'attendance') return b.attendanceRate - a.attendanceRate;
                if (sortBy === 'sessions') return b.totalSessions - a.totalSessions;
                return 0;
            });
    }, [courses, searchQuery, sortBy, activeTab]);

    const summaryCards = [
        { key: 'total', imgSrc: TotalHadirIcon, label: 'Total Hadir', value: stats.totalHadir, sub: 'Semua sesi rute ini', gradient: 'from-blue-400 to-cyan-600', glow: 'bg-blue-500', shadow: 'hover:shadow-blue-500/10' },
        { key: 'students', imgSrc: StatTotalStudents, label: 'Total Mahasiswa', value: stats.totalStudents, sub: 'Semua Status', gradient: 'from-emerald-400 to-teal-600', glow: 'bg-emerald-500', shadow: 'hover:shadow-emerald-500/10' },
        { key: 'sessions', imgSrc: StatTotalSessions, label: 'Total Sesi', value: stats.totalSessions, sub: `${stats.activeSessions} aktif`, gradient: 'from-violet-400 to-purple-600', glow: 'bg-violet-500', shadow: 'hover:shadow-violet-500/10', pulse: false },
        { key: 'rate', imgSrc: StatAttendanceRate, label: 'Rata-rata Kehadiran', value: stats.avgAttendanceRate, suffix: '%', sub: 'Tingkat kehadiran', gradient: 'from-amber-400 to-orange-600', glow: 'bg-amber-500', shadow: 'hover:shadow-amber-500/10' },
    ];

    const tabs = [
        { key: 'all' as const, label: 'Semua Mata Kuliah', count: courses.length },
        { key: 'high' as const, label: 'Kehadiran Tinggi', count: courses.filter(c => c.attendanceRate >= 80).length },
    ];

    return (
        <DosenLayout>
            <Head title="Mata Kuliah" />
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-6 space-y-6">

                {/* ═══════ HEADER — Kas Admin Style ═══════ */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Ripple animation removed */}

                    <div className="relative">
                        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left w-full lg:w-auto">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    className="h-20 w-20 sm:h-24 sm:w-24 drop-shadow-2xl flex-shrink-0"
                                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                                >
                                    <img src={CourseImg} alt="Mata Kuliah" className="h-full w-full object-contain" />
                                </motion.div>
                                <div className="flex-1 mt-1 sm:mt-0">
                                    <motion.p className="text-sm text-indigo-100 font-medium tracking-wide"
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                                        Manajemen Mata Kuliah
                                    </motion.p>
                                    <motion.h1 className="text-2xl sm:text-3xl font-bold text-white mt-1"
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                                        Mata Kuliah
                                    </motion.h1>
                                    <motion.p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                                        Kelola mata kuliah dan monitor performa kelas Anda
                                    </motion.p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center lg:items-end gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}
                                    className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg border border-white/10">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg"><Sparkles className="h-6 w-6 text-white" /></div>
                                    <div>
                                        <p className="text-xs text-indigo-100">Total Hadir</p>
                                        <p className="text-2xl font-bold text-white">{stats.totalHadir}</p>
                                    </div>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                    className="flex flex-wrap justify-center gap-2">
                                    {[
                                        { icon: Download, label: 'Export', href: '/dosen/rekapan' },
                                        { icon: BarChart3, label: 'Analytics', href: '/dosen/class-insights' },
                                        { icon: Settings, label: 'Pengaturan', href: '/dosen/settings' },
                                    ].map(btn => (
                                        <Link key={btn.label} href={btn.href}>
                                            <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }}
                                                className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg transition-all hover:bg-white/30">
                                                <btn.icon className="h-4 w-4" /> {btn.label}
                                            </motion.button>
                                        </Link>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ SUMMARY CARDS ═══════ */}
                <motion.div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
                    initial="hidden" animate="visible"
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.2 } } }}
                >
                    {summaryCards.map((card, i) => {
                        const colorMap: Record<string, any> = {
                            'bg-violet-500': { from: 'from-violet-400', to: 'to-purple-600', gradientBg: 'from-violet-500/5 to-purple-500/5', hoverShadow: 'hover:shadow-violet-500/10' },
                            'bg-blue-500': { from: 'from-blue-400', to: 'to-indigo-600', gradientBg: 'from-blue-500/5 to-indigo-500/5', hoverShadow: 'hover:shadow-blue-500/10' },
                            'bg-emerald-500': { from: 'from-emerald-400', to: 'to-teal-600', gradientBg: 'from-emerald-500/5 to-teal-500/5', hoverShadow: 'hover:shadow-emerald-500/10' },
                            'bg-amber-500': { from: 'from-amber-400', to: 'to-orange-600', gradientBg: 'from-amber-500/5 to-orange-500/5', hoverShadow: 'hover:shadow-amber-500/10' },
                        };
                        const cc = colorMap[card.glow] || colorMap['bg-blue-500'];
                        return (
                            <motion.div key={card.key}
                                variants={{ hidden: { opacity: 0, y: 30, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } } }}
                                whileHover={{ y: -5, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                                onHoverStart={() => setHoveredCard(card.key)} onHoverEnd={() => setHoveredCard(null)}
                                className={cn(`group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-4 sm:p-5 shadow-xl backdrop-blur-xl transition-all dark:border-white/5`, cc.hoverShadow)}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${cc.gradientBg} opacity-50 dark:opacity-100`} />
                                <motion.div className={cn(`absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl transition-all`, card.glow)} animate={{ opacity: hoveredCard === card.key ? 0.4 : 0.15 }} />
                                <div className="relative z-10 flex flex-col items-center sm:items-start gap-3 h-full justify-between">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
                                        <motion.div whileHover={{ scale: 1.1, rotate: 10 }} className="relative flex shrink-0 h-10 w-10 sm:h-12 sm:w-12 items-center justify-center">
                                            <img src={card.imgSrc} alt={card.label} className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" />
                                        </motion.div>
                                        <div>
                                            <p className="text-[10px] sm:text-xs font-medium text-neutral-500 dark:text-neutral-400">{card.label}</p>
                                            <span className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                                                <AnimatedCounter value={card.value} suffix={card.suffix} duration={1500} />
                                            </span>
                                            <p className="hidden sm:block text-[10px] text-neutral-400 mt-0.5">{card.sub}</p>
                                        </div>
                                    </div>
                                    <div className="mt-auto w-full pt-2">
                                        <div className="h-1.5 w-full bg-slate-200/50 dark:bg-slate-800/80 rounded-full overflow-hidden">
                                            <motion.div className={`h-full bg-gradient-to-r ${cc.from} ${cc.to} rounded-full`}
                                                initial={{ width: 0 }} animate={{ width: card.suffix === '%' ? `${card.value}%` : '70%' }}
                                                transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: 'easeOut' }} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══════ FILTERS & SEARCH ═══════ */}
                <motion.div variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input type="text" placeholder="Cari mata kuliah atau kode..."
                                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-white/30 bg-white/70 dark:bg-neutral-800/70 py-2.5 pl-11 pr-10 text-sm shadow-sm backdrop-blur-lg transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-white/10 dark:text-white" />
                            <AnimatePresence>
                                {searchQuery && (
                                    <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                                        <X className="h-4 w-4" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                            className="rounded-xl border border-white/30 bg-white/70 dark:bg-neutral-800/70 px-4 py-2.5 text-sm shadow-sm backdrop-blur-lg dark:border-white/10 dark:text-white focus:ring-2 focus:ring-indigo-500">
                            <option value="name">Urutkan: Nama</option>
                            <option value="students">Urutkan: Mahasiswa</option>
                            <option value="attendance">Urutkan: Kehadiran</option>
                            <option value="sessions">Urutkan: Sesi</option>
                        </select>

                        <div className="flex items-center rounded-xl border border-white/30 bg-white/70 dark:bg-neutral-800/70 p-1 shadow-sm backdrop-blur-lg dark:border-white/10">
                            {[
                                { mode: 'grid' as const, icon: Grid },
                                { mode: 'list' as const, icon: List },
                            ].map(v => (
                                <motion.button key={v.mode} onClick={() => setViewMode(v.mode)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className={cn("rounded-lg p-2 transition-all", viewMode === v.mode ? "bg-indigo-500 text-white shadow" : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400")}>
                                    <v.icon className="h-4 w-4" />
                                </motion.button>
                            ))}
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-neutral-400">Menampilkan {filteredCourses.length} dari {courses.length} mata kuliah</p>
                </motion.div>

                {/* ═══════ TAB NAVIGATION ═══════ */}
                <motion.div variants={itemVariants} className="flex gap-2">
                    {tabs.map(tab => (
                        <motion.button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className={cn("relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                                activeTab === tab.key ? "text-white shadow-lg" : "text-neutral-600 dark:text-neutral-400 bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-white/5 backdrop-blur-xl hover:bg-white/60"
                            )}>
                            {activeTab === tab.key && (
                                <motion.div layoutId="activeTabCourses" className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg"
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {tab.label}
                                <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold",
                                    activeTab === tab.key ? "bg-white/20" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                                )}>{tab.count}</span>
                            </span>
                        </motion.button>
                    ))}
                </motion.div>

                {/* ═══════ GRID VIEW ═══════ */}
                {viewMode === 'grid' && (
                    filteredCourses.length === 0 ? (
                        <motion.div variants={cardVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-16 text-center shadow-xl backdrop-blur-xl dark:border-white/5">
                            <img src={CourseImg} alt="Kosong" className="h-24 w-24 mx-auto mb-3 opacity-50 grayscale drop-shadow-sm" />
                            <p className="text-neutral-500 font-medium">{searchQuery ? 'Tidak ada hasil' : 'Belum ada mata kuliah'}</p>
                            <p className="text-xs text-neutral-400 mt-1">{searchQuery ? `Tidak ditemukan mata kuliah "${searchQuery}"` : 'Anda belum ditugaskan ke mata kuliah manapun.'}</p>
                        </motion.div>
                    ) : (
                        <motion.div variants={containerVariants} className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence mode="popLayout">
                                {filteredCourses.map((course, i) => (
                                    <motion.div key={course.id} variants={cardVariants} whileHover="hover"
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/50 dark:bg-neutral-900/50 shadow-xl backdrop-blur-xl dark:border-white/5 cursor-pointer"
                                        onClick={() => router.visit(`/dosen/courses/${course.id}`)}>
                                        {/* Gradient accent bar */}
                                        <div className={cn("h-1.5 w-full bg-gradient-to-r",
                                            course.attendanceRate >= 80 ? "from-emerald-400 to-teal-500" :
                                                course.attendanceRate >= 60 ? "from-amber-400 to-orange-500" :
                                                    "from-rose-400 to-red-500")} />

                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <motion.div whileHover={{ rotate: 10, scale: 1.1 }}
                                                    className="h-16 w-16 drop-shadow-xl">
                                                    <img src={CourseImg} alt="Course Logo" className="h-full w-full object-contain" />
                                                </motion.div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 dark:border-indigo-800/50 text-xs font-bold text-indigo-600 dark:text-indigo-400">{course.sks} SKS</span>
                                                    {course.activeSessions > 0 && (
                                                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            {course.activeSessions} aktif
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">{course.nama}</h3>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mb-4">{course.kode}</p>

                                            {/* Attendance Progress */}
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between text-xs mb-1.5">
                                                    <span className="text-neutral-500 dark:text-neutral-400 font-medium">Tingkat Kehadiran</span>
                                                    <span className={cn("font-bold",
                                                        course.attendanceRate >= 80 ? "text-emerald-600 dark:text-emerald-400" :
                                                            course.attendanceRate >= 60 ? "text-amber-600 dark:text-amber-400" :
                                                                "text-rose-600 dark:text-rose-400")}>{course.attendanceRate}%</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${course.attendanceRate}%` }}
                                                        transition={{ duration: 1, delay: i * 0.05 }}
                                                        className={cn("h-full rounded-full",
                                                            course.attendanceRate >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                                                                course.attendanceRate >= 60 ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                                                                    "bg-gradient-to-r from-rose-500 to-red-500")} />
                                                </div>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { icon: Calendar, val: course.totalSessions, label: 'Sesi', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/50' },
                                                    { icon: Users, val: course.totalStudents, label: 'Mahasiswa', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200/50 dark:border-emerald-800/50' },
                                                    { icon: Clock, val: course.lateCount, label: 'Terlambat', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-800/50' },
                                                ].map(s => (
                                                    <div key={s.label} className={cn("flex flex-col items-center p-2 rounded-xl border", s.bg)}>
                                                        <s.icon className={cn("h-3.5 w-3.5 mb-1", s.color)} />
                                                        <p className={cn("text-sm font-bold", s.color)}>{s.val}</p>
                                                        <p className="text-[9px] text-neutral-400">{s.label}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Warning Badge */}
                                            {course.lowAttendanceStudents > 0 && (
                                                <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200/50 dark:border-rose-800/50">
                                                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                                                    <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">{course.lowAttendanceStudents} mahasiswa kehadiran rendah</span>
                                                </div>
                                            )}

                                            {/* Footer */}
                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                                                {course.latestSession && <p className="text-[10px] text-neutral-400">Terakhir: {course.latestSession}</p>}
                                                <motion.div whileHover={{ x: 3 }} className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-xs font-semibold ml-auto">
                                                    Lihat Detail <ChevronRight className="h-3.5 w-3.5" />
                                                </motion.div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )
                )}

                {/* ═══════ LIST VIEW ═══════ */}
                {viewMode === 'list' && (
                    <motion.div variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl dark:border-white/5 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
                                        <th className="px-6 py-4 text-left font-semibold text-neutral-700 dark:text-neutral-300">Mata Kuliah</th>
                                        <th className="px-4 py-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">SKS</th>
                                        <th className="px-4 py-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">Mahasiswa</th>
                                        <th className="px-4 py-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">Sesi</th>
                                        <th className="px-4 py-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">Kehadiran</th>
                                        <th className="px-4 py-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">Status</th>
                                        <th className="px-4 py-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="popLayout">
                                        {filteredCourses.length === 0 ? (
                                            <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                <td colSpan={7} className="px-6 py-16 text-center">
                                                    <img src={CourseImg} alt="Kosong" className="h-20 w-20 mx-auto mb-3 opacity-50 grayscale drop-shadow-sm" />
                                                    <p className="text-neutral-500 font-medium">Tidak ada mata kuliah ditemukan</p>
                                                </td>
                                            </motion.tr>
                                        ) : filteredCourses.map((course, i) => (
                                            <motion.tr key={course.id}
                                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: i * 0.03, type: 'spring', stiffness: 300, damping: 24 }}
                                                className="border-b border-white/5 hover:bg-white/30 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                                onClick={() => router.visit(`/dosen/courses/${course.id}`)}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-12 w-12 drop-shadow-lg">
                                                            <img src={CourseImg} alt="Course Logo" className="h-full w-full object-contain" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-neutral-900 dark:text-white">{course.nama}</p>
                                                            <p className="text-xs text-neutral-400 font-mono">{course.kode}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-xs font-bold text-indigo-600 dark:text-indigo-400">{course.sks}</span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className="flex items-center justify-center gap-1 text-xs"><Users className="h-3.5 w-3.5 text-emerald-500" /><span className="font-bold text-neutral-700 dark:text-neutral-300">{course.totalStudents}</span></span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className="flex items-center justify-center gap-1 text-xs"><Calendar className="h-3.5 w-3.5 text-blue-500" /><span className="font-bold text-neutral-700 dark:text-neutral-300">{course.totalSessions}</span></span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={cn("text-sm font-bold",
                                                            course.attendanceRate >= 80 ? "text-emerald-600 dark:text-emerald-400" :
                                                                course.attendanceRate >= 60 ? "text-amber-600 dark:text-amber-400" :
                                                                    "text-rose-600 dark:text-rose-400")}>{course.attendanceRate}%</span>
                                                        <div className="w-20 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                                            <div className={cn("h-full rounded-full",
                                                                course.attendanceRate >= 80 ? "bg-emerald-500" : course.attendanceRate >= 60 ? "bg-amber-500" : "bg-rose-500")}
                                                                style={{ width: `${course.attendanceRate}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    {course.activeSessions > 0 ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            {course.activeSessions} Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-semibold text-neutral-500 dark:text-neutral-400">Idle</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                            onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); setDetailTab('overview'); }}
                                                            className="p-2 rounded-lg text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors" title="Detail">
                                                            <Eye className="h-4 w-4" />
                                                        </motion.button>
                                                        <Link href={`/dosen/courses/${course.id}`} onClick={(e) => e.stopPropagation()}>
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                                className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" title="Halaman Detail">
                                                                <ChevronRight className="h-4 w-4" />
                                                            </motion.button>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* ═══════ COURSE DETAIL MODAL ═══════ */}
                <AnimatePresence>
                    {selectedCourse && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCourse(null)} />
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                                <motion.div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl dark:bg-neutral-900 pointer-events-auto overflow-hidden max-h-[90vh] overflow-y-auto"
                                    onClick={e => e.stopPropagation()}>
                                    {/* Modal Header */}
                                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white">
                                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
                                        <div className="absolute -bottom-5 -left-5 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                                        {/* Animation removed */}
                                        <div className="relative flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }}
                                                    className="h-20 w-20 drop-shadow-2xl">
                                                    <img src={CourseImg} alt={selectedCourse.nama} className="h-full w-full object-contain" />
                                                </motion.div>
                                                <div>
                                                    <h3 className="text-2xl font-bold">{selectedCourse.nama}</h3>
                                                    <p className="text-sm text-white/80 mt-1">{selectedCourse.kode} · {selectedCourse.sks} SKS</p>
                                                </div>
                                            </div>
                                            <motion.button onClick={() => setSelectedCourse(null)} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.95 }}
                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur">
                                                <X className="h-5 w-5" />
                                            </motion.button>
                                        </div>

                                        {/* Modal Tabs */}
                                        <div className="flex gap-2 mt-5">
                                            {[
                                                { key: 'overview' as const, label: 'Overview', icon: BarChart3 },
                                                { key: 'students' as const, label: 'Mahasiswa', icon: Users },
                                                { key: 'sessions' as const, label: 'Sesi Absen', icon: Calendar },
                                            ].map(tab => (
                                                <motion.button key={tab.key} onClick={() => setDetailTab(tab.key)}
                                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                    className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                                                        detailTab === tab.key ? "bg-white/30 shadow" : "bg-white/10 hover:bg-white/20"
                                                    )}>
                                                    <tab.icon className="h-4 w-4" /> {tab.label}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Modal Content */}
                                    <div className="p-6">
                                        {detailTab === 'overview' && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                                {/* Quick Stats */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    {[
                                                        { icon: Users, label: 'Mahasiswa', value: selectedCourse.totalStudents, color: 'from-emerald-400 to-teal-600' },
                                                        { icon: Calendar, label: 'Total Sesi', value: selectedCourse.totalSessions, color: 'from-blue-400 to-cyan-600' },
                                                        { icon: TrendingUp, label: 'Kehadiran', value: `${selectedCourse.attendanceRate}%`, color: 'from-amber-400 to-orange-600' },
                                                        { icon: Clock, label: 'Terlambat', value: selectedCourse.lateCount, color: 'from-rose-400 to-pink-600' },
                                                    ].map(s => (
                                                        <div key={s.label} className="p-4 rounded-2xl border border-white/20 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-lg">
                                                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow mb-2", s.color)}>
                                                                <s.icon className="h-5 w-5" />
                                                            </div>
                                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{s.label}</p>
                                                            <p className="text-xl font-bold text-neutral-900 dark:text-white">{s.value}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Info Cards */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 rounded-2xl border border-white/20 bg-white/50 dark:bg-neutral-800/50">
                                                        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2">Detail Mata Kuliah</p>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between"><span className="text-neutral-500">Kode</span><span className="font-mono font-semibold text-neutral-900 dark:text-white">{selectedCourse.kode}</span></div>
                                                            <div className="flex justify-between"><span className="text-neutral-500">SKS</span><span className="font-semibold text-neutral-900 dark:text-white">{selectedCourse.sks}</span></div>
                                                            <div className="flex justify-between"><span className="text-neutral-500">Sesi Aktif</span><span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedCourse.activeSessions}</span></div>
                                                            {selectedCourse.latestSession && (
                                                                <div className="flex justify-between"><span className="text-neutral-500">Terakhir</span><span className="font-semibold text-neutral-900 dark:text-white">{selectedCourse.latestSession}</span></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="p-4 rounded-2xl border border-white/20 bg-white/50 dark:bg-neutral-800/50">
                                                        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2">Performa</p>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <div className="flex justify-between text-xs mb-1">
                                                                    <span className="text-neutral-500">Kehadiran</span>
                                                                    <span className="font-bold text-emerald-600">{selectedCourse.attendanceRate}%</span>
                                                                </div>
                                                                <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                                                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${selectedCourse.attendanceRate}%` }} />
                                                                </div>
                                                            </div>
                                                            {selectedCourse.lowAttendanceStudents > 0 && (
                                                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200/50 dark:border-rose-800/50">
                                                                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                                                                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">{selectedCourse.lowAttendanceStudents} mahasiswa perlu perhatian</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quick Actions */}
                                                <div className="flex flex-wrap gap-3">
                                                    <Link href={`/dosen/courses/${selectedCourse.id}`}>
                                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-lg">
                                                            <Eye className="h-4 w-4" /> Halaman Detail
                                                        </motion.button>
                                                    </Link>
                                                    <Link href={`/dosen/courses/${selectedCourse.id}/students`}>
                                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/70 dark:bg-neutral-800/70 border border-white/30 dark:border-white/10 text-sm font-semibold text-neutral-700 dark:text-neutral-300 backdrop-blur-lg shadow-sm">
                                                            <Users className="h-4 w-4" /> Lihat Mahasiswa
                                                        </motion.button>
                                                    </Link>
                                                    <Link href="/dosen/sesi-absen">
                                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/70 dark:bg-neutral-800/70 border border-white/30 dark:border-white/10 text-sm font-semibold text-neutral-700 dark:text-neutral-300 backdrop-blur-lg shadow-sm">
                                                            <Plus className="h-4 w-4" /> Buat Sesi
                                                        </motion.button>
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}

                                        {detailTab === 'students' && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Daftar Mahasiswa ({selectedCourse.totalStudents})</p>
                                                    <Link href={`/dosen/courses/${selectedCourse.id}/students`}>
                                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                                            Lihat Semua <ChevronRight className="h-3.5 w-3.5" />
                                                        </motion.button>
                                                    </Link>
                                                </div>
                                                <div className="rounded-2xl border border-white/20 bg-white/50 dark:bg-neutral-800/50 p-6 text-center backdrop-blur-lg">
                                                    <Users className="h-10 w-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Klik "Lihat Semua" untuk melihat daftar mahasiswa lengkap dengan statistik kehadiran</p>
                                                    <Link href={`/dosen/courses/${selectedCourse.id}/students`}>
                                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                            className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-lg">
                                                            Buka Daftar Mahasiswa
                                                        </motion.button>
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}

                                        {detailTab === 'sessions' && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Sesi Absen ({selectedCourse.totalSessions} sesi)</p>
                                                    <Link href="/dosen/sesi-absen">
                                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                                            Kelola Sesi <ChevronRight className="h-3.5 w-3.5" />
                                                        </motion.button>
                                                    </Link>
                                                </div>
                                                <div className="rounded-2xl border border-white/20 bg-white/50 dark:bg-neutral-800/50 p-6 backdrop-blur-lg">
                                                    <div className="grid grid-cols-3 gap-3 mb-4">

                                                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50 text-center">
                                                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{selectedCourse.activeSessions}</p>
                                                            <p className="text-[10px] text-emerald-500">Aktif</p>
                                                        </div>
                                                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 text-center">
                                                            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{selectedCourse.attendanceRate}%</p>
                                                            <p className="text-[10px] text-amber-500">Kehadiran</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <Calendar className="h-10 w-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
                                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">Kelola sesi absen melalui halaman Sesi Absensi</p>
                                                        <div className="flex justify-center gap-3">
                                                            <Link href={`/dosen/courses/${selectedCourse.id}`}>
                                                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-lg">
                                                                    Lihat Detail Sesi
                                                                </motion.button>
                                                            </Link>
                                                            <Link href="/dosen/sesi-absen">
                                                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/70 dark:bg-neutral-700 border border-white/30 dark:border-white/10 text-sm font-semibold text-neutral-700 dark:text-neutral-300 shadow-sm">
                                                                    <Plus className="h-4 w-4" /> Buat Sesi Baru
                                                                </motion.button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

            </motion.div>
        </DosenLayout>
    );
}
