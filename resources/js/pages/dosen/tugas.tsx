import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import DosenLayout from '@/layouts/dosen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
    AlertTriangle, Award, BookOpen, Calendar, CheckCircle, Clock, Eye, FileText, MessageSquare,
    MoreHorizontal, Pencil, Plus, Search, Trash2, Sparkles, X, Filter, TrendingUp, Target,
    ClipboardList, Zap, ChevronRight, ListTodo, FileCheck, Timer, Users
} from 'lucide-react';

type Course = { id: number; nama: string };
type Tugas = {
    id: number; judul: string; deskripsi: string; jenis: string; deadline: string;
    deadline_display: string; prioritas: string; status: string;
    course: { id: number; nama: string }; created_by: string; created_by_type: string;
    is_overdue: boolean; days_until_deadline: number; diskusi_count: number; created_at: string;
};
type Props = {
    tugasList: Tugas[]; courses: Course[];
    stats: { total: number; published: number; draft: number; overdue: number };
    filters: { search: string; course_id: string; status: string };
};

// Advanced Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
            when: "beforeChildren" as const,
        },
    },
};

const itemVariants = {
    hidden: { 
        opacity: 0, 
        y: 40, 
        scale: 0.9,
        rotateX: -10,
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 120,
            damping: 18,
            mass: 0.8,
        },
    },
};

const cardVariants = {
    hidden: { 
        opacity: 0, 
        y: 30,
        scale: 0.95,
    },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 100,
            damping: 15,
            delay: i * 0.05,
        },
    }),
    hover: {
        scale: 1.02,
        y: -5,
        rotateY: 2,
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 25,
        },
    },
    tap: {
        scale: 0.98,
    },
};

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        y: 50,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            stiffness: 300,
            damping: 30,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        y: 50,
        transition: {
            duration: 0.2,
        },
    },
};

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { duration: 0.2 }
    },
    exit: { 
        opacity: 0,
        transition: { duration: 0.2 }
    },
};

const badgeVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: (i: number) => ({
        scale: 1,
        opacity: 1,
        transition: {
            type: 'spring' as const,
            stiffness: 500,
            damping: 25,
            delay: i * 0.05,
        },
    }),
    hover: {
        scale: 1.1,
        rotate: [0, -5, 5, 0],
        transition: {
            duration: 0.3,
        },
    },
};

export default function DosenTugas({ tugasList, courses, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [courseId, setCourseId] = useState(filters.course_id);
    const [status, setStatus] = useState(filters.status);
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editTugas, setEditTugas] = useState<Tugas | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [form, setForm] = useState({
        course_id: '', judul: '', deskripsi: '', instruksi: '',
        jenis: 'tugas', deadline: '', prioritas: 'sedang', status: 'draft',
    });

    useEffect(() => { 
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleCreate = () => {
        router.post('/dosen/tugas', form, {
            onSuccess: () => {
                setShowCreate(false);
                setForm({ course_id: '', judul: '', deskripsi: '', instruksi: '', jenis: 'tugas', deadline: '', prioritas: 'sedang', status: 'draft' });
            },
        });
    };

    const handleEdit = () => {
        if (!editTugas) return;
        router.patch(`/dosen/tugas/${editTugas.id}`, form, {
            onSuccess: () => { setShowEdit(false); setEditTugas(null); },
        });
    };

    const openDeleteDialog = (id: number) => setDeleteDialog({ open: true, id });
    const handleDelete = () => {
        if (deleteDialog.id) {
            router.delete(`/dosen/tugas/${deleteDialog.id}`);
            setDeleteDialog({ open: false, id: null });
        }
    };

    const openEdit = (tugas: Tugas) => {
        setEditTugas(tugas);
        setForm({
            course_id: String(tugas.course.id), judul: tugas.judul, deskripsi: tugas.deskripsi,
            instruksi: '', jenis: tugas.jenis, deadline: tugas.deadline.replace(' ', 'T'),
            prioritas: tugas.prioritas, status: tugas.status,
        });
        setShowEdit(true);
    };

    const getPriorityBadge = (p: string) => {
        const styles: Record<string, { bg: string; text: string; icon: any }> = {
            tinggi: { bg: 'bg-gradient-to-r from-red-500 to-rose-500', text: 'text-white', icon: Zap },
            sedang: { bg: 'bg-gradient-to-r from-amber-500 to-orange-500', text: 'text-white', icon: Target },
            rendah: { bg: 'bg-gradient-to-r from-emerald-500 to-green-500', text: 'text-white', icon: CheckCircle },
        };
        const style = styles[p] || styles.sedang;
        const Icon = style.icon;
        return (
            <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shadow-lg', style.bg, style.text)}>
                <Icon className="h-3 w-3" /> {p}
            </span>
        );
    };

    const getStatusBadge = (s: string) => {
        const styles: Record<string, { bg: string; text: string; icon: any }> = {
            published: { bg: 'bg-gradient-to-r from-emerald-500 to-teal-500', text: 'text-white', icon: CheckCircle },
            draft: { bg: 'bg-gradient-to-r from-gray-400 to-gray-500', text: 'text-white', icon: FileText },
            closed: { bg: 'bg-gradient-to-r from-red-500 to-pink-500', text: 'text-white', icon: X },
        };
        const style = styles[s] || styles.draft;
        const Icon = style.icon;
        return (
            <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', style.bg, style.text)}>
                <Icon className="h-3 w-3" /> {s}
            </span>
        );
    };

    const getJenisBadge = (j: string) => {
        const styles: Record<string, { bg: string; emoji: string }> = {
            tugas: { bg: 'from-blue-500 to-indigo-500', emoji: '📝' },
            quiz: { bg: 'from-purple-500 to-violet-500', emoji: '❓' },
            project: { bg: 'from-orange-500 to-red-500', emoji: '🚀' },
            presentasi: { bg: 'from-pink-500 to-rose-500', emoji: '🎤' },
            lainnya: { bg: 'from-gray-500 to-slate-500', emoji: '📌' },
        };
        const style = styles[j] || styles.lainnya;
        return (
            <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r', style.bg)}>
                {style.emoji} {j}
            </span>
        );
    };

    return (
        <DosenLayout>
            <Head title="Informasi Tugas" />
            <motion.div 
                className="space-y-6 p-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div 
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 p-6 text-white shadow-xl"
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                            opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -90, 0],
                            opacity: [0.1, 0.15, 0.1]
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10"
                    />
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-white/5"
                    />
                    
                    {/* Floating Icons with Advanced Animation */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[FileText, ClipboardList, ListTodo].map((Icon, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ 
                                    opacity: [0.1, 0.3, 0.1],
                                    scale: [1, 1.2, 1],
                                    y: [0, -15, 0],
                                    rotate: [0, 10, -10, 0],
                                }}
                                transition={{
                                    duration: 4 + i,
                                    repeat: Infinity,
                                    delay: i * 0.5,
                                    ease: "easeInOut"
                                }}
                                className="absolute text-white/20"
                                style={{
                                    left: `${15 + i * 25}%`,
                                    top: `${20 + (i % 2) * 40}%`,
                                }}
                            >
                                <Icon size={24} />
                            </motion.div>
                        ))}
                    </div>
                    
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div 
                                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg"
                                    animate={{
                                        y: [0, -10, 0],
                                        rotate: [0, 5, -5, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    whileHover={{ 
                                        scale: 1.2, 
                                        rotate: 360,
                                        transition: { duration: 0.6 }
                                    }}
                                >
                                    <ClipboardList className="h-7 w-7" />
                                </motion.div>
                                <div>
                                    <motion.p 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-sm text-indigo-100 font-medium"
                                    >
                                        Manajemen
                                    </motion.p>
                                    <motion.h1 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-2xl font-bold flex items-center gap-2"
                                    >
                                        Informasi Tugas
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Sparkles className="h-6 w-6" />
                                        </motion.div>
                                    </motion.h1>
                                </div>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button 
                                    onClick={() => setShowCreate(true)}
                                    className="bg-white/20 hover:bg-white/30 text-white backdrop-blur border-0 shadow-lg"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Tambah Tugas
                                </Button>
                            </motion.div>
                        </div>
                        <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-indigo-100"
                        >
                            Kelola dan pantau tugas untuk mahasiswa
                        </motion.p>
                        
                        {/* Quick Stats in Header */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: FileText, label: 'Total Tugas', value: stats.total, color: 'text-white' },
                                { icon: CheckCircle, label: 'Published', value: stats.published, color: 'text-emerald-200' },
                                { icon: Clock, label: 'Draft', value: stats.draft, color: 'text-amber-200' },
                                { icon: AlertTriangle, label: 'Overdue', value: stats.overdue, color: 'text-red-200' },
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ 
                                        delay: 0.6 + i * 0.1,
                                        type: "spring",
                                        stiffness: 200
                                    }}
                                    whileHover={{ 
                                        scale: 1.05,
                                        y: -5,
                                        transition: { type: "spring", stiffness: 400 }
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white/10 backdrop-blur rounded-xl p-3 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <motion.div
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                        >
                                            <stat.icon className={cn("h-4 w-4", stat.color)} />
                                        </motion.div>
                                        <p className="text-indigo-100 text-xs font-medium">{stat.label}</p>
                                    </div>
                                    <motion.p 
                                        className="text-2xl font-bold"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.8 + i * 0.1, type: "spring", stiffness: 300 }}
                                    >
                                        {stat.value}
                                    </motion.p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div 
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    variants={containerVariants}
                >
                    {[
                        { icon: FileText, label: 'Total Tugas', value: stats.total, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/25' },
                        { icon: CheckCircle, label: 'Published', value: stats.published, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
                        { icon: Clock, label: 'Draft', value: stats.draft, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25' },
                        { icon: AlertTriangle, label: 'Overdue', value: stats.overdue, color: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/25' },
                    ].map((stat, i) => (
                        <motion.div 
                            key={i}
                            variants={itemVariants}
                            custom={i}
                            whileHover={{ 
                                scale: 1.05,
                                y: -8,
                                rotateY: 5,
                                transition: { type: "spring", stiffness: 400, damping: 25 }
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 group cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <motion.div 
                                    className={cn(
                                        'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
                                        stat.color, stat.shadow
                                    )}
                                    whileHover={{ 
                                        scale: 1.2,
                                        rotate: 360,
                                        transition: { duration: 0.6 }
                                    }}
                                >
                                    <stat.icon className="h-6 w-6" />
                                </motion.div>
                                <div>
                                    <motion.p 
                                        className="text-3xl font-bold text-slate-900 dark:text-white"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 200 }}
                                    >
                                        {stat.value}
                                    </motion.p>
                                    <p className="text-sm text-slate-500">{stat.label}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Filters */}
                <motion.div 
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70"
                    whileHover={{ scale: 1.005 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-gray-900 to-black text-white">
                            <Filter className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Filter & Pencarian</h3>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input 
                                placeholder="Cari tugas..." 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && router.get('/dosen/tugas', { search, course_id: courseId, status }, { preserveState: true })}
                                className="pl-10 bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-slate-700" 
                            />
                        </div>
                        <Select value={courseId} onValueChange={(v) => { setCourseId(v); router.get('/dosen/tugas', { search, course_id: v, status }, { preserveState: true }); }}>
                            <SelectTrigger className="w-48 bg-slate-50 dark:bg-gray-900"><SelectValue placeholder="Semua Mata Kuliah" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                                {courses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={status} onValueChange={(v) => { setStatus(v); router.get('/dosen/tugas', { search, course_id: courseId, status: v }, { preserveState: true }); }}>
                            <SelectTrigger className="w-40 bg-slate-50 dark:bg-gray-900"><SelectValue placeholder="Semua Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>

                {/* Tugas List */}
                <motion.div 
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 overflow-hidden"
                >
                    <div className="p-4 border-b border-slate-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-900 to-black text-white">
                                <ListTodo className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900 dark:text-white">Daftar Tugas</h2>
                                <p className="text-xs text-slate-500">{tugasList.length} tugas ditemukan</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4">
                        {tugasList.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="text-center py-16"
                            >
                                <div className="relative mx-auto w-24 h-24 mb-6">
                                    <motion.div 
                                        animate={{ 
                                            scale: [1, 1.2, 1],
                                            opacity: [0.2, 0.4, 0.2]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black rounded-full"
                                    />
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-gray-900 to-black rounded-full"
                                    >
                                        <FileText className="h-12 w-12 text-white" />
                                    </motion.div>
                                </div>
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-xl font-semibold text-slate-700 dark:text-slate-300"
                                >
                                    Belum ada tugas
                                </motion.p>
                                <motion.p 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-sm text-slate-500 mt-2"
                                >
                                    Klik tombol "Tambah Tugas" untuk membuat tugas baru
                                </motion.p>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Button 
                                        onClick={() => setShowCreate(true)}
                                        className="mt-4 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Tambah Tugas Pertama
                                    </Button>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                {tugasList.map((tugas, index) => {
                                    const isHovered = hoveredCard === tugas.id;
                                    return (
                                        <motion.div 
                                            key={tugas.id}
                                            custom={index}
                                            variants={cardVariants}
                                            initial="hidden"
                                            animate="visible"
                                            whileHover="hover"
                                            whileTap="tap"
                                            onMouseEnter={() => setHoveredCard(tugas.id)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                            className={cn(
                                                'rounded-2xl border-2 p-5 cursor-pointer relative overflow-hidden group',
                                                tugas.is_overdue 
                                                    ? 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50 dark:border-red-800 dark:from-red-950/30 dark:to-rose-950/30' 
                                                    : 'border-slate-200/70 bg-white dark:border-slate-700 dark:bg-gray-900/50'
                                            )}
                                        >
                                            {/* Animated Glow Effect */}
                                            <AnimatePresence>
                                                {isHovered && (
                                                    <motion.div 
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none"
                                                    />
                                                )}
                                            </AnimatePresence>
                                            
                                            <div className="flex items-start justify-between relative">
                                                <div className="flex-1" onClick={() => router.visit(`/dosen/tugas/${tugas.id}`)}>
                                                    {/* Badges with Stagger Animation */}
                                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                        <motion.div
                                                            custom={0}
                                                            variants={badgeVariants}
                                                            initial="initial"
                                                            animate="animate"
                                                            whileHover="hover"
                                                        >
                                                            {getJenisBadge(tugas.jenis)}
                                                        </motion.div>
                                                        <motion.div
                                                            custom={1}
                                                            variants={badgeVariants}
                                                            initial="initial"
                                                            animate="animate"
                                                            whileHover="hover"
                                                        >
                                                            {getPriorityBadge(tugas.prioritas)}
                                                        </motion.div>
                                                        <motion.div
                                                            custom={2}
                                                            variants={badgeVariants}
                                                            initial="initial"
                                                            animate="animate"
                                                            whileHover="hover"
                                                        >
                                                            {getStatusBadge(tugas.status)}
                                                        </motion.div>
                                                        {tugas.is_overdue && (
                                                            <motion.span 
                                                                custom={3}
                                                                variants={badgeVariants}
                                                                initial="initial"
                                                                animate="animate"
                                                                whileHover="hover"
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-600 to-rose-600 text-white"
                                                            >
                                                                <motion.div
                                                                    animate={{ 
                                                                        scale: [1, 1.2, 1],
                                                                        rotate: [0, 10, -10, 0]
                                                                    }}
                                                                    transition={{ duration: 1, repeat: Infinity }}
                                                                >
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                </motion.div>
                                                                Overdue
                                                            </motion.span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Title & Description */}
                                                    <motion.h3 
                                                        className={cn(
                                                            'font-bold text-lg',
                                                            isHovered ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'
                                                        )}
                                                        animate={isHovered ? { x: 5 } : { x: 0 }}
                                                        transition={{ type: "spring", stiffness: 300 }}
                                                    >
                                                        {tugas.judul}
                                                    </motion.h3>
                                                    <p className="text-sm text-slate-500 line-clamp-2 mt-2">{tugas.deskripsi}</p>
                                                    
                                                    {/* Meta Info */}
                                                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                                                        <motion.span 
                                                            whileHover={{ scale: 1.05, y: -2 }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm dark:bg-blue-900/30 dark:text-blue-300"
                                                        >
                                                            <BookOpen className="h-4 w-4" /> {tugas.course.nama}
                                                        </motion.span>
                                                        <motion.span 
                                                            whileHover={{ scale: 1.05, y: -2 }}
                                                            className={cn(
                                                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm",
                                                                tugas.is_overdue 
                                                                    ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                                                    : "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                                            )}
                                                        >
                                                            <Calendar className="h-4 w-4" /> {tugas.deadline_display}
                                                        </motion.span>
                                                        <motion.span 
                                                            whileHover={{ scale: 1.05, y: -2 }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm dark:bg-emerald-900/30 dark:text-emerald-300"
                                                        >
                                                            <MessageSquare className="h-4 w-4" /> {tugas.diskusi_count} diskusi
                                                        </motion.span>
                                                        {tugas.days_until_deadline > 0 && !tugas.is_overdue && (
                                                            <motion.span 
                                                                whileHover={{ scale: 1.05, y: -2 }}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm dark:bg-amber-900/30 dark:text-amber-300"
                                                            >
                                                                <Timer className="h-4 w-4" /> {tugas.days_until_deadline} hari lagi
                                                            </motion.span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Actions */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ 
                                                                opacity: isHovered ? 1 : 0,
                                                                scale: isHovered ? 1 : 0.8
                                                            }}
                                                            transition={{ type: "spring", stiffness: 300 }}
                                                        >
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </motion.div>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => router.visit(`/dosen/tugas/${tugas.id}`)} className="cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4 text-blue-500" /> Lihat Detail
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => router.visit(`/dosen/tugas/${tugas.id}/grading`)} className="cursor-pointer">
                                                            <Award className="mr-2 h-4 w-4 text-purple-500" /> Penilaian
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
                                            
                                            {/* Hover Arrow with Animation */}
                                            <AnimatePresence>
                                                {isHovered && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -10 }}
                                                        transition={{ type: "spring", stiffness: 300 }}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2"
                                                    >
                                                        <motion.div
                                                            animate={{ x: [0, 5, 0] }}
                                                            transition={{ duration: 1, repeat: Infinity }}
                                                        >
                                                            <ChevronRight className="h-6 w-6 text-indigo-500" />
                                                        </motion.div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Create Modal */}
                <AnimatePresence>
                    {showCreate && (
                        <motion.div 
                            className="fixed inset-0 z-50 flex items-center justify-center"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <motion.div 
                                variants={backdropVariants}
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                                onClick={() => setShowCreate(false)} 
                            />
                            <motion.div 
                                variants={modalVariants}
                                className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
                            >
                                <motion.div 
                                    className="bg-gradient-to-r from-gray-900 to-black p-4"
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <motion.div 
                                                className="p-2 bg-white/20 rounded-lg"
                                                whileHover={{ scale: 1.1, rotate: 180 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Plus className="h-5 w-5 text-white" />
                                            </motion.div>
                                            <h2 className="text-xl font-bold text-white">Tambah Tugas Baru</h2>
                                        </div>
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)} className="text-white hover:bg-white/20">
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div>
                                    <Label className="text-slate-700 dark:text-slate-300">Mata Kuliah</Label>
                                    <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
                                        <SelectTrigger className="mt-1"><SelectValue placeholder="Pilih mata kuliah" /></SelectTrigger>
                                        <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-slate-700 dark:text-slate-300">Judul</Label>
                                    <Input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className="mt-1" placeholder="Masukkan judul tugas" />
                                </div>
                                <div>
                                    <Label className="text-slate-700 dark:text-slate-300">Deskripsi</Label>
                                    <Textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3} className="mt-1" placeholder="Jelaskan tugas secara detail" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-slate-700 dark:text-slate-300">Jenis</Label>
                                        <Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v })}>
                                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
                                        <Label className="text-slate-700 dark:text-slate-300">Prioritas</Label>
                                        <Select value={form.prioritas} onValueChange={(v) => setForm({ ...form, prioritas: v })}>
                                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
                                        <Label className="text-slate-700 dark:text-slate-300">Deadline</Label>
                                        <Input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label className="text-slate-700 dark:text-slate-300">Status</Label>
                                        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">📋 Draft</SelectItem>
                                                <SelectItem value="published">✅ Published</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex gap-3">
                                    <motion.div 
                                        className="flex-1"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button variant="outline" onClick={() => setShowCreate(false)} className="w-full">Batal</Button>
                                    </motion.div>
                                    <motion.div 
                                        className="flex-1"
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button onClick={handleCreate} className="w-full bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900">
                                            <Plus className="mr-2 h-4 w-4" /> Simpan
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                </AnimatePresence>

                {/* Edit Modal */}
                <AnimatePresence>
                    {showEdit && editTugas && (
                        <motion.div 
                            className="fixed inset-0 z-50 flex items-center justify-center"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <motion.div 
                                variants={backdropVariants}
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                                onClick={() => setShowEdit(false)} 
                            />
                            <motion.div 
                                variants={modalVariants}
                                className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
                            >
                                <motion.div 
                                    className="bg-gradient-to-r from-amber-500 to-orange-600 p-4"
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <motion.div 
                                                className="p-2 bg-white/20 rounded-lg"
                                                whileHover={{ scale: 1.1, rotate: 180 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Pencil className="h-5 w-5 text-white" />
                                            </motion.div>
                                            <h2 className="text-xl font-bold text-white">Edit Tugas</h2>
                                        </div>
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <Button variant="ghost" size="icon" onClick={() => setShowEdit(false)} className="text-white hover:bg-white/20">
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div>
                                    <Label className="text-slate-700 dark:text-slate-300">Judul</Label>
                                    <Input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className="mt-1" />
                                </div>
                                <div>
                                    <Label className="text-slate-700 dark:text-slate-300">Deskripsi</Label>
                                    <Textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3} className="mt-1" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-slate-700 dark:text-slate-300">Jenis</Label>
                                        <Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v })}>
                                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
                                        <Label className="text-slate-700 dark:text-slate-300">Prioritas</Label>
                                        <Select value={form.prioritas} onValueChange={(v) => setForm({ ...form, prioritas: v })}>
                                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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
                                        <Label className="text-slate-700 dark:text-slate-300">Deadline</Label>
                                        <Input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="mt-1" />
                                    </div>
                                    <div>
                                        <Label className="text-slate-700 dark:text-slate-300">Status</Label>
                                        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">📋 Draft</SelectItem>
                                                <SelectItem value="published">✅ Published</SelectItem>
                                                <SelectItem value="closed">🔒 Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex gap-3">
                                    <motion.div 
                                        className="flex-1"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button variant="outline" onClick={() => setShowEdit(false)} className="w-full">Batal</Button>
                                    </motion.div>
                                    <motion.div 
                                        className="flex-1"
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Button onClick={handleEdit} className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                                            <CheckCircle className="mr-2 h-4 w-4" /> Simpan Perubahan
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                </AnimatePresence>
            </motion.div>

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
        </DosenLayout>
    );
}
