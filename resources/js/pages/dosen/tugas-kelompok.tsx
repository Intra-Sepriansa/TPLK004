import TugasIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import DosenLayout from '@/layouts/dosen-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Award,
    Calendar,
    CheckCircle,
    Eye,
    FileText,
    Filter,
    FolderKanban,
    Lock,
    Plus,
    Search,
    Sparkles,
    Trash2,
    UserCheck,
    Users,
    Users2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type Course = { id: number; nama: string };
type Assignment = {
    id: number;
    title: string;
    description: string;
    formation_mode: string;
    grading_mode: string;
    course: { id: number; nama: string };
    min_members: number;
    max_members: number;
    formation_deadline: string | null;
    formation_deadline_display: string | null;
    submission_deadline: string | null;
    submission_deadline_display: string | null;
    is_locked: boolean;
    total_groups: number;
    total_students: number;
    submitted_groups: number;
    graded_groups: number;
    created_at: string;
    is_overdue: boolean;
    days_until_deadline: number;
};
type Stats = {
    total: number;
    active: number;
    overdue: number;
    total_groups: number;
    total_students: number;
    avg_completion: number;
};
type Props = {
    assignments: Assignment[];
    stats: Stats;
    courses: Course[];
    allCourses: Course[];
    filters: { search: string; course_id: string };
    dosen: { id: number; nama: string };
};

const cV = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
} as const;
const iV = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
} as const;

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
    const [d, setD] = useState(0);
    useEffect(() => {
        const s = 0;
        const e = value;
        const dur = 1200;
        const st = Date.now();
        const t = setInterval(() => {
            const el = Date.now() - st;
            const p = Math.min(el / dur, 1);
            setD(Math.round(s + (e - s) * (1 - Math.pow(1 - p, 3))));
            if (p >= 1) clearInterval(t);
        }, 16);
        return () => clearInterval(t);
    }, [value]);
    return (
        <>
            {d}
            {suffix}
        </>
    );
}

const formationLabels: Record<
    string,
    { label: string; color: string; icon: any }
> = {
    'self-form': {
        label: 'Self-Form',
        color: 'from-blue-500 to-cyan-500',
        icon: Users2,
    },
    random: {
        label: 'Random',
        color: 'from-purple-500 to-violet-500',
        icon: Sparkles,
    },
    manual: {
        label: 'Manual',
        color: 'from-amber-500 to-orange-500',
        icon: UserCheck,
    },
};
const gradingLabels: Record<string, { label: string; color: string }> = {
    same: { label: 'Same Grade', color: 'from-green-500 to-emerald-500' },
    individual: { label: 'Individual', color: 'from-blue-500 to-indigo-500' },
    peer: { label: 'Peer Eval', color: 'from-purple-500 to-pink-500' },
    contribution: {
        label: 'Contribution',
        color: 'from-orange-500 to-red-500',
    },
};

export default function DosenTugasKelompok({
    assignments,
    stats,
    courses,
    allCourses,
    filters,
    dosen,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [courseFilter, setCourseFilter] = useState(
        filters.course_id || 'all',
    );
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        id: number | null;
    }>({ open: false, id: null });

    const applyFilters = (overrides: Record<string, string> = {}) => {
        router.get(
            '/dosen/tugas-kelompok',
            { search, course_id: courseFilter, ...overrides },
            { preserveState: true },
        );
    };

    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/dosen/tugas-kelompok/${deleteDialog.id}`);
            setDeleteDialog({ open: false, id: null });
        }
    };

    const summaryCards = [
        {
            key: 'total',
            label: 'Total Tugas Kelompok',
            value: stats.total,
            sub: `${stats.active} aktif`,
            gradient: 'from-blue-400 to-indigo-600',
            glow: 'bg-blue-500',
        },
        {
            key: 'groups',
            label: 'Total Kelompok',
            value: stats.total_groups,
            sub: `${stats.total_students} mahasiswa`,
            gradient: 'from-purple-400 to-violet-600',
            glow: 'bg-purple-500',
        },
        {
            key: 'completion',
            label: 'Tingkat Submit',
            value: stats.avg_completion,
            suffix: '%',
            sub: 'Rata-rata',
            gradient: 'from-emerald-400 to-teal-600',
            glow: 'bg-emerald-500',
        },
        {
            key: 'overdue',
            label: 'Overdue',
            value: stats.overdue,
            sub: 'Perlu perhatian',
            gradient: 'from-red-400 to-rose-600',
            glow: 'bg-red-500',
        },
    ];

    return (
        <DosenLayout>
            <Head title="Tugas Kelompok" />
            <motion.div
                className="space-y-6 p-4 md:p-6"
                variants={cV}
                initial="hidden"
                animate="visible"
            >
                {/* ═══ HEADER ═══ */}
                <motion.div
                    variants={iV}
                    className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="relative">
                        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row lg:items-start">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left lg:w-auto">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
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
                                >
                                    <img
                                        src={TugasIcon}
                                        alt="Tugas Kelompok"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <motion.p
                                        className="text-sm font-medium tracking-wide text-purple-100"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Manajemen Kelompok
                                    </motion.p>
                                    <motion.h1
                                        className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        Tugas Kelompok
                                    </motion.h1>
                                    <motion.p
                                        className="mt-2 text-sm leading-relaxed text-purple-100 sm:text-base"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        Kelola tugas kelompok, pembentukan tim,
                                        dan penilaian kolaboratif
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
                                    <div className="rounded-lg bg-purple-500/20 p-2">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-purple-100">
                                            Total Kelompok
                                        </p>
                                        <p className="text-2xl font-bold text-white">
                                            {stats.total_groups}
                                        </p>
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-wrap justify-center gap-2"
                                >
                                    <motion.button
                                        whileHover={{
                                            scale: 1.02,
                                            backgroundColor:
                                                'rgba(255,255,255,0.25)',
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() =>
                                            router.visit(
                                                '/dosen/tugas-kelompok/create',
                                            )
                                        }
                                        className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/20 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30"
                                    >
                                        <Plus className="h-4 w-4" /> Buat Tugas
                                        Kelompok
                                    </motion.button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ═══ SUMMARY CARDS ═══ */}
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
                    {summaryCards.map((card) => {
                        const colorMap: Record<string, any> = {
                            'bg-blue-500': {
                                gradientBg: 'from-blue-500/5 to-indigo-500/5',
                                hoverShadow: 'hover:shadow-blue-500/10',
                            },
                            'bg-purple-500': {
                                gradientBg: 'from-purple-500/5 to-violet-500/5',
                                hoverShadow: 'hover:shadow-purple-500/10',
                            },
                            'bg-emerald-500': {
                                gradientBg: 'from-emerald-500/5 to-teal-500/5',
                                hoverShadow: 'hover:shadow-emerald-500/10',
                            },
                            'bg-red-500': {
                                gradientBg: 'from-red-500/5 to-rose-500/5',
                                hoverShadow: 'hover:shadow-red-500/10',
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
                                            type: 'spring' as const,
                                            stiffness: 100,
                                            damping: 15,
                                        },
                                    },
                                }}
                                whileHover={{
                                    y: -5,
                                    scale: 1.02,
                                    transition: {
                                        type: 'spring' as const,
                                        stiffness: 400,
                                        damping: 25,
                                    },
                                }}
                                onHoverStart={() => setHoveredCard(card.key)}
                                onHoverEnd={() => setHoveredCard(null)}
                                className={cn(
                                    'group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl transition-all sm:rounded-3xl sm:p-5 dark:border-white/5 dark:bg-neutral-900/40',
                                    cc.hoverShadow,
                                )}
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${cc.gradientBg} opacity-50 dark:opacity-100`}
                                />
                                <motion.div
                                    className={cn(
                                        'absolute -top-8 -right-8 h-28 w-28 rounded-full blur-3xl transition-all',
                                        card.glow,
                                    )}
                                    animate={{
                                        opacity:
                                            hoveredCard === card.key
                                                ? 0.4
                                                : 0.15,
                                    }}
                                />
                                <div className="relative z-10 flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
                                    <p className="text-[10px] font-medium text-neutral-500 sm:text-xs dark:text-neutral-400">
                                        {card.label}
                                    </p>
                                    <span className="text-xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
                                        <Counter
                                            value={card.value}
                                            suffix={card.suffix}
                                        />
                                    </span>
                                    <p className="mt-0.5 hidden text-[10px] text-neutral-400 sm:block">
                                        {card.sub}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* ═══ FILTER ═══ */}
                <motion.div
                    variants={iV}
                    className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-4 flex items-center gap-2">
                        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 p-2 text-white">
                            <Filter className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                            Filter & Pencarian
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <div className="relative min-w-[200px] flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Cari tugas kelompok..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && applyFilters()
                                }
                                className="border-white/30 bg-white/60 pl-10 dark:bg-neutral-800/60"
                            />
                        </div>
                        <Select
                            value={courseFilter}
                            onValueChange={(v) => {
                                setCourseFilter(v);
                                applyFilters({ course_id: v });
                            }}
                        >
                            <SelectTrigger className="w-44 border-white/30 bg-white/60 dark:bg-neutral-800/60">
                                <SelectValue placeholder="Mata Kuliah" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua MK</SelectItem>
                                {courses.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.nama}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>

                {/* ═══ ASSIGNMENT LIST ═══ */}
                <motion.div
                    variants={iV}
                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:bg-neutral-900/40"
                >
                    <div className="border-b border-slate-200/50 p-4 dark:border-slate-700/50">
                        <div className="flex items-center gap-2">
                            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 p-2 text-white">
                                <FolderKanban className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">
                                    Daftar Tugas Kelompok
                                </h2>
                                <p className="text-xs text-slate-500">
                                    {assignments.length} tugas ditemukan
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4">
                        {assignments.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-16 text-center"
                            >
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                    }}
                                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500"
                                >
                                    <Users className="h-10 w-10 text-white" />
                                </motion.div>
                                <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                                    Belum ada tugas kelompok
                                </p>
                                <p className="mt-2 text-sm text-slate-500">
                                    Klik "Buat Tugas Kelompok" untuk memulai
                                </p>
                                <Button
                                    onClick={() =>
                                        router.visit(
                                            '/dosen/tugas-kelompok/create',
                                        )
                                    }
                                    className="mt-4 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Buat Tugas
                                    Kelompok
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="space-y-3">
                                {assignments.map((a, i) => {
                                    const fm =
                                        formationLabels[a.formation_mode] ||
                                        formationLabels['self-form'];
                                    const gm =
                                        gradingLabels[a.grading_mode] ||
                                        gradingLabels.same;
                                    const FMIcon = fm.icon;
                                    const completionRate =
                                        a.total_groups > 0
                                            ? Math.round(
                                                  (a.submitted_groups /
                                                      a.total_groups) *
                                                      100,
                                              )
                                            : 0;
                                    return (
                                        <motion.div
                                            key={a.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}
                                            whileHover={{ scale: 1.01, y: -2 }}
                                            onMouseEnter={() =>
                                                setHoveredCard(String(a.id))
                                            }
                                            onMouseLeave={() =>
                                                setHoveredCard(null)
                                            }
                                            className={cn(
                                                'relative cursor-pointer overflow-hidden rounded-2xl border-2 p-4 transition-colors',
                                                a.is_overdue
                                                    ? 'border-red-200 bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:border-red-800/50 dark:from-red-950/20 dark:to-rose-950/20'
                                                    : 'border-slate-200/50 bg-white/60 dark:border-slate-700/50 dark:bg-neutral-800/30',
                                            )}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div
                                                    className="flex flex-1 cursor-pointer items-start gap-3"
                                                    onClick={() =>
                                                        router.visit(
                                                            `/dosen/tugas-kelompok/${a.id}`,
                                                        )
                                                    }
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        {/* Badges */}
                                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                                            <span
                                                                className={cn(
                                                                    'inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2.5 py-1 text-xs font-medium text-white shadow-lg',
                                                                    fm.color,
                                                                )}
                                                            >
                                                                <FMIcon className="h-3 w-3" />{' '}
                                                                {fm.label}
                                                            </span>
                                                            <span
                                                                className={cn(
                                                                    'inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2.5 py-1 text-xs font-medium text-white',
                                                                    gm.color,
                                                                )}
                                                            >
                                                                <Award className="h-3 w-3" />{' '}
                                                                {gm.label}
                                                            </span>
                                                            {a.is_locked && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                                                                    <Lock className="h-3 w-3" />{' '}
                                                                    Locked
                                                                </span>
                                                            )}
                                                            {a.is_overdue && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                                                    <AlertTriangle className="h-3 w-3" />{' '}
                                                                    Overdue
                                                                </span>
                                                            )}
                                                        </div>
                                                        {/* Title */}
                                                        <h3
                                                            className={cn(
                                                                'text-base font-bold transition-colors',
                                                                hoveredCard ===
                                                                    String(a.id)
                                                                    ? 'text-purple-600 dark:text-purple-400'
                                                                    : 'text-slate-900 dark:text-white',
                                                            )}
                                                        >
                                                            {a.title}
                                                        </h3>
                                                        <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                                                            {a.description}
                                                        </p>
                                                        {/* Progress */}
                                                        {a.total_groups > 0 && (
                                                            <div className="mt-3 max-w-md">
                                                                <div className="mb-1 flex justify-between text-xs">
                                                                    <span className="text-slate-600 dark:text-slate-400">
                                                                        Submit (
                                                                        {
                                                                            a.submitted_groups
                                                                        }
                                                                        /
                                                                        {
                                                                            a.total_groups
                                                                        }
                                                                        )
                                                                    </span>
                                                                    <span className="font-bold">
                                                                        {
                                                                            completionRate
                                                                        }
                                                                        %
                                                                    </span>
                                                                </div>
                                                                <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                                                                    <motion.div
                                                                        className={cn(
                                                                            'h-full rounded-full',
                                                                            completionRate >=
                                                                                80
                                                                                ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                                                                                : completionRate >=
                                                                                    50
                                                                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                                                                  : 'bg-gradient-to-r from-amber-500 to-orange-500',
                                                                        )}
                                                                        initial={{
                                                                            width: 0,
                                                                        }}
                                                                        animate={{
                                                                            width: `${completionRate}%`,
                                                                        }}
                                                                        transition={{
                                                                            duration: 0.5,
                                                                            delay:
                                                                                i *
                                                                                0.03,
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {/* Info tags */}
                                                        <div className="mt-3 flex flex-wrap items-center gap-3">
                                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                                <FileText className="h-3.5 w-3.5" />
                                                                {a.course.nama}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                                <Users className="h-3.5 w-3.5" />
                                                                {a.total_groups}{' '}
                                                                kelompok |{' '}
                                                                {
                                                                    a.total_students
                                                                }{' '}
                                                                mhs
                                                            </span>
                                                            {a.submission_deadline_display && (
                                                                <span
                                                                    className={cn(
                                                                        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs',
                                                                        a.is_overdue
                                                                            ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
                                                                    )}
                                                                >
                                                                    <Calendar className="h-3.5 w-3.5" />
                                                                    {
                                                                        a.submission_deadline_display
                                                                    }
                                                                </span>
                                                            )}
                                                            {a.graded_groups >
                                                                0 && (
                                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-1 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                                    {
                                                                        a.graded_groups
                                                                    }{' '}
                                                                    dinilai
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            router.visit(
                                                                `/dosen/tugas-kelompok/${a.id}`,
                                                            )
                                                        }
                                                        className="text-purple-600 hover:bg-purple-50 hover:text-purple-800"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            setDeleteDialog({
                                                                open: true,
                                                                id: a.id,
                                                            })
                                                        }
                                                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            <ConfirmDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    setDeleteDialog({ open, id: open ? deleteDialog.id : null })
                }
                onConfirm={handleDelete}
                title="Hapus Tugas Kelompok"
                message="Yakin ingin menghapus tugas kelompok ini? Semua data kelompok, pesan, dan file akan dihapus."
                variant="danger"
                confirmText="Ya, Hapus"
                cancelText="Batal"
            />
        </DosenLayout>
    );
}
