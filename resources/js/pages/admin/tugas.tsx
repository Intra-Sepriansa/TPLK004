import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertTriangle,
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    Eye,
    FileText,
    MessageSquare,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash2,
    Sparkles,
    TrendingUp,
    Zap,
    ArrowUp,
    ArrowDown,
    Minus,
    HelpCircle,
    Rocket,
    Mic,
    Pin,
    Lock,
} from 'lucide-react';

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
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 },
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
        scale: 1.03,
        y: -5,
        transition: { type: 'spring', stiffness: 400, damping: 10 },
    },
};

type Props = {
    tugasList: Tugas[];
    courses: Course[];
    stats: { total: number; published: number; draft: number; overdue: number };
    filters: { search: string; course_id: string; status: string };
};

export default function AdminTugas({ tugasList, courses, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [courseId, setCourseId] = useState(filters.course_id);
    const [status, setStatus] = useState(filters.status);
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editTugas, setEditTugas] = useState<Tugas | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
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

    const handleCreate = () => {
        router.post('/admin/tugas', form, {
            onSuccess: () => {
                setShowCreate(false);
                setForm({ course_id: '', judul: '', deskripsi: '', instruksi: '', jenis: 'tugas', deadline: '', prioritas: 'sedang', status: 'draft' });
            },
        });
    };

    const handleEdit = () => {
        if (!editTugas) return;
        router.patch(`/admin/tugas/${editTugas.id}`, form, {
            onSuccess: () => { setShowEdit(false); setEditTugas(null); },
        });
    };

    const openDeleteDialog = (id: number) => setDeleteDialog({ open: true, id });

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
        return <Badge className={`${styles[prioritas]} animate-pulse`}>{prioritas}</Badge>;
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            published: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
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

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 100,
                damping: 12
            }
        }
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
                            ease: "linear"
                        }}
                        style={{
                            backgroundSize: '200% 200%',
                        }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    {/* Floating Animations (Pulses) */}
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
                    />
                    <motion.div
                        className="absolute right-16 top-1/2 -translate-y-1/2 h-32 w-32 rounded-full border-2 border-white/10"
                        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 2 }}
                    />

                    <div className="relative">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <motion.div
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <FileText className="h-8 w-8 text-white" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-indigo-100 font-medium tracking-wide">Manajemen</p>
                                    <h1 className="text-3xl font-bold text-white">Informasi Tugas</h1>
                                    <p className="mt-1 text-indigo-100 max-w-lg">
                                        Kelola tugas dan informasi untuk mahasiswa
                                    </p>
                                </div>
                            </div>

                            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                                <DialogTrigger asChild>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button className="bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 text-white shadow-lg">
                                            <Plus className="mr-2 h-4 w-4" /> Tambah Tugas
                                        </Button>
                                    </motion.div>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-0 shadow-2xl sm:rounded-3xl overflow-hidden">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                        className="flex flex-col h-full"
                                    >
                                        {/* Header */}
                                        {/* Header */}
                                        <div className="relative p-6 px-8 border-b border-white/10 bg-gradient-to-r from-indigo-600 to-purple-600 text-white overflow-hidden">
                                            {/* Decorative Elements */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />

                                            <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-start z-10">
                                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white shadow-inner ring-1 ring-white/20 backdrop-blur-sm">
                                                    <Sparkles className="h-7 w-7" />
                                                </div>
                                                <div className="text-center sm:text-left">
                                                    <DialogTitle className="text-xl font-bold text-white">
                                                        Buat Tugas Baru
                                                    </DialogTitle>
                                                    <p className="mt-1 text-sm text-indigo-100">
                                                        Isi form dibawah untuk membuat tugas baru.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 px-8 bg-neutral-50 dark:bg-neutral-950/50 max-h-[75vh] overflow-y-auto custom-scrollbar space-y-5">

                                            {/* Mata Kuliah & Judul */}
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 ml-1">Mata Kuliah</Label>
                                                    <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
                                                        <SelectTrigger className="h-11 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20">
                                                            <div className="flex items-center gap-2">
                                                                <BookOpen className="h-4 w-4 text-neutral-400" />
                                                                <SelectValue placeholder="Pilih Mata Kuliah" />
                                                            </div>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {courses.map((c) => (
                                                                <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.course_id && <p className="text-xs text-red-500 mt-1 ml-1">{errors.course_id}</p>}
                                                </div>

                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 ml-1">Judul Tugas</Label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                            <Pencil className="h-4 w-4 text-neutral-400" />
                                                        </div>
                                                        <Input
                                                            value={form.judul}
                                                            onChange={(e) => setForm({ ...form, judul: e.target.value })}
                                                            className="pl-10 h-11 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                                                            placeholder="Contoh: Tugas Pertemuan 3..."
                                                        />
                                                    </div>
                                                    {errors.judul && <p className="text-xs text-red-500 mt-1 ml-1">{errors.judul}</p>}
                                                </div>
                                            </div>

                                            {/* Kategori & Prioritas */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 ml-1">Kategori</Label>
                                                    <Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v })}>
                                                        <SelectTrigger className="h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-lg">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="tugas"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" /> <span>Tugas</span></div></SelectItem>
                                                            <SelectItem value="quiz"><div className="flex items-center gap-2"><HelpCircle className="h-4 w-4 text-purple-500" /> <span>Quiz</span></div></SelectItem>
                                                            <SelectItem value="project"><div className="flex items-center gap-2"><Rocket className="h-4 w-4 text-amber-500" /> <span>Project</span></div></SelectItem>
                                                            <SelectItem value="presentasi"><div className="flex items-center gap-2"><Mic className="h-4 w-4 text-pink-500" /> <span>Presentasi</span></div></SelectItem>
                                                            <SelectItem value="lainnya"><div className="flex items-center gap-2"><Pin className="h-4 w-4 text-gray-500" /> <span>Lainnya</span></div></SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.jenis && <p className="text-xs text-red-500 mt-1 ml-1">{errors.jenis}</p>}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 ml-1">Prioritas</Label>
                                                    <Select value={form.prioritas} onValueChange={(v) => setForm({ ...form, prioritas: v })}>
                                                        <SelectTrigger className="h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-lg">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="rendah"><div className="flex items-center gap-2"><ArrowDown className="h-4 w-4 text-emerald-500" /> <span>Rendah</span></div></SelectItem>
                                                            <SelectItem value="sedang"><div className="flex items-center gap-2"><Minus className="h-4 w-4 text-amber-500" /> <span>Sedang</span></div></SelectItem>
                                                            <SelectItem value="tinggi"><div className="flex items-center gap-2"><ArrowUp className="h-4 w-4 text-red-500" /> <span>Tinggi</span></div></SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.prioritas && <p className="text-xs text-red-500 mt-1 ml-1">{errors.prioritas}</p>}
                                                </div>
                                            </div>

                                            {/* Deskripsi & Instruksi */}
                                            <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold text-neutral-500 ml-1">Deskripsi Singkat</Label>
                                                    <Textarea
                                                        value={form.deskripsi}
                                                        onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                                                        rows={2}
                                                        className="bg-neutral-50 dark:bg-neutral-800 border-transparent focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-500/20 rounded-lg resize-none"
                                                        placeholder="Deskripsi tugas..."
                                                    />
                                                    {errors.deskripsi && <p className="text-xs text-red-500 mt-1 ml-1">{errors.deskripsi}</p>}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold text-neutral-500 ml-1">Instruksi Detail</Label>
                                                    <Textarea
                                                        value={form.instruksi}
                                                        onChange={(e) => setForm({ ...form, instruksi: e.target.value })}
                                                        rows={4}
                                                        className="bg-neutral-50 dark:bg-neutral-800 border-transparent focus:bg-white dark:focus:bg-neutral-900 focus:border-indigo-500/20 rounded-lg"
                                                        placeholder="Instruksi lengkap..."
                                                    />
                                                </div>
                                            </div>

                                            {/* Deadline & Status */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 ml-1">Deadline</Label>
                                                    <div className="relative">
                                                        <Input
                                                            type="datetime-local"
                                                            value={form.deadline}
                                                            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                                            className="h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-lg text-sm"
                                                        />
                                                    </div>
                                                    {errors.deadline && <p className="text-xs text-red-500 mt-1 ml-1">{errors.deadline}</p>}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 ml-1">Status</Label>
                                                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                                                        <SelectTrigger className="h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-lg">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="draft"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-neutral-400" /> <span>Draft</span></div></SelectItem>
                                                            <SelectItem value="published"><div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> <span>Published</span></div></SelectItem>
                                                            <SelectItem value="closed"><div className="flex items-center gap-2"><Lock className="h-4 w-4 text-red-500" /> <span>Closed</span></div></SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.status && <p className="text-xs text-red-500 mt-1 ml-1">{errors.status}</p>}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="pt-2">
                                                <Button
                                                    onClick={handleCreate}
                                                    className="w-full h-12 text-base bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                                                >
                                                    Buat Tugas Baru
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </motion.div>

                {/* Stats with Animation */}
                <motion.div
                    className="grid gap-6 md:grid-cols-4"
                    variants={containerVariants}
                >
                    {/* Total Tugas */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('total')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-indigo-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 dark:from-indigo-500/10 dark:to-blue-500/10" />
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'total' ? 1.5 : 1,
                                opacity: hoveredCard === 'total' ? 0.4 : 0.2,
                            }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-600 text-white shadow-lg shadow-indigo-500/30"
                            >
                                <FileText className="h-7 w-7" />
                            </motion.div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Tugas</p>
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
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-emerald-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10" />
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'published' ? 1.5 : 1,
                                opacity: hoveredCard === 'published' ? 0.4 : 0.2,
                            }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                            >
                                <CheckCircle className="h-7 w-7" />
                            </motion.div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Published</p>
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
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-gray-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-slate-500/5 dark:from-gray-500/10 dark:to-slate-500/10" />
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'draft' ? 1.5 : 1,
                                opacity: hoveredCard === 'draft' ? 0.4 : 0.2,
                            }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gray-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-400 to-slate-600 text-white shadow-lg shadow-gray-500/30"
                            >
                                <Clock className="h-7 w-7" />
                            </motion.div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Draft</p>
                                <div className="mt-1">
                                    <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {stats.draft}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Overdue */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        onHoverStart={() => setHoveredCard('overdue')}
                        onHoverEnd={() => setHoveredCard(null)}
                        className="group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-6 shadow-xl backdrop-blur-xl transition-all hover:shadow-rose-500/10 dark:border-white/5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10" />
                        <motion.div
                            animate={{
                                scale: hoveredCard === 'overdue' ? 1.5 : 1,
                                opacity: hoveredCard === 'overdue' ? 0.4 : 0.2,
                            }}
                            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500 blur-3xl transition-all duration-500"
                        />
                        <div className="relative flex items-center gap-4">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-400 to-rose-600 text-white shadow-lg shadow-red-500/30"
                            >
                                <AlertTriangle className="h-7 w-7" />
                            </motion.div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Overdue</p>
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
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari tugas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && router.get('/admin/tugas', { search, course_id: courseId, status }, { preserveState: true })}
                                className="pl-10"
                            />
                        </div>
                        <Select value={courseId} onValueChange={(v) => { setCourseId(v); router.get('/admin/tugas', { search, course_id: v, status }, { preserveState: true }); }}>
                            <SelectTrigger className="w-48"><SelectValue placeholder="Semua Mata Kuliah" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                                {courses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={status} onValueChange={(v) => { setStatus(v); router.get('/admin/tugas', { search, course_id: courseId, status: v }, { preserveState: true }); }}>
                            <SelectTrigger className="w-40"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
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
                            <div className="relative mx-auto w-24 h-24 mb-6">
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black rounded-full opacity-20"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-gray-900 to-black rounded-full">
                                    <FileText className="h-12 w-12 text-white" />
                                </div>
                            </div>
                            <p className="text-xl font-semibold text-muted-foreground">Belum ada tugas</p>
                            <p className="text-sm text-muted-foreground mt-2">Klik tombol "Tambah Tugas" untuk membuat tugas baru</p>
                        </motion.div>
                    ) : (
                        tugasList.map((tugas, index) => (
                            <motion.div
                                key={tugas.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ x: 4 }}
                                className={`rounded-3xl border border-white/20 bg-white/40 p-5 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/40 cursor-pointer group hover:shadow-indigo-500/10 transition-all ${tugas.is_overdue ? 'border-red-300 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10' : ''}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1" onClick={() => router.visit(`/admin/tugas/${tugas.id}`)}>
                                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                                            {getJenisBadge(tugas.jenis)}
                                            {getPriorityBadge(tugas.prioritas)}
                                            {getStatusBadge(tugas.status)}
                                            {tugas.is_overdue && (
                                                <Badge className="bg-gradient-to-r from-red-600 to-rose-600 text-white animate-pulse">
                                                    <AlertTriangle className="h-3 w-3 mr-1" /> Overdue
                                                </Badge>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-lg group-hover:text-purple-600 transition-colors duration-200">{tugas.judul}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{tugas.deskripsi}</p>
                                        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg">
                                                <BookOpen className="h-4 w-4 text-blue-500" /> {tugas.course.nama}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg">
                                                <Calendar className="h-4 w-4 text-purple-500" /> {tugas.deadline_display}
                                            </span>
                                            <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg">
                                                <MessageSquare className="h-4 w-4 text-emerald-500" /> {tugas.diskusi_count} diskusi
                                            </span>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => router.visit(`/admin/tugas/${tugas.id}`)} className="cursor-pointer">
                                                <Eye className="mr-2 h-4 w-4 text-blue-500" /> Lihat Detail
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openEdit(tugas)} className="cursor-pointer">
                                                <Pencil className="mr-2 h-4 w-4 text-amber-500" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openDeleteDialog(tugas.id)} className="cursor-pointer text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
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
                            <DialogTitle className="text-xl bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent">Edit Tugas</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Judul</Label>
                                <Input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
                            </div>
                            <div>
                                <Label>Deskripsi</Label>
                                <Textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Jenis</Label>
                                    <Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tugas">📝 Tugas</SelectItem>
                                            <SelectItem value="quiz">❓ Quiz</SelectItem>
                                            <SelectItem value="project">🚀 Project</SelectItem>
                                            <SelectItem value="presentasi">🎤 Presentasi</SelectItem>
                                            <SelectItem value="lainnya">📌 Lainnya</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Prioritas</Label>
                                    <Select value={form.prioritas} onValueChange={(v) => setForm({ ...form, prioritas: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rendah">🟢 Rendah</SelectItem>
                                            <SelectItem value="sedang">🟡 Sedang</SelectItem>
                                            <SelectItem value="tinggi">🔴 Tinggi</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Deadline</Label>
                                    <Input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">📋 Draft</SelectItem>
                                            <SelectItem value="published">✅ Published</SelectItem>
                                            <SelectItem value="closed">🔒 Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button onClick={handleEdit} className="w-full bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 transition-all duration-300">
                                Simpan Perubahan
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <ConfirmDialog
                    open={deleteDialog.open}
                    onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })}
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
