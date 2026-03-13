import DitolakIcon from '@/assets/admin/rekap-kehadiran/ditolak.png';
import HadirIcon from '@/assets/admin/rekap-kehadiran/hadir.png';
import TerlambatIcon from '@/assets/admin/rekap-kehadiran/terlambat.png';
import TotalScanIcon from '@/assets/admin/rekap-kehadiran/total-scan.png';
import PenilaianIcon from '@/assets/grading/penilaian.png';
import DosenLayout from '@/layouts/dosen-layout';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowDownRight,
    ArrowUpRight,
    Award,
    Briefcase,
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    ClipboardList,
    Clock,
    Copy,
    Download,
    FileSearch,
    Filter,
    GraduationCap,
    Mail,
    Search,
    Sparkles,
    TrendingUp,
    X,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

// ─── Types ───────────────────────────────────────────────
interface DosenInfo {
    id: number;
    nama: string;
    nidn: string;
    email: string;
    avatar_url: string | null;
    initials: string;
}

interface Course {
    id: number;
    nama: string;
    sks: number;
    session_count?: number;
}

interface Session {
    id: number;
    meeting_number: number;
    title: string | null;
    start_at: string;
    end_at: string;
    attendance_count?: number;
}

interface AttendanceLog {
    id: number;
    mahasiswa_id: number;
    nama: string;
    nim: string;
    fakultas: string;
    prodi: string;
    kelas: string;
    jenis_reguler: string;
    semester: string;
    status: string;
    scanned_at: string | null;
    scanned_date: string | null;
}

interface Stats {
    total: number;
    hadir: number;
    terlambat: number;
    tidak_hadir: number;
    attendance_rate: number;
}

interface PageProps {
    dosen: DosenInfo;
    courses: Course[];
    sessions: Session[];
    attendanceLogs: AttendanceLog[];
    selectedCourseId: string | null;
    selectedSessionId: string | null;
    selectedCourse: Course | null;
    selectedSession: Session | null;
    stats: Stats;
    filters: {
        search: string;
        status: string;
    };
}

// ─── Animation Variants ──────────────────────────────────
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
} as const;

// ─── Helpers ─────────────────────────────────────────────
const semesterGradient: Record<string, string> = {
    '1': 'from-green-500 to-emerald-600',
    '2': 'from-blue-500 to-cyan-600',
    '3': 'from-indigo-500 to-blue-600',
    '4': 'from-purple-500 to-indigo-600',
    '5': 'from-pink-500 to-purple-600',
    '6': 'from-red-500 to-pink-600',
    '7': 'from-orange-500 to-red-600',
    '8': 'from-amber-500 to-orange-600',
};

const jenisConfig: Record<string, { bg: string; text: string }> = {
    'Reguler A': {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-400',
    },
    'Reguler B': {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
    },
    Karyawan: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-700 dark:text-purple-400',
    },
};

const statusConfig: Record<
    string,
    {
        icon: typeof CheckCircle;
        label: string;
        bg: string;
        ring: string;
        glow: string;
    }
> = {
    present: {
        icon: CheckCircle,
        label: 'Hadir',
        bg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        ring: 'ring-2 ring-emerald-500/20',
        glow: 'shadow-lg shadow-emerald-500/30',
    },
    late: {
        icon: Clock,
        label: 'Terlambat',
        bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
        ring: 'ring-2 ring-amber-500/20',
        glow: 'shadow-lg shadow-amber-500/30',
    },
    absent: {
        icon: XCircle,
        label: 'Tidak Hadir',
        bg: 'bg-gradient-to-r from-red-500 to-rose-500',
        ring: 'ring-2 ring-red-500/20',
        glow: 'shadow-lg shadow-red-500/30',
    },
};

type SortField =
    | 'nama'
    | 'nim'
    | 'status'
    | 'scanned_at'
    | 'kelas'
    | 'semester';
type SortDir = 'asc' | 'desc';

// ═════════════════════════════════════════════════════════
//  COMPONENT
// ═════════════════════════════════════════════════════════
export default function DosenRekapan({
    dosen,
    courses,
    sessions,
    attendanceLogs,
    selectedCourseId,
    selectedSessionId,
    selectedCourse,
    selectedSession,
    stats,
    filters,
}: PageProps) {
    const [courseId, setCourseId] = useState(selectedCourseId || '');
    const [sessionId, setSessionId] = useState(selectedSessionId || '');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('nama');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [copiedNim, setCopiedNim] = useState<string | null>(null);

    // ─── Handlers ────────────────────────────────────────
    const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const v = e.target.value;
        setCourseId(v);
        setSessionId('');
        router.get('/dosen/rekapan', v ? { course_id: v } : {}, {
            preserveState: true,
        });
    };

    const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const v = e.target.value;
        setSessionId(v);
        if (v && courseId) {
            router.get(
                '/dosen/rekapan',
                {
                    course_id: courseId,
                    session_id: v,
                    search: searchQuery,
                    status: statusFilter,
                },
                { preserveState: true },
            );
        }
    };

    const handleFilter = () => {
        if (courseId && sessionId)
            router.get(
                '/dosen/rekapan',
                {
                    course_id: courseId,
                    session_id: sessionId,
                    search: searchQuery,
                    status: statusFilter,
                },
                { preserveState: true },
            );
    };

    const handleStatusChip = (s: string) => {
        setStatusFilter(s);
        if (courseId && sessionId)
            router.get(
                '/dosen/rekapan',
                {
                    course_id: courseId,
                    session_id: sessionId,
                    search: searchQuery,
                    status: s,
                },
                { preserveState: true },
            );
    };

    const handleExportPdf = () => {
        if (sessionId)
            window.open(`/dosen/rekapan/pdf?session_id=${sessionId}`, '_blank');
    };

    const handleSort = (f: SortField) => {
        if (sortField === f) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else {
            setSortField(f);
            setSortDir('asc');
        }
    };

    const copyNim = (nim: string) => {
        navigator.clipboard.writeText(nim);
        setCopiedNim(nim);
        setTimeout(() => setCopiedNim(null), 2000);
    };

    // ─── Derived ─────────────────────────────────────────
    const sortedLogs = useMemo(() => {
        return [...attendanceLogs].sort((a, b) => {
            const aV: string = (a[sortField] ?? '').toString().toLowerCase();
            const bV: string = (b[sortField] ?? '').toString().toLowerCase();
            if (aV < bV) return sortDir === 'asc' ? -1 : 1;
            if (aV > bV) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [attendanceLogs, sortField, sortDir]);

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field)
            return <ChevronDown className="h-3 w-3 opacity-30" />;
        return sortDir === 'asc' ? (
            <ChevronUp className="h-3 w-3 text-indigo-500" />
        ) : (
            <ChevronDown className="h-3 w-3 text-indigo-500" />
        );
    };

    const formatSessionDate = (d: string) => {
        try {
            return new Date(d).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return d;
        }
    };

    // ─── Status filter chips data ────────────────────────
    const filterChips = [
        { id: 'all', label: 'Semua', count: stats.total, color: 'neutral' },
        { id: 'present', label: 'Hadir', count: stats.hadir, color: 'emerald' },
        {
            id: 'late',
            label: 'Terlambat',
            count: stats.terlambat,
            color: 'amber',
        },
        {
            id: 'absent',
            label: 'Tidak Hadir',
            count: stats.tidak_hadir,
            color: 'red',
        },
    ];

    const chipActiveClass: Record<string, string> = {
        neutral:
            'bg-neutral-800 dark:bg-white text-white dark:text-neutral-900 shadow-lg shadow-neutral-500/30',
        emerald: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
        amber: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30',
        red: 'bg-red-500 text-white shadow-lg shadow-red-500/30',
    };

    // ─── Stat cards config ───────────────────────────────
    const statCards = [
        {
            key: 'total',
            label: 'Total Mahasiswa',
            value: stats.total,
            imgSrc: TotalScanIcon,
            gradient: 'from-blue-400 to-cyan-600',
            shadow: 'shadow-blue-500/30',
            bgGlow: 'bg-blue-500',
            bgOverlay:
                'from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10',
        },
        {
            key: 'hadir',
            label: 'Hadir',
            value: stats.hadir,
            imgSrc: HadirIcon,
            gradient: 'from-emerald-400 to-teal-600',
            shadow: 'shadow-emerald-500/30',
            bgGlow: 'bg-emerald-500',
            bgOverlay:
                'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
        },
        {
            key: 'terlambat',
            label: 'Terlambat',
            value: stats.terlambat,
            imgSrc: TerlambatIcon,
            gradient: 'from-amber-400 to-orange-600',
            shadow: 'shadow-amber-500/30',
            bgGlow: 'bg-amber-500',
            bgOverlay:
                'from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10',
        },
        {
            key: 'tidak_hadir',
            label: 'Tidak Hadir',
            value: stats.tidak_hadir,
            imgSrc: DitolakIcon,
            gradient: 'from-red-400 to-rose-600',
            shadow: 'shadow-red-500/30',
            bgGlow: 'bg-red-500',
            bgOverlay:
                'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10',
        },
    ];

    // ═════════════════════════════════════════════════════
    //  RENDER
    // ═════════════════════════════════════════════════════
    return (
        <DosenLayout>
            <Head title="Rekapan Kehadiran" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
            >
                {/* ═══════ HEADER — Dosen Profile ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl border border-gray-800 p-8 text-white shadow-2xl"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-500"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 animate-pulse rounded-full bg-white/10 blur-3xl" />
                    <div
                        className="absolute -bottom-20 -left-20 h-64 w-64 animate-pulse rounded-full bg-white/10 blur-3xl"
                        style={{ animationDelay: '1s' }}
                    />

                    {/* Floating Pulses */}

                    <div className="relative">
                        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:items-start">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left lg:w-auto">
                                <motion.div
                                    className="relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24"
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
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                >
                                    <img
                                        src={PenilaianIcon}
                                        alt="Rekapan Kehadiran"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        className="flex items-center justify-center gap-2 text-sm font-medium tracking-wide text-indigo-100 sm:justify-start"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <GraduationCap className="h-4 w-4" />{' '}
                                        Rekapan Kehadiran
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        {dosen.nama}
                                        <Sparkles
                                            className="h-6 w-6 animate-spin text-amber-400"
                                            style={{ animationDuration: '3s' }}
                                        />
                                    </motion.h1>
                                    <motion.div
                                        className="mt-1 flex flex-wrap items-center justify-center gap-3 text-sm text-indigo-100 sm:justify-start"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <span className="flex items-center gap-1">
                                            <Award className="h-3.5 w-3.5" />{' '}
                                            NIDN: {dosen.nidn}
                                        </span>
                                        {dosen.email && (
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3.5 w-3.5" />{' '}
                                                {dosen.email}
                                            </span>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleExportPdf}
                                disabled={!sessionId}
                                className="mt-2 flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-6 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-40 lg:mt-0"
                            >
                                <Download className="h-5 w-5" /> Export PDF
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* ═══════ FILTER — Glass Panel ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
                >
                    <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                            <Filter className="h-4 w-4" />
                        </div>
                        <h2 className="font-bold text-neutral-900 dark:text-white">
                            Filter Data
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-end gap-4">
                        {/* Mata Kuliah */}
                        <div className="min-w-[200px] flex-1 space-y-1.5">
                            <label className="ml-1 text-xs font-semibold text-neutral-500 uppercase">
                                Mata Kuliah
                            </label>
                            <div className="relative">
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <select
                                    value={courseId}
                                    onChange={handleCourseChange}
                                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white/60 px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                >
                                    <option value="">Pilih Mata Kuliah</option>
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nama} ({c.sks} SKS)
                                            {c.session_count !== undefined
                                                ? ` • ${c.session_count} sesi`
                                                : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Pertemuan */}
                        <div className="min-w-[200px] flex-1 space-y-1.5">
                            <label className="ml-1 text-xs font-semibold text-neutral-500 uppercase">
                                Pertemuan
                            </label>
                            <div className="relative">
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <select
                                    value={sessionId}
                                    onChange={handleSessionChange}
                                    disabled={
                                        !courseId || sessions.length === 0
                                    }
                                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white/60 px-4 py-2.5 text-sm font-medium text-neutral-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                >
                                    <option value="">Pilih Pertemuan</option>
                                    {sessions.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            Pertemuan {s.meeting_number}
                                            {s.title ? ` - ${s.title}` : ''}
                                            {s.start_at
                                                ? ` • ${formatSessionDate(s.start_at)}`
                                                : ''}
                                            {s.attendance_count !== undefined
                                                ? ` (${s.attendance_count} mhs)`
                                                : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="min-w-[180px] flex-1 space-y-1.5">
                            <label className="ml-1 text-xs font-semibold text-neutral-500 uppercase">
                                Cari
                            </label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Nama / NIM..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleFilter()
                                    }
                                    className="w-full rounded-xl border border-neutral-200 bg-white/60 py-2.5 pr-10 pl-10 text-sm font-medium text-neutral-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            if (courseId && sessionId)
                                                router.get(
                                                    '/dosen/rekapan',
                                                    {
                                                        course_id: courseId,
                                                        session_id: sessionId,
                                                        search: '',
                                                        status: statusFilter,
                                                    },
                                                    { preserveState: true },
                                                );
                                        }}
                                        className="absolute top-1/2 right-3 -translate-y-1/2"
                                    >
                                        <X className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filter Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleFilter}
                            disabled={!courseId || !sessionId}
                            className="flex h-[42px] items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Filter className="h-4 w-4" /> Filter
                        </motion.button>
                    </div>

                    {/* Status Filter Chips */}
                    {sessionId && (
                        <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-200/50 pt-4 dark:border-neutral-700/50">
                            {filterChips.map((chip) => (
                                <motion.button
                                    key={chip.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleStatusChip(chip.id)}
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                                        statusFilter === chip.id
                                            ? chipActiveClass[chip.color]
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                                    }`}
                                >
                                    {chip.label}
                                    <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                                        {chip.count}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* ═══════ STATS CARDS ═══════ */}
                {sessionId && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
                    >
                        {statCards.map((card) => (
                            <motion.div
                                key={card.key}
                                variants={cardVariants}
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
                                className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${card.bgOverlay}`}
                                />
                                <motion.div
                                    animate={{
                                        scale:
                                            hoveredCard === card.key ? 1.5 : 1,
                                        opacity:
                                            hoveredCard === card.key
                                                ? 0.4
                                                : 0.2,
                                    }}
                                    className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${card.bgGlow} blur-3xl transition-all duration-500`}
                                />
                                <div className="relative flex items-center gap-4">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="relative flex h-14 w-14 shrink-0 items-center justify-center"
                                    >
                                        <img
                                            src={card.imgSrc}
                                            alt={card.label}
                                            className="absolute inset-0 h-full w-full object-contain drop-shadow-xl"
                                        />
                                    </motion.div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                            {card.label}
                                        </p>
                                        <div className="mt-1 flex items-baseline gap-2">
                                            <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                                {card.value}
                                            </span>
                                            {card.key === 'hadir' &&
                                                stats.total > 0 && (
                                                    <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-500">
                                                        <ArrowUpRight className="h-3 w-3" />
                                                        {(
                                                            (stats.hadir /
                                                                stats.total) *
                                                            100
                                                        ).toFixed(0)}
                                                        %
                                                    </span>
                                                )}
                                            {card.key === 'tidak_hadir' &&
                                                stats.total > 0 &&
                                                stats.tidak_hadir > 0 && (
                                                    <span className="flex items-center gap-0.5 text-xs font-semibold text-red-500">
                                                        <ArrowDownRight className="h-3 w-3" />
                                                        {(
                                                            (stats.tidak_hadir /
                                                                stats.total) *
                                                            100
                                                        ).toFixed(0)}
                                                        %
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* ═══════ ATTENDANCE RATE BAR ═══════ */}
                {sessionId && stats.total > 0 && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                        className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-neutral-900 dark:text-white">
                                        Tingkat Kehadiran
                                    </h3>
                                    <p className="text-xs text-neutral-500">
                                        Persentase mahasiswa yang hadir atau
                                        terlambat
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-indigo-500" />
                                <span
                                    className={`text-3xl font-black tracking-tight ${stats.attendance_rate >= 80 ? 'text-emerald-500' : stats.attendance_rate >= 60 ? 'text-amber-500' : 'text-red-500'}`}
                                >
                                    {stats.attendance_rate}%
                                </span>
                            </div>
                        </div>
                        <div className="h-4 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                            <motion.div
                                className={`h-full rounded-full ${stats.attendance_rate >= 80 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : stats.attendance_rate >= 60 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.attendance_rate}%` }}
                                transition={{
                                    duration: 1.2,
                                    delay: 0.3,
                                    ease: 'easeOut',
                                }}
                            />
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-neutral-500">
                            <span>0%</span>
                            <span>Minimum 75%</span>
                            <span>100%</span>
                        </div>
                    </motion.div>
                )}

                {/* ═══════ DATA TABLE — "Daftar Kehadiran" ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="overflow-hidden rounded-3xl border border-white/20 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
                >
                    {/* ── Table Header Card ── */}
                    <div className="relative overflow-hidden rounded-t-3xl p-6 text-white">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-20" />
                        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                    }}
                                    className="relative flex h-20 w-20 shrink-0 items-center justify-center sm:h-24 sm:w-24"
                                >
                                    <img
                                        src={PenilaianIcon}
                                        alt="Header Icon"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-2xl"
                                    />
                                </motion.div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">
                                        Daftar Kehadiran
                                    </h2>
                                    {selectedCourse && selectedSession ? (
                                        <p className="mt-0.5 text-sm font-medium text-white/70">
                                            {selectedCourse.nama.toUpperCase()}{' '}
                                            — Pertemuan{' '}
                                            {selectedSession.meeting_number}
                                            {selectedSession.start_at &&
                                                ` • ${formatSessionDate(selectedSession.start_at)}`}
                                        </p>
                                    ) : (
                                        <p className="mt-0.5 text-sm font-medium text-white/70">
                                            Pilih mata kuliah dan pertemuan
                                            untuk melihat data
                                        </p>
                                    )}
                                </div>
                            </div>
                            {attendanceLogs.length > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="hidden items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-md sm:flex"
                                >
                                    <span className="text-sm font-semibold text-white">
                                        {attendanceLogs.length} data
                                    </span>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* ── Table Body ── */}
                    {!sessionId ? (
                        /* Empty: no session selected */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center px-4 py-16"
                        >
                            <div>
                                <ClipboardList className="mb-4 h-24 w-24 text-neutral-300 dark:text-neutral-700" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">
                                Pilih Filter Terlebih Dahulu
                            </h3>
                            <p className="max-w-md text-center text-neutral-500 dark:text-neutral-400">
                                Pilih mata kuliah dan pertemuan di atas untuk
                                menampilkan data kehadiran mahasiswa.
                            </p>
                        </motion.div>
                    ) : attendanceLogs.length === 0 ? (
                        /* Empty: no data */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center px-4 py-16"
                        >
                            <div>
                                <FileSearch className="mb-4 h-24 w-24 text-neutral-300 dark:text-neutral-700" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">
                                Tidak Ada Data Kehadiran
                            </h3>
                            <p className="mb-6 max-w-md text-center text-neutral-500 dark:text-neutral-400">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Tidak ada data yang sesuai dengan filter pencarian Anda.'
                                    : 'Belum ada mahasiswa yang melakukan absensi untuk sesi ini. Pastikan QR code sudah dibagikan kepada mahasiswa.'}
                            </p>
                        </motion.div>
                    ) : (
                        <>
                            {/* ── Desktop Table ── */}
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full">
                                    <thead className="sticky top-0 z-10 bg-gradient-to-r from-neutral-50 to-neutral-100 backdrop-blur-xl dark:from-neutral-900/80 dark:to-neutral-800/80">
                                        <tr>
                                            <th className="w-[60px] px-4 py-4 text-center text-xs font-bold tracking-wider text-neutral-500 uppercase">
                                                No
                                            </th>
                                            <th
                                                className="w-[140px] cursor-pointer px-4 py-4 text-left text-xs font-bold tracking-wider text-neutral-500 uppercase transition-colors hover:text-indigo-600"
                                                onClick={() =>
                                                    handleSort('nim')
                                                }
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    NIM <SortIcon field="nim" />
                                                </span>
                                            </th>
                                            <th
                                                className="cursor-pointer px-4 py-4 text-left text-xs font-bold tracking-wider text-neutral-500 uppercase transition-colors hover:text-indigo-600"
                                                onClick={() =>
                                                    handleSort('nama')
                                                }
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    Nama Mahasiswa{' '}
                                                    <SortIcon field="nama" />
                                                </span>
                                            </th>
                                            <th
                                                className="w-[100px] cursor-pointer px-4 py-4 text-center text-xs font-bold tracking-wider text-neutral-500 uppercase transition-colors hover:text-indigo-600"
                                                onClick={() =>
                                                    handleSort('kelas')
                                                }
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    Kelas{' '}
                                                    <SortIcon field="kelas" />
                                                </span>
                                            </th>
                                            <th className="w-[120px] px-4 py-4 text-center text-xs font-bold tracking-wider text-neutral-500 uppercase">
                                                Jenis
                                            </th>
                                            <th
                                                className="w-[80px] cursor-pointer px-4 py-4 text-center text-xs font-bold tracking-wider text-neutral-500 uppercase transition-colors hover:text-indigo-600"
                                                onClick={() =>
                                                    handleSort('semester')
                                                }
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    Smt{' '}
                                                    <SortIcon field="semester" />
                                                </span>
                                            </th>
                                            <th
                                                className="w-[120px] cursor-pointer px-4 py-4 text-center text-xs font-bold tracking-wider text-neutral-500 uppercase transition-colors hover:text-indigo-600"
                                                onClick={() =>
                                                    handleSort('status')
                                                }
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    Status{' '}
                                                    <SortIcon field="status" />
                                                </span>
                                            </th>
                                            <th
                                                className="w-[140px] cursor-pointer px-4 py-4 text-center text-xs font-bold tracking-wider text-neutral-500 uppercase transition-colors hover:text-indigo-600"
                                                onClick={() =>
                                                    handleSort('scanned_at')
                                                }
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    Waktu{' '}
                                                    <SortIcon field="scanned_at" />
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        <AnimatePresence>
                                            {sortedLogs.map((log, index) => {
                                                const sc =
                                                    statusConfig[log.status];
                                                const StatusIcon =
                                                    sc?.icon ?? CheckCircle;
                                                const jc = jenisConfig[
                                                    log.jenis_reguler
                                                ] ?? {
                                                    bg: 'bg-neutral-100 dark:bg-neutral-800',
                                                    text: 'text-neutral-700 dark:text-neutral-300',
                                                };
                                                const sg =
                                                    semesterGradient[
                                                        log.semester
                                                    ] ??
                                                    'from-indigo-500 to-purple-600';

                                                return (
                                                    <motion.tr
                                                        key={log.id}
                                                        initial={{
                                                            opacity: 0,
                                                            x: -20,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            x: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            x: 20,
                                                        }}
                                                        transition={{
                                                            delay: Math.min(
                                                                index * 0.05,
                                                                0.5,
                                                            ),
                                                        }}
                                                        whileHover={{
                                                            backgroundColor:
                                                                'rgba(59, 130, 246, 0.05)',
                                                        }}
                                                        onClick={() =>
                                                            log.id > 0 &&
                                                            router.visit(
                                                                `/dosen/rekapan/${log.id}`,
                                                            )
                                                        }
                                                        className={`group border-b border-neutral-100 dark:border-neutral-800 ${log.id > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                                                    >
                                                        {/* No */}
                                                        <td className="sticky left-0 bg-neutral-50/50 px-4 py-3 text-center text-sm font-bold text-neutral-900 dark:bg-neutral-900/50 dark:text-white">
                                                            {index + 1}
                                                        </td>

                                                        {/* NIM */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-sm text-neutral-700 dark:text-neutral-300">
                                                                    {log.nim}
                                                                </span>
                                                                <button
                                                                    onClick={() =>
                                                                        copyNim(
                                                                            log.nim,
                                                                        )
                                                                    }
                                                                    className="opacity-0 transition-opacity group-hover:opacity-100"
                                                                    title="Copy NIM"
                                                                >
                                                                    {copiedNim ===
                                                                    log.nim ? (
                                                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                                                    ) : (
                                                                        <Copy className="h-3.5 w-3.5 text-neutral-400 hover:text-neutral-600" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </td>

                                                        {/* Nama + Avatar */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-lg">
                                                                    {log.nama.charAt(
                                                                        0,
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                                                                        {
                                                                            log.nama
                                                                        }
                                                                    </p>
                                                                    <div className="mt-0.5 flex items-center gap-1">
                                                                        <GraduationCap className="h-3 w-3 shrink-0 text-blue-500" />
                                                                        <span className="truncate text-xs text-neutral-500">
                                                                            {
                                                                                log.prodi
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Kelas */}
                                                        <td className="px-4 py-3 text-center">
                                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                                {log.kelas}
                                                            </span>
                                                        </td>

                                                        {/* Jenis */}
                                                        <td className="px-4 py-3 text-center">
                                                            <span
                                                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${jc.bg} ${jc.text}`}
                                                            >
                                                                {log.jenis_reguler ===
                                                                'Karyawan' ? (
                                                                    <Briefcase className="h-3 w-3" />
                                                                ) : (
                                                                    <CheckCircle className="h-3 w-3" />
                                                                )}
                                                                {
                                                                    log.jenis_reguler
                                                                }
                                                            </span>
                                                        </td>

                                                        {/* Semester */}
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex flex-col items-center">
                                                                <span
                                                                    className={`bg-gradient-to-br text-2xl font-bold ${sg} bg-clip-text text-transparent`}
                                                                >
                                                                    {
                                                                        log.semester
                                                                    }
                                                                </span>
                                                                <span className="text-[10px] tracking-wider text-neutral-400 uppercase">
                                                                    Semester
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-4 py-3 text-center">
                                                            {sc ? (
                                                                <motion.div
                                                                    initial={{
                                                                        scale: 0,
                                                                        rotate: -180,
                                                                    }}
                                                                    animate={{
                                                                        scale: 1,
                                                                        rotate: 0,
                                                                    }}
                                                                    transition={{
                                                                        type: 'spring',
                                                                        stiffness: 260,
                                                                        damping: 20,
                                                                        delay: Math.min(
                                                                            index *
                                                                                0.1,
                                                                            0.5,
                                                                        ),
                                                                    }}
                                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white ${sc.bg} ${sc.ring} ${sc.glow}`}
                                                                >
                                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                                    {sc.label}
                                                                </motion.div>
                                                            ) : (
                                                                <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                                    {log.status}
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Waktu */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Clock className="h-3.5 w-3.5 text-neutral-400" />
                                                                    <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-white">
                                                                        {log.scanned_at ||
                                                                            '-'}
                                                                    </span>
                                                                </div>
                                                                {log.scanned_date && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3 text-neutral-400" />
                                                                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                            {
                                                                                log.scanned_date
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>

                            {/* ── Mobile Card View ── */}
                            <div className="space-y-3 p-4 md:hidden">
                                {sortedLogs.map((log, index) => {
                                    const sc = statusConfig[log.status];
                                    const StatusIcon = sc?.icon ?? CheckCircle;
                                    const sg =
                                        semesterGradient[log.semester] ??
                                        'from-indigo-500 to-purple-600';

                                    return (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: Math.min(
                                                    index * 0.05,
                                                    0.4,
                                                ),
                                            }}
                                            onClick={() =>
                                                log.id > 0 &&
                                                router.visit(
                                                    `/dosen/rekapan/${log.id}`,
                                                )
                                            }
                                            className={`rounded-2xl border border-neutral-200 bg-neutral-50 p-4 transition-transform dark:border-neutral-700 dark:bg-neutral-800/50 ${log.id > 0 ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'}`}
                                        >
                                            {/* Name Row */}
                                            <div className="mb-3 flex items-center gap-3">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white shadow-lg">
                                                    {log.nama.charAt(0)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-semibold text-neutral-900 dark:text-white">
                                                        {log.nama}
                                                    </p>
                                                    <p className="font-mono text-xs text-neutral-500">
                                                        {log.nim}
                                                    </p>
                                                </div>
                                                {sc && (
                                                    <div
                                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white ${sc.bg} ${sc.glow}`}
                                                    >
                                                        <StatusIcon className="h-3 w-3" />{' '}
                                                        {sc.label}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info Grid */}
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-neutral-500">
                                                        Kelas:
                                                    </span>
                                                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {log.kelas}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-neutral-500">
                                                        Semester:
                                                    </span>
                                                    <span
                                                        className={`bg-gradient-to-br font-bold ${sg} bg-clip-text text-transparent`}
                                                    >
                                                        {log.semester}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-neutral-500">
                                                        Jenis:
                                                    </span>
                                                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                                        {log.jenis_reguler}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-neutral-500">
                                                        Waktu:
                                                    </span>
                                                    <span className="font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                                        {log.scanned_at || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </DosenLayout>
    );
}
