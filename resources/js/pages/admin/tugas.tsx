import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { motion, AnimatePresence } from 'framer-motion';
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
                                <DialogContent className="max-w-2xl bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 text-white p-0 shadow-2xl sm:rounded-3xl">
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        className="flex flex-col h-full sm:rounded-3xl"
                                        variants={{
                                            hidden: { opacity: 0 },
                                            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                                        }}
                                    >
                                        <DialogHeader className="p-8 pb-6 border-b border-white/5 bg-gradient-to-r from-gray-900 via-transparent to-transparent relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                            <DialogTitle className="text-2xl font-bold flex items-center gap-3 relative z-10">
                                                <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                                                    <Sparkles className="h-6 w-6 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                                        Buat Tugas Baru
                                                    </span>
                                                    <p className="text-xs font-normal text-gray-400 mt-1">Isi detail tugas untuk mahasiswa</p>
                                                </div>
                                            </DialogTitle>
                                        </DialogHeader>

                                        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">

                                            {/* Mata Kuliah Selection */}
                                            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="space-y-3">
                                                <Label className="text-indigo-300 text-xs font-bold uppercase tracking-widest pl-1">Mata Kuliah & Judul</Label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                            <BookOpen className="h-4 w-4 text-indigo-400 group-focus-within:text-indigo-300 transition-colors" />
                                                        </div>
                                                        <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
                                                            <SelectTrigger className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500/50 hover:bg-white/10 transition-all text-white shadow-sm">
                                                                <SelectValue placeholder="Pilih Mata Kuliah" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-[#121212] border-slate-800 text-white max-h-[250px] shadow-2xl">
                                                                {courses.map((c) => (
                                                                    <SelectItem key={c.id} value={String(c.id)} className="focus:bg-indigo-600/20 focus:text-indigo-300 cursor-pointer py-3">
                                                                        <span className="font-medium">{c.nama}</span>
                                                                        <span className="block text-xs text-gray-500 mt-0.5">{c.dosen}</span>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                            <Pencil className="h-4 w-4 text-pink-400 group-focus-within:text-pink-300 transition-colors" />
                                                        </div>
                                                        <Input
                                                            value={form.judul}
                                                            onChange={(e) => setForm({ ...form, judul: e.target.value })}
                                                            className="pl-11 h-12 bg-white/5 border-white/10 rounded-xl focus:ring-2 focus:ring-pink-500/50 hover:bg-white/10 transition-all text-white placeholder:text-gray-600 shadow-sm"
                                                            placeholder="Judul Tugas..."
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* Content Area */}
                                            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="space-y-3">
                                                <Label className="text-indigo-300 text-xs font-bold uppercase tracking-widest pl-1">Konten Tugas</Label>
                                                <div className="space-y-4 rounded-2xl bg-white/5 border border-white/5 p-5">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs text-gray-400 ml-1">Deskripsi Singkat</Label>
                                                        <Textarea
                                                            value={form.deskripsi}
                                                            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                                                            rows={2}
                                                            className="bg-black/20 border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:bg-black/40 transition-all text-white placeholder:text-gray-600 resize-none"
                                                            placeholder="Jelaskan secara singkat tentang tugas ini..."
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs text-gray-400 ml-1">Instruksi Detail (Opsional)</Label>
                                                        <div className="relative">
                                                            <Zap className="absolute top-3 left-3 h-4 w-4 text-amber-400 opacity-70" />
                                                            <Textarea
                                                                value={form.instruksi}
                                                                onChange={(e) => setForm({ ...form, instruksi: e.target.value })}
                                                                rows={4}
                                                                className="pl-10 bg-black/20 border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:bg-black/40 transition-all text-white placeholder:text-gray-600"
                                                                placeholder="Langkah-langkah pengerjaan, kriteria penilaian, atau catatan penting lainnya..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* Settings Grid */}
                                            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-gray-400 text-xs ml-1">Kategori</Label>
                                                    <Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v })}>
                                                        <SelectTrigger className="h-10 bg-white/5 border-white/10 rounded-lg text-white text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-[#1a1a1a] border-slate-800 text-white">
                                                            <SelectItem value="tugas">📝 Tugas</SelectItem>
                                                            <SelectItem value="quiz">❓ Quiz</SelectItem>
                                                            <SelectItem value="project">🚀 Project</SelectItem>
                                                            <SelectItem value="presentasi">🎤 Presentasi</SelectItem>
                                                            <SelectItem value="lainnya">📌 Lainnya</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-gray-400 text-xs ml-1">Prioritas</Label>
                                                    <Select value={form.prioritas} onValueChange={(v) => setForm({ ...form, prioritas: v })}>
                                                        <SelectTrigger className="h-10 bg-white/5 border-white/10 rounded-lg text-white text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-[#1a1a1a] border-slate-800 text-white">
                                                            <SelectItem value="rendah">🟢 Rendah</SelectItem>
                                                            <SelectItem value="sedang">🟡 Sedang</SelectItem>
                                                            <SelectItem value="tinggi">🔴 Tinggi</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2 col-span-2 lg:col-span-2">
                                                    <Label className="text-gray-400 text-xs ml-1">Deadline & Status</Label>
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <Calendar className="h-3.5 w-3.5 text-blue-400" />
                                                            </div>
                                                            <Input
                                                                type="datetime-local"
                                                                value={form.deadline}
                                                                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                                                style={{ colorScheme: 'dark' }}
                                                                className="pl-9 h-10 bg-white/5 border-white/10 rounded-lg text-white text-xs appearance-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 cursor-pointer"
                                                            />
                                                        </div>
                                                        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                                                            <SelectTrigger className="w-32 h-10 bg-white/5 border-white/10 rounded-lg text-white text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-[#1a1a1a] border-slate-800 text-white">
                                                                <SelectItem value="draft">Draft</SelectItem>
                                                                <SelectItem value="published">Published</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* Action Button */}
                                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="pt-4">
                                                <Button
                                                    onClick={handleCreate}
                                                    className="w-full h-14 text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all border border-white/20 hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 backdrop-blur-sm" />
                                                    <span className="relative flex items-center gap-2">
                                                        <Plus className="h-5 w-5" /> Buat Tugas Sekarang
                                                    </span>
                                                </Button>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </motion.div>

                {/* Stats with Animation */}
                <motion.div
                    className="grid grid-cols-4 gap-4"
                    variants={containerVariants}
                >
                    {[
                        { icon: FileText, label: 'Total Tugas', value: stats.total, color: 'from-blue-500 to-indigo-500' },
                        { icon: CheckCircle, label: 'Published', value: stats.published, color: 'from-emerald-500 to-teal-500' },
                        { icon: Clock, label: 'Draft', value: stats.draft, color: 'from-gray-500 to-slate-500' },
                        { icon: AlertTriangle, label: 'Overdue', value: stats.overdue, color: 'from-red-500 to-rose-500' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className="rounded-xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
                            whileHover={{ scale: 1.05, y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">{stat.label}</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filters */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
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
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-16 text-center shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70"
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
                                className={`rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/70 cursor-pointer group ${tugas.is_overdue ? 'border-red-300 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10' : ''}`}
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
