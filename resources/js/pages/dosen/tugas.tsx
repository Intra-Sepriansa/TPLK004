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
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 p-6 text-white shadow-xl transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 animate-pulse" />
                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-white/5 animate-bounce" style={{ animationDuration: '3s' }} />
                    
                    {/* Floating Icons */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[FileText, ClipboardList, ListTodo].map((Icon, i) => (
                            <Icon 
                                key={i}
                                className="absolute text-white/20 animate-pulse"
                                style={{
                                    left: `${15 + i * 25}%`,
                                    top: `${20 + (i % 2) * 40}%`,
                                    animationDelay: `${i * 0.5}s`,
                                    animationDuration: '2s'
                                }}
                                size={24}
                            />
                        ))}
                    </div>
                    
                    <div className="relative">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur shadow-lg animate-bounce" style={{ animationDuration: '2s' }}>
                                    <ClipboardList className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-sm text-indigo-100 font-medium">Manajemen</p>
                                    <h1 className="text-2xl font-bold flex items-center gap-2">
                                        Informasi Tugas
                                        <Sparkles className="h-6 w-6 animate-spin" style={{ animationDuration: '3s' }} />
                                    </h1>
                                </div>
                            </div>
                            <Button 
                                onClick={() => setShowCreate(true)}
                                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur border-0 shadow-lg transition-all duration-300 hover:scale-105"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Tambah Tugas
                            </Button>
                        </div>
                        <p className="mt-4 text-indigo-100">Kelola dan pantau tugas untuk mahasiswa</p>
                        
                        {/* Quick Stats in Header */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: FileText, label: 'Total Tugas', value: stats.total, color: 'text-white' },
                                { icon: CheckCircle, label: 'Published', value: stats.published, color: 'text-emerald-200' },
                                { icon: Clock, label: 'Draft', value: stats.draft, color: 'text-amber-200' },
                                { icon: AlertTriangle, label: 'Overdue', value: stats.overdue, color: 'text-red-200' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
                                    <div className="flex items-center gap-2 mb-1">
                                        <stat.icon className={cn("h-4 w-4", stat.color)} />
                                        <p className="text-indigo-100 text-xs font-medium">{stat.label}</p>
                                    </div>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
                    {[
                        { icon: FileText, label: 'Total Tugas', value: stats.total, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-black/25' },
                        { icon: CheckCircle, label: 'Published', value: stats.published, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
                        { icon: Clock, label: 'Draft', value: stats.draft, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25' },
                        { icon: AlertTriangle, label: 'Overdue', value: stats.overdue, color: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/25' },
                    ].map((stat, i) => (
                        <div 
                            key={i} 
                            className={`rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 transition-all duration-500 hover:scale-105 hover:shadow-xl group`}
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    'flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110',
                                    stat.color, stat.shadow
                                )}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                    <p className="text-sm text-slate-500">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className={`rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
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
                </div>

                {/* Tugas List */}
                <div className={`rounded-2xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-gray-800/70 dark:bg-black/70 overflow-hidden transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: '300ms' }}>
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
                                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black rounded-full opacity-20 animate-ping" />
                                    <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-r from-gray-900 to-black rounded-full">
                                        <FileText className="h-12 w-12 text-white" />
                                    </div>
                                </div>
                                <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Belum ada tugas</p>
                                <p className="text-sm text-slate-500 mt-2">Klik tombol "Tambah Tugas" untuk membuat tugas baru</p>
                                <Button 
                                    onClick={() => setShowCreate(true)}
                                    className="mt-4 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900"
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Tambah Tugas Pertama
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {tugasList.map((tugas, index) => {
                                    const isHovered = hoveredCard === tugas.id;
                                    return (
                                        <div 
                                            key={tugas.id} 
                                            onMouseEnter={() => setHoveredCard(tugas.id)}
                                            onMouseLeave={() => setHoveredCard(null)}
                                            className={cn(
                                                'rounded-2xl border-2 p-5 transition-all duration-500 cursor-pointer relative overflow-hidden group',
                                                tugas.is_overdue 
                                                    ? 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50 dark:border-red-800 dark:from-red-950/30 dark:to-rose-950/30' 
                                                    : 'border-slate-200/70 bg-white dark:border-slate-700 dark:bg-gray-900/50',
                                                isHovered && 'scale-[1.01] shadow-xl border-indigo-300 dark:border-indigo-700'
                                            )}
                                            style={{ 
                                                animationDelay: `${index * 50}ms`,
                                                animation: isLoaded ? 'fadeInUp 0.5s ease-out forwards' : 'none'
                                            }}
                                        >
                                            {/* Glow Effect */}
                                            {isHovered && (
                                                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/20 pointer-events-none" />
                                            )}
                                            
                                            <div className="flex items-start justify-between relative">
                                                <div className="flex-1" onClick={() => router.visit(`/dosen/tugas/${tugas.id}`)}>
                                                    {/* Badges */}
                                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                        {getJenisBadge(tugas.jenis)}
                                                        {getPriorityBadge(tugas.prioritas)}
                                                        {getStatusBadge(tugas.status)}
                                                        {tugas.is_overdue && (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-600 to-rose-600 text-white animate-pulse">
                                                                <AlertTriangle className="h-3 w-3" /> Overdue
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Title & Description */}
                                                    <h3 className={cn(
                                                        'font-bold text-lg transition-colors duration-300',
                                                        isHovered ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'
                                                    )}>
                                                        {tugas.judul}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 line-clamp-2 mt-2">{tugas.deskripsi}</p>
                                                    
                                                    {/* Meta Info */}
                                                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm dark:bg-blue-900/30 dark:text-blue-300">
                                                            <BookOpen className="h-4 w-4" /> {tugas.course.nama}
                                                        </span>
                                                        <span className={cn(
                                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm",
                                                            tugas.is_overdue 
                                                                ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                                                : "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                                        )}>
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
                                                
                                                {/* Actions */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className={cn(
                                                                "transition-all duration-300",
                                                                isHovered ? "opacity-100" : "opacity-0"
                                                            )}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
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
                                            
                                            {/* Hover Arrow */}
                                            <div className={cn(
                                                "absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300",
                                                isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                                            )}>
                                                <ChevronRight className="h-6 w-6 text-indigo-500" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Modal */}
                {showCreate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
                        <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
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
                                    <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">Batal</Button>
                                    <Button onClick={handleCreate} className="flex-1 bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900">
                                        <Plus className="mr-2 h-4 w-4" /> Simpan
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {showEdit && editTugas && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEdit(false)} />
                        <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
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
                        </div>
                    </div>
                )}
            </div>

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
            
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </DosenLayout>
    );
}
