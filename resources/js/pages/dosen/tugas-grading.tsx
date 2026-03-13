import StatGraded from '@/assets/admin/dashboard/hadir-icon.png';
import {
    default as StatAvgGrade,
    default as TugasIcon,
} from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import StatTotalSubmissions from '@/assets/admin/informasi-tugas/total-tugas.png';
import StatPending from '@/assets/admin/notification-center/scheduled.png';
import BasisDataIcon from '@/assets/matkul/basis-data.png';
import AIGradingPanel from '@/components/dosen/ai-grading-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import DosenLayout from '@/layouts/dosen-layout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    ArrowLeft,
    ArrowUpDown,
    Award,
    BarChart3,
    CheckCircle,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Eye,
    FileSpreadsheet,
    FileText,
    Filter,
    Hourglass,
    LayoutGrid,
    List,
    MessageSquare,
    Save,
    Search,
    Sparkles,
    X,
    Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Submission = {
    id: number;
    mahasiswa: { id: number; nama: string; nim: string };
    content: string | null;
    file_path: string | null;
    file_name: string | null;
    status: string;
    grade: number | null;
    grade_letter: string | null;
    feedback: string | null;
    submitted_at: string;
    graded_at: string | null;
    is_late: boolean;
};

type Props = {
    tugas: {
        id: number;
        judul: string;
        deadline: string;
        deadline_display?: string;
        max_grade: number;
        course_nama?: string;
    };
    submissions: Submission[];
    stats: {
        total: number;
        graded: number;
        pending: number;
        avg_grade: number;
        highest_score: number;
        highest_scorer: string;
        lowest_score: number;
        late_count: number;
        late_penalty_percent: number;
        distribution: { A: number; B: number; C: number; D: number; E: number };
        total_students: number;
    };
};

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

const feedbackTemplates = [
    {
        icon: Sparkles,
        label: 'Bagus Sekali',
        text: 'Pekerjaan yang sangat baik! Terus pertahankan kualitas ini.',
        color: 'text-yellow-500',
    },
    {
        icon: CheckCircle,
        label: 'Baik',
        text: 'Pekerjaan sudah baik. Beberapa aspek bisa ditingkatkan lagi.',
        color: 'text-emerald-500',
    },
    {
        icon: FileText,
        label: 'Perlu Revisi',
        text: 'Ada beberapa bagian yang perlu diperbaiki. Silakan revisi dan submit ulang.',
        color: 'text-blue-500',
    },
    {
        icon: AlertTriangle,
        label: 'Kurang',
        text: 'Pekerjaan belum memenuhi standar. Silakan pelajari materi kembali.',
        color: 'text-orange-500',
    },
    {
        icon: Clock,
        label: 'Terlambat',
        text: 'Submission terlambat. Nilai dikurangi sesuai kebijakan.',
        color: 'text-red-500',
    },
];

export default function DosenTugasGrading({
    tugas,
    submissions,
    stats,
}: Props) {
    const [showGradeDialog, setShowGradeDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showBulkGradeDialog, setShowBulkGradeDialog] = useState(false);
    const [showQuickGrade, setShowQuickGrade] = useState(false);
    const [selectedSubmission, setSelectedSubmission] =
        useState<Submission | null>(null);
    const [gradeForm, setGradeForm] = useState({ grade: 0, feedback: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'grade'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkGrade, setBulkGrade] = useState({ grade: '', feedback: '' });
    const [viewMode, setViewMode] = useState<'table' | 'card' | 'quick'>(
        'table',
    );
    const [quickIndex, setQuickIndex] = useState(0);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const filteredSubmissions = useMemo(() => {
        const filtered = submissions.filter((s) => {
            const matchSearch =
                s.mahasiswa.nama
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                s.mahasiswa.nim.includes(searchQuery);
            const matchStatus =
                filterStatus === 'all' ||
                (filterStatus === 'graded' && s.status === 'graded') ||
                (filterStatus === 'pending' && s.status !== 'graded') ||
                (filterStatus === 'late' && s.is_late);
            return matchSearch && matchStatus;
        });
        filtered.sort((a, b) => {
            let c = 0;
            if (sortBy === 'name')
                c = a.mahasiswa.nama.localeCompare(b.mahasiswa.nama);
            else if (sortBy === 'date')
                c =
                    new Date(a.submitted_at).getTime() -
                    new Date(b.submitted_at).getTime();
            else c = (a.grade || 0) - (b.grade || 0);
            return sortOrder === 'asc' ? c : -c;
        });
        return filtered;
    }, [submissions, searchQuery, filterStatus, sortBy, sortOrder]);

    const toggleSelectAll = () =>
        setSelectedIds(
            selectedIds.length === filteredSubmissions.length
                ? []
                : filteredSubmissions.map((s) => s.id),
        );
    const toggleSelect = (id: number) =>
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );

    const openGradeDialog = (sub: Submission) => {
        setSelectedSubmission(sub);
        setGradeForm({ grade: sub.grade ?? 0, feedback: sub.feedback || '' });
        setShowGradeDialog(true);
    };
    const openDetailDialog = (sub: Submission) => {
        setSelectedSubmission(sub);
        setShowDetailDialog(true);
    };

    const handleGrade = () => {
        if (!selectedSubmission) return;
        router.patch(
            `/dosen/tugas/submission/${selectedSubmission.id}/grade`,
            { grade: gradeForm.grade, feedback: gradeForm.feedback },
            {
                onSuccess: () => {
                    setShowGradeDialog(false);
                    setSelectedSubmission(null);
                },
            },
        );
    };
    const handleBulkGrade = () => {
        const grades = selectedIds.map((id) => ({
            submission_id: id,
            grade: parseFloat(bulkGrade.grade),
            feedback: bulkGrade.feedback,
        }));
        router.post(
            `/dosen/tugas/${tugas.id}/bulk-grade`,
            { grades },
            {
                onSuccess: () => {
                    setShowBulkGradeDialog(false);
                    setSelectedIds([]);
                    setBulkGrade({ grade: '', feedback: '' });
                },
            },
        );
    };

    const getGradeLetter = (score: number) =>
        score >= 85
            ? 'A'
            : score >= 70
              ? 'B'
              : score >= 55
                ? 'C'
                : score >= 40
                  ? 'D'
                  : 'E';
    const getStatusBadge = (status: string, isLate: boolean) => {
        if (status === 'graded')
            return (
                <Badge className="flex items-center gap-1 border-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                    <CheckCircle className="h-3 w-3" /> Dinilai
                </Badge>
            );
        if (isLate)
            return (
                <Badge className="flex items-center gap-1 border-0 bg-gradient-to-r from-red-500 to-rose-500 text-white">
                    <Clock className="h-3 w-3" /> Terlambat
                </Badge>
            );
        return (
            <Badge className="flex items-center gap-1 border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Hourglass className="h-3 w-3" /> Menunggu
            </Badge>
        );
    };
    const getGradeColor = (g: number | null) =>
        g === null
            ? 'text-neutral-400'
            : g >= 80
              ? 'text-emerald-600'
              : g >= 60
                ? 'text-blue-600'
                : 'text-red-600';

    const summaryCards = [
        {
            key: 'total',
            icon: StatTotalSubmissions,
            label: 'Total Submissions',
            value: stats.total,
            subtitle: `${stats.total} dari ${stats.total_students || '?'} mahasiswa`,
            gradient: 'from-blue-500 to-indigo-600',
            glow: 'bg-blue-500',
        },
        {
            key: 'graded',
            icon: StatGraded,
            label: 'Sudah Dinilai',
            value: stats.graded,
            subtitle: `${stats.total > 0 ? Math.round((stats.graded / stats.total) * 100) : 0}% selesai`,
            gradient: 'from-emerald-500 to-teal-600',
            glow: 'bg-emerald-500',
        },
        {
            key: 'pending',
            icon: StatPending,
            label: 'Menunggu Nilai',
            value: stats.pending,
            subtitle: 'perlu penilaian segera',
            gradient: 'from-amber-500 to-orange-600',
            glow: 'bg-amber-500',
        },
        {
            key: 'avg',
            icon: StatAvgGrade,
            label: 'Rata-rata Nilai',
            value: Number(stats.avg_grade).toFixed(1),
            subtitle: `dari max ${tugas.max_grade}`,
            gradient: 'from-purple-500 to-violet-600',
            glow: 'bg-purple-500',
        },
    ];

    return (
        <DosenLayout>
            <Head title={`Penilaian - ${tugas.judul}`} />
            <motion.div
                className="space-y-6 p-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* ═══ HEADER ═══ */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-8 shadow-2xl"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
                        animate={{
                            backgroundPosition: [
                                '0% 50%',
                                '100% 50%',
                                '0% 50%',
                            ],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                        style={{ backgroundSize: '200% 200%' }}
                    />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative z-10">
                        <motion.button
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                                router.visit(`/dosen/tugas/${tugas.id}`)
                            }
                            className="mb-6 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-white backdrop-blur transition-colors hover:bg-white/20"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali
                        </motion.button>
                        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:items-start">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left lg:w-auto">
                                <motion.div
                                    className="relative flex h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                                    whileHover={{ scale: 1.05, rotate: 5 }}
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
                                        src={
                                            tugas.judul
                                                ?.toLowerCase()
                                                .includes('basis data')
                                                ? BasisDataIcon
                                                : TugasIcon
                                        }
                                        alt="Penilaian Tugas"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-white/70"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Penilaian Tugas
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        {tugas.judul}
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 text-sm leading-relaxed text-white/60"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        {tugas.course_nama} • Deadline:{' '}
                                        {tugas.deadline_display ||
                                            tugas.deadline}
                                    </motion.p>
                                </div>
                            </div>
                            <div className="mt-2 flex w-full flex-col items-center gap-3 lg:mt-0 lg:w-auto lg:items-end">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-wrap justify-center gap-2"
                                >
                                    {selectedIds.length > 0 && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        >
                                            <Button
                                                onClick={() =>
                                                    setShowBulkGradeDialog(true)
                                                }
                                                className="border-0 bg-white/20 text-white backdrop-blur hover:bg-white/30"
                                            >
                                                <CheckSquare className="mr-2 h-4 w-4" />{' '}
                                                Nilai {selectedIds.length}
                                            </Button>
                                        </motion.div>
                                    )}
                                    <Button className="border-0 bg-white/20 text-white backdrop-blur hover:bg-white/30">
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />{' '}
                                        Export
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ 8 SUMMARY CARDS ═══ */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 gap-4 md:grid-cols-4"
                >
                    {summaryCards.map((card) => (
                        <motion.div
                            key={card.key}
                            variants={cardVariants}
                            whileHover="hover"
                            onMouseEnter={() => setHoveredCard(card.key)}
                            onMouseLeave={() => setHoveredCard(null)}
                            className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <motion.div
                                animate={{
                                    scale: hoveredCard === card.key ? 1.5 : 1,
                                    opacity:
                                        hoveredCard === card.key ? 0.4 : 0.15,
                                }}
                                className={`absolute -top-8 -right-8 h-28 w-28 rounded-full ${card.glow} blur-3xl transition-all duration-500`}
                            />
                            <div className="relative z-10">
                                <div className="mb-3 flex items-center justify-between">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        className="relative flex h-14 w-14 shrink-0 items-center justify-center"
                                    >
                                        <img
                                            src={card.icon}
                                            alt={card.label}
                                            className="absolute inset-0 h-full w-full object-contain drop-shadow-xl"
                                        />
                                    </motion.div>
                                    {card.key === 'pending' &&
                                        stats.pending > 10 && (
                                            <Badge className="border-0 bg-red-500 text-[10px] text-white">
                                                Urgent
                                            </Badge>
                                        )}
                                    {card.key === 'lowest' &&
                                        stats.lowest_score < 60 &&
                                        stats.graded > 0 && (
                                            <Badge className="border-0 bg-red-500 text-[10px] text-white">
                                                !
                                            </Badge>
                                        )}
                                </div>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {card.value}
                                </p>
                                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                                    {card.label}
                                </p>
                                <p className="mt-1 truncate text-[11px] text-neutral-400 dark:text-neutral-500">
                                    {card.subtitle}
                                </p>
                                {card.key === 'graded' && stats.total > 0 && (
                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${(stats.graded / stats.total) * 100}%`,
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.5,
                                            }}
                                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══ FILTERS + VIEW TOGGLE ═══ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
                                <Filter className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-neutral-900 dark:text-white">
                                    Filter & Pencarian
                                </h3>
                                <p className="text-xs text-neutral-500">
                                    Temukan submission dengan mudah
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
                            {(
                                [
                                    ['table', List, 'Tabel'],
                                    ['card', LayoutGrid, 'Kartu'],
                                    ['quick', Zap, 'Quick'],
                                ] as const
                            ).map(([mode, Icon, label]) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${viewMode === mode ? 'bg-white text-neutral-900 shadow dark:bg-neutral-700 dark:text-white' : 'text-neutral-500 hover:text-neutral-700'}`}
                                >
                                    <Icon className="h-3.5 w-3.5" /> {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <Input
                                    placeholder="Nama atau NIM..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="border-white/20 bg-white/50 pl-10 dark:bg-neutral-800/50"
                                />
                            </div>
                        </div>
                        <Select
                            value={filterStatus}
                            onValueChange={setFilterStatus}
                        >
                            <SelectTrigger className="border-white/20 bg-white/50 dark:bg-neutral-800/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="graded">Dinilai</SelectItem>
                                <SelectItem value="pending">
                                    Menunggu
                                </SelectItem>
                                <SelectItem value="late">Terlambat</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={sortBy}
                            onValueChange={(v: any) => setSortBy(v)}
                        >
                            <SelectTrigger className="border-white/20 bg-white/50 dark:bg-neutral-800/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="date">Tanggal</SelectItem>
                                <SelectItem value="name">Nama</SelectItem>
                                <SelectItem value="grade">Nilai</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() =>
                                    setSortOrder((o) =>
                                        o === 'asc' ? 'desc' : 'asc',
                                    )
                                }
                                className="flex items-center gap-1 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                            >
                                <ArrowUpDown className="h-3.5 w-3.5" />{' '}
                                {sortOrder === 'asc' ? 'A→Z' : 'Z→A'}
                            </button>
                            <span className="text-xs text-neutral-500">
                                {filteredSubmissions.length} dari{' '}
                                {submissions.length} submission
                            </span>
                        </div>
                        {selectedIds.length > 0 && (
                            <button
                                onClick={() => setSelectedIds([])}
                                className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30"
                            >
                                <X className="h-3.5 w-3.5" /> Clear (
                                {selectedIds.length})
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* ═══ TABLE VIEW ═══ */}
                {viewMode === 'table' && (
                    <motion.div
                        variants={itemVariants}
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-900/80 dark:to-neutral-800/80">
                                        <th className="w-10 px-4 py-4 text-left">
                                            <Checkbox
                                                checked={
                                                    selectedIds.length ===
                                                        filteredSubmissions.length &&
                                                    filteredSubmissions.length >
                                                        0
                                                }
                                                onCheckedChange={
                                                    toggleSelectAll
                                                }
                                            />
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-neutral-600 uppercase dark:text-neutral-400">
                                            Mahasiswa
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-bold tracking-wider text-neutral-600 uppercase dark:text-neutral-400">
                                            Waktu Submit
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-bold tracking-wider text-neutral-600 uppercase dark:text-neutral-400">
                                            Status
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-bold tracking-wider text-neutral-600 uppercase dark:text-neutral-400">
                                            Nilai
                                        </th>
                                        <th className="px-4 py-4 text-center text-xs font-bold tracking-wider text-neutral-600 uppercase dark:text-neutral-400">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {filteredSubmissions.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-16 text-center"
                                            >
                                                <Search className="mx-auto mb-3 h-12 w-12 text-neutral-300" />
                                                <p className="text-neutral-500">
                                                    Tidak ada submission yang
                                                    sesuai
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSubmissions.map((sub, i) => (
                                            <motion.tr
                                                key={sub.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                                className="transition-colors hover:bg-white/60 dark:hover:bg-neutral-800/60"
                                            >
                                                <td className="px-4 py-4">
                                                    <Checkbox
                                                        checked={selectedIds.includes(
                                                            sub.id,
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleSelect(sub.id)
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-lg">
                                                            {sub.mahasiswa.nama.charAt(
                                                                0,
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-neutral-900 dark:text-white">
                                                                {
                                                                    sub
                                                                        .mahasiswa
                                                                        .nama
                                                                }
                                                            </p>
                                                            <p className="font-mono text-xs text-neutral-500">
                                                                {
                                                                    sub
                                                                        .mahasiswa
                                                                        .nim
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                                                        <Clock className="h-3.5 w-3.5" />{' '}
                                                        {sub.submitted_at}
                                                    </div>
                                                    {sub.is_late && (
                                                        <p className="mt-0.5 flex items-center gap-1 text-xs text-red-500">
                                                            <AlertTriangle className="h-3 w-3" />{' '}
                                                            Terlambat
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    {getStatusBadge(
                                                        sub.status,
                                                        sub.is_late,
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    {sub.grade !== null ? (
                                                        <div className="flex flex-col items-center">
                                                            <span
                                                                className={`text-xl font-bold ${getGradeColor(sub.grade)}`}
                                                            >
                                                                {Number(
                                                                    sub.grade,
                                                                ).toFixed(1)}
                                                            </span>
                                                            {sub.grade_letter && (
                                                                <span className="text-xs text-neutral-500">
                                                                    (
                                                                    {
                                                                        sub.grade_letter
                                                                    }
                                                                    )
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-neutral-400">
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <motion.button
                                                            whileHover={{
                                                                scale: 1.1,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.9,
                                                            }}
                                                            onClick={() =>
                                                                openDetailDialog(
                                                                    sub,
                                                                )
                                                            }
                                                            className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900/30"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{
                                                                scale: 1.1,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.9,
                                                            }}
                                                            onClick={() =>
                                                                openGradeDialog(
                                                                    sub,
                                                                )
                                                            }
                                                            className="rounded-lg bg-purple-100 p-2 text-purple-600 transition-colors hover:bg-purple-200 dark:bg-purple-900/30"
                                                        >
                                                            <Award className="h-4 w-4" />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* ═══ CARD VIEW ═══ */}
                {viewMode === 'card' && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {filteredSubmissions.map((sub) => (
                            <motion.div
                                key={sub.id}
                                variants={cardVariants}
                                whileHover="hover"
                                className="relative cursor-pointer overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                                onClick={() => openGradeDialog(sub)}
                            >
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white shadow-lg">
                                        {sub.mahasiswa.nama.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate font-bold text-neutral-900 dark:text-white">
                                            {sub.mahasiswa.nama}
                                        </h3>
                                        <p className="font-mono text-xs text-neutral-500">
                                            {sub.mahasiswa.nim}
                                        </p>
                                    </div>
                                    <Checkbox
                                        checked={selectedIds.includes(sub.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        onCheckedChange={() =>
                                            toggleSelect(sub.id)
                                        }
                                    />
                                </div>
                                <div className="mb-3 flex flex-wrap gap-1.5">
                                    {getStatusBadge(sub.status, sub.is_late)}
                                    {sub.is_late && (
                                        <Badge className="flex items-center gap-1 border-0 bg-red-100 text-[10px] text-red-700">
                                            <Clock className="h-3 w-3" /> Late
                                        </Badge>
                                    )}
                                </div>
                                {sub.grade !== null ? (
                                    <div className="mb-3">
                                        <div className="mb-1 flex items-center justify-between">
                                            <span className="text-xs text-neutral-500">
                                                Score
                                            </span>
                                            <span
                                                className={`text-3xl font-bold ${getGradeColor(sub.grade)}`}
                                            >
                                                {Number(sub.grade).toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${sub.grade}%`,
                                                }}
                                                transition={{ duration: 0.8 }}
                                                className={`h-full rounded-full ${sub.grade >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : sub.grade >= 60 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}
                                            />
                                        </div>
                                        {sub.grade_letter && (
                                            <p className="mt-1 text-center text-sm font-bold text-neutral-600 dark:text-neutral-400">
                                                Grade: {sub.grade_letter}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mb-3 rounded-xl bg-amber-50 p-3 text-center dark:bg-amber-900/20">
                                        <Clock className="mx-auto mb-1 h-5 w-5 text-amber-600" />
                                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                                            Pending Review
                                        </p>
                                    </div>
                                )}
                                <p className="text-[11px] text-neutral-400">
                                    {sub.submitted_at}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* ═══ QUICK GRADE MODE ═══ */}
                {viewMode === 'quick' &&
                    filteredSubmissions.length > 0 &&
                    (() => {
                        const cur =
                            filteredSubmissions[quickIndex] ||
                            filteredSubmissions[0];
                        return (
                            <motion.div
                                variants={itemVariants}
                                className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                            >
                                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-5">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-sm text-white/80">
                                            Quick Grading
                                        </p>
                                        <p className="text-xl font-bold text-white">
                                            {quickIndex + 1} /{' '}
                                            {filteredSubmissions.length}
                                        </p>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-white/20">
                                        <motion.div
                                            className="h-full rounded-full bg-white"
                                            animate={{
                                                width: `${((quickIndex + 1) / filteredSubmissions.length) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="mb-6 flex items-center gap-4">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white shadow-lg">
                                            {cur.mahasiswa.nama.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                                                {cur.mahasiswa.nama}
                                            </h2>
                                            <p className="font-mono text-sm text-neutral-500">
                                                {cur.mahasiswa.nim}
                                            </p>
                                            <div className="mt-1 flex gap-2">
                                                {getStatusBadge(
                                                    cur.status,
                                                    cur.is_late,
                                                )}
                                                {cur.is_late && (
                                                    <Badge className="flex items-center gap-1 border-0 bg-red-100 text-xs text-red-700">
                                                        <Clock className="h-3 w-3" />{' '}
                                                        Late (-
                                                        {
                                                            stats.late_penalty_percent
                                                        }
                                                        %)
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-neutral-500">
                                                Submitted
                                            </p>
                                            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                {cur.submitted_at}
                                            </p>
                                        </div>
                                    </div>
                                    {cur.content && (
                                        <div className="mb-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
                                            <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-neutral-500">
                                                <FileText className="h-3 w-3" />{' '}
                                                Jawaban
                                            </p>
                                            <div className="max-h-48 overflow-y-auto text-sm whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                                                {cur.content}
                                            </div>
                                        </div>
                                    )}
                                    {cur.file_path && (
                                        <a
                                            href={cur.file_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mb-6 flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/20"
                                        >
                                            <Download className="h-5 w-5" />
                                            <span className="font-medium">
                                                {cur.file_name ||
                                                    'Download File'}
                                            </span>
                                        </a>
                                    )}
                                    <div className="mb-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <Label className="text-lg font-semibold">
                                                Score
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    value={gradeForm.grade}
                                                    onChange={(e) =>
                                                        setGradeForm({
                                                            ...gradeForm,
                                                            grade: Number(
                                                                e.target.value,
                                                            ),
                                                        })
                                                    }
                                                    min={0}
                                                    max={tugas.max_grade}
                                                    className="w-20 border-white/20 text-center text-2xl font-bold"
                                                />
                                                <span className="text-neutral-500">
                                                    / {tugas.max_grade}
                                                </span>
                                            </div>
                                        </div>
                                        <Slider
                                            value={[gradeForm.grade]}
                                            onValueChange={([v]) =>
                                                setGradeForm({
                                                    ...gradeForm,
                                                    grade: v,
                                                })
                                            }
                                            max={tugas.max_grade}
                                            step={1}
                                            className="mb-2"
                                        />
                                        <div className="relative h-3 overflow-hidden rounded-full bg-gradient-to-r from-red-500 via-blue-500 via-yellow-500 to-green-500">
                                            <motion.div
                                                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                                                animate={{
                                                    left: `${(gradeForm.grade / tugas.max_grade) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <p className="mt-2 text-center">
                                            <span
                                                className={`text-4xl font-bold ${getGradeColor(gradeForm.grade)}`}
                                            >
                                                {getGradeLetter(
                                                    gradeForm.grade,
                                                )}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="mb-4">
                                        <Label className="mb-2 block text-sm font-semibold">
                                            Quick Feedback
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {feedbackTemplates.map((t, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() =>
                                                        setGradeForm({
                                                            ...gradeForm,
                                                            feedback: t.text,
                                                        })
                                                    }
                                                    className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                                                >
                                                    <t.icon
                                                        className={`h-3.5 w-3.5 ${t.color}`}
                                                    />{' '}
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <Textarea
                                        value={gradeForm.feedback}
                                        onChange={(e) =>
                                            setGradeForm({
                                                ...gradeForm,
                                                feedback: e.target.value,
                                            })
                                        }
                                        placeholder="Feedback untuk mahasiswa..."
                                        rows={3}
                                        className="mb-4 border-white/20 bg-white/50 dark:bg-neutral-800/50"
                                    />
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() =>
                                                setQuickIndex(
                                                    Math.max(0, quickIndex - 1),
                                                )
                                            }
                                            disabled={quickIndex === 0}
                                            variant="outline"
                                            className="border-white/20"
                                        >
                                            <ChevronLeft className="mr-1 h-4 w-4" />{' '}
                                            Prev
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                if (!cur) return;
                                                router.patch(
                                                    `/dosen/tugas/submission/${cur.id}/grade`,
                                                    {
                                                        grade: gradeForm.grade,
                                                        feedback:
                                                            gradeForm.feedback,
                                                    },
                                                    {
                                                        onSuccess: () => {
                                                            if (
                                                                quickIndex <
                                                                filteredSubmissions.length -
                                                                    1
                                                            ) {
                                                                setQuickIndex(
                                                                    quickIndex +
                                                                        1,
                                                                );
                                                                const next =
                                                                    filteredSubmissions[
                                                                        quickIndex +
                                                                            1
                                                                    ];
                                                                setGradeForm({
                                                                    grade:
                                                                        next?.grade ??
                                                                        0,
                                                                    feedback:
                                                                        next?.feedback ||
                                                                        '',
                                                                });
                                                            }
                                                        },
                                                    },
                                                );
                                            }}
                                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:from-emerald-600 hover:to-teal-700"
                                        >
                                            <Save className="mr-2 h-4 w-4" />{' '}
                                            Simpan & Lanjut
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                setQuickIndex(
                                                    Math.min(
                                                        filteredSubmissions.length -
                                                            1,
                                                        quickIndex + 1,
                                                    ),
                                                )
                                            }
                                            disabled={
                                                quickIndex ===
                                                filteredSubmissions.length - 1
                                            }
                                            variant="outline"
                                            className="border-white/20"
                                        >
                                            Next{' '}
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })()}

                {/* ═══ ANALYTICS ═══ */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600">
                            <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-neutral-900 dark:text-white">
                                Distribusi Nilai
                            </h3>
                            <p className="text-xs text-neutral-500">
                                Visualisasi hasil penilaian
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                        {(['A', 'B', 'C', 'D', 'E'] as const).map((letter) => {
                            const count = stats.distribution?.[letter] || 0;
                            const maxCount = Math.max(
                                ...Object.values(stats.distribution || {}),
                                1,
                            );
                            const colors: Record<string, string> = {
                                A: 'from-emerald-500 to-green-500',
                                B: 'from-blue-500 to-indigo-500',
                                C: 'from-amber-500 to-yellow-500',
                                D: 'from-orange-500 to-red-400',
                                E: 'from-red-500 to-rose-600',
                            };
                            return (
                                <div key={letter} className="text-center">
                                    <div className="mb-2 flex h-32 items-end justify-center">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{
                                                height: `${(count / maxCount) * 100}%`,
                                            }}
                                            transition={{
                                                duration: 0.8,
                                                delay: 0.1,
                                            }}
                                            className={`w-full max-w-[40px] rounded-t-lg bg-gradient-to-t ${colors[letter]} min-h-[4px]`}
                                        />
                                    </div>
                                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                        {letter}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        {count} mhs
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ═══ GRADE DIALOG ═══ */}
                <Dialog
                    open={showGradeDialog}
                    onOpenChange={setShowGradeDialog}
                >
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <div className="relative -m-6 mb-4 overflow-hidden rounded-t-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6">
                                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                                <div className="relative">
                                    <DialogTitle className="flex items-center gap-3 text-2xl text-white">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                            <Award className="h-6 w-6" />
                                        </div>
                                        Beri Nilai
                                    </DialogTitle>
                                    <p className="mt-2 ml-15 text-white/70">
                                        Berikan penilaian untuk submission
                                    </p>
                                </div>
                            </div>
                        </DialogHeader>
                        {selectedSubmission && (
                            <div className="space-y-5">
                                <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-lg">
                                        {selectedSubmission.mahasiswa.nama.charAt(
                                            0,
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-lg font-bold text-neutral-900 dark:text-white">
                                            {selectedSubmission.mahasiswa.nama}
                                        </p>
                                        <p className="font-mono text-sm text-neutral-500">
                                            {selectedSubmission.mahasiswa.nim}
                                        </p>
                                    </div>
                                    {getStatusBadge(
                                        selectedSubmission.status,
                                        selectedSubmission.is_late,
                                    )}
                                </div>
                                {selectedSubmission.is_late && (
                                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20">
                                        <AlertTriangle className="h-5 w-5" />{' '}
                                        Submission terlambat - penalty -
                                        {stats.late_penalty_percent}%
                                    </div>
                                )}
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <Label className="font-semibold">
                                            Nilai (0-{tugas.max_grade})
                                        </Label>
                                        <span
                                            className={`text-3xl font-bold ${getGradeColor(gradeForm.grade)}`}
                                        >
                                            {getGradeLetter(gradeForm.grade)}
                                        </span>
                                    </div>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={tugas.max_grade}
                                        value={gradeForm.grade}
                                        onChange={(e) =>
                                            setGradeForm({
                                                ...gradeForm,
                                                grade: Number(e.target.value),
                                            })
                                        }
                                        className="h-16 border-white/20 text-center text-3xl font-bold"
                                    />
                                    <Slider
                                        value={[gradeForm.grade]}
                                        onValueChange={([v]) =>
                                            setGradeForm({
                                                ...gradeForm,
                                                grade: v,
                                            })
                                        }
                                        max={tugas.max_grade}
                                        step={1}
                                        className="mt-3"
                                    />
                                </div>
                                <div>
                                    <Label className="mb-2 block font-semibold">
                                        Quick Feedback
                                    </Label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {feedbackTemplates.map((t, i) => (
                                            <button
                                                key={i}
                                                onClick={() =>
                                                    setGradeForm({
                                                        ...gradeForm,
                                                        feedback: t.text,
                                                    })
                                                }
                                                className="flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-1 text-xs transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                                            >
                                                <t.icon
                                                    className={`h-3.5 w-3.5 ${t.color}`}
                                                />{' '}
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <Label className="mb-2 block font-semibold">
                                        Feedback
                                    </Label>
                                    <Textarea
                                        value={gradeForm.feedback}
                                        onChange={(e) =>
                                            setGradeForm({
                                                ...gradeForm,
                                                feedback: e.target.value,
                                            })
                                        }
                                        placeholder="Feedback konstruktif..."
                                        rows={4}
                                        className="border-white/20"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleGrade}
                                        className="h-12 flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:from-emerald-600 hover:to-teal-700"
                                        disabled={gradeForm.grade === null}
                                    >
                                        <Save className="mr-2 h-5 w-5" /> Simpan
                                        Nilai
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setShowGradeDialog(false)
                                        }
                                        className="h-12 border-white/20 px-6"
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* ═══ DETAIL DIALOG ═══ */}
                <Dialog
                    open={showDetailDialog}
                    onOpenChange={setShowDetailDialog}
                >
                    <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-hidden">
                        <DialogHeader>
                            <div className="relative -m-6 mb-4 overflow-hidden rounded-t-xl bg-gradient-to-br from-blue-500 via-cyan-600 to-teal-600 p-6">
                                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                                <div className="relative">
                                    <DialogTitle className="flex items-center gap-3 text-2xl text-white">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        Detail Submission
                                    </DialogTitle>
                                </div>
                            </div>
                        </DialogHeader>
                        {selectedSubmission && (
                            <div className="space-y-5 overflow-y-auto pr-2">
                                <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 text-2xl font-bold text-white shadow-lg">
                                        {selectedSubmission.mahasiswa.nama.charAt(
                                            0,
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold">
                                            {selectedSubmission.mahasiswa.nama}
                                        </p>
                                        <p className="font-mono text-sm text-neutral-500">
                                            {selectedSubmission.mahasiswa.nim}
                                        </p>
                                    </div>
                                    {getStatusBadge(
                                        selectedSubmission.status,
                                        selectedSubmission.is_late,
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                        <p className="mb-1 text-xs font-semibold text-blue-600">
                                            Waktu Submit
                                        </p>
                                        <p className="font-medium text-neutral-900 dark:text-white">
                                            {selectedSubmission.submitted_at}
                                        </p>
                                    </div>
                                    {selectedSubmission.graded_at && (
                                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                                            <p className="mb-1 text-xs font-semibold text-emerald-600">
                                                Waktu Dinilai
                                            </p>
                                            <p className="font-medium text-neutral-900 dark:text-white">
                                                {selectedSubmission.graded_at}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {selectedSubmission.content && (
                                    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
                                        <Label className="mb-2 block flex items-center gap-1 font-semibold">
                                            <FileText className="h-4 w-4" />{' '}
                                            Jawaban
                                        </Label>
                                        <div className="max-h-60 overflow-y-auto text-sm whitespace-pre-wrap">
                                            {selectedSubmission.content}
                                        </div>
                                    </div>
                                )}
                                {selectedSubmission.file_path && (
                                    <a
                                        href={selectedSubmission.file_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/20"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                            <Download className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-semibold">
                                                {selectedSubmission.file_name ||
                                                    'Download'}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                Klik untuk download
                                            </p>
                                        </div>
                                    </a>
                                )}
                                {selectedSubmission.grade !== null && (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-900/20">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 font-semibold">
                                                <Award className="h-5 w-5 text-emerald-600" />{' '}
                                                Nilai
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`text-2xl font-bold ${getGradeColor(selectedSubmission.grade)}`}
                                                >
                                                    {Number(
                                                        selectedSubmission.grade,
                                                    ).toFixed(1)}
                                                </span>
                                                {selectedSubmission.grade_letter && (
                                                    <Badge className="border-0 bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                                                        {
                                                            selectedSubmission.grade_letter
                                                        }
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        {selectedSubmission.feedback && (
                                            <div className="mt-4 border-t border-emerald-200 pt-4 dark:border-emerald-800">
                                                <p className="mb-1 flex items-center gap-1 text-sm font-semibold">
                                                    <MessageSquare className="h-4 w-4" />{' '}
                                                    Feedback
                                                </p>
                                                <p className="text-sm">
                                                    {
                                                        selectedSubmission.feedback
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <Button
                                    onClick={() => {
                                        setShowDetailDialog(false);
                                        openGradeDialog(selectedSubmission);
                                    }}
                                    className="h-12 w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:from-indigo-600 hover:to-purple-700"
                                >
                                    <Award className="mr-2 h-5 w-5" />{' '}
                                    {selectedSubmission.grade !== null
                                        ? 'Edit Nilai'
                                        : 'Beri Nilai'}
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* ═══ BULK GRADE DIALOG ═══ */}
                <Dialog
                    open={showBulkGradeDialog}
                    onOpenChange={setShowBulkGradeDialog}
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <div className="relative -m-6 mb-4 overflow-hidden rounded-t-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 p-6">
                                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                                <div className="relative">
                                    <DialogTitle className="flex items-center gap-3 text-2xl text-white">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                                            <CheckSquare className="h-6 w-6" />
                                        </div>
                                        Nilai Massal
                                    </DialogTitle>
                                    <p className="mt-2 ml-15 text-white/70">
                                        {selectedIds.length} submission terpilih
                                    </p>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Nilai (0-{tugas.max_grade})</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={tugas.max_grade}
                                    value={bulkGrade.grade}
                                    onChange={(e) =>
                                        setBulkGrade({
                                            ...bulkGrade,
                                            grade: e.target.value,
                                        })
                                    }
                                    className="h-14 border-white/20 text-center text-2xl font-bold"
                                />
                            </div>
                            <div>
                                <Label>Feedback (Opsional)</Label>
                                <Textarea
                                    value={bulkGrade.feedback}
                                    onChange={(e) =>
                                        setBulkGrade({
                                            ...bulkGrade,
                                            feedback: e.target.value,
                                        })
                                    }
                                    placeholder="Feedback untuk semua..."
                                    rows={4}
                                    className="border-white/20"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleBulkGrade}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                                    disabled={!bulkGrade.grade}
                                >
                                    <Save className="mr-2 h-4 w-4" /> Simpan
                                    Semua
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setShowBulkGradeDialog(false)
                                    }
                                    className="border-white/20"
                                >
                                    Batal
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </motion.div>

            {/* ═══ AI Grading Assistant ═══ */}
            <AIGradingPanel
                selectedSubmission={selectedSubmission}
                maxGrade={tugas.max_grade}
                onApplyScore={(score, feedback) => {
                    if (selectedSubmission) {
                        setGradeForm({ grade: score, feedback });
                        setShowGradeDialog(true);
                    }
                }}
            />
        </DosenLayout>
    );
}
