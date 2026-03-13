import TotalHadirIcon from '@/assets/admin/live-monitor/hadir-icon.png';
import StatAttendanceRate from '@/assets/dosen/dashboard/stat-attendance-rate.png';
import StatTotalSessions from '@/assets/dosen/dashboard/stat-total-sessions.png';
import StatTotalStudents from '@/assets/dosen/dashboard/stat-total-students.png';
import CourseImg from '@/assets/dosen/matakuliah/mata-kuliah.png';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import DosenLayout from '@/layouts/dosen-layout';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    BarChart3,
    Calendar,
    ChevronRight,
    Clock,
    Download,
    Eye,
    Grid,
    List,
    Plus,
    Search,
    Settings,
    Sparkles,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

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
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
} as const;

const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
    },
    hover: {
        scale: 1.03,
        y: -8,
        transition: { type: 'spring' as const, stiffness: 400, damping: 10 },
    },
} as const;

export default function DosenCourses({ dosen, courses, stats }: PageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<
        'name' | 'students' | 'attendance' | 'sessions'
    >('name');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState<'all' | 'high'>('all');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [detailTab, setDetailTab] = useState<
        'overview' | 'students' | 'sessions'
    >('overview');

    const filteredCourses = useMemo(() => {
        return courses
            .filter((c) => {
                const matchSearch =
                    c.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.kode.toLowerCase().includes(searchQuery.toLowerCase());
                const matchTab =
                    activeTab === 'all' ||
                    (activeTab === 'high' && c.attendanceRate >= 80);
                return matchSearch && matchTab;
            })
            .sort((a, b) => {
                if (sortBy === 'name') return a.nama.localeCompare(b.nama);
                if (sortBy === 'students')
                    return b.totalStudents - a.totalStudents;
                if (sortBy === 'attendance')
                    return b.attendanceRate - a.attendanceRate;
                if (sortBy === 'sessions')
                    return b.totalSessions - a.totalSessions;
                return 0;
            });
    }, [courses, searchQuery, sortBy, activeTab]);

    const summaryCards = [
        {
            key: 'total',
            imgSrc: TotalHadirIcon,
            label: 'Total Hadir',
            value: stats.totalHadir,
            sub: 'Semua sesi rute ini',
            gradient: 'from-blue-400 to-cyan-600',
            glow: 'bg-blue-500',
            shadow: 'hover:shadow-blue-500/10',
        },
        {
            key: 'students',
            imgSrc: StatTotalStudents,
            label: 'Total Mahasiswa',
            value: stats.totalStudents,
            sub: 'Semua Status',
            gradient: 'from-emerald-400 to-teal-600',
            glow: 'bg-emerald-500',
            shadow: 'hover:shadow-emerald-500/10',
        },
        {
            key: 'sessions',
            imgSrc: StatTotalSessions,
            label: 'Total Sesi',
            value: stats.totalSessions,
            sub: `${stats.activeSessions} aktif`,
            gradient: 'from-violet-400 to-purple-600',
            glow: 'bg-violet-500',
            shadow: 'hover:shadow-violet-500/10',
            pulse: false,
        },
        {
            key: 'rate',
            imgSrc: StatAttendanceRate,
            label: 'Rata-rata Kehadiran',
            value: stats.avgAttendanceRate,
            suffix: '%',
            sub: 'Tingkat kehadiran',
            gradient: 'from-amber-400 to-orange-600',
            glow: 'bg-amber-500',
            shadow: 'hover:shadow-amber-500/10',
        },
    ];

    const tabs = [
        {
            key: 'all' as const,
            label: 'Semua Mata Kuliah',
            count: courses.length,
        },
        {
            key: 'high' as const,
            label: 'Kehadiran Tinggi',
            count: courses.filter((c) => c.attendanceRate >= 80).length,
        },
    ];

    return (
        <DosenLayout>
            <Head title="Mata Kuliah" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
            >
                {/* ═══════ HEADER — Kas Admin Style ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Ripple animation removed */}

                    <div className="relative">
                        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:items-start">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left lg:w-auto">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    className="h-20 w-20 flex-shrink-0 drop-shadow-2xl sm:h-24 sm:w-24"
                                    initial={{
                                        opacity: 0,
                                        scale: 0.5,
                                        rotate: -10,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        scale: 1,
                                        rotate: 0,
                                    }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        delay: 0.2,
                                    }}
                                >
                                    <img
                                        src={CourseImg}
                                        alt="Mata Kuliah"
                                        className="h-full w-full object-contain"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Manajemen Mata Kuliah
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Mata Kuliah
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 text-sm leading-relaxed text-indigo-100 sm:text-base"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Kelola mata kuliah dan monitor performa
                                        kelas Anda
                                    </motion.p>
                                </div>
                            </div>
                            <div className="mt-2 flex w-full flex-col items-center gap-3 lg:mt-0 lg:w-auto lg:items-end">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-6 py-3 shadow-lg backdrop-blur-xl"
                                >
                                    <div className="rounded-lg bg-indigo-500/20 p-2">
                                        <Sparkles className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-100">
                                            Total Hadir
                                        </p>
                                        <p className="text-2xl font-bold text-white">
                                            {stats.totalHadir}
                                        </p>
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-wrap justify-center gap-2"
                                >
                                    {[
                                        {
                                            icon: Download,
                                            label: 'Export',
                                            href: '/dosen/rekapan',
                                        },
                                        {
                                            icon: BarChart3,
                                            label: 'Analytics',
                                            href: '/dosen/class-insights',
                                        },
                                        {
                                            icon: Settings,
                                            label: 'Pengaturan',
                                            href: '/dosen/settings',
                                        },
                                    ].map((btn) => (
                                        <Link key={btn.label} href={btn.href}>
                                            <motion.button
                                                whileHover={{
                                                    scale: 1.02,
                                                    backgroundColor:
                                                        'rgba(255,255,255,0.25)',
                                                }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30"
                                            >
                                                <btn.icon className="h-4 w-4" />{' '}
                                                {btn.label}
                                            </motion.button>
                                        </Link>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ SUMMARY CARDS ═══════ */}
                <motion.div
                    className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.04,
                                delayChildren: 0.2,
                            },
                        },
                    }}
                >
                    {summaryCards.map((card, i) => {
                        const colorMap: Record<string, any> = {
                            'bg-violet-500': {
                                from: 'from-violet-400',
                                to: 'to-purple-600',
                                gradientBg: 'from-violet-500/5 to-purple-500/5',
                                hoverShadow: 'hover:shadow-violet-500/10',
                            },
                            'bg-blue-500': {
                                from: 'from-blue-400',
                                to: 'to-indigo-600',
                                gradientBg: 'from-blue-500/5 to-indigo-500/5',
                                hoverShadow: 'hover:shadow-blue-500/10',
                            },
                            'bg-emerald-500': {
                                from: 'from-emerald-400',
                                to: 'to-teal-600',
                                gradientBg: 'from-emerald-500/5 to-teal-500/5',
                                hoverShadow: 'hover:shadow-emerald-500/10',
                            },
                            'bg-amber-500': {
                                from: 'from-amber-400',
                                to: 'to-orange-600',
                                gradientBg: 'from-amber-500/5 to-orange-500/5',
                                hoverShadow: 'hover:shadow-amber-500/10',
                            },
                        };
                        const cc =
                            colorMap[card.glow] || colorMap['bg-blue-500'];
                        return (
                            <motion.div
                                key={card.key}
                                variants={{
                                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        transition: {
                                            type: 'spring',
                                            stiffness: 100,
                                            damping: 15,
                                        },
                                    },
                                }}
                                whileHover={{
                                    y: -5,
                                    scale: 1.02,
                                    transition: {
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 25,
                                    },
                                }}
                                onHoverStart={() => setHoveredCard(card.key)}
                                onHoverEnd={() => setHoveredCard(null)}
                                className={cn(
                                    `group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-5 dark:border-white/5 dark:bg-neutral-900/40`,
                                    cc.hoverShadow,
                                )}
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${cc.gradientBg} opacity-50 dark:opacity-100`}
                                />
                                <motion.div
                                    className={cn(
                                        `absolute -top-8 -right-8 h-28 w-28 rounded-full blur-3xl transition-all`,
                                        card.glow,
                                    )}
                                    animate={{
                                        opacity:
                                            hoveredCard === card.key
                                                ? 0.4
                                                : 0.15,
                                    }}
                                />
                                <div className="relative z-10 flex h-full flex-col items-center justify-between gap-3 sm:items-start">
                                    <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-3 sm:text-left">
                                        <motion.div
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 10,
                                            }}
                                            className="relative flex h-10 w-10 shrink-0 items-center justify-center sm:h-12 sm:w-12"
                                        >
                                            <img
                                                src={card.imgSrc}
                                                alt={card.label}
                                                className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]"
                                            />
                                        </motion.div>
                                        <div>
                                            <p className="text-[10px] font-medium text-neutral-500 sm:text-xs dark:text-neutral-400">
                                                {card.label}
                                            </p>
                                            <span className="text-xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
                                                <AnimatedCounter
                                                    value={card.value}
                                                    suffix={card.suffix}
                                                    duration={1500}
                                                />
                                            </span>
                                            <p className="mt-0.5 hidden text-[10px] text-neutral-400 sm:block">
                                                {card.sub}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══════ FILTERS & SEARCH ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative min-w-[200px] flex-1">
                            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Cari mata kuliah atau kode..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-white/30 bg-white/70 py-2.5 pr-10 pl-11 text-sm shadow-sm backdrop-blur-lg transition-all focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-neutral-800/70 dark:text-white"
                            />
                            <AnimatePresence>
                                {searchQuery && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={() => setSearchQuery('')}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="rounded-xl border border-white/30 bg-white/70 px-4 py-2.5 text-sm shadow-sm backdrop-blur-lg focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-neutral-800/70 dark:text-white"
                        >
                            <option value="name">Urutkan: Nama</option>
                            <option value="students">Urutkan: Mahasiswa</option>
                            <option value="attendance">
                                Urutkan: Kehadiran
                            </option>
                            <option value="sessions">Urutkan: Sesi</option>
                        </select>

                        <div className="flex items-center rounded-xl border border-white/30 bg-white/70 p-1 shadow-sm backdrop-blur-lg dark:border-white/10 dark:bg-neutral-800/70">
                            {[
                                { mode: 'grid' as const, icon: Grid },
                                { mode: 'list' as const, icon: List },
                            ].map((v) => (
                                <motion.button
                                    key={v.mode}
                                    onClick={() => setViewMode(v.mode)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                        'rounded-lg p-2 transition-all',
                                        viewMode === v.mode
                                            ? 'bg-indigo-500 text-white shadow'
                                            : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400',
                                    )}
                                >
                                    <v.icon className="h-4 w-4" />
                                </motion.button>
                            ))}
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-neutral-400">
                        Menampilkan {filteredCourses.length} dari{' '}
                        {courses.length} mata kuliah
                    </p>
                </motion.div>

                {/* ═══════ TAB NAVIGATION ═══════ */}
                <motion.div variants={itemVariants} className="flex gap-2">
                    {tabs.map((tab) => (
                        <motion.button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                'relative rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
                                activeTab === tab.key
                                    ? 'text-white shadow-lg'
                                    : 'border border-white/20 bg-white/40 text-neutral-600 backdrop-blur-xl hover:bg-white/60 dark:border-white/5 dark:bg-neutral-900/40 dark:text-neutral-400',
                            )}
                        >
                            {activeTab === tab.key && (
                                <motion.div
                                    layoutId="activeTabCourses"
                                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg"
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 25,
                                    }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {tab.label}
                                <span
                                    className={cn(
                                        'rounded-full px-2 py-0.5 text-xs font-bold',
                                        activeTab === tab.key
                                            ? 'bg-white/20'
                                            : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
                                    )}
                                >
                                    {tab.count}
                                </span>
                            </span>
                        </motion.button>
                    ))}
                </motion.div>

                {/* ═══════ GRID VIEW ═══════ */}
                {viewMode === 'grid' &&
                    (filteredCourses.length === 0 ? (
                        <motion.div
                            variants={cardVariants}
                            className="rounded-3xl border border-white/20 bg-white/40 p-16 text-center shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <img
                                src={CourseImg}
                                alt="Kosong"
                                className="mx-auto mb-3 h-24 w-24 opacity-50 drop-shadow-sm grayscale"
                            />
                            <p className="font-medium text-neutral-500">
                                {searchQuery
                                    ? 'Tidak ada hasil'
                                    : 'Belum ada mata kuliah'}
                            </p>
                            <p className="mt-1 text-xs text-neutral-400">
                                {searchQuery
                                    ? `Tidak ditemukan mata kuliah "${searchQuery}"`
                                    : 'Anda belum ditugaskan ke mata kuliah manapun.'}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredCourses.map((course, i) => (
                                    <motion.div
                                        key={course.id}
                                        variants={cardVariants}
                                        whileHover="hover"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/20 bg-white/50 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/50"
                                        onClick={() =>
                                            router.visit(
                                                `/dosen/courses/${course.id}`,
                                            )
                                        }
                                    >
                                        <div className="p-6">
                                            <div className="mb-3 flex items-start justify-between">
                                                <motion.div
                                                    whileHover={{
                                                        rotate: 10,
                                                        scale: 1.1,
                                                    }}
                                                    className="h-16 w-16 drop-shadow-xl"
                                                >
                                                    <img
                                                        src={CourseImg}
                                                        alt="Course Logo"
                                                        className="h-full w-full object-contain"
                                                    />
                                                </motion.div>
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-full border border-indigo-200/50 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:border-indigo-800/50 dark:text-indigo-400">
                                                        {course.sks} SKS
                                                    </span>
                                                    {course.activeSessions >
                                                        0 && (
                                                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            {
                                                                course.activeSessions
                                                            }{' '}
                                                            aktif
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className="mb-1 line-clamp-2 text-lg font-bold text-neutral-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                                                {course.nama}
                                            </h3>
                                            <p className="mb-4 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                                                {course.kode}
                                            </p>

                                            {/* Attendance Progress */}
                                            <div className="mb-4">
                                                <div className="mb-1.5 flex items-center justify-between text-xs">
                                                    <span className="font-medium text-neutral-500 dark:text-neutral-400">
                                                        Tingkat Kehadiran
                                                    </span>
                                                    <span
                                                        className={cn(
                                                            'font-bold',
                                                            course.attendanceRate >=
                                                                80
                                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                                : course.attendanceRate >=
                                                                    60
                                                                  ? 'text-amber-600 dark:text-amber-400'
                                                                  : 'text-rose-600 dark:text-rose-400',
                                                        )}
                                                    >
                                                        {course.attendanceRate}%
                                                    </span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width: `${course.attendanceRate}%`,
                                                        }}
                                                        transition={{
                                                            duration: 1,
                                                            delay: i * 0.05,
                                                        }}
                                                        className={cn(
                                                            'h-full rounded-full',
                                                            course.attendanceRate >=
                                                                80
                                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                                                : course.attendanceRate >=
                                                                    60
                                                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                                                  : 'bg-gradient-to-r from-rose-500 to-red-500',
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    {
                                                        icon: Calendar,
                                                        val: course.totalSessions,
                                                        label: 'Sesi',
                                                        color: 'text-blue-600 dark:text-blue-400',
                                                        bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/50',
                                                    },
                                                    {
                                                        icon: Users,
                                                        val: course.totalStudents,
                                                        label: 'Mahasiswa',
                                                        color: 'text-emerald-600 dark:text-emerald-400',
                                                        bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200/50 dark:border-emerald-800/50',
                                                    },
                                                    {
                                                        icon: Clock,
                                                        val: course.lateCount,
                                                        label: 'Terlambat',
                                                        color: 'text-amber-600 dark:text-amber-400',
                                                        bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-800/50',
                                                    },
                                                ].map((s) => (
                                                    <div
                                                        key={s.label}
                                                        className={cn(
                                                            'flex flex-col items-center rounded-xl border p-2',
                                                            s.bg,
                                                        )}
                                                    >
                                                        <s.icon
                                                            className={cn(
                                                                'mb-1 h-3.5 w-3.5',
                                                                s.color,
                                                            )}
                                                        />
                                                        <p
                                                            className={cn(
                                                                'text-sm font-bold',
                                                                s.color,
                                                            )}
                                                        >
                                                            {s.val}
                                                        </p>
                                                        <p className="text-[9px] text-neutral-400">
                                                            {s.label}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Warning Badge */}
                                            {course.lowAttendanceStudents >
                                                0 && (
                                                <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-200/50 bg-rose-50 px-3 py-1.5 dark:border-rose-800/50 dark:bg-rose-900/20">
                                                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                                                    <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                                                        {
                                                            course.lowAttendanceStudents
                                                        }{' '}
                                                        mahasiswa kehadiran
                                                        rendah
                                                    </span>
                                                </div>
                                            )}

                                            {/* Footer */}
                                            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                                                {course.latestSession && (
                                                    <p className="text-[10px] text-neutral-400">
                                                        Terakhir:{' '}
                                                        {course.latestSession}
                                                    </p>
                                                )}
                                                <motion.div
                                                    whileHover={{ x: 3 }}
                                                    className="ml-auto flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                                                >
                                                    Lihat Detail{' '}
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </motion.div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ))}

                {/* ═══════ LIST VIEW ═══════ */}
                {viewMode === 'list' && (
                    <motion.div
                        variants={itemVariants}
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
                                        <th className="px-6 py-4 text-left font-semibold text-neutral-700 dark:text-neutral-300">
                                            Mata Kuliah
                                        </th>
                                        <th className="px-4 py-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">
                                            SKS
                                        </th>
                                        <th className="px-4 py-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">
                                            Mahasiswa
                                        </th>
                                        <th className="px-4 py-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">
                                            Sesi
                                        </th>
                                        <th className="px-4 py-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">
                                            Kehadiran
                                        </th>
                                        <th className="px-4 py-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">
                                            Status
                                        </th>
                                        <th className="px-4 py-4 text-center font-semibold text-neutral-700 dark:text-neutral-300">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="popLayout">
                                        {filteredCourses.length === 0 ? (
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                <td
                                                    colSpan={7}
                                                    className="px-6 py-16 text-center"
                                                >
                                                    <img
                                                        src={CourseImg}
                                                        alt="Kosong"
                                                        className="mx-auto mb-3 h-20 w-20 opacity-50 drop-shadow-sm grayscale"
                                                    />
                                                    <p className="font-medium text-neutral-500">
                                                        Tidak ada mata kuliah
                                                        ditemukan
                                                    </p>
                                                </td>
                                            </motion.tr>
                                        ) : (
                                            filteredCourses.map((course, i) => (
                                                <motion.tr
                                                    key={course.id}
                                                    initial={{
                                                        opacity: 0,
                                                        x: -20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    transition={{
                                                        delay: i * 0.03,
                                                        type: 'spring',
                                                        stiffness: 300,
                                                        damping: 24,
                                                    }}
                                                    className="cursor-pointer border-b border-white/5 transition-colors hover:bg-white/30 dark:hover:bg-white/5"
                                                    onClick={() =>
                                                        router.visit(
                                                            `/dosen/courses/${course.id}`,
                                                        )
                                                    }
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-12 w-12 drop-shadow-lg">
                                                                <img
                                                                    src={
                                                                        CourseImg
                                                                    }
                                                                    alt="Course Logo"
                                                                    className="h-full w-full object-contain"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-neutral-900 dark:text-white">
                                                                    {
                                                                        course.nama
                                                                    }
                                                                </p>
                                                                <p className="font-mono text-xs text-neutral-400">
                                                                    {
                                                                        course.kode
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                            {course.sks}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="flex items-center justify-center gap-1 text-xs">
                                                            <Users className="h-3.5 w-3.5 text-emerald-500" />
                                                            <span className="font-bold text-neutral-700 dark:text-neutral-300">
                                                                {
                                                                    course.totalStudents
                                                                }
                                                            </span>
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="flex items-center justify-center gap-1 text-xs">
                                                            <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                                            <span className="font-bold text-neutral-700 dark:text-neutral-300">
                                                                {
                                                                    course.totalSessions
                                                                }
                                                            </span>
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span
                                                                className={cn(
                                                                    'text-sm font-bold',
                                                                    course.attendanceRate >=
                                                                        80
                                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                                        : course.attendanceRate >=
                                                                            60
                                                                          ? 'text-amber-600 dark:text-amber-400'
                                                                          : 'text-rose-600 dark:text-rose-400',
                                                                )}
                                                            >
                                                                {
                                                                    course.attendanceRate
                                                                }
                                                                %
                                                            </span>
                                                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                                                <div
                                                                    className={cn(
                                                                        'h-full rounded-full',
                                                                        course.attendanceRate >=
                                                                            80
                                                                            ? 'bg-emerald-500'
                                                                            : course.attendanceRate >=
                                                                                60
                                                                              ? 'bg-amber-500'
                                                                              : 'bg-rose-500',
                                                                    )}
                                                                    style={{
                                                                        width: `${course.attendanceRate}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        {course.activeSessions >
                                                        0 ? (
                                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                                {
                                                                    course.activeSessions
                                                                }{' '}
                                                                Aktif
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                                                Idle
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <motion.button
                                                                whileHover={{
                                                                    scale: 1.1,
                                                                }}
                                                                whileTap={{
                                                                    scale: 0.9,
                                                                }}
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    setSelectedCourse(
                                                                        course,
                                                                    );
                                                                    setDetailTab(
                                                                        'overview',
                                                                    );
                                                                }}
                                                                className="rounded-lg p-2 text-sky-600 transition-colors hover:bg-sky-50 dark:hover:bg-sky-900/20"
                                                                title="Detail"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </motion.button>
                                                            <Link
                                                                href={`/dosen/courses/${course.id}`}
                                                                onClick={(e) =>
                                                                    e.stopPropagation()
                                                                }
                                                            >
                                                                <motion.button
                                                                    whileHover={{
                                                                        scale: 1.1,
                                                                    }}
                                                                    whileTap={{
                                                                        scale: 0.9,
                                                                    }}
                                                                    className="rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                                                    title="Halaman Detail"
                                                                >
                                                                    <ChevronRight className="h-4 w-4" />
                                                                </motion.button>
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        )}
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
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                                onClick={() => setSelectedCourse(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 25,
                                }}
                                className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
                            >
                                <motion.div
                                    className="pointer-events-auto max-h-[90vh] w-full max-w-3xl overflow-hidden overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-neutral-900"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Modal Header */}
                                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white">
                                        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
                                        <div className="absolute -bottom-5 -left-5 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                                        {/* Animation removed */}
                                        <div className="relative flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <motion.div
                                                    whileHover={{
                                                        scale: 1.1,
                                                        rotate: 10,
                                                    }}
                                                    className="h-20 w-20 drop-shadow-2xl"
                                                >
                                                    <img
                                                        src={CourseImg}
                                                        alt={
                                                            selectedCourse.nama
                                                        }
                                                        className="h-full w-full object-contain"
                                                    />
                                                </motion.div>
                                                <div>
                                                    <h3 className="text-2xl font-bold">
                                                        {selectedCourse.nama}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-white/80">
                                                        {selectedCourse.kode} ·{' '}
                                                        {selectedCourse.sks} SKS
                                                    </p>
                                                </div>
                                            </div>
                                            <motion.button
                                                onClick={() =>
                                                    setSelectedCourse(null)
                                                }
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 90,
                                                }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30"
                                            >
                                                <X className="h-5 w-5" />
                                            </motion.button>
                                        </div>

                                        {/* Modal Tabs */}
                                        <div className="mt-5 flex gap-2">
                                            {[
                                                {
                                                    key: 'overview' as const,
                                                    label: 'Overview',
                                                    icon: BarChart3,
                                                },
                                                {
                                                    key: 'students' as const,
                                                    label: 'Mahasiswa',
                                                    icon: Users,
                                                },
                                                {
                                                    key: 'sessions' as const,
                                                    label: 'Sesi Absen',
                                                    icon: Calendar,
                                                },
                                            ].map((tab) => (
                                                <motion.button
                                                    key={tab.key}
                                                    onClick={() =>
                                                        setDetailTab(tab.key)
                                                    }
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={cn(
                                                        'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
                                                        detailTab === tab.key
                                                            ? 'bg-white/30 shadow'
                                                            : 'bg-white/10 hover:bg-white/20',
                                                    )}
                                                >
                                                    <tab.icon className="h-4 w-4" />{' '}
                                                    {tab.label}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Modal Content */}
                                    <div className="p-6">
                                        {detailTab === 'overview' && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="space-y-6"
                                            >
                                                {/* Quick Stats */}
                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                                    {[
                                                        {
                                                            icon: Users,
                                                            label: 'Mahasiswa',
                                                            value: selectedCourse.totalStudents,
                                                            color: 'from-emerald-400 to-teal-600',
                                                        },
                                                        {
                                                            icon: Calendar,
                                                            label: 'Total Sesi',
                                                            value: selectedCourse.totalSessions,
                                                            color: 'from-blue-400 to-cyan-600',
                                                        },
                                                        {
                                                            icon: TrendingUp,
                                                            label: 'Kehadiran',
                                                            value: `${selectedCourse.attendanceRate}%`,
                                                            color: 'from-amber-400 to-orange-600',
                                                        },
                                                        {
                                                            icon: Clock,
                                                            label: 'Terlambat',
                                                            value: selectedCourse.lateCount,
                                                            color: 'from-rose-400 to-pink-600',
                                                        },
                                                    ].map((s) => (
                                                        <div
                                                            key={s.label}
                                                            className="rounded-2xl border border-white/20 bg-white/50 p-4 backdrop-blur-lg dark:bg-neutral-800/50"
                                                        >
                                                            <div
                                                                className={cn(
                                                                    'mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow',
                                                                    s.color,
                                                                )}
                                                            >
                                                                <s.icon className="h-5 w-5" />
                                                            </div>
                                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                {s.label}
                                                            </p>
                                                            <p className="text-xl font-bold text-neutral-900 dark:text-white">
                                                                {s.value}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Info Cards */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="rounded-2xl border border-white/20 bg-white/50 p-4 dark:bg-neutral-800/50">
                                                        <p className="mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                                            Detail Mata Kuliah
                                                        </p>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-neutral-500">
                                                                    Kode
                                                                </span>
                                                                <span className="font-mono font-semibold text-neutral-900 dark:text-white">
                                                                    {
                                                                        selectedCourse.kode
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-neutral-500">
                                                                    SKS
                                                                </span>
                                                                <span className="font-semibold text-neutral-900 dark:text-white">
                                                                    {
                                                                        selectedCourse.sks
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-neutral-500">
                                                                    Sesi Aktif
                                                                </span>
                                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                                    {
                                                                        selectedCourse.activeSessions
                                                                    }
                                                                </span>
                                                            </div>
                                                            {selectedCourse.latestSession && (
                                                                <div className="flex justify-between">
                                                                    <span className="text-neutral-500">
                                                                        Terakhir
                                                                    </span>
                                                                    <span className="font-semibold text-neutral-900 dark:text-white">
                                                                        {
                                                                            selectedCourse.latestSession
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="rounded-2xl border border-white/20 bg-white/50 p-4 dark:bg-neutral-800/50">
                                                        <p className="mb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                                            Performa
                                                        </p>
                                                        <div className="space-y-3">
                                                            <div>
                                                                <div className="mb-1 flex justify-between text-xs">
                                                                    <span className="text-neutral-500">
                                                                        Kehadiran
                                                                    </span>
                                                                    <span className="font-bold text-emerald-600">
                                                                        {
                                                                            selectedCourse.attendanceRate
                                                                        }
                                                                        %
                                                                    </span>
                                                                </div>
                                                                <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                                                    <div
                                                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                                                        style={{
                                                                            width: `${selectedCourse.attendanceRate}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            {selectedCourse.lowAttendanceStudents >
                                                                0 && (
                                                                <div className="flex items-center gap-2 rounded-lg border border-rose-200/50 bg-rose-50 px-3 py-2 dark:border-rose-800/50 dark:bg-rose-900/20">
                                                                    <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                                                                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                                                                        {
                                                                            selectedCourse.lowAttendanceStudents
                                                                        }{' '}
                                                                        mahasiswa
                                                                        perlu
                                                                        perhatian
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quick Actions */}
                                                <div className="flex flex-wrap gap-3">
                                                    <Link
                                                        href={`/dosen/courses/${selectedCourse.id}`}
                                                    >
                                                        <motion.button
                                                            whileHover={{
                                                                scale: 1.02,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.98,
                                                            }}
                                                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
                                                        >
                                                            <Eye className="h-4 w-4" />{' '}
                                                            Halaman Detail
                                                        </motion.button>
                                                    </Link>
                                                    <Link
                                                        href={`/dosen/courses/${selectedCourse.id}/students`}
                                                    >
                                                        <motion.button
                                                            whileHover={{
                                                                scale: 1.02,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.98,
                                                            }}
                                                            className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/70 px-5 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm backdrop-blur-lg dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-300"
                                                        >
                                                            <Users className="h-4 w-4" />{' '}
                                                            Lihat Mahasiswa
                                                        </motion.button>
                                                    </Link>
                                                    <Link href="/dosen/sesi-absen">
                                                        <motion.button
                                                            whileHover={{
                                                                scale: 1.02,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.98,
                                                            }}
                                                            className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/70 px-5 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm backdrop-blur-lg dark:border-white/10 dark:bg-neutral-800/70 dark:text-neutral-300"
                                                        >
                                                            <Plus className="h-4 w-4" />{' '}
                                                            Buat Sesi
                                                        </motion.button>
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}

                                        {detailTab === 'students' && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="space-y-4"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                                        Daftar Mahasiswa (
                                                        {
                                                            selectedCourse.totalStudents
                                                        }
                                                        )
                                                    </p>
                                                    <Link
                                                        href={`/dosen/courses/${selectedCourse.id}/students`}
                                                    >
                                                        <motion.button
                                                            whileHover={{
                                                                scale: 1.02,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.98,
                                                            }}
                                                            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                                                        >
                                                            Lihat Semua{' '}
                                                            <ChevronRight className="h-3.5 w-3.5" />
                                                        </motion.button>
                                                    </Link>
                                                </div>
                                                <div className="rounded-2xl border border-white/20 bg-white/50 p-6 text-center backdrop-blur-lg dark:bg-neutral-800/50">
                                                    <Users className="mx-auto mb-3 h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                        Klik "Lihat Semua" untuk
                                                        melihat daftar mahasiswa
                                                        lengkap dengan statistik
                                                        kehadiran
                                                    </p>
                                                    <Link
                                                        href={`/dosen/courses/${selectedCourse.id}/students`}
                                                    >
                                                        <motion.button
                                                            whileHover={{
                                                                scale: 1.02,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.98,
                                                            }}
                                                            className="mt-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
                                                        >
                                                            Buka Daftar
                                                            Mahasiswa
                                                        </motion.button>
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}

                                        {detailTab === 'sessions' && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="space-y-4"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                                        Sesi Absen (
                                                        {
                                                            selectedCourse.totalSessions
                                                        }{' '}
                                                        sesi)
                                                    </p>
                                                    <Link href="/dosen/sesi-absen">
                                                        <motion.button
                                                            whileHover={{
                                                                scale: 1.02,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.98,
                                                            }}
                                                            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                                                        >
                                                            Kelola Sesi{' '}
                                                            <ChevronRight className="h-3.5 w-3.5" />
                                                        </motion.button>
                                                    </Link>
                                                </div>
                                                <div className="rounded-2xl border border-white/20 bg-white/50 p-6 backdrop-blur-lg dark:bg-neutral-800/50">
                                                    <div className="mb-4 grid grid-cols-3 gap-3">
                                                        <div className="rounded-xl border border-emerald-200/50 bg-emerald-50 p-3 text-center dark:border-emerald-800/50 dark:bg-emerald-900/20">
                                                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                                                {
                                                                    selectedCourse.activeSessions
                                                                }
                                                            </p>
                                                            <p className="text-[10px] text-emerald-500">
                                                                Aktif
                                                            </p>
                                                        </div>
                                                        <div className="rounded-xl border border-amber-200/50 bg-amber-50 p-3 text-center dark:border-amber-800/50 dark:bg-amber-900/20">
                                                            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                                                {
                                                                    selectedCourse.attendanceRate
                                                                }
                                                                %
                                                            </p>
                                                            <p className="text-[10px] text-amber-500">
                                                                Kehadiran
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <Calendar className="mx-auto mb-3 h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                                                        <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
                                                            Kelola sesi absen
                                                            melalui halaman Sesi
                                                            Absensi
                                                        </p>
                                                        <div className="flex justify-center gap-3">
                                                            <Link
                                                                href={`/dosen/courses/${selectedCourse.id}`}
                                                            >
                                                                <motion.button
                                                                    whileHover={{
                                                                        scale: 1.02,
                                                                    }}
                                                                    whileTap={{
                                                                        scale: 0.98,
                                                                    }}
                                                                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
                                                                >
                                                                    Lihat Detail
                                                                    Sesi
                                                                </motion.button>
                                                            </Link>
                                                            <Link href="/dosen/sesi-absen">
                                                                <motion.button
                                                                    whileHover={{
                                                                        scale: 1.02,
                                                                    }}
                                                                    whileTap={{
                                                                        scale: 0.98,
                                                                    }}
                                                                    className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/70 px-5 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm dark:border-white/10 dark:bg-neutral-700 dark:text-neutral-300"
                                                                >
                                                                    <Plus className="h-4 w-4" />{' '}
                                                                    Buat Sesi
                                                                    Baru
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
