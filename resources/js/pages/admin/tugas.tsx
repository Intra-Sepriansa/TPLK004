import DraftTugasIcon from '@/assets/admin/informasi-tugas/draft.png';
import InformasiTugasIcon from '@/assets/admin/informasi-tugas/informasi-tugas.png';
import OverdueTugasIcon from '@/assets/admin/informasi-tugas/overdue.png';
import PublishedTugasIcon from '@/assets/admin/informasi-tugas/publised.png';
import TotalTugasIcon from '@/assets/admin/informasi-tugas/total-tugas.png';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion, Variants } from 'framer-motion';
import {
    AlertTriangle,
    BookOpen,
    Calendar,
    Eye,
    FileText,
    MessageSquare,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash2,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

declare const route: any;

type Course = { id: number; nama: string; dosen: string | null };
type Tugas = {
    id: number;
    judul: string;
    deskripsi: string;
    jenis: string;
    deadline: string;
    deadline_display: string;
    prioritas: string;
    status: string;
    course: { id: number; nama: string; dosen: string | null };
    created_by: string;
    created_by_type: string;
    is_overdue: boolean;
    days_until_deadline: number;
    diskusi_count: number;
    created_at: string;
};

// Animation variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
    hover: {
        scale: 1.04,
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 15 },
    },
};

type Props = {
    tugasList: Tugas[];
    courses: Course[];
    stats: { total: number; published: number; draft: number; overdue: number };
    filters: { search: string; course_id: string; status: string };
};

export default function AdminTugas({
    tugasList,
    courses,
    stats,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [courseId, setCourseId] = useState(filters.course_id);
    const [status, setStatus] = useState(filters.status);

    const [showEdit, setShowEdit] = useState(false);
    const [editTugas, setEditTugas] = useState<Tugas | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        id: number | null;
    }>({ open: false, id: null });
    const [form, setForm] = useState({
        course_id: '',
        judul: '',
        deskripsi: '',
        instruksi: '',
        jenis: 'tugas',
        deadline: '',
        prioritas: 'sedang',
        status: 'draft',
    });

    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const { errors } = usePage().props;

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleEdit = () => {
        if (!editTugas) return;
        router.patch(`/admin/tugas/${editTugas.id}`, form, {
            onSuccess: () => {
                setShowEdit(false);
                setEditTugas(null);
            },
        });
    };

    const openDeleteDialog = (id: number) =>
        setDeleteDialog({ open: true, id });

    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/admin/tugas/${deleteDialog.id}`);
            setDeleteDialog({ open: false, id: null });
        }
    };

    const openEdit = (tugas: Tugas) => {
        setEditTugas(tugas);
        setForm({
            course_id: String(tugas.course.id),
            judul: tugas.judul,
            deskripsi: tugas.deskripsi,
            instruksi: '',
            jenis: tugas.jenis,
            deadline: tugas.deadline.replace(' ', 'T'),
            prioritas: tugas.prioritas,
            status: tugas.status,
        });
        setShowEdit(true);
    };

    const getPriorityBadge = (prioritas: string) => {
        const styles: Record<string, string> = {
            tinggi: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25',
            sedang: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25',
            rendah: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25',
        };
        return (
            <Badge className={`${styles[prioritas]} animate-pulse`}>
                {prioritas}
            </Badge>
        );
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            published:
                'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
            draft: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
            closed: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
        };
        return <Badge className={styles[status]}>{status}</Badge>;
    };

    const getJenisBadge = (jenis: string) => {
        const styles: Record<string, string> = {
            tugas: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
            quiz: 'bg-gradient-to-r from-purple-500 to-violet-500 text-white',
            project: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
            presentasi: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
            lainnya: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white',
        };
        return <Badge className={styles[jenis]}>{jenis}</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Informasi Tugas" />
            <motion.div
                className="space-y-6 p-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* ═══════ HEADER — Matching Perangkat Style ═══════ */}
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
                            ease: 'linear',
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating Animations (Pulses) */}

                    <div className="relative">
                        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:w-auto sm:flex-row sm:gap-6 sm:text-left">
                                <motion.div
                                    className="relative flex h-16 w-16 shrink-0 items-center justify-center sm:h-20 sm:w-20"
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
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                >
                                    <img
                                        src={InformasiTugasIcon}
                                        alt="Informasi Tugas"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.35)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <p className="text-sm font-medium tracking-wide text-indigo-100">
                                        Manajemen
                                    </p>
                                    <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                                        Informasi Tugas
                                    </h1>
                                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
                                        Kelola tugas dan informasi untuk
                                        mahasiswa
                                    </p>
                                </div>
                            </div>

                            <div className="mt-2 flex w-full justify-center gap-3 sm:mt-0 sm:w-auto">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link href="/admin/tugas-kelompok">
                                        <Button className="border border-white/30 bg-white/20 text-white shadow-lg backdrop-blur hover:bg-white/30">
                                            <Users className="mr-2 h-4 w-4" />{' '}
                                            Tugas Kelompok
                                        </Button>
                                    </Link>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link href="/admin/tugas/create">
                                        <Button className="border border-white/30 bg-white/20 text-white shadow-lg backdrop-blur hover:bg-white/30">
                                            <Plus className="mr-2 h-4 w-4" />{' '}
                                            Tambah Tugas
                                        </Button>
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats with Animation */}
                <motion.div
                    className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
                    variants={containerVariants}
                >
                    {/* Total Tugas */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('total')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-indigo-500/10 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10" />
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'total' ? 1.5 : 1,
                                opacity: hoveredCard === 'total' ? 0.4 : 0.2,
                            }}
                            className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-indigo-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div
                                className="relative flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14"
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                            >
                                <img
                                    src={TotalTugasIcon}
                                    alt="Total Tugas"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]"
                                />
                            </motion.div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Total Tugas
                                </p>
                                <div className="mt-1">
                                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {stats.total}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Published */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('published')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-emerald-500/10 sm:rounded-3xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10" />
                        <motion.div
                            initial={false}
                            animate={{
                                scale: hoveredCard === 'published' ? 1.5 : 1,
                                opacity:
                                    hoveredCard === 'published' ? 0.4 : 0.2,
                            }}
                            className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-500 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-40"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div
                                className="relative flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14"
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                            >
                                <img
                                    src={PublishedTugasIcon}
                                    alt="Published"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]"
                                />
                            </motion.div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Published
                                </p>
                                <div className="mt-1">
                                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {stats.published}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Draft */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('draft')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-gray-500/10 sm:rounded-3xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-slate-500/5 dark:from-gray-500/10 dark:to-slate-500/10" />
                        <motion.div
                            initial={false}
                            animate={{
                                scale: hoveredCard === 'draft' ? 1.5 : 1,
                                opacity: hoveredCard === 'draft' ? 0.4 : 0.2,
                            }}
                            className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gray-500 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-40"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div
                                className="relative flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14"
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                            >
                                <img
                                    src={DraftTugasIcon}
                                    alt="Draft"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]"
                                />
                            </motion.div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Draft
                                </p>
                                <div className="mt-1">
                                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {stats.draft}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('overdue')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-rose-500/10 sm:rounded-3xl dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10" />
                        <motion.div
                            initial={false}
                            animate={{
                                scale: hoveredCard === 'overdue' ? 1.5 : 1,
                                opacity: hoveredCard === 'overdue' ? 0.4 : 0.2,
                            }}
                            className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-red-500 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-40"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div
                                className="relative flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14"
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                            >
                                <img
                                    src={OverdueTugasIcon}
                                    alt="Overdue"
                                    className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)]"
                                />
                            </motion.div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    Overdue
                                </p>
                                <div className="mt-1">
                                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {stats.overdue}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Filters */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/50 p-5 shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/50"
                >
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari tugas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' &&
                                    router.get(
                                        '/admin/tugas',
                                        { search, course_id: courseId, status },
                                        { preserveState: true },
                                    )
                                }
                                className="pl-10"
                            />
                        </div>
                        <Select
                            value={courseId}
                            onValueChange={(v) => {
                                setCourseId(v);
                                router.get(
                                    '/admin/tugas',
                                    { search, course_id: v, status },
                                    { preserveState: true },
                                );
                            }}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Semua Mata Kuliah" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Mata Kuliah
                                </SelectItem>
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
                                router.get(
                                    '/admin/tugas',
                                    { search, course_id: courseId, status: v },
                                    { preserveState: true },
                                );
                            }}
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Status
                                </SelectItem>
                                <SelectItem value="published">
                                    Published
                                </SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>

                {/* Tugas List with Animation */}
                <div className="space-y-4">
                    {tugasList.length === 0 ? (
                        <motion.div
                            variants={itemVariants}
                            className="rounded-3xl border border-dashed border-neutral-300 bg-neutral-50/50 p-16 text-center shadow-none dark:border-neutral-800 dark:bg-neutral-900/50"
                        >
                            <div className="relative mx-auto mb-6 h-24 w-24">
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-900 to-black opacity-20"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                    }}
                                />
                                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-r from-gray-900 to-black">
                                    <FileText className="h-12 w-12 text-white" />
                                </div>
                            </div>
                            <p className="text-xl font-semibold text-muted-foreground">
                                Belum ada tugas
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Klik tombol "Tambah Tugas" untuk membuat tugas
                                baru
                            </p>
                        </motion.div>
                    ) : (
                        tugasList.map((tugas) => (
                            <motion.div
                                key={tugas.id}
                                variants={cardVariants}
                                whileHover="hover"
                                className={`group cursor-pointer rounded-2xl border border-white/20 bg-white/40 p-5 shadow-sm backdrop-blur-xl transition-all hover:shadow-indigo-500/10 sm:rounded-3xl dark:border-white/5 dark:bg-neutral-900/40 ${tugas.is_overdue ? 'border-red-300 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/10' : ''}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div
                                        className="flex-1"
                                        onClick={() =>
                                            router.visit(
                                                `/admin/tugas/${tugas.id}`,
                                            )
                                        }
                                    >
                                        <div className="mb-3 flex flex-wrap items-center gap-2">
                                            {getJenisBadge(tugas.jenis)}
                                            {getPriorityBadge(tugas.prioritas)}
                                            {getStatusBadge(tugas.status)}
                                            {tugas.is_overdue && (
                                                <Badge className="animate-pulse bg-gradient-to-r from-red-600 to-rose-600 text-white">
                                                    <AlertTriangle className="mr-1 h-3 w-3" />{' '}
                                                    Overdue
                                                </Badge>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold transition-colors duration-200 group-hover:text-purple-600">
                                            {tugas.judul}
                                        </h3>
                                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                            {tugas.deskripsi}
                                        </p>
                                        <div className="mt-4 grid grid-cols-1 gap-2.5 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-3">
                                            <span className="flex min-w-0 items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-2">
                                                <BookOpen className="h-4 w-4 shrink-0 text-blue-500" />
                                                <span className="line-clamp-2 break-words sm:line-clamp-1">
                                                    {tugas.course.nama}
                                                </span>
                                            </span>
                                            <span className="flex min-w-0 items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-2">
                                                <Calendar className="h-4 w-4 shrink-0 text-purple-500" />
                                                <span className="line-clamp-2 break-words sm:line-clamp-1">
                                                    {tugas.deadline_display}
                                                </span>
                                            </span>
                                            <span className="flex min-w-0 items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-2">
                                                <MessageSquare className="h-4 w-4 shrink-0 text-emerald-500" />
                                                <span className="whitespace-nowrap">
                                                    {tugas.diskusi_count}{' '}
                                                    diskusi
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-48"
                                        >
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    router.visit(
                                                        `/admin/tugas/${tugas.id}`,
                                                    )
                                                }
                                                className="cursor-pointer"
                                            >
                                                <Eye className="mr-2 h-4 w-4 text-blue-500" />{' '}
                                                Lihat Detail
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => openEdit(tugas)}
                                                className="cursor-pointer"
                                            >
                                                <Pencil className="mr-2 h-4 w-4 text-amber-500" />{' '}
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    openDeleteDialog(tugas.id)
                                                }
                                                className="cursor-pointer text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />{' '}
                                                Hapus
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Edit Dialog */}
                <Dialog open={showEdit} onOpenChange={setShowEdit}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="bg-gradient-to-r from-gray-900 to-black bg-clip-text text-xl text-transparent">
                                Edit Tugas
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Judul</Label>
                                <Input
                                    value={form.judul}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            judul: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label>Deskripsi</Label>
                                <Textarea
                                    value={form.deskripsi}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            deskripsi: e.target.value,
                                        })
                                    }
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Jenis</Label>
                                    <Select
                                        value={form.jenis}
                                        onValueChange={(v) =>
                                            setForm({ ...form, jenis: v })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tugas">
                                                📝 Tugas
                                            </SelectItem>
                                            <SelectItem value="quiz">
                                                ❓ Quiz
                                            </SelectItem>
                                            <SelectItem value="project">
                                                🚀 Project
                                            </SelectItem>
                                            <SelectItem value="presentasi">
                                                🎤 Presentasi
                                            </SelectItem>
                                            <SelectItem value="lainnya">
                                                📌 Lainnya
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Prioritas</Label>
                                    <Select
                                        value={form.prioritas}
                                        onValueChange={(v) =>
                                            setForm({ ...form, prioritas: v })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rendah">
                                                🟢 Rendah
                                            </SelectItem>
                                            <SelectItem value="sedang">
                                                🟡 Sedang
                                            </SelectItem>
                                            <SelectItem value="tinggi">
                                                🔴 Tinggi
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Deadline</Label>
                                    <Input
                                        type="datetime-local"
                                        value={form.deadline}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                deadline: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <Select
                                        value={form.status}
                                        onValueChange={(v) =>
                                            setForm({ ...form, status: v })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">
                                                📋 Draft
                                            </SelectItem>
                                            <SelectItem value="published">
                                                ✅ Published
                                            </SelectItem>
                                            <SelectItem value="closed">
                                                🔒 Closed
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button
                                onClick={handleEdit}
                                className="w-full bg-gradient-to-r from-gray-900 to-black transition-all duration-300 hover:from-gray-800 hover:to-gray-900"
                            >
                                Simpan Perubahan
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) =>
                        setDeleteDialog({
                            open,
                            id: open ? deleteDialog.id : null,
                        })
                    }
                    onConfirm={handleDelete}
                    title="Hapus Tugas"
                    message="Yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan."
                    variant="danger"
                    confirmText="Ya, Hapus"
                    cancelText="Batal"
                />
            </motion.div>
        </AppLayout>
    );
}
