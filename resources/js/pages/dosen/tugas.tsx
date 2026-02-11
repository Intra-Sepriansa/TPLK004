import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import DosenLayout from '@/layouts/dosen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, Award, BookOpen, Calendar, CheckCircle, Clock, Eye, FileText, MessageSquare,
    MoreHorizontal, Pencil, Plus, Search, Trash2, Sparkles, X, Filter, Target,
    ClipboardList, Zap, ChevronRight, ListTodo, FileCheck, Timer, Users, Presentation, Lightbulb, Rocket,
    Download, Copy, Archive, BarChart3, Grid3x3, List, ArrowUpDown, TrendingUp, UserCheck, Send
} from 'lucide-react';

type Course = { id: number; nama: string };
type Tugas = {
    id: number; judul: string; deskripsi: string; jenis: string; deadline: string;
    deadline_display: string; prioritas: string; status: string;
    course: { id: number; nama: string }; created_by: string; created_by_type: string;
    is_overdue: boolean; days_until_deadline: number; diskusi_count: number; created_at: string;
    submission_count?: number; total_students?: number; view_count?: number; late_submissions?: number;
};
type Props = {
    tugasList: Tugas[]; courses: Course[];
    stats: { 
        total: number; published: number; draft: number; overdue: number;
        total_submissions?: number; avg_completion_rate?: number; pending_review?: number;
    };
    filters: { search: string; course_id: string; status: string };
};

// Professional Animation Variants - Simplified
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03,
            delayChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
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

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        y: 20,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.2,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 20,
        transition: {
            duration: 0.15,
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
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'submissions'>('deadline');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [form, setForm] = useState({
        course_id: '', judul: '', deskripsi: '', instruksi: '',
        jenis: 'tugas', deadline: '', prioritas: 'sedang', status: 'draft',
    });

    // Calculate completion rate for a tugas
    const getCompletionRate = (tugas: Tugas) => {
        if (!tugas.total_students || tugas.total_students === 0) return 0;
        return Math.round(((tugas.submission_count || 0) / tugas.total_students) * 100);
    };

    // Sort tugas list
    const sortedTugasList = [...tugasList].sort((a, b) => {
        if (sortBy === 'deadline') {
            return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        } else if (sortBy === 'priority') {
            const priorityOrder = { tinggi: 3, sedang: 2, rendah: 1 };
            return priorityOrder[b.prioritas as keyof typeof priorityOrder] - priorityOrder[a.prioritas as keyof typeof priorityOrder];
        } else if (sortBy === 'submissions') {
            return (b.submission_count || 0) - (a.submission_count || 0);
        }
        return 0;
    });

    // Filter by priority
    const filteredTugasList = priorityFilter === 'all' 
        ? sortedTugasList 
        : sortedTugasList.filter(t => t.prioritas === priorityFilter);

    useEffect(() => { 
        // Add any initialization logic here
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

    const handleDuplicate = (tugas: Tugas) => {
        setForm({
            course_id: String(tugas.course.id),
            judul: `${tugas.judul} (Copy)`,
            deskripsi: tugas.deskripsi,
            instruksi: '',
            jenis: tugas.jenis,
            deadline: '',
            prioritas: tugas.prioritas,
            status: 'draft',
        });
        setShowCreate(true);
    };

    const handleArchive = (id: number) => {
        router.patch(`/dosen/tugas/${id}`, { status: 'closed' });
    };

    const handleExport = (tugas: Tugas) => {
        // Export tugas data as JSON
        const dataStr = JSON.stringify(tugas, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `tugas-${tugas.id}-${tugas.judul.replace(/\s+/g, '-')}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
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
        const styles: Record<string, { bg: string; icon: any }> = {
            tugas: { bg: 'from-blue-500 to-indigo-500', icon: FileText },
            quiz: { bg: 'from-purple-500 to-violet-500', icon: FileCheck },
            project: { bg: 'from-orange-500 to-red-500', icon: Rocket },
            presentasi: { bg: 'from-pink-500 to-rose-500', icon: Presentation },
            lainnya: { bg: 'from-gray-500 to-slate-500', icon: Lightbulb },
        };
        const style = styles[j] || styles.lainnya;
        const Icon = style.icon;
        return (
            <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r', style.bg)}>
                <Icon className="h-3 w-3" /> {j}
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
                {/* Header with Black Background - Professional & Clean */}
                <motion.div 
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6 text-white shadow-xl"
                >
                    {/* Subtle Static Background Orbs */}
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5" />
                    
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div 
                                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    <ClipboardList className="h-7 w-7" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-white/70 font-medium">Manajemen</p>
                                    <h1 className="text-2xl font-bold flex items-center gap-2">
                                        Informasi Tugas
                                        <Sparkles className="h-6 w-6" />
                                    </h1>
                                </div>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button 
                                    onClick={() => setShowCreate(true)}
                                    className="bg-white/20 hover:bg-white/30 text-white backdrop-blur border-0 shadow-lg"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Tambah Tugas
                                </Button>
                            </motion.div>
                        </div>
                        <p className="mt-4 text-white/70">
                            Kelola dan pantau tugas untuk mahasiswa
                        </p>
                        
                        {/* Quick Stats in Header - Simplified */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: FileText, label: 'Total Tugas', value: stats.total, color: 'text-white' },
                                { icon: CheckCircle, label: 'Published', value: stats.published, color: 'text-emerald-200' },
                                { icon: Clock, label: 'Draft', value: stats.draft, color: 'text-amber-200' },
                                { icon: AlertTriangle, label: 'Overdue', value: stats.overdue, color: 'text-red-200' },
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + i * 0.05 }}
                                    whileHover={{ y: -2 }}
                                    className="bg-white/10 backdrop-blur rounded-xl p-3 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <stat.icon className={cn("h-4 w-4", stat.color)} />
                                        <p className="text-white/70 text-xs font-medium">{stat.label}</p>
                                    </div>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Enhanced Stats Cards with More Details */}
                <motion.div 
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    variants={containerVariants}
                >
                    {[
                        { 
                            icon: FileText, 
                            label: 'Total Tugas', 
                            value: stats.total, 
                            subtitle: `${stats.published} aktif`,
                            color: 'from-blue-500 to-indigo-600', 
                            shadow: 'shadow-blue-500/25' 
                        },
                        { 
                            icon: Send, 
                            label: 'Total Submissions', 
                            value: stats.total_submissions || 0, 
                            subtitle: `${stats.pending_review || 0} pending`,
                            color: 'from-emerald-500 to-teal-600', 
                            shadow: 'shadow-emerald-500/25' 
                        },
                        { 
                            icon: BarChart3, 
                            label: 'Completion Rate', 
                            value: `${stats.avg_completion_rate || 0}%`, 
                            subtitle: 'rata-rata',
                            color: 'from-purple-500 to-violet-600', 
                            shadow: 'shadow-purple-500/25' 
                        },
                        { 
                            icon: AlertTriangle, 
                            label: 'Overdue', 
                            value: stats.overdue, 
                            subtitle: 'perlu perhatian',
                            color: 'from-red-500 to-rose-600', 
                            shadow: 'shadow-red-500/25' 
                        },
                    ].map((stat, i) => (
                        <motion.div 
                            key={i}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, y: -2 }}
                            transition={{ duration: 0.2 }}
                            className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div 
                                    className={cn(
                                        'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
                                        stat.color, stat.shadow
                                    )}
                                >
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                                    {stat.value}
                                </p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{stat.label}</p>
                                <p className="text-xs text-slate-500 mt-1">{stat.subtitle}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Enhanced Filters with View Mode and Sorting */}
                <motion.div 
                    variants={itemVariants}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-900 to-black text-white">
                                <Filter className="h-4 w-4" />
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Filter & Pencarian</h3>
                        </div>
                        
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-gray-800 rounded-lg p-1">
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="h-8 px-3"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="h-8 px-3"
                            >
                                <Grid3x3 className="h-4 w-4" />
                            </Button>
                        </div>
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
                        
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-40 bg-slate-50 dark:bg-gray-900"><SelectValue placeholder="Prioritas" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Prioritas</SelectItem>
                                <SelectItem value="tinggi">Tinggi</SelectItem>
                                <SelectItem value="sedang">Sedang</SelectItem>
                                <SelectItem value="rendah">Rendah</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                            <SelectTrigger className="w-48 bg-slate-50 dark:bg-gray-900">
                                <ArrowUpDown className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Urutkan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="deadline">Deadline</SelectItem>
                                <SelectItem value="priority">Prioritas</SelectItem>
                                <SelectItem value="submissions">Submissions</SelectItem>
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
                            <div className="text-center py-16">
                                <div className="relative mx-auto w-24 h-24 mb-6">
                                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-gray-900 to-black rounded-full">
                                        <FileText className="h-12 w-12 text-white" />
                                    </div>
                                </div>
                                <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                                    Belum ada tugas
                                </p>
                                <p className="text-sm text-slate-500 mt-2">
                                    Klik tombol "Tambah Tugas" untuk membuat tugas baru
                                </p>
                                <Button 
                                    onClick={() => setShowCreate(true)}
                                    className="mt-4 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Tambah Tugas Pertama
                                </Button>
                            </div>
                        ) : (
                            <div className={cn(
                                viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'
                            )}>
                                {filteredTugasList.map((tugas, index) => {
                                    const isHovered = hoveredCard === tugas.id;
                                    const completionRate = getCompletionRate(tugas);
                                    
                                    return (
                                        <motion.div 
                                            key={tugas.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03, duration: 0.3 }}
                                            whileHover={{ scale: 1.01, y: -2 }}
                                            onMouseEnter={() => setHoveredCard(tugas.id)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                            className={cn(
                                                'rounded-2xl border-2 p-5 cursor-pointer relative overflow-hidden transition-colors',
                                                tugas.is_overdue 
                                                    ? 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50 dark:border-red-800 dark:from-red-950/30 dark:to-rose-950/30' 
                                                    : 'border-slate-200/70 bg-white dark:border-slate-700 dark:bg-gray-900/50'
                                            )}
                                        >
                                            <div className="flex items-start justify-between relative">
                                                <div className="flex-1" onClick={() => router.visit(`/dosen/tugas/${tugas.id}`)}>
                                                    {/* Badges */}
                                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                        {getJenisBadge(tugas.jenis)}
                                                        {getPriorityBadge(tugas.prioritas)}
                                                        {getStatusBadge(tugas.status)}
                                                        {tugas.is_overdue && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-600 to-rose-600 text-white">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Overdue
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Title & Description */}
                                                    <h3 
                                                        className={cn(
                                                            'font-bold text-lg transition-colors',
                                                            isHovered ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'
                                                        )}
                                                    >
                                                        {tugas.judul}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 line-clamp-2 mt-2">{tugas.deskripsi}</p>
                                                    
                                                    {/* Progress Bar - Completion Rate */}
                                                    {tugas.total_students && tugas.total_students > 0 && (
                                                        <div className="mt-4 space-y-2">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-slate-600 dark:text-slate-400 font-medium">
                                                                    Progress Pengumpulan
                                                                </span>
                                                                <span className="font-bold text-slate-900 dark:text-white">
                                                                    {completionRate}%
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                                                <motion.div 
                                                                    className={cn(
                                                                        "h-full rounded-full",
                                                                        completionRate >= 80 ? "bg-gradient-to-r from-emerald-500 to-green-500" :
                                                                        completionRate >= 50 ? "bg-gradient-to-r from-blue-500 to-indigo-500" :
                                                                        "bg-gradient-to-r from-amber-500 to-orange-500"
                                                                    )}
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${completionRate}%` }}
                                                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                                                                <span className="flex items-center gap-1">
                                                                    <UserCheck className="h-3 w-3" />
                                                                    {tugas.submission_count || 0}/{tugas.total_students} submit
                                                                </span>
                                                                {tugas.late_submissions && tugas.late_submissions > 0 && (
                                                                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                                                        <Clock className="h-3 w-3" />
                                                                        {tugas.late_submissions} terlambat
                                                                    </span>
                                                                )}
                                                                {tugas.view_count && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Eye className="h-3 w-3" />
                                                                        {tugas.view_count} views
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Meta Info */}
                                                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm dark:bg-blue-900/30 dark:text-blue-300">
                                                            <BookOpen className="h-4 w-4" /> {tugas.course.nama}
                                                        </span>
                                                        <span 
                                                            className={cn(
                                                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm",
                                                                tugas.is_overdue 
                                                                    ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                                                    : "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                                            )}
                                                        >
                                                            <Calendar className="h-4 w-4" /> {tugas.deadline_display}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm dark:bg-emerald-900/30 dark:text-emerald-300">
                                                            <MessageSquare className="h-4 w-4" /> {tugas.diskusi_count} diskusi
                                                        </span>
                                                        {tugas.days_until_deadline > 0 && !tugas.is_overdue && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm dark:bg-amber-900/30 dark:text-amber-300">
                                                                <Timer className="h-4 w-4" /> {tugas.days_until_deadline} hari lagi
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Enhanced Actions */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            className={cn(
                                                                "transition-opacity",
                                                                isHovered ? "opacity-100" : "opacity-0"
                                                            )}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56">
                                                        <DropdownMenuItem onClick={() => router.visit(`/dosen/tugas/${tugas.id}`)} className="cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4 text-blue-500" /> Lihat Detail
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => router.visit(`/dosen/tugas/${tugas.id}/grading`)} className="cursor-pointer">
                                                            <Award className="mr-2 h-4 w-4 text-purple-500" /> Penilaian
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => openEdit(tugas)} className="cursor-pointer">
                                                            <Pencil className="mr-2 h-4 w-4 text-amber-500" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDuplicate(tugas)} className="cursor-pointer">
                                                            <Copy className="mr-2 h-4 w-4 text-indigo-500" /> Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleExport(tugas)} className="cursor-pointer">
                                                            <Download className="mr-2 h-4 w-4 text-green-500" /> Export Data
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleArchive(tugas.id)} className="cursor-pointer">
                                                            <Archive className="mr-2 h-4 w-4 text-slate-500" /> Archive
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openDeleteDialog(tugas.id)} className="cursor-pointer text-red-600">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            
                                            {/* Hover Arrow */}
                                            {isHovered && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <ChevronRight className="h-6 w-6 text-indigo-500" />
                                                </div>
                                            )}
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
                                <div className="bg-gradient-to-r from-gray-900 to-black p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/20 rounded-lg">
                                                <Plus className="h-5 w-5 text-white" />
                                            </div>
                                            <h2 className="text-xl font-bold text-white">Tambah Tugas Baru</h2>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)} className="text-white hover:bg-white/20">
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto bg-white dark:bg-gray-900">
                                {/* Mata Kuliah */}
                                <div>
                                    <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                                            <BookOpen className="h-3.5 w-3.5" />
                                        </div>
                                        Mata Kuliah
                                    </Label>
                                    <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
                                        <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/20 bg-white dark:bg-gray-800 text-slate-900 dark:text-white">
                                            <SelectValue placeholder="Pilih mata kuliah" />
                                        </SelectTrigger>
                                        <SelectContent>{courses.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>

                                {/* Judul */}
                                <div>
                                    <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                                            <FileText className="h-3.5 w-3.5" />
                                        </div>
                                        Judul
                                    </Label>
                                    <Input 
                                        value={form.judul} 
                                        onChange={(e) => setForm({ ...form, judul: e.target.value })} 
                                        className="border-2 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-emerald-500/20 bg-white dark:bg-gray-800 text-slate-900 dark:text-white" 
                                        placeholder="Masukkan judul tugas" 
                                    />
                                </div>

                                {/* Deskripsi */}
                                <div>
                                    <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
                                            <MessageSquare className="h-3.5 w-3.5" />
                                        </div>
                                        Deskripsi
                                    </Label>
                                    <Textarea 
                                        value={form.deskripsi} 
                                        onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} 
                                        rows={3} 
                                        className="border-2 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-violet-500/20 bg-white dark:bg-gray-800 text-slate-900 dark:text-white" 
                                        placeholder="Jelaskan tugas secara detail" 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Jenis */}
                                    <div>
                                        <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
                                                <ClipboardList className="h-3.5 w-3.5" />
                                            </div>
                                            Jenis
                                        </Label>
                                        <Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v })}>
                                            <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-amber-500/20 bg-white dark:bg-gray-800 text-slate-900 dark:text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="tugas"><span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> Tugas</span></SelectItem>
                                                <SelectItem value="quiz"><span className="flex items-center gap-2"><FileCheck className="h-3.5 w-3.5" /> Quiz</span></SelectItem>
                                                <SelectItem value="project"><span className="flex items-center gap-2"><Rocket className="h-3.5 w-3.5" /> Project</span></SelectItem>
                                                <SelectItem value="presentasi"><span className="flex items-center gap-2"><Presentation className="h-3.5 w-3.5" /> Presentasi</span></SelectItem>
                                                <SelectItem value="lainnya"><span className="flex items-center gap-2"><Lightbulb className="h-3.5 w-3.5" /> Lainnya</span></SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Prioritas */}
                                    <div>
                                        <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md">
                                                <Zap className="h-3.5 w-3.5" />
                                            </div>
                                            Prioritas
                                        </Label>
                                        <Select value={form.prioritas} onValueChange={(v) => setForm({ ...form, prioritas: v })}>
                                            <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-rose-500/20 bg-white dark:bg-gray-800 text-slate-900 dark:text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="rendah"><span className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Rendah</span></SelectItem>
                                                <SelectItem value="sedang"><span className="flex items-center gap-2"><Target className="h-3.5 w-3.5 text-amber-500" /> Sedang</span></SelectItem>
                                                <SelectItem value="tinggi"><span className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-red-500" /> Tinggi</span></SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Deadline */}
                                    <div>
                                        <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md">
                                                <Calendar className="h-3.5 w-3.5" />
                                            </div>
                                            Deadline
                                        </Label>
                                        <Input 
                                            type="datetime-local" 
                                            value={form.deadline} 
                                            onChange={(e) => setForm({ ...form, deadline: e.target.value })} 
                                            className="border-2 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-cyan-500/20 bg-white dark:bg-gray-800 text-slate-900 dark:text-white" 
                                        />
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md">
                                                <CheckCircle className="h-3.5 w-3.5" />
                                            </div>
                                            Status
                                        </Label>
                                        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                                            <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-green-500/20 bg-white dark:bg-gray-800 text-slate-900 dark:text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft"><span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5" /> Draft</span></SelectItem>
                                                <SelectItem value="published"><span className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5" /> Published</span></SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-gray-800/50">
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1 border-2">Batal</Button>
                                    <Button onClick={handleCreate} className="flex-1 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900">
                                        <Plus className="mr-2 h-4 w-4" /> Simpan
                                    </Button>
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
                                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/20 rounded-lg">
                                                <Pencil className="h-5 w-5 text-white" />
                                            </div>
                                            <h2 className="text-xl font-bold text-white">Edit Tugas</h2>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setShowEdit(false)} className="text-white hover:bg-white/20">
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
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
                                    <Button variant="outline" onClick={() => setShowEdit(false)} className="flex-1">Batal</Button>
                                    <Button onClick={handleEdit} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                                        <CheckCircle className="mr-2 h-4 w-4" /> Simpan Perubahan
                                    </Button>
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
