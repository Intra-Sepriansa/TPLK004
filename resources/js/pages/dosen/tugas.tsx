import { Head, router } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import DosenLayout from '@/layouts/dosen-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TugasCreateModalEnhanced } from '@/components/dosen/tugas-create-modal-enhanced';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, Award, BookOpen, Calendar, CheckCircle, Clock, Eye, FileText, MessageSquare,
    MoreHorizontal, Pencil, Plus, Search, Trash2, Sparkles, X, Filter, Target,
    ClipboardList, Zap, ChevronRight, ListTodo, FileCheck, Timer, Presentation, Lightbulb, Rocket,
    Download, Copy, Archive, BarChart3, Grid3x3, List, ArrowUpDown, UserCheck, Send,
    TrendingUp, Columns, ShieldAlert
} from 'lucide-react';

type Course = { id: number; nama: string };
type Tugas = {
    id: number; judul: string; deskripsi: string; jenis: string; deadline: string;
    deadline_display: string; prioritas: string; status: string;
    course: { id: number; nama: string }; created_by: string; created_by_type: string;
    is_overdue: boolean; days_until_deadline: number; diskusi_count: number; created_at: string;
    submission_count: number; total_students: number; pending_review: number;
    graded_count: number; late_submissions: number; average_score: number;
    max_grade: number; completion_rate: number;
};
type Stats = {
    total: number; published: number; draft: number; closed: number; overdue: number;
    total_submissions: number; pending_review: number; avg_completion_rate: number;
    avg_score: number; late_submissions: number; active_discussions: number;
    grading_progress: number;
};
type Props = {
    tugasList: Tugas[]; courses: Course[]; stats: Stats;
    filters: { search: string; course_id: string; status: string; priority: string; jenis: string };
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
} as const;
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
} as const;
const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 20 } },
    hover: { scale: 1.03, y: -8, transition: { type: 'spring' as const, stiffness: 400, damping: 10 } },
} as const;
const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } }, exit: { opacity: 0, transition: { duration: 0.2 } } };
const modalVariants = { hidden: { opacity: 0, scale: 0.95, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } }, exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } } };

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        let start = 0; const end = value; const duration = 1200; const startTime = Date.now();
        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime; const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(start + (end - start) * eased));
            if (progress >= 1) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [value]);
    return <>{display}{suffix}</>;
}

export default function DosenTugas({ tugasList, courses, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [courseId, setCourseId] = useState(filters.course_id);
    const [statusFilter, setStatusFilter] = useState(filters.status);
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editTugas, setEditTugas] = useState<Tugas | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list');
    const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'submissions' | 'score'>('deadline');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || 'all');
    const [jenisFilter, setJenisFilter] = useState(filters.jenis || 'all');
    const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'overdue'>('all');
    const [selectedTugas, setSelectedTugas] = useState<number[]>([]);
    const [showDetail, setShowDetail] = useState(false);
    const [detailTugas, setDetailTugas] = useState<Tugas | null>(null);
    const [detailTab, setDetailTab] = useState('overview');
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
    const [form, setForm] = useState({
        course_id: '', judul: '', deskripsi: '', instruksi: '',
        jenis: 'tugas', deadline: '', prioritas: 'sedang', status: 'draft',
    });

    const applyFilters = (overrides: Record<string, string> = {}) => {
        const params = { search, course_id: courseId, status: statusFilter, priority: priorityFilter, jenis: jenisFilter, ...overrides };
        router.get('/dosen/tugas', params, { preserveState: true });
    };

    const filteredList = useMemo(() => {
        let list = [...tugasList];
        if (activeTab === 'published') list = list.filter(t => t.status === 'published');
        else if (activeTab === 'draft') list = list.filter(t => t.status === 'draft');
        else if (activeTab === 'overdue') list = list.filter(t => t.is_overdue);
        list.sort((a, b) => {
            if (sortBy === 'deadline') return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
            if (sortBy === 'priority') { const o: Record<string, number> = { tinggi: 3, sedang: 2, rendah: 1 }; return (o[b.prioritas] || 0) - (o[a.prioritas] || 0); }
            if (sortBy === 'submissions') return b.submission_count - a.submission_count;
            if (sortBy === 'score') return b.average_score - a.average_score;
            return 0;
        });
        return list;
    }, [tugasList, activeTab, sortBy]);

    const handleCreate = () => { router.post('/dosen/tugas', form, { onSuccess: () => { setShowCreate(false); setForm({ course_id: '', judul: '', deskripsi: '', instruksi: '', jenis: 'tugas', deadline: '', prioritas: 'sedang', status: 'draft' }); } }); };
    const handleEdit = () => { if (!editTugas) return; router.patch(`/dosen/tugas/${editTugas.id}`, form, { onSuccess: () => { setShowEdit(false); setEditTugas(null); } }); };
    const handleDelete = () => { if (deleteDialog.id) { router.delete(`/dosen/tugas/${deleteDialog.id}`); setDeleteDialog({ open: false, id: null }); } };
    const openEdit = (t: Tugas) => { setEditTugas(t); setForm({ course_id: String(t.course.id), judul: t.judul, deskripsi: t.deskripsi, instruksi: '', jenis: t.jenis, deadline: t.deadline.replace(' ', 'T'), prioritas: t.prioritas, status: t.status }); setShowEdit(true); };
    const handleDuplicate = (t: Tugas) => { setForm({ course_id: String(t.course.id), judul: `${t.judul} (Copy)`, deskripsi: t.deskripsi, instruksi: '', jenis: t.jenis, deadline: '', prioritas: t.prioritas, status: 'draft' }); setShowCreate(true); };
    const handleArchive = (id: number) => { router.patch(`/dosen/tugas/${id}`, { status: 'closed', judul: tugasList.find(t => t.id === id)?.judul, deskripsi: tugasList.find(t => t.id === id)?.deskripsi, jenis: tugasList.find(t => t.id === id)?.jenis, deadline: tugasList.find(t => t.id === id)?.deadline, prioritas: tugasList.find(t => t.id === id)?.prioritas }); };
    const handleExport = (t: Tugas) => { const d = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(t, null, 2)); const a = document.createElement('a'); a.href = d; a.download = `tugas-${t.id}.json`; a.click(); };
    const toggleSelect = (id: number) => setSelectedTugas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const navigateDetail = (t: Tugas) => { router.visit(`/dosen/tugas/${t.id}`); };
    const openQuickPreview = (t: Tugas) => { setDetailTugas(t); setDetailTab('overview'); setShowDetail(true); };

    const getPriorityBadge = (p: string) => {
        const s: Record<string, { bg: string; icon: any }> = { tinggi: { bg: 'from-red-500 to-rose-500', icon: Zap }, sedang: { bg: 'from-amber-500 to-orange-500', icon: Target }, rendah: { bg: 'from-emerald-500 to-green-500', icon: CheckCircle } };
        const st = s[p] || s.sedang; const Icon = st.icon;
        return <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r shadow-lg', st.bg)}><Icon className="h-3 w-3" /> {p}</span>;
    };
    const getStatusBadge = (s: string) => {
        const st: Record<string, { bg: string; icon: any }> = { published: { bg: 'from-emerald-500 to-teal-500', icon: CheckCircle }, draft: { bg: 'from-gray-400 to-gray-500', icon: FileText }, closed: { bg: 'from-red-500 to-pink-500', icon: X } };
        const style = st[s] || st.draft; const Icon = style.icon;
        return <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r', style.bg)}><Icon className="h-3 w-3" /> {s}</span>;
    };
    const getJenisBadge = (j: string) => {
        const s: Record<string, { bg: string; icon: any }> = { tugas: { bg: 'from-blue-500 to-indigo-500', icon: FileText }, quiz: { bg: 'from-purple-500 to-violet-500', icon: FileCheck }, project: { bg: 'from-orange-500 to-red-500', icon: Rocket }, presentasi: { bg: 'from-pink-500 to-rose-500', icon: Presentation }, lainnya: { bg: 'from-gray-500 to-slate-500', icon: Lightbulb } };
        const st = s[j] || s.lainnya; const Icon = st.icon;
        return <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r', st.bg)}><Icon className="h-3 w-3" /> {j}</span>;
    };

    const summaryCards = [
        { key: 'total', icon: FileText, label: 'Total Tugas', value: stats.total, sub: `${stats.published} aktif, ${stats.draft} draft`, gradient: 'from-blue-400 to-cyan-600', glow: 'bg-blue-500', shadow: 'hover:shadow-blue-500/10' },
        { key: 'pending', icon: Clock, label: 'Perlu Penilaian', value: stats.pending_review, sub: 'Menunggu direview', gradient: 'from-amber-400 to-orange-600', glow: 'bg-amber-500', shadow: 'hover:shadow-amber-500/10' },
        { key: 'completion', icon: CheckCircle, label: 'Tingkat Penyelesaian', value: stats.avg_completion_rate, suffix: '%', sub: 'Rata-rata kelas', gradient: 'from-emerald-400 to-teal-600', glow: 'bg-emerald-500', shadow: 'hover:shadow-emerald-500/10' },
        { key: 'overdue', icon: AlertTriangle, label: 'Perlu Perhatian', value: stats.overdue, sub: 'Tugas overdue', gradient: 'from-red-400 to-rose-600', glow: 'bg-red-500', shadow: 'hover:shadow-red-500/10' },
    ];

    const tabs = [
        { key: 'all', label: 'Semua', count: tugasList.length },
        { key: 'published', label: 'Published', count: tugasList.filter(t => t.status === 'published').length },
        { key: 'draft', label: 'Draft', count: tugasList.filter(t => t.status === 'draft').length },
        { key: 'overdue', label: 'Overdue', count: tugasList.filter(t => t.is_overdue).length },
    ];

    return (
        <DosenLayout>
            <Head title="Informasi Tugas" />
            <motion.div className="space-y-6 p-4 md:p-6" variants={containerVariants} initial="hidden" animate="visible">
                {/* ═══ HEADER ═══ */}
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-30" />
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }} transition={{ type: 'spring', stiffness: 300 }}
                                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg">
                                    <ClipboardList className="h-8 w-8" />
                                </motion.div>
                                <div>
                                    <p className="text-sm text-indigo-100 font-medium tracking-wide">Manajemen Tugas</p>
                                    <h1 className="text-3xl font-bold text-white">Informasi Tugas</h1>
                                    <p className="mt-1 text-indigo-100">Kelola dan pantau tugas mahasiswa</p>
                                </div>
                            </div>
                            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}
                                className="flex items-center gap-3 rounded-2xl bg-white/20 backdrop-blur-xl px-6 py-3 shadow-lg border border-white/10">
                                <div className="p-2 bg-indigo-500/20 rounded-lg"><Sparkles className="h-6 w-6 text-white" /></div>
                                <div>
                                    <p className="text-xs text-indigo-100">Total Tugas</p>
                                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                                </div>
                            </motion.div>
                        </div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                            className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-white/10">
                            <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }} onClick={() => setShowCreate(true)}
                                className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg transition-all hover:bg-white/30">
                                <Plus className="h-4 w-4" /> Tambah Tugas
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg transition-all hover:bg-white/30">
                                <Download className="h-4 w-4" /> Export
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.25)' }} whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md border border-white/20 shadow-lg transition-all hover:bg-white/30">
                                <BarChart3 className="h-4 w-4" /> Analytics
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* ═══════ 4 SUMMARY CARDS ═══════ */}
                <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {summaryCards.map((card) => (
                        <motion.div key={card.key} variants={cardVariants} whileHover="hover" onHoverStart={() => setHoveredCard(card.key)} onHoverEnd={() => setHoveredCard(null)}
                            className={cn("group relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl transition-all dark:border-white/5", card.shadow)}>
                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 dark:opacity-10", card.gradient)} />
                            <motion.div animate={{ scale: hoveredCard === card.key ? 1.5 : 1, opacity: hoveredCard === card.key ? 0.4 : 0.2 }}
                                className={cn("absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl transition-all duration-500", card.glow)} />
                            <div className="relative flex items-center gap-3">
                                <motion.div whileHover={{ scale: 1.1, rotate: 10 }}
                                    className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", card.gradient)}>
                                    <card.icon className="h-6 w-6" />
                                </motion.div>
                                <div>
                                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{card.label}</p>
                                    <span className="text-xl font-bold text-neutral-900 dark:text-white">
                                        <AnimatedCounter value={card.value} suffix={card.suffix} />
                                    </span>
                                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">{card.sub}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ═══ FILTERS ═══ */}
                <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 p-5 shadow-xl backdrop-blur-xl dark:border-white/5">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white"><Filter className="h-4 w-4" /></div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">Filter & Pencarian</h3>
                        </div>
                        <div className="flex items-center gap-2 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-2xl p-1 backdrop-blur-md border border-white/10">
                            {(['list', 'grid', 'kanban'] as const).map(mode => {
                                const icons = { list: List, grid: Grid3x3, kanban: Columns };
                                const Icon = icons[mode];
                                return (
                                    <button key={mode} onClick={() => setViewMode(mode)} className={cn('relative px-3 py-1.5 rounded-xl text-sm font-medium transition-colors', viewMode === mode ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300')}>
                                        {viewMode === mode && <motion.div layoutId="activeViewTugas" className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />}
                                        <span className="relative z-10 flex items-center gap-1.5"><Icon className="h-4 w-4" />{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input placeholder="Cari tugas..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyFilters()} className="pl-10 bg-white/60 dark:bg-neutral-800/60 border-white/30" />
                        </div>
                        <Select value={courseId} onValueChange={(v) => { setCourseId(v); applyFilters({ course_id: v }); }}>
                            <SelectTrigger className="w-44 bg-white/60 dark:bg-neutral-800/60 border-white/30"><SelectValue placeholder="Mata Kuliah" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">Semua MK</SelectItem>{courses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nama}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={jenisFilter} onValueChange={(v) => { setJenisFilter(v); applyFilters({ jenis: v }); }}>
                            <SelectTrigger className="w-36 bg-white/60 dark:bg-neutral-800/60 border-white/30"><SelectValue placeholder="Jenis" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">Semua Jenis</SelectItem><SelectItem value="tugas">Tugas</SelectItem><SelectItem value="quiz">Quiz</SelectItem><SelectItem value="project">Project</SelectItem><SelectItem value="presentasi">Presentasi</SelectItem><SelectItem value="lainnya">Lainnya</SelectItem></SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                            <SelectTrigger className="w-44 bg-white/60 dark:bg-neutral-800/60 border-white/30"><ArrowUpDown className="h-4 w-4 mr-2" /><SelectValue placeholder="Urutkan" /></SelectTrigger>
                            <SelectContent><SelectItem value="deadline">Deadline</SelectItem><SelectItem value="priority">Prioritas</SelectItem><SelectItem value="submissions">Submissions</SelectItem><SelectItem value="score">Nilai</SelectItem></SelectContent>
                        </Select>
                    </div>
                </motion.div>

                {/* ═══ TABS ═══ */}
                <motion.div variants={itemVariants}>
                    <div className="flex p-1 gap-1 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-2xl backdrop-blur-md w-fit border border-white/10">
                        {tabs.map(tab => (
                            <motion.button key={tab.key} layout onClick={() => setActiveTab(tab.key as any)} className={cn('relative px-4 py-2 rounded-xl text-sm font-medium transition-colors', activeTab === tab.key ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300')}>
                                {activeTab === tab.key && <motion.div layoutId="activeTabTugas" className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-xl shadow-sm" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />}
                                <span className="relative z-10 flex items-center gap-2">{tab.label}<span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs">{tab.count}</span></span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* ═══ CONTENT ═══ */}
                <motion.div variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/40 dark:bg-neutral-900/40 shadow-xl backdrop-blur-xl overflow-hidden">
                    <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white"><ListTodo className="h-4 w-4" /></div>
                                <div><h2 className="font-semibold text-slate-900 dark:text-white">Daftar Tugas</h2><p className="text-xs text-slate-500">{filteredList.length} tugas ditemukan</p></div>
                            </div>
                            {selectedTugas.length > 0 && <span className="text-sm font-medium text-indigo-600">{selectedTugas.length} dipilih</span>}
                        </div>
                    </div>
                    <div className="p-4">
                        {filteredList.length === 0 ? (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
                                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="mx-auto w-20 h-20 mb-6 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full"><FileText className="h-10 w-10 text-white" /></motion.div>
                                <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Belum ada tugas</p>
                                <p className="text-sm text-slate-500 mt-2">Klik "Tambah Tugas" untuk memulai</p>
                                <Button onClick={() => setShowCreate(true)} className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"><Plus className="mr-2 h-4 w-4" /> Tambah Tugas</Button>
                            </motion.div>
                        ) : viewMode === 'kanban' ? (
                            /* ── KANBAN VIEW ── */
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {(['draft', 'published', 'closed'] as const).concat(['overdue'] as any).map(col => {
                                    const colConfig: Record<string, { label: string; color: string; items: Tugas[] }> = {
                                        draft: { label: 'Draft', color: 'from-gray-400 to-gray-500', items: filteredList.filter(t => t.status === 'draft') },
                                        published: { label: 'Published', color: 'from-emerald-500 to-teal-500', items: filteredList.filter(t => t.status === 'published' && !t.is_overdue) },
                                        overdue: { label: 'Overdue', color: 'from-red-500 to-rose-500', items: filteredList.filter(t => t.is_overdue) },
                                        closed: { label: 'Closed', color: 'from-slate-500 to-gray-600', items: filteredList.filter(t => t.status === 'closed') },
                                    };
                                    const cfg = colConfig[col];
                                    return (
                                        <div key={col} className="rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-neutral-800/30 p-3">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2"><div className={cn('h-3 w-3 rounded-full bg-gradient-to-r', cfg.color)} /><span className="font-semibold text-sm text-slate-700 dark:text-slate-300">{cfg.label}</span></div>
                                                <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">{cfg.items.length}</span>
                                            </div>
                                            <div className="space-y-2 min-h-[100px]">
                                                {cfg.items.map(t => (
                                                    <motion.div key={t.id} whileHover={{ scale: 1.02 }} onClick={() => navigateDetail(t)} className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200/50 dark:border-slate-700/50 cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex items-center gap-2 mb-2">{getJenisBadge(t.jenis)}{getPriorityBadge(t.prioritas)}</div>
                                                        <h4 className="font-medium text-sm text-slate-900 dark:text-white line-clamp-1">{t.judul}</h4>
                                                        <p className="text-xs text-slate-500 mt-1">{t.course.nama}</p>
                                                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                                                            <span className="flex items-center gap-1"><UserCheck className="h-3 w-3" />{t.submission_count}/{t.total_students}</span>
                                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{t.days_until_deadline > 0 ? `${t.days_until_deadline}d` : 'Overdue'}</span>
                                                        </div>
                                                        <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5"><div className={cn('h-full rounded-full', t.completion_rate >= 80 ? 'bg-emerald-500' : t.completion_rate >= 50 ? 'bg-blue-500' : 'bg-amber-500')} style={{ width: `${t.completion_rate}%` }} /></div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : viewMode === 'grid' ? (
                            /* ── GRID VIEW ── */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredList.map((t, i) => (
                                    <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.02, y: -4 }} onClick={() => navigateDetail(t)} className="relative rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-neutral-800/50 overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all">
                                        <div className={cn('h-1.5 bg-gradient-to-r', t.is_overdue ? 'from-red-500 to-rose-500' : t.prioritas === 'tinggi' ? 'from-orange-500 to-red-500' : t.completion_rate >= 80 ? 'from-emerald-500 to-green-500' : 'from-indigo-500 to-purple-500')} />
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-3 flex-wrap">{getJenisBadge(t.jenis)}{getPriorityBadge(t.prioritas)}{getStatusBadge(t.status)}{t.is_overdue && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"><AlertTriangle className="h-3 w-3" />Overdue</span>}</div>
                                            <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">{t.judul}</h3>
                                            <p className="text-sm text-slate-500 line-clamp-2 mt-1">{t.deskripsi}</p>
                                            <div className="mt-3">
                                                <div className="flex justify-between text-xs mb-1"><span className="text-slate-600 dark:text-slate-400">Progress</span><span className="font-bold">{t.completion_rate}%</span></div>
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"><motion.div className={cn('h-full rounded-full', t.completion_rate >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : t.completion_rate >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-amber-500 to-orange-500')} initial={{ width: 0 }} animate={{ width: `${t.completion_rate}%` }} transition={{ duration: 0.5, delay: i * 0.05 }} /></div>
                                            </div>
                                            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
                                                <div className="flex items-center gap-1"><Send className="h-3 w-3" />{t.submission_count}</div>
                                                <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.pending_review}</div>
                                                <div className="flex items-center gap-1"><Award className="h-3 w-3" />{t.average_score}</div>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                                <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{t.course.nama}</span>
                                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{t.days_until_deadline > 0 ? `${t.days_until_deadline}d` : 'Overdue'}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            /* ── LIST VIEW ── */
                            <div className="space-y-3">
                                {filteredList.map((t, i) => (
                                    <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} whileHover={{ scale: 1.01, y: -2 }} onMouseEnter={() => setHoveredCard(String(t.id))} onMouseLeave={() => setHoveredCard(null)} className={cn('rounded-2xl border-2 p-4 cursor-pointer relative overflow-hidden transition-colors', t.is_overdue ? 'border-red-200 bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:border-red-800/50 dark:from-red-950/20 dark:to-rose-950/20' : 'border-slate-200/50 bg-white/60 dark:border-slate-700/50 dark:bg-neutral-800/30')}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3 flex-1" onClick={() => navigateDetail(t)}>
                                                <input type="checkbox" checked={selectedTugas.includes(t.id)} onChange={(e) => { e.stopPropagation(); toggleSelect(t.id); }} onClick={(e) => e.stopPropagation()} className="mt-1.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">{getJenisBadge(t.jenis)}{getPriorityBadge(t.prioritas)}{getStatusBadge(t.status)}{t.is_overdue && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"><AlertTriangle className="h-3 w-3" />Overdue</span>}</div>
                                                    <h3 className={cn('font-bold text-base transition-colors', hoveredCard === String(t.id) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white')}>{t.judul}</h3>
                                                    <p className="text-sm text-slate-500 line-clamp-1 mt-1">{t.deskripsi}</p>
                                                    {t.total_students > 0 && (
                                                        <div className="mt-3 max-w-md">
                                                            <div className="flex justify-between text-xs mb-1"><span className="text-slate-600 dark:text-slate-400">Progress ({t.submission_count}/{t.total_students})</span><span className="font-bold">{t.completion_rate}%</span></div>
                                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"><motion.div className={cn('h-full rounded-full', t.completion_rate >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : t.completion_rate >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-amber-500 to-orange-500')} initial={{ width: 0 }} animate={{ width: `${t.completion_rate}%` }} transition={{ duration: 0.5, delay: i * 0.03 }} /></div>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs dark:bg-blue-900/30 dark:text-blue-300"><BookOpen className="h-3.5 w-3.5" />{t.course.nama}</span>
                                                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs', t.is_overdue ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300')}><Calendar className="h-3.5 w-3.5" />{t.deadline_display}</span>
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs dark:bg-emerald-900/30 dark:text-emerald-300"><MessageSquare className="h-3.5 w-3.5" />{t.diskusi_count} diskusi</span>
                                                        {t.late_submissions > 0 && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-xs dark:bg-red-900/30 dark:text-red-300"><Clock className="h-3.5 w-3.5" />{t.late_submissions} terlambat</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className={cn('transition-opacity', hoveredCard === String(t.id) ? 'opacity-100' : 'opacity-40')}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56">
                                                    <DropdownMenuItem onClick={() => navigateDetail(t)}><Eye className="mr-2 h-4 w-4 text-blue-500" /> Lihat Detail</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openQuickPreview(t)}><Sparkles className="mr-2 h-4 w-4 text-indigo-500" /> Quick Preview</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.visit(`/dosen/tugas/${t.id}/grading`)}><Award className="mr-2 h-4 w-4 text-purple-500" /> Penilaian</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => openEdit(t)}><Pencil className="mr-2 h-4 w-4 text-amber-500" /> Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDuplicate(t)}><Copy className="mr-2 h-4 w-4 text-indigo-500" /> Duplicate</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleExport(t)}><Download className="mr-2 h-4 w-4 text-green-500" /> Export</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleArchive(t.id)}><Archive className="mr-2 h-4 w-4 text-slate-500" /> Archive</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, id: t.id })} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Hapus</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>

            </motion.div>

            <TugasCreateModalEnhanced isOpen={showCreate} onClose={() => setShowCreate(false)} form={form} setForm={setForm} courses={courses} onSubmit={handleCreate} />

            {/* ═══ EDIT MODAL ═══ */}
            <AnimatePresence>
                {showEdit && editTugas && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial="hidden" animate="visible" exit="exit">
                        <motion.div variants={backdropVariants} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEdit(false)} />
                        <motion.div variants={modalVariants} className="relative w-full max-w-lg mx-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3"><div className="p-2 bg-white/20 rounded-lg backdrop-blur"><Pencil className="h-5 w-5 text-white" /></div><h2 className="text-xl font-bold text-white">Edit Tugas</h2></div>
                                    <Button variant="ghost" size="icon" onClick={() => setShowEdit(false)} className="text-white hover:bg-white/20"><X className="h-5 w-5" /></Button>
                                </div>
                            </div>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div><Label>Judul</Label><Input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className="mt-1" /></div>
                                <div><Label>Deskripsi</Label><Textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3} className="mt-1" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>Jenis</Label><Select value={form.jenis} onValueChange={(v) => setForm({ ...form, jenis: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="tugas">Tugas</SelectItem><SelectItem value="quiz">Quiz</SelectItem><SelectItem value="project">Project</SelectItem><SelectItem value="presentasi">Presentasi</SelectItem><SelectItem value="lainnya">Lainnya</SelectItem></SelectContent></Select></div>
                                    <div><Label>Prioritas</Label><Select value={form.prioritas} onValueChange={(v) => setForm({ ...form, prioritas: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="rendah">Rendah</SelectItem><SelectItem value="sedang">Sedang</SelectItem><SelectItem value="tinggi">Tinggi</SelectItem></SelectContent></Select></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>Deadline</Label><Input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="mt-1" /></div>
                                    <div><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select></div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-neutral-800/50 flex gap-3">
                                <Button variant="outline" onClick={() => setShowEdit(false)} className="flex-1">Batal</Button>
                                <Button onClick={handleEdit} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"><CheckCircle className="mr-2 h-4 w-4" /> Simpan</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ DETAIL MODAL ═══ */}
            <AnimatePresence>
                {showDetail && detailTugas && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial="hidden" animate="visible" exit="exit">
                        <motion.div variants={backdropVariants} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetail(false)} />
                        <motion.div variants={modalVariants} className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                            {/* Modal Header */}
                            <div className="relative overflow-hidden p-6 text-white flex-shrink-0">
                                <motion.div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} style={{ backgroundSize: '200% 200%' }} />
                                <div className="relative z-10">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30"><ClipboardList className="h-7 w-7" /></motion.div>
                                            <div><h2 className="text-xl font-bold">{detailTugas.judul}</h2><p className="text-white/70 text-sm mt-1">{detailTugas.course.nama}</p></div>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => setShowDetail(false)} className="text-white hover:bg-white/20"><X className="h-5 w-5" /></Button>
                                    </div>
                                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur">{detailTugas.submission_count}/{detailTugas.total_students} submissions</span>
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur">{detailTugas.completion_rate}% selesai</span>
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur">Avg: {detailTugas.average_score}</span>
                                        {detailTugas.is_overdue && <span className="bg-red-500/40 px-3 py-1 rounded-full text-xs backdrop-blur">Overdue</span>}
                                    </div>
                                </div>
                            </div>
                            {/* Tabs */}
                            <div className="px-6 pt-4 flex-shrink-0">
                                <div className="flex p-1 gap-1 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-2xl w-fit border border-white/10">
                                    {[{ key: 'overview', label: 'Overview', icon: Eye }, { key: 'submissions', label: 'Submissions', icon: Send }, { key: 'grading', label: 'Grading', icon: Award }, { key: 'analytics', label: 'Analytics', icon: BarChart3 }, { key: 'discussions', label: 'Diskusi', icon: MessageSquare }].map(tab => (
                                        <button key={tab.key} onClick={() => setDetailTab(tab.key)} className={cn('relative px-3 py-1.5 rounded-xl text-xs font-medium transition-colors', detailTab === tab.key ? 'text-slate-900 dark:text-white' : 'text-slate-500')}>
                                            {detailTab === tab.key && <motion.div layoutId="activeDetailTab" className="absolute inset-0 bg-white dark:bg-neutral-700 rounded-xl shadow-sm" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />}
                                            <span className="relative z-10 flex items-center gap-1.5"><tab.icon className="h-3.5 w-3.5" />{tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Tab Content */}
                            <div className="p-6 overflow-y-auto flex-1">
                                <AnimatePresence mode="wait">
                                    {detailTab === 'overview' && (
                                        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {[{ l: 'Submissions', v: detailTugas.submission_count, c: 'from-blue-500 to-indigo-500' }, { l: 'Pending', v: detailTugas.pending_review, c: 'from-amber-500 to-orange-500' }, { l: 'Dinilai', v: detailTugas.graded_count, c: 'from-emerald-500 to-green-500' }, { l: 'Terlambat', v: detailTugas.late_submissions, c: 'from-red-500 to-rose-500' }].map(s => (
                                                    <div key={s.l} className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-3 bg-white/60 dark:bg-neutral-800/40">
                                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.v}</p><p className="text-xs text-slate-500">{s.l}</p>
                                                        <div className={cn('h-1 w-12 rounded-full bg-gradient-to-r mt-2', s.c)} />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-4 bg-white/60 dark:bg-neutral-800/40 space-y-3">
                                                <h4 className="font-semibold text-slate-900 dark:text-white">Detail Tugas</h4>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">{detailTugas.deskripsi}</p>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div><span className="text-slate-500">Jenis:</span> {getJenisBadge(detailTugas.jenis)}</div>
                                                    <div><span className="text-slate-500">Prioritas:</span> {getPriorityBadge(detailTugas.prioritas)}</div>
                                                    <div><span className="text-slate-500">Status:</span> {getStatusBadge(detailTugas.status)}</div>
                                                    <div><span className="text-slate-500">Deadline:</span> <span className="text-slate-700 dark:text-slate-300">{detailTugas.deadline_display}</span></div>
                                                    <div><span className="text-slate-500">Dibuat:</span> <span className="text-slate-700 dark:text-slate-300">{detailTugas.created_at}</span></div>
                                                    <div><span className="text-slate-500">Oleh:</span> <span className="text-slate-700 dark:text-slate-300">{detailTugas.created_by}</span></div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 flex-wrap">
                                                <Button size="sm" onClick={() => openEdit(detailTugas)} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white"><Pencil className="mr-2 h-4 w-4" /> Edit</Button>
                                                <Button size="sm" variant="outline" onClick={() => router.visit(`/dosen/tugas/${detailTugas.id}/grading`)}><Award className="mr-2 h-4 w-4" /> Penilaian</Button>
                                                <Button size="sm" variant="outline" onClick={() => handleDuplicate(detailTugas)}><Copy className="mr-2 h-4 w-4" /> Duplicate</Button>
                                                <Button size="sm" variant="outline" onClick={() => handleExport(detailTugas)}><Download className="mr-2 h-4 w-4" /> Export</Button>
                                            </div>
                                        </motion.div>
                                    )}
                                    {detailTab === 'submissions' && (
                                        <motion.div key="submissions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                            <div className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-4 bg-white/60 dark:bg-neutral-800/40">
                                                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Submission Progress</h4>
                                                <div className="flex justify-between text-sm mb-2"><span className="text-slate-600 dark:text-slate-400">{detailTugas.submission_count} dari {detailTugas.total_students} mahasiswa</span><span className="font-bold">{detailTugas.completion_rate}%</span></div>
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3"><div className={cn('h-full rounded-full transition-all', detailTugas.completion_rate >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-500' : detailTugas.completion_rate >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-amber-500 to-orange-500')} style={{ width: `${detailTugas.completion_rate}%` }} /></div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="rounded-xl border p-3 text-center bg-emerald-50 dark:bg-emerald-900/20"><p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{detailTugas.submission_count - detailTugas.late_submissions}</p><p className="text-xs text-emerald-600">Tepat Waktu</p></div>
                                                <div className="rounded-xl border p-3 text-center bg-red-50 dark:bg-red-900/20"><p className="text-xl font-bold text-red-700 dark:text-red-300">{detailTugas.late_submissions}</p><p className="text-xs text-red-600">Terlambat</p></div>
                                                <div className="rounded-xl border p-3 text-center bg-slate-50 dark:bg-slate-800/40"><p className="text-xl font-bold text-slate-700 dark:text-slate-300">{detailTugas.total_students - detailTugas.submission_count}</p><p className="text-xs text-slate-500">Belum Submit</p></div>
                                            </div>
                                            <Button onClick={() => router.visit(`/dosen/tugas/${detailTugas.id}`)} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white"><Eye className="mr-2 h-4 w-4" /> Lihat Detail Submissions</Button>
                                        </motion.div>
                                    )}
                                    {detailTab === 'grading' && (
                                        <motion.div key="grading" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <div className="rounded-xl border p-3 text-center"><p className="text-xl font-bold text-slate-900 dark:text-white">{detailTugas.average_score}</p><p className="text-xs text-slate-500">Rata-rata</p></div>
                                                <div className="rounded-xl border p-3 text-center"><p className="text-xl font-bold text-slate-900 dark:text-white">{detailTugas.max_grade}</p><p className="text-xs text-slate-500">Nilai Maks</p></div>
                                                <div className="rounded-xl border p-3 text-center"><p className="text-xl font-bold text-slate-900 dark:text-white">{detailTugas.graded_count}</p><p className="text-xs text-slate-500">Sudah Dinilai</p></div>
                                                <div className="rounded-xl border p-3 text-center"><p className="text-xl font-bold text-amber-600">{detailTugas.pending_review}</p><p className="text-xs text-slate-500">Belum Dinilai</p></div>
                                            </div>
                                            <div className="rounded-xl border p-4">
                                                <h4 className="font-semibold mb-2">Grading Progress</h4>
                                                <div className="flex justify-between text-sm mb-1"><span className="text-slate-500">{detailTugas.graded_count} dari {detailTugas.submission_count} dinilai</span><span className="font-bold">{detailTugas.submission_count > 0 ? Math.round((detailTugas.graded_count / detailTugas.submission_count) * 100) : 0}%</span></div>
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5"><div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${detailTugas.submission_count > 0 ? (detailTugas.graded_count / detailTugas.submission_count) * 100 : 0}%` }} /></div>
                                            </div>
                                            <Button onClick={() => router.visit(`/dosen/tugas/${detailTugas.id}/grading`)} className="w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white"><Award className="mr-2 h-4 w-4" /> Buka Halaman Penilaian</Button>
                                        </motion.div>
                                    )}
                                    {detailTab === 'analytics' && (
                                        <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="rounded-xl border p-4"><h4 className="text-sm font-semibold mb-2">Completion Rate</h4><div className="text-3xl font-bold text-indigo-600">{detailTugas.completion_rate}%</div><p className="text-xs text-slate-500 mt-1">{detailTugas.submission_count} dari {detailTugas.total_students} mahasiswa</p></div>
                                                <div className="rounded-xl border p-4"><h4 className="text-sm font-semibold mb-2">Average Score</h4><div className="text-3xl font-bold text-emerald-600">{detailTugas.average_score}</div><p className="text-xs text-slate-500 mt-1">dari {detailTugas.max_grade} poin</p></div>
                                                <div className="rounded-xl border p-4"><h4 className="text-sm font-semibold mb-2">Late Rate</h4><div className="text-3xl font-bold text-red-600">{detailTugas.submission_count > 0 ? Math.round((detailTugas.late_submissions / detailTugas.submission_count) * 100) : 0}%</div><p className="text-xs text-slate-500 mt-1">{detailTugas.late_submissions} terlambat</p></div>
                                                <div className="rounded-xl border p-4"><h4 className="text-sm font-semibold mb-2">Engagement</h4><div className="text-3xl font-bold text-blue-600">{detailTugas.diskusi_count}</div><p className="text-xs text-slate-500 mt-1">diskusi</p></div>
                                            </div>
                                            {detailTugas.days_until_deadline > 0 && !detailTugas.is_overdue && (
                                                <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 p-4 flex items-center gap-3">
                                                    <Timer className="h-6 w-6 text-amber-600" />
                                                    <div><p className="font-semibold text-amber-800 dark:text-amber-200">Deadline dalam {detailTugas.days_until_deadline} hari</p><p className="text-xs text-amber-600">{detailTugas.deadline_display}</p></div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                    {detailTab === 'discussions' && (
                                        <motion.div key="discussions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                                            <div className="rounded-xl border p-4 flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white"><MessageSquare className="h-6 w-6" /></div>
                                                <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{detailTugas.diskusi_count}</p><p className="text-sm text-slate-500">Total diskusi</p></div>
                                            </div>
                                            <Button onClick={() => router.visit(`/dosen/tugas/${detailTugas.id}`)} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white"><MessageSquare className="mr-2 h-4 w-4" /> Buka Halaman Diskusi</Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ BULK OPERATIONS BAR ═══ */}
            <AnimatePresence>
                {selectedTugas.length > 0 && (
                    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', bounce: 0.2 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 shadow-2xl border border-white/20 backdrop-blur-xl">
                        <div className="flex items-center gap-4 text-white">
                            <span className="text-sm font-medium">{selectedTugas.length} tugas dipilih</span>
                            <div className="w-px h-6 bg-white/30" />
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => selectedTugas.forEach(id => { const t = tugasList.find(x => x.id === id); if (t && t.status === 'draft') router.patch(`/dosen/tugas/${id}`, { status: 'published', judul: t.judul, deskripsi: t.deskripsi, jenis: t.jenis, deadline: t.deadline, prioritas: t.prioritas }); })}><CheckCircle className="mr-2 h-4 w-4" /> Publish</Button>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => selectedTugas.forEach(id => handleArchive(id))}><Archive className="mr-2 h-4 w-4" /> Archive</Button>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => selectedTugas.forEach(id => { const t = tugasList.find(x => x.id === id); if (t) handleDuplicate(t); })}><Copy className="mr-2 h-4 w-4" /> Duplicate</Button>
                            <Button size="sm" variant="ghost" className="text-red-200 hover:bg-red-500/20" onClick={() => { selectedTugas.forEach(id => router.delete(`/dosen/tugas/${id}`)); setSelectedTugas([]); }}><Trash2 className="mr-2 h-4 w-4" /> Hapus</Button>
                            <div className="w-px h-6 bg-white/30" />
                            <Button size="sm" variant="ghost" className="text-white/70 hover:bg-white/20" onClick={() => setSelectedTugas([])}><X className="h-4 w-4" /></Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, id: open ? deleteDialog.id : null })} onConfirm={handleDelete} title="Hapus Tugas" message="Yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan." variant="danger" confirmText="Ya, Hapus" cancelText="Batal" />
        </DosenLayout>
    );
}
