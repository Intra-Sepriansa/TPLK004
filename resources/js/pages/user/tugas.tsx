import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import StudentLayout from '@/layouts/student-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    BookOpen,
    Calendar,
    CheckCircle,
    FileText,
    Filter,
    ListTodo,
    MessageSquare,
    Search,
    Sparkles,
    Target,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import TimelineView from '@/components/tugas/timeline-view';
import CalendarView from '@/components/tugas/calendar-view';
import tugasHeaderIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import totalTugasIcon from '@/assets/admin/informasi-tugas/total-tugas.png';
import draftIcon from '@/assets/admin/informasi-tugas/draft.png';
import overdueIcon from '@/assets/admin/informasi-tugas/overdue.png';
import publishedIcon from '@/assets/admin/informasi-tugas/publised.png';

type Course = { id: number; nama: string; dosen: string | null };
type Tugas = {
    id: number;
    judul: string;
    deskripsi: string;
    jenis: string;
    deadline: string;
    deadline_display: string;
    prioritas: string;
    course: { id: number; nama: string; dosen: string | null };
    created_by: string;
    is_overdue: boolean;
    days_until_deadline: number;
    is_read: boolean;
    diskusi_count: number;
};
type Props = {
    mahasiswa: { id: number; nama: string; nim: string };
    tugasList: Tugas[];
    courses: Course[];
    stats: { total: number; upcoming: number; overdue: number; unread: number };
    filters: { search: string; course_id: string; status: string };
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
    },
    hover: {
        scale: 1.04,
        y: -4,
        transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
    },
};

const getPriorityConfig = (priority: string): { bg: string; text: string; icon: LucideIcon; label: string } => {
    const configs: Record<string, { bg: string; text: string; icon: LucideIcon; label: string }> = {
        tinggi: {
            bg: 'bg-gradient-to-r from-red-500 to-rose-600',
            text: 'text-white',
            icon: Zap,
            label: 'Tinggi',
        },
        sedang: {
            bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
            text: 'text-white',
            icon: Target,
            label: 'Sedang',
        },
        rendah: {
            bg: 'bg-gradient-to-r from-emerald-500 to-green-500',
            text: 'text-white',
            icon: CheckCircle,
            label: 'Rendah',
        },
    };

    return configs[priority] || configs.rendah;
};

export default function UserTugas({ mahasiswa, tugasList, courses, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [courseId, setCourseId] = useState(filters.course_id);
    const [status, setStatus] = useState(filters.status);

    const statsCards = [
        {
            label: 'Total Tugas',
            value: stats.total,
            iconSrc: totalTugasIcon,
            gradient: 'from-indigo-500/15 to-blue-500/5',
            glow: 'bg-indigo-500/30',
        },
        {
            label: 'Mendatang',
            value: stats.upcoming,
            iconSrc: publishedIcon,
            gradient: 'from-emerald-500/15 to-teal-500/5',
            glow: 'bg-emerald-500/30',
        },
        {
            label: 'Terlewat',
            value: stats.overdue,
            iconSrc: overdueIcon,
            gradient: 'from-rose-500/15 to-red-500/5',
            glow: 'bg-rose-500/30',
        },
        {
            label: 'Belum Dibaca',
            value: stats.unread,
            iconSrc: draftIcon,
            gradient: 'from-amber-500/15 to-orange-500/5',
            glow: 'bg-amber-500/30',
        },
    ];

    return (
        <StudentLayout>
            <Head title="Informasi Tugas" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-6 p-4 sm:p-6"
            >
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl p-5 text-white shadow-2xl sm:p-7 lg:p-8"
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
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <motion.img
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                                src={tugasHeaderIcon}
                                alt="Informasi Tugas"
                                className="h-16 w-16 shrink-0 object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)] sm:h-20 sm:w-20"
                            />
                            <div className="min-w-0">
                                <p className="text-sm font-medium tracking-wide text-white/85">Akademik</p>
                                <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                                    Informasi Tugas
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm text-white/90 sm:text-base">
                                    Kelola tugas per mata kuliah dengan data real untuk {mahasiswa.nama}.
                                </p>
                            </div>
                        </div>

                        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
                            <div className="rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-center backdrop-blur-md">
                                <p className="text-[11px] font-medium text-white/75">NIM</p>
                                <p className="text-sm font-semibold text-white">{mahasiswa.nim}</p>
                            </div>
                            <div className="rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-center backdrop-blur-md">
                                <p className="text-[11px] font-medium text-white/75">Mata Kuliah</p>
                                <p className="text-sm font-semibold text-white">{courses.length}</p>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="relative z-10 mt-4 flex justify-center lg:justify-end"
                    >
                        <Button
                            onClick={() => router.visit('/user/akademik/tugas-kelompok')}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 text-white shadow-lg"
                        >
                            <ListTodo className="mr-2 h-4 w-4" /> Tugas Kelompok
                        </Button>
                    </motion.div>
                </motion.div>

                <motion.div variants={containerVariants} className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                    {statsCards.map((stat) => (
                        <motion.div
                            key={stat.label}
                            variants={itemVariants}
                            whileHover={{ scale: 1.04, y: -4, transition: { type: 'spring', stiffness: 400, damping: 15 } }}
                            className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-3 shadow-xl backdrop-blur-xl transition-all dark:border-white/5 dark:bg-neutral-900/40 sm:rounded-3xl sm:p-6"
                        >
                            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.gradient}`} />
                            <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl ${stat.glow}`} />

                            <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                                <motion.img
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    src={stat.iconSrc}
                                    alt={stat.label}
                                    className="h-10 w-10 shrink-0 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)] sm:h-14 sm:w-14"
                                />
                                <div>
                                    <p className="text-[10px] font-medium leading-tight text-neutral-600 dark:text-neutral-400 sm:text-sm">{stat.label}</p>
                                    <p className="mt-0.5 text-lg font-bold text-neutral-900 dark:text-white sm:mt-1 sm:text-2xl">
                                        <AnimatedCounter value={stat.value} duration={1200} />
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-4 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 sm:p-5"
                >
                    <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-2 text-white">
                            <Filter className="h-4 w-4" />
                        </div>
                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white sm:text-base">Filter Informasi Tugas</h2>
                    </div>
                    <div className="flex flex-col gap-3 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <Input
                                placeholder="Cari judul atau deskripsi tugas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' &&
                                    router.get('/user/tugas', { search, course_id: courseId, status }, { preserveState: true })
                                }
                                className="h-11 rounded-xl border-white/20 pl-10 focus:border-indigo-500 focus:ring-indigo-500 dark:border-white/5"
                            />
                        </div>
                        <Select
                            value={courseId}
                            onValueChange={(v) => {
                                setCourseId(v);
                                router.get('/user/tugas', { search, course_id: v, status }, { preserveState: true });
                            }}
                        >
                            <SelectTrigger className="h-11 w-full rounded-xl md:w-56">
                                <SelectValue placeholder="Semua Mata Kuliah" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                                {courses.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.nama}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={status}
                            onValueChange={(v) => {
                                setStatus(v);
                                router.get('/user/tugas', { search, course_id: courseId, status: v }, { preserveState: true });
                            }}
                        >
                            <SelectTrigger className="h-11 w-full rounded-xl md:w-44">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="upcoming">Mendatang</SelectItem>
                                <SelectItem value="overdue">Terlewat</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-xl backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                >
                    <div className="flex items-center gap-3 border-b border-white/20 p-4 dark:border-white/5 sm:p-6">
                        <div className="rounded-xl bg-blue-500 p-2 text-white">
                            <ListTodo className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white sm:text-xl">Daftar Tugas</h2>
                    </div>

                    <div className="p-4 sm:p-5">
                        {tugasList.length === 0 ? (
                            <div className="py-14 text-center sm:py-16">
                                <div className="relative mx-auto mb-6 h-24 w-24">
                                    <div className="absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-20" />
                                    <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30">
                                        <FileText className="h-12 w-12 text-white" />
                                    </div>
                                </div>
                                <p className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 sm:text-xl">Belum ada tugas</p>
                                <p className="mt-2 text-sm text-neutral-500">Tugas dari dosen akan tampil otomatis di halaman ini.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tugasList.map((tugas) => {
                                    const priorityConfig = getPriorityConfig(tugas.prioritas);
                                    const PriorityIcon = priorityConfig.icon;

                                    return (
                                        <motion.div
                                            key={tugas.id}
                                            variants={cardVariants}
                                            whileHover="hover"
                                            onClick={() => router.visit(`/user/tugas/${tugas.id}`)}
                                            className={`group cursor-pointer rounded-3xl border p-4 transition-all duration-300 hover:shadow-xl sm:p-5 ${
                                                tugas.is_overdue
                                                    ? 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50 dark:border-red-800 dark:from-red-900/20 dark:to-rose-900/20'
                                                    : !tugas.is_read
                                                      ? 'border-l-4 border-l-blue-500 border-white/20 bg-white/60 dark:border-white/5 dark:bg-neutral-800/60'
                                                      : 'border-white/20 bg-white/60 hover:border-indigo-300 dark:border-white/5 dark:bg-neutral-800/60'
                                            } backdrop-blur-xl`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-black/25">
                                                            {tugas.jenis}
                                                        </span>
                                                        <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-lg ${priorityConfig.bg} ${priorityConfig.text}`}>
                                                            <PriorityIcon className="h-3 w-3" />
                                                            {priorityConfig.label}
                                                        </span>
                                                        {tugas.is_overdue && (
                                                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-red-500/25">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Terlewat
                                                            </span>
                                                        )}
                                                        {!tugas.is_read && (
                                                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/25">
                                                                <Sparkles className="h-3 w-3" />
                                                                Baru
                                                            </span>
                                                        )}
                                                    </div>

                                                    <h3 className="text-lg font-bold text-neutral-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                                        {tugas.judul}
                                                    </h3>
                                                    <p className="mt-2 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{tugas.deskripsi}</p>

                                                    <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                            <BookOpen className="h-4 w-4 text-blue-500" />
                                                            {tugas.course.nama}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                            <Calendar className="h-4 w-4 text-purple-500" />
                                                            {tugas.deadline_display}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                            <MessageSquare className="h-4 w-4 text-emerald-500" />
                                                            {tugas.diskusi_count} diskusi
                                                        </span>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-xl bg-blue-100 text-blue-600 transition-all hover:bg-blue-200 md:opacity-0 md:group-hover:opacity-100"
                                                >
                                                    <ArrowRight className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <motion.div variants={itemVariants} className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="rounded-xl bg-pink-500 p-2 text-white">
                                <Activity className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-white sm:text-xl">Timeline Tugas</h2>
                        </div>
                        <TimelineView tugasList={tugasList} />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className="rounded-xl bg-indigo-500 p-2 text-white">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-white sm:text-xl">Kalender Tugas</h2>
                        </div>
                        <CalendarView tugasList={tugasList} />
                    </motion.div>
                </div>
            </motion.div>
        </StudentLayout>
    );
}
