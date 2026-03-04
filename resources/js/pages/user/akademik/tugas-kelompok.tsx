import DraftTugasIcon from '@/assets/admin/informasi-tugas/draft.png';
import TugasIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import PublishedTugasIcon from '@/assets/admin/informasi-tugas/publised.png';
import TotalTugasIcon from '@/assets/admin/informasi-tugas/total-tugas.png';
import { Input } from '@/components/ui/input';
import StudentLayout from '@/layouts/student-layout';
import { cn } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowRight,
    Briefcase,
    CheckCircle2,
    Lock,
    Search,
    Sparkles,
    UserCheck,
    Users2,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type AssignmentStatus = 'not_joined' | 'joined' | 'submitted';

type Assignment = {
    id: number;
    title: string;
    description?: string | null;
    formation_mode: 'self-form' | 'random' | 'manual' | string;
    grading_mode?: string;
    course: { id: number | null; nama: string };
    dosen?: { id: number | null; nama: string } | null;
    formation_deadline?: string | null;
    formation_deadline_display?: string | null;
    submission_deadline?: string | null;
    submission_deadline_display?: string | null;
    is_locked: boolean;
    is_overdue: boolean;
    days_until_deadline?: number | null;
    status: AssignmentStatus;
    can_join: boolean;
    has_group: boolean;
    has_submitted: boolean;
    group_name?: string | null;
    group_id?: number | null;
    member_count?: number;
    max_members?: number;
    total_groups?: number;
    my_group?: {
        id: number;
        name: string;
        number?: number | null;
        progress: number;
        members_count: number;
    } | null;
};

type Stats = {
    total: number;
    active_groups: number;
    completed: number;
    not_joined: number;
    upcoming_deadline: string;
};

type Props = {
    assignments: Assignment[];
    mahasiswa: { id: number; nama: string };
    stats?: Stats;
};

const cV = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
} as const;

const iV = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 24,
        },
    },
} as const;

const statusMeta: Record<
    AssignmentStatus,
    { label: string; className: string; icon: typeof AlertCircle }
> = {
    not_joined: {
        label: 'Belum Bergabung',
        className:
            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        icon: AlertCircle,
    },
    joined: {
        label: 'Sedang Berjalan',
        className:
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        icon: UserCheck,
    },
    submitted: {
        label: 'Sudah Dikumpulkan',
        className:
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        icon: CheckCircle2,
    },
};

const formationMeta: Record<
    string,
    { label: string; color: string; icon: typeof Users2 }
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

function StatCard({
    label,
    value,
    sub,
    image,
    gradient,
    glow,
}: {
    label: string;
    value: string | number;
    sub: string;
    image: string;
    gradient: string;
    glow: string;
}) {
    return (
        <motion.div
            variants={iV}
            whileHover={{ scale: 1.02, y: -4 }}
            className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl dark:border-white/5 dark:bg-neutral-900/40"
        >
            <div
                className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-10',
                    gradient,
                )}
            />
            <div
                className={cn(
                    'absolute -top-10 -right-10 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-35',
                    glow,
                )}
            />

            <div className="relative z-10">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <img
                        src={image}
                        alt={label}
                        className="h-11 w-11 object-contain"
                    />
                </div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    {label}
                </p>
                <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-white">
                    {value}
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {sub}
                </p>
            </div>
        </motion.div>
    );
}

function AssignmentCard({ assignment }: { assignment: Assignment }) {
    const meta = statusMeta[assignment.status];
    const MetaIcon = meta.icon;
    const formation =
        formationMeta[assignment.formation_mode] ?? formationMeta['self-form'];
    const FormationIcon = formation.icon;

    const deadlineInfo = (() => {
        if (assignment.is_overdue) {
            return 'Deadline terlewat';
        }

        if (
            assignment.days_until_deadline === null ||
            assignment.days_until_deadline === undefined
        ) {
            return assignment.submission_deadline_display ?? '-';
        }

        if (assignment.days_until_deadline < 0) {
            return 'Deadline terlewat';
        }

        if (assignment.days_until_deadline === 0) {
            return 'Deadline hari ini';
        }

        if (assignment.days_until_deadline === 1) {
            return 'Deadline besok';
        }

        return `${assignment.days_until_deadline} hari lagi`;
    })();

    return (
        <motion.div
            variants={iV}
            whileHover={{ scale: 1.01, y: -4 }}
            className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl transition-all hover:shadow-2xl sm:p-5 dark:border-white/5 dark:bg-neutral-900/40"
            onClick={() =>
                router.visit(`/user/akademik/tugas-kelompok/${assignment.id}`)
            }
        >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10" />
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo-500/20 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />

            <div className="relative z-10">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-base font-bold text-neutral-900 transition-colors group-hover:text-indigo-600 sm:text-lg dark:text-white dark:group-hover:text-indigo-400">
                            {assignment.title}
                        </h3>
                        <p className="mt-1 text-xs text-neutral-500 sm:text-sm dark:text-neutral-400">
                            {assignment.course.nama}
                        </p>
                    </div>
                    <span
                        className={cn(
                            'inline-flex shrink-0 items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-bold sm:gap-1.5 sm:px-2.5 sm:text-[11px]',
                            meta.className,
                        )}
                    >
                        <MetaIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="hidden sm:inline">{meta.label}</span>
                    </span>
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                        className={cn(
                            'inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2 py-1 text-[10px] font-semibold text-white sm:px-2.5 sm:text-[11px]',
                            formation.color,
                        )}
                    >
                        <FormationIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {formation.label}
                    </span>
                    {assignment.is_locked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700 sm:px-2.5 sm:text-[11px] dark:bg-slate-800 dark:text-slate-300">
                            <Lock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            Locked
                        </span>
                    )}
                </div>

                {assignment.description && (
                    <p className="mb-4 line-clamp-2 hidden text-sm text-neutral-600 sm:block dark:text-neutral-300">
                        {assignment.description}
                    </p>
                )}

                <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-white/60 px-2.5 py-2 text-neutral-600 sm:px-3 dark:bg-neutral-800/60 dark:text-neutral-300">
                        <p className="text-[10px] tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                            Kelompok
                        </p>
                        <p className="mt-0.5 font-semibold">
                            {assignment.total_groups ?? 0} slot
                        </p>
                    </div>
                    <div className="rounded-xl bg-white/60 px-2.5 py-2 text-neutral-600 sm:px-3 dark:bg-neutral-800/60 dark:text-neutral-300">
                        <p className="text-[10px] tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                            Deadline
                        </p>
                        <p
                            className={cn(
                                'mt-0.5 font-semibold',
                                assignment.is_overdue
                                    ? 'text-red-500 dark:text-red-400'
                                    : '',
                            )}
                        >
                            {deadlineInfo}
                        </p>
                    </div>
                </div>

                {assignment.my_group && (
                    <div className="mb-4">
                        <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-neutral-500 dark:text-neutral-400">
                                Progress Kelompok
                            </span>
                            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                                {Math.round(assignment.my_group.progress)}%
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${Math.max(0, Math.min(100, assignment.my_group.progress))}%`,
                                }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between border-t border-neutral-200/70 pt-3 dark:border-neutral-700/70">
                    <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 text-[10px] font-bold text-white sm:h-8 sm:w-8 sm:text-xs">
                            {(assignment.dosen?.nama || '?').charAt(0)}
                        </div>
                        <span className="truncate text-xs text-neutral-600 sm:text-sm dark:text-neutral-300">
                            {assignment.dosen?.nama || 'Dosen'}
                        </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 sm:text-sm dark:text-indigo-400">
                        {assignment.status === 'not_joined' &&
                        assignment.can_join ? (
                            <>
                                <span className="sm:hidden">Pilih</span>
                                <span className="hidden sm:inline">
                                    Pilih Kelompok
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="sm:hidden">Detail</span>
                                <span className="hidden sm:inline">
                                    Lihat Detail
                                </span>
                            </>
                        )}
                        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

export default function UserTugasKelompok({
    assignments,
    mahasiswa,
    stats,
}: Props) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | AssignmentStatus>('all');

    const computedStats = useMemo(() => {
        const total = assignments.length;
        const notJoined = assignments.filter(
            (assignment) => assignment.status === 'not_joined',
        ).length;
        const joined = assignments.filter(
            (assignment) => assignment.status === 'joined',
        ).length;
        const submitted = assignments.filter(
            (assignment) => assignment.status === 'submitted',
        ).length;

        return {
            total,
            active_groups: joined,
            completed: submitted,
            not_joined: notJoined,
            upcoming_deadline: '-',
        };
    }, [assignments]);

    const effectiveStats = stats ?? computedStats;

    const filteredAssignments = useMemo(() => {
        const query = search.trim().toLowerCase();

        return assignments.filter((assignment) => {
            if (filter !== 'all' && assignment.status !== filter) {
                return false;
            }

            if (!query) {
                return true;
            }

            const dosenName = assignment.dosen?.nama ?? '';
            return [assignment.title, assignment.course.nama, dosenName]
                .join(' ')
                .toLowerCase()
                .includes(query);
        });
    }, [assignments, filter, search]);

    const groupedAssignments = useMemo(
        () => ({
            not_joined: filteredAssignments.filter(
                (assignment) => assignment.status === 'not_joined',
            ),
            joined: filteredAssignments.filter(
                (assignment) => assignment.status === 'joined',
            ),
            submitted: filteredAssignments.filter(
                (assignment) => assignment.status === 'submitted',
            ),
        }),
        [filteredAssignments],
    );

    return (
        <StudentLayout>
            <Head title="Tugas Kelompok" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={cV}
                className="space-y-6 p-4 md:p-6"
            >
                <motion.div
                    variants={iV}
                    className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl sm:p-8"
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

                    <div className="relative z-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:gap-6 sm:text-left">
                        <motion.img
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                                type: 'spring',
                                stiffness: 240,
                                damping: 18,
                            }}
                            src={TugasIcon}
                            alt="Tugas Kelompok"
                            className="h-16 w-16 shrink-0 object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.55)] sm:h-20 sm:w-20"
                        />

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium tracking-wide text-purple-100">
                                Kolaborasi Tim Mahasiswa
                            </p>
                            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                                Tugas Kelompok
                            </h1>
                            <p className="mt-2 text-sm text-purple-100 sm:text-base">
                                Lihat tugas terbaru, pilih kelompok, dan pantau
                                progress tim Anda.
                            </p>
                            <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                                <Users2 className="h-3.5 w-3.5" />
                                {mahasiswa.nama}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
                    <StatCard
                        label="Total Tugas"
                        value={effectiveStats.total}
                        sub="Semua tugas kelompok"
                        image={TotalTugasIcon}
                        gradient="from-indigo-500 to-violet-500"
                        glow="bg-indigo-500"
                    />
                    <StatCard
                        label="Belum Bergabung"
                        value={effectiveStats.not_joined}
                        sub="Perlu pilih kelompok"
                        image={DraftTugasIcon}
                        gradient="from-amber-500 to-orange-500"
                        glow="bg-amber-500"
                    />
                    <StatCard
                        label="Sedang Berjalan"
                        value={effectiveStats.active_groups}
                        sub="Kolaborasi aktif"
                        image={TugasIcon}
                        gradient="from-emerald-500 to-teal-500"
                        glow="bg-emerald-500"
                    />
                    <StatCard
                        label="Sudah Selesai"
                        value={effectiveStats.completed}
                        sub={`Deadline terdekat: ${effectiveStats.upcoming_deadline}`}
                        image={PublishedTugasIcon}
                        gradient="from-blue-500 to-cyan-500"
                        glow="bg-blue-500"
                    />
                </div>

                <motion.div
                    variants={iV}
                    className="rounded-3xl border border-white/20 bg-white/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="mb-4 flex items-center gap-2">
                        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 p-2 text-white">
                            <Search className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                            Filter & Pencarian
                        </h3>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari judul, mata kuliah, atau dosen..."
                                className="h-11 rounded-xl border-white/30 bg-white/60 pl-10 dark:bg-neutral-800/60"
                            />
                        </div>

                        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <div className="inline-flex min-w-max rounded-2xl bg-neutral-100/70 p-1 backdrop-blur dark:bg-neutral-900/70">
                                {[
                                    {
                                        key: 'all',
                                        label: 'Semua',
                                        count: assignments.length,
                                    },
                                    {
                                        key: 'not_joined',
                                        label: 'Belum Gabung',
                                        count: effectiveStats.not_joined,
                                    },
                                    {
                                        key: 'joined',
                                        label: 'Aktif',
                                        count: effectiveStats.active_groups,
                                    },
                                    {
                                        key: 'submitted',
                                        label: 'Selesai',
                                        count: effectiveStats.completed,
                                    },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() =>
                                            setFilter(
                                                item.key as
                                                    | 'all'
                                                    | AssignmentStatus,
                                            )
                                        }
                                        className={cn(
                                            'relative rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                                            filter === item.key
                                                ? 'text-indigo-700 dark:text-indigo-300'
                                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                                        )}
                                    >
                                        {filter === item.key && (
                                            <motion.div
                                                layoutId="user-tugas-kelompok-filter"
                                                className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-neutral-800"
                                                transition={{
                                                    type: 'spring',
                                                    bounce: 0.2,
                                                    duration: 0.5,
                                                }}
                                            />
                                        )}
                                        <span className="relative z-10 inline-flex items-center gap-2">
                                            <span>{item.label}</span>
                                            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                                                {item.count}
                                            </span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {filteredAssignments.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            className="rounded-3xl border border-white/20 bg-white/40 p-10 text-center shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                        >
                            <Briefcase className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                            <p className="font-semibold text-slate-700 dark:text-slate-200">
                                Belum ada data tugas kelompok
                            </p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Coba ubah filter atau tunggu tugas baru dari
                                dosen/admin.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            variants={cV}
                            initial="hidden"
                            animate="visible"
                            className="space-y-7"
                        >
                            {groupedAssignments.not_joined.length > 0 && (
                                <section className="space-y-3">
                                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                        <AlertCircle className="h-5 w-5 text-amber-500" />
                                        Belum Bergabung (
                                        {groupedAssignments.not_joined.length})
                                    </h2>
                                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-2">
                                        {groupedAssignments.not_joined.map(
                                            (assignment) => (
                                                <AssignmentCard
                                                    key={assignment.id}
                                                    assignment={assignment}
                                                />
                                            ),
                                        )}
                                    </div>
                                </section>
                            )}

                            {groupedAssignments.joined.length > 0 && (
                                <section className="space-y-3">
                                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                        <Users2 className="h-5 w-5 text-emerald-500" />
                                        Sedang Berjalan (
                                        {groupedAssignments.joined.length})
                                    </h2>
                                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-2">
                                        {groupedAssignments.joined.map(
                                            (assignment) => (
                                                <AssignmentCard
                                                    key={assignment.id}
                                                    assignment={assignment}
                                                />
                                            ),
                                        )}
                                    </div>
                                </section>
                            )}

                            {groupedAssignments.submitted.length > 0 && (
                                <section className="space-y-3">
                                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                        Sudah Selesai (
                                        {groupedAssignments.submitted.length})
                                    </h2>
                                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-2">
                                        {groupedAssignments.submitted.map(
                                            (assignment) => (
                                                <AssignmentCard
                                                    key={assignment.id}
                                                    assignment={assignment}
                                                />
                                            ),
                                        )}
                                    </div>
                                </section>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </StudentLayout>
    );
}
