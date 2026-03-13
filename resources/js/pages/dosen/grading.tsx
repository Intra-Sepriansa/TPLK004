import { AnimatedCounter } from '@/components/ui/animated-counter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DosenLayout from '@/layouts/dosen-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowUpDown,
    Award,
    BarChart3,
    CheckCircle,
    Clock,
    Download,
    Eye,
    FileSpreadsheet,
    FileText,
    Filter,
    GraduationCap,
    RefreshCw,
    Search,
    ShieldAlert,
    Sparkles,
    Target,
    X,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

// Assets
import BeresikoIcon from '@/assets/grading/beresiko.png';
import MahasiswaIcon from '@/assets/grading/mahasiswa.png';
import PenilaianIcon from '@/assets/grading/penilaian.png';
import RataRataIcon from '@/assets/grading/rata-rata.png';
import SesiIcon from '@/assets/grading/sesi.png';

interface Session {
    id: number;
    meeting_number: number;
    title: string;
    date: string;
}
interface Grade {
    mahasiswa_id: number;
    nama: string;
    nim: string;
    total_sessions: number;
    attended_sessions: number;
    attendance_rate: number;
    average_points: number;
    attendance_grade: number;
    grade_letter: string;
    can_take_uas: boolean;
    details: Array<{
        meeting: number;
        title: string;
        date: string;
        status: string;
        points: number;
    }>;
}
interface Props {
    dosen: { id: number; nama: string };
    course: { id: number; nama: string; kode: string; sks: number } | null;
    sessions: Session[];
    grades: {
        course: { id: number; nama: string; sks: number };
        summary: {
            total_students: number;
            total_sessions: number;
            grade_distribution: Record<string, number>;
            average_attendance_rate: number;
            students_at_risk: number;
        };
        grades: Grade[];
    } | null;
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
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
} as const;

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
    hover: {
        y: -5,
        scale: 1.02,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
    },
} as const;

export default function Grading({ dosen, course, sessions, grades }: Props) {
    const [activeTab, setActiveTab] = useState<
        'nilai' | 'statistik' | 'at-risk'
    >('nilai');
    const [overrideModal, setOverrideModal] = useState<{
        open: boolean;
        logId: number | null;
        currentStatus: string;
    }>({ open: false, logId: null, currentStatus: '' });
    const [detailModal, setDetailModal] = useState<{
        open: boolean;
        student: Grade | null;
    }>({ open: false, student: null });
    const [showExportModal, setShowExportModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'nim' | 'rate' | 'grade'>(
        'name',
    );
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [filterGrade, setFilterGrade] = useState('all');
    const [filterUAS, setFilterUAS] = useState('all');
    const [filterSession, setFilterSession] = useState('all');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const overrideForm = useForm({ log_id: 0, status: '', reason: '' });

    const stats = grades?.summary ?? {
        total_students: 0,
        total_sessions: 0,
        grade_distribution: {},
        average_attendance_rate: 0,
        students_at_risk: 0,
    };

    const filteredGrades = useMemo(() => {
        if (!grades) return [];
        let filtered = grades.grades.filter((g) => {
            const matchSearch =
                g.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                g.nim.includes(searchQuery);
            const matchGrade =
                filterGrade === 'all' || g.grade_letter === filterGrade;
            const matchUAS =
                filterUAS === 'all' ||
                (filterUAS === 'can' && g.can_take_uas) ||
                (filterUAS === 'cannot' && !g.can_take_uas);
            let matchSession = true;
            if (filterSession !== 'all') {
                const sessionNum = parseInt(filterSession);
                matchSession = g.details.some((d) => d.meeting === sessionNum);
            }
            return matchSearch && matchGrade && matchUAS && matchSession;
        });
        filtered.sort((a, b) => {
            let c = 0;
            switch (sortBy) {
                case 'name':
                    c = a.nama.localeCompare(b.nama);
                    break;
                case 'nim':
                    c = a.nim.localeCompare(b.nim);
                    break;
                case 'rate':
                    c = a.attendance_rate - b.attendance_rate;
                    break;
                case 'grade': {
                    const o: Record<string, number> = {
                        A: 5,
                        B: 4,
                        C: 3,
                        D: 2,
                        E: 1,
                    };
                    c = (o[a.grade_letter] ?? 0) - (o[b.grade_letter] ?? 0);
                    break;
                }
            }
            return sortOrder === 'asc' ? c : -c;
        });
        return filtered;
    }, [
        grades,
        searchQuery,
        sortBy,
        sortOrder,
        filterGrade,
        filterUAS,
        filterSession,
    ]);

    const atRiskStudents = useMemo(
        () => grades?.grades.filter((g) => !g.can_take_uas) ?? [],
        [grades],
    );

    const handleExportCsv = () => {
        window.location.href = '/dosen/grading/export';
    };
    const handleExportPdf = () => {
        window.location.href = '/dosen/grading/export-pdf';
    };
    const handleRefresh = () => {
        router.reload();
    };
    const handleOverride = () => {
        overrideForm.post('/dosen/grading/override', {
            onSuccess: () => {
                setOverrideModal({
                    open: false,
                    logId: null,
                    currentStatus: '',
                });
                overrideForm.reset();
            },
        });
    };
    const toggleStudent = (id: number) =>
        setSelectedStudents((p) =>
            p.includes(id) ? p.filter((x) => x !== id) : [...p, id],
        );
    const selectAllStudents = () => {
        if (!grades) return;
        setSelectedStudents((p) =>
            p.length === grades.grades.length
                ? []
                : grades.grades.map((g) => g.mahasiswa_id),
        );
    };

    const getGradeColor = (l: string) => {
        switch (l) {
            case 'A':
                return 'bg-emerald-500';
            case 'B':
                return 'bg-blue-500';
            case 'C':
                return 'bg-amber-500';
            case 'D':
                return 'bg-orange-500';
            default:
                return 'bg-red-500';
        }
    };
    const getGradeTextColor = (l: string) => {
        switch (l) {
            case 'A':
                return 'text-emerald-600';
            case 'B':
                return 'text-blue-600';
            case 'C':
                return 'text-amber-600';
            case 'D':
                return 'text-orange-600';
            default:
                return 'text-red-600';
        }
    };
    const getStatusColor = (s: string) => {
        switch (s) {
            case 'present':
                return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
            case 'late':
                return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
            case 'permit':
            case 'sick':
                return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
            default:
                return 'text-red-600 bg-red-100 dark:bg-red-900/30';
        }
    };
    const getStatusLabel = (s: string) => {
        switch (s) {
            case 'present':
                return 'Hadir';
            case 'late':
                return 'Terlambat';
            case 'permit':
                return 'Izin';
            case 'sick':
                return 'Sakit';
            case 'absent':
                return 'Absen';
            case 'rejected':
                return 'Ditolak';
            default:
                return s;
        }
    };

    const gradeDistData = useMemo(() => {
        if (!grades) return [];
        const dist = grades.summary.grade_distribution;
        const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
        return ['A', 'B', 'C', 'D', 'E'].map((g) => ({
            grade: g,
            count: dist[g] ?? 0,
            pct: Math.round(((dist[g] ?? 0) / total) * 100),
        }));
    }, [grades]);

    const rateRanges = useMemo(() => {
        if (!grades) return [];
        const ranges = [
            { label: '90-100%', min: 90, max: 100, color: 'bg-emerald-500' },
            { label: '80-89%', min: 80, max: 89, color: 'bg-blue-500' },
            { label: '70-79%', min: 70, max: 79, color: 'bg-amber-500' },
            { label: '60-69%', min: 60, max: 69, color: 'bg-orange-500' },
            { label: '<60%', min: 0, max: 59, color: 'bg-red-500' },
        ];
        return ranges.map((r) => ({
            ...r,
            count: grades.grades.filter(
                (g) => g.attendance_rate >= r.min && g.attendance_rate <= r.max,
            ).length,
        }));
    }, [grades]);

    // ── RENDER ──────────────────────────────────────────────
    return (
        <DosenLayout dosen={dosen}>
            <Head title="Penilaian Kehadiran" />
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-6"
            >
                {/* ═══════ HEADER ═══════ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
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
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left lg:w-auto">
                                <motion.div
                                    className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
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
                                        alt="Penilaian"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-indigo-100"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Manajemen Penilaian
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Nilai Kehadiran Mahasiswa
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 max-w-lg text-sm leading-relaxed text-indigo-100"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        {course
                                            ? `${course.nama} (${course.sks} SKS)`
                                            : 'Sistem Kalkulasi Otomatis Berbasis Presensi Real-Time'}
                                    </motion.p>
                                </div>
                            </div>
                            {grades && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.6, type: 'spring' }}
                                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/20 px-6 py-3 shadow-lg backdrop-blur-xl"
                                >
                                    <div className="rounded-lg bg-indigo-500/20 p-2">
                                        <Award className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-indigo-100">
                                            Rata-rata Kelas
                                        </p>
                                        <p className="text-2xl font-bold text-white">
                                            {stats.average_attendance_rate}%
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                        {grades && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6"
                            >
                                <motion.button
                                    whileHover={{
                                        scale: 1.02,
                                        backgroundColor:
                                            'rgba(255,255,255,0.25)',
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleRefresh}
                                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md"
                                >
                                    <RefreshCw className="h-4 w-4" /> Refresh
                                    Data
                                </motion.button>
                                <motion.button
                                    whileHover={{
                                        scale: 1.02,
                                        backgroundColor:
                                            'rgba(255,255,255,0.25)',
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowExportModal(true)}
                                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md"
                                >
                                    <Download className="h-4 w-4" /> Export
                                    Laporan
                                </motion.button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* ═══════ NO COURSE STATE ═══════ */}
                {!course && (
                    <motion.div
                        variants={itemVariants}
                        className="relative z-0 rounded-3xl border border-white/20 bg-white/40 p-12 text-center shadow-xl backdrop-blur-xl dark:bg-neutral-900/40"
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        >
                            <GraduationCap className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
                        </motion.div>
                        <p className="text-neutral-500">
                            Anda belum memiliki mata kuliah yang diajarkan
                        </p>
                    </motion.div>
                )}

                {/* ═══════ CONTENT (when grades exist) ═══════ */}
                {grades && (
                    <>
                        {/* SUMMARY CARDS */}
                        <motion.div
                            variants={containerVariants}
                            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
                        >
                            {[
                                {
                                    key: 'students',
                                    label: 'Total Mahasiswa',
                                    value: stats.total_students,
                                    icon: MahasiswaIcon,
                                    hoverShadow: 'hover:shadow-violet-500/10',
                                    gradBg: 'from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10',
                                },
                                {
                                    key: 'average',
                                    label: 'Rata-rata Kehadiran',
                                    value: stats.average_attendance_rate,
                                    suffix: '%',
                                    icon: RataRataIcon,
                                    hoverShadow: 'hover:shadow-emerald-500/10',
                                    gradBg: 'from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10',
                                },
                                {
                                    key: 'sessions',
                                    label: 'Total Pertemuan',
                                    value: stats.total_sessions,
                                    icon: SesiIcon,
                                    hoverShadow: 'hover:shadow-blue-500/10',
                                    gradBg: 'from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10',
                                },
                                {
                                    key: 'risk',
                                    label: 'Tidak Bisa UAS',
                                    value: stats.students_at_risk,
                                    icon: BeresikoIcon,
                                    hoverShadow: 'hover:shadow-red-500/10',
                                    gradBg: 'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10',
                                },
                            ].map((card) => (
                                <motion.div
                                    key={card.key}
                                    variants={cardVariants}
                                    whileHover="hover"
                                    onHoverStart={() =>
                                        setHoveredCard(card.key)
                                    }
                                    onHoverEnd={() => setHoveredCard(null)}
                                    className={`group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all dark:bg-neutral-900/40 ${card.hoverShadow}`}
                                >
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br ${card.gradBg}`}
                                    />
                                    <motion.div
                                        animate={{
                                            scale:
                                                hoveredCard === card.key
                                                    ? 1.5
                                                    : 1,
                                            opacity:
                                                hoveredCard === card.key
                                                    ? 0.4
                                                    : 0.2,
                                        }}
                                        className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white blur-3xl transition-all duration-500"
                                    />
                                    <div className="relative flex items-center gap-4">
                                        <motion.div
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 10,
                                            }}
                                            className="relative flex h-14 w-14 shrink-0 items-center justify-center"
                                        >
                                            <img
                                                src={card.icon}
                                                alt={card.label}
                                                className="absolute inset-0 h-full w-full object-contain drop-shadow-xl"
                                            />
                                        </motion.div>
                                        <div>
                                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                                {card.label}
                                            </p>
                                            <div className="mt-1">
                                                <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                                    <AnimatedCounter
                                                        value={card.value}
                                                        duration={1500}
                                                    />
                                                    {card.suffix ?? ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* NAVIGATION TABS */}
                        <motion.div
                            variants={itemVariants}
                            className="flex w-fit gap-1 rounded-2xl border border-white/20 bg-neutral-100/50 p-1 backdrop-blur-md dark:bg-neutral-900/50"
                        >
                            {(
                                [
                                    {
                                        key: 'nilai',
                                        label: 'Daftar Nilai',
                                        icon: BarChart3,
                                    },
                                    {
                                        key: 'statistik',
                                        label: 'Statistik',
                                        icon: Target,
                                    },
                                    {
                                        key: 'at-risk',
                                        label: 'Mahasiswa At-Risk',
                                        icon: AlertTriangle,
                                    },
                                ] as const
                            ).map((tab) => (
                                <motion.button
                                    key={tab.key}
                                    layout
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`relative rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${activeTab === tab.key ? 'text-indigo-700 shadow-sm dark:text-indigo-300' : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400'}`}
                                >
                                    {activeTab === tab.key && (
                                        <motion.div
                                            layoutId="gradingActiveTab"
                                            className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-neutral-800"
                                            transition={{
                                                type: 'spring',
                                                bounce: 0.2,
                                                duration: 0.6,
                                            }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <tab.icon className="h-4 w-4" />
                                        {tab.label}
                                    </span>
                                </motion.button>
                            ))}
                        </motion.div>

                        {/* ═══════ TAB: NILAI ═══════ */}
                        {activeTab === 'nilai' && (
                            <>
                                {/* Filter Section */}
                                <motion.div
                                    variants={itemVariants}
                                    className="space-y-4 rounded-3xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
                                >
                                    <div className="mb-5 flex items-center gap-3">
                                        <motion.div
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 10,
                                            }}
                                            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                                        >
                                            <Filter className="h-6 w-6" />
                                        </motion.div>
                                        <div>
                                            <h3 className="font-bold text-neutral-900 dark:text-white">
                                                Filter & Pencarian
                                            </h3>
                                            <p className="text-sm text-neutral-500">
                                                Temukan data mahasiswa dengan
                                                mudah
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-5">
                                        <div className="md:col-span-2">
                                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Cari Mahasiswa
                                            </label>
                                            <div className="relative">
                                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                                <Input
                                                    type="text"
                                                    placeholder="Nama atau NIM..."
                                                    value={searchQuery}
                                                    onChange={(e) =>
                                                        setSearchQuery(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="border-2 pl-10 focus:ring-4 focus:ring-blue-500/20"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Pertemuan
                                            </label>
                                            <Select
                                                value={filterSession}
                                                onValueChange={setFilterSession}
                                            >
                                                <SelectTrigger className="border-2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        Semua
                                                    </SelectItem>
                                                    {sessions.map((s) => (
                                                        <SelectItem
                                                            key={s.id}
                                                            value={String(
                                                                s.meeting_number,
                                                            )}
                                                        >
                                                            Pertemuan{' '}
                                                            {s.meeting_number}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Grade
                                            </label>
                                            <Select
                                                value={filterGrade}
                                                onValueChange={setFilterGrade}
                                            >
                                                <SelectTrigger className="border-2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        Semua
                                                    </SelectItem>
                                                    {[
                                                        'A',
                                                        'B',
                                                        'C',
                                                        'D',
                                                        'E',
                                                    ].map((g) => (
                                                        <SelectItem
                                                            key={g}
                                                            value={g}
                                                        >
                                                            {g}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                Status UAS
                                            </label>
                                            <Select
                                                value={filterUAS}
                                                onValueChange={setFilterUAS}
                                            >
                                                <SelectTrigger className="border-2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        Semua
                                                    </SelectItem>
                                                    <SelectItem value="can">
                                                        Bisa UAS
                                                    </SelectItem>
                                                    <SelectItem value="cannot">
                                                        Tidak Bisa
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() =>
                                                    setSortOrder((o) =>
                                                        o === 'asc'
                                                            ? 'desc'
                                                            : 'asc',
                                                    )
                                                }
                                                className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                                            >
                                                <ArrowUpDown className="h-4 w-4" />{' '}
                                                {sortOrder === 'asc'
                                                    ? 'A → Z'
                                                    : 'Z → A'}
                                            </motion.button>
                                            <span className="text-sm text-neutral-500">
                                                Menampilkan{' '}
                                                {filteredGrades.length} dari{' '}
                                                {grades.grades.length} mahasiswa
                                            </span>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setSearchQuery('');
                                                setFilterGrade('all');
                                                setFilterUAS('all');
                                                setFilterSession('all');
                                                setSortBy('name');
                                                setSortOrder('asc');
                                            }}
                                            className="rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                                        >
                                            Reset Filter
                                        </motion.button>
                                    </div>
                                </motion.div>

                                {/* Grades Table */}
                                <motion.div
                                    variants={itemVariants}
                                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/50 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
                                >
                                    <div className="border-b border-neutral-200 bg-neutral-50/50 p-6 dark:border-neutral-800 dark:bg-black/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    whileHover={{
                                                        scale: 1.1,
                                                        rotate: 10,
                                                    }}
                                                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                                                >
                                                    <BarChart3 className="h-6 w-6" />
                                                </motion.div>
                                                <div>
                                                    <h2 className="font-bold text-neutral-900 dark:text-white">
                                                        Daftar Nilai Mahasiswa
                                                    </h2>
                                                    <p className="text-sm text-neutral-500">
                                                        {grades.course.nama} (
                                                        {grades.course.sks} SKS)
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleExportCsv}
                                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30"
                                                >
                                                    <FileSpreadsheet className="h-4 w-4" />{' '}
                                                    CSV
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleExportPdf}
                                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-red-500/30"
                                                >
                                                    <FileText className="h-4 w-4" />{' '}
                                                    PDF
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-neutral-50/50 dark:bg-neutral-800/50">
                                                    <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-neutral-700 uppercase dark:text-neutral-300">
                                                        No
                                                    </th>
                                                    <th
                                                        className="cursor-pointer px-4 py-4 text-left text-xs font-bold tracking-wider text-neutral-700 uppercase dark:text-neutral-300"
                                                        onClick={() => {
                                                            setSortBy('nim');
                                                            setSortOrder((o) =>
                                                                o === 'asc'
                                                                    ? 'desc'
                                                                    : 'asc',
                                                            );
                                                        }}
                                                    >
                                                        NIM
                                                    </th>
                                                    <th
                                                        className="cursor-pointer px-4 py-4 text-left text-xs font-bold tracking-wider text-neutral-700 uppercase dark:text-neutral-300"
                                                        onClick={() => {
                                                            setSortBy('name');
                                                            setSortOrder((o) =>
                                                                o === 'asc'
                                                                    ? 'desc'
                                                                    : 'asc',
                                                            );
                                                        }}
                                                    >
                                                        Nama
                                                    </th>
                                                    <th className="px-4 py-4 text-center text-xs font-bold tracking-wider text-neutral-700 uppercase dark:text-neutral-300">
                                                        Hadir
                                                    </th>
                                                    <th
                                                        className="cursor-pointer px-4 py-4 text-center text-xs font-bold tracking-wider text-neutral-700 uppercase dark:text-neutral-300"
                                                        onClick={() => {
                                                            setSortBy('rate');
                                                            setSortOrder((o) =>
                                                                o === 'asc'
                                                                    ? 'desc'
                                                                    : 'asc',
                                                            );
                                                        }}
                                                    >
                                                        Rate
                                                    </th>
                                                    <th className="px-4 py-4 text-center text-xs font-bold tracking-wider text-neutral-700 uppercase dark:text-neutral-300">
                                                        Poin
                                                    </th>
                                                    <th
                                                        className="cursor-pointer px-4 py-4 text-center text-xs font-bold tracking-wider text-neutral-700 uppercase dark:text-neutral-300"
                                                        onClick={() => {
                                                            setSortBy('grade');
                                                            setSortOrder((o) =>
                                                                o === 'asc'
                                                                    ? 'desc'
                                                                    : 'asc',
                                                            );
                                                        }}
                                                    >
                                                        Grade
                                                    </th>
                                                    <th className="px-4 py-4 text-center text-xs font-bold tracking-wider text-neutral-700 uppercase dark:text-neutral-300">
                                                        UAS
                                                    </th>
                                                    <th className="px-4 py-4 text-center text-xs font-bold tracking-wider text-neutral-700 uppercase dark:text-neutral-300">
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-200/50 dark:divide-neutral-800">
                                                {filteredGrades.length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={9}
                                                            className="px-4 py-12 text-center"
                                                        >
                                                            <motion.div
                                                                initial={{
                                                                    opacity: 0,
                                                                    scale: 0.9,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    scale: 1,
                                                                }}
                                                            >
                                                                <Search className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                                                                <p className="text-neutral-500">
                                                                    Tidak ada
                                                                    data yang
                                                                    sesuai
                                                                    dengan
                                                                    filter
                                                                </p>
                                                            </motion.div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredGrades.map(
                                                        (g, idx) => (
                                                            <motion.tr
                                                                key={
                                                                    g.mahasiswa_id
                                                                }
                                                                initial={{
                                                                    opacity: 0,
                                                                    x: -20,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    x: 0,
                                                                }}
                                                                transition={{
                                                                    duration: 0.3,
                                                                    delay:
                                                                        idx *
                                                                        0.02,
                                                                }}
                                                                whileHover={{
                                                                    x: 5,
                                                                    backgroundColor:
                                                                        'rgba(99,102,241,0.05)',
                                                                }}
                                                                className="transition-colors"
                                                            >
                                                                <td className="px-4 py-4 font-medium text-neutral-600 dark:text-neutral-400">
                                                                    {idx + 1}
                                                                </td>
                                                                <td className="px-4 py-4 font-mono text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                                                                    {g.nim}
                                                                </td>
                                                                <td className="px-4 py-4 font-medium text-neutral-900 dark:text-white">
                                                                    {g.nama}
                                                                </td>
                                                                <td className="px-4 py-4 text-center">
                                                                    <span className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                                        {
                                                                            g.attended_sessions
                                                                        }
                                                                        /
                                                                        {
                                                                            g.total_sessions
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-4">
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        <Progress
                                                                            value={
                                                                                g.attendance_rate
                                                                            }
                                                                            className="h-2 w-20"
                                                                        />
                                                                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                                                            {
                                                                                g.attendance_rate
                                                                            }
                                                                            %
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-4 text-center">
                                                                    <span className="inline-flex items-center rounded-lg bg-purple-100 px-2 py-1 text-xs font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                                        {
                                                                            g.average_points
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-4 text-center">
                                                                    <motion.span
                                                                        whileHover={{
                                                                            scale: 1.15,
                                                                            y: -2,
                                                                        }}
                                                                        className={`inline-block rounded-lg px-3 py-1.5 text-sm font-bold text-white shadow-lg ${getGradeColor(g.grade_letter)}`}
                                                                    >
                                                                        {
                                                                            g.grade_letter
                                                                        }
                                                                    </motion.span>
                                                                </td>
                                                                <td className="px-4 py-4 text-center">
                                                                    {g.can_take_uas ? (
                                                                        <motion.div
                                                                            whileHover={{
                                                                                scale: 1.2,
                                                                            }}
                                                                        >
                                                                            <CheckCircle className="mx-auto h-6 w-6 text-emerald-500" />
                                                                        </motion.div>
                                                                    ) : (
                                                                        <motion.div
                                                                            whileHover={{
                                                                                scale: 1.2,
                                                                            }}
                                                                        >
                                                                            <AlertTriangle className="mx-auto h-6 w-6 text-red-500" />
                                                                        </motion.div>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-4 text-center">
                                                                    <div className="flex items-center justify-center gap-1.5">
                                                                        <motion.button
                                                                            whileHover={{
                                                                                scale: 1.05,
                                                                            }}
                                                                            whileTap={{
                                                                                scale: 0.95,
                                                                            }}
                                                                            onClick={() =>
                                                                                setDetailModal(
                                                                                    {
                                                                                        open: true,
                                                                                        student:
                                                                                            g,
                                                                                    },
                                                                                )
                                                                            }
                                                                            className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-blue-500/30"
                                                                        >
                                                                            <Eye className="h-3 w-3" />{' '}
                                                                            Quick
                                                                        </motion.button>
                                                                        <motion.button
                                                                            whileHover={{
                                                                                scale: 1.05,
                                                                            }}
                                                                            whileTap={{
                                                                                scale: 0.95,
                                                                            }}
                                                                            onClick={() =>
                                                                                router.visit(
                                                                                    `/dosen/grading/detail/${g.mahasiswa_id}`,
                                                                                )
                                                                            }
                                                                            className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-indigo-500/30"
                                                                        >
                                                                            <Sparkles className="h-3 w-3" />{' '}
                                                                            Detail
                                                                        </motion.button>
                                                                    </div>
                                                                </td>
                                                            </motion.tr>
                                                        ),
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            </>
                        )}

                        {/* ═══════ TAB: STATISTIK ═══════ */}
                        {activeTab === 'statistik' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid gap-6 md:grid-cols-2"
                            >
                                {/* Grade Distribution */}
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
                                >
                                    <div>
                                        <div className="mb-6 flex items-center gap-3">
                                            <motion.div
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 10,
                                                }}
                                                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 text-white shadow-lg shadow-violet-500/30"
                                            >
                                                <BarChart3 className="h-6 w-6" />
                                            </motion.div>
                                            <div>
                                                <h3 className="font-bold text-neutral-900 dark:text-white">
                                                    Distribusi Grade
                                                </h3>
                                                <p className="text-sm text-neutral-500">
                                                    Sebaran nilai kehadiran
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {gradeDistData.map((d) => (
                                                <div
                                                    key={d.grade}
                                                    className="flex items-center gap-3"
                                                >
                                                    <motion.span
                                                        whileHover={{
                                                            scale: 1.15,
                                                        }}
                                                        className={`h-10 w-10 rounded-xl ${getGradeColor(d.grade)} flex items-center justify-center text-lg font-bold text-white shadow-lg`}
                                                    >
                                                        {d.grade}
                                                    </motion.span>
                                                    <div className="flex-1">
                                                        <div className="mb-1 flex justify-between text-sm">
                                                            <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                                                {d.count}{' '}
                                                                mahasiswa
                                                            </span>
                                                            <span className="font-bold text-neutral-900 dark:text-white">
                                                                {d.pct}%
                                                            </span>
                                                        </div>
                                                        <div className="h-3 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                                                            <motion.div
                                                                initial={{
                                                                    width: 0,
                                                                }}
                                                                animate={{
                                                                    width: `${d.pct}%`,
                                                                }}
                                                                transition={{
                                                                    duration: 1,
                                                                    delay: 0.3,
                                                                }}
                                                                className={`h-full rounded-full ${getGradeColor(d.grade)}`}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Attendance Rate Ranges */}
                                <motion.div
                                    variants={itemVariants}
                                    className="rounded-3xl border border-white/20 bg-white/50 p-6 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
                                >
                                    <div>
                                        <div className="mb-6 flex items-center gap-3">
                                            <motion.div
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 10,
                                                }}
                                                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                                            >
                                                <Target className="h-6 w-6" />
                                            </motion.div>
                                            <div>
                                                <h3 className="font-bold text-neutral-900 dark:text-white">
                                                    Rentang Kehadiran
                                                </h3>
                                                <p className="text-sm text-neutral-500">
                                                    Distribusi persentase
                                                    kehadiran
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {rateRanges.map((r) => (
                                                <div
                                                    key={r.label}
                                                    className="flex items-center gap-3"
                                                >
                                                    <span className="w-16 font-mono text-sm font-bold text-neutral-600 dark:text-neutral-400">
                                                        {r.label}
                                                    </span>
                                                    <div className="flex-1">
                                                        <div className="h-3 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                                                            <motion.div
                                                                initial={{
                                                                    width: 0,
                                                                }}
                                                                animate={{
                                                                    width: `${stats.total_students ? (r.count / stats.total_students) * 100 : 0}%`,
                                                                }}
                                                                transition={{
                                                                    duration: 1,
                                                                    delay: 0.3,
                                                                }}
                                                                className={`h-full rounded-full ${r.color}`}
                                                            />
                                                        </div>
                                                    </div>
                                                    <span className="w-8 text-right text-sm font-bold text-neutral-900 dark:text-white">
                                                        {r.count}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Summary Stats */}
                                        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-neutral-200/50 pt-4 dark:border-neutral-800">
                                            <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-900/20">
                                                <p className="text-2xl font-bold text-emerald-600">
                                                    {
                                                        stats.average_attendance_rate
                                                    }
                                                    %
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    Rata-rata
                                                </p>
                                            </div>
                                            <div className="rounded-xl bg-blue-50 p-3 text-center dark:bg-blue-900/20">
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {stats.total_students}
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    Mahasiswa
                                                </p>
                                            </div>
                                            <div className="rounded-xl bg-red-50 p-3 text-center dark:bg-red-900/20">
                                                <p className="text-2xl font-bold text-red-600">
                                                    {stats.students_at_risk}
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    At-Risk
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {/* ═══════ TAB: AT-RISK ═══════ */}
                        {activeTab === 'at-risk' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Alert Banner */}
                                <motion.div
                                    variants={itemVariants}
                                    className="relative overflow-hidden rounded-3xl border border-red-200/50 bg-gradient-to-br from-red-50 to-orange-50 p-6 shadow-xl backdrop-blur-xl dark:border-red-900/30 dark:from-red-900/20 dark:to-orange-900/20"
                                >
                                    <div className="flex items-center gap-4">
                                        <motion.div
                                            animate={{
                                                rotate: [0, 10, -10, 0],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-400 to-rose-600 text-white shadow-lg shadow-red-500/30"
                                        >
                                            <ShieldAlert className="h-7 w-7" />
                                        </motion.div>
                                        <div>
                                            <h3 className="text-lg font-bold text-red-800 dark:text-red-300">
                                                Peringatan:{' '}
                                                {atRiskStudents.length}{' '}
                                                Mahasiswa Berisiko
                                            </h3>
                                            <p className="text-sm text-red-600/80 dark:text-red-400/80">
                                                Mahasiswa berikut memiliki
                                                kehadiran di bawah 75% dan tidak
                                                dapat mengikuti UAS
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* At-Risk Student Cards */}
                                {atRiskStudents.length === 0 ? (
                                    <motion.div
                                        variants={itemVariants}
                                        className="rounded-3xl border border-white/20 bg-white/40 p-12 text-center shadow-xl backdrop-blur-xl dark:bg-neutral-900/40"
                                    >
                                        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
                                        <p className="font-medium text-neutral-500">
                                            Semua mahasiswa memenuhi syarat UAS
                                            🎉
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {atRiskStudents.map((g, idx) => (
                                            <motion.div
                                                key={g.mahasiswa_id}
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.9,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                }}
                                                transition={{
                                                    delay: idx * 0.05,
                                                }}
                                                whileHover={{
                                                    scale: 1.03,
                                                    y: -5,
                                                }}
                                                className="group relative overflow-hidden rounded-3xl border border-red-200/50 bg-white/60 p-5 shadow-xl backdrop-blur-xl dark:border-red-800/50 dark:bg-neutral-900/40"
                                            >
                                                <motion.div
                                                    animate={{
                                                        opacity: [
                                                            0.1, 0.2, 0.1,
                                                        ],
                                                    }}
                                                    transition={{
                                                        duration: 3,
                                                        repeat: Infinity,
                                                    }}
                                                    className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-red-500 blur-3xl"
                                                />
                                                <div className="relative">
                                                    <div className="mb-3 flex items-center gap-3">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-rose-600 text-lg font-bold text-white shadow-lg">
                                                            {g.nama.charAt(0)}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate font-bold text-neutral-900 dark:text-white">
                                                                {g.nama}
                                                            </p>
                                                            <p className="font-mono text-xs text-neutral-500">
                                                                {g.nim}
                                                            </p>
                                                        </div>
                                                        <motion.span
                                                            whileHover={{
                                                                scale: 1.1,
                                                            }}
                                                            className={`rounded-lg px-3 py-1 text-sm font-bold text-white shadow-lg ${getGradeColor(g.grade_letter)}`}
                                                        >
                                                            {g.grade_letter}
                                                        </motion.span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-neutral-500">
                                                                Kehadiran
                                                            </span>
                                                            <span className="font-bold text-red-600">
                                                                {
                                                                    g.attendance_rate
                                                                }
                                                                %
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={
                                                                g.attendance_rate
                                                            }
                                                            className="h-2"
                                                        />
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-neutral-500">
                                                                Hadir
                                                            </span>
                                                            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                                                                {
                                                                    g.attended_sessions
                                                                }
                                                                /
                                                                {
                                                                    g.total_sessions
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-neutral-500">
                                                                Kekurangan
                                                            </span>
                                                            <span className="font-bold text-red-600">
                                                                {Math.ceil(
                                                                    g.total_sessions *
                                                                        0.75,
                                                                ) -
                                                                    g.attended_sessions >
                                                                0
                                                                    ? Math.ceil(
                                                                          g.total_sessions *
                                                                              0.75,
                                                                      ) -
                                                                      g.attended_sessions
                                                                    : 0}{' '}
                                                                sesi lagi
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <motion.button
                                                        whileHover={{
                                                            scale: 1.02,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.98,
                                                        }}
                                                        onClick={() =>
                                                            setDetailModal({
                                                                open: true,
                                                                student: g,
                                                            })
                                                        }
                                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/30"
                                                    >
                                                        <Eye className="h-4 w-4" />{' '}
                                                        Lihat Detail
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </>
                )}

                {/* ═══════ DETAIL MODAL ═══════ */}
                <AnimatePresence>
                    {detailModal.open && detailModal.student && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                            onClick={() =>
                                setDetailModal({ open: false, student: null })
                            }
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 25,
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl dark:bg-neutral-950"
                            >
                                {/* Modal Header */}
                                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white">
                                    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 10,
                                                }}
                                                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl"
                                            >
                                                <GraduationCap className="h-7 w-7" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-xl font-bold">
                                                    Detail Kehadiran
                                                </h3>
                                                <p className="text-sm text-white/80">
                                                    Riwayat lengkap presensi
                                                    mahasiswa
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 90,
                                            }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() =>
                                                setDetailModal({
                                                    open: false,
                                                    student: null,
                                                })
                                            }
                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur hover:bg-white/30"
                                        >
                                            <X className="h-5 w-5" />
                                        </motion.button>
                                    </div>
                                </div>
                                {/* Modal Body */}
                                <div className="max-h-[calc(90vh-120px)] space-y-6 overflow-y-auto p-6">
                                    {/* Student Info Card */}
                                    <div className="rounded-2xl border border-neutral-200/50 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-900/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-2xl font-bold text-white shadow-lg">
                                                    {detailModal.student.nama.charAt(
                                                        0,
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                                        {
                                                            detailModal.student
                                                                .nama
                                                        }
                                                    </p>
                                                    <p className="font-mono text-sm text-neutral-500">
                                                        {
                                                            detailModal.student
                                                                .nim
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <motion.span
                                                whileHover={{ scale: 1.1 }}
                                                className={`rounded-xl px-4 py-2 text-lg font-bold text-white shadow-lg ${getGradeColor(detailModal.student.grade_letter)}`}
                                            >
                                                Grade{' '}
                                                {
                                                    detailModal.student
                                                        .grade_letter
                                                }
                                            </motion.span>
                                        </div>
                                        <div className="mt-5 grid grid-cols-4 gap-3">
                                            {[
                                                {
                                                    label: 'Hadir',
                                                    value: detailModal.student
                                                        .attended_sessions,
                                                    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
                                                },
                                                {
                                                    label: 'Persentase',
                                                    value: `${detailModal.student.attendance_rate}%`,
                                                    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
                                                },
                                                {
                                                    label: 'Poin Rata-rata',
                                                    value: detailModal.student
                                                        .average_points,
                                                    color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
                                                },
                                                {
                                                    label: 'Total Sesi',
                                                    value: detailModal.student
                                                        .total_sessions,
                                                    color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
                                                },
                                            ].map((s) => (
                                                <div
                                                    key={s.label}
                                                    className={`rounded-xl p-3 text-center ${s.color}`}
                                                >
                                                    <p className="text-2xl font-bold">
                                                        {s.value}
                                                    </p>
                                                    <p className="mt-1 text-xs text-neutral-500">
                                                        {s.label}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Attendance History */}
                                    <div>
                                        <div className="mb-4 flex items-center gap-2">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg"
                                            >
                                                <FileText className="h-4 w-4" />
                                            </motion.div>
                                            <h4 className="font-bold text-neutral-900 dark:text-white">
                                                Riwayat Kehadiran
                                            </h4>
                                        </div>
                                        <div className="overflow-hidden rounded-2xl border border-neutral-200/50 dark:border-neutral-800">
                                            <div className="max-h-[350px] overflow-y-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="sticky top-0 bg-neutral-50 dark:bg-neutral-900">
                                                        <tr>
                                                            <th className="p-4 text-left font-bold text-neutral-700 dark:text-neutral-300">
                                                                Pertemuan
                                                            </th>
                                                            <th className="p-4 text-left font-bold text-neutral-700 dark:text-neutral-300">
                                                                Tanggal
                                                            </th>
                                                            <th className="p-4 text-center font-bold text-neutral-700 dark:text-neutral-300">
                                                                Status
                                                            </th>
                                                            <th className="p-4 text-center font-bold text-neutral-700 dark:text-neutral-300">
                                                                Poin
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-neutral-200/50 dark:divide-neutral-800">
                                                        {detailModal.student.details.map(
                                                            (d, idx) => (
                                                                <motion.tr
                                                                    key={
                                                                        d.meeting
                                                                    }
                                                                    initial={{
                                                                        opacity: 0,
                                                                        x: -10,
                                                                    }}
                                                                    animate={{
                                                                        opacity: 1,
                                                                        x: 0,
                                                                    }}
                                                                    transition={{
                                                                        delay:
                                                                            idx *
                                                                            0.02,
                                                                    }}
                                                                    whileHover={{
                                                                        backgroundColor:
                                                                            'rgba(99,102,241,0.05)',
                                                                        x: 5,
                                                                    }}
                                                                    className="transition-colors"
                                                                >
                                                                    <td className="p-4">
                                                                        <p className="font-semibold text-neutral-900 dark:text-white">
                                                                            {
                                                                                d.title
                                                                            }
                                                                        </p>
                                                                        <p className="text-xs text-neutral-500">
                                                                            Pertemuan{' '}
                                                                            {
                                                                                d.meeting
                                                                            }
                                                                        </p>
                                                                    </td>
                                                                    <td className="p-4 text-neutral-600 dark:text-neutral-400">
                                                                        {d.date}
                                                                    </td>
                                                                    <td className="p-4 text-center">
                                                                        <motion.span
                                                                            whileHover={{
                                                                                scale: 1.1,
                                                                            }}
                                                                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold ${getStatusColor(d.status)}`}
                                                                        >
                                                                            {d.status ===
                                                                                'present' && (
                                                                                <CheckCircle className="h-3 w-3" />
                                                                            )}
                                                                            {d.status ===
                                                                                'late' && (
                                                                                <Clock className="h-3 w-3" />
                                                                            )}
                                                                            {d.status ===
                                                                                'absent' && (
                                                                                <AlertTriangle className="h-3 w-3" />
                                                                            )}
                                                                            {getStatusLabel(
                                                                                d.status,
                                                                            )}
                                                                        </motion.span>
                                                                    </td>
                                                                    <td className="p-4 text-center">
                                                                        <span className="inline-flex rounded-lg bg-purple-100 px-2 py-1 text-xs font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                                            {
                                                                                d.points
                                                                            }
                                                                        </span>
                                                                    </td>
                                                                </motion.tr>
                                                            ),
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════ EXPORT MODAL ═══════ */}
                <AnimatePresence>
                    {showExportModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                            onClick={() => setShowExportModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 25,
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl dark:bg-neutral-950"
                            >
                                <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 p-6 text-white">
                                    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 10,
                                                }}
                                                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl"
                                            >
                                                <Download className="h-6 w-6" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-lg font-bold">
                                                    Export Laporan
                                                </h3>
                                                <p className="text-sm text-white/80">
                                                    Pilih format export
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 90,
                                            }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() =>
                                                setShowExportModal(false)
                                            }
                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur hover:bg-white/30"
                                        >
                                            <X className="h-5 w-5" />
                                        </motion.button>
                                    </div>
                                </div>
                                <div className="space-y-3 p-6">
                                    <motion.button
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            handleExportCsv();
                                            setShowExportModal(false);
                                        }}
                                        className="flex w-full items-center gap-4 rounded-2xl border border-neutral-200/50 bg-neutral-50/50 p-4 transition-colors hover:bg-blue-50 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:bg-blue-900/20"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg">
                                            <FileSpreadsheet className="h-6 w-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-neutral-900 dark:text-white">
                                                Export CSV
                                            </p>
                                            <p className="text-sm text-neutral-500">
                                                Spreadsheet format
                                            </p>
                                        </div>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            handleExportPdf();
                                            setShowExportModal(false);
                                        }}
                                        className="flex w-full items-center gap-4 rounded-2xl border border-neutral-200/50 bg-neutral-50/50 p-4 transition-colors hover:bg-red-50 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:bg-red-900/20"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-400 to-rose-600 text-white shadow-lg">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-neutral-900 dark:text-white">
                                                Export PDF
                                            </p>
                                            <p className="text-sm text-neutral-500">
                                                Laporan cetak
                                            </p>
                                        </div>
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ═══════ OVERRIDE MODAL ═══════ */}
                <AnimatePresence>
                    {overrideModal.open && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                            onClick={() =>
                                setOverrideModal({
                                    open: false,
                                    logId: null,
                                    currentStatus: '',
                                })
                            }
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 25,
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl dark:bg-neutral-950"
                            >
                                <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-6 text-white">
                                    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <motion.div
                                                whileHover={{ scale: 1.1 }}
                                                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/20 backdrop-blur-xl"
                                            >
                                                <Zap className="h-6 w-6" />
                                            </motion.div>
                                            <div>
                                                <h3 className="text-lg font-bold">
                                                    Override Status
                                                </h3>
                                                <p className="text-sm text-white/80">
                                                    Ubah status kehadiran
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{
                                                scale: 1.1,
                                                rotate: 90,
                                            }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() =>
                                                setOverrideModal({
                                                    open: false,
                                                    logId: null,
                                                    currentStatus: '',
                                                })
                                            }
                                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur hover:bg-white/30"
                                        >
                                            <X className="h-5 w-5" />
                                        </motion.button>
                                    </div>
                                </div>
                                <div className="space-y-4 p-6">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            Status Baru
                                        </label>
                                        <Select
                                            value={overrideForm.data.status}
                                            onValueChange={(v) =>
                                                overrideForm.setData(
                                                    'status',
                                                    v,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="border-2">
                                                <SelectValue placeholder="Pilih status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="present">
                                                    Hadir
                                                </SelectItem>
                                                <SelectItem value="late">
                                                    Terlambat
                                                </SelectItem>
                                                <SelectItem value="permit">
                                                    Izin
                                                </SelectItem>
                                                <SelectItem value="sick">
                                                    Sakit
                                                </SelectItem>
                                                <SelectItem value="rejected">
                                                    Tidak Hadir
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            Alasan
                                        </label>
                                        <Textarea
                                            value={overrideForm.data.reason}
                                            onChange={(e) =>
                                                overrideForm.setData(
                                                    'reason',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Alasan perubahan status..."
                                            className="border-2"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <motion.div
                                            whileTap={{ scale: 0.95 }}
                                            className="flex-1"
                                        >
                                            <Button
                                                onClick={handleOverride}
                                                disabled={
                                                    overrideForm.processing
                                                }
                                                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
                                            >
                                                Simpan
                                            </Button>
                                        </motion.div>
                                        <motion.div whileTap={{ scale: 0.95 }}>
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setOverrideModal({
                                                        open: false,
                                                        logId: null,
                                                        currentStatus: '',
                                                    })
                                                }
                                            >
                                                Batal
                                            </Button>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </DosenLayout>
    );
}
