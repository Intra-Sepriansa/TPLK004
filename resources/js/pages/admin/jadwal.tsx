import JadwalIcon from '@/assets/admin/jadwal/jadwal.png';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import {
    Activity,
    BookOpen,
    Calendar,
    CalendarCheck,
    CalendarClock,
    CheckCircle2,
    Clock,
    Download,
    Edit,
    Filter,
    Hash,
    Pause,
    Play,
    Plus,
    RefreshCw,
    Timer,
    Trash2,
    Type,
    Users,
    X,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Course {
    id: number;
    nama: string;
    sks: number;
    dosen?: { nama: string };
}

interface Session {
    id: number;
    course_id: number;
    meeting_number: number;
    title?: string;
    start_at: string;
    end_at: string;
    is_active: boolean;
    course?: Course;
    logs_count?: number;
}

interface Stats {
    total: number;
    active: number;
    completed: number;
    scheduled: number;
    total_attendance: number;
    avg_per_session: number;
    unique_courses: number;
}

interface WeeklySchedule {
    day: string;
    sessions: {
        id: number;
        course: string;
        meeting: number;
        time: string;
        is_active: boolean;
    }[];
}

interface PageProps {
    sessions: {
        data: Session[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    courses: Course[];
    stats: Stats;
    weeklySchedule: WeeklySchedule[];
    courseDistribution: { name: string; count: number }[];
    upcomingSessions: Session[];
    recentSessions: Session[];
    filters: {
        course_id: string;
        status: string;
        date_from: string;
        date_to: string;
    };
    flash?: { success?: string; error?: string };
}

export default function AdminJadwal({
    sessions,
    courses,
    stats,
    weeklySchedule,
    courseDistribution,
    upcomingSessions,
    recentSessions,
    filters,
    flash,
}: PageProps) {
    const [courseId, setCourseId] = useState(filters.course_id);
    const [status, setStatus] = useState(filters.status);
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const addForm = useForm({
        course_id: '',
        meeting_number: 1,
        title: '',
        start_at: '',
        end_at: '',
    });

    const editForm = useForm({
        course_id: '',
        meeting_number: 1,
        title: '',
        start_at: '',
        end_at: '',
    });

    const handleFilter = () => {
        router.get(
            '/admin/jadwal',
            {
                course_id: courseId,
                status,
                date_from: dateFrom,
                date_to: dateTo,
            },
            { preserveState: true },
        );
    };

    const handleExportPdf = () => {
        window.open(
            `/admin/jadwal/pdf?date_from=${dateFrom}&date_to=${dateTo}`,
            '_blank',
        );
    };

    const submitAdd = (e: FormEvent) => {
        e.preventDefault();
        addForm.post('/admin/jadwal', {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset();
                setShowAddForm(false);
            },
        });
    };

    const startEdit = (s: Session) => {
        setEditingId(s.id);
        editForm.setData({
            course_id: String(s.course_id),
            meeting_number: s.meeting_number,
            title: s.title || '',
            start_at: s.start_at?.replace(' ', 'T').slice(0, 16) || '',
            end_at: s.end_at?.replace(' ', 'T').slice(0, 16) || '',
        });
        setShowEditForm(true);
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingId) return;
        editForm.patch(`/admin/jadwal/${editingId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
                setShowEditForm(false);
            },
        });
    };

    const formatLabel = (label: string) =>
        label
            .replace(/&laquo;/g, '«')
            .replace(/&raquo;/g, '»')
            .replace(/&amp;/g, '&')
            .replace(/<[^>]*>/g, '');

    // Animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04,
                delayChildren: 0.15,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 12,
            },
        },
    };

    const slideInLeft: Variants = {
        hidden: { opacity: 0, x: -30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 15,
            },
        },
    };

    const slideInRight: Variants = {
        hidden: { opacity: 0, x: 30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 15,
            },
        },
    };

    // Modal Stagger Animation
    const modalContainerVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 300,
                damping: 25,
                staggerChildren: 0.05,
                delayChildren: 0.2,
            },
        },
        exit: { opacity: 0, scale: 0.95, y: 20 },
    };

    const modalItemVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: 'spring', stiffness: 300, damping: 20 },
        },
    };

    return (
        <AppLayout>
            <Head title="Jadwal" />

            <motion.div
                className="space-y-6 p-6"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* ═══════ HEADER — Matching Mahasiswa Style ═══════ */}
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
                        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:gap-6">
                            <div className="flex w-full flex-col items-center gap-5 text-center sm:w-auto sm:flex-row sm:gap-6 sm:text-left">
                                <motion.div
                                    className="relative mx-auto flex h-20 w-20 shrink-0 items-center justify-center sm:mx-0 sm:h-24 sm:w-24"
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
                                        src={JadwalIcon}
                                        alt="Jadwal Icon"
                                        className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                                    />
                                </motion.div>
                                <div className="mt-1 flex-1 sm:mt-0">
                                    <p className="text-sm font-medium tracking-wide text-indigo-100">
                                        Analisis Sistem
                                    </p>
                                    <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                                        Jadwal Sesi Absen
                                    </h1>
                                    <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-indigo-100 sm:mx-0 sm:text-base">
                                        Kelola jadwal sesi absensi, aktifkan
                                        sesi, dan pantau kehadiran mahasiswa
                                        secara real-time.
                                    </p>
                                </div>
                            </div>
                            <div className="flex w-full justify-center sm:w-auto">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                        router.visit('/admin/jadwal/create')
                                    }
                                    className="group relative overflow-hidden rounded-xl bg-white px-6 py-3 text-indigo-600 shadow-xl transition-all hover:bg-indigo-50"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2 font-bold">
                                        <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                                        Tambah Jadwal
                                    </span>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Flash Messages */}
                <AnimatePresence>
                    {(flash?.success || flash?.error) && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`flex items-center gap-3 rounded-xl p-4 ${flash.success ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-red-200 bg-red-50 text-red-700'}`}
                        >
                            {flash.success ? (
                                <CheckCircle2 className="h-5 w-5" />
                            ) : (
                                <X className="h-5 w-5" />
                            )}
                            <p className="font-medium">
                                {flash.success || flash.error}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Cards */}
                {/* Stats Cards - Redesigned Compact Style */}
                {/* ══════ Consolidated Stats ══════ */}
                <motion.div
                    className="grid gap-6 md:grid-cols-3"
                    variants={containerVariants}
                >
                    {/* Card 1: Sesi Perkuliahan (Total + Status Breakdown) */}
                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90 p-6 shadow-xl"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Calendar className="h-24 w-24 text-indigo-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="rounded-xl bg-indigo-500/20 p-2 text-indigo-400">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white">
                                    Sesi Perkuliahan
                                </h3>
                            </div>

                            <div className="mb-6 flex items-end gap-2">
                                <span className="text-4xl font-bold text-white">
                                    {stats.total}
                                </span>
                                <span className="mb-1 text-sm text-slate-400">
                                    Total Sesi
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2">
                                    <div className="mb-1 flex items-center gap-1.5 text-emerald-400">
                                        <Play className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-bold uppercase">
                                            AKTIF
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-white">
                                        {stats.active}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-500/20 bg-slate-500/10 p-2">
                                    <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-bold uppercase">
                                            SELESAI
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-white">
                                        {stats.completed}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2">
                                    <div className="mb-1 flex items-center gap-1.5 text-amber-400">
                                        <CalendarClock className="h-3.5 w-3.5" />
                                        <span className="text-[10px] font-bold uppercase">
                                            JADWAL
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-white">
                                        {stats.scheduled}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Kehadiran Mahasiswa (Total + Rata-rata) */}
                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90 p-6 shadow-xl"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Users className="h-24 w-24 text-purple-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="rounded-xl bg-purple-500/20 p-2 text-purple-400">
                                    <Users className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white">
                                    Partisipasi
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="mb-1 flex items-center justify-between text-sm text-slate-400">
                                        <span>Total Kehadiran</span>
                                        <span className="rounded bg-purple-500/10 px-2 py-0.5 text-xs text-purple-400">
                                            Akumulasi
                                        </span>
                                    </div>
                                    <p className="text-3xl font-bold text-white">
                                        {stats.total_attendance}
                                    </p>
                                </div>
                                <div className="h-px bg-white/10" />
                                <div>
                                    <div className="mb-1 flex items-center justify-between text-sm text-slate-400">
                                        <span>Rata-rata per Sesi</span>
                                        <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-xs font-bold text-cyan-400">
                                            AVG
                                        </span>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <p className="text-3xl font-bold text-white">
                                            {stats.avg_per_session}
                                        </p>
                                        <span className="mb-1 text-sm text-slate-500">
                                            mahasiswa/sesi
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Akademik (Mata Kuliah) */}
                    <motion.div
                        variants={itemVariants}
                        className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90 p-6 shadow-xl"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <BookOpen className="h-24 w-24 text-pink-500" />
                        </div>
                        <div className="relative z-10 flex h-full flex-col justify-between">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="rounded-xl bg-pink-500/20 p-2 text-pink-400">
                                    <BookOpen className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-white">
                                    Akademik
                                </h3>
                            </div>

                            <div className="py-2 text-center">
                                <p className="bg-gradient-to-r from-pink-400 to-rose-600 bg-clip-text text-5xl font-extrabold text-transparent">
                                    {stats.unique_courses}
                                </p>
                                <p className="mt-2 text-sm font-medium text-slate-400">
                                    Mata Kuliah Terdaftar
                                </p>
                            </div>

                            <div className="mt-4 rounded-xl border border-white/5 bg-white/5 p-3 text-center">
                                <p className="text-xs text-slate-400">
                                    Memantau{' '}
                                    <span className="font-bold text-white">
                                        {stats.total}
                                    </span>{' '}
                                    sesi dari{' '}
                                    <span className="font-bold text-white">
                                        {stats.unique_courses}
                                    </span>{' '}
                                    mata kuliah aktif semester ini.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Filter & Actions */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                    whileHover={{ scale: 1.002 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <div className="mb-4 flex items-center gap-2">
                        <Filter className="h-5 w-5 text-indigo-600" />
                        <h2 className="font-semibold text-slate-900 dark:text-white">
                            Filter Data
                        </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-6">
                        <div>
                            <Label className="mb-2 block text-sm font-medium text-slate-600">
                                Dari Tanggal
                            </Label>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="mb-2 block text-sm font-medium text-slate-600">
                                Sampai Tanggal
                            </Label>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="mb-2 block text-sm font-medium text-slate-600">
                                Mata Kuliah
                            </Label>
                            <select
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-black"
                            >
                                <option value="all">Semua Mata Kuliah</option>
                                {courses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nama}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label className="mb-2 block text-sm font-medium text-slate-600">
                                Status
                            </Label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-black"
                            >
                                <option value="all">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="completed">Selesai</option>
                                <option value="scheduled">Terjadwal</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2 md:col-span-2">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex-1"
                            >
                                <Button
                                    onClick={handleFilter}
                                    className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Filter
                                </Button>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex-1"
                            >
                                <Button
                                    onClick={handleExportPdf}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    PDF
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Advanced Add Form Modal */}
                <AnimatePresence>
                    {showAddForm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                onClick={() => setShowAddForm(false)}
                            />
                            <motion.div
                                variants={modalContainerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/95"
                            >
                                {/* Modal Header with Gradient */}
                                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 text-white">
                                    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
                                    <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />

                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20 shadow-inner backdrop-blur-md">
                                                <Calendar className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold tracking-tight">
                                                    Jadwal Baru
                                                </h2>
                                                <p className="text-sm font-medium text-indigo-100/90">
                                                    Buat sesi perkuliahan baru
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
                                                setShowAddForm(false)
                                            }
                                            className="rounded-full bg-white/10 p-2 backdrop-blur transition-colors hover:bg-white/20"
                                        >
                                            <X className="h-5 w-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="p-8">
                                    <form
                                        onSubmit={submitAdd}
                                        className="space-y-6"
                                    >
                                        <motion.div
                                            variants={modalItemVariants}
                                        >
                                            <Label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Mata Kuliah
                                            </Label>
                                            <div className="group relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors group-focus-within:text-indigo-500">
                                                    <BookOpen className="h-5 w-5" />
                                                </div>
                                                <select
                                                    value={
                                                        addForm.data.course_id
                                                    }
                                                    onChange={(e) =>
                                                        addForm.setData(
                                                            'course_id',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-10 text-sm font-medium transition-all hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-black/50 dark:focus:bg-black"
                                                >
                                                    <option value="">
                                                        Pilih Mata Kuliah...
                                                    </option>
                                                    {courses.map((c) => (
                                                        <option
                                                            key={c.id}
                                                            value={c.id}
                                                        >
                                                            {c.nama} (SKS{' '}
                                                            {c.sks})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <InputError
                                                message={
                                                    addForm.errors.course_id
                                                }
                                            />
                                        </motion.div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <motion.div
                                                variants={modalItemVariants}
                                            >
                                                <Label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Pertemuan Ke
                                                </Label>
                                                <div className="group relative">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors group-focus-within:text-indigo-500">
                                                        <Hash className="h-4 w-4" />
                                                    </div>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        max={21}
                                                        value={
                                                            addForm.data
                                                                .meeting_number
                                                        }
                                                        onChange={(e) =>
                                                            addForm.setData(
                                                                'meeting_number',
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 transition-all hover:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-black/50"
                                                    />
                                                </div>
                                                <InputError
                                                    message={
                                                        addForm.errors
                                                            .meeting_number
                                                    }
                                                />
                                            </motion.div>

                                            <motion.div
                                                variants={modalItemVariants}
                                            >
                                                <Label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Judul (Opsional)
                                                </Label>
                                                <div className="group relative">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors group-focus-within:text-indigo-500">
                                                        <Type className="h-4 w-4" />
                                                    </div>
                                                    <Input
                                                        value={
                                                            addForm.data.title
                                                        }
                                                        onChange={(e) =>
                                                            addForm.setData(
                                                                'title',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Topik materi..."
                                                        className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 transition-all hover:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-black/50"
                                                    />
                                                </div>
                                            </motion.div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <motion.div
                                                variants={modalItemVariants}
                                            >
                                                <Label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Waktu Mulai
                                                </Label>
                                                <div className="group relative">
                                                    <Input
                                                        type="datetime-local"
                                                        value={
                                                            addForm.data
                                                                .start_at
                                                        }
                                                        onChange={(e) =>
                                                            addForm.setData(
                                                                'start_at',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-11 rounded-xl border-slate-200 bg-slate-50 transition-all hover:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-black/50"
                                                    />
                                                </div>
                                                <InputError
                                                    message={
                                                        addForm.errors.start_at
                                                    }
                                                />
                                            </motion.div>

                                            <motion.div
                                                variants={modalItemVariants}
                                            >
                                                <Label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    Waktu Selesai
                                                </Label>
                                                <div className="group relative">
                                                    <Input
                                                        type="datetime-local"
                                                        value={
                                                            addForm.data.end_at
                                                        }
                                                        onChange={(e) =>
                                                            addForm.setData(
                                                                'end_at',
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="h-11 rounded-xl border-slate-200 bg-slate-50 transition-all hover:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-black/50"
                                                    />
                                                </div>
                                                <InputError
                                                    message={
                                                        addForm.errors.end_at
                                                    }
                                                />
                                            </motion.div>
                                        </div>

                                        <motion.div
                                            variants={modalItemVariants}
                                            className="flex gap-4 pt-4"
                                        >
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    setShowAddForm(false)
                                                }
                                                className="h-12 flex-1 rounded-xl border-slate-200 font-medium hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                Batal
                                            </Button>
                                            <motion.div
                                                className="flex-1"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        addForm.processing
                                                    }
                                                    className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold tracking-wide text-white shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-purple-700"
                                                >
                                                    {addForm.processing ? (
                                                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                                    ) : (
                                                        <Plus className="mr-2 h-5 w-5" />
                                                    )}
                                                    Simpan Jadwal
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Advanced Edit Form Modal */}
                <AnimatePresence>
                    {showEditForm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                onClick={() => setShowEditForm(false)}
                            />
                            <motion.div
                                variants={modalContainerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/95"
                            >
                                {/* Modal Header with Gradient */}
                                <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-8 text-white">
                                    <motion.div
                                        className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-2xl"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.3, 0.5, 0.3],
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                        }}
                                    />
                                    <motion.div
                                        className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/20 blur-2xl"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            opacity: [0.3, 0.5, 0.3],
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            delay: 2,
                                        }}
                                    />

                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <motion.div
                                                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/20 shadow-inner backdrop-blur-md"
                                                whileHover={{
                                                    scale: 1.1,
                                                    rotate: 5,
                                                }}
                                            >
                                                <Edit className="h-6 w-6 text-white" />
                                            </motion.div>
                                            <div>
                                                <h2 className="text-2xl font-bold tracking-tight">
                                                    Edit Jadwal
                                                </h2>
                                                <p className="text-sm font-medium text-amber-100/90">
                                                    Perbarui sesi perkuliahan
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
                                                setShowEditForm(false)
                                            }
                                            className="rounded-full border border-white/10 bg-white/10 p-2 backdrop-blur transition-colors hover:bg-white/20"
                                        >
                                            <X className="h-5 w-5 text-white" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Modal Body */}
                                <div className="p-8">
                                    <form
                                        onSubmit={submitEdit}
                                        className="space-y-6"
                                    >
                                        <motion.div
                                            variants={modalItemVariants}
                                        >
                                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                <BookOpen className="h-3.5 w-3.5" />
                                                Mata Kuliah
                                            </label>
                                            <select
                                                value={editForm.data.course_id}
                                                onChange={(e) =>
                                                    editForm.setData(
                                                        'course_id',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 placeholder-neutral-400 transition-all focus:border-amber-500/50 focus:bg-white focus:ring-2 focus:ring-amber-500/50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white dark:focus:bg-neutral-800"
                                            >
                                                <option value="">
                                                    Pilih Mata Kuliah...
                                                </option>
                                                {courses.map((c) => (
                                                    <option
                                                        key={c.id}
                                                        value={c.id}
                                                    >
                                                        {c.nama} (SKS {c.sks})
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={
                                                    editForm.errors.course_id
                                                }
                                            />
                                        </motion.div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <motion.div
                                                variants={modalItemVariants}
                                            >
                                                <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                    <Hash className="h-3.5 w-3.5" />
                                                    Pertemuan Ke
                                                </label>
                                                <div className="relative">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
                                                        <span className="text-sm font-bold">
                                                            #
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={21}
                                                        value={
                                                            editForm.data
                                                                .meeting_number
                                                        }
                                                        onChange={(e) =>
                                                            editForm.setData(
                                                                'meeting_number',
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pr-4 pl-10 text-neutral-900 placeholder-neutral-400 transition-all focus:border-amber-500/50 focus:bg-white focus:ring-2 focus:ring-amber-500/50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white dark:focus:bg-neutral-800"
                                                    />
                                                </div>
                                                <InputError
                                                    message={
                                                        editForm.errors
                                                            .meeting_number
                                                    }
                                                />
                                            </motion.div>

                                            <motion.div
                                                variants={modalItemVariants}
                                            >
                                                <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                    <Type className="h-3.5 w-3.5" />
                                                    Judul (Opsional)
                                                </label>
                                                <input
                                                    value={editForm.data.title}
                                                    onChange={(e) =>
                                                        editForm.setData(
                                                            'title',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Topik materi..."
                                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 placeholder-neutral-400 transition-all focus:border-amber-500/50 focus:bg-white focus:ring-2 focus:ring-amber-500/50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white dark:focus:bg-neutral-800"
                                                />
                                            </motion.div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <motion.div
                                                variants={modalItemVariants}
                                            >
                                                <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Waktu Mulai
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={
                                                        editForm.data.start_at
                                                    }
                                                    onChange={(e) =>
                                                        editForm.setData(
                                                            'start_at',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 placeholder-neutral-400 transition-all focus:border-amber-500/50 focus:bg-white focus:ring-2 focus:ring-amber-500/50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white dark:focus:bg-neutral-800"
                                                />
                                                <InputError
                                                    message={
                                                        editForm.errors.start_at
                                                    }
                                                />
                                            </motion.div>

                                            <motion.div
                                                variants={modalItemVariants}
                                            >
                                                <label className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Waktu Selesai
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    value={editForm.data.end_at}
                                                    onChange={(e) =>
                                                        editForm.setData(
                                                            'end_at',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 placeholder-neutral-400 transition-all focus:border-amber-500/50 focus:bg-white focus:ring-2 focus:ring-amber-500/50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-white dark:focus:bg-neutral-800"
                                                />
                                                <InputError
                                                    message={
                                                        editForm.errors.end_at
                                                    }
                                                />
                                            </motion.div>
                                        </div>

                                        <motion.div
                                            variants={modalItemVariants}
                                            className="flex gap-4 pt-4"
                                        >
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    setShowEditForm(false)
                                                }
                                                className="h-12 flex-1 rounded-xl border-slate-200 font-medium hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                Batal
                                            </Button>
                                            <motion.div
                                                className="flex-1"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        editForm.processing
                                                    }
                                                    className="h-12 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-bold tracking-wide text-white shadow-lg shadow-amber-200 hover:from-amber-600 hover:to-orange-700"
                                                >
                                                    {editForm.processing ? (
                                                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="mr-2 h-5 w-5" />
                                                    )}
                                                    Simpan Perubahan
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Main Content Grid */}
                <motion.div
                    className="grid gap-6 lg:grid-cols-3"
                    variants={containerVariants}
                >
                    {/* Sessions Table */}
                    <motion.div
                        variants={slideInLeft}
                        className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-sm backdrop-blur-xl lg:col-span-2 dark:border-white/5 dark:bg-neutral-900/40"
                    >
                        <div className="border-b border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-black/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-indigo-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Daftar Jadwal
                                    </h2>
                                </div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                    Total {sessions.total}
                                </span>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {sessions.data.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Calendar className="mx-auto mb-4 h-16 w-16 text-slate-200" />
                                    <h3 className="text-lg font-medium text-slate-900">
                                        Belum ada jadwal
                                    </h3>
                                    <p className="text-slate-500">
                                        Tambahkan jadwal baru untuk memulai
                                        absensi.
                                    </p>
                                </div>
                            ) : (
                                sessions.data.map((s, index) => (
                                    <motion.div
                                        key={s.id}
                                        className="group p-4 transition-colors hover:bg-slate-50 dark:hover:bg-black/30"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <h3 className="truncate font-bold text-slate-900 dark:text-white">
                                                        {s.course?.nama ||
                                                            'Mata Kuliah'}
                                                    </h3>
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                                                            s.is_active
                                                                ? 'border border-emerald-200 bg-emerald-100 text-emerald-700'
                                                                : 'border border-amber-200 bg-amber-100 text-amber-700'
                                                        }`}
                                                    >
                                                        {s.is_active
                                                            ? 'Aktif'
                                                            : 'Terjadwal'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Activity className="h-3 w-3" />
                                                        Pertemuan{' '}
                                                        {s.meeting_number}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-slate-400">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(
                                                            s.start_at,
                                                        ).toLocaleDateString(
                                                            'id-ID',
                                                            {
                                                                weekday: 'long',
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            },
                                                        )}{' '}
                                                        •{' '}
                                                        {new Date(
                                                            s.start_at,
                                                        ).toLocaleTimeString(
                                                            'id-ID',
                                                            {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: false,
                                                            },
                                                        )}{' '}
                                                        -{' '}
                                                        {new Date(
                                                            s.end_at,
                                                        ).toLocaleTimeString(
                                                            'id-ID',
                                                            {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: false,
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 opacity-100 transition-opacity group-hover:opacity-100 sm:opacity-0">
                                                {s.is_active ? (
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8 border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
                                                        title="Nonaktifkan Sesi"
                                                        onClick={() =>
                                                            router.patch(
                                                                `/admin/jadwal/${s.id}/deactivate`,
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <Pause className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8 border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                                        title="Aktifkan Sesi"
                                                        onClick={() =>
                                                            router.patch(
                                                                `/admin/jadwal/${s.id}/activate`,
                                                                {},
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        <Play className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-slate-400 hover:text-blue-600"
                                                    onClick={() =>
                                                        router.visit(
                                                            `/admin/jadwal/${s.id}/edit`,
                                                        )
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-slate-400 hover:text-red-600"
                                                    onClick={() =>
                                                        router.delete(
                                                            `/admin/jadwal/${s.id}`,
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                        {sessions.last_page > 1 && (
                            <div className="flex justify-center gap-2 border-t border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800">
                                {sessions.links.map((link, i) => (
                                    <button
                                        key={i}
                                        onClick={() =>
                                            link.url &&
                                            router.get(
                                                link.url,
                                                {},
                                                { preserveState: true },
                                            )
                                        }
                                        disabled={!link.url}
                                        className={`rounded-lg px-3 py-1 text-sm font-medium transition-all ${link.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : link.url ? 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50' : 'cursor-not-allowed bg-slate-50 text-slate-400'}`}
                                        dangerouslySetInnerHTML={{
                                            __html: formatLabel(link.label),
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div variants={slideInRight} className="space-y-6">
                        {/* Weekly Schedule */}
                        <motion.div
                            className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                            whileHover={{ scale: 1.01, y: -2 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className="border-b border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <CalendarCheck className="h-5 w-5 text-indigo-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Jadwal Minggu Ini
                                    </h2>
                                </div>
                            </div>
                            <div className="max-h-80 divide-y divide-slate-200 overflow-y-auto dark:divide-slate-800">
                                {weeklySchedule.map((day, dayIndex) => (
                                    <motion.div
                                        key={day.day}
                                        className="p-3 transition-colors hover:bg-slate-50"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: dayIndex * 0.05 }}
                                    >
                                        <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                            {day.day}
                                        </p>
                                        {day.sessions.length === 0 ? (
                                            <p className="border-l-2 border-slate-100 pl-2 text-xs text-slate-400 italic">
                                                Tidak ada jadwal
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {day.sessions.map((s) => (
                                                    <div
                                                        key={s.id}
                                                        className="flex items-center justify-between border-l-2 border-indigo-100 pl-2 text-sm transition-colors hover:border-indigo-500"
                                                    >
                                                        <span
                                                            className="w-32 truncate font-medium text-slate-700 dark:text-slate-300"
                                                            title={s.course}
                                                        >
                                                            {s.course}
                                                        </span>
                                                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-nowrap text-slate-500">
                                                            {s.time}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Course Distribution */}
                        {courseDistribution.length > 0 && (
                            <motion.div
                                className="rounded-3xl border border-white/20 bg-white/40 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                                whileHover={{ scale: 1.01, y: -2 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <div className="mb-4 flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-indigo-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Distribusi Matkul
                                    </h2>
                                </div>
                                <div className="h-48">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={courseDistribution}
                                            layout="vertical"
                                            margin={{ left: 20 }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                horizontal={false}
                                                stroke="#f1f5f9"
                                            />
                                            <XAxis
                                                type="number"
                                                tick={{ fontSize: 10 }}
                                                stroke="#94a3b8"
                                                hide
                                            />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                tick={{
                                                    fontSize: 10,
                                                    fill: '#64748b',
                                                }}
                                                stroke="#94a3b8"
                                                width={90}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    boxShadow:
                                                        '0 4px 12px rgba(0,0,0,0.1)',
                                                }}
                                                cursor={{ fill: 'transparent' }}
                                            />
                                            <Bar
                                                dataKey="count"
                                                fill="#818cf8"
                                                radius={[0, 4, 4, 0]}
                                                barSize={20}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        )}

                        {/* Upcoming Sessions */}
                        <motion.div
                            className="overflow-hidden rounded-3xl border border-white/20 bg-white/40 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40"
                            whileHover={{ scale: 1.01, y: -2 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className="border-b border-slate-200 bg-amber-50/50 p-4 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Timer className="h-5 w-5 text-amber-600" />
                                    <h2 className="font-semibold text-slate-900 dark:text-white">
                                        Akan Datang
                                    </h2>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {upcomingSessions.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500">
                                        Tidak ada jadwal dalam waktu dekat
                                    </div>
                                ) : (
                                    upcomingSessions.map((s, index) => (
                                        <motion.div
                                            key={s.id}
                                            className="p-3 transition-colors hover:bg-slate-50"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-amber-400"></div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                                                        {s.course?.nama}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        Pertemuan{' '}
                                                        {s.meeting_number}
                                                    </p>
                                                    <p className="mt-1 inline-block rounded bg-slate-100 px-1 font-mono text-xs text-slate-400">
                                                        {s.start_at}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}
